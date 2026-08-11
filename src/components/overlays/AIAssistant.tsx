import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Sparkles, Send } from 'lucide-react';
import { ThinkingDots } from '@/components/shared/Atoms';
import { AI_SUGGESTIONS } from '@/data/mockData';

export function AIAssistant() {
  const { isAssistantOpen, toggleAssistant, logAudit } = useApp();
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Array<{ q: string; a: string; loading?: boolean; shown?: string }>>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleAssistant();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleAssistant]);

  const ask = (q: string) => {
    const found = AI_SUGGESTIONS.find(s => s.q === q);
    const a = found?.a ||
      'I can answer questions about active regulatory changes, HAQ response drafts, dossier validation results, regulatory feed items, market impact simulations, and filing deadlines across the client portfolio. Try one of the suggested prompts above.';
    const entry = { q, a, loading: true, shown: '' };
    setConversation(prev => [...prev, entry]);
    logAudit({ actor: 'Regulatory Operations', actorType: 'user', action: `Asked AI Assistant: "${q}"` });

    setTimeout(() => {
      setConversation(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        last.loading = false;
        return next;
      });
      // typewriter
      let i = 0;
      const interval = setInterval(() => {
        i += 4;
        setConversation(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          last.shown = a.slice(0, i);
          if (i >= a.length) {
            clearInterval(interval);
            last.shown = a;
          }
          return next;
        });
      }, 25);
    }, 1400);
  };

  if (!isAssistantOpen) return null;

  return (
    <aside
      className="fixed right-0 top-14 bottom-0 w-[420px] z-[100] bg-card border-l border-border flex flex-col shadow-2xl"
    >
      <header className="p-4 border-b border-border flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--pillar-02)' }} />
            <h2 className="font-display text-[16px] font-semibold text-foreground">Ask AI</h2>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">Ask anything about your regulatory intelligence platform.</p>
        </div>
        <button onClick={toggleAssistant} className="p-1 rounded hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
      </header>

      <div className="p-3 border-b border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {AI_SUGGESTIONS.map(s => (
            <button
              key={s.q}
              onClick={() => ask(s.q)}
              className="shrink-0 text-[11px] rounded-full border border-border bg-muted px-3 py-1.5 hover:bg-accent hover:border-primary/50 text-foreground transition"
            >
              {s.q}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {conversation.length === 0 && (
          <p className="text-[12px] text-muted-foreground italic">Pick a suggestion or type a question below.</p>
        )}
        {conversation.map((c, i) => (
          <div key={i} className="space-y-2">
            <div className="text-[12px] text-foreground bg-muted rounded-lg p-3 ml-6">{c.q}</div>
            <div className="text-[13px] text-foreground rounded-lg p-3 mr-6" style={{ background: 'color-mix(in oklab, var(--pillar-02) 6%, var(--card))', border: '1px solid color-mix(in oklab, var(--pillar-02) 20%, transparent)' }}>
              {c.loading ? <ThinkingDots /> : <span className="leading-relaxed">{c.shown}</span>}
            </div>
          </div>
        ))}
      </div>

      <form
        className="p-3 border-t border-border flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          ask(input.trim());
          setInput('');
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question..."
          className="flex-1 h-9 rounded-md bg-muted border border-border px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" className="h-9 px-3 rounded-md bg-primary text-primary-foreground grid place-items-center hover:brightness-110">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
}

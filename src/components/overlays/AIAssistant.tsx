import { AppIcon } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ThinkingDots } from "@/components/shared/Atoms";
import { AI_SUGGESTIONS } from "@/data/mockData";

export function AIAssistant() {
  const { isAssistantOpen, toggleAssistant, logAudit } = useApp();
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<
    Array<{ q: string; a: string; loading?: boolean; shown?: string }>
  >([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleAssistant();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleAssistant]);

  // Every timer this component starts is tracked here and cleared on unmount.
  // Without it the reply timeout and its typewriter interval kept running
  // after the panel closed or the user signed out, writing into state that no
  // longer existed.
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
      pending.forEach((id) => window.clearInterval(id));
    };
  }, []);

  const ask = (q: string) => {
    const found = AI_SUGGESTIONS.find((s) => s.q === q);
    const answer =
      found?.a ||
      "I can answer questions about active regulatory changes, HAQ response drafts, dossier validation results, regulatory feed items, market impact simulations, and filing deadlines across the client portfolio. Try one of the suggested prompts above.";

    // The entry is addressed by index, not as "the last one". Asking a second
    // question mid-reply used to leave the first answer's typewriter writing
    // into the new entry, so two replies raced over the same bubble.
    let index = -1;
    setConversation((prev) => {
      index = prev.length;
      return [...prev, { q, a: answer, loading: true, shown: "" }];
    });

    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      action: `Asked AI Assistant: "${q}"`,
    });

    timers.current.push(
      window.setTimeout(() => {
        // Replace the entry rather than mutating it in place — the previous
        // version reassigned fields on the object still held by state.
        setConversation((prev) =>
          prev.map((entry, i) => (i === index ? { ...entry, loading: false } : entry)),
        );

        let revealed = 0;
        const interval = window.setInterval(() => {
          revealed += 4;
          const done = revealed >= answer.length;
          setConversation((prev) =>
            prev.map((entry, i) =>
              i === index ? { ...entry, shown: done ? answer : answer.slice(0, revealed) } : entry,
            ),
          );
          if (done) window.clearInterval(interval);
        }, 25);
        timers.current.push(interval);
      }, 1400),
    );
  };

  if (!isAssistantOpen) return null;

  return (
    <aside className="fixed right-0 top-14 bottom-0 w-[420px] z-[100] bg-raised border-l border-stroke-default flex flex-col shadow-2xl">
      <header className="p-4 border-b border-stroke-default flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AppIcon name="agent" className="text-pillar-02" />
            <h2 className="type-display-section text-fg-primary">Ask AI</h2>
          </div>
          <p className="text-xs text-fg-tertiary mt-1">
            Ask anything about your regulatory intelligence platform.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAssistant}
          aria-label="Close AI assistant"
          className="p-1 rounded hover:bg-action-tertiary-hover text-icon-tertiary hover:text-icon-primary transition-colors duration-200"
        >
          <AppIcon name="close" />
        </button>
      </header>

      <div className="p-3 border-b border-stroke-default">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {AI_SUGGESTIONS.map((s) => (
            <button
              key={s.q}
              type="button"
              onClick={() => ask(s.q)}
              className="shrink-0 text-2xs rounded-full border border-stroke-default bg-action px-3 py-1.5 hover:bg-action-tertiary-hover hover:border-brand/50 text-fg-primary transition"
            >
              {s.q}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {conversation.length === 0 && (
          <p className="text-xs text-fg-tertiary italic">
            Pick a suggestion or type a question below.
          </p>
        )}
        {conversation.map((c, i) => (
          <div key={i} className="space-y-2">
            <div className="text-xs text-fg-primary bg-action rounded-lg p-3 ml-6">{c.q}</div>
            <div
              className="text-sm text-fg-primary rounded-lg p-3 mr-6"
              style={{
                background: "color-mix(in oklab, var(--pillar-02) 6%, var(--surface-raised))",
                border: "1px solid color-mix(in oklab, var(--pillar-02) 20%, transparent)",
              }}
            >
              {c.loading ? <ThinkingDots /> : <span className="leading-relaxed">{c.shown}</span>}
            </div>
          </div>
        ))}
      </div>

      <form
        className="p-3 border-t border-stroke-default flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          ask(input.trim());
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question..."
          className="flex-1 h-9 rounded-md bg-action border border-stroke-default px-3 text-sm text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="h-9 px-3 rounded-md bg-action-primary text-on-action-primary grid place-items-center hover:bg-action-primary-hover transition-colors duration-200"
        >
          <AppIcon name="send" />
        </button>
      </form>
    </aside>
  );
}

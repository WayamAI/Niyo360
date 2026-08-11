import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge, badgeForStatus } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { ESCALATIONS, MESSAGES } from '@/data/mockData';

type Tab = 'audit' | 'escalations' | 'messages';

export function RightRail() {
  const { isRailOpen, toggleRail, auditLog, resolvedEscalations, showToast } = useApp();
  const [tab, setTab] = useState<Tab>('audit');

  return (
    <>
      <button
        onClick={toggleRail}
        className="fixed top-1/2 -translate-y-1/2 w-5 h-12 z-50 grid place-items-center border border-border bg-muted text-muted-foreground hover:text-foreground rounded-l-md transition-all"
        style={{ right: isRailOpen ? 320 : 0, borderRight: isRailOpen ? '1px solid var(--border)' : 'none' }}
      >
        {isRailOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <aside
        className="fixed right-0 top-14 bottom-0 w-[320px] bg-card border-l border-border z-40 flex flex-col transition-transform duration-250"
        style={{ transform: isRailOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="h-11 border-b border-border flex">
          {(['audit', 'escalations', 'messages'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                tab === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={tab === t ? { borderBottom: '2px solid var(--primary)' } : undefined}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {tab === 'audit' && (
            <div>
              {auditLog.slice(0, 50).map((e, idx) => {
                const dotColor =
                  e.actorType === 'user' ? 'var(--status-green)' :
                  e.actorType === 'agent' ? 'var(--pillar-02)' : 'var(--status-blue)';
                return (
                  <div key={e.id} className={`px-4 py-2.5 border-b border-border ${idx === 0 ? 'event-enter' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                      <span className="text-[12px] font-medium text-foreground flex-1 truncate">{e.actor}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{e.timestamp.split(' ')[1] || e.timestamp}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2 pl-4">{e.action}</p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'escalations' && (
            <div className="p-3 space-y-2">
              {ESCALATIONS.map(e => {
                const sevColor = e.severity === 'Critical' ? 'var(--status-red)' : e.severity === 'High' ? 'var(--status-amber)' : 'var(--status-blue)';
                const resolved = resolvedEscalations.has(e.id);
                return (
                  <div key={e.id} className="rounded-md bg-muted p-3" style={{ borderLeft: `3px solid ${sevColor}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] text-muted-foreground">{e.id}</span>
                      <Badge variant={resolved ? 'complete' : badgeForStatus(e.status)}>{resolved ? 'Resolved' : e.status}</Badge>
                    </div>
                    <div className="text-[12px] font-medium text-foreground mb-1">{e.productName}</div>
                    <div className="text-[11px] text-muted-foreground mb-1">{e.market}</div>
                    <p className="text-[12px] text-muted-foreground line-clamp-2 mb-2">{e.issue}</p>
                    <Button variant="ghost" size="sm" onClick={() => showToast(`Opening ${e.id}`)}>View</Button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'messages' && (
            <div>
              {MESSAGES.map(m => (
                <div key={m.id} className="px-4 py-3 border-b border-border flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full grid place-items-center shrink-0 text-[11px] font-medium"
                    style={{
                      background: 'color-mix(in oklab, var(--primary) 12%, transparent)',
                      color: 'var(--primary)',
                    }}
                  >{m.senderInitials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-foreground truncate">{m.senderName}</span>
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">{m.timestamp}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">{m.preview}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

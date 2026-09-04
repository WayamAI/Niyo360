import { AppIcon } from "@/components/icons";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
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
        className="fixed top-1/2 -translate-y-1/2 w-5 h-12 z-50 grid place-items-center border border-stroke-muted bg-action text-icon-tertiary hover:bg-raised hover:text-icon-secondary rounded-l-md transition-all duration-200"
        style={{ right: isRailOpen ? 320 : 0, borderRight: isRailOpen ? '1px solid var(--stroke-muted)' : 'none' }}
        aria-label={isRailOpen ? 'Collapse side panel' : 'Expand side panel'}
        aria-expanded={isRailOpen}
      >
        {isRailOpen ? <AppIcon name="chevronRight" size="sm" /> : <AppIcon name="chevronLeft" size="sm" />}
      </button>

      <aside
        className="fixed right-0 top-14 bottom-0 w-[320px] bg-container border-l border-stroke-muted z-40 flex flex-col transition-transform duration-250"
        style={{ transform: isRailOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="h-11 border-b border-stroke-muted flex">
          {(['audit', 'escalations', 'messages'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-current={tab === t ? 'true' : undefined}
              className={`flex-1 type-label-md transition-colors duration-200 border-b-2 ${
                tab === t
                  ? 'text-fg-primary border-brand'
                  : 'text-fg-tertiary border-transparent hover:text-fg-secondary'
              }`}
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
                  e.actorType === 'user' ? 'var(--feedback-success-icon)' :
                  e.actorType === 'agent' ? 'var(--pillar-02)' : 'var(--feedback-info-icon)';
                return (
                  <div key={e.id} className={`px-4 py-2.5 border-b border-stroke-muted transition-colors duration-200 hover:bg-raised ${idx === 0 ? 'event-enter' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                      <span className="text-xs font-medium text-fg-primary flex-1 truncate">{e.actor}</span>
                      <span className="font-mono text-3xs text-fg-quaternary">{e.timestamp.split(' ')[1] || e.timestamp}</span>
                    </div>
                    <p className="text-xs text-fg-tertiary leading-snug line-clamp-2 pl-4">{e.action}</p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'escalations' && (
            <div className="p-3 space-y-2">
              {ESCALATIONS.map(e => {
                const sevColor = e.severity === 'Critical' ? 'var(--feedback-error-icon)' : e.severity === 'High' ? 'var(--feedback-warning-icon)' : 'var(--feedback-info-icon)';
                const resolved = resolvedEscalations.has(e.id);
                return (
                  <div key={e.id} className="rounded-md bg-raised border border-stroke-muted p-3" style={{ borderLeft: `3px solid ${sevColor}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-2xs text-fg-quaternary">{e.id}</span>
                      <Badge variant={resolved ? 'complete' : badgeForStatus(e.status)}>{resolved ? 'Resolved' : e.status}</Badge>
                    </div>
                    <div className="text-xs font-medium text-fg-primary mb-1">{e.productName}</div>
                    <div className="text-2xs text-fg-quaternary mb-1">{e.market}</div>
                    <p className="text-xs text-fg-tertiary line-clamp-2 mb-2">{e.issue}</p>
                    <Button variant="ghost" size="sm" onClick={() => showToast(`Opening ${e.id}`)}>View</Button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'messages' && (
            <div>
              {MESSAGES.map(m => (
                <div key={m.id} className="px-4 py-3 border-b border-stroke-muted flex gap-3 transition-colors duration-200 hover:bg-raised">
                  <div
                    className="w-7 h-7 rounded-full grid place-items-center shrink-0 text-2xs font-medium text-brand"
                    style={{ background: 'color-mix(in oklab, var(--brand) 14%, transparent)' }}
                  >{m.senderInitials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-fg-primary truncate">{m.senderName}</span>
                      <span className="font-mono text-3xs text-fg-quaternary shrink-0">{m.timestamp}</span>
                    </div>
                    <p className="text-xs text-fg-tertiary line-clamp-2 mt-0.5">{m.preview}</p>
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

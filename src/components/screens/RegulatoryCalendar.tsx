import { Card, Eyebrow } from '@/components/shared/Card';
import { Badge, badgeForVariation } from '@/components/shared/Badge';
import { CALENDAR_EVENTS, EXTERNAL_MILESTONES, CHANGES } from '@/data/mockData';

export function RegulatoryCalendar() {
  const sorted = [...CALENDAR_EVENTS].sort((a, b) => a.daysRemaining - b.daysRemaining);

  const monthLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMs = 30.44 * 24 * 3600 * 1000;
  const start = new Date('2025-05-01').getTime();
  const end = new Date('2025-12-31').getTime();
  const totalMs = end - start;
  const today = new Date('2025-05-22').getTime();

  return (
    <div className="page-enter space-y-5">
      <div>
        <h1 className="font-display text-[26px] font-semibold text-foreground">Regulatory Calendar</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Filing deadlines, HA review windows, external regulatory milestones, and feed-driven obligations.</p>
      </div>

      <section>
        <Eyebrow>Upcoming Deadlines</Eyebrow>
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
          {sorted.map(e => {
            const c = e.daysRemaining < 21 ? 'var(--status-red)' : e.daysRemaining < 60 ? 'var(--status-amber)' : 'var(--status-green)';
            return (
              <div key={e.id} className="shrink-0 w-[220px] rounded-lg border border-border bg-card p-4">
                <div className="font-mono text-[28px] leading-none" style={{ color: c }}>{e.daysRemaining}</div>
                <div className="text-[11px] text-muted-foreground">days remaining</div>
                <div className="text-[12px] text-foreground font-medium mt-2 line-clamp-2">{e.eventType}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{e.market}</div>
                {e.variationType && <Badge variant={badgeForVariation(e.variationType)} className="mt-2">{e.variationType}</Badge>}
              </div>
            );
          })}
        </div>
      </section>

      <Card>
        <Eyebrow>Active Change Timeline (May to Dec 2025)</Eyebrow>
        <div className="relative">
          <div className="flex border-b border-border pb-1 mb-3">
            {monthLabels.map((m, i) => (
              <div key={m} className="flex-1 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{m}</div>
            ))}
          </div>
          <div className="relative space-y-2.5">
            <div
              className="absolute top-0 bottom-0 w-0.5 z-10"
              style={{ background: 'var(--primary)', left: `${(today - start) / totalMs * 100}%` }}
            >
              <span className="absolute -top-4 -translate-x-1/2 text-[10px] font-mono" style={{ color: 'var(--primary)' }}>Today</span>
            </div>
            {CHANGES.map(c => {
              const init = new Date(c.initiatedDate).getTime();
              const due = new Date(c.filingDeadline).getTime();
              const left = Math.max(0, (init - start) / totalMs * 100);
              const width = Math.max(2, (due - Math.max(init, start)) / totalMs * 100);
              const overdue = c.status === 'Overdue';
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-[180px] truncate text-[12px] text-foreground">{c.id}</div>
                  <div className="flex-1 relative h-6 rounded bg-muted overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded flex items-center px-2 text-[10px] font-mono whitespace-nowrap"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: overdue ? 'var(--status-red)' : 'var(--pillar-04)',
                        color: 'white',
                      }}
                      title={`${c.initiatedDate} → ${c.filingDeadline}`}
                    >
                      {c.filingDeadline}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <Eyebrow>External Regulatory Milestones</Eyebrow>
        <div className="space-y-2">
          {EXTERNAL_MILESTONES.map(m => (
            <div key={m.id} className="flex items-center justify-between border-b border-border last:border-0 py-2.5">
              <div>
                <div className="text-[13px] font-medium text-foreground">{m.eventType}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{m.authority}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[12px]" style={{ color: 'var(--primary)' }}>{m.dueDate}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{m.daysRemaining} days</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

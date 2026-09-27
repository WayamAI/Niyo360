import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader, SectionHeader } from "@/components/shared/Page";
import { KpiRow, KpiTile, Panel } from "@/components/shared/Panel";
import { Badge, badgeForVariation } from "@/components/shared/Badge";
import { EmptyState } from "@/components/shared/States";
import { CALENDAR_EVENTS, CHANGES, EXTERNAL_MILESTONES } from "@/data/mockData";

/** The date the demo dataset is written against. */
const TODAY = new Date("2025-05-22");
const WINDOW_START = new Date("2025-05-01");
const WINDOW_END = new Date("2025-12-31");
const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function urgencyTone(days: number): string {
  if (days < 21) return "var(--feedback-error-icon)";
  if (days < 60) return "var(--feedback-warning-icon)";
  return "var(--feedback-success-icon)";
}

export function RegulatoryCalendar() {
  const { navigateTo, setSelectedChangeId } = useApp();

  const deadlines = useMemo(
    () => [...CALENDAR_EVENTS].sort((a, b) => a.daysRemaining - b.daysRemaining),
    [],
  );

  const span = WINDOW_END.getTime() - WINDOW_START.getTime();
  const todayOffset = ((TODAY.getTime() - WINDOW_START.getTime()) / span) * 100;

  const imminent = deadlines.filter((event) => event.daysRemaining < 21).length;
  const withinQuarter = deadlines.filter((event) => event.daysRemaining < 90).length;
  const overdueChanges = CHANGES.filter((change) => change.status === "Overdue").length;

  return (
    <>
      <PageHeader
        title="Regulatory Calendar"
        description="Filing deadlines, health-authority review windows, external milestones and feed-driven obligations."
        breadcrumb={[{ label: "Governance" }, { label: "Regulatory Calendar" }]}
      />

      <PageBody className="gap-4">
        <KpiRow>
          <KpiTile label="Tracked deadlines" value={deadlines.length} note="May to Dec 2025" />
          <KpiTile
            label="Inside 21 days"
            value={imminent}
            tone={imminent > 0 ? "error" : "neutral"}
          />
          <KpiTile label="This quarter" value={withinQuarter} tone="warning" />
          <KpiTile
            label="Overdue changes"
            value={overdueChanges}
            tone={overdueChanges > 0 ? "error" : "success"}
          />
        </KpiRow>

        <section>
          <SectionHeader
            title="Upcoming deadlines"
            description="Sorted by time remaining. Scroll for the rest of the window."
          />
          {deadlines.length === 0 ? (
            <Panel>
              <EmptyState title="No deadlines tracked" />
            </Panel>
          ) : (
            <ul className="scrollbar-thin -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2">
              {deadlines.map((event) => (
                <li
                  key={event.id}
                  className="w-[200px] shrink-0 rounded-lg border border-stroke-default bg-container p-3"
                >
                  <span
                    className="type-display-metric-sm tabular block"
                    style={{ color: urgencyTone(event.daysRemaining) }}
                  >
                    {event.daysRemaining}
                  </span>
                  <span className="type-caption block text-fg-quaternary">days remaining</span>
                  <span className="type-heading-sm mt-1.5 line-clamp-2 block text-fg-primary">
                    {event.eventType}
                  </span>
                  <span className="type-body-sm block text-fg-tertiary">{event.market}</span>
                  {event.variationType && (
                    <span className="mt-1.5 block">
                      <Badge variant={badgeForVariation(event.variationType)}>
                        {event.variationType}
                      </Badge>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <Panel
          title="Active change timeline"
          description="Each bar runs from the date the change was initiated to its filing deadline."
        >
          <div className="min-w-0 overflow-x-auto">
            <div className="min-w-[560px]">
              <div
                className="mb-2 grid border-b border-stroke-muted pb-1"
                style={{ gridTemplateColumns: `140px repeat(${MONTHS.length}, 1fr)` }}
                aria-hidden="true"
              >
                <span />
                {MONTHS.map((month) => (
                  <span key={month} className="type-label-sm font-mono text-fg-quaternary">
                    {month}
                  </span>
                ))}
              </div>

              <ul className="relative space-y-2">
                {/* Today marker, offset past the 140px label gutter. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 z-10 w-px bg-brand"
                  style={{ left: `calc(140px + (100% - 140px) * ${todayOffset / 100})` }}
                />
                {CHANGES.map((change) => {
                  const start = new Date(change.initiatedDate).getTime();
                  const due = new Date(change.filingDeadline).getTime();
                  const left = Math.max(0, ((start - WINDOW_START.getTime()) / span) * 100);
                  const width = Math.max(
                    3,
                    ((due - Math.max(start, WINDOW_START.getTime())) / span) * 100,
                  );
                  const overdue = change.status === "Overdue";
                  return (
                    <li key={change.id} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChangeId(change.id);
                          navigateTo("heatmap");
                        }}
                        className="type-body-md w-[140px] shrink-0 truncate rounded text-left font-mono text-fg-secondary transition-colors duration-150 hover:text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        title={change.title}
                      >
                        {change.id}
                      </button>
                      <span className="relative h-5 min-w-0 flex-1 overflow-hidden rounded bg-action">
                        <span
                          className="type-caption tabular absolute inset-y-0 flex items-center rounded px-1.5 font-mono whitespace-nowrap text-fg-on-color"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            background: overdue ? "var(--feedback-error-icon)" : "var(--pillar-04)",
                          }}
                          title={`${change.initiatedDate} → ${change.filingDeadline}`}
                        >
                          {change.filingDeadline}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Panel>

        <Panel title="External regulatory milestones">
          {EXTERNAL_MILESTONES.length === 0 ? (
            <EmptyState title="No external milestones" />
          ) : (
            <ul className="divide-y divide-stroke-muted">
              {EXTERNAL_MILESTONES.map((milestone) => (
                <li
                  key={milestone.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="type-heading-sm truncate text-fg-primary">
                      {milestone.eventType}
                    </div>
                    <div className="type-body-sm text-fg-quaternary">{milestone.authority}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="type-body-md tabular font-mono text-brand">
                      {milestone.dueDate}
                    </div>
                    <div
                      className="type-caption tabular font-mono"
                      style={{ color: urgencyTone(milestone.daysRemaining) }}
                    >
                      {milestone.daysRemaining} days
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </PageBody>
    </>
  );
}

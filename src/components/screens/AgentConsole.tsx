import { AppIcon, type IconName } from "@/components/icons";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useApp } from "@/context/AppContext";
import { Button } from "@/components/shared/Button";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { KpiRow, KpiTile, Panel } from "@/components/shared/Panel";
import {
  AGENT_ACTIVITY_LOG,
  AGENT_QUEUE,
  AUTHORITIES,
  AUTHORITY_SYNC,
  DEFAULT_REASONING,
  FEED_EVENTS,
  REGULATORY_INTELLIGENCE_AGENT as AGENT,
  UPCOMING_DEADLINES,
  confidenceColor,
  daysUntil,
  deadlineColor,
} from "@/data/regulatoryData";
import {
  AuthorityBadge,
  ConfidenceRing,
  FilingTypeBadge,
  StatusPill,
} from "@/components/regulatory/atoms";

const PURPLE = "var(--pillar-02)";
const URGENCY_COLOR = {
  critical: "var(--feedback-error-icon)",
  warning: "var(--feedback-warning-icon)",
  normal: "var(--feedback-success-icon)",
} as const;

const ACTIVITY_ICONS = {
  ingestion: "inbox",
  agent: "bot",
  system: "settings",
  notification: "notification",
} as const satisfies Record<string, IconName>;

const ACTIVITY_COLORS = {
  ingestion: "var(--pillar-01)",
  agent: PURPLE,
  system: "var(--fg-tertiary)",
  notification: "var(--feedback-warning-icon)",
} as const;

export function AgentConsole() {
  const { showToast, logAudit, navigateTo, setSelectedReportId } = useApp();
  const [paused, setPaused] = useState(false);
  const [openTrace, setOpenTrace] = useState<Set<number>>(new Set([2]));
  const [tickerIndex, setTickerIndex] = useState(0);

  // Auto-rotate the live ticker headline every 3.5s, pauses when paused.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setTickerIndex((i) => (i + 1) % AGENT_ACTIVITY_LOG.length),
      3500,
    );
    return () => window.clearInterval(id);
  }, [paused]);

  const trend = AGENT.confidenceTrend;
  const trendAvg = useMemo(
    () => Math.round(trend.reduce((s, p) => s + p.value, 0) / trend.length),
    [trend],
  );

  const totalAuthorityItemsToday = AUTHORITY_SYNC.reduce((s, a) => s + a.itemsToday, 0);
  const unhealthyAuthorities = AUTHORITY_SYNC.filter((a) => !a.isHealthy).length;

  const headlineEvent = AGENT_ACTIVITY_LOG[tickerIndex];

  const openReport = (reportId: string) => {
    setSelectedReportId(reportId);
    navigateTo("report-detail");
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "01",
      action: `Opened Impact Delta Report ${reportId} from Agent Console`,
    });
  };

  const togglePause = () => {
    setPaused((p) => !p);
    showToast(
      paused
        ? "Agent resumed. Feed monitoring active."
        : "Agent paused. New events queued but not processed.",
      paused ? "success" : "warning",
    );
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "01",
      action: paused
        ? "Regulatory Intelligence Agent resumed"
        : "Regulatory Intelligence Agent paused",
    });
  };

  const replayEvent = (id: string) => {
    showToast(`Re-queued ${id} for agent processing.`, "success");
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "01",
      action: `Re-queued ${id} for Regulatory Intelligence Agent`,
    });
  };

  return (
    <>
      <PageHeader
        title={AGENT.name}
        description={AGENT.description}
        breadcrumb={[{ label: "Change Intelligence" }, { label: "Intelligence Agent" }]}
        badges={
          <span
            className="type-caption inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
            style={{
              background: paused
                ? "color-mix(in oklab, var(--feedback-warning-icon) 14%, transparent)"
                : "color-mix(in oklab, var(--feedback-success-icon) 14%, transparent)",
              color: paused ? "var(--feedback-warning-icon)" : "var(--feedback-success-icon)",
            }}
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{
                background: paused
                  ? "var(--feedback-warning-icon)"
                  : "var(--feedback-success-icon)",
              }}
            />
            {paused ? "Paused" : "Active"}
          </span>
        }
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => navigateTo("feed-monitor")}>
              <AppIcon name="feed" size="sm" /> Feed Monitor
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateTo("delta-reports")}>
              <AppIcon name="deltaReport" size="sm" /> Delta Reports
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => showToast("Feed re-sync queued.", "success")}
            >
              <AppIcon name="refresh" size="sm" /> Re-sync
            </Button>
            <Button variant="secondary" size="sm" onClick={togglePause}>
              <AppIcon name={paused ? "play" : "pause"} size="sm" />
              {paused ? "Resume agent" : "Pause agent"}
            </Button>
          </>
        }
      >
        <p className="type-body-sm tabular flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-quaternary">
          <span className="font-mono">{AGENT.id}</span>
          <span aria-hidden="true">·</span>
          <span>
            Last active <span className="font-mono text-fg-secondary">{AGENT.lastActive}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Uptime <span className="font-mono text-fg-secondary">{AGENT.uptimeDays}d</span>
          </span>
        </p>
      </PageHeader>

      <PageBody className="gap-4">
        <KpiRow>
          <KpiTile
            label="Avg confidence"
            value={`${AGENT.avgConfidenceScore}%`}
            note={`Across ${AGENT.itemsThisWeek} events this week`}
            tone="success"
          />
          <KpiTile
            label="Items today"
            value={AGENT.itemsProcessedToday}
            note={`${AGENT.itemsThisWeek} processed this week`}
          />
          <KpiTile
            label="Queue depth"
            value={AGENT.queueDepth}
            note="Items currently processing"
            tone={AGENT.queueDepth > 0 ? "warning" : "neutral"}
          />
          <KpiTile
            label="Avg cycle"
            value={`${AGENT.avgCycleSeconds}s`}
            note="Ingestion to report ready"
          />
          <KpiTile
            label="Authority health"
            value={`${AUTHORITY_SYNC.length - unhealthyAuthorities} / ${AUTHORITY_SYNC.length}`}
            note={
              unhealthyAuthorities
                ? `${unhealthyAuthorities} feed${unhealthyAuthorities > 1 ? "s" : ""} delayed`
                : "All feeds healthy"
            }
            tone={unhealthyAuthorities ? "warning" : "success"}
          />
        </KpiRow>

        {/* Live ticker + activity log */}
        <section
          aria-label="Live agent ticker"
          className="overflow-hidden rounded-lg border border-stroke-default bg-container"
          style={{ borderLeft: `2px solid ${PURPLE}` }}
        >
          <div className="flex flex-wrap items-stretch">
            <div className="flex items-center gap-3 px-5 py-3 border-r border-stroke-default min-w-[180px]">
              <div className="relative">
                <span
                  className={`absolute inset-0 rounded-full ${paused ? "" : "animate-ping"} opacity-50`}
                  style={{ background: PURPLE }}
                />
                <span
                  className="relative block w-2 h-2 rounded-full"
                  style={{ background: PURPLE }}
                />
              </div>
              <div>
                <div className="text-3xs uppercase tracking-wider text-fg-tertiary">Live</div>
                <div className="text-2xs font-medium text-fg-primary">Agent Ticker</div>
              </div>
            </div>
            <div className="flex-1 min-w-[260px] flex items-center gap-3 px-5 py-3">
              <ActivityIcon type={headlineEvent.type} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xs text-fg-tertiary">{headlineEvent.ts}</span>
                  {headlineEvent.feedId && (
                    <span className="font-mono text-3xs" style={{ color: "var(--pillar-01)" }}>
                      {headlineEvent.feedId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-fg-primary truncate">{headlineEvent.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-5 py-3 border-l border-stroke-default">
              {AGENT_ACTIVITY_LOG.slice(0, 8).map((_, i) => (
                <span
                  key={i}
                  className="block h-1 rounded-full transition-all"
                  style={{
                    width: i === tickerIndex ? 18 : 6,
                    background: i === tickerIndex ? PURPLE : "var(--surface-action)",
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Confidence trend */}
            <Panel
              title="Confidence trend"
              description="Daily average across all events processed in the trailing 9-day window."
              action={
                <div className="type-caption flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-fg-tertiary">
                    <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} /> Daily
                    avg
                  </span>
                  <span className="flex items-center gap-1.5 text-fg-tertiary">
                    <span
                      className="block w-3 border-t border-dashed"
                      style={{ borderColor: "var(--feedback-success-icon)" }}
                    />
                    9-day avg <span className="font-mono text-fg-primary">{trendAvg}%</span>
                  </span>
                </div>
              }
            >
              <div className="h-[200px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="confGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--pillar-02)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--pillar-02)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="2 4"
                      stroke="var(--stroke-muted)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="x"
                      stroke="var(--fg-quaternary)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--fg-quaternary)"
                      fontSize={11}
                      domain={[60, 100]}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface-raised)",
                        border: "1px solid var(--stroke-default)",
                        boxShadow: "var(--elevation-popover)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "var(--fg-tertiary)" }}
                      formatter={(v: number) => [`${v}%`, "Confidence"]}
                    />
                    <ReferenceLine
                      y={trendAvg}
                      stroke="var(--feedback-success-icon)"
                      strokeDasharray="3 3"
                      strokeOpacity={0.7}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--pillar-02)"
                      strokeWidth={2}
                      fill="url(#confGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Queue now */}
            <Panel
              title="Queue now"
              action={
                <span className="type-caption tabular text-fg-quaternary">
                  <span className="font-mono text-fg-secondary">{AGENT_QUEUE.length}</span> in
                  flight
                </span>
              }
            >
              <div className="space-y-2.5">
                {AGENT_QUEUE.map((item) => {
                  const auth = AUTHORITIES[item.authority];
                  return (
                    <div
                      key={item.feedId}
                      className="rounded-md border border-stroke-default p-3 hover:border-brand/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <AuthorityBadge code={item.authority} />
                          <span
                            className="font-mono text-3xs"
                            style={{ color: "var(--pillar-01)" }}
                          >
                            {item.feedId}
                          </span>
                          <StatusPill status={item.stage} />
                        </div>
                        <div className="flex items-center gap-3 text-2xs text-fg-tertiary">
                          <span className="font-mono">{item.startedAt}</span>
                          <span className="font-mono" style={{ color: PURPLE }}>
                            ETA {item.etaSeconds}s
                          </span>
                          <button
                            onClick={() => replayEvent(item.feedId)}
                            className="rounded p-1 hover:bg-action-tertiary-hover text-fg-tertiary hover:text-fg-primary"
                            title="Re-queue"
                            aria-label={`Re-queue ${item.feedId}`}
                          >
                            <AppIcon name="refresh" size="sm" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-fg-primary line-clamp-1 mb-2" title={item.title}>
                        {item.title}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-action overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.progress}%`, background: auth.color }}
                          />
                        </div>
                        <span className="font-mono text-3xs text-fg-tertiary w-9 text-right">
                          {item.progress}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Capabilities */}
            <Panel title="Capabilities">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {AGENT.capabilities.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-md p-3"
                    style={{
                      background: `color-mix(in oklab, ${PURPLE} 4%, var(--surface-container))`,
                      border: "1px solid var(--stroke-muted)",
                    }}
                  >
                    <AppIcon
                      name="success"
                      size="sm"
                      className="mt-0.5 shrink-0"
                      style={{ color: PURPLE }}
                    />
                    <span className="text-xs text-fg-primary leading-relaxed">{c}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Recent reasoning trace sample */}
            <Panel
              title="Latest reasoning trace"
              description="From IDR-2025-0041 · EMA Excipients Labelling Revision 2 · 08:30 today"
              action={
                <button
                  type="button"
                  onClick={() => openReport("IDR-2025-0041")}
                  className="type-body-sm inline-flex items-center gap-1 rounded text-[color:var(--pillar-01)] hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Open report <AppIcon name="external" size="xs" />
                </button>
              }
            >
              <div className="divide-y divide-stroke-muted">
                {DEFAULT_REASONING.map((step) => {
                  const isOpen = openTrace.has(step.stepNumber);
                  return (
                    <div key={step.stepNumber} className="py-2.5 first:pt-0 last:pb-0">
                      <button
                        onClick={() =>
                          setOpenTrace((prev) => {
                            const next = new Set(prev);
                            if (next.has(step.stepNumber)) next.delete(step.stepNumber);
                            else next.add(step.stepNumber);
                            return next;
                          })
                        }
                        className="w-full flex items-center gap-2 text-left hover:text-fg-primary transition"
                      >
                        {isOpen ? (
                          <AppIcon
                            name="chevronDown"
                            size="sm"
                            className="text-fg-tertiary shrink-0"
                          />
                        ) : (
                          <AppIcon
                            name="chevronRight"
                            size="sm"
                            className="text-fg-tertiary shrink-0"
                          />
                        )}
                        <span className="font-mono text-2xs text-fg-tertiary">
                          Step {step.stepNumber}
                        </span>
                        <span className="text-xs font-medium text-fg-primary">{step.title}</span>
                        {step.confidence !== null && (
                          <span
                            className="ml-auto font-mono text-2xs"
                            style={{ color: confidenceColor(step.confidence) }}
                          >
                            {step.confidence}%
                          </span>
                        )}
                      </button>
                      {isOpen && (
                        <p className="mt-2 pl-6 text-xs text-fg-tertiary leading-relaxed">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Upcoming deadlines */}
            <Panel
              title="Upcoming deadlines"
              action={
                <span className="type-caption tabular text-fg-quaternary">
                  Next{" "}
                  <span className="font-mono text-fg-secondary">{UPCOMING_DEADLINES.length}</span>
                </span>
              }
            >
              <div className="space-y-2">
                {UPCOMING_DEADLINES.map((d) => (
                  <button
                    key={d.reportId}
                    onClick={() => openReport(d.reportId)}
                    className="w-full text-left rounded-md border border-stroke-default p-2.5 hover:bg-action-tertiary-hover/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-3xs" style={{ color: "var(--pillar-01)" }}>
                        {d.reportId}
                      </span>
                      <span
                        className="font-mono text-2xs font-semibold"
                        style={{ color: URGENCY_COLOR[d.urgency] }}
                      >
                        {d.daysRemaining}d
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <AuthorityBadge code={d.authority} />
                      <FilingTypeBadge type={d.filingType} />
                    </div>
                    <div className="text-2xs text-fg-tertiary flex items-center justify-between">
                      <span>
                        {d.productSummary} · {d.market}
                      </span>
                      <span className="font-mono">{d.deadline}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>

            {/* Authority coverage */}
            <Panel
              title="Authority coverage"
              action={
                <span className="type-caption tabular text-fg-quaternary">
                  <span className="font-mono text-fg-secondary">{totalAuthorityItemsToday}</span>{" "}
                  items today
                </span>
              }
            >
              <div className="space-y-1">
                {AUTHORITY_SYNC.map((a) => {
                  const meta = AUTHORITIES[a.code];
                  return (
                    <div
                      key={a.code}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-action-tertiary-hover/50 transition"
                    >
                      <AuthorityBadge code={a.code} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-fg-primary truncate">{meta.country}</div>
                        <div className="flex items-center gap-2 text-3xs text-fg-tertiary">
                          <AppIcon name="clock" size="xs" /> {a.lastSyncMinutesAgo}m ago
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-fg-primary">{a.itemsToday}</div>
                        <div className="text-3xs text-fg-tertiary">today</div>
                      </div>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: a.isHealthy
                            ? "var(--feedback-success-icon)"
                            : "var(--feedback-warning-icon)",
                        }}
                        title={a.isHealthy ? "Healthy" : "Delayed"}
                      />
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Activity log full */}
            <Panel
              title="Activity log"
              action={
                <span className="type-caption tabular text-fg-quaternary">
                  Last{" "}
                  <span className="font-mono text-fg-secondary">{AGENT_ACTIVITY_LOG.length}</span>
                </span>
              }
            >
              <div className="scrollbar-thin max-h-[440px] space-y-2.5 overflow-y-auto pr-1">
                {AGENT_ACTIVITY_LOG.map((evt, i) => {
                  const iconName = ACTIVITY_ICONS[evt.type];
                  const color = ACTIVITY_COLORS[evt.type];
                  return (
                    <div key={i} className="flex gap-2.5">
                      <div
                        className="shrink-0 w-7 h-7 rounded-full grid place-items-center mt-0.5"
                        style={{
                          background: `color-mix(in oklab, ${color} 14%, transparent)`,
                          color,
                        }}
                      >
                        <AppIcon name={iconName} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-mono text-3xs text-fg-tertiary">{evt.ts}</span>
                          {evt.feedId && (
                            <span
                              className="font-mono text-3xs"
                              style={{ color: "var(--pillar-01)" }}
                            >
                              {evt.feedId}
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-fg-tertiary mt-0.5 leading-relaxed">
                          {evt.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Recent agent confidence by report */}
            <Panel title="Recent reports by confidence">
              <div className="space-y-2">
                {FEED_EVENTS.filter((e) => e.reportId && e.confidenceScore !== null)
                  .slice(0, 5)
                  .map((e) => {
                    const d = daysUntil(e.deadlineDate);
                    return (
                      <button
                        key={e.id}
                        onClick={() => openReport(e.reportId!)}
                        className="w-full text-left flex items-center gap-3 rounded-md p-2 hover:bg-action-tertiary-hover/50 transition"
                      >
                        <ConfidenceRing value={e.confidenceScore} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="font-mono text-3xs"
                              style={{ color: "var(--pillar-01)" }}
                            >
                              {e.reportId}
                            </span>
                            <FilingTypeBadge type={e.filingType} />
                          </div>
                          <div className="text-2xs text-fg-primary line-clamp-1">{e.title}</div>
                        </div>
                        {d !== null && (
                          <span
                            className="font-mono text-2xs shrink-0"
                            style={{ color: deadlineColor(d) }}
                          >
                            {d < 0 ? "OVRD" : `${d}d`}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </Panel>
          </div>
        </div>
      </PageBody>
    </>
  );
}

/** Circular type marker shared by the ticker and the activity log. */
function ActivityIcon({ type }: { type: keyof typeof ACTIVITY_ICONS }) {
  const iconName = ACTIVITY_ICONS[type];
  const color = ACTIVITY_COLORS[type];
  return (
    <span
      className="grid size-7 shrink-0 place-items-center rounded-full"
      style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      <AppIcon name={iconName} size="sm" />
    </span>
  );
}

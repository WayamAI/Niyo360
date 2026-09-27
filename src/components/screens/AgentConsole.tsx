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
import { Card, Eyebrow } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
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
    <div className="page-enter space-y-5">
      {/* Header */}
      <Card className="border-l-4" style={{ borderLeftColor: PURPLE }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 min-w-0">
            <div
              className="w-12 h-12 rounded-lg grid place-items-center shrink-0"
              style={{ background: `color-mix(in oklab, ${PURPLE} 14%, transparent)` }}
            >
              <AppIcon name="agent" size="2xl" style={{ color: PURPLE }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h1 className="type-display-page text-fg-primary">{AGENT.name}</h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-3xs font-medium"
                  style={{
                    background: paused
                      ? "color-mix(in oklab, var(--feedback-warning-icon) 14%, transparent)"
                      : "color-mix(in oklab, var(--feedback-success-icon) 14%, transparent)",
                    color: paused ? "var(--feedback-warning-icon)" : "var(--feedback-success-icon)",
                  }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${paused ? "" : "animate-pulse"}`}
                    style={{
                      background: paused
                        ? "var(--feedback-warning-icon)"
                        : "var(--feedback-success-icon)",
                    }}
                  />
                  {paused ? "Paused" : "Active"}
                </span>
              </div>
              <p className="text-sm text-fg-tertiary max-w-3xl leading-relaxed">
                {AGENT.description}
              </p>
              <div className="flex items-center gap-4 mt-2.5 text-2xs text-fg-tertiary flex-wrap">
                <span className="font-mono">{AGENT.id}</span>
                <span className="opacity-50">·</span>
                {/* <span>
                  Model <span className="text-fg-primary font-mono">{AGENT.modelUsed}</span>
                </span> */}
                <span className="opacity-50">·</span>
                <span>
                  Last active <span className="font-mono text-fg-primary">{AGENT.lastActive}</span>
                </span>
                <span className="opacity-50">·</span>
                <span>
                  Uptime <span className="font-mono text-fg-primary">{AGENT.uptimeDays}d</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={togglePause}>
              {paused ? <AppIcon name="play" size="sm" /> : <AppIcon name="pause" size="sm" />}
              {paused ? "Resume Agent" : "Pause Agent"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => showToast("Feed re-sync queued.", "success")}
            >
              <AppIcon name="refresh" size="sm" /> Re-sync Feeds
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateTo("feed-monitor")}>
              <AppIcon name="feed" size="sm" /> Feed Monitor
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateTo("delta-reports")}>
              <AppIcon name="deltaReport" size="sm" /> Delta Reports
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiTile
          icon={<AppIcon name="gauge" size="sm" />}
          label="Avg Confidence"
          value={`${AGENT.avgConfidenceScore}%`}
          accent={confidenceColor(AGENT.avgConfidenceScore)}
          note="Across 14 events this week"
        />
        <KpiTile
          icon={<AppIcon name="activity" size="sm" />}
          label="Items Today"
          value={AGENT.itemsProcessedToday}
          accent={PURPLE}
          note={`${AGENT.itemsThisWeek} processed this week`}
        />
        <KpiTile
          icon={<AppIcon name="layers" size="sm" />}
          label="Queue Depth"
          value={AGENT.queueDepth}
          accent="var(--feedback-warning-icon)"
          note="Items currently processing"
        />
        <KpiTile
          icon={<AppIcon name="timer" size="sm" />}
          label="Avg Cycle"
          value={`${AGENT.avgCycleSeconds}s`}
          accent="var(--pillar-01)"
          note="Ingestion → report ready"
        />
        <KpiTile
          icon={<AppIcon name="warning" size="sm" />}
          label="Authority Health"
          value={`${AUTHORITY_SYNC.length - unhealthyAuthorities} / ${AUTHORITY_SYNC.length}`}
          accent={
            unhealthyAuthorities ? "var(--feedback-warning-icon)" : "var(--feedback-success-icon)"
          }
          note={
            unhealthyAuthorities
              ? `${unhealthyAuthorities} feed${unhealthyAuthorities > 1 ? "s" : ""} delayed`
              : "All feeds healthy"
          }
        />
      </div>

      {/* Live ticker + activity log */}
      <Card className="border-l-[3px] py-0 overflow-hidden" style={{ borderLeftColor: PURPLE }}>
        <div className="flex items-stretch flex-wrap">
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
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Confidence trend */}
          <Card>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <Eyebrow className="!mb-0">Confidence Trend</Eyebrow>
                <p className="text-2xs text-fg-tertiary mt-1">
                  Daily average across all events processed in the trailing 9-day window.
                </p>
              </div>
              <div className="flex items-center gap-3 text-2xs">
                <span className="flex items-center gap-1.5 text-fg-tertiary">
                  <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} /> Daily avg
                </span>
                <span className="flex items-center gap-1.5 text-fg-tertiary">
                  <span
                    className="block w-3 border-t border-dashed"
                    style={{ borderColor: "var(--feedback-success-icon)" }}
                  />
                  9-day avg <span className="font-mono text-fg-primary">{trendAvg}%</span>
                </span>
              </div>
            </div>
            <div className="h-[200px]">
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
          </Card>

          {/* Queue now */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <Eyebrow className="!mb-0">Queue Now</Eyebrow>
              <span className="text-2xs text-fg-tertiary">
                <span className="font-mono text-fg-primary">{AGENT_QUEUE.length}</span> items in
                flight
              </span>
            </div>
            <div className="space-y-3">
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
                        <span className="font-mono text-3xs" style={{ color: "var(--pillar-01)" }}>
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
          </Card>

          {/* Capabilities */}
          <Card>
            <Eyebrow>Capabilities</Eyebrow>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AGENT.capabilities.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-md p-3"
                  style={{
                    background: `color-mix(in oklab, ${PURPLE} 4%, var(--surface-raised))`,
                    border: "1px solid var(--stroke-default)",
                    boxShadow: "var(--elevation-popover)",
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
          </Card>

          {/* Recent reasoning trace sample */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AppIcon name="agent" size="sm" style={{ color: PURPLE }} />
                <Eyebrow className="!mb-0">Latest Reasoning Trace</Eyebrow>
              </div>
              <button
                onClick={() => openReport("IDR-2025-0041")}
                className="text-2xs inline-flex items-center gap-1 hover:underline"
                style={{ color: "var(--pillar-01)" }}
              >
                Open report <AppIcon name="external" size="xs" />
              </button>
            </div>
            <p className="text-2xs text-fg-tertiary mb-3">
              From IDR-2025-0041 · EMA Excipients Labelling Revision 2 · 08:30 today.
            </p>
            <div className="divide-y divide-border">
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
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* Upcoming deadlines */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <Eyebrow className="!mb-0">Upcoming Deadlines</Eyebrow>
              <span className="text-2xs text-fg-tertiary">
                Next <span className="font-mono text-fg-primary">{UPCOMING_DEADLINES.length}</span>
              </span>
            </div>
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
          </Card>

          {/* Authority coverage */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <Eyebrow className="!mb-0">Authority Coverage</Eyebrow>
              <span className="text-2xs text-fg-tertiary">
                <span className="font-mono text-fg-primary">{totalAuthorityItemsToday}</span> items
                today
              </span>
            </div>
            <div className="space-y-2">
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
          </Card>

          {/* Activity log full */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <Eyebrow className="!mb-0">Activity Log</Eyebrow>
              <span className="text-2xs text-fg-tertiary">
                Last <span className="font-mono text-fg-primary">{AGENT_ACTIVITY_LOG.length}</span>{" "}
                events
              </span>
            </div>
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto scrollbar-thin pr-1">
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
          </Card>

          {/* Recent agent confidence by report */}
          <Card>
            <Eyebrow>Recent Reports (Confidence)</Eyebrow>
            <div className="space-y-3">
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
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  accent,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  note: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div className="text-3xs font-medium uppercase tracking-wider text-fg-tertiary">
          {label}
        </div>
        <span
          className="grid place-items-center w-6 h-6 rounded-md"
          style={{ background: `color-mix(in oklab, ${accent} 14%, transparent)`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <div className="type-display-metric-md" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-2xs text-fg-tertiary mt-2">{note}</div>
    </Card>
  );
}

function ActivityIcon({ type }: { type: keyof typeof ACTIVITY_ICONS }) {
  const iconName = ACTIVITY_ICONS[type];
  const color = ACTIVITY_COLORS[type];
  return (
    <span
      className="grid place-items-center w-7 h-7 rounded-full shrink-0"
      style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      <AppIcon name={iconName} size="sm" />
    </span>
  );
}

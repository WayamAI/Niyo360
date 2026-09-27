import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppIcon, type IconName } from "@/components/icons";
import { useApp, type ScreenId } from "@/context/AppContext";
import { PageBody, PageHeader, SectionHeader } from "@/components/shared/Page";
import { KpiRow, KpiTile, Panel, type MetricTone } from "@/components/shared/Panel";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { EmptyState } from "@/components/shared/States";
import { ValueSignal } from "@/components/shared/Atoms";
import {
  CHANGES,
  CHANGE_ACTIVITY_BY_MONTH,
  ESCALATIONS,
  HAQ_DRAFTS,
  REGULATORY_FEED_ITEMS,
  SEED_AUDIT_EVENTS,
  VALIDATION_REPORTS,
} from "@/data/mockData";

/**
 * Command Centre.
 *
 * Ordered by what the reader needs first: what is on fire, then the portfolio
 * counts, then the trend, then what the agents have been doing. The capability
 * pillars moved to the bottom — they explain what the product is, which
 * matters on a first visit and never again, so they no longer occupy the
 * position above the operational numbers.
 *
 * Every figure here is derived from the data modules. The previous version
 * carried them as string literals ("7", "4", "14", "6"), which had already
 * drifted from the records they claimed to count.
 */

const PILLARS: {
  n: "01" | "02" | "03" | "04";
  name: string;
  signal: "High Value" | "Medium-High Value" | "Conditional Value";
  target: ScreenId;
}[] = [
  { n: "01", name: "Regulatory Change Intelligence", signal: "High Value", target: "feed-monitor" },
  { n: "02", name: "AI Writing and HAQ Response", signal: "High Value", target: "haq-drafts" },
  {
    n: "03",
    name: "Dossier Compliance Validator",
    signal: "Medium-High Value",
    target: "validator",
  },
  { n: "04", name: "CMC Change Impact Simulator", signal: "High Value", target: "simulator" },
];

const AGENTS: {
  pillar: "01" | "02" | "03" | "04";
  name: string;
  actor: string;
  target: ScreenId;
}[] = [
  {
    pillar: "01",
    name: "Regulatory Intelligence Agent",
    actor: "Regulatory Intelligence Agent",
    target: "agent-console",
  },
  { pillar: "02", name: "HAQ Drafting Agent", actor: "Query Risk Agent", target: "haq-drafts" },
  {
    pillar: "03",
    name: "Compliance Validator",
    actor: "Compliance Validator",
    target: "validation-reports",
  },
  { pillar: "04", name: "Cascade Agent", actor: "Cascade Agent", target: "heatmap" },
];

export function Dashboard() {
  const { navigateTo, showToast, fixedIssues, resolvedEscalations } = useApp();

  const stats = useMemo(() => {
    const pendingSimulation = CHANGES.filter((c) => c.simulationStatus !== "complete").length;
    const overdueChanges = CHANGES.filter((c) => c.status === "Overdue").length;

    const haqAtRisk = HAQ_DRAFTS.filter((d) => d.daysRemaining <= 21).length;

    const openIssues = VALIDATION_REPORTS.flatMap((r) => r.issues).filter(
      (i) => !fixedIssues.has(i.id),
    );
    const critical = openIssues.filter((i) => i.severity === "Critical").length;
    const major = openIssues.filter((i) => i.severity === "Major").length;

    const feedNeedingAction = REGULATORY_FEED_ITEMS.filter((f) => f.filingRequired).length;
    const openEscalations = ESCALATIONS.filter((e) => !resolvedEscalations.has(e.id));

    return {
      changes: CHANGES.length,
      pendingSimulation,
      overdueChanges,
      haq: HAQ_DRAFTS.length,
      haqAtRisk,
      openIssues: openIssues.length,
      critical,
      major,
      feed: REGULATORY_FEED_ITEMS.length,
      feedNeedingAction,
      openEscalations,
    };
  }, [fixedIssues, resolvedEscalations]);

  // The "needs attention" strip. Only conditions that are actually true are
  // pushed, so an all-clear portfolio shows an all-clear panel rather than a
  // row of reassuring zeroes.
  const attention: {
    id: string;
    icon: IconName;
    tone: Exclude<MetricTone, "neutral" | "brand">;
    label: string;
    detail: string;
    target: ScreenId;
  }[] = [];

  if (stats.critical > 0) {
    attention.push({
      id: "critical",
      icon: "error",
      tone: "error",
      label: `${stats.critical} critical validation ${stats.critical === 1 ? "issue" : "issues"}`,
      detail: "Blocks submission until resolved",
      target: "validation-reports",
    });
  }
  if (stats.openEscalations.length > 0) {
    const soonest = Math.min(...stats.openEscalations.map((e) => e.slaDaysRemaining));
    attention.push({
      id: "escalations",
      icon: "escalation",
      tone: "warning",
      label: `${stats.openEscalations.length} open ${
        stats.openEscalations.length === 1 ? "escalation" : "escalations"
      }`,
      detail: `Earliest SLA in ${soonest} days`,
      target: "escalations",
    });
  }
  if (stats.haqAtRisk > 0) {
    attention.push({
      id: "haq",
      icon: "timer",
      tone: "warning",
      label: `${stats.haqAtRisk} HAQ ${
        stats.haqAtRisk === 1 ? "response" : "responses"
      } inside 21 days`,
      detail: "Awaiting specialist sign-off",
      target: "haq-drafts",
    });
  }
  if (stats.pendingSimulation > 0) {
    attention.push({
      id: "simulation",
      icon: "simulator",
      tone: "info",
      label: `${stats.pendingSimulation} ${
        stats.pendingSimulation === 1 ? "change" : "changes"
      } awaiting simulation`,
      detail: "Market impact not yet mapped",
      target: "simulator",
    });
  }

  const TONE_BG: Record<string, string> = {
    error: "text-error-icon",
    warning: "text-warning-icon",
    info: "text-info-icon",
    success: "text-success-icon",
  };

  return (
    <>
      <PageHeader
        title="Command Centre"
        description="Portfolio-wide regulatory state across all four capability pillars."
        breadcrumb={[{ label: "Command Centre" }]}
        actions={
          <>
            <span className="type-body-md tabular rounded-md border border-stroke-default bg-action px-2.5 py-1 font-mono text-fg-tertiary">
              22 May 2025
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => showToast("Platform state refreshed.", "success")}
            >
              <AppIcon name="refresh" size="sm" /> Refresh
            </Button>
          </>
        }
      />

      <PageBody className="gap-5">
        <section>
          <SectionHeader
            title="Needs attention"
            description="Conditions currently true across the portfolio, most severe first."
          />
          {attention.length === 0 ? (
            <Panel>
              <EmptyState
                icon="success"
                title="Nothing needs attention"
                detail="No critical validation issues, open escalations, or deadlines inside 21 days."
              />
            </Panel>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {attention.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => navigateTo(item.target)}
                    className="flex w-full items-center gap-3 rounded-lg border border-stroke-default bg-container px-3.5 py-3 text-left transition-colors duration-150 hover:border-stroke-active hover:bg-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <AppIcon name={item.icon} size="lg" className={TONE_BG[item.tone]} />
                    <span className="min-w-0 flex-1">
                      <span className="type-heading-sm block truncate text-fg-primary">
                        {item.label}
                      </span>
                      <span className="type-body-sm block truncate text-fg-tertiary">
                        {item.detail}
                      </span>
                    </span>
                    <AppIcon name="chevronRight" size="sm" className="text-icon-quaternary" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader title="Portfolio at a glance" />
          <KpiRow>
            <KpiTile
              label="Active changes"
              value={stats.changes}
              note={`${stats.pendingSimulation} pending simulation`}
              tone={stats.overdueChanges > 0 ? "warning" : "neutral"}
              trend={stats.overdueChanges > 0 ? `${stats.overdueChanges} overdue` : undefined}
              trendIcon="trendUp"
              onClick={() => navigateTo("simulator")}
            />
            <KpiTile
              label="Open HAQ responses"
              value={stats.haq}
              note={`${stats.haqAtRisk} inside 21 days`}
              tone={stats.haqAtRisk > 0 ? "warning" : "neutral"}
              onClick={() => navigateTo("haq-drafts")}
            />
            <KpiTile
              label="Open validation issues"
              value={stats.openIssues}
              note={`${stats.critical} critical · ${stats.major} major`}
              tone={stats.critical > 0 ? "error" : "neutral"}
              onClick={() => navigateTo("validation-reports")}
            />
            <KpiTile
              label="Regulatory feed items"
              value={stats.feed}
              note={`${stats.feedNeedingAction} require a filing`}
              tone="info"
              onClick={() => navigateTo("feed-monitor")}
            />
          </KpiRow>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <Panel
            title="Change activity, last 6 months"
            className="xl:col-span-3"
            action={
              <div className="type-caption flex flex-wrap items-center gap-2.5 text-fg-tertiary">
                {[
                  ["Simulated", "var(--pillar-04)"],
                  ["Classified", "var(--pillar-01)"],
                  ["Filed", "var(--pillar-02)"],
                  ["Approved", "var(--feedback-success-icon)"],
                  ["Overdue", "var(--feedback-error-icon)"],
                ].map(([label, color]) => (
                  <span key={label} className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-xs"
                      style={{ background: color }}
                    />
                    {label}
                  </span>
                ))}
              </div>
            }
          >
            <div className="h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CHANGE_ACTIVITY_BY_MONTH}
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="var(--stroke-muted)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--fg-quaternary)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--fg-quaternary)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={26}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-raised)",
                      border: "1px solid var(--stroke-default)",
                      boxShadow: "var(--elevation-popover)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "var(--fg-primary)",
                    }}
                    labelStyle={{ color: "var(--fg-tertiary)" }}
                    cursor={{ fill: "color-mix(in oklab, var(--pillar-01) 6%, transparent)" }}
                  />
                  <Bar
                    dataKey="Simulated"
                    stackId="a"
                    fill="var(--pillar-04)"
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="Classified"
                    stackId="a"
                    fill="var(--pillar-01)"
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="Filed"
                    stackId="a"
                    fill="var(--pillar-02)"
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="Approved"
                    stackId="a"
                    fill="var(--feedback-success-icon)"
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="Overdue"
                    stackId="a"
                    fill="var(--feedback-error-icon)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Recent activity"
            className="xl:col-span-2"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigateTo("audit")}>
                Audit trail
              </Button>
            }
          >
            <ul className="space-y-2.5">
              {SEED_AUDIT_EVENTS.slice(0, 6).map((event, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full"
                    style={{
                      background:
                        event.actorType === "agent"
                          ? "var(--pillar-02)"
                          : event.actorType === "user"
                            ? "var(--feedback-success-icon)"
                            : "var(--feedback-info-icon)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="type-body-md truncate font-medium text-fg-primary">
                        {event.actor}
                      </span>
                      <span className="type-caption tabular shrink-0 font-mono text-fg-quaternary">
                        {event.timestamp.split(" ")[1] ?? ""}
                      </span>
                    </div>
                    <p className="type-body-sm line-clamp-2 text-fg-tertiary">{event.action}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        <section>
          <SectionHeader
            title="Agent activity"
            description="Most recent action taken by each agent."
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {AGENTS.map((agent) => {
              const last = SEED_AUDIT_EVENTS.find((e) => e.actor === agent.actor);
              return (
                <article
                  key={agent.name}
                  className="flex flex-col rounded-lg border border-stroke-default bg-container p-3.5"
                  style={{ borderLeft: `2px solid var(--pillar-${agent.pillar})` }}
                >
                  <h3 className="type-heading-sm text-fg-primary">{agent.name}</h3>
                  <p className="type-body-sm mt-1.5 line-clamp-3 flex-1 text-fg-tertiary">
                    {last?.action ?? "No recorded activity."}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="type-caption tabular font-mono text-fg-quaternary">
                      {last?.timestamp.split(" ")[1] ?? "—"}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => navigateTo(agent.target)}>
                      Open
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Capability pillars"
            description="The four accelerators this platform adds alongside Veeva Vault RIM."
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {PILLARS.map((pillar) => (
              <article
                key={pillar.n}
                className="flex flex-col gap-2.5 rounded-lg border border-stroke-default p-3.5"
                style={{
                  borderLeft: `2px solid var(--pillar-${pillar.n})`,
                  background: `color-mix(in oklab, var(--pillar-${pillar.n}) 4%, var(--surface-container))`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="type-caption tabular font-mono font-medium"
                    style={{ color: `var(--pillar-${pillar.n})` }}
                  >
                    {pillar.n}
                  </span>
                  <h3 className="type-heading-sm min-w-0 flex-1 text-fg-primary">{pillar.name}</h3>
                </div>
                <ValueSignal level={pillar.signal} />
                <Button variant="secondary" size="sm" onClick={() => navigateTo(pillar.target)}>
                  Open
                </Button>
              </article>
            ))}
          </div>
        </section>

        <p className="type-body-sm flex items-start gap-2 rounded-lg border border-stroke-muted bg-container px-3.5 py-3 text-fg-tertiary">
          <AppIcon name="info" size="sm" className="mt-0.5 shrink-0 text-icon-quaternary" />
          <span>
            Built by Wayam AI. PARIVART is a pre-sales proof of concept demonstrating four AI
            accelerators working alongside Veeva Vault RIM.{" "}
            <Badge variant="neutral">Illustrative data</Badge>
          </span>
        </p>
      </PageBody>
    </>
  );
}

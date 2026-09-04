import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { Card, PillarCard, Eyebrow, AgentCard } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { ValueSignal, ConfidencePill } from "@/components/shared/Atoms";
import { CHANGE_ACTIVITY_BY_MONTH, SEED_AUDIT_EVENTS } from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PILLAR_DATA = [
  {
    n: "01" as const,
    name: "Regulatory Change Intelligence",
    signal: "High Value" as const,
    note: "Veeva does not do this natively",
    problem:
      "New EMA, FDA, or CDSCO guideline drops. Determining which active dossiers require a variation, manually, takes 3 to 5 analyst-days per guideline update.",
    benchmark: "AI-assisted impact mapping: same-day output vs 3 to 5 analyst-days",
    target: "feed-monitor" as const,
  },
  {
    n: "02" as const,
    name: "AI Writing and HAQ Response",
    signal: "High Value" as const,
    note: "Benchmarked outcomes at Merck validate the model",
    problem:
      "CSRs, variation dossier sections, and HAQ responses authored manually. Slow first-draft cycles, cross-affiliate inconsistency, high cost-per-document.",
    benchmark: "McKinsey-Merck 2023: first-draft time reduced 180h to 80h, 56% reduction",
    target: "haq-drafts" as const,
  },
  {
    n: "03" as const,
    name: "Dossier Compliance Validator",
    signal: "Medium-High Value" as const,
    note: "Additive to Veeva structural checks",
    problem:
      "Dossiers rejected post-submission due to formatting errors, inconsistent cross-references, or missing mandatory fields. Semantic consistency checks are absent.",
    benchmark:
      "AI pre-validation can reduce post-submission queries by 30 to 40% (IntuitionLabs, 2026)",
    target: "validator" as const,
  },
  {
    n: "04" as const,
    name: "CMC Change Impact Simulator",
    signal: "High Value" as const,
    note: "Veeva tracks; we simulate before authoring",
    problem:
      "One CMC change can silently trigger variation obligations across 100+ markets. Regulatory teams trace each impact manually, one market at a time.",
    benchmark: "50 to 70% reduction in time to complete full regulatory impact assessment",
    target: "simulator" as const,
  },
];

const KPI = [
  {
    label: "ACTIVE CHANGES",
    value: "7",
    note: "3 pending simulation",
    trend: "up",
    trendColor: "var(--feedback-warning-icon)",
    target: "simulator" as const,
    trendText: "+2 this week",
  },
  {
    label: "OPEN HAQ RESPONSES",
    value: "4",
    note: "2 approaching SLA deadline",
    trend: "down",
    trendColor: "var(--feedback-success-icon)",
    target: "haq-drafts" as const,
    trendText: "-1 vs last cycle",
  },
  {
    label: "VALIDATION ISSUES OPEN",
    value: "14",
    note: "2 Critical, 4 Major",
    trend: "up",
    trendColor: "var(--feedback-error-icon)",
    target: "validation-reports" as const,
    trendText: "warning",
  },
  {
    label: "REGULATORY FEED ITEMS",
    value: "6",
    note: "3 require action",
    trend: "up",
    trendColor: "var(--feedback-info-icon)",
    target: "feed-monitor" as const,
    trendText: "new this week",
  },
];

export function Dashboard() {
  const { navigateTo, showToast } = useApp();
  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-1.5 text-2xs text-fg-quaternary">
            <AppIcon name="home" size="xs" aria-label="Home" />
            <span aria-hidden="true">/</span>
            <span className="text-fg-tertiary">Command Centre</span>
          </nav>
          <h1 className="type-display-page text-fg-primary">Command Centre</h1>
          <p className="text-sm text-fg-tertiary mt-1.5">
            Regulatory Intelligence Platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-tertiary rounded-md border border-stroke-default bg-action px-3 py-1.5 font-mono">
            22 May 2025
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showToast("Refreshing platform state...", "success")}
          >
            <AppIcon name="refresh" size="sm" /> Refresh
          </Button>
        </div>
      </div>

      <section>
        <Eyebrow>AI Capability Pillars, Veeva Vault Accelerators</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PILLAR_DATA.map((p) => (
            <PillarCard key={p.n} pillar={p.n}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="font-mono text-2xs font-medium"
                  style={{ color: `var(--pillar-${p.n})` }}
                >
                  {p.n}
                </span>
                <h3 className="text-base font-medium text-fg-primary">{p.name}</h3>
              </div>
              <ValueSignal level={p.signal} />
              <p className="text-xs text-fg-tertiary mt-3 leading-relaxed line-clamp-3">
                {p.problem}
              </p>
              <p className="font-mono text-2xs text-fg-primary mt-3 leading-relaxed">
                {p.benchmark}
              </p>
              <div className="mt-4">
                <Button size="sm" onClick={() => navigateTo(p.target)}>
                  Open
                </Button>
              </div>
            </PillarCard>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Portfolio at a Glance</Eyebrow>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {KPI.map((k) => (
            <button
              key={k.label}
              onClick={() => navigateTo(k.target)}
              className="text-left rounded-2xl border border-stroke-default bg-raised p-5 shadow-sm hover:border-stroke-active hover:bg-raised-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="type-label-md text-fg-quaternary mb-2.5">
                {k.label}
              </div>
              <div className="type-display-metric text-fg-primary">{k.value}</div>
              <div className="text-xs text-fg-tertiary mt-2.5">{k.note}</div>
              <div
                className="text-2xs mt-1 flex items-center gap-1"
                style={{ color: k.trendColor }}
              >
                {k.trend === "up" ? (
                  <AppIcon name="trendUp" size="xs" />
                ) : (
                  <AppIcon name="trendDown" size="xs" />
                )}{" "}
                {k.trendText}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>AI Agent Activity</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              p: "01" as const,
              name: "Regulatory Intelligence Agent",
              conf: 92,
              target: "agent-console" as const,
              btn: "Open Console",
              action: SEED_AUDIT_EVENTS.find((e) => e.actor === "Regulatory Intelligence Agent")
                ?.action,
            },
            {
              p: "02" as const,
              name: "HAQ Drafting Agent",
              conf: 88,
              target: "haq-drafts" as const,
              btn: "View Drafts",
              action: SEED_AUDIT_EVENTS.find((e) => e.actor === "Query Risk Agent")?.action,
            },
            {
              p: "03" as const,
              name: "Compliance Validator",
              conf: 74,
              target: "validation-reports" as const,
              btn: "View Reports",
              action: SEED_AUDIT_EVENTS.find((e) => e.actor === "Compliance Validator")?.action,
            },
            {
              p: "04" as const,
              name: "Cascade Agent",
              conf: 94,
              target: "heatmap" as const,
              btn: "View Simulation",
              action: SEED_AUDIT_EVENTS.find((e) => e.actor === "Cascade Agent")?.action,
            },
          ].map((a) => (
            <AgentCard key={a.name} pillar={a.p}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <h4 className="text-sm font-medium text-fg-primary">{a.name}</h4>
                <ConfidencePill value={a.conf} pillar={a.p} />
              </div>
              <p className="text-xs text-fg-tertiary leading-relaxed line-clamp-4 mb-3">
                {a.action}
              </p>
              <Button variant="secondary" size="sm" onClick={() => navigateTo(a.target)}>
                {a.btn}
              </Button>
            </AgentCard>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <Eyebrow>Change Activity, Last 6 Months</Eyebrow>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANGE_ACTIVITY_BY_MONTH}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-muted)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--fg-quaternary)" fontSize={11} />
                <YAxis stroke="var(--fg-quaternary)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--stroke-default)", boxShadow: "var(--elevation-popover)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Simulated" stackId="a" fill="var(--pillar-04)" />
                <Bar dataKey="Classified" stackId="a" fill="var(--pillar-01)" />
                <Bar dataKey="Filed" stackId="a" fill="var(--pillar-02)" />
                <Bar dataKey="Approved" stackId="a" fill="var(--feedback-success-icon)" />
                <Bar dataKey="Overdue" stackId="a" fill="var(--feedback-error-icon)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <Eyebrow>Recent Platform Activity</Eyebrow>
          <ul className="space-y-3">
            {SEED_AUDIT_EVENTS.slice(0, 5).map((e, i) => {
              const color =
                e.actorType === "agent"
                  ? "var(--pillar-02)"
                  : e.actorType === "user"
                    ? "var(--feedback-success-icon)"
                    : "var(--feedback-info-icon)";
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-fg-primary truncate">
                        {e.actor}
                      </span>
                      <span className="font-mono text-3xs text-fg-tertiary shrink-0">
                        {e.timestamp.split(" ")[1] || ""}
                      </span>
                    </div>
                    <p className="text-xs text-fg-tertiary line-clamp-1">{e.action}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={() => navigateTo("audit")}>
              View Full Audit Trail
            </Button>
          </div>
        </Card>
      </section>

      <Card className="flex items-start gap-3" style={{ borderLeft: "3px solid var(--pillar-02)" }}>
        <AppIcon name="error" className="mt-0.5 shrink-0 text-pillar-02" />
        <p className="text-xs text-fg-tertiary">
          Built by Wayam AI. Niyo360 is a pre-sales proof-of-concept demonstrating four AI
          accelerators working alongside Veeva Vault RIM. All data shown is illustrative.
        </p>
      </Card>
    </div>
  );
}

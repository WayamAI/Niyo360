import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader, SectionHeader, Field } from "@/components/shared/Page";
import { KpiRow, KpiTile, Panel } from "@/components/shared/Panel";
import { Badge, badgeForRisk, badgeForVariation } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Drawer } from "@/components/shared/Drawer";
import { AgentCard } from "@/components/shared/Card";
import { ConfidencePill } from "@/components/shared/Atoms";
import { FilterBar, FilterSelect } from "@/components/shared/Filters";
import { EmptyState, NoResultsState } from "@/components/shared/States";
import { CHANGES, MARKET_IMPACT_CHG_0047 } from "@/data/mockData";

type Market = (typeof MARKET_IMPACT_CHG_0047)[number];

const ZONES = ["All", "EU/EEA", "Americas", "Asia Pacific", "MEA", "Eastern Europe"] as const;
const RISKS = ["All", "High", "Medium", "Low"] as const;

/**
 * Only CHG-2025-0047 has a simulated market cascade in this dataset. The
 * previous version let the change selector switch the page title while always
 * rendering CHG-2025-0047's markets underneath, so every change appeared to
 * have produced the same 30 results.
 */
const SIMULATED_CHANGE_ID = "CHG-2025-0047";

const VARIATION_COLORS = [
  "var(--feedback-error-icon)",
  "var(--feedback-warning-icon)",
  "var(--feedback-success-icon)",
  "var(--feedback-info-icon)",
  "var(--pillar-02)",
];

export function MarketHeatmap() {
  const { showToast, logAudit, selectedChangeId, setSelectedChangeId, navigateTo } = useApp();
  const [zone, setZone] = useState<(typeof ZONES)[number]>("All");
  const [risk, setRisk] = useState<(typeof RISKS)[number]>("All");
  const [open, setOpen] = useState<Market | null>(null);

  const change = CHANGES.find((item) => item.id === selectedChangeId) ?? CHANGES[0];
  const hasSimulation = change.id === SIMULATED_CHANGE_ID;
  // Memoised so the empty-array branch does not produce a new reference on
  // every render and invalidate every downstream useMemo.
  const source = useMemo<Market[]>(
    () => (hasSimulation ? MARKET_IMPACT_CHG_0047 : []),
    [hasSimulation],
  );

  const markets = useMemo(
    () =>
      source.filter(
        (market) =>
          (zone === "All" || market.zone === zone) &&
          (risk === "All" || market.haQueryRisk === risk),
      ),
    [source, zone, risk],
  );

  const grouped = useMemo(() => {
    const byZone: Record<string, Market[]> = {};
    for (const market of markets) (byZone[market.zone] ??= []).push(market);
    return byZone;
  }, [markets]);

  const variationData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const market of source)
      counts[market.variationType] = (counts[market.variationType] ?? 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [source]);

  const zoneData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const market of source) counts[market.zone] = (counts[market.zone] ?? 0) + 1;
    return Object.entries(counts).map(([name, count]) => ({ zone: name, count }));
  }, [source]);

  const highRisk = source.filter((market) => market.haQueryRisk === "High").length;
  const activeFilters = [zone, risk].filter((value) => value !== "All").length;

  // Filing window derived from the deadlines actually present, rather than the
  // fixed "4 to 18mo" the page used to print.
  const filingWindow = useMemo(() => {
    if (!source.length) return "—";
    const dates = source.map((market) => new Date(market.filingDeadline).getTime()).sort();
    const monthsFrom = (value: number) =>
      Math.max(0, Math.round((value - new Date("2025-05-22").getTime()) / (30.44 * 864e5)));
    const first = monthsFrom(dates[0]);
    const last = monthsFrom(dates[dates.length - 1]);
    return first === last ? `${first}mo` : `${first}–${last}mo`;
  }, [source]);

  return (
    <>
      <PageHeader
        title="Market Impact Heatmap"
        description={`${change.id} · ${change.title}`}
        breadcrumb={[
          { label: "Change Simulator", onClick: () => navigateTo("simulator") },
          { label: "Market Heatmap" },
        ]}
        badges={<Badge variant="pillar-04">Pillar 04</Badge>}
        actions={
          <label className="flex items-center gap-2">
            <span className="type-label-sm text-fg-quaternary">Change</span>
            <select
              value={change.id}
              onChange={(event) => setSelectedChangeId(event.target.value)}
              className="type-body-md h-8 rounded-md border border-stroke-default bg-action px-2.5 font-mono text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {CHANGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <PageBody className="gap-4">
        {!hasSimulation ? (
          <Panel>
            <EmptyState
              icon="simulator"
              title={`${change.id} has not been simulated`}
              detail="No market cascade has been generated for this change yet. Run the simulation to map its filing obligations."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedChangeId(SIMULATED_CHANGE_ID)}
                  >
                    View {SIMULATED_CHANGE_ID}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => showToast(`Simulation queued for ${change.id}.`, "success")}
                  >
                    Run simulation
                  </Button>
                </div>
              }
            />
          </Panel>
        ) : (
          <>
            <KpiRow>
              <KpiTile
                label="Markets mapped"
                value={source.length}
                note={`of ${change.affectedMarkets} in scope`}
              />
              <KpiTile
                label="High HA query risk"
                value={highRisk}
                note="Based on prior correspondence"
                tone={highRisk > 0 ? "warning" : "neutral"}
              />
              <KpiTile label="Filing window" value={filingWindow} note="From today" />
              <KpiTile label="Cascade confidence" value="94%" tone="success" />
            </KpiRow>

            <AgentCard pillar="04">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="type-heading-sm text-fg-primary">Cascade Agent</span>
                <ConfidencePill value={94} pillar="04" />
              </div>
              <p className="type-body-lg text-fg-primary">
                The proposed manufacturing site addition triggers variation obligations in{" "}
                {source.length} mapped markets. The recommended filing sequence is EU Centralised
                first (12 to 18 month review), Japan PMDA in parallel (estimated 14 months), then
                Brazil ANVISA once GMP renewal completes. {highRisk} markets carry a high HA query
                risk based on historical correspondence.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    showToast("Cascade recommendation accepted.", "success");
                    logAudit({
                      actor: "Regulatory Operations",
                      actorType: "user",
                      pillar: "04",
                      action: "Accepted Cascade Agent recommendation",
                    });
                  }}
                >
                  Accept recommendation
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => showToast("Flagged for senior review.")}
                >
                  Flag for review
                </Button>
              </div>
            </AgentCard>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
              <div className="flex min-w-0 flex-col gap-4">
                <FilterBar
                  activeCount={activeFilters}
                  onClear={() => {
                    setZone("All");
                    setRisk("All");
                  }}
                >
                  <FilterSelect label="Zone" value={zone} onChange={setZone} options={ZONES} />
                  <FilterSelect label="Risk" value={risk} onChange={setRisk} options={RISKS} />
                  <span className="type-body-md tabular text-fg-tertiary">
                    {markets.length} of {source.length} markets
                  </span>
                </FilterBar>

                {markets.length === 0 ? (
                  <Panel>
                    <NoResultsState
                      onClear={() => {
                        setZone("All");
                        setRisk("All");
                      }}
                    />
                  </Panel>
                ) : (
                  Object.entries(grouped).map(([zoneName, list]) => (
                    <section key={zoneName}>
                      <SectionHeader title={`${zoneName} · ${list.length} markets`} />
                      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((market) => (
                          <li key={market.market}>
                            <button
                              type="button"
                              onClick={() => {
                                setOpen(market);
                                logAudit({
                                  actor: "Regulatory Operations",
                                  actorType: "user",
                                  pillar: "04",
                                  action: `Opened market detail: ${market.market}`,
                                });
                              }}
                              className="w-full rounded-lg border border-stroke-default bg-container p-3 text-left transition-colors duration-150 hover:border-stroke-active hover:bg-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                              style={{ borderLeft: "2px solid var(--pillar-04)" }}
                            >
                              <span className="mb-1 flex items-center justify-between gap-2">
                                <span className="type-heading-sm min-w-0 truncate text-fg-primary">
                                  {market.market}
                                </span>
                                <Badge variant={badgeForRisk(market.haQueryRisk)}>
                                  {market.haQueryRisk}
                                </Badge>
                              </span>
                              <span className="type-caption block text-fg-quaternary">
                                {market.authority}
                              </span>
                              <span className="mt-1.5 flex items-center justify-between gap-2">
                                <Badge variant={badgeForVariation(market.variationType)}>
                                  {market.variationType}
                                </Badge>
                                <span className="type-caption tabular font-mono text-fg-quaternary">
                                  {market.filingDeadline}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))
                )}
              </div>

              <aside className="flex min-w-0 flex-col gap-3">
                <Panel title="Variation mix">
                  <div className="h-[170px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={variationData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={34}
                          outerRadius={64}
                          stroke="var(--surface-container)"
                          strokeWidth={2}
                        >
                          {variationData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={VARIATION_COLORS[index % VARIATION_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface-raised)",
                            border: "1px solid var(--stroke-default)",
                            boxShadow: "var(--elevation-popover)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--fg-primary)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {variationData.map((entry) => (
                      <li key={entry.name}>
                        <Badge variant={badgeForVariation(entry.name)}>
                          {entry.name} · {entry.value}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Panel title="Zone distribution">
                  <div className="h-[170px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={zoneData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <XAxis
                          dataKey="zone"
                          stroke="var(--fg-quaternary)"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value: string) => value.split(" ")[0]}
                        />
                        <YAxis
                          stroke="var(--fg-quaternary)"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          width={22}
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
                          cursor={{ fill: "color-mix(in oklab, var(--pillar-04) 8%, transparent)" }}
                        />
                        <Bar dataKey="count" fill="var(--pillar-04)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </aside>
            </div>
          </>
        )}
      </PageBody>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.market ?? ""}
        subtitle={open ? `${open.authority} · ${open.zone}` : undefined}
        width={500}
        footer={
          open ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  showToast(`Filing task created for ${open.market}.`, "success");
                  setOpen(null);
                }}
              >
                Create filing task
              </Button>
            </>
          ) : undefined
        }
      >
        {open && (
          <>
            <dl className="grid grid-cols-2 gap-3">
              <Field label="Variation type">{open.variationType}</Field>
              <Field label="Filing deadline" mono>
                {open.filingDeadline}
              </Field>
              <Field label="HA query risk">
                {open.haQueryRisk} ({open.riskScore})
              </Field>
              <Field label="Registration">{open.registrationStatus}</Field>
              <Field label="Approval year" mono>
                {open.approvalYear}
              </Field>
              <Field label="Prior correspondence" mono>
                {open.priorHACorrespondenceCount}
              </Field>
            </dl>

            <AgentCard pillar="04">
              <span className="type-heading-sm text-fg-primary">HA query prediction</span>
              <p className="type-body-md mt-1.5 text-fg-tertiary">
                Based on {open.priorHACorrespondenceCount} prior correspondence records, the{" "}
                {open.authority} is likely to request additional comparability batch data and
                analytical method bridging. Estimated review timeline:{" "}
                {open.zone === "EU/EEA"
                  ? "12 to 18 months"
                  : open.zone === "Asia Pacific"
                    ? "10 to 14 months"
                    : "6 to 10 months"}
                .
              </p>
            </AgentCard>

            <section>
              <SectionHeader title="Documentation requirements" />
              <ul className="type-body-md list-disc space-y-1 pl-4 text-fg-tertiary">
                <li>Updated Module 3.2.S.2.1, Manufacturer</li>
                <li>Comparability study report, three batches</li>
                <li>GMP certificate, valid scope</li>
                <li>Stability commitment letter</li>
              </ul>
            </section>
          </>
        )}
      </Drawer>
    </>
  );
}

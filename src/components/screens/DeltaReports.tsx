import { AppIcon } from "@/components/icons";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, Eyebrow } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import {
  FEED_EVENTS,
  AFFILIATE_BY_ID,
  REG_PRODUCT_BY_ID,
  MONTHLY_ACTIVITY,
} from "@/data/regulatoryData";
import {
  AuthorityBadge,
  FilingTypeBadge,
  StatusPill,
  DeadlineCountdown,
  ConfidenceRing,
} from "@/components/regulatory/atoms";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DeltaReports() {
  const { logAudit, showToast, navigateTo, setSelectedReportId } = useApp();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(
    () =>
      FEED_EVENTS.filter((e) => e.reportId).filter(
        (e) =>
          search === "" ||
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          (e.reportId ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const open = rows.filter((e) => e.status === "Under Review" || e.status === "Draft").length;
  const pending = rows.filter((e) => e.status === "Under Review").length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openReport = (reportId: string) => {
    setSelectedReportId(reportId);
    navigateTo("report-detail");
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "01",
      action: `Opened Impact Delta Report ${reportId}`,
    });
  };

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="type-display-page text-fg-primary">
            Impact Delta Reports
          </h1>
          <p className="text-sm text-fg-tertiary mt-1 max-w-3xl">
            RA specialist working queue. Each report maps an incoming guideline against the active
            product–market portfolio with the eleven structured impact fields.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-fg-tertiary">
          <span className="font-mono">
            <b className="text-fg-primary">{open}</b> open
          </span>
          <span className="opacity-50">·</span>
          <span className="font-mono">
            <b className="text-fg-primary">{pending}</b> pending review
          </span>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <AppIcon name="search" size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by title or ID…"
              className="w-full h-8 rounded-md bg-action border border-stroke-muted pl-8 pr-3 text-xs text-fg-primary placeholder:text-fg-quaternary transition-colors duration-200 hover:border-stroke-default focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelected(new Set());
              setSearch("");
            }}
          >
            Clear filters
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showToast("Reports exported to PDF.", "success")}
          >
            <AppIcon name="download" size="sm" /> Export
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <Eyebrow className="!mb-0">Change Activity, Last 6 Months</Eyebrow>
            <p className="text-2xs text-fg-tertiary mt-1">
              Monthly volume of new feed events, generated reports, filings, and closures across all
              authorities.
            </p>
          </div>
          <div className="flex items-center gap-3 text-2xs text-fg-tertiary">
            <ChartLegendSwatch color="var(--pillar-01)" label="New events" />
            <ChartLegendSwatch color="var(--pillar-02)" label="Reports" />
            <ChartLegendSwatch color="var(--data-accent)" label="Filed" />
            <ChartLegendSwatch color="var(--fg-tertiary)" label="Closed" />
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_ACTIVITY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-muted)" vertical={false} />
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
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--stroke-default)", boxShadow: "var(--elevation-popover)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--fg-tertiary)" }}
                cursor={{ fill: "color-mix(in oklab, var(--pillar-01) 5%, transparent)" }}
              />
              <Legend wrapperStyle={{ display: "none" }} />
              <Bar
                dataKey="newEvents"
                name="New events"
                fill="var(--pillar-01)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="reportsGenerated"
                name="Reports generated"
                fill="var(--pillar-02)"
                radius={[3, 3, 0, 0]}
              />
              <Bar dataKey="filed" name="Filed" fill="var(--data-accent)" radius={[3, 3, 0, 0]} />
              <Bar
                dataKey="closed"
                name="Closed"
                fill="var(--fg-tertiary)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {selected.size > 0 && (
        <Card
          className="flex items-center justify-between gap-3 py-3"
          style={{ background: "color-mix(in oklab, var(--pillar-01) 6%, var(--surface-raised))" }}
        >
          <span className="text-xs font-medium text-fg-primary">
            {selected.size} report{selected.size === 1 ? "" : "s"} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => showToast("Affiliate assignment dialog opened.")}
            >
              Assign Affiliate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => showToast(`${selected.size} reports exported.`, "success")}
            >
              Export PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                showToast(`${selected.size} reports marked reviewed.`, "success");
                setSelected(new Set());
              }}
            >
              <AppIcon name="success" size="sm" /> Mark Reviewed
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-action text-fg-quaternary type-label-md sticky top-0 z-10">
                <th className="w-8 px-3 py-3"></th>
                <th className="text-left px-4 py-3 font-medium">Report ID</th>
                <th className="text-left px-4 py-3 font-medium">Authority</th>
                <th className="text-left px-4 py-3 font-medium">Guideline</th>
                <th className="text-left px-4 py-3 font-medium">Products</th>
                <th className="text-left px-4 py-3 font-medium">Markets</th>
                <th className="text-left px-4 py-3 font-medium">Filing</th>
                <th className="text-left px-4 py-3 font-medium">Deadline</th>
                <th className="text-left px-4 py-3 font-medium">Affiliate</th>
                <th className="text-center px-4 py-3 font-medium">Conf.</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const aff = AFFILIATE_BY_ID(e.responsibleAffiliate);
                return (
                  <tr
                    key={e.id}
                    className="border-t border-stroke-muted transition-colors duration-200 hover:bg-raised-2 cursor-pointer"
                    onClick={() => openReport(e.reportId!)}
                  >
                    <td className="px-3 py-3" onClick={(ev) => ev.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(e.reportId!)}
                        onChange={() => toggle(e.reportId!)}
                        className="accent-[color:var(--pillar-01)]"
                      />
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-2xs"
                      style={{ color: "var(--pillar-01)" }}
                    >
                      {e.reportId}
                    </td>
                    <td className="px-4 py-3">
                      <AuthorityBadge code={e.authority} />
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      <div className="text-fg-primary line-clamp-2">{e.title}</div>
                    </td>
                    <td className="px-4 py-3 text-fg-tertiary">
                      {e.affectedProductIds.length === 0 ? (
                        "—"
                      ) : (
                        <span
                          title={e.affectedProductIds
                            .map((id) => REG_PRODUCT_BY_ID(id)?.name)
                            .join(", ")}
                        >
                          {e.affectedProductIds.length} product
                          {e.affectedProductIds.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-2xs text-fg-tertiary">
                      {e.affectedMarkets.join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <FilingTypeBadge type={e.filingType} />
                    </td>
                    <td className="px-4 py-3">
                      <DeadlineCountdown date={e.deadlineDate} />
                    </td>
                    <td className="px-4 py-3">
                      {aff ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full grid place-items-center text-3xs font-medium"
                            style={{
                              background: "color-mix(in oklab, var(--pillar-01) 14%, transparent)",
                              color: "var(--pillar-01)",
                            }}
                          >
                            {aff.initials}
                          </span>
                          <span className="text-2xs text-fg-tertiary">{aff.region}</span>
                        </div>
                      ) : (
                        <span className="text-fg-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <ConfidenceRing value={e.confidenceScore} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={e.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ChartLegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

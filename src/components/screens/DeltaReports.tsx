import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { Panel } from "@/components/shared/Panel";
import { Button } from "@/components/shared/Button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  AFFILIATE_BY_ID,
  FEED_EVENTS,
  MONTHLY_ACTIVITY,
  REG_PRODUCT_BY_ID,
  type FeedEvent,
} from "@/data/regulatoryData";
import {
  AuthorityBadge,
  ConfidenceRing,
  DeadlineCountdown,
  FilingTypeBadge,
  StatusPill,
} from "@/components/regulatory/atoms";

const SERIES = [
  { key: "newEvents", label: "New events", color: "var(--pillar-01)" },
  { key: "reportsGenerated", label: "Reports", color: "var(--pillar-02)" },
  { key: "filed", label: "Filed", color: "var(--data-accent)" },
  { key: "closed", label: "Closed", color: "var(--fg-quaternary)" },
];

export function DeltaReports() {
  const { logAudit, showToast, navigateTo, setSelectedReportId, selectedReportId } = useApp();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => FEED_EVENTS.filter((event) => event.reportId), []);

  const open = rows.filter(
    (event) => event.status === "Under Review" || event.status === "Draft",
  ).length;
  const pending = rows.filter((event) => event.status === "Under Review").length;

  function openReport(event: FeedEvent) {
    setSelectedReportId(event.reportId!);
    navigateTo("report-detail");
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "01",
      action: `Opened Impact Delta Report ${event.reportId}`,
    });
  }

  const columns: Column<FeedEvent>[] = [
    {
      key: "reportId",
      header: "Report",
      card: "title",
      value: (event) => event.reportId,
      render: (event) => (
        <span className="font-mono text-[color:var(--pillar-01)]">{event.reportId}</span>
      ),
    },
    {
      key: "authority",
      header: "Authority",
      value: (event) => event.authority,
      render: (event) => <AuthorityBadge code={event.authority} />,
    },
    {
      key: "guideline",
      header: "Guideline",
      value: (event) => event.title,
      render: (event) => (
        <span className="line-clamp-2 max-w-[34ch] text-fg-primary" title={event.title}>
          {event.title}
        </span>
      ),
    },
    {
      key: "products",
      header: "Products",
      hide: "lg",
      value: (event) => event.affectedProductIds.length,
      render: (event) =>
        event.affectedProductIds.length === 0 ? (
          <span className="text-fg-quaternary">—</span>
        ) : (
          <span
            className="text-fg-tertiary"
            title={event.affectedProductIds
              .map((id) => REG_PRODUCT_BY_ID(id)?.name)
              .filter(Boolean)
              .join(", ")}
          >
            {event.affectedProductIds.length}
          </span>
        ),
    },
    {
      key: "markets",
      header: "Markets",
      hide: "lg",
      value: (event) => event.affectedMarkets.join(" "),
      render: (event) => (
        <span className="font-mono text-fg-tertiary">
          {event.affectedMarkets.join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "filing",
      header: "Filing",
      value: (event) => event.filingType,
      render: (event) => <FilingTypeBadge type={event.filingType} />,
    },
    {
      key: "deadline",
      header: "Deadline",
      value: (event) => event.deadlineDate,
      render: (event) => <DeadlineCountdown date={event.deadlineDate} />,
    },
    {
      key: "affiliate",
      header: "Affiliate",
      hide: "md",
      value: (event) => AFFILIATE_BY_ID(event.responsibleAffiliate)?.region ?? null,
      render: (event) => {
        const affiliate = AFFILIATE_BY_ID(event.responsibleAffiliate);
        if (!affiliate) return <span className="text-fg-quaternary">Unassigned</span>;
        return (
          <span className="flex items-center gap-2">
            <span
              className="type-caption grid size-5 shrink-0 place-items-center rounded-full font-medium"
              style={{
                background: "color-mix(in oklab, var(--pillar-01) 14%, transparent)",
                color: "var(--pillar-01)",
              }}
              aria-hidden="true"
            >
              {affiliate.initials}
            </span>
            <span className="text-fg-tertiary">{affiliate.region}</span>
          </span>
        );
      },
    },
    {
      key: "confidence",
      header: "Conf.",
      align: "center",
      hide: "lg",
      value: (event) => event.confidenceScore,
      render: (event) => (
        <span className="flex justify-center">
          <ConfidenceRing value={event.confidenceScore} size={30} />
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (event) => event.status,
      render: (event) => <StatusPill status={event.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Impact Delta Reports"
        source="illustrative"
        description="The RA specialist working queue. Each report maps an incoming guideline to the active product–market portfolio across eleven structured impact fields."
        breadcrumb={[{ label: "Change Intelligence" }, { label: "Impact Delta Reports" }]}
        actions={
          <span className="type-body-md tabular text-fg-tertiary">
            <b className="text-fg-primary">{open}</b> open ·{" "}
            <b className="text-fg-primary">{pending}</b> pending review
          </span>
        }
      />

      <PageBody className="gap-4">
        <Panel
          title="Change activity, last 6 months"
          description="Monthly volume of new feed events, generated reports, filings and closures."
          action={
            <div className="type-caption flex flex-wrap items-center gap-2.5 text-fg-tertiary">
              {SERIES.map((series) => (
                <span key={series.key} className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-xs"
                    style={{ background: series.color }}
                  />
                  {series.label}
                </span>
              ))}
            </div>
          }
        >
          <div className="h-[200px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_ACTIVITY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
                {SERIES.map((series) => (
                  <Bar
                    key={series.key}
                    dataKey={series.key}
                    name={series.label}
                    fill={series.color}
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {selected.size > 0 && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stroke-default px-3.5 py-2.5"
            style={{
              background: "color-mix(in oklab, var(--pillar-01) 6%, var(--surface-container))",
            }}
          >
            <span className="type-body-md font-medium text-fg-primary">
              {selected.size} report{selected.size === 1 ? "" : "s"} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                Clear selection
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  showToast(
                    `${selected.size} report${selected.size === 1 ? "" : "s"} marked reviewed.`,
                    "success",
                  );
                  setSelected(new Set());
                }}
              >
                <AppIcon name="success" size="sm" /> Mark reviewed
              </Button>
            </div>
          </div>
        )}

        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(event) => event.reportId!}
          onRowOpen={openReport}
          isRowActive={(event) => event.reportId === selectedReportId}
          selectable
          selectedKeys={selected}
          onSelectedKeysChange={setSelected}
          searchPlaceholder="Search reports by guideline or ID"
          getSearchText={(event) => `${event.reportId} ${event.title}`}
          exportName="impact-delta-reports"
          emptyTitle="No reports generated yet"
          emptyDetail="Reports appear here once the Intelligence Agent has mapped a feed event to the portfolio."
          emptyAction={
            <Button variant="secondary" size="sm" onClick={() => navigateTo("feed-monitor")}>
              Open Feed Monitor
            </Button>
          }
        />
      </PageBody>
    </>
  );
}

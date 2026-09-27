import { useMemo, useState } from "react";
import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { KpiRow, KpiTile, Panel } from "@/components/shared/Panel";
import { Button } from "@/components/shared/Button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { FilterBar, FilterSelect } from "@/components/shared/Filters";
import {
  FEED_EVENTS,
  FEED_KPIS,
  type AuthorityCode,
  type FeedEvent,
  type FilingType,
} from "@/data/regulatoryData";
import {
  AuthorityBadge,
  ConfidenceRing,
  DeadlineCountdown,
  FilingTypeBadge,
  StatusPill,
} from "@/components/regulatory/atoms";

const AUTHORITIES = ["All", "FDA", "EMA", "MHRA", "CDSCO", "TGA", "ANVISA"] as const;
const STATUSES = [
  "All",
  "Detected",
  "Processing",
  "Mapped",
  "Under Review",
  "Approved",
  "Filed",
  "Closed",
  "No Action",
] as const;
const FILINGS = ["All", "IA", "IB", "II", "NDA", "None", "TBD"] as const;

export function FeedMonitor() {
  const { logAudit, showToast, navigateTo, setSelectedReportId } = useApp();
  const [authority, setAuthority] = useState<(typeof AUTHORITIES)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [filing, setFiling] = useState<(typeof FILINGS)[number]>("All");

  const rows = useMemo(
    () =>
      FEED_EVENTS.filter(
        (event) =>
          (authority === "All" || event.authority === (authority as AuthorityCode)) &&
          (status === "All" || event.status === status) &&
          (filing === "All" || event.filingType === (filing as FilingType)),
      ),
    [authority, status, filing],
  );

  const activeFilters = [authority, status, filing].filter((value) => value !== "All").length;

  function clearFilters() {
    setAuthority("All");
    setStatus("All");
    setFiling("All");
  }

  function openReport(event: FeedEvent) {
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "01",
      action: `Opened feed event ${event.id}`,
    });
    if (event.reportId) {
      setSelectedReportId(event.reportId);
      navigateTo("report-detail");
    } else {
      showToast(
        `No Impact Delta Report yet for ${event.id} — the agent has not finished mapping it.`,
        "warning",
      );
    }
  }

  const columns: Column<FeedEvent>[] = [
    {
      key: "id",
      header: "Event",
      card: "title",
      value: (event) => event.id,
      render: (event) => (
        <span className="flex items-center gap-1.5">
          {event.urgencyFlag && (
            <AppIcon name="warning" size="xs" className="text-error-icon" aria-label="Urgent" />
          )}
          <span className="font-mono text-[color:var(--pillar-01)]">{event.id}</span>
        </span>
      ),
    },
    {
      key: "authority",
      header: "Authority",
      value: (event) => event.authority,
      render: (event) => <AuthorityBadge code={event.authority} />,
    },
    {
      key: "published",
      header: "Published",
      hide: "md",
      value: (event) => event.publishedDate,
      render: (event) => (
        <span className="tabular font-mono text-fg-tertiary">{event.publishedDate}</span>
      ),
    },
    {
      key: "title",
      header: "Guideline",
      value: (event) => event.title,
      render: (event) => (
        <span className="line-clamp-2 max-w-[38ch] text-fg-primary" title={event.title}>
          {event.title}
        </span>
      ),
    },
    {
      key: "status",
      header: "Stage",
      value: (event) => event.status,
      render: (event) => <StatusPill status={event.status} />,
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
      key: "actions",
      header: "",
      card: false,
      render: (event) => (
        <span className="flex items-center gap-0.5">
          <RowAction label="Open report" icon="view" onClick={() => openReport(event)} />
          <RowAction
            label="Reassign"
            icon="assign"
            onClick={() => showToast(`Reassignment for ${event.id} is not wired in this build.`)}
          />
          <RowAction
            label="Flag for follow-up"
            icon="flag"
            onClick={() => showToast(`${event.id} flagged for follow-up.`, "warning")}
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Regulatory Feed Monitor"
        description="Every event ingested from the FDA, EMA, MHRA, CDSCO, TGA and ANVISA feeds, mapped against the active product–market portfolio."
        breadcrumb={[{ label: "Change Intelligence" }, { label: "Feed Monitor" }]}
        actions={
          <>
            <span className="type-body-md tabular font-mono text-fg-tertiary">
              Synced {FEED_KPIS.lastSyncMinutesAgo} min ago
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => showToast("Feed refresh queued.", "success")}
            >
              <AppIcon name="refresh" size="sm" /> Refresh
            </Button>
          </>
        }
      />

      <PageBody className="gap-4">
        <KpiRow>
          <KpiTile
            label="New this week"
            value={FEED_KPIS.newThisWeek}
            note={`+${FEED_KPIS.newThisWeekDelta} vs last week`}
            tone="brand"
          />
          <KpiTile
            label="Processing now"
            value={FEED_KPIS.processingNow}
            note="Intelligence Agent running"
          />
          <KpiTile
            label="Reports generated"
            value={FEED_KPIS.reportsGenerated}
            note={`of ${FEED_KPIS.reportsGeneratedOfTotal} resolved`}
            tone="success"
          />
          <KpiTile
            label="Overdue or at risk"
            value={FEED_KPIS.overdueOrAtRisk}
            note="Deadline breach risk"
            tone={FEED_KPIS.overdueOrAtRisk > 0 ? "error" : "neutral"}
          />
        </KpiRow>

        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(event) => event.id}
          onRowOpen={openReport}
          searchPlaceholder="Search events by title or ID"
          getSearchText={(event) => `${event.id} ${event.title}`}
          exportName="regulatory-feed"
          emptyTitle="No events match these filters"
          emptyDetail="Widen the authority, stage or filing filter to see more of the feed."
          emptyAction={
            activeFilters > 0 ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
          toolbar={
            <FilterBar activeCount={activeFilters} onClear={clearFilters}>
              <FilterSelect
                label="Authority"
                value={authority}
                onChange={setAuthority}
                options={AUTHORITIES}
              />
              <FilterSelect label="Stage" value={status} onChange={setStatus} options={STATUSES} />
              <FilterSelect label="Filing" value={filing} onChange={setFiling} options={FILINGS} />
            </FilterBar>
          }
        />

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-md"
                style={{ background: "color-mix(in oklab, var(--pillar-02) 14%, transparent)" }}
              >
                <AppIcon name="agent" size="md" className="text-pillar-02" />
              </span>
              <div className="min-w-0">
                <div className="type-heading-sm text-fg-primary">Regulatory Intelligence Agent</div>
                <div className="type-body-sm tabular text-fg-tertiary">
                  {FEED_KPIS.avgConfidenceScore}% average confidence · {FEED_KPIS.agentItemsToday}{" "}
                  items today
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigateTo("agent-console")}>
              Open console
            </Button>
          </div>
        </Panel>
      </PageBody>
    </>
  );
}

/** Compact icon control for a table row. Labelled, because it is icon-only. */
function RowAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: "view" | "assign" | "flag";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="grid size-7 place-items-center rounded-md text-icon-tertiary transition-colors duration-150 hover:bg-action-tertiary-hover hover:text-icon-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <AppIcon name={icon} size="sm" />
    </button>
  );
}

import { Fragment, useMemo, useState } from "react";
import { AppIcon } from "@/components/icons";
import { useApp, type AuditEvent } from "@/context/AppContext";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { KpiRow, KpiTile, Panel } from "@/components/shared/Panel";
import { Badge } from "@/components/shared/Badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { FilterBar, FilterSelect } from "@/components/shared/Filters";

const ACTOR_TYPES = ["All", "User", "Agent", "System"] as const;
const PILLARS = ["All", "01", "02", "03", "04"] as const;

const TRACE_STEPS = [
  "Change entered",
  "Simulation complete",
  "Classification",
  "Validation",
  "Filing prepared",
];

export function AuditTrail() {
  const { auditLog, showToast } = useApp();
  const [actorType, setActorType] = useState<(typeof ACTOR_TYPES)[number]>("All");
  const [pillar, setPillar] = useState<(typeof PILLARS)[number]>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      auditLog.filter(
        (event) =>
          (actorType === "All" || event.actorType === actorType.toLowerCase()) &&
          (pillar === "All" || event.pillar === pillar),
      ),
    [auditLog, actorType, pillar],
  );

  const activeFilters = [actorType, pillar].filter((value) => value !== "All").length;
  const today = auditLog.filter((event) => event.timestamp.startsWith("2025-05-22")).length;
  const agentEvents = auditLog.filter((event) => event.actorType === "agent").length;
  const pillarsSeen = new Set(auditLog.map((event) => event.pillar).filter(Boolean)).size;

  const columns: Column<AuditEvent>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      card: "title",
      value: (event) => event.timestamp,
      render: (event) => (
        <span className="tabular font-mono text-fg-tertiary">{event.timestamp}</span>
      ),
    },
    {
      key: "actorType",
      header: "Type",
      value: (event) => event.actorType,
      render: (event) => (
        <Badge
          variant={
            event.actorType === "agent" ? "agent" : event.actorType === "user" ? "complete" : "open"
          }
        >
          {event.actorType}
        </Badge>
      ),
    },
    {
      key: "pillar",
      header: "Pillar",
      hide: "md",
      value: (event) => event.pillar ?? null,
      render: (event) =>
        event.pillar ? (
          <Badge variant={`pillar-${event.pillar}` as "pillar-01"}>{event.pillar}</Badge>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "actor",
      header: "Actor",
      value: (event) => event.actor,
      render: (event) => <span className="font-medium text-fg-primary">{event.actor}</span>,
    },
    {
      key: "action",
      header: "Action",
      value: (event) => event.action,
      render: (event) => (
        <span className="line-clamp-2 max-w-[60ch] text-fg-tertiary">{event.action}</span>
      ),
    },
    {
      key: "changeId",
      header: "Change",
      card: "meta",
      hide: "md",
      value: (event) => event.changeId ?? null,
      render: (event) =>
        event.changeId ? (
          <span className="font-mono text-brand">{event.changeId}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit Trail"
        description="End-to-end traceability across all four pillars. Every agent action, user action and system event is logged with a timestamp and entity reference."
        breadcrumb={[{ label: "Governance" }, { label: "Audit Trail" }]}
      />

      <PageBody className="gap-4">
        <KpiRow>
          <KpiTile label="Events logged" value={auditLog.length} note="This session" />
          <KpiTile label="Events today" value={today} note="22 May 2025" />
          <KpiTile label="Agent actions" value={agentEvents} tone="info" />
          <KpiTile label="Pillars active" value={pillarsSeen} note="Of four" />
        </KpiRow>

        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(event) => event.id}
          onRowOpen={(event) => setExpanded(expanded === event.id ? null : event.id)}
          isRowActive={(event) => event.id === expanded}
          defaultSort={{ key: "timestamp", dir: "desc" }}
          searchPlaceholder="Search by actor, action or change ID"
          getSearchText={(event) => `${event.actor} ${event.action} ${event.changeId ?? ""}`}
          exportName="audit-trail"
          emptyTitle="No events match these filters"
          emptyDetail="Widen the actor type or pillar filter to see more of the log."
          toolbar={
            <FilterBar
              activeCount={activeFilters}
              onClear={() => {
                setActorType("All");
                setPillar("All");
              }}
            >
              <FilterSelect
                label="Actor"
                value={actorType}
                onChange={setActorType}
                options={ACTOR_TYPES}
              />
              <FilterSelect label="Pillar" value={pillar} onChange={setPillar} options={PILLARS} />
            </FilterBar>
          }
        />

        {expanded && (
          <Panel title="Event detail">
            {(() => {
              const event = auditLog.find((item) => item.id === expanded);
              if (!event) return null;
              return (
                <div className="space-y-2">
                  <p className="type-body-lg text-fg-primary">{event.action}</p>
                  <p className="type-body-md tabular text-fg-tertiary">
                    <span className="font-mono">{event.timestamp}</span> · {event.actor}
                    {event.changeId && (
                      <>
                        {" · "}
                        <span className="font-mono text-brand">{event.changeId}</span>
                      </>
                    )}
                  </p>
                </div>
              );
            })()}
          </Panel>
        )}

        <Panel
          title="Traceability chain, CHG-2025-0047"
          description="The audited path a change takes from entry to filing."
          action={
            <button
              type="button"
              onClick={() => showToast("Audit report exported.", "success")}
              className="type-body-md inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-fg-tertiary transition-colors duration-150 hover:bg-action-tertiary-hover hover:text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <AppIcon name="download" size="sm" /> Export report
            </button>
          }
        >
          <ol className="flex flex-wrap items-center gap-2">
            {TRACE_STEPS.map((step, index) => (
              <Fragment key={step}>
                <li className="rounded-md border border-stroke-muted bg-action px-2.5 py-1.5">
                  <span className="type-caption tabular block font-mono text-fg-quaternary">
                    Step {index + 1}
                  </span>
                  <span className="type-body-md block font-medium text-fg-primary">{step}</span>
                </li>
                {index < TRACE_STEPS.length - 1 && (
                  <AppIcon
                    name="arrowRight"
                    size="sm"
                    className="text-icon-quaternary"
                    aria-hidden
                  />
                )}
              </Fragment>
            ))}
          </ol>
        </Panel>
      </PageBody>
    </>
  );
}

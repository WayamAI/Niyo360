import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader, Field } from "@/components/shared/Page";
import { KpiRow, KpiTile } from "@/components/shared/Panel";
import { Badge, badgeForRisk, badgeForStatus } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Drawer } from "@/components/shared/Drawer";
import { ESCALATIONS } from "@/data/mockData";

type Escalation = (typeof ESCALATIONS)[number];

/** Under a week is red, under three weeks amber, otherwise on track. */
function slaColor(days: number): string {
  if (days < 7) return "var(--feedback-error-icon)";
  if (days < 21) return "var(--feedback-warning-icon)";
  return "var(--feedback-success-icon)";
}

export function Escalations() {
  const { showToast, logAudit, resolveEscalation, resolvedEscalations } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? (ESCALATIONS.find((item) => item.id === openId) ?? null) : null;

  const isResolved = (item: Escalation) => resolvedEscalations.has(item.id);
  const openItems = ESCALATIONS.filter((item) => !isResolved(item));

  const critical = openItems.filter((item) => item.severity === "Critical").length;
  const high = openItems.filter((item) => item.severity === "High").length;
  const inProgress = openItems.filter((item) => item.status === "In Progress").length;

  function resolve(item: Escalation) {
    resolveEscalation(item.id);
    showToast(`${item.id} resolved.`, "success");
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: item.pillar,
      action: `Resolved escalation ${item.id}`,
    });
  }

  const columns: Column<Escalation>[] = [
    {
      key: "id",
      header: "ID",
      card: "title",
      value: (item) => item.id,
      render: (item) => <span className="font-mono text-brand">{item.id}</span>,
    },
    {
      key: "severity",
      header: "Severity",
      value: (item) => item.severity,
      render: (item) => <Badge variant={badgeForRisk(item.severity)}>{item.severity}</Badge>,
    },
    {
      key: "pillar",
      header: "Pillar",
      hide: "md",
      value: (item) => item.pillar,
      render: (item) => (
        <Badge variant={`pillar-${item.pillar}` as "pillar-01"}>P{item.pillar}</Badge>
      ),
    },
    {
      key: "subject",
      header: "Product / market",
      value: (item) => `${item.productName} ${item.market}`,
      render: (item) => (
        <span className="block min-w-0">
          <span className="block truncate font-medium text-fg-primary">{item.productName}</span>
          <span className="type-caption block truncate text-fg-quaternary">{item.market}</span>
        </span>
      ),
    },
    {
      key: "issueType",
      header: "Issue",
      hide: "md",
      value: (item) => item.issueType,
      render: (item) => <span className="text-fg-tertiary">{item.issueType}</span>,
    },
    {
      key: "summary",
      header: "Summary",
      hide: "lg",
      value: (item) => item.issue,
      render: (item) => (
        <span className="line-clamp-2 max-w-[38ch] text-fg-tertiary">{item.issue}</span>
      ),
    },
    {
      key: "sla",
      header: "SLA days",
      align: "right",
      value: (item) => item.slaDaysRemaining,
      render: (item) => (
        <span
          className="tabular font-mono font-medium"
          style={{
            color: isResolved(item) ? "var(--fg-quaternary)" : slaColor(item.slaDaysRemaining),
          }}
        >
          {item.slaDaysRemaining}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (item) => (isResolved(item) ? "Resolved" : item.status),
      render: (item) =>
        isResolved(item) ? (
          <Badge variant="complete">Resolved</Badge>
        ) : (
          <Badge variant={badgeForStatus(item.status)}>{item.status}</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      card: false,
      render: (item) => (
        <span className="flex justify-end gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => setOpenId(item.id)}>
            View
          </Button>
          {!isResolved(item) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                resolve(item);
              }}
            >
              Resolve
            </Button>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Escalations"
        description="Open items requiring regulatory affairs attention across all four capability pillars."
        breadcrumb={[{ label: "Governance" }, { label: "Escalations" }]}
        badges={
          <Badge variant={openItems.length > 0 ? "open" : "complete"}>
            {openItems.length} open
          </Badge>
        }
      />

      <PageBody className="gap-4">
        <KpiRow>
          <KpiTile
            label="Critical"
            value={critical}
            note="Open and unresolved"
            tone={critical > 0 ? "error" : "neutral"}
          />
          <KpiTile
            label="High"
            value={high}
            note="Open and unresolved"
            tone={high > 0 ? "warning" : "neutral"}
          />
          <KpiTile label="In progress" value={inProgress} tone="info" />
          <KpiTile
            label="Resolved"
            value={resolvedEscalations.size}
            note="This session"
            tone={resolvedEscalations.size > 0 ? "success" : "neutral"}
          />
        </KpiRow>

        <DataTable
          rows={ESCALATIONS}
          columns={columns}
          rowKey={(item) => item.id}
          onRowOpen={(item) => setOpenId(item.id)}
          isRowActive={(item) => item.id === openId}
          defaultSort={{ key: "sla", dir: "asc" }}
          searchPlaceholder="Search escalations by product, market or issue"
          getSearchText={(item) => `${item.id} ${item.issue}`}
          exportName="escalations"
          emptyTitle="No escalations raised"
          emptyDetail="Items raised by an agent or a specialist appear here."
        />
      </PageBody>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.id ?? ""}
        subtitle={open ? `${open.productName} · ${open.market}` : undefined}
        width={520}
        footer={
          open ? (
            <>
              <Button variant="ghost" onClick={() => setOpenId(null)}>
                Close
              </Button>
              <Button
                variant="secondary"
                onClick={() => showToast("Escalated to senior leadership.")}
              >
                Escalate further
              </Button>
              {!isResolved(open) && (
                <Button
                  onClick={() => {
                    resolve(open);
                    setOpenId(null);
                  }}
                >
                  Mark resolved
                </Button>
              )}
            </>
          ) : undefined
        }
      >
        {open && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={badgeForRisk(open.severity)}>{open.severity}</Badge>
              <Badge variant={`pillar-${open.pillar}` as "pillar-01"}>Pillar {open.pillar}</Badge>
              <Badge variant={isResolved(open) ? "complete" : badgeForStatus(open.status)}>
                {isResolved(open) ? "Resolved" : open.status}
              </Badge>
            </div>

            <p className="type-body-lg text-fg-primary">{open.issue}</p>

            <dl className="grid grid-cols-2 gap-3">
              <Field label="Raised by">{open.raisedBy}</Field>
              <Field label="SLA deadline" mono>
                {open.slaDeadline}
              </Field>
              <Field label="Days remaining" mono>
                {open.slaDaysRemaining}
              </Field>
              <Field label="Change" mono>
                {open.changeId}
              </Field>
            </dl>

            <label className="block">
              <span className="type-label-sm text-fg-quaternary">Assign to</span>
              <select
                className="type-body-md mt-1 h-8 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                defaultValue="Regulatory Operations Team"
              >
                {[
                  "Regulatory Operations Team",
                  "EU Regulatory Affairs Team",
                  "CMC Regulatory Team",
                  "Quality Assurance",
                ].map((team) => (
                  <option key={team}>{team}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="type-label-sm text-fg-quaternary">Notes</span>
              <textarea
                rows={3}
                placeholder="Add notes"
                className="type-body-md mt-1 w-full rounded-md border border-stroke-default bg-action px-2.5 py-2 text-fg-primary placeholder:text-fg-quaternary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </label>
          </>
        )}
      </Drawer>
    </>
  );
}

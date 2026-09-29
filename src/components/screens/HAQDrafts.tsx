import { useState } from "react";
import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader, SectionHeader } from "@/components/shared/Page";
import { KpiRow, KpiTile } from "@/components/shared/Panel";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Drawer } from "@/components/shared/Drawer";
import { AgentCard } from "@/components/shared/Card";
import { ConfidencePill, HumanInLoopBanner } from "@/components/shared/Atoms";
import { HAQ_DRAFTS, PRODUCT_BY_ID } from "@/data/mockData";

type HaqDraft = (typeof HAQ_DRAFTS)[number];

/** Shared by the Days column and the drawer subtitle. */
function urgencyColor(days: number): string {
  if (days < 14) return "var(--feedback-error-icon)";
  if (days < 30) return "var(--feedback-warning-icon)";
  return "var(--feedback-success-icon)";
}

export function HAQDrafts() {
  const { showToast, logAudit } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? (HAQ_DRAFTS.find((draft) => draft.id === openId) ?? null) : null;

  // Derived, not asserted: the previous version carried "4 / 2 / 1 / 1" as
  // literals, so the tiles could not follow the data they sat above.
  const ready = HAQ_DRAFTS.filter((draft) => draft.status === "Draft Ready").length;
  const underReview = HAQ_DRAFTS.filter((draft) => draft.status === "Under Review").length;
  const overdue = HAQ_DRAFTS.filter((draft) => draft.daysRemaining < 0).length;
  const atRisk = HAQ_DRAFTS.filter(
    (draft) => draft.daysRemaining >= 0 && draft.daysRemaining < 21,
  ).length;

  const columns: Column<HaqDraft>[] = [
    {
      key: "id",
      header: "HAQ",
      card: "title",
      value: (draft) => draft.id,
      render: (draft) => (
        <span className="font-mono text-[color:var(--pillar-02)]">{draft.id}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      value: (draft) => PRODUCT_BY_ID(draft.productId)?.name ?? "",
      render: (draft) => {
        const product = PRODUCT_BY_ID(draft.productId);
        return (
          <span className="block min-w-0">
            <span className="block truncate font-medium text-fg-primary">
              {product?.name ?? "Unknown product"}
            </span>
            <span className="type-caption block truncate text-fg-quaternary">
              {product?.dosageForm}
            </span>
          </span>
        );
      },
    },
    {
      key: "authority",
      header: "Market / authority",
      value: (draft) => `${draft.market} ${draft.authority}`,
      render: (draft) => (
        <span className="text-fg-primary">
          {draft.market}, {draft.authority}
        </span>
      ),
    },
    {
      key: "deadline",
      header: "Deadline",
      hide: "md",
      value: (draft) => draft.queryDeadline,
      render: (draft) => (
        <span className="tabular font-mono text-fg-tertiary">{draft.queryDeadline}</span>
      ),
    },
    {
      key: "days",
      header: "Days left",
      align: "right",
      value: (draft) => draft.daysRemaining,
      render: (draft) => (
        <span
          className="tabular font-mono font-medium"
          style={{ color: urgencyColor(draft.daysRemaining) }}
        >
          {draft.daysRemaining < 0 ? "Overdue" : draft.daysRemaining}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (draft) => draft.status,
      render: (draft) => (
        <Badge
          variant={
            draft.status === "Draft Ready"
              ? "complete"
              : draft.status === "Overdue"
                ? "overdue"
                : "in-progress"
          }
        >
          {draft.status}
        </Badge>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      hide: "lg",
      value: (draft) => draft.aiConfidence,
      render: (draft) => <ConfidencePill value={draft.aiConfidence} />,
    },
  ];

  function view(draft: HaqDraft) {
    setOpenId(draft.id);
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "02",
      action: `Viewed HAQ draft ${draft.id}`,
    });
  }

  return (
    <>
      <PageHeader
        title="HAQ Response Drafts"
        source="illustrative"
        description="AI-drafted Health Authority Query responses grounded in approved dossier content. Every draft requires specialist review before submission."
        breadcrumb={[{ label: "AI Writing" }, { label: "HAQ Responses" }]}
        badges={<Badge variant="pillar-02">Pillar 02</Badge>}
        actions={
          <Button size="sm" onClick={() => showToast("New HAQ intake created.", "success")}>
            New HAQ
          </Button>
        }
      />

      <PageBody className="gap-4">
        <KpiRow>
          <KpiTile label="Open HAQs" value={HAQ_DRAFTS.length} note="Across all authorities" />
          <KpiTile
            label="Drafts ready"
            value={ready}
            note="Awaiting reviewer sign-off"
            tone={ready > 0 ? "success" : "neutral"}
          />
          <KpiTile label="Under review" value={underReview} />
          <KpiTile
            label={overdue > 0 ? "Overdue" : "Inside 21 days"}
            value={overdue > 0 ? overdue : atRisk}
            note={overdue > 0 ? "Past the authority deadline" : "Deadline approaching"}
            tone={overdue > 0 ? "error" : atRisk > 0 ? "warning" : "neutral"}
          />
        </KpiRow>

        <HumanInLoopBanner />

        <DataTable
          rows={HAQ_DRAFTS}
          columns={columns}
          rowKey={(draft) => draft.id}
          onRowOpen={view}
          isRowActive={(draft) => draft.id === openId}
          defaultSort={{ key: "days", dir: "asc" }}
          searchPlaceholder="Search by HAQ ID, product or authority"
          getSearchText={(draft) => `${draft.id} ${draft.queryText}`}
          exportName="haq-responses"
          emptyTitle="No open HAQs"
          emptyDetail="Queries raised by a health authority appear here once they are logged."
        />
      </PageBody>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open ? `${open.id} · ${PRODUCT_BY_ID(open.productId)?.name}` : ""}
        subtitle={
          open
            ? `${open.market}, ${open.authority} · ${
                open.daysRemaining < 0 ? "overdue" : `${open.daysRemaining} days remaining`
              }`
            : undefined
        }
        width={620}
        footer={
          open ? (
            <>
              <Button
                variant="ghost"
                onClick={() => showToast("Draft downloaded as .docx", "success")}
              >
                Download
              </Button>
              <Button
                variant="secondary"
                onClick={() => showToast("Revision request sent to the drafting queue.")}
              >
                Request edits
              </Button>
              <Button
                onClick={() => {
                  showToast("HAQ response approved and added to the submission queue.", "success");
                  logAudit({
                    actor: "Regulatory Operations",
                    actorType: "user",
                    pillar: "02",
                    action: `Approved HAQ response ${open.id}`,
                  });
                  setOpenId(null);
                }}
              >
                Approve for submission
              </Button>
            </>
          ) : undefined
        }
      >
        {open && (
          <>
            <section>
              <SectionHeader title="Health authority query" />
              <div
                className="rounded-md bg-action p-3"
                style={{ borderLeft: "2px solid var(--feedback-error-icon)" }}
              >
                <p className="type-body-lg text-fg-secondary italic">{open.queryText}</p>
                <div className="type-caption tabular mt-2 flex flex-wrap gap-3 text-fg-quaternary">
                  <span>
                    Received <span className="font-mono">{open.queryReceivedDate}</span>
                  </span>
                  <span>
                    Deadline <span className="font-mono">{open.queryDeadline}</span>
                  </span>
                </div>
              </div>
            </section>

            <AgentCard pillar="02">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="type-heading-sm text-fg-primary">HAQ Drafting Agent</span>
                <span className="flex items-center gap-2">
                  <ConfidencePill value={open.aiConfidence} />
                  <span className="type-caption tabular font-mono text-fg-quaternary">
                    {open.draftWordCount} words
                  </span>
                </span>
              </div>
              <div className="type-body-lg whitespace-pre-line text-fg-primary">
                {open.draftBody}
              </div>
            </AgentCard>

            <section>
              <SectionHeader title="CTD sections referenced" />
              <ul className="flex flex-wrap gap-1.5">
                {open.ctdSectionsReferenced.map((section) => (
                  <li
                    key={section}
                    className="type-body-sm inline-flex items-center gap-1.5 rounded bg-action px-2 py-1 font-mono text-fg-tertiary"
                  >
                    <AppIcon name="document" size="xs" className="text-icon-quaternary" />
                    {section}
                  </li>
                ))}
              </ul>
            </section>

            <HumanInLoopBanner compact />
          </>
        )}
      </Drawer>
    </>
  );
}

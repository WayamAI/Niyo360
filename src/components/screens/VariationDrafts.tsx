import { useState } from "react";
import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader, SectionHeader } from "@/components/shared/Page";
import { Badge, badgeForVariation } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Drawer } from "@/components/shared/Drawer";
import { AgentCard } from "@/components/shared/Card";
import { ConfidencePill, HumanInLoopBanner } from "@/components/shared/Atoms";
import { PRODUCT_BY_ID, VARIATION_SECTION_DRAFTS } from "@/data/mockData";

type SectionDraft = (typeof VARIATION_SECTION_DRAFTS)[number];

export function VariationDrafts() {
  const { showToast, logAudit } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId
    ? (VARIATION_SECTION_DRAFTS.find((draft) => draft.id === openId) ?? null)
    : null;

  const columns: Column<SectionDraft>[] = [
    {
      key: "id",
      header: "Draft",
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
      render: (draft) => (
        <span className="text-fg-primary">{PRODUCT_BY_ID(draft.productId)?.name ?? "—"}</span>
      ),
    },
    {
      key: "section",
      header: "CTD section",
      value: (draft) => draft.sectionTitle,
      render: (draft) => <span className="text-fg-primary">{draft.sectionTitle}</span>,
    },
    {
      key: "variation",
      header: "Variation",
      value: (draft) => draft.variationType,
      render: (draft) => (
        <Badge variant={badgeForVariation(draft.variationType)}>{draft.variationType}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (draft) => draft.draftStatus,
      render: (draft) => (
        <Badge variant={draft.draftStatus === "Complete" ? "complete" : "in-progress"}>
          {draft.draftStatus}
        </Badge>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      hide: "md",
      value: (draft) => draft.aiConfidence,
      render: (draft) => <ConfidencePill value={draft.aiConfidence} />,
    },
    {
      key: "words",
      header: "Words",
      align: "right",
      hide: "lg",
      value: (draft) => draft.wordCount,
      render: (draft) => (
        <span className="tabular font-mono text-fg-primary">{draft.wordCount}</span>
      ),
    },
    {
      key: "sources",
      header: "Sources",
      align: "right",
      hide: "lg",
      value: (draft) => draft.sourceDocs.length,
      render: (draft) => (
        <span className="tabular font-mono text-fg-tertiary">{draft.sourceDocs.length}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Variation Section Drafts"
        source="illustrative"
        description="AI first drafts for CTD variation sections, grounded in approved dossier content. All output requires specialist review."
        breadcrumb={[{ label: "AI Writing" }, { label: "Variation Sections" }]}
        badges={<Badge variant="pillar-02">Pillar 02</Badge>}
        actions={
          <Button
            size="sm"
            onClick={() =>
              showToast(
                "Draft request submitted. The agent will begin within two minutes.",
                "success",
              )
            }
          >
            New draft request
          </Button>
        }
      />

      <PageBody className="gap-4">
        <HumanInLoopBanner />

        <DataTable
          rows={VARIATION_SECTION_DRAFTS}
          columns={columns}
          rowKey={(draft) => draft.id}
          isRowActive={(draft) => draft.id === openId}
          onRowOpen={(draft) => {
            setOpenId(draft.id);
            logAudit({
              actor: "Regulatory Operations",
              actorType: "user",
              pillar: "02",
              action: `Viewed variation draft ${draft.id}`,
            });
          }}
          searchPlaceholder="Search by draft ID, product or CTD section"
          getSearchText={(draft) => `${draft.id} ${draft.summaryOfChanges}`}
          exportName="variation-section-drafts"
          emptyTitle="No section drafts yet"
          emptyDetail="Request a draft and the HAQ Drafting Agent will generate a first pass from the approved dossier."
        />
      </PageBody>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.id ?? ""}
        subtitle={open?.sectionTitle}
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
              <Button variant="secondary" onClick={() => showToast("Edit request sent.")}>
                Request edits
              </Button>
              <Button
                onClick={() => {
                  showToast(`Draft ${open.id} approved.`, "success");
                  setOpenId(null);
                }}
              >
                Approve
              </Button>
            </>
          ) : undefined
        }
      >
        {open && (
          <>
            <section>
              <SectionHeader title="Summary of changes" />
              <p className="type-body-lg text-fg-primary">{open.summaryOfChanges}</p>
            </section>

            <section>
              <SectionHeader title="Source documents" />
              <ul className="space-y-1.5">
                {open.sourceDocs.map((doc) => (
                  <li key={doc} className="type-body-md flex items-center gap-2 text-fg-primary">
                    <AppIcon name="document" size="sm" className="text-icon-quaternary" />
                    {doc}
                  </li>
                ))}
              </ul>
            </section>

            <AgentCard pillar="02">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="type-heading-sm text-fg-primary">Draft text, excerpt</span>
                <ConfidencePill value={open.aiConfidence} />
              </div>
              <div className="type-body-lg whitespace-pre-line text-fg-primary">{open.excerpt}</div>
            </AgentCard>

            <HumanInLoopBanner compact />
          </>
        )}
      </Drawer>
    </>
  );
}

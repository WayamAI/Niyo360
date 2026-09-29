import { useState, type ReactNode } from "react";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { ApiRecord, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Badge } from "@/components/shared/Badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useApp } from "@/context/AppContext";
import { useImpactAssessment, useImpactItems } from "@/hooks/useApiQueries";
import type { ImpactItem, ImpactLevel } from "@/services/api";

/**
 * Impact assessment detail, from GET /api/v1/impact/{assessment_id}, with the
 * matched entities from /items.
 *
 * Tabs follow the right rail's markup, as the report drill-in does.
 */

const LEVEL_VARIANT: Record<
  ImpactLevel,
  "critical" | "high-risk" | "medium-risk" | "low-risk" | "neutral" | "pending"
> = {
  HIGH: "high-risk",
  MEDIUM: "medium-risk",
  LOW: "low-risk",
  POTENTIALLY_AFFECTED: "pending",
  REQUIRES_REVIEW: "pending",
  NO_MATCH: "neutral",
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "items", label: "Matched entities" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** 0.63 reads as 63%; the backend stores confidence and match score as 0-1. */
function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ImpactAssessmentDetailScreen() {
  const { selectedRecordId, navigateTo } = useApp();
  const [tab, setTab] = useState<TabId>("overview");
  const assessmentQuery = useImpactAssessment(selectedRecordId);
  const itemsQuery = useImpactItems(tab === "items" ? selectedRecordId : null);

  const columns: Column<ImpactItem>[] = [
    {
      key: "entity_type",
      header: "Entity",
      card: "title",
      value: (row) => row.entity_type,
      render: (row) => <span className="text-fg-primary">{row.entity_type}</span>,
    },
    {
      key: "entity_id",
      header: "Entity ID",
      value: (row) => row.entity_id,
      render: (row) => <span className="font-mono text-fg-tertiary">{row.entity_id}</span>,
    },
    {
      key: "impact_level",
      header: "Impact",
      card: "meta",
      value: (row) => row.impact_level,
      render: (row) => <Badge variant={LEVEL_VARIANT[row.impact_level]}>{row.impact_level}</Badge>,
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      value: (row) => row.confidence,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{percent(row.confidence)}</span>
      ),
    },
    {
      key: "match_score",
      header: "Match",
      align: "right",
      hide: "md",
      value: (row) => row.match_score,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{percent(row.match_score)}</span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      hide: "lg",
      value: (row) => row.reason,
      render: (row) => <span className="text-fg-tertiary">{row.reason}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Impact Assessment"
        description="A single assessment of a regulatory change against your portfolio."
        breadcrumb={[
          { label: "Impact" },
          { label: "Assessments", onClick: () => navigateTo("api-impact") },
          { label: selectedRecordId ?? "—" },
        ]}
        onBack={() => navigateTo("api-impact")}
        actions={<ApiRefresh query={assessmentQuery} />}
      />
      <PageBody>
        <div
          role="tablist"
          aria-label="Assessment sections"
          className="mb-6 flex h-11 shrink-0 border-b border-stroke-muted"
        >
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`type-label-md border-b-2 px-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none ${
                  selected
                    ? "border-brand text-fg-primary"
                    : "border-transparent text-fg-tertiary hover:text-fg-secondary"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {tab === "overview" ? (
            <ApiRecord
              query={assessmentQuery}
              notFoundTitle="Assessment not found"
              notFoundDetail="This assessment does not exist, or it belongs to another organization."
            >
              {(assessment) => (
                <div className="space-y-8">
                  <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    <Field label="Status">
                      <Badge variant={assessment.status === "COMPLETED" ? "complete" : "pending"}>
                        {assessment.status}
                      </Badge>
                    </Field>
                    <Field label="Overall impact">
                      <Badge variant={LEVEL_VARIANT[assessment.overall_impact_level]}>
                        {assessment.overall_impact_level}
                      </Badge>
                    </Field>
                    <Field label="Confidence">
                      <Mono>{percent(assessment.overall_confidence)}</Mono>
                    </Field>
                    <Field label="Analysis version">
                      <Mono>v{assessment.analysis_version}</Mono>
                    </Field>
                    <Field label="Matched entities">
                      <Mono>{assessment.items.length}</Mono>
                    </Field>
                    <Field label="Created">
                      <Mono>{assessment.created_at.slice(0, 10)}</Mono>
                    </Field>
                    <Field label="Assessment ID">
                      <Mono>{assessment.id}</Mono>
                    </Field>
                    <Field label="Regulatory change">
                      <Mono>{assessment.regulatory_change_id}</Mono>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Summary">{assessment.summary ?? "—"}</Field>
                    </div>
                  </dl>

                  <section>
                    <h2 className="type-label-sm text-fg-quaternary">AI enrichment</h2>
                    <dl className="mt-2 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                      <Field label="Status">
                        <Badge
                          variant={
                            assessment.ai_enrichment_status === "SUCCESS" ? "complete" : "neutral"
                          }
                        >
                          {assessment.ai_enrichment_status}
                        </Badge>
                      </Field>
                      <Field label="Model">{assessment.ai_model ?? "—"}</Field>
                      <Field label="Engine version">{assessment.engine_version ?? "—"}</Field>
                      <Field label="Prompt version">{assessment.prompt_version ?? "—"}</Field>
                      {/* Enrichment is optional: when it did not run or failed, the
                          deterministic result above still stands, and the reason is
                          reported rather than hidden. */}
                      {assessment.ai_enrichment_error && (
                        <div className="sm:col-span-2">
                          <Field label="Enrichment error">{assessment.ai_enrichment_error}</Field>
                        </div>
                      )}
                      {assessment.ai_narrative && (
                        <div className="sm:col-span-2">
                          <Field label="Narrative">{assessment.ai_narrative}</Field>
                        </div>
                      )}
                    </dl>
                  </section>
                </div>
              )}
            </ApiRecord>
          ) : (
            <ApiState
              query={itemsQuery}
              emptyTitle="No matched entities"
              emptyDetail="This assessment did not match any product, market, process, control or registration."
            >
              {(items) => (
                <DataTable
                  rows={items}
                  columns={columns}
                  rowKey={(row) => row.id}
                  searchPlaceholder="Search entities by ID or reason"
                  getSearchText={(row) => `${row.entity_id} ${row.entity_type} ${row.reason}`}
                  exportName="parivart-impact-items"
                  emptyTitle="No entities match this search"
                />
              )}
            </ApiState>
          )}
        </div>
      </PageBody>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="type-label-sm text-fg-quaternary">{label}</dt>
      <dd className="type-body-md mt-1 text-fg-secondary">{children}</dd>
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="tabular font-mono text-fg-tertiary">{children}</span>;
}

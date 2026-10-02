import { Field, PageBody, PageHeader, SectionHeader, recordCrumb } from "@/components/shared/Page";
import { ApiRecord, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Panel, SplitRow } from "@/components/shared/Panel";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useApp } from "@/context/AppContext";
import {
  useChangeObligations,
  useImpactAssessments,
  useRegulatoryChange,
} from "@/hooks/useApiQueries";
import { confidence, label } from "@/components/screens/api/intelligenceFormat";
import type { RegulatoryObligation } from "@/services/api";

/**
 * One regulatory change, from GET /api/v1/regulatory/changes/{id}.
 *
 * The CEO's second question, after "what changed?": why does it matter? The
 * answer is on this page in three parts — the change as extracted, the
 * obligations it creates, and the impact assessments run against it.
 *
 * `previous_text` and `new_text` are shown side by side when both exist,
 * because a diff of the source is more convincing than a summary of it.
 */

export function RegulatoryChangeDetailScreen() {
  const { selectedRecordId, navigateTo, openRecord } = useApp();
  const query = useRegulatoryChange(selectedRecordId);
  const obligations = useChangeObligations(selectedRecordId);
  // Assessments run against this change — the bridge from "what changed" to
  // "what of ours is affected".
  const assessments = useImpactAssessments(
    { regulatory_change_id: selectedRecordId ?? "" },
    { enabled: Boolean(selectedRecordId) },
  );

  const obligationColumns: Column<RegulatoryObligation>[] = [
    {
      key: "text",
      header: "Obligation",
      card: "title",
      value: (row) => row.text,
      render: (row) => <span className="text-fg-primary">{row.text}</span>,
    },
    {
      key: "category",
      header: "Category",
      card: "meta",
      value: (row) => row.category,
      render: (row) => <Badge variant="open">{label(row.category)}</Badge>,
    },
    {
      key: "jurisdiction",
      header: "Jurisdiction",
      card: "meta",
      value: (row) => row.jurisdiction ?? null,
      render: (row) => <span className="text-fg-tertiary">{row.jurisdiction ?? "—"}</span>,
    },
    {
      key: "source_section",
      header: "Source",
      hide: "md",
      card: "field",
      value: (row) => row.source_section ?? null,
      render: (row) => (
        // What lets a reader go back to the document and check the obligation
        // against its origin.
        <span className="text-fg-quaternary">
          {[row.source_section, row.source_page].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      card: "meta",
      value: (row) => row.confidence ?? null,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{confidence(row.confidence)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={query.data?.summary ?? "Regulatory change"}
        description="The change as extracted from its source document, the obligations it creates, and the assessments run against it."
        breadcrumb={[
          { label: "Regulatory Intelligence" },
          { label: "Changes", onClick: () => navigateTo("api-changes") },
          { label: query.data ? label(query.data.change_type) : recordCrumb(selectedRecordId) },
        ]}
        onBack={() => navigateTo("api-changes")}
        actions={<ApiRefresh query={query} />}
      />
      <PageBody className="gap-6">
        <ApiRecord
          query={query}
          notFoundTitle="Regulatory change not found"
          notFoundDetail="This change does not exist, or its source document belongs to another organization."
        >
          {(change) => (
            <div className="flex flex-col gap-6">
              <Panel title="Regulatory change" description="Properties and extracted summary.">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="Type">
                    <Badge variant="open">{label(change.change_type)}</Badge>
                  </Field>
                  <Field label="Extraction confidence">{confidence(change.confidence)}</Field>
                  <Field label="Section">{change.section ?? "—"}</Field>
                  <Field label="Source reference">{change.source_reference ?? "—"}</Field>
                </dl>

                <div className="mt-5">
                  <h3 className="type-label-sm text-fg-quaternary">Summary</h3>
                  <p className="type-body-md mt-1 text-fg-secondary">{change.summary}</p>
                </div>
              </Panel>

              {(change.previous_text || change.new_text) && (
                <Panel title="Source text" description="As it appeared in the document, before and after.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextPane label="Before" text={change.previous_text} muted />
                    <TextPane label="After" text={change.new_text} />
                  </div>
                </Panel>
              )}

              <Panel 
                title="Obligations" 
                description="What this change requires. Each carries the section it was read from."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigateTo("api-obligations")}
                  >
                    All obligations
                  </Button>
                }
              >
                <div className="mt-3">
                  <ApiState
                    query={obligations}
                    emptyTitle="No obligations recorded"
                    emptyDetail="The pipeline extracted this change but no specific obligation from it."
                    skeletonCols={4}
                  >
                    {(rows) => (
                      <DataTable
                        rows={rows}
                        columns={obligationColumns}
                        rowKey={(row) => row.id}
                        searchPlaceholder="Search obligations"
                        getSearchText={(row) =>
                          `${row.text} ${row.category} ${row.jurisdiction ?? ""}`
                        }
                        exportName="parivart-change-obligations"
                        emptyTitle="No obligations match this search"
                      />
                    )}
                  </ApiState>
                </div>
              </Panel>

              <Panel title="Impact on our portfolio" description="Assessments the matching engine has run for this change.">
                <div className="mt-3">
                  <ApiState
                    query={assessments}
                    emptyTitle="No assessment run yet"
                    emptyDetail="Run an impact analysis for this change to see which products, markets and processes it touches."
                    emptyAction={
                      <button
                        type="button"
                        onClick={() => navigateTo("api-impact-analyze")}
                        className="type-body-md text-brand underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        Run analysis
                      </button>
                    }
                    skeletonCols={3}
                  >
                    {(rows) => (
                      <ul className="flex flex-col gap-2">
                        {rows.map((assessment) => (
                          <li key={assessment.id}>
                            <button
                              type="button"
                              onClick={() => openRecord("api-impact-detail", assessment.id)}
                              className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-stroke-muted px-3 py-2.5 text-left transition-colors duration-150 hover:bg-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              <span className="type-body-md min-w-0 flex-1 text-fg-secondary">
                                {assessment.summary ?? recordCrumb(assessment.id)}
                              </span>
                              <Badge variant="neutral">v{assessment.analysis_version}</Badge>
                              {assessment.overall_impact_level && (
                                <Badge variant="open">
                                  {label(assessment.overall_impact_level)}
                                </Badge>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </ApiState>
                </div>
              </Panel>

              <Panel title="Metadata">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="Source document" mono>
                    {change.document_id ? (
                      <button
                        type="button"
                        onClick={() => openRecord("api-document-detail", change.document_id!)}
                        className="text-brand underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {recordCrumb(change.document_id)}
                      </button>
                    ) : (
                      "—"
                    )}
                  </Field>
                  <Field label="Extracted by">
                    {/* Provenance of the reading, so a reviewer can weigh it
                        rather than having to trust it. */}
                    {change.ai_model
                      ? `${change.ai_model}${change.prompt_version ? ` · ${change.prompt_version}` : ""}`
                      : "Deterministic pipeline"}
                  </Field>
                </dl>
              </Panel>
            </div>
          )}
        </ApiRecord>
      </PageBody>
    </>
  );
}

function TextPane({
  label: paneLabel,
  text,
  muted = false,
}: {
  label: string;
  text: string | null | undefined;
  muted?: boolean;
}) {
  return (
    <div>
      <h4 className="type-label-sm text-fg-quaternary">{paneLabel}</h4>
      <p
        className={`type-body-sm mt-1 rounded-md border border-stroke-muted p-3 whitespace-pre-wrap ${
          muted ? "text-fg-quaternary" : "text-fg-secondary"
        }`}
      >
        {text ?? "Not recorded."}
      </p>
    </div>
  );
}

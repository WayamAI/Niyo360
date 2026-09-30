import { useState, type ReactNode } from "react";
import { PageBody, PageHeader, recordCrumb } from "@/components/shared/Page";
import { ApiRecord, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Badge } from "@/components/shared/Badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Drawer } from "@/components/shared/Drawer";
import { Button } from "@/components/shared/Button";
import {
  RecordDecisionDialog,
  REVIEWABLE_STATUSES,
} from "@/components/screens/api/RecordDecisionDialog";
import { RaiseActionDialog } from "@/components/screens/api/RaiseActionDialog";
import { useApp } from "@/context/AppContext";
import { useActions, useImpactAssessment, useImpactItems, useReviews } from "@/hooks/useApiQueries";
import { usePortfolioNames } from "@/hooks/usePortfolioNames";
import { parseEvidence } from "@/services/api/matchEvidence";
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
  const [openItem, setOpenItem] = useState<ImpactItem | null>(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [raiseFor, setRaiseFor] = useState<ImpactItem | null>(null);
  // Decisions already filed against this assessment. Shown on the overview so
  // the drill-in answers "has anyone looked at this?" without leaving it.
  const reviewsQuery = useReviews(
    { impact_assessment_id: selectedRecordId ?? "" },
    { enabled: Boolean(selectedRecordId) },
  );
  const assessment = assessmentQuery.data;
  const reviewable = assessment ? REVIEWABLE_STATUSES.includes(assessment.status) : false;

  // The matcher records what it hit as a type plus a UUID. Joining against the
  // portfolio collections turns "PRODUCT 18f5a6da-…" into "Asterion PulseSense",
  // which is the difference between a debugging view and an answer to "what of
  // ours is affected?". Names come from the API, never from a local table.
  const names = usePortfolioNames();

  const columns: Column<ImpactItem>[] = [
    {
      key: "entity",
      header: "Portfolio entity",
      card: "title",
      value: (row) => names.resolve(row.entity_type, row.entity_id).name ?? row.entity_id,
      render: (row) => {
        const entity = names.resolve(row.entity_type, row.entity_id);
        return (
          <div className="min-w-0">
            <span className="block truncate text-fg-primary">
              {entity.name ?? (
                <span className="font-mono text-fg-quaternary" title={row.entity_id}>
                  {names.isLoading ? "Resolving…" : "Not in current portfolio"}
                </span>
              )}
            </span>
            <span className="type-caption block truncate text-fg-quaternary">
              {[row.entity_type, entity.detail].filter(Boolean).join(" · ")}
            </span>
          </div>
        );
      },
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
      card: "meta",
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
      // Why the engine matched this entity. This is the evidence half of the
      // product's promise, so it is a first-class column rather than something
      // only the CSV export carries.
      key: "reason",
      header: "Why it matched",
      hide: "lg",
      value: (row) => row.reason,
      render: (row) => (
        <div className="min-w-0">
          <span className="block text-fg-tertiary">{row.reason}</span>
          {row.match_types && (
            <span className="type-caption block truncate font-mono text-fg-quaternary">
              {row.match_types}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "entity_id",
      header: "Entity ID",
      hide: "lg",
      card: "field",
      value: (row) => row.entity_id,
      render: (row) => <span className="font-mono text-fg-quaternary">{row.entity_id}</span>,
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
          { label: recordCrumb(selectedRecordId) },
        ]}
        onBack={() => navigateTo("api-impact")}
        actions={
          <>
            <ApiRefresh query={assessmentQuery} />
            {/* Only offered when the backend will accept it: an assessment
                still analysing, or one that failed, has nothing to decide on. */}
            {reviewable && selectedRecordId && (
              <Button onClick={() => setDecisionOpen(true)}>Record decision</Button>
            )}
          </>
        }
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
                    <h2 className="type-label-sm text-fg-quaternary">Human review</h2>
                    {reviewsQuery.data && reviewsQuery.data.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {reviewsQuery.data.map((review) => (
                          <li
                            key={review.id}
                            className="rounded-md border border-stroke-muted bg-raised p-3"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  review.decision === "ACCEPT"
                                    ? "complete"
                                    : review.decision === "REJECT"
                                      ? "high-risk"
                                      : "pending"
                                }
                              >
                                {review.decision.replace(/_/g, " ")}
                              </Badge>
                              <span className="type-caption font-mono text-fg-quaternary">
                                {review.previous_state ?? "—"} → {review.new_state ?? "—"}
                              </span>
                              <span className="type-caption ml-auto font-mono text-fg-quaternary">
                                {(review.reviewed_at ?? review.created_at ?? "").slice(0, 10)}
                              </span>
                            </div>
                            {review.notes && (
                              <p className="type-body-md mt-1.5 text-fg-secondary">
                                {review.notes}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : reviewsQuery.isError ? (
                      // "No decisions" and "this backend has no review endpoint"
                      // are different facts, and reporting the second as the
                      // first would claim the assessment is unreviewed when we
                      // simply cannot tell.
                      <p className="type-body-md mt-1 text-fg-tertiary">
                        The review history could not be loaded, so whether this assessment has been
                        reviewed is unknown.
                      </p>
                    ) : (
                      <p className="type-body-md mt-1 text-fg-tertiary">
                        No decision has been recorded against this assessment yet.
                      </p>
                    )}
                  </section>

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
                  onRowOpen={setOpenItem}
                  isRowActive={(row) => row.id === openItem?.id}
                  searchPlaceholder="Search entities by name, type or reason"
                  getSearchText={(row) =>
                    `${names.resolve(row.entity_type, row.entity_id).name ?? ""} ${row.entity_id} ${row.entity_type} ${row.reason}`
                  }
                  exportName="parivart-impact-items"
                  emptyTitle="No entities match this search"
                />
              )}
            </ApiState>
          )}
        </div>
      </PageBody>

      {selectedRecordId && (
        <RecordDecisionDialog
          open={decisionOpen}
          onClose={() => setDecisionOpen(false)}
          assessmentId={selectedRecordId}
        />
      )}

      <MatchEvidenceDrawer
        item={openItem}
        entityName={openItem ? names.resolve(openItem.entity_type, openItem.entity_id).name : null}
        onClose={() => setOpenItem(null)}
        onRaiseAction={(item) => {
          setOpenItem(null);
          setRaiseFor(item);
        }}
      />

      <RaiseActionDialog
        open={raiseFor !== null}
        item={raiseFor}
        entityName={raiseFor ? names.resolve(raiseFor.entity_type, raiseFor.entity_id).name : null}
        onClose={() => setRaiseFor(null)}
        onRaised={() => navigateTo("api-actions")}
      />
    </>
  );
}

/**
 * Why one entity was matched, in full.
 *
 * The table has room for the one-line reason; this is the audit view behind it
 * — every signal the deterministic engine recorded, shown as the regulatory
 * field that met the portfolio field. Nothing here is computed by the frontend:
 * each row is a comparison the backend wrote into the item's evidence.
 */
function MatchEvidenceDrawer({
  item,
  entityName,
  onClose,
  onRaiseAction,
}: {
  item: ImpactItem | null;
  entityName: string | null;
  onClose: () => void;
  onRaiseAction: (item: ImpactItem) => void;
}) {
  const evidence = item ? parseEvidence(item.evidence) : null;
  // Actions already raised against this entity, so the same work is not
  // raised twice from two sittings of the same queue.
  const raised = useActions({ impact_item_id: item?.id ?? "" }, { enabled: Boolean(item) });

  return (
    <Drawer
      open={item !== null}
      onClose={onClose}
      width={620}
      title={entityName ?? evidence?.entity_label ?? item?.entity_id ?? "Matched entity"}
      subtitle={item ? `${item.entity_type} · match evidence` : undefined}
      footer={
        item && (
          <div className="flex w-full flex-wrap items-center gap-2">
            <span className="type-body-sm mr-auto text-fg-tertiary">
              {raised.isError
                ? "Existing actions could not be loaded."
                : raised.data?.length
                  ? `${raised.data.length} action${raised.data.length === 1 ? "" : "s"} already raised`
                  : "No action raised yet"}
            </span>
            <Button onClick={() => onRaiseAction(item)}>Raise action</Button>
          </div>
        )
      }
    >
      {item && (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field label="Impact">
              <Badge variant={LEVEL_VARIANT[item.impact_level]}>{item.impact_level}</Badge>
            </Field>
            <Field label="Confidence">
              <Mono>{percent(item.confidence)}</Mono>
            </Field>
            <Field label="Match score">
              <Mono>{percent(item.match_score)}</Mono>
            </Field>
          </dl>

          <div>
            <h3 className="type-label-sm text-fg-quaternary">Reason</h3>
            <p className="type-body-md mt-1 text-fg-secondary">{item.reason}</p>
          </div>

          {item.match_types && (
            <div>
              <h3 className="type-label-sm text-fg-quaternary">Match types</h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.match_types.split(",").map((type) => (
                  <Badge key={type} variant="neutral">
                    {type.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="type-label-sm text-fg-quaternary">
              Signals{evidence ? ` · ${evidence.signals.length}` : ""}
            </h3>
            {/* No evidence is a real answer for an item recorded before the
                engine emitted signals — say so rather than showing an empty
                grid that looks like a rendering failure. */}
            {!evidence || evidence.signals.length === 0 ? (
              <p className="type-body-md mt-1 text-fg-tertiary">
                The engine recorded no structured signals for this match.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {evidence.signals.map((signal, index) => (
                  <li
                    key={`${signal.match_type}-${signal.axis}-${index}`}
                    className="rounded-md border border-stroke-muted bg-raised p-3"
                  >
                    {signal.match_type && (
                      <p className="type-label-sm text-fg-quaternary">{signal.match_type}</p>
                    )}
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <SignalSide
                        heading="Regulatory"
                        field={signal.regulatory_field}
                        value={signal.regulatory_value}
                      />
                      <SignalSide
                        heading="Portfolio"
                        field={signal.portfolio_field}
                        value={signal.portfolio_value}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="type-label-sm text-fg-quaternary">Entity ID</h3>
            <p className="type-body-md mt-1 font-mono break-all text-fg-tertiary">
              {item.entity_id}
            </p>
          </div>
        </>
      )}
    </Drawer>
  );
}

function SignalSide({
  heading,
  field,
  value,
}: {
  heading: string;
  field: string | null;
  value: string | null;
}) {
  return (
    <div className="min-w-0">
      <p className="type-caption text-fg-quaternary">{heading}</p>
      <p className="type-body-md mt-0.5 break-words text-fg-primary">{value ?? "—"}</p>
      {field && (
        <p className="type-caption mt-0.5 font-mono break-all text-fg-quaternary">{field}</p>
      )}
    </div>
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

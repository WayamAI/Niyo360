import { PageBody, PageHeader, recordCrumb } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useAuth } from "@/context/AuthContext";
import { useReviews } from "@/hooks/useApiQueries";
import type { Review, ReviewDecision } from "@/services/api";

/**
 * Human review decisions, from GET /api/v1/reviews/.
 *
 * This is the step between what the engine concluded and what the
 * organisation does about it: a named person accepted, modified, rejected or
 * queried each assessment, and the record says which state the assessment was
 * in before and after.
 */

const DECISION_VARIANT: Record<
  ReviewDecision,
  "complete" | "medium-risk" | "high-risk" | "pending"
> = {
  ACCEPT: "complete",
  MODIFY: "medium-risk",
  REJECT: "high-risk",
  NEEDS_MORE_INFORMATION: "pending",
};

const DECISION_LABEL: Record<ReviewDecision, string> = {
  ACCEPT: "Accepted",
  MODIFY: "Modified",
  REJECT: "Rejected",
  NEEDS_MORE_INFORMATION: "More info needed",
};

function day(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "—";
}

export function ReviewListScreen() {
  const query = useReviews();
  // There is no /users collection to join against, so the only reviewer this
  // frontend can name is the signed-in one. Everyone else is shown by id
  // rather than given a made-up name.
  const { user } = useAuth();

  const columns: Column<Review>[] = [
    {
      key: "decision",
      header: "Decision",
      card: "title",
      value: (row) => row.decision,
      render: (row) => (
        <Badge variant={DECISION_VARIANT[row.decision]}>{DECISION_LABEL[row.decision]}</Badge>
      ),
    },
    {
      key: "assessment",
      header: "Assessment",
      value: (row) => row.impact_assessment_id,
      render: (row) => (
        <span className="font-mono text-fg-tertiary">{recordCrumb(row.impact_assessment_id)}</span>
      ),
    },
    {
      key: "reviewer",
      header: "Reviewer",
      value: (row) => (row.reviewer_id === user?.id ? user.email : row.reviewer_id),
      render: (row) =>
        row.reviewer_id === user?.id ? (
          <span className="text-fg-primary">{user.email}</span>
        ) : (
          <span className="font-mono text-fg-quaternary">{recordCrumb(row.reviewer_id)}</span>
        ),
    },
    {
      key: "transition",
      header: "State change",
      hide: "md",
      value: (row) => `${row.previous_state ?? ""}→${row.new_state ?? ""}`,
      render: (row) => (
        <span className="type-caption font-mono text-fg-tertiary">
          {row.previous_state ?? "—"} → {row.new_state ?? "—"}
        </span>
      ),
    },
    {
      key: "reviewed_at",
      header: "Reviewed",
      align: "right",
      card: "meta",
      value: (row) => row.reviewed_at ?? row.created_at ?? null,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">
          {day(row.reviewed_at ?? row.created_at)}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      hide: "lg",
      value: (row) => row.notes ?? null,
      render: (row) =>
        row.notes ? (
          <span className="text-fg-tertiary">{row.notes}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Human Review"
        description="Decisions taken on impact assessments, with the state each assessment moved from and to."
        breadcrumb={[{ label: "Governance" }, { label: "Human Review" }]}
        actions={
          <>
            <ApiCount query={query} />
            <ApiRefresh query={query} />
          </>
        }
      />
      <PageBody>
        <ApiState
          query={query}
          emptyTitle="No reviews filed"
          emptyDetail="Open a completed impact assessment and record a decision to start the review trail."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              defaultSort={{ key: "reviewed_at", dir: "desc" }}
              searchPlaceholder="Search reviews by decision, assessment or notes"
              getSearchText={(row) =>
                `${row.decision} ${row.impact_assessment_id} ${row.notes ?? ""} ${row.new_state ?? ""}`
              }
              exportName="parivart-reviews"
              emptyTitle="No reviews match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

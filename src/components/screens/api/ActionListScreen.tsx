import { useState } from "react";
import { PageBody, PageHeader, recordCrumb } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { FilterBar, FilterSelect } from "@/components/shared/Filters";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Drawer } from "@/components/shared/Drawer";
import { useApp } from "@/context/AppContext";
import { AttachEvidenceDialog } from "@/components/screens/api/AttachEvidenceDialog";
import { asApiError, useActions, useEvidence, useSetActionStatus } from "@/hooks/useApiQueries";
import type { Action, ActionPriority, ActionStatus, Evidence } from "@/services/api";

/**
 * Actions, from GET /api/v1/actions/.
 *
 * The last step of the chain: once a person has reviewed an assessment, the
 * work it implies is tracked here against the individual matched entities.
 * Status changes go through PATCH /actions/{id}/status — the backend owns the
 * side effects of a transition, so `completed_at` is never set from here.
 */

const STATUS_ORDER: readonly ActionStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
];

/**
 * The backend's action state machine, mirrored so the UI only offers moves it
 * will accept: COMPLETED and CANCELLED are terminal, and everything else can
 * go to any other non-terminal-or-terminal state.
 *
 * It is mirrored rather than fetched because the served schema describes the
 * ActionStatus enum but not the transitions between its members. The mirror
 * can therefore drift, which is why an offered move that the backend refuses
 * still surfaces its 409 to the user instead of failing quietly.
 */
const ALLOWED_NEXT: Record<ActionStatus, readonly ActionStatus[]> = {
  OPEN: ["IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"],
  IN_PROGRESS: ["OPEN", "BLOCKED", "COMPLETED", "CANCELLED"],
  BLOCKED: ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_VARIANT: Record<
  ActionStatus,
  "open" | "in-progress" | "high-risk" | "complete" | "neutral"
> = {
  OPEN: "open",
  IN_PROGRESS: "in-progress",
  BLOCKED: "high-risk",
  COMPLETED: "complete",
  CANCELLED: "neutral",
};

const PRIORITY_VARIANT: Record<ActionPriority, "high-risk" | "medium-risk" | "low-risk"> = {
  HIGH: "high-risk",
  MEDIUM: "medium-risk",
  LOW: "low-risk",
};

const STATUS_FILTER = ["All", ...STATUS_ORDER] as const;
type StatusFilter = (typeof STATUS_FILTER)[number];

function day(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "—";
}

export function ActionListScreen() {
  const { showToast, openRecord } = useApp();
  const [status, setStatus] = useState<StatusFilter>("All");
  const [open, setOpen] = useState<Action | null>(null);
  const [attachTo, setAttachTo] = useState<Action | null>(null);

  // The filter is applied by the backend, not in the browser, so the count in
  // the header is the real number of matching records rather than the number
  // that happened to be on this page.
  const query = useActions(status === "All" ? {} : { status });
  const setActionStatus = useSetActionStatus();
  // Evidence already filed against the open action, so the drawer answers
  // "has this been substantiated?" without leaving it.
  const evidence = useEvidence({ action_id: open?.id ?? "" }, { enabled: Boolean(open) });

  function transition(action: Action, next: ActionStatus) {
    setActionStatus.mutate(
      { actionId: action.id, status: next },
      {
        onSuccess: (updated) => {
          setOpen(updated);
          showToast(`Action moved to ${next.replace("_", " ").toLowerCase()}`, "success");
        },
        onError: (error) => {
          const api = asApiError(error);
          showToast(api?.message ?? "Could not change the action's status.", "error");
        },
      },
    );
  }

  const columns: Column<Action>[] = [
    {
      key: "title",
      header: "Action",
      card: "title",
      value: (row) => row.title,
      render: (row) => <span className="text-fg-primary">{row.title}</span>,
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (row) => row.status,
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>{row.status.replace("_", " ")}</Badge>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      card: "meta",
      value: (row) => row.priority,
      render: (row) => <Badge variant={PRIORITY_VARIANT[row.priority]}>{row.priority}</Badge>,
    },
    {
      key: "due_date",
      header: "Due",
      align: "right",
      card: "meta",
      value: (row) => row.due_date ?? null,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{day(row.due_date)}</span>
      ),
    },
    {
      key: "impact_item_id",
      header: "Matched entity",
      hide: "lg",
      value: (row) => row.impact_item_id ?? null,
      render: (row) =>
        row.impact_item_id ? (
          <span className="font-mono text-fg-quaternary">{recordCrumb(row.impact_item_id)}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Actions"
        description="Work arising from reviewed impact assessments, with an owner, a priority and a due date."
        breadcrumb={[{ label: "Governance" }, { label: "Actions" }]}
        actions={
          <>
            <ApiCount query={query} />
            <ApiRefresh query={query} />
          </>
        }
      >
        <FilterBar>
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_FILTER}
            optionLabel={(option) => (option === "All" ? "All" : option.replace("_", " "))}
          />
        </FilterBar>
      </PageHeader>
      <PageBody>
        <ApiState
          query={query}
          emptyTitle={status === "All" ? "No actions raised" : `No ${status.toLowerCase()} actions`}
          emptyDetail={
            status === "All"
              ? "Actions appear here once they are raised against a reviewed impact assessment."
              : "Clear the status filter to see the rest."
          }
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              onRowOpen={setOpen}
              isRowActive={(row) => row.id === open?.id}
              defaultSort={{ key: "due_date", dir: "asc" }}
              searchPlaceholder="Search actions by title or description"
              getSearchText={(row) => `${row.title} ${row.description ?? ""} ${row.status}`}
              exportName="parivart-actions"
              emptyTitle="No actions match this search"
            />
          )}
        </ApiState>
      </PageBody>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        width={560}
        title={open?.title ?? "Action"}
        subtitle={open ? `${open.priority} priority · due ${day(open.due_date)}` : undefined}
        footer={
          open && (
            <div className="flex w-full flex-col gap-2.5">
              {ALLOWED_NEXT[open.status].length === 0 ? (
                <p className="type-body-sm text-fg-tertiary">
                  {open.status === "COMPLETED" ? "Completed" : "Cancelled"} actions are final and
                  cannot be moved again.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="type-label-sm mr-auto text-fg-quaternary">Move to</span>
                  {ALLOWED_NEXT[open.status].map((next) => (
                    <Button
                      key={next}
                      variant={next === "COMPLETED" ? "primary" : "secondary"}
                      size="sm"
                      disabled={setActionStatus.isPending}
                      onClick={() => transition(open, next)}
                    >
                      {next.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              )}
              {/* Filing evidence stays available on a closed action: the work
                  being finished is exactly when the proof of it arrives. */}
              <div className="flex flex-wrap items-center gap-2 border-t border-stroke-muted pt-2.5">
                <span className="type-body-sm mr-auto text-fg-tertiary">
                  {evidence.isError
                    ? "Filed evidence could not be loaded."
                    : evidence.data?.length
                      ? `${evidence.data.length} file${evidence.data.length === 1 ? "" : "s"} filed`
                      : "No evidence filed yet"}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setAttachTo(open)}>
                  File evidence
                </Button>
              </div>
            </div>
          )
        }
      >
        {open && (
          <>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Status">
                <Badge variant={STATUS_VARIANT[open.status]}>{open.status.replace("_", " ")}</Badge>
              </Field>
              <Field label="Priority">
                <Badge variant={PRIORITY_VARIANT[open.priority]}>{open.priority}</Badge>
              </Field>
              <Field label="Due">{day(open.due_date)}</Field>
              <Field label="Created">{day(open.created_at)}</Field>
              {open.completed_at && <Field label="Completed">{day(open.completed_at)}</Field>}
            </dl>

            <div>
              <h3 className="type-label-sm text-fg-quaternary">Description</h3>
              <p className="type-body-md mt-1 text-fg-secondary">{open.description ?? "—"}</p>
            </div>

            <div>
              <h3 className="type-label-sm text-fg-quaternary">Matched entity</h3>
              <p className="type-body-md mt-1 font-mono break-all text-fg-tertiary">
                {open.impact_item_id ?? "Not linked to a matched entity"}
              </p>
            </div>

            <div>
              <h3 className="type-label-sm text-fg-quaternary">Owner</h3>
              <p className="type-body-md mt-1 font-mono break-all text-fg-tertiary">
                {open.owner_id ?? "Unassigned"}
              </p>
            </div>

            <div>
              <h3 className="type-label-sm text-fg-quaternary">Evidence</h3>
              <EvidenceSummary rows={evidence.data} failed={evidence.isError} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => openRecord("audit", open.id)}>
                View audit history
              </Button>
            </div>
          </>
        )}
      </Drawer>

      <AttachEvidenceDialog
        open={attachTo !== null}
        action={attachTo}
        onClose={() => setAttachTo(null)}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="type-label-sm text-fg-quaternary">{label}</dt>
      <dd className="type-body-md mt-1 text-fg-secondary">{children}</dd>
    </div>
  );
}

/**
 * The files filed against an action.
 *
 * Renders names rather than a count alone: "3 files filed" does not tell a
 * reviewer whether the right thing was filed.
 */
function EvidenceSummary({ rows, failed }: { rows: Evidence[] | undefined; failed: boolean }) {
  const { openRecord } = useApp();

  if (failed) {
    return (
      <p className="type-body-md mt-1 text-fg-tertiary">
        Filed evidence could not be loaded. The records may still exist.
      </p>
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <p className="type-body-md mt-1 text-fg-quaternary">
        Nothing filed yet. File the document that shows this work was done.
      </p>
    );
  }
  return (
    <ul className="mt-1 flex flex-col gap-1.5">
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            onClick={() => openRecord("api-evidence-detail", row.id)}
            className="type-body-md flex w-full min-w-0 items-center gap-2 rounded-md border border-stroke-muted px-2.5 py-1.5 text-left text-fg-secondary transition-colors duration-150 hover:bg-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="min-w-0 flex-1 truncate">{row.filename ?? "Untitled"}</span>
            <span className="type-caption shrink-0 font-mono text-fg-quaternary">
              {row.sha256?.slice(0, 8) ?? ""}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

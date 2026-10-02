import { useState } from "react";
import { Field, PageBody, PageHeader, SectionHeader, recordCrumb } from "@/components/shared/Page";
import { ApiRecord, ApiRefresh } from "@/components/shared/ApiState";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Panel } from "@/components/shared/Panel";
import { useApp } from "@/context/AppContext";
import { asApiError, useAction, useEvidenceItem } from "@/hooks/useApiQueries";
import { useImpactItemLocator } from "@/hooks/useImpactItemLocator";
import { evidenceApi } from "@/services/api";
import type { Action, ActionStatus, Evidence } from "@/services/api";

/**
 * One piece of evidence, from GET /api/v1/evidence/{id}.
 *
 * The point of this screen is provenance: not just the file, but where it sits
 * in the chain that produced it —
 *
 *   evidence -> action -> impact item -> assessment -> regulatory change
 *
 * Each step is a real link the API can resolve, so a reader can walk from a
 * filed document back to the regulation that caused the work.
 */

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

function stamp(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .replace("T", " ")
    .replace(/\.\d+/, "")
    .replace(/(Z|\+00:00)$/, "");
}

export function EvidenceDetailScreen() {
  const { selectedRecordId, navigateTo, openRecord } = useApp();
  const query = useEvidenceItem(selectedRecordId);

  return (
    <>
      <PageHeader
        title={query.data?.filename ?? "Evidence"}
        description="The filed file, who filed it, the hash it was recorded under, and the work it substantiates."
        breadcrumb={[
          { label: "Governance" },
          { label: "Evidence", onClick: () => navigateTo("api-evidence") },
          { label: query.data?.filename ?? recordCrumb(selectedRecordId) },
        ]}
        onBack={() => navigateTo("api-evidence")}
        actions={<ApiRefresh query={query} />}
      />
      <PageBody className="gap-6">
        <ApiRecord
          query={query}
          notFoundTitle="Evidence not found"
          notFoundDetail="This record does not exist, or it belongs to another organization."
        >
          {(evidence) => (
            <div className="flex flex-col gap-6">
              <Panel title="Evidence file" description="The filed file and who filed it.">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="File">{evidence.filename ?? "—"}</Field>
                  <Field label="Filed">{stamp(evidence.created_at)}</Field>
                  <Field label="Filed by">
                    {evidence.uploaded_by_name ?? evidence.uploaded_by_email ?? "Unknown"}
                  </Field>
                  <Field label="Email">{evidence.uploaded_by_email ?? "—"}</Field>
                </dl>

                <div className="mt-5">
                  <h3 className="type-label-sm text-fg-quaternary">Description</h3>
                  <p className="type-body-md mt-1 text-fg-secondary">
                    {evidence.description ?? "No description was given when this was filed."}
                  </p>
                </div>
              </Panel>

              <Panel
                title="Integrity"
                description="Recorded when the file was filed. Re-hashing a copy and comparing it with this value is what shows the file has not changed since."
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="type-label-sm text-fg-quaternary">SHA-256</h3>
                    <p className="type-body-md mt-1 font-mono break-all text-fg-tertiary">
                      {evidence.sha256 ?? "—"}
                    </p>
                  </div>
                  <DownloadRow evidence={evidence} />
                </div>
              </Panel>

              <ProvenanceChain evidence={evidence} />

              <Panel title="Audit trail">
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      evidence.action_id
                        ? openRecord("audit", evidence.action_id)
                        : navigateTo("audit")
                    }
                  >
                    View audit history
                  </Button>
                </div>
              </Panel>
            </div>
          )}
        </ApiRecord>
      </PageBody>
    </>
  );
}

/**
 * Downloads through the API client rather than a plain link.
 *
 * The endpoint requires the Authorization header, so an `<a href>` straight to
 * it would be answered 401. The bytes are fetched as a blob and handed to the
 * browser through an object URL.
 */
function DownloadRow({ evidence }: { evidence: Evidence }) {
  const { showToast } = useApp();
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const blob = await evidenceApi.download(evidence.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = evidence.filename ?? "evidence";
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Released on the next tick; revoking synchronously can cancel the
      // download in some browsers before it has started reading.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      const api = asApiError(error);
      showToast(
        // 410 is distinguishable on purpose: the record is real, the bytes are
        // not. Saying "not found" here would wrongly imply nothing was filed.
        api?.status === 410
          ? "This record is real, but its stored file is no longer available."
          : (api?.message ?? "Could not download this evidence."),
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" size="sm" onClick={download} disabled={busy}>
        {busy ? "Preparing…" : "Download file"}
      </Button>
      <span className="type-body-sm text-fg-quaternary">
        Served by the API, not a public link — the file is only readable by your organization.
      </span>
    </div>
  );
}

/**
 * Walks the chain upward from the evidence.
 *
 * The impact item is resolved through the assessment collection, because the
 * backend serves no impact-item-by-id endpoint. Each step states plainly when
 * it cannot be resolved rather than rendering a blank.
 */
function ProvenanceChain({ evidence }: { evidence: Evidence }) {
  const { openRecord } = useApp();
  const actionQuery = useAction(evidence.action_id ?? null);
  const action = actionQuery.data;
  const locator = useImpactItemLocator(Boolean(action?.impact_item_id));
  const located = locator.locate(action?.impact_item_id);

  return (
    <Panel
      title="Provenance"
      description="What this evidence substantiates, traced back to the regulatory change that caused the work."
    >
      <ol className="flex flex-col gap-2">
        <ChainStep label="Evidence" value={evidence.filename ?? recordCrumb(evidence.id)} current />

        <ChainStep
          label="Action"
          value={
            actionQuery.isPending
              ? "Loading…"
              : action
                ? action.title
                : evidence.action_id
                  ? "Could not load the action this evidence belongs to."
                  : "Not attached to an action."
          }
          badge={
            action ? (
              <Badge variant={STATUS_VARIANT[action.status]}>
                {action.status.replace("_", " ")}
              </Badge>
            ) : null
          }
          onOpen={action ? () => openRecord("api-actions", action.id) : undefined}
        />

        <ChainStep
          label="Matched entity"
          value={
            !action?.impact_item_id
              ? "This action is not linked to a matched entity."
              : locator.isLoading
                ? "Loading…"
                : located
                  ? `${located.item.entity_type} · ${located.item.reason ?? recordCrumb(located.item.id)}`
                  : locator.isPartial
                    ? "Could not check which assessment this belongs to."
                    : // Bounded by the assessment page size — see useImpactItemLocator.
                      "Not in the most recent assessments."
          }
        />

        <ChainStep
          label="Impact assessment"
          value={
            located
              ? (located.assessment.summary ?? recordCrumb(located.assessment.id))
              : "Not resolved."
          }
          onOpen={
            located ? () => openRecord("api-impact-detail", located.assessment.id) : undefined
          }
        />

        <ChainStep
          label="Regulatory change"
          value={
            located?.assessment.regulatory_change_id
              ? recordCrumb(located.assessment.regulatory_change_id)
              : "Not resolved."
          }
          onOpen={
            located?.assessment.regulatory_change_id
              ? () => openRecord("api-change-detail", located.assessment.regulatory_change_id!)
              : undefined
          }
        />
      </ol>
    </Panel>
  );
}

function ChainStep({
  label,
  value,
  badge,
  onOpen,
  current = false,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  onOpen?: () => void;
  current?: boolean;
}) {
  const body = (
    <>
      <span className="type-label-sm w-full shrink-0 text-fg-quaternary sm:w-40">{label}</span>
      <span
        className={`type-body-md min-w-0 flex-1 ${current ? "text-fg-primary" : "text-fg-secondary"}`}
      >
        {value}
      </span>
      {badge}
    </>
  );

  return (
    <li
      className={`rounded-md border px-3 py-2.5 ${
        current ? "border-brand/40 bg-raised" : "border-stroke-muted"
      }`}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-left transition-colors duration-150 hover:text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {body}
        </button>
      ) : (
        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1">{body}</div>
      )}
    </li>
  );
}

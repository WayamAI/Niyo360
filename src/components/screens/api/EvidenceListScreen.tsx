import { PageBody, PageHeader, recordCrumb } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useApp } from "@/context/AppContext";
import { useEvidence } from "@/hooks/useApiQueries";
import type { Evidence } from "@/services/api";

/**
 * Evidence, from GET /api/v1/evidence/.
 *
 * The files that substantiate the work: what turns "we addressed it" into
 * "here is what we did". Each row belongs to an action, and the drill-in
 * follows that link back up the chain.
 *
 * Nothing is uploaded from this screen. Evidence attaches to an action, so it
 * is filed from the action it belongs to — offering an upload here would need a
 * picker for which action, which is the same choice made worse.
 */

/** The first 12 characters are enough to compare two hashes by eye. */
function shortHash(value: string | null | undefined): string {
  return value ? value.slice(0, 12) : "—";
}

function day(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "—";
}

export function EvidenceListScreen() {
  const { openRecord, navigateTo } = useApp();
  const query = useEvidence();

  const columns: Column<Evidence>[] = [
    {
      key: "filename",
      header: "File",
      card: "title",
      value: (row) => row.filename ?? null,
      render: (row) => <span className="text-fg-primary">{row.filename ?? "Untitled"}</span>,
    },
    {
      key: "description",
      header: "Description",
      hide: "md",
      card: "field",
      value: (row) => row.description ?? null,
      render: (row) =>
        row.description ? (
          <span className="text-fg-secondary">{row.description}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "uploaded_by",
      header: "Filed by",
      card: "meta",
      value: (row) => row.uploaded_by_name ?? row.uploaded_by_email ?? null,
      render: (row) =>
        row.uploaded_by_name || row.uploaded_by_email ? (
          <span className="text-fg-secondary">{row.uploaded_by_name ?? row.uploaded_by_email}</span>
        ) : (
          <span className="text-fg-quaternary">Unknown</span>
        ),
    },
    {
      key: "created_at",
      header: "Filed",
      align: "right",
      card: "meta",
      value: (row) => row.created_at ?? null,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{day(row.created_at)}</span>
      ),
    },
    {
      key: "sha256",
      header: "SHA-256",
      hide: "lg",
      card: "field",
      value: (row) => row.sha256 ?? null,
      render: (row) => (
        // The integrity anchor: what lets someone assert later that this is the
        // file that was filed.
        <span className="font-mono text-fg-quaternary">{shortHash(row.sha256)}</span>
      ),
    },
    {
      key: "action_id",
      header: "Action",
      hide: "lg",
      card: "field",
      value: (row) => row.action_id ?? null,
      render: (row) =>
        row.action_id ? (
          <span className="font-mono text-fg-quaternary">{recordCrumb(row.action_id)}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Evidence"
        description="Files filed against remediation actions, each with the hash it was recorded under and who filed it."
        breadcrumb={[{ label: "Governance" }, { label: "Evidence" }]}
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
          emptyTitle="No evidence filed"
          emptyDetail="Evidence is attached to an action. Open an action and file the document that shows the work was done."
          emptyAction={
            <button
              type="button"
              onClick={() => navigateTo("api-actions")}
              className="type-body-md text-brand underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Go to Actions
            </button>
          }
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              onRowOpen={(row) => openRecord("api-evidence-detail", row.id)}
              defaultSort={{ key: "created_at", dir: "desc" }}
              searchPlaceholder="Search evidence by file name, description or hash"
              getSearchText={(row) =>
                `${row.filename ?? ""} ${row.description ?? ""} ${row.sha256 ?? ""} ${
                  row.uploaded_by_name ?? ""
                }`
              }
              exportName="parivart-evidence"
              emptyTitle="No evidence matches this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

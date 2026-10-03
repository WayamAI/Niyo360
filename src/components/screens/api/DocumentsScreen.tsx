import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { AppIcon } from "@/components/icons";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/context/AppContext";
import { useDocuments } from "@/hooks/useApiQueries";
import type { RegulatoryDocument } from "@/services/api";

/** Portfolio documents, from GET /api/v1/regulatory/documents/. */
export function DocumentsScreen() {
  const { openRecord, navigateTo } = useApp();
  const query = useDocuments();

  const columns: Column<RegulatoryDocument>[] = [
    {
      key: "id",
      header: "ID",
      value: (row) => row.id,
      render: (row) => <span className="font-mono text-fg-primary">{row.id}</span>,
    },
    {
      key: "title",
      header: "Title",
      value: (row) => row.title ?? null,
      render: (row) =>
        row.title ? (
          <span className="text-fg-primary">{row.title}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "document_type",
      header: "Type",
      value: (row) => row.document_type ?? null,
      render: (row) =>
        row.document_type ? (
          <span className="text-fg-primary">{row.document_type}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "processing_status",
      header: "Status",
      value: (row) => row.processing_status ?? null,
      render: (row) => {
        if (!row.processing_status) return <span className="text-fg-quaternary">—</span>;

        const status = row.processing_status;
        return (
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
              status === "ANALYZED" || status === "PARSED"
                ? // PARSED is also a terminal success: the backend's honest
                  // "deterministic extraction done, no AI pass available"
                  // state, never auto-upgraded to ANALYZED.
                  "success-bg text-success-icon"
                : status === "FAILED"
                  ? "error-bg text-error-icon"
                  : // Every remaining state is mid-pipeline.
                    "warning-bg text-warning-icon"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Created",
      hide: "lg",
      value: (row) => row.created_at ?? null,
      render: (row) =>
        row.created_at ? (
          <span className="tabular font-mono text-fg-tertiary">{row.created_at.slice(0, 10)}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Regulatory Documents"
        description="Uploaded regulatory documents and their processing status."
        breadcrumb={[{ label: "Regulatory" }, { label: "Documents" }]}
        actions={
          <>
            <ApiCount query={query} />
            <ApiRefresh query={query} />
            <Button variant="primary" size="sm" onClick={() => navigateTo("api-document-upload")}>
              Upload document
            </Button>
          </>
        }
      />
      <PageBody>
        <ApiState
          query={query}
          emptyTitle="No documents yet"
          emptyDetail="Uploaded documents appear here once you upload regulatory documents."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              onRowOpen={(row) => openRecord("api-document-detail", row.id)}
              searchPlaceholder="Search documents by ID or title"
              getSearchText={(row) => `${row.id} ${row.title ?? ""} ${row.document_type ?? ""}`}
              exportName="parivart-documents"
              emptyTitle="No documents match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

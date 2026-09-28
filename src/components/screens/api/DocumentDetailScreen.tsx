import { PageBody, PageHeader } from "@/components/shared/Page";
import { ApiState } from "@/components/shared/ApiState";
import { useDocument } from "@/hooks/useApiQueries";
import type { RegulatoryDocument } from "@/services/api";
import * as React from "react";

/** Document detail view, from GET /api/v1/regulatory/documents/{document_id}. */
export function DocumentDetailScreen() {
  // In a real implementation, we would get the document ID from route params
  // For now, we'll use a placeholder approach similar to how other detail screens work
  const [documentId, setDocumentId] = React.useState<string | null>(null);

  // This would normally come from route parameters
  // We're using state to simulate route params for now
  const query = useDocument(documentId ?? "");

  return (
    <>
      <PageHeader
        title="Document Detail"
        description="Detailed view of a regulatory document"
        breadcrumb={[
          { label: "Regulatory", onClick: () => {/* navigate to regulatory */} },
          { label: "Documents", onClick: () => {/* navigate to documents list */} },
          { label: documentId ?? "Select a document" },
        ]}
        onBack={() => {/* navigate to documents list */}}
      />
      <PageBody>
        <ApiState
          query={query}
          emptyTitle="Select a document"
          emptyDetail="Choose a document from the list to view its details."
        >
          {(document) => (
            <div className="space-y-6">
              <div>
                <h2 className="type-heading-md text-fg-primary">{document.title ?? "Untitled Document"}</h2>
                <p className="type-body-sm text-fg-tertiary">
                  Document ID: {document.id}
                </p>
                <p className="type-body-sm text-fg-tertiary">
                  Type:{" "}
                  <span className="text-fg-tertiary">
                    {document.document_type ?? "—"}
                  </span>
                </p>
                <p className="type-body-sm text-fg-tertiary">
                  Status:{" "}
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                      document.processing_status === "ANALYZED"
                        ? "success-bg text-success-icon"
                        : document.processing_status === "FAILED"
                          ? "error-bg text-error-icon"
                          : document.processing_status === "PENDING" || document.processing_status === "UPLOADED" || document.processing_status === "ANALYZING"
                            ? "warning-bg text-warning-icon"
                            : "text-fg-tertiary"
                    }`}
                  >
                    {document.processing_status ?? "—"}
                  </span>
                </p>
                <p className="type-body-sm text-fg-tertiary">
                  Created:{" "}
                  <span className="font-mono text-fg-tertiary">
                    {document.created_at ? document.created_at.slice(0, 10) : "—"}
                  </span>
                </p>
                <p className="type-body-sm text-fg-tertiary">
                  Updated:{" "}
                  <span className="font-mono text-fg-tertiary">
                    {document.updated_at ? document.updated_at.slice(0, 10) : "—"}
                  </span>
                </p>
              </div>

              {/* Additional document details would go here based on actual API response */}
              {/* For now, showing placeholder for other potential fields */}
              <div className="border-t border-stroke-default pt-4">
                <h3 className="type-heading-sm text-fg-primary">Document Details</h3>
                <p className="type-body-sm text-fg-tertiary">
                  Detailed document content would be displayed here based on the
                  actual RegulatoryDocumentResponse structure from the backend.
                </p>
              </div>

              {/* Document actions */}
              <div className="border-t border-stroke-default pt-4">
                <h3 className="type-heading-sm text-fg-primary">Actions</h3>
                <div className="flex gap-4">
                  {/* Process document button */}
                  <button
                    type="button"
                    disabled={!documentId}
                    className="btn btn-primary"
                  >
                    Process Document
                  </button>
                  {/* Check status button */}
                  <button
                    type="button"
                    disabled={!documentId}
                    className="btn btn-secondary"
                  >
                    Check Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </ApiState>
      </PageBody>
    </>
  );
}
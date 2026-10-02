import type { ReactNode } from "react";
import { PageBody, PageHeader, recordCrumb } from "@/components/shared/Page";
import { ApiRecord, ApiRefresh } from "@/components/shared/ApiState";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { useDocument, useProcessDocument, useSources } from "@/hooks/useApiQueries";
import type { DocumentProcessingStatus } from "@/services/api";

/** Document detail, from GET /api/v1/regulatory/documents/{document_id}. */

/**
 * ANALYZED is the only terminal success in DocumentProcessingStatus and FAILED
 * the only terminal failure; everything else is the pipeline still running.
 */
function statusVariant(status: DocumentProcessingStatus): "complete" | "critical" | "in-progress" {
  if (status === "ANALYZED") return "complete";
  if (status === "FAILED") return "critical";
  return "in-progress";
}

function formatDate(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "—";
}

function formatSize(bytes: number | null | undefined): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentDetailScreen() {
  const { selectedRecordId, navigateTo, openRecord, showToast } = useApp();
  const query = useDocument(selectedRecordId);
  const processMutation = useProcessDocument();
  // The document carries the id of the source it was ingested from. The name
  // is one list away and is what anyone reading this page is looking for.
  const sourcesQuery = useSources();
  const sourceName = (id: string | null | undefined) =>
    sourcesQuery.data?.find((source) => source.id === id)?.name ?? null;

  return (
    <>
      <PageHeader
        title={query.data?.title ?? "Document"}
        description="A single regulatory document and its processing state."
        breadcrumb={[
          { label: "Regulatory" },
          { label: "Documents", onClick: () => navigateTo("api-documents") },
          { label: query.data?.title ?? recordCrumb(selectedRecordId) },
        ]}
        onBack={() => navigateTo("api-documents")}
        actions={
          <>
            <ApiRefresh query={query} />
            {selectedRecordId && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={
                    processMutation.isPending ||
                    query.data?.processing_status === "ANALYZING" ||
                    query.data?.processing_status === "PARSING" ||
                    query.data?.processing_status === "DOWNLOADING"
                  }
                  onClick={() => {
                    processMutation.mutate(selectedRecordId, {
                      onSuccess: () => {
                        showToast("Document processing triggered.", "success");
                      },
                      onError: (err) => {
                        showToast(
                          err instanceof Error ? err.message : "Failed to process document",
                          "error",
                        );
                      },
                    });
                  }}
                >
                  <AppIcon name="play" size="xs" />
                  {processMutation.isPending ? "Processing…" : "Process Document"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openRecord("audit", selectedRecordId)}
                >
                  History
                </Button>
              </>
            )}
          </>
        }
      />
      <PageBody>
        <ApiRecord
          query={query}
          notFoundTitle="Document not found"
          notFoundDetail="This document does not exist, or it belongs to another organization."
        >
          {(doc) => (
            <div className="space-y-8">
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Field label="Title">
                  <span className="type-body-md text-fg-primary">{doc.title}</span>
                </Field>
                <Field label="Processing status">
                  <Badge variant={statusVariant(doc.processing_status)}>
                    {doc.processing_status}
                  </Badge>
                </Field>
                <Field label="Type">{doc.document_type}</Field>
                <Field label="Language">{doc.language}</Field>
                <Field label="Jurisdiction">{doc.jurisdiction ?? "—"}</Field>
                <Field label="Country">{doc.country ?? "—"}</Field>
                <Field label="Published">
                  <Mono>{formatDate(doc.publication_date)}</Mono>
                </Field>
                <Field label="Effective">
                  <Mono>{formatDate(doc.effective_date)}</Mono>
                </Field>
                <Field label="Retrieved">
                  <Mono>{formatDate(doc.retrieved_at)}</Mono>
                </Field>
                <Field label="Parsed">
                  <Mono>{formatDate(doc.parsed_at)}</Mono>
                </Field>
                <Field label="File type">{doc.mime_type ?? "—"}</Field>
                <Field label="File size">
                  <Mono>{formatSize(doc.file_size)}</Mono>
                </Field>
                <Field label="Document ID">
                  <Mono>{doc.id}</Mono>
                </Field>
                <Field label="Source">
                  {/* Falls back to the id when the source is not in the
                      current list — a document can outlive its source. */}
                  {sourceName(doc.source_id) ?? <Mono>{doc.source_id ?? "—"}</Mono>}
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Source URL">
                    {doc.source_url ? (
                      <a
                        href={doc.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand underline underline-offset-2"
                      >
                        {doc.source_url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Description">{doc.description ?? "—"}</Field>
                </div>
              </dl>

              {/* Only rendered once extraction has actually produced text. */}
              {doc.extracted_text && (
                <section>
                  <h2 className="type-label-sm text-fg-quaternary">Extracted text</h2>
                  <pre className="type-body-sm mt-2 max-h-96 overflow-auto rounded-md border border-stroke-muted bg-raised-1 p-4 whitespace-pre-wrap text-fg-secondary">
                    {doc.extracted_text}
                  </pre>
                </section>
              )}
            </div>
          )}
        </ApiRecord>
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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/context/AppContext";
import { useAuthorities, useSources, useUploadDocument } from "@/hooks/useApiQueries";
import type { DocumentType } from "@/services/api";

/**
 * Upload a regulatory document, POST /api/v1/regulatory/documents/upload.
 *
 * The multipart body requires file, title, authority_id and source_id; the
 * scaffold sent title and a camelCase documentType and omitted both ids, so
 * every upload would have been rejected. Authority and source are picked from
 * the live lists rather than typed, which is also what keeps the upload inside
 * the caller's own organization.
 *
 * Field styling follows the sign-in form, as the generate-report screen does.
 */

const FIELD =
  "type-body-lg h-9 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary placeholder:text-fg-quaternary transition-colors duration-150 hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const DOCUMENT_TYPES: DocumentType[] = [
  "REGULATION",
  "GUIDANCE",
  "NOTICE",
  "SAFETY_ALERT",
  "STANDARD",
  "AMENDMENT",
  "RULE",
  "DRAFT",
  "FINAL",
  "OTHER",
];

interface UploadFields {
  title: string;
  authority_id: string;
  source_id: string;
  document_type: DocumentType;
  description: string;
}

export function DocumentUploadScreen() {
  const { showToast, navigateTo, openRecord } = useApp();
  const authoritiesQuery = useAuthorities();
  const sourcesQuery = useSources();
  const uploadDocument = useUploadDocument();
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UploadFields>({
    defaultValues: {
      title: "",
      authority_id: "",
      source_id: "",
      document_type: "REGULATION",
      description: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!file) {
      showToast("Choose a file to upload.", "error");
      return;
    }
    try {
      const result = await uploadDocument.mutateAsync({
        file,
        fields: {
          title: data.title,
          authority_id: data.authority_id,
          source_id: data.source_id,
          document_type: data.document_type,
          // Omitted rather than sent empty when the box is blank.
          ...(data.description.trim() ? { description: data.description.trim() } : {}),
        },
      });
      // The backend de-duplicates by SHA-256 and says so; reporting it as a
      // fresh upload would misrepresent what happened.
      showToast(
        result.is_duplicate ? "That document was already uploaded." : "Document uploaded.",
        result.is_duplicate ? "warning" : "success",
      );
      setFile(null);
      openRecord("api-document-detail", result.document_id);
    } catch (err) {
      // ApiError.message is already a user-safe sentence (field detail for a
      // 422, a specific reason for 4xx/5xx) — showing it beats a flat "could
      // not upload" that hides why a validation error happened.
      showToast(err instanceof Error ? err.message : "Could not upload the document.", "error");
    }
  });

  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Add a regulatory document for the processing pipeline."
        breadcrumb={[
          { label: "Regulatory" },
          { label: "Documents", onClick: () => navigateTo("api-documents") },
          { label: "Upload" },
        ]}
        onBack={() => navigateTo("api-documents")}
      />
      <PageBody>
        <form
          onSubmit={onSubmit}
          className="max-w-xl space-y-5 rounded-lg border border-stroke-default bg-container p-5"
        >
          <div className="space-y-1.5">
            <label className="type-label-sm text-fg-quaternary" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className={FIELD}
              placeholder="Document title"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
              {...register("title", {
                required: "A title is required.",
                maxLength: { value: 200, message: "Maximum 200 characters." },
              })}
            />
            {errors.title && (
              <p id="title-error" className="type-body-md text-error">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="type-label-sm text-fg-quaternary" htmlFor="authority_id">
              Authority
            </label>
            <select
              id="authority_id"
              className={FIELD}
              aria-invalid={Boolean(errors.authority_id)}
              aria-describedby={errors.authority_id ? "authority_id-error" : undefined}
              {...register("authority_id", { required: "Choose the issuing authority." })}
            >
              <option value="">Select an authority…</option>
              {(authoritiesQuery.data ?? []).map((authority) => (
                <option key={authority.id} value={authority.id}>
                  {authority.short_name} — {authority.name}
                </option>
              ))}
            </select>
            {errors.authority_id && (
              <p id="authority_id-error" className="type-body-md text-error">
                {errors.authority_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="type-label-sm text-fg-quaternary" htmlFor="source_id">
              Source
            </label>
            <select
              id="source_id"
              className={FIELD}
              aria-invalid={Boolean(errors.source_id)}
              aria-describedby={errors.source_id ? "source_id-error" : undefined}
              {...register("source_id", { required: "Choose the source to file this under." })}
            >
              <option value="">Select a source…</option>
              {(sourcesQuery.data ?? []).map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
            {errors.source_id && (
              <p id="source_id-error" className="type-body-md text-error">
                {errors.source_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="type-label-sm text-fg-quaternary" htmlFor="document_type">
              Type
            </label>
            <select id="document_type" className={FIELD} {...register("document_type")}>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="type-label-sm text-fg-quaternary" htmlFor="description">
              Description <span className="text-fg-quaternary">(optional)</span>
            </label>
            <input id="description" className={FIELD} {...register("description")} />
          </div>

          <div className="space-y-1.5">
            <label className="type-label-sm text-fg-quaternary" htmlFor="file">
              File
            </label>
            <input
              id="file"
              type="file"
              className={FIELD + " py-1.5"}
              accept=".pdf,.doc,.docx,.txt,.html"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="type-body-md text-fg-tertiary">
                {file.name} · {(file.size / 1024).toFixed(0)} kB
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" disabled={isSubmitting || !file}>
            {isSubmitting ? "Uploading…" : "Upload document"}
          </Button>
        </form>
      </PageBody>
    </>
  );
}

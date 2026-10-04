import { useEffect, useId, useState } from "react";
import { Modal } from "@/components/shared/Drawer";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/context/AppContext";
import { asApiError, useAuthorities, useCreateSource } from "@/hooks/useApiQueries";
import type { SourceType } from "@/services/api";

/**
 * Creates a regulatory source, POST /api/v1/regulatory/sources/.
 *
 * `source_type` and `connector_type` are two independently required fields on
 * the backend, but every source in the system today sets them to the same
 * value and the backend's run dispatch keys only on `source_type` — so this
 * form offers one "Type" selector and sends it as both, rather than inventing
 * a distinction the backend doesn't use.
 *
 * `url` is the backend's only per-source configuration field across every
 * connector type: RSS/HTML fetch and parse it, API/WEB_SERVICE fetch it as
 * one JSON document (not a crawl — see app/ingestion/api_adapter.py), and
 * DOCUMENT sources have no URL to poll at all, so the field is hidden rather
 * than offering a per-type config object the backend has no column for.
 */

const SOURCE_TYPES: readonly SourceType[] = ["RSS", "HTML", "API", "WEB_SERVICE", "DOCUMENT"];

const TYPE_HELP: Record<SourceType, string> = {
  RSS: "Fetches and parses the feed at this URL on each run.",
  HTML: "Fetches and parses the page at this URL on each run.",
  API: "Fetches this single JSON endpoint on each run and stores the response as one document. Not a crawler — it never follows a link found in the response.",
  WEB_SERVICE:
    "Fetches this single JSON endpoint on each run and stores the response as one document. Not a crawler — it never follows a link found in the response.",
  DOCUMENT: "No URL to poll. Documents are added to this source by uploading them directly.",
};

export function CreateSourceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useApp();
  const authoritiesQuery = useAuthorities();
  const createSource = useCreateSource();
  const [name, setName] = useState("");
  const [authorityId, setAuthorityId] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("RSS");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const nameId = useId();
  const authorityIdId = useId();
  const typeId = useId();
  const urlId = useId();
  const descriptionId = useId();

  // Reset to a clean draft each time the dialog opens, so a previous attempt
  // (including its error) never bleeds into the next one.
  useEffect(() => {
    if (!open) return;
    setName("");
    setAuthorityId("");
    setSourceType("RSS");
    setUrl("");
    setDescription("");
    createSource.reset();
    // createSource is a stable mutation object; depending on it would clear
    // the error as soon as it is set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const needsUrl = sourceType !== "DOCUMENT";
  const canSubmit =
    name.trim().length > 0 && authorityId.length > 0 && (!needsUrl || url.trim().length > 0);

  function submit() {
    if (!canSubmit) return;
    createSource.mutate(
      {
        name: name.trim(),
        authority_id: authorityId,
        source_type: sourceType,
        connector_type: sourceType,
        url: needsUrl ? url.trim() : null,
        description: description.trim() ? description.trim() : null,
        enabled: true,
      },
      {
        onSuccess: (source) => {
          showToast(`Source "${source.name}" created.`, "success");
          onClose();
        },
      },
    );
  }

  const error = asApiError(createSource.error);
  const fieldClass =
    "type-body-md mt-1.5 w-full rounded-md border border-stroke-default bg-page p-2.5 text-fg-primary placeholder:text-fg-quaternary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title="Add a source"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createSource.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createSource.isPending || !canSubmit}>
            {createSource.isPending ? "Creating…" : "Create source"}
          </Button>
        </>
      }
    >
      <div>
        <label htmlFor={nameId} className="type-label-sm text-fg-quaternary">
          Name
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={255}
          className={fieldClass}
          placeholder="Source name"
        />
      </div>

      <div className="mt-4">
        <label htmlFor={authorityIdId} className="type-label-sm text-fg-quaternary">
          Authority
        </label>
        <select
          id={authorityIdId}
          value={authorityId}
          onChange={(event) => setAuthorityId(event.target.value)}
          className={fieldClass}
        >
          <option value="">Select an authority…</option>
          {(authoritiesQuery.data ?? []).map((authority) => (
            <option key={authority.id} value={authority.id}>
              {authority.short_name} — {authority.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor={typeId} className="type-label-sm text-fg-quaternary">
          Type
        </label>
        <select
          id={typeId}
          value={sourceType}
          onChange={(event) => setSourceType(event.target.value as SourceType)}
          className={fieldClass}
        >
          {SOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <p className="type-caption mt-1.5 text-fg-quaternary">{TYPE_HELP[sourceType]}</p>
      </div>

      {needsUrl && (
        <div className="mt-4">
          <label htmlFor={urlId} className="type-label-sm text-fg-quaternary">
            URL
          </label>
          <input
            id={urlId}
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className={fieldClass}
            placeholder="https://…"
          />
        </div>
      )}

      <div className="mt-4">
        <label htmlFor={descriptionId} className="type-label-sm text-fg-quaternary">
          Description <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={2000}
          className={fieldClass}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="type-body-sm mt-3 rounded-md border border-error-stroke bg-error-bg p-2.5 text-error"
        >
          {error.message}
        </p>
      )}
    </Modal>
  );
}

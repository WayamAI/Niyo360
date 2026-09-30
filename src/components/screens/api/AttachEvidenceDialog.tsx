import { useEffect, useId, useRef, useState } from "react";
import { Modal } from "@/components/shared/Drawer";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/context/AppContext";
import { asApiError, useUploadEvidence } from "@/hooks/useApiQueries";
import type { Action } from "@/services/api";

/**
 * Files a file as evidence for an action.
 *
 * This is the last link in the chain: a regulatory change caused an
 * assessment, the assessment produced a matched item, the item raised an
 * action, and this is the document showing the action was carried out.
 *
 * Opened from the action it belongs to, because evidence attaches to an action
 * and to nothing else — the backend table has an `action_id` and no generic
 * entity pair, so there is no meaningful "attach to anything" flow to offer.
 *
 * No type or category field: the backend has no such column, and a picker for
 * one would be asking for information that is then discarded.
 */

export function AttachEvidenceDialog({
  open,
  action,
  onClose,
  onAttached,
}: {
  open: boolean;
  action: Action | null;
  onClose: () => void;
  /** Called after the backend confirms, so the caller can navigate or refresh. */
  onAttached?: () => void;
}) {
  const { showToast } = useApp();
  const upload = useUploadEvidence();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const fileInput = useRef<HTMLInputElement | null>(null);
  const fileId = useId();
  const descriptionId = useId();

  // Clear the form each time it opens, so one action's draft never carries
  // onto another — and in particular so a previously chosen file is never
  // filed against the wrong action.
  useEffect(() => {
    if (!open) return;
    setFile(null);
    setDescription("");
    if (fileInput.current) fileInput.current.value = "";
    upload.reset();
    // `upload` is a stable mutation object; depending on it would clear the
    // error as soon as it is set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, action?.id]);

  function submit() {
    if (!action || !file) return;
    upload.mutate(
      {
        file,
        actionId: action.id,
        description: description.trim() ? description.trim() : undefined,
      },
      {
        onSuccess: () => {
          showToast("Evidence filed.", "success");
          onClose();
          onAttached?.();
        },
      },
    );
  }

  const error = asApiError(upload.error);
  const fieldClass =
    "type-body-md mt-1.5 w-full rounded-md border border-stroke-default bg-page p-2.5 text-fg-primary placeholder:text-fg-quaternary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title="File evidence"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={upload.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={upload.isPending || !file}>
            {upload.isPending ? "Filing…" : "File evidence"}
          </Button>
        </>
      }
    >
      {action && (
        <p className="type-body-sm text-fg-tertiary">
          Against <span className="text-fg-primary">{action.title}</span>
        </p>
      )}

      <div className="mt-4">
        <label htmlFor={fileId} className="type-label-sm text-fg-quaternary">
          File
        </label>
        <input
          id={fileId}
          ref={fileInput}
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className={`${fieldClass} file:mr-3 file:rounded file:border-0 file:bg-action-tertiary-hover file:px-2.5 file:py-1 file:text-fg-secondary`}
        />
        {file && (
          <p className="type-caption mt-1.5 text-fg-quaternary">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </p>
        )}
      </div>

      <div className="mt-4">
        <label htmlFor={descriptionId} className="type-label-sm text-fg-quaternary">
          Description <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={10000}
          placeholder="What this file shows, and who signed it off."
          className={fieldClass}
        />
      </div>

      <p className="type-caption mt-3 text-fg-quaternary">
        The file is hashed with SHA-256 when it is filed, so it can be shown later to be the same
        file. Evidence cannot be removed through the API once filed.
      </p>

      {error && (
        <p
          role="alert"
          className="type-body-sm mt-3 rounded-md border border-error-stroke bg-error-bg p-2.5 text-error"
        >
          {error.kind === "not_found"
            ? "The backend did not accept this file. Either it does not serve the evidence endpoint, or this action is no longer available."
            : error.message}
        </p>
      )}
    </Modal>
  );
}

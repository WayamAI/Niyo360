import { useEffect, useId, useState } from "react";
import { Modal } from "@/components/shared/Drawer";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/context/AppContext";
import { asApiError, useCreateReview } from "@/hooks/useApiQueries";
import type { ImpactAssessmentStatus, ReviewDecision } from "@/services/api";

/**
 * Files a human review decision against an impact assessment.
 *
 * This is the hand-off the rest of the product builds up to: the engine has
 * produced a result and a named person now accepts it, amends it, rejects it
 * or asks for more. The reviewer and the tenant come from the Bearer token, so
 * nothing about identity is sent from the browser.
 *
 * Where each decision leaves the assessment is the backend's rule, stated here
 * so the reviewer knows the consequence before committing to it.
 */

const DECISIONS: Array<{ value: ReviewDecision; label: string; outcome: string }> = [
  { value: "ACCEPT", label: "Accept", outcome: "Marks the assessment reviewed." },
  { value: "MODIFY", label: "Accept with changes", outcome: "Marks the assessment reviewed." },
  { value: "REJECT", label: "Reject", outcome: "Sends the assessment back for another pass." },
  {
    value: "NEEDS_MORE_INFORMATION",
    label: "Needs more information",
    outcome: "Sends the assessment back for another pass.",
  },
];

/**
 * An assessment can only carry a decision once the engine has produced
 * something to decide on. PENDING and ANALYZING have no result yet, and FAILED
 * has none at all.
 */
export const REVIEWABLE_STATUSES: readonly ImpactAssessmentStatus[] = [
  "COMPLETED",
  "REQUIRES_REVIEW",
  "REVIEWED",
];

export function RecordDecisionDialog({
  open,
  onClose,
  assessmentId,
}: {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
}) {
  const { showToast } = useApp();
  const createReview = useCreateReview();
  const [decision, setDecision] = useState<ReviewDecision>("ACCEPT");
  const [notes, setNotes] = useState("");
  const notesId = useId();

  // Reopening the dialog must not show the previous reviewer's draft.
  useEffect(() => {
    if (open) {
      setDecision("ACCEPT");
      setNotes("");
      createReview.reset();
    }
    // createReview is a stable mutation object; re-running on its identity
    // would clear the error the moment it is set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function submit() {
    createReview.mutate(
      {
        impact_assessment_id: assessmentId,
        decision,
        notes: notes.trim() ? notes.trim() : null,
      },
      {
        onSuccess: (review) => {
          showToast(
            `Decision recorded — assessment is now ${review.new_state ?? "updated"}.`,
            "success",
          );
          onClose();
        },
      },
    );
  }

  const error = asApiError(createReview.error);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title="Record a review decision"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createReview.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createReview.isPending}>
            {createReview.isPending ? "Recording…" : "Record decision"}
          </Button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="type-label-sm mb-2 text-fg-quaternary">Decision</legend>
        {DECISIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-md border p-3 transition-colors duration-150 ${
              decision === option.value
                ? "border-stroke-active bg-raised-2"
                : "border-stroke-muted hover:border-stroke-default"
            }`}
          >
            <input
              type="radio"
              name="review-decision"
              value={option.value}
              checked={decision === option.value}
              onChange={() => setDecision(option.value)}
              className="mt-1 accent-[var(--brand)]"
            />
            <span className="min-w-0">
              <span className="type-body-md block text-fg-primary">{option.label}</span>
              <span className="type-caption block text-fg-quaternary">{option.outcome}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="mt-4">
        <label htmlFor={notesId} className="type-label-sm text-fg-quaternary">
          Notes <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id={notesId}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          maxLength={10000}
          placeholder="What you checked, and anything the next reviewer needs to know."
          className="type-body-md mt-1.5 w-full rounded-md border border-stroke-default bg-page p-2.5 text-fg-primary placeholder:text-fg-quaternary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
      </div>

      {/* The backend's answer, verbatim in kind: a 409 means the assessment is
          not in a state that can carry a decision, which is not the reviewer's
          mistake and must not be reported as one. */}
      {error && (
        <p
          role="alert"
          className="type-body-sm mt-3 rounded-md border border-error-stroke bg-error-bg p-2.5 text-error"
        >
          {error.kind === "conflict"
            ? "This assessment is not in a state that can carry a decision yet. Refresh and check its status."
            : error.message}
        </p>
      )}
    </Modal>
  );
}

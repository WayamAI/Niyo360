import { useEffect, useId, useState } from "react";
import { Modal } from "@/components/shared/Drawer";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/context/AppContext";
import { asApiError, useCreateAction } from "@/hooks/useApiQueries";
import type { ActionPriority, ImpactItem } from "@/services/api";

/**
 * Raises an action against one matched portfolio entity.
 *
 * This is the link between a reviewed assessment and the work it implies: the
 * action carries the impact item's id, so what has to be done stays attached
 * to the specific entity and evidence that caused it rather than to the
 * assessment as a whole.
 *
 * The owner is deliberately not offered. The backend accepts an `owner_id`,
 * but it is a user id and there is no endpoint that lists users, so a picker
 * here could only ask someone to paste a UUID. Actions are created unassigned
 * and the screen says so.
 */

const PRIORITIES: readonly ActionPriority[] = ["LOW", "MEDIUM", "HIGH"];

export function RaiseActionDialog({
  open,
  item,
  entityName,
  onClose,
  onRaised,
}: {
  open: boolean;
  item: ImpactItem | null;
  entityName: string | null;
  onClose: () => void;
  /** Called after the backend confirms, so the caller can offer to navigate. */
  onRaised?: () => void;
}) {
  const { showToast } = useApp();
  const createAction = useCreateAction();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ActionPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const titleId = useId();
  const descriptionId = useId();
  const priorityId = useId();
  const dueId = useId();

  // Seed the form from the entity each time it opens, and never carry a
  // previous entity's draft onto a different one.
  useEffect(() => {
    if (!open) return;
    setTitle(entityName ? `Assess impact on ${entityName}` : "");
    setDescription(item?.reason ?? "");
    setPriority(item?.impact_level === "HIGH" ? "HIGH" : "MEDIUM");
    setDueDate("");
    createAction.reset();
    // createAction is a stable mutation object; depending on it would clear
    // the error as soon as it is set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id, entityName]);

  function submit() {
    if (!item || !title.trim()) return;
    createAction.mutate(
      {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        impact_item_id: item.id,
        priority,
        // The API takes a date-time; a date input gives a day. Sent as the
        // start of that day in UTC rather than guessing a local time.
        due_date: dueDate ? `${dueDate}T00:00:00Z` : null,
      },
      {
        onSuccess: () => {
          showToast("Action raised.", "success");
          onClose();
          onRaised?.();
        },
      },
    );
  }

  const error = asApiError(createAction.error);
  const fieldClass =
    "type-body-md mt-1.5 w-full rounded-md border border-stroke-default bg-page p-2.5 text-fg-primary placeholder:text-fg-quaternary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title="Raise an action"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createAction.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createAction.isPending || !title.trim()}>
            {createAction.isPending ? "Raising…" : "Raise action"}
          </Button>
        </>
      }
    >
      {entityName && (
        <p className="type-body-sm text-fg-tertiary">
          Against <span className="text-fg-primary">{entityName}</span>
          {item && ` · ${item.entity_type}`}
        </p>
      )}

      <div className="mt-4">
        <label htmlFor={titleId} className="type-label-sm text-fg-quaternary">
          Title
        </label>
        <input
          id={titleId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={255}
          className={fieldClass}
        />
      </div>

      <div className="mt-4">
        <label htmlFor={descriptionId} className="type-label-sm text-fg-quaternary">
          Description
        </label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          maxLength={10000}
          className={fieldClass}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={priorityId} className="type-label-sm text-fg-quaternary">
            Priority
          </label>
          <select
            id={priorityId}
            value={priority}
            onChange={(event) => setPriority(event.target.value as ActionPriority)}
            className={fieldClass}
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={dueId} className="type-label-sm text-fg-quaternary">
            Due date <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            id={dueId}
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <p className="type-caption mt-3 text-fg-quaternary">
        Raised unassigned. The API accepts an owner, but exposes no endpoint listing users to pick
        one from.
      </p>

      {error && (
        <p
          role="alert"
          className="type-body-sm mt-3 rounded-md border border-error-stroke bg-error-bg p-2.5 text-error"
        >
          {error.kind === "not_found"
            ? "The backend did not accept this action. Either it does not serve the actions endpoint, or this matched entity is no longer available."
            : error.message}
        </p>
      )}
    </Modal>
  );
}

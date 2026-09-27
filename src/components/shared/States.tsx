import type { ReactNode } from "react";
import { AppIcon, type IconName } from "@/components/icons";
import { Button } from "@/components/shared/Button";

/**
 * The five states a data-driven area can be in.
 *
 * They are deliberately separate components rather than one `<State kind>`:
 * "no rows yet", "no rows match your filter", "the request failed" and "this
 * record does not exist" are different messages with different recovery
 * actions, and collapsing them is how blank panels happen.
 */

function StateBlock({
  icon,
  iconClass,
  title,
  detail,
  action,
  /** `alert` is announced to screen readers; `status` is polite. */
  live,
}: {
  icon: IconName;
  iconClass: string;
  title: string;
  detail?: string;
  action?: ReactNode;
  live?: "alert" | "status";
}) {
  return (
    <div
      role={live}
      aria-live={live === "alert" ? "assertive" : live === "status" ? "polite" : undefined}
      className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-6 py-10 text-center"
    >
      <AppIcon name={icon} size="2xl" className={iconClass} />
      <p className="type-heading-sm mt-1 text-fg-primary">{title}</p>
      {detail && <p className="type-body-md max-w-[46ch] text-fg-tertiary">{detail}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Nothing exists yet. Says what would live here and how to create it. */
export function EmptyState({
  title,
  detail,
  action,
  icon = "inbox",
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <StateBlock
      icon={icon}
      iconClass="text-icon-quaternary"
      title={title}
      detail={detail}
      action={action}
    />
  );
}

/** Records exist but the current filter or search excludes all of them. */
export function NoResultsState({ onClear }: { onClear?: () => void }) {
  return (
    <StateBlock
      icon="search"
      iconClass="text-icon-quaternary"
      title="No matching records"
      detail="No records match the current search and filters."
      action={
        onClear ? (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        ) : undefined
      }
    />
  );
}

/** The request failed. Always offers a retry — never a bare spinner forever. */
export function ErrorState({
  title = "Could not load this data",
  detail = "The request did not complete. Retry, or refresh the page if it keeps failing.",
  onRetry,
}: {
  title?: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <StateBlock
      icon="error"
      iconClass="text-error-icon"
      title={title}
      detail={detail}
      live="alert"
      action={
        onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <AppIcon name="refresh" size="sm" /> Retry
          </Button>
        ) : undefined
      }
    />
  );
}

/**
 * The referenced record is gone or was never valid. Distinct from empty: the
 * user followed a link to something specific and it is not there.
 */
export function NotFoundState({
  entity,
  id,
  onBack,
  backLabel = "Back",
}: {
  /** e.g. "Impact Delta Report" */
  entity: string;
  id?: string | null;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <StateBlock
      icon="warning"
      iconClass="text-warning-icon"
      title={`${entity} not available`}
      detail={
        id
          ? `${id} could not be found. It may have been closed, reassigned, or superseded by a newer record.`
          : `No ${entity.toLowerCase()} is selected. Pick one from the queue to see it here.`
      }
      live="status"
      action={
        onBack ? (
          <Button variant="secondary" size="sm" onClick={onBack}>
            <AppIcon name="arrowLeft" size="sm" /> {backLabel}
          </Button>
        ) : undefined
      }
    />
  );
}

/** Not authorised for this area. Kept separate so it is never shown as empty. */
export function UnauthorizedState({ detail }: { detail?: string }) {
  return (
    <StateBlock
      icon="risk"
      iconClass="text-warning-icon"
      title="You do not have access to this area"
      detail={detail ?? "Ask a platform administrator to grant access to your role."}
      live="status"
    />
  );
}

/**
 * Loading placeholder that reserves the space the real content will take, so
 * nothing jumps when data lands.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-action ${className}`} aria-hidden="true" />;
}

/** Row-shaped skeletons for a table body. `cols` mirrors the real columns. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Loading records" className="divide-y divide-stroke-muted">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-3 py-2.5">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton
              key={c}
              className={`h-3 ${c === 0 ? "w-24" : c % 3 === 0 ? "w-16" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Block-shaped skeleton for cards, charts and detail sections. */
export function PanelSkeleton({
  lines = 4,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div role="status" aria-label="Loading" className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-1/2" : "w-full"}`} />
      ))}
    </div>
  );
}

import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "@/services/api";
import { Button } from "@/components/shared/Button";
import { AppIcon } from "@/components/icons";
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
  UnauthorizedState,
} from "@/components/shared/States";

/**
 * Renders a query's real state, and nothing else.
 *
 * The point of this component is that there is no path through it that
 * invents data: a query is either loading, failed, empty or has rows. An
 * empty collection renders an empty state — never a placeholder record.
 *
 * Failures are separated by kind because they mean different things to the
 * person reading the screen:
 *
 *   403  authenticated, not permitted — not a sign-in problem
 *   404  the collection or record does not exist on this backend
 *   5xx  the backend accepted the request and failed to answer it
 *   network/timeout  nothing reached the backend, or its error was blocked
 */
/**
 * True when a query is showing data it already had, but the most recent
 * attempt to refresh it failed.
 *
 * React Query does not report this through `status`: a refetch that fails
 * while data is cached leaves `status: "success"` and `isError: false`, and
 * surfaces the failure only as `failureCount`/`failureReason`. Without this
 * check, pressing Refresh against an unreachable backend leaves the previous
 * rows on screen looking exactly as they did — which is the one thing this
 * layer exists to prevent. The rows are real and stay; what is added is the
 * fact that they may no longer be current.
 */
function refreshFailure(query: {
  failureCount: number;
  failureReason: unknown;
  isFetching: boolean;
}): ApiError | null {
  if (query.isFetching || query.failureCount === 0) return null;
  return query.failureReason instanceof ApiError
    ? query.failureReason
    : new ApiError({ kind: "network", message: "The last refresh did not complete." });
}

/** Inline notice above content that is still shown but may be out of date. */
function StaleNotice({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  return (
    <div
      role="status"
      className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-warning-stroke bg-warning-bg px-3 py-2"
    >
      <AppIcon name="warning" size="sm" className="shrink-0 text-warning-icon" />
      <span className="type-body-sm min-w-0 flex-1 text-warning">
        Showing the last data that loaded — the most recent refresh failed. {error.message}
      </span>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function ApiState<T>({
  query,
  emptyTitle,
  emptyDetail,
  emptyAction,
  skeletonCols = 5,
  children,
}: {
  query: UseQueryResult<T[]>;
  emptyTitle: string;
  emptyDetail?: string;
  emptyAction?: ReactNode;
  skeletonCols?: number;
  /** Rendered only when the query succeeded with at least one row. */
  children: (rows: T[]) => ReactNode;
}) {
  if (query.isPending) return <TableSkeleton cols={skeletonCols} />;

  if (query.isError) {
    const error = query.error instanceof ApiError ? query.error : null;

    if (error?.kind === "forbidden") {
      return (
        <UnauthorizedState detail="Your role does not include access to this data. Ask an administrator to grant it." />
      );
    }

    if (error?.kind === "not_found") {
      return (
        <EmptyState
          icon="warning"
          title="Not available on this backend"
          detail="The API responded, but this collection does not exist at the expected path."
        />
      );
    }

    return (
      <ErrorState
        title={
          error?.kind === "server"
            ? "The PARIVART API could not complete this request"
            : "Could not load this data"
        }
        detail={error?.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const stale = refreshFailure(query);
  const rows = query.data ?? [];
  if (rows.length === 0) {
    return (
      <>
        {stale && <StaleNotice error={stale} onRetry={() => void query.refetch()} />}
        <EmptyState title={emptyTitle} detail={emptyDetail} action={emptyAction} />
      </>
    );
  }

  return (
    <>
      {stale && <StaleNotice error={stale} onRetry={() => void query.refetch()} />}
      {children(rows)}
    </>
  );
}

/**
 * The single-record counterpart to ApiState, for a detail route.
 *
 * Same contract, same failure vocabulary — the difference is what "nothing"
 * means. A collection that comes back empty is a legitimate empty state; a
 * record that comes back 404 is a dead link, so it reads as not found rather
 * than as an empty list. Detail screens previously passed their query to
 * ApiState, whose T is an array, which silently widened every field access to
 * `unknown[]`.
 */
export function ApiRecord<T>({
  query,
  notFoundTitle,
  notFoundDetail,
  skeletonCols = 2,
  children,
}: {
  query: UseQueryResult<T>;
  notFoundTitle: string;
  notFoundDetail?: string;
  skeletonCols?: number;
  /** Rendered only when the query succeeded and returned a record. */
  children: (record: T) => ReactNode;
}) {
  if (query.isPending) return <TableSkeleton cols={skeletonCols} />;

  if (query.isError) {
    const error = query.error instanceof ApiError ? query.error : null;

    if (error?.kind === "forbidden") {
      return (
        <UnauthorizedState detail="Your role does not include access to this record. Ask an administrator to grant it." />
      );
    }

    if (error?.kind === "not_found") {
      return <EmptyState icon="warning" title={notFoundTitle} detail={notFoundDetail} />;
    }

    return (
      <ErrorState
        title={
          error?.kind === "server"
            ? "The PARIVART API could not complete this request"
            : "Could not load this record"
        }
        detail={error?.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  // A 200 with no body is not a record. Treated as not found rather than
  // rendered as a shell of empty fields.
  if (query.data == null) {
    return <EmptyState icon="warning" title={notFoundTitle} detail={notFoundDetail} />;
  }

  const stale = refreshFailure(query);
  return (
    <>
      {stale && <StaleNotice error={stale} onRetry={() => void query.refetch()} />}
      {children(query.data)}
    </>
  );
}

/**
 * Small header control showing where the rows came from and letting the user
 * refetch. `isFetching` covers a background refresh, which `isPending` does
 * not — so a refresh reads as activity rather than appearing to do nothing.
 */
export function ApiRefresh({ query }: { query: UseQueryResult<unknown> }) {
  return (
    <span className="flex items-center gap-2">
      {query.isFetching && !query.isPending && (
        <span className="type-caption text-fg-quaternary">Refreshing…</span>
      )}
      <Button
        variant="secondary"
        size="sm"
        disabled={query.isFetching}
        onClick={() => void query.refetch()}
      >
        <AppIcon name="refresh" size="sm" /> Refresh
      </Button>
    </span>
  );
}

/** Row count for a page header — only ever the real length. */
export function ApiCount({ query }: { query: UseQueryResult<unknown[]> }) {
  if (query.isPending || query.isError) return null;
  const count = query.data?.length ?? 0;
  return (
    <span className="type-body-md tabular text-fg-tertiary">
      {count} {count === 1 ? "record" : "records"}
    </span>
  );
}

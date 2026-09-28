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

  const rows = query.data ?? [];
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} detail={emptyDetail} action={emptyAction} />;
  }

  return <>{children(rows)}</>;
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

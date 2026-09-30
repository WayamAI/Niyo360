import { useMemo } from "react";
import { useImpactAssessments } from "@/hooks/useApiQueries";
import type { ImpactAssessment, ImpactItem } from "@/services/api";

/**
 * Resolves an impact item id to the item and the assessment that owns it.
 *
 * Needed because the backend serves no `GET /impact/items/{id}`: items are
 * reachable only through their parent, so an `Action.impact_item_id` is on its
 * own a dead end. Without this, a chain like evidence → action → impact → change
 * stops at a UUID.
 *
 * `GET /impact/` eager-loads each assessment's items, so the join is done here
 * from one request rather than by walking assessments one at a time. That is the
 * same approach `usePortfolioNames` takes to turn matched entity ids into names.
 *
 * The cost is honest: this reads the assessment collection, so it is bounded by
 * `limit` like any other list. A record outside that page resolves to null, and
 * `isPartial` says so rather than letting a caller present "not found" for what
 * is really "not fetched".
 */

export interface ImpactItemLocation {
  item: ImpactItem;
  assessment: ImpactAssessment;
}

export function useImpactItemLocator(enabled = true) {
  const query = useImpactAssessments({ limit: 200 }, { enabled });

  const index = useMemo(() => {
    const map = new Map<string, ImpactItemLocation>();
    for (const assessment of query.data ?? []) {
      for (const item of assessment.items ?? []) {
        map.set(item.id, { item, assessment });
      }
    }
    return map;
  }, [query.data]);

  return {
    /** The item and its parent assessment, or null if not in the fetched page. */
    locate: (itemId: string | null | undefined): ImpactItemLocation | null =>
      itemId ? (index.get(itemId) ?? null) : null,
    isLoading: query.isPending,
    /**
     * True when the lookup table could not be built, so a null from `locate`
     * means "could not check" rather than "does not exist".
     */
    isPartial: query.isError,
  };
}

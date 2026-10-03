export type SortDir = "asc" | "desc";

export interface SortState {
  key: string;
  dir: SortDir;
}

/**
 * Comparator for table cell values. Nulls/undefined always sort last
 * regardless of direction, so toggling sort never hides missing data.
 * Dates compare by time value; numbers compare numerically; everything
 * else falls back to a locale-aware, numeric-substring-aware string compare
 * (so "Item 2" sorts before "Item 10").
 */
export function compareValues(a: unknown, b: unknown, dir: SortDir): number {
  const mul = dir === "asc" ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return (a.getTime() - b.getTime()) * mul;
  if (typeof a === "number" && typeof b === "number") return (a - b) * mul;
  return (
    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }) * mul
  );
}

/**
 * Returns a new, sorted array (source array is never mutated). Passing
 * `sort: undefined` returns the rows unchanged, preserving "unsorted" as a
 * distinct, visible state rather than an implicit default order.
 */
export function sortRows<T>(
  rows: readonly T[],
  sort: SortState | undefined,
  valueFor: (row: T, key: string) => unknown,
): T[] {
  if (!sort) return [...rows];
  return [...rows].sort((a, b) =>
    compareValues(valueFor(a, sort.key), valueFor(b, sort.key), sort.dir),
  );
}

/** Cycles asc -> desc -> unsorted for the given column key. */
export function toggleSortState(
  current: SortState | undefined,
  key: string,
): SortState | undefined {
  if (current?.key !== key) return { key, dir: "asc" };
  if (current.dir === "asc") return { key, dir: "desc" };
  return undefined;
}

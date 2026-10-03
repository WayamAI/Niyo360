import { describe, expect, it } from "vitest";
import { compareValues, sortRows, toggleSortState } from "./tableSort";

describe("compareValues", () => {
  it("sorts strings alphabetically, case-insensitively", () => {
    expect(compareValues("banana", "Apple", "asc")).toBeGreaterThan(0);
    expect(compareValues("apple", "APPLE", "asc")).toBe(0);
  });

  it("sorts strings with embedded numbers numerically", () => {
    expect(compareValues("Item 2", "Item 10", "asc")).toBeLessThan(0);
  });

  it("sorts numbers numerically", () => {
    expect(compareValues(2, 10, "asc")).toBeLessThan(0);
    expect(compareValues(10, 2, "asc")).toBeGreaterThan(0);
    expect(compareValues(5, 5, "asc")).toBe(0);
  });

  it("sorts dates by time value", () => {
    const earlier = new Date("2026-01-01");
    const later = new Date("2026-06-01");
    expect(compareValues(earlier, later, "asc")).toBeLessThan(0);
    expect(compareValues(later, earlier, "asc")).toBeGreaterThan(0);
  });

  it("reverses order for descending direction", () => {
    expect(compareValues(2, 10, "desc")).toBeGreaterThan(0);
    expect(compareValues("a", "b", "desc")).toBeGreaterThan(0);
  });

  it("always sorts null/undefined last regardless of direction", () => {
    expect(compareValues(null, 5, "asc")).toBeGreaterThan(0);
    expect(compareValues(5, null, "asc")).toBeLessThan(0);
    expect(compareValues(null, 5, "desc")).toBeGreaterThan(0);
    expect(compareValues(undefined, "a", "asc")).toBeGreaterThan(0);
    expect(compareValues(null, undefined, "asc")).toBe(0);
  });

  it("never throws on null/undefined input", () => {
    expect(() => compareValues(null, null, "asc")).not.toThrow();
    expect(() => compareValues(undefined, 1, "desc")).not.toThrow();
  });
});

describe("sortRows", () => {
  interface Row {
    id: string;
    name: string;
    score: number | null;
  }

  const rows: Row[] = [
    { id: "a", name: "Charlie", score: 3 },
    { id: "b", name: "Alice", score: null },
    { id: "c", name: "Bob", score: 1 },
    { id: "d", name: "Dana", score: 2 },
  ];

  it("returns rows unchanged (but as a new array) when sort is undefined", () => {
    const result = sortRows(rows, undefined, (r) => r.score);
    expect(result).toEqual(rows);
    expect(result).not.toBe(rows);
  });

  it("sorts ascending and descending by the given field", () => {
    const asc = sortRows(rows, { key: "score", dir: "asc" }, (r) => r.score);
    expect(asc.map((r) => r.id)).toEqual(["c", "d", "a", "b"]);

    const desc = sortRows(rows, { key: "score", dir: "desc" }, (r) => r.score);
    expect(desc.map((r) => r.id)).toEqual(["a", "d", "c", "b"]);
  });

  it("does not mutate the source array", () => {
    const copy = [...rows];
    sortRows(rows, { key: "score", dir: "asc" }, (r) => r.score);
    expect(rows).toEqual(copy);
  });

  it("keeps equal-valued rows in their original relative order (stable sort)", () => {
    const tied: Row[] = [
      { id: "x1", name: "same", score: 1 },
      { id: "x2", name: "same", score: 1 },
      { id: "x3", name: "same", score: 1 },
    ];
    const result = sortRows(tied, { key: "score", dir: "asc" }, (r) => r.score);
    expect(result.map((r) => r.id)).toEqual(["x1", "x2", "x3"]);
  });

  it("handles an empty array without throwing", () => {
    expect(sortRows([], { key: "score", dir: "asc" }, (r: Row) => r.score)).toEqual([]);
  });

  it("composes with a prior filter step", () => {
    const filtered = rows.filter((r) => r.score != null && r.score > 1);
    const sorted = sortRows(filtered, { key: "score", dir: "desc" }, (r) => r.score);
    expect(sorted.map((r) => r.id)).toEqual(["a", "d"]);
  });
});

describe("toggleSortState", () => {
  it("starts a new column at ascending", () => {
    expect(toggleSortState(undefined, "name")).toEqual({ key: "name", dir: "asc" });
    expect(toggleSortState({ key: "other", dir: "desc" }, "name")).toEqual({
      key: "name",
      dir: "asc",
    });
  });

  it("cycles the same column asc -> desc -> unsorted", () => {
    const asc = toggleSortState(undefined, "name");
    const desc = toggleSortState(asc, "name");
    const unsorted = toggleSortState(desc, "name");
    expect(asc).toEqual({ key: "name", dir: "asc" });
    expect(desc).toEqual({ key: "name", dir: "desc" });
    expect(unsorted).toBeUndefined();
  });
});

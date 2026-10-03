import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { AppIcon } from "@/components/icons";
import { EmptyState, ErrorState, NoResultsState, TableSkeleton } from "@/components/shared/States";
import { sortRows, toggleSortState, type SortDir, type SortState } from "@/lib/tableSort";

/**
 * Operational high-density table from Chronos:
 *
 * Sticky header, subtle border tokens, monospace tabular IDs and numbers,
 * rounded-full search and pager controls, and a responsive container-query
 * card list below 720px.
 */

export type { SortDir, SortState };

export interface Column<T> {
  key: string;
  header: string;
  /** Tailwind width utility, e.g. "w-28". Omit to size by content. */
  width?: string;
  align?: "left" | "right" | "center";
  /** Drop from the table below a container width; the stacked card keeps it. */
  hide?: "md" | "lg";
  /** Role in the stacked layout. Defaults: first column is the title. */
  card?: false | "title" | "meta" | "field";
  render: (row: T) => ReactNode;
  /** Sort/search/export primitive for this column. */
  value?: (row: T) => string | number | null | undefined;
}

const HIDE_CLASS = {
  md: "@max-[900px]:hidden",
  lg: "@max-[1180px]:hidden",
} as const;

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv<T>(rows: T[], columns: Column<T>[]): string {
  const cols = columns.filter((c) => c.value);
  const head = cols.map((c) => csvCell(c.header)).join(",");
  const body = rows
    .map((row) => cols.map((c) => csvCell(String(c.value?.(row) ?? ""))).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name.endsWith(".csv") ? name : `${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Checkbox that renders as a real ARIA checkbox matching Chronos style. */
function CheckBox({
  checked,
  mixed = false,
  label,
  onChange,
}: {
  checked: boolean;
  mixed?: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={`grid size-4 shrink-0 place-items-center rounded-[4px] border outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-ring ${
        checked || mixed
          ? "border-transparent bg-action-primary text-on-action-primary"
          : "border-stroke-default bg-action hover:border-stroke-active"
      }`}
    >
      {checked ? (
        <span className="text-[10px] font-bold leading-none">✓</span>
      ) : mixed ? (
        <span className="h-0.5 w-2 rounded-full bg-on-action-primary" />
      ) : null}
    </button>
  );
}

function onRowKeyDown<T>(event: KeyboardEvent<HTMLElement>, row: T, onOpen?: (row: T) => void) {
  if (!onOpen) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onOpen(row);
  }
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowOpen?: (row: T) => void;
  isRowActive?: (row: T) => boolean;
  emptyTitle?: string;
  emptyDetail?: string;
  emptyAction?: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  getSearchText?: (row: T) => string;
  defaultSort?: SortState;
  pageSize?: number;
  selectable?: boolean;
  selectedKeys?: ReadonlySet<string>;
  onSelectedKeysChange?: (keys: Set<string>) => void;
  exportName?: string;
  toolbar?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowOpen,
  isRowActive,
  emptyTitle = "No records match this view",
  emptyDetail,
  emptyAction,
  searchable = true,
  searchPlaceholder = "Search this queue…",
  getSearchText,
  defaultSort,
  pageSize = 30,
  selectable = false,
  selectedKeys,
  onSelectedKeysChange,
  exportName,
  toolbar,
  loading = false,
  error = null,
  onRetry,
  className = "",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | undefined>(defaultSort);
  const [page, setPage] = useState(0);

  const [localSelected, setLocalSelected] = useState<Set<string>>(() => new Set());
  const selected = selectedKeys ? new Set(selectedKeys) : localSelected;

  const titleColumn = columns.find((c) => c.card === "title") ?? columns[0];
  const metaColumn = columns.find((c) => c.card === "meta");
  const fieldColumns = columns.filter(
    (c) => c !== titleColumn && c !== metaColumn && c.card !== false,
  );
  const actionColumn = columns.find((c) => c.card === false);

  const filtered = useMemo(() => {
    let result = rows;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((row) => {
        if (getSearchText?.(row).toLowerCase().includes(q)) return true;
        return columns.some((col) => {
          if (!col.value) return false;
          const v = col.value(row);
          return v != null && String(v).toLowerCase().includes(q);
        });
      });
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key && c.value);
      if (col?.value) {
        result = sortRows(result, sort, (row) => col.value!(row));
      }
    }
    return result;
  }, [rows, query, sort, columns, getSearchText]);

  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount - 1);
  const visible = useMemo(() => {
    if (pageSize <= 0) return filtered;
    const start = currentPage * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [query]);

  const visibleKeys = useMemo(() => visible.map(rowKey), [visible, rowKey]);
  const allSelected = visibleKeys.length > 0 && visibleKeys.every((k) => selected.has(k));
  const someSelected = visibleKeys.some((k) => selected.has(k));

  const interactive = Boolean(onRowOpen);
  const showToolbar = Boolean(searchable || exportName || toolbar);

  function toggleSort(key: string) {
    setSort((current) => toggleSortState(current, key));
  }

  function setKey(key: string, next: boolean) {
    const copy = new Set(selected);
    if (next) copy.add(key);
    else copy.delete(key);
    if (onSelectedKeysChange) onSelectedKeysChange(copy);
    else setLocalSelected(copy);
  }

  function setAllVisible(next: boolean) {
    const copy = new Set(selected);
    for (const key of visibleKeys) {
      if (next) copy.add(key);
      else copy.delete(key);
    }
    if (onSelectedKeysChange) onSelectedKeysChange(copy);
    else setLocalSelected(copy);
  }

  const rowTone = (active: boolean) =>
    active ? "bg-raised" : "hover:bg-raised focus-visible:bg-raised";

  return (
    <section
      className={`@container isolate flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-stroke-muted bg-container ${className}`}
    >
      {showToolbar && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stroke-muted px-3.5 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {searchable && (
              <div className="relative min-w-[14rem] max-w-sm flex-1">
                <AppIcon
                  name="search"
                  size="xs"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-icon-quaternary"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="h-8 w-full rounded-full border border-stroke-muted bg-action pr-3 pl-8 text-label-sm text-secondary outline-none transition-colors duration-[180ms] placeholder:text-quaternary hover:border-stroke-default hover:bg-raised-2 focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
            <span className="hidden text-caption tabular text-quaternary sm:inline">
              {filtered.length} {filtered.length === 1 ? "row" : "rows"}
              {selected.size ? ` · ${selected.size} selected` : ""}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {toolbar}
            {exportName && (
              <button
                type="button"
                disabled={!filtered.length}
                onClick={() => downloadCsv(exportName, toCsv(filtered, columns))}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-stroke-muted bg-action px-3 text-label-sm text-secondary outline-none transition-colors duration-[180ms] hover:border-stroke-default hover:bg-raised-2 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
              >
                <AppIcon name="download" size="xs" /> Export CSV
              </button>
            )}
          </div>
        </div>
      )}

      {error ? (
        <ErrorState onRetry={onRetry} />
      ) : loading ? (
        <TableSkeleton cols={Math.min(columns.length, 6)} />
      ) : !filtered.length ? (
        query ? (
          <NoResultsState onClear={() => setQuery("")} />
        ) : (
          <EmptyState title={emptyTitle} detail={emptyDetail} action={emptyAction} />
        )
      ) : (
        <>
          {/* Narrow layout: stacked cards */}
          <ul className="scrollbar-thin min-h-0 flex-1 overflow-y-auto @min-[720px]:hidden">
            {visible.map((row) => {
              const key = rowKey(row);
              const active = isRowActive?.(row) ?? false;
              return (
                <li key={key} className="border-b border-stroke-muted last:border-b-0">
                  <div
                    role={interactive ? "button" : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    onClick={onRowOpen ? () => onRowOpen(row) : undefined}
                    onKeyDown={(event) => onRowKeyDown(event, row, onRowOpen)}
                    className={`flex flex-col gap-2 px-4 py-3 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none ${
                      interactive ? "cursor-pointer" : ""
                    } ${rowTone(active)}`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex min-w-0 items-start gap-2.5">
                        {selectable && (
                          <span className="mt-0.5">
                            <CheckBox
                              checked={selected.has(key)}
                              label={`Select ${key}`}
                              onChange={(next) => setKey(key, next)}
                            />
                          </span>
                        )}
                        <div className="min-w-0 text-body-sm font-medium text-primary">
                          {titleColumn?.render(row)}
                        </div>
                      </div>
                      {metaColumn && <div className="shrink-0">{metaColumn.render(row)}</div>}
                    </div>
                    {fieldColumns.length > 0 && (
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
                        {fieldColumns.map((col) => (
                          <div key={col.key} className="min-w-0">
                            <dt className="text-caption font-medium tracking-[0.06em] text-quaternary uppercase">
                              {col.header}
                            </dt>
                            <dd className="mt-0.5 truncate text-body-sm text-secondary">
                              {col.render(row)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {actionColumn && (
                      <div
                        className="flex items-center gap-1.5 pt-1"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {actionColumn.render(row)}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Wide layout: High-density real table with sticky identity */}
          <div className="scrollbar-thin hidden min-h-0 min-w-0 flex-1 overflow-auto @min-[720px]:block">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-container">
                <tr className="border-b border-stroke-muted">
                  {selectable && (
                    <th scope="col" className="w-10 px-3 py-2.5">
                      <CheckBox
                        checked={allSelected}
                        mixed={someSelected && !allSelected}
                        label="Select all rows on this page"
                        onChange={setAllVisible}
                      />
                    </th>
                  )}
                  {columns.map((col) => {
                    const canSort = Boolean(col.value);
                    const active = sort?.key === col.key;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={
                          active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined
                        }
                        className={`px-3 py-2.5 text-caption font-medium tracking-[0.08em] text-quaternary uppercase whitespace-nowrap ${
                          ALIGN_CLASS[col.align ?? "left"]
                        } ${col.width ?? ""} ${col.hide ? HIDE_CLASS[col.hide] : ""}`}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key)}
                            className={`inline-flex items-center gap-1 outline-none transition-colors duration-150 hover:text-secondary focus-visible:text-secondary ${
                              active ? "text-secondary font-semibold" : ""
                            } ${col.align === "right" ? "flex-row-reverse" : ""}`}
                          >
                            {col.header}
                            <AppIcon
                              name={active && sort!.dir === "desc" ? "chevronDown" : "chevronUp"}
                              size="xs"
                              className={active ? "text-primary" : "opacity-0"}
                            />
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const key = rowKey(row);
                  const active = isRowActive?.(row) ?? false;
                  return (
                    <tr
                      key={key}
                      tabIndex={interactive ? 0 : undefined}
                      aria-selected={isRowActive ? active : undefined}
                      onClick={onRowOpen ? () => onRowOpen(row) : undefined}
                      onKeyDown={(event) => onRowKeyDown(event, row, onRowOpen)}
                      className={`group border-b border-stroke-muted transition-colors duration-[150ms] outline-none last:border-b-0 focus-visible:bg-raised ${
                        interactive ? "cursor-pointer" : ""
                      } ${rowTone(active)}`}
                    >
                      {selectable && (
                        <td className="px-3 py-2 align-middle">
                          <CheckBox
                            checked={selected.has(key)}
                            label={`Select ${key}`}
                            onChange={(next) => setKey(key, next)}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-3 py-2 align-middle text-body-sm text-secondary whitespace-nowrap ${
                            ALIGN_CLASS[col.align ?? "left"]
                          } ${col.hide ? HIDE_CLASS[col.hide] : ""}`}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !error && pageSize > 0 && filtered.length > pageSize && (
        <nav
          aria-label="Pagination"
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-stroke-muted px-3.5 py-2.5"
        >
          <span className="text-caption tabular text-quaternary">
            Showing {currentPage * pageSize + 1}–
            {Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length} rows
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-stroke-muted bg-action px-3 text-label-sm text-secondary outline-none transition-colors duration-[180ms] hover:border-stroke-default hover:bg-raised-2 hover:text-primary disabled:opacity-40"
            >
              <AppIcon name="chevronLeft" size="xs" /> Previous
            </button>
            <span className="text-caption tabular font-medium text-secondary">
              {currentPage + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(currentPage + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-stroke-muted bg-action px-3 text-label-sm text-secondary outline-none transition-colors duration-[180ms] hover:border-stroke-default hover:bg-raised-2 hover:text-primary disabled:opacity-40"
            >
              Next <AppIcon name="chevronRight" size="xs" />
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}

import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { AppIcon } from "@/components/icons";
import { Button } from "@/components/shared/Button";
import { EmptyState, ErrorState, NoResultsState, TableSkeleton } from "@/components/shared/States";

/**
 * The application's one operational table.
 *
 * Every queue screen was hand-rolling the same scaffold — a <table> with a
 * `bg-action type-label-md` head, `px-4 py-3` cells, a local `Th` helper and
 * no sorting, paging, empty state or narrow-width story. This owns all of
 * that once so screens only declare their columns.
 *
 * Two layouts, chosen by the *container's* width rather than the viewport's,
 * so a table inside a split panel adapts on its own: a real table with a
 * sticky header above ~720px, and a stacked record list below it. The stacked
 * list is a redesign of the row, not a squeezed table — the prompt for this
 * work is explicit that shrinking the desktop layout is not responsive design.
 */

export type SortDir = "asc" | "desc";

export interface SortState {
  key: string;
  dir: SortDir;
}

export interface Column<T> {
  key: string;
  header: string;
  /** Tailwind width utility, e.g. "w-28". Omit to size by content. */
  width?: string;
  align?: "left" | "right" | "center";
  /** Drop from the table below a container width; the stacked card keeps it. */
  hide?: "md" | "lg";
  /**
   * Role in the stacked layout. Defaults: first column is the title, and
   * everything else becomes a labelled field. `false` omits it entirely —
   * use that for row-action columns, which the card renders separately.
   */
  card?: false | "title" | "meta" | "field";
  render: (row: T) => ReactNode;
  /**
   * Sort/search/export primitive for this column. Columns without one are not
   * sortable and are skipped by search and CSV.
   */
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

function compare(a: unknown, b: unknown, dir: SortDir): number {
  const mul = dir === "asc" ? 1 : -1;
  if (a == null && b == null) return 0;
  // Blanks sort last in either direction: "—" is absence, not a low value.
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * mul;
  return (
    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }) * mul
  );
}

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

/** Checkbox that renders as a real ARIA checkbox so it can be styled to token. */
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
      className={`grid size-4 shrink-0 place-items-center rounded-sm border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
        checked || mixed
          ? "border-transparent bg-brand text-on-brand"
          : "border-stroke-active bg-container hover:border-stroke-active hover:bg-action"
      }`}
    >
      {mixed ? (
        <span className="h-0.5 w-2 rounded-full bg-current" />
      ) : checked ? (
        <AppIcon name="success" size="xs" />
      ) : null}
    </button>
  );
}

/**
 * Move focus between rows with the arrow keys and open one with Enter/Space,
 * so a clickable row is not mouse-only.
 */
function onRowKeyDown<T>(event: KeyboardEvent<HTMLElement>, row: T, onOpen?: (row: T) => void) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const sibling =
      event.key === "ArrowDown"
        ? event.currentTarget.nextElementSibling
        : event.currentTarget.previousElementSibling;
    if (sibling instanceof HTMLElement) {
      event.preventDefault();
      sibling.focus();
    }
    return;
  }
  if (onOpen && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    onOpen(row);
  }
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowOpen,
  isRowActive,
  loading = false,
  error = false,
  onRetry,
  emptyTitle = "No records",
  emptyDetail,
  emptyAction,
  searchable = true,
  searchPlaceholder = "Search records",
  getSearchText,
  defaultSort,
  pageSize = 25,
  selectable = false,
  selectedKeys,
  onSelectedKeysChange,
  exportName,
  toolbar,
  className = "",
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Makes rows interactive: click, Enter/Space, and arrow-key traversal. */
  onRowOpen?: (row: T) => void;
  /** Highlights the row currently open in a drawer or detail pane. */
  isRowActive?: (row: T) => boolean;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDetail?: string;
  emptyAction?: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Extra haystack for search beyond the columns' own `value`s. */
  getSearchText?: (row: T) => string;
  defaultSort?: SortState;
  /** Rows per page. 0 disables paging. */
  pageSize?: number;
  selectable?: boolean;
  selectedKeys?: ReadonlySet<string>;
  onSelectedKeysChange?: (keys: Set<string>) => void;
  /** Enables CSV export of the filtered rows under this filename. */
  exportName?: string;
  /** Filters and scope controls, rendered to the left of search. */
  toolbar?: ReactNode;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | undefined>(defaultSort);
  const [page, setPage] = useState(0);

  // Paging into a page that no longer exists after a filter change shows an
  // empty body over a non-empty result, so reset whenever the inputs change.
  useEffect(() => {
    setPage(0);
  }, [query, sort, rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? rows.filter((row) => {
          if (getSearchText?.(row).toLowerCase().includes(q)) return true;
          return columns.some((col) => {
            const value = col.value?.(row);
            return value != null && String(value).toLowerCase().includes(q);
          });
        })
      : rows;
    if (!sort) return matched;
    const col = columns.find((c) => c.key === sort.key && c.value);
    if (!col?.value) return matched;
    return [...matched].sort((a, b) => compare(col.value!(a), col.value!(b), sort.dir));
  }, [rows, query, sort, columns, getSearchText]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount - 1);
  const visible = pageSize
    ? filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : filtered;

  const selected = selectedKeys ?? new Set<string>();
  const visibleKeys = visible.map(rowKey);
  const allSelected = visibleKeys.length > 0 && visibleKeys.every((k) => selected.has(k));
  const someSelected = visibleKeys.some((k) => selected.has(k));

  const bodyColumns = columns.filter((c) => c.card !== false);
  const titleColumn = bodyColumns.find((c) => c.card === "title") ?? bodyColumns[0];
  const metaColumn = bodyColumns.find((c) => c.card === "meta");
  const fieldColumns = bodyColumns.filter((c) => c !== titleColumn && c !== metaColumn);
  const actionColumn = columns.find((c) => c.card === false);

  const sortable = columns.some((c) => c.value);
  const interactive = Boolean(onRowOpen);
  const showToolbar = Boolean(searchable || exportName || toolbar || sortable);

  function toggleSort(key: string) {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return undefined;
    });
  }

  function setKey(key: string, next: boolean) {
    if (!onSelectedKeysChange) return;
    const copy = new Set(selected);
    if (next) copy.add(key);
    else copy.delete(key);
    onSelectedKeysChange(copy);
  }

  function setAllVisible(next: boolean) {
    if (!onSelectedKeysChange) return;
    const copy = new Set(selected);
    for (const key of visibleKeys) {
      if (next) copy.add(key);
      else copy.delete(key);
    }
    onSelectedKeysChange(copy);
  }

  const rowTone = (active: boolean) =>
    active ? "bg-raised-2" : "hover:bg-raised-2 focus-visible:bg-raised-2";

  return (
    <section
      className={`@container flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-stroke-default bg-container ${className}`}
    >
      {showToolbar && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-stroke-muted px-3 py-2">
          {toolbar}
          {searchable && (
            <div className="relative min-w-[160px] flex-1">
              <AppIcon
                name="search"
                size="sm"
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-icon-quaternary"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="type-body-md h-8 w-full rounded-md border border-stroke-default bg-action pr-3 pl-8 text-fg-primary transition-colors duration-150 placeholder:text-fg-quaternary hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>
          )}
          {exportName && (
            <Button
              variant="secondary"
              size="sm"
              disabled={!filtered.length}
              onClick={() => downloadCsv(exportName, toCsv(filtered, columns))}
            >
              <AppIcon name="download" size="sm" /> Export CSV
            </Button>
          )}
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
          {/* Narrow: one record per card, fields labelled. */}
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
                    className={`flex flex-col gap-2 px-3 py-2.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none ${
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
                        <div className="type-body-md min-w-0 text-fg-primary">
                          {titleColumn?.render(row)}
                        </div>
                      </div>
                      {metaColumn && <div className="shrink-0">{metaColumn.render(row)}</div>}
                    </div>
                    {fieldColumns.length > 0 && (
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
                        {fieldColumns.map((col) => (
                          <div key={col.key} className="min-w-0">
                            <dt className="type-label-sm text-fg-quaternary">{col.header}</dt>
                            <dd className="type-body-sm mt-0.5 line-clamp-2 text-fg-secondary">
                              {col.render(row)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {actionColumn && (
                      <div
                        className="flex items-center gap-1"
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

          {/* Wide: real table, sticky header, its own horizontal scroll. */}
          <div className="scrollbar-thin hidden max-h-[68vh] min-h-0 min-w-0 flex-1 overflow-auto @min-[720px]:block">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-container">
                <tr className="border-b border-stroke-default">
                  {selectable && (
                    <th scope="col" className="w-10 px-3 py-2">
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
                        className={`type-label-md px-3 py-2 whitespace-nowrap text-fg-quaternary ${
                          ALIGN_CLASS[col.align ?? "left"]
                        } ${col.width ?? ""} ${col.hide ? HIDE_CLASS[col.hide] : ""}`}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key)}
                            className={`inline-flex items-center gap-1 rounded transition-colors duration-150 hover:text-fg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                              active ? "text-fg-secondary" : ""
                            } ${col.align === "right" ? "flex-row-reverse" : ""}`}
                          >
                            {col.header}
                            <AppIcon
                              name={active && sort!.dir === "desc" ? "chevronDown" : "chevronUp"}
                              size="xs"
                              className={active ? "" : "opacity-0"}
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
                      className={`border-b border-stroke-muted transition-colors duration-150 last:border-b-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none ${
                        interactive ? "cursor-pointer" : ""
                      } ${rowTone(active)}`}
                    >
                      {selectable && (
                        <td className="px-3 py-2">
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
                          className={`type-body-md px-3 py-2 align-middle text-fg-secondary ${
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
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-stroke-muted px-3 py-2"
        >
          <span className="type-caption tabular text-fg-quaternary">
            {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filtered.length)}{" "}
            of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
            >
              <AppIcon name="chevronLeft" size="sm" /> Previous
            </Button>
            <span className="type-caption tabular text-fg-quaternary">
              {currentPage + 1} / {pageCount}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(currentPage + 1)}
            >
              Next <AppIcon name="chevronRight" size="sm" />
            </Button>
          </div>
        </nav>
      )}
    </section>
  );
}

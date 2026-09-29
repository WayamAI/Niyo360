import type { ReactNode } from "react";
import { AppIcon } from "@/components/icons";

/**
 * Page composition primitives.
 *
 * Every screen is `PageHeader` + `PageBody` inside the shell's <main>. The
 * header is outside the scroll container so page identity and scope controls
 * stay put while a long queue scrolls underneath — the same split the top bar
 * uses against the sidebar.
 */

export interface Crumb {
  label: string;
  /** Omit on the last crumb: the current page is not a link. */
  onClick?: () => void;
}

/** Compact trail above the page title. Home is an icon, not the word "Home". */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1 flex min-w-0 items-center gap-1.5 text-2xs">
      <AppIcon name="home" size="xs" className="text-icon-quaternary" aria-label="Home" />
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={item.label} className="flex min-w-0 items-center gap-1.5">
            <span aria-hidden="true" className="text-fg-quaternary">
              /
            </span>
            {item.onClick && !last ? (
              <button
                type="button"
                onClick={item.onClick}
                className="truncate rounded text-fg-quaternary transition-colors duration-150 hover:text-fg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.label}
              </button>
            ) : (
              <span className={`truncate ${last ? "text-fg-tertiary" : "text-fg-quaternary"}`}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  badges,
  actions,
  onBack,
  children,
  source,
}: {
  title: string;
  /** One sentence on what the screen is for. Kept to ~2 lines at any width. */
  description?: string;
  breadcrumb?: Crumb[];
  /** Status/type badges that belong to the page subject, beside the title. */
  badges?: ReactNode;
  /** Right-aligned scope controls and actions. Primary action goes last. */
  actions?: ReactNode;
  /** Renders a back control ahead of the title — detail pages only. */
  onBack?: () => void;
  /** Optional second row: filter chips, tabs, or a toolbar. */
  children?: ReactNode;
  /**
   * Marks the whole screen live or illustrative. Every screen that renders the
   * bundled example dataset rather than the PARIVART API sets
   * `source="illustrative"`, so nobody has to guess which is which.
   */
  source?: DataSource;
}) {
  return (
    <header className="shrink-0 border-b border-stroke-muted bg-page px-4 py-3.5 sm:px-5">
      <div className="mx-auto flex max-w-[var(--page-max)] flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div className="flex min-w-0 gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md text-icon-tertiary transition-colors duration-150 hover:bg-action-tertiary-hover hover:text-icon-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <AppIcon name="arrowLeft" size="sm" />
            </button>
          )}
          <div className="min-w-0">
            {breadcrumb && <Breadcrumb items={breadcrumb} />}
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="type-display-page-sm min-w-0 text-fg-primary">{title}</h1>
              {source && <DataSourceTag source={source} />}
              {badges}
            </div>
            {description && (
              <p className="type-body-md mt-1 max-w-[80ch] text-fg-tertiary">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mx-auto mt-3 min-w-0 max-w-[var(--page-max)]">{children}</div>}
    </header>
  );
}

/**
 * The page's scroll container. Owns the only vertical scrollbar in <main>, and
 * caps content at --page-max so a 2560px monitor does not stretch a table to
 * the point where the eye cannot track a row across it. The cap is applied
 * inside the padding so the header's rule still spans the full width.
 */
export function PageBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="scrollbar-thin min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-5">
      <div className={`mx-auto flex min-h-full max-w-[var(--page-max)] flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Label above a group of cards or panels, with room for a description and an
 * action. Replaces the per-screen eyebrow markup this app used to repeat.
 */
export function SectionHeader({
  title,
  description,
  action,
  source,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  /**
   * Where this section's numbers come from. The app shows live PARIVART API
   * data next to an illustrative dataset for capabilities the backend does not
   * expose yet, and a viewer cannot tell them apart by looking. Stating it per
   * section is the only honest way to render both on one page — a single badge
   * on the page cannot be true of all of it.
   */
  source?: DataSource;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="type-label-md flex flex-wrap items-center gap-2 text-fg-quaternary">
          {title}
          {source && <DataSourceTag source={source} />}
        </h2>
        {description && (
          <p className="type-body-sm mt-1 max-w-[80ch] text-fg-tertiary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export type DataSource = "live" | "illustrative";

const SOURCE_COPY: Record<DataSource, { label: string; title: string; className: string }> = {
  live: {
    label: "Live",
    title: "Read from the PARIVART API.",
    className: "border-success-icon/40 text-success",
  },
  illustrative: {
    label: "Illustrative",
    title:
      "A worked example shipped with the app. The PARIVART API does not serve this capability yet, so these figures are not your organisation's data.",
    className: "border-stroke-default text-fg-quaternary",
  },
};

/**
 * Marks a block of the UI as live or illustrative.
 *
 * Deliberately quiet — it sits beside a section heading rather than shouting
 * over the content — but never absent from an illustrative block.
 */
export function DataSourceTag({ source }: { source: DataSource }) {
  const copy = SOURCE_COPY[source];
  return (
    <span
      title={copy.title}
      className={`type-caption rounded border px-1.5 py-px font-medium ${copy.className}`}
    >
      {copy.label}
    </span>
  );
}

/**
 * Label/value pair used across detail pages and drawers, so record metadata
 * is not re-styled per screen.
 */
export function Field({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="type-label-sm text-fg-quaternary">{label}</dt>
      <dd className={`type-body-md mt-0.5 text-fg-primary ${mono ? "font-mono" : ""}`}>
        {children}
      </dd>
    </div>
  );
}

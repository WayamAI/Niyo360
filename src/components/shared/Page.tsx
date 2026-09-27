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
}) {
  return (
    <header className="shrink-0 border-b border-stroke-muted bg-page px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
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
              {badges}
            </div>
            {description && (
              <p className="type-body-md mt-1 max-w-[80ch] text-fg-tertiary">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-3 min-w-0">{children}</div>}
    </header>
  );
}

/** The page's scroll container. Owns the only vertical scrollbar in <main>. */
export function PageBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`scrollbar-thin min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Label above a group of cards or a panel. Replaces the free-floating
 * `Eyebrow` where the group also needs a description or an action.
 */
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="type-label-md text-fg-quaternary">{title}</h2>
        {description && (
          <p className="type-body-sm mt-1 max-w-[80ch] text-fg-tertiary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
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

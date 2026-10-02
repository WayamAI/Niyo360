import type { ReactNode } from "react";
import { AppIcon } from "@/components/icons";

/**
 * Common page scaffold components.
 */

export interface Crumb {
  label: string;
  onClick?: () => void;
}

/**
 * A record id as a breadcrumb label.
 */
export function recordCrumb(id: string | null | undefined): string {
  if (!id) return "—";
  const [head] = id.split("-");
  return head && head.length < id.length ? `${head}…` : id;
}

/** Compact trail above the page title matching Chronos hierarchy. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1 flex min-w-0 items-center gap-1.5 text-caption">
      <AppIcon name="home" size="xs" className="text-icon-quaternary" aria-label="Home" />
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={item.label} className="flex min-w-0 items-center gap-1.5">
            <span aria-hidden="true" className="text-quaternary">
              /
            </span>
            {item.onClick && !last ? (
              <button
                type="button"
                onClick={item.onClick}
                className="truncate rounded text-quaternary transition-colors duration-150 hover:text-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={`truncate ${last ? "font-medium text-secondary" : "text-quaternary"}`}
              >
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
  description?: string;
  breadcrumb?: Crumb[];
  badges?: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
  children?: ReactNode;
  source?: DataSource;
}) {
  return (
    <header className="shrink-0 border-b border-stroke-muted bg-page px-4 py-4 sm:px-5">
      <div className="mx-auto flex max-w-[var(--page-max)] flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div className="flex min-w-0 gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-action text-icon-tertiary transition-colors duration-150 hover:bg-raised-2 hover:text-icon-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <AppIcon name="arrowLeft" size="sm" />
            </button>
          )}
          <div className="min-w-0">
            {breadcrumb && <Breadcrumb items={breadcrumb} />}
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <h1 className="font-display text-display-lg text-primary sm:text-display-xl">
                {title}
              </h1>
              {source && <DataSourceTag source={source} />}
              {badges}
            </div>
            {description && (
              <p className="mt-1 max-w-[75ch] text-body-md text-tertiary">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mx-auto mt-3.5 min-w-0 max-w-[var(--page-max)]">{children}</div>}
    </header>
  );
}

/**
 * Standard scroll container for page bodies matching Chronos PageBody.
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
      <div
        className={`mx-auto flex min-h-full max-w-[var(--page-max)] flex-col gap-4 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Section header with uppercase tracked title and source tag.
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
  source?: DataSource;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex flex-wrap items-center gap-2 text-caption font-medium tracking-[0.08em] text-quaternary uppercase">
          {title}
          {source && <DataSourceTag source={source} />}
        </h2>
        {description && (
          <p className="mt-0.5 max-w-[80ch] text-body-sm text-tertiary">{description}</p>
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
    className: "border-success-stroke text-success bg-success-surface/40",
  },
  illustrative: {
    label: "Illustrative",
    title:
      "A worked example shipped with the app. The PARIVART API does not serve this capability yet, so these figures are not your organisation's data.",
    className: "border-stroke-default text-quaternary bg-raised",
  },
};

/**
 * Marks a block of the UI as live or illustrative.
 */
export function DataSourceTag({ source }: { source: DataSource }) {
  const copy = SOURCE_COPY[source];
  return (
    <span
      title={copy.title}
      className={`rounded-full border px-2 py-0.5 text-caption font-medium ${copy.className}`}
    >
      {copy.label}
    </span>
  );
}

/**
 * Label/value pair used across detail pages and drawers.
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
      <dt className="text-caption font-medium tracking-[0.06em] text-quaternary uppercase">
        {label}
      </dt>
      <dd className={`mt-0.5 text-body-md text-primary ${mono ? "font-mono tabular" : ""}`}>
        {children}
      </dd>
    </div>
  );
}

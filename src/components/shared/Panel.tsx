import { Children, type ReactNode } from "react";
import { AppIcon, type IconName } from "@/components/icons";
import { DataSourceTag, type DataSource } from "@/components/shared/Page";

/**
 * Bounded content surface from Chronos:
 * High-density panel with uppercase tracking header and overflow isolation.
 */
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  padded = true,
  source,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
  source?: DataSource;
}) {
  return (
    <section
      className={`isolate flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-stroke-muted bg-container ${className}`}
    >
      {(title || action) && (
        <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-stroke-muted px-4">
          <div className="flex min-w-0 items-center gap-2">
            {title && (
              <h2 className="truncate text-caption font-medium tracking-[0.08em] text-quaternary uppercase">
                {title}
              </h2>
            )}
            {source && <DataSourceTag source={source} />}
            {description && (
              <p className="hidden truncate text-body-sm text-tertiary sm:inline">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div
        className={
          padded
            ? "scrollbar-thin flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-4"
            : "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        }
      >
        {children}
      </div>
    </section>
  );
}

export type MetricTone = "neutral" | "success" | "info" | "warning" | "error" | "brand";

const TONE_VALUE: Record<MetricTone, string> = {
  neutral: "text-primary",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  error: "text-error",
  brand: "text-brand",
};

/**
 * Chronos KPI Tile:
 * High-impact telemetry card with uppercase tracked eyebrow,
 * large display tabular numeral, and delta/trend indicators.
 */
export function KpiTile({
  label,
  value,
  note,
  trend,
  trendIcon,
  delta,
  hint,
  mark,
  tone = "neutral",
  onClick,
}: {
  label: string;
  value: string | number;
  note?: string;
  trend?: string;
  trendIcon?: Extract<IconName, "trendUp" | "trendDown">;
  delta?: string;
  hint?: string;
  mark?: ReactNode;
  tone?: MetricTone;
  onClick?: () => void;
}) {
  const displayDelta = delta ?? trend;
  const displayHint = hint ?? note;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-caption font-medium tracking-[0.08em] text-quaternary uppercase">
          {label}
        </span>
        {mark}
      </div>
      <span
        className={`font-display text-display-xl tabular sm:text-display-2xl ${TONE_VALUE[tone]}`}
      >
        {value}
      </span>
      {(displayDelta || displayHint) && (
        <div className="flex items-baseline gap-2">
          {displayDelta && (
            <span
              className={`flex items-center gap-1 text-body-sm tabular font-medium ${TONE_VALUE[tone]}`}
            >
              {trendIcon && <AppIcon name={trendIcon} size="xs" />}
              {displayDelta}
            </span>
          )}
          {displayHint && (
            <span className="truncate text-caption text-quaternary">{displayHint}</span>
          )}
        </div>
      )}
    </>
  );

  const containerClasses =
    "flex min-w-0 flex-col gap-1.5 rounded-lg border border-stroke-muted bg-container px-4 py-3.5 transition-colors duration-[180ms]";

  if (!onClick) {
    return <div className={containerClasses}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${containerClasses} text-left hover:border-stroke-default hover:bg-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
    >
      {content}
    </button>
  );
}

/**
 * Responsive KPI row matching Chronos density.
 */
export function KpiRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

export type SplitRatio = "1.4/1" | "1/1.4" | "1.6/1" | "1/2" | "1/1";

/**
 * Two-up layout that stacks below lg, then sits side by side with equal flex height.
 */
export function SplitRow({
  children,
  ratio = "1.4/1",
  className = "",
}: {
  children: ReactNode;
  ratio?: SplitRatio;
  className?: string;
}) {
  const growClass =
    ratio === "1.4/1"
      ? ["lg:flex-[1.4]", "lg:flex-1"]
      : ratio === "1/1.4"
        ? ["lg:flex-1", "lg:flex-[1.4]"]
        : ratio === "1.6/1"
          ? ["lg:flex-[1.6]", "lg:flex-1"]
          : ratio === "1/2"
            ? ["lg:flex-1", "lg:flex-[2]"]
            : ["lg:flex-1", "lg:flex-1"];

  return (
    <div className={`isolate flex flex-col items-stretch gap-4 lg:flex-row ${className}`}>
      {Children.map(children, (child, index) => (
        <div
          className={`flex min-h-0 min-w-0 flex-col overflow-hidden ${growClass[index] ?? "lg:flex-1"}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * Chronos horizontal bar breakdown list.
 */
export function BarList({
  rows,
  onSelect,
  selectedId,
  formatValue = (v) => v.toLocaleString("en-US"),
}: {
  rows: { id: string; label: string; value: number }[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => {
        const selected = row.id === selectedId;
        const content = (
          <>
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-body-sm text-secondary">{row.label}</span>
              <span className="shrink-0 text-body-sm tabular font-medium text-primary">
                {formatValue(row.value)}
              </span>
            </span>
            <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-raised-2">
              <span
                className={`block h-full rounded-full transition-all duration-300 ${
                  selected ? "bg-action-primary" : "bg-quaternary"
                }`}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </span>
          </>
        );

        return (
          <li key={row.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                aria-pressed={selected}
                className="block w-full rounded-md px-1.5 py-1 text-left transition-colors duration-[150ms] hover:bg-raised"
              >
                {content}
              </button>
            ) : (
              <div className="px-1.5 py-1">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

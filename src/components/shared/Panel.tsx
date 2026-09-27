import type { ReactNode } from "react";
import { AppIcon, type IconName } from "@/components/icons";

/**
 * Bounded content surfaces.
 *
 * `Panel` is the app's one framed surface: it owns a header strip and a body
 * that can hold its own scroll area, which is what a table or chart needs so
 * it never paints over its neighbours. The only other card treatment is
 * `AgentCard` (Card.tsx), which marks generated output.
 */
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  /** Flush bodies are for tables and charts that manage their own padding. */
  padded = true,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-stroke-default bg-container ${className}`}
    >
      {/* Header wraps rather than truncating: a wide action (a chart legend, a
          filter row) must not eat the panel's own title. */}
      {(title || action) && (
        <header className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-stroke-muted px-4 py-2">
          <div className="min-w-0">
            {title && <h2 className="type-label-md text-fg-quaternary">{title}</h2>}
            {description && (
              <p className="type-body-sm mt-0.5 truncate text-fg-tertiary">{description}</p>
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
  neutral: "text-fg-primary",
  success: "text-success-icon",
  info: "text-info-icon",
  warning: "text-warning-icon",
  error: "text-error-icon",
  brand: "text-brand",
};

const TONE_NOTE: Record<MetricTone, string> = {
  neutral: "text-fg-tertiary",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  error: "text-error",
  brand: "text-brand",
};

/**
 * One number and what it means. Compact by default — the metric reads at
 * 22px, not 34px, so a row of four still fits above the fold.
 */
export function KpiTile({
  label,
  value,
  note,
  trend,
  trendIcon,
  tone = "neutral",
  onClick,
}: {
  label: string;
  value: string | number;
  /** Static qualifier, e.g. "3 pending simulation". */
  note?: string;
  /** Movement since the last period, e.g. "+2 this week". */
  trend?: string;
  trendIcon?: Extract<IconName, "trendUp" | "trendDown">;
  tone?: MetricTone;
  /** When set, the whole tile becomes the link to its detail screen. */
  onClick?: () => void;
}) {
  const body = (
    <>
      {/* Wraps, never truncates: at two-up on a 390px screen a truncated
          label ("REPORTS GENERAT…") leaves the number unidentifiable. */}
      <span className="type-label-md text-fg-quaternary">{label}</span>
      <span className={`type-display-metric-sm mt-2 block ${TONE_VALUE[tone]}`}>{value}</span>
      {note && <span className="type-body-sm mt-1.5 block text-fg-tertiary">{note}</span>}
      {trend && (
        <span className={`type-caption mt-1 flex items-center gap-1 ${TONE_NOTE[tone]}`}>
          {trendIcon && <AppIcon name={trendIcon} size="xs" />}
          {trend}
        </span>
      )}
    </>
  );

  const surface =
    "flex min-w-0 flex-col rounded-lg border border-stroke-default bg-container px-4 py-3";

  if (!onClick) return <div className={surface}>{body}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${surface} text-left transition-colors duration-150 hover:border-stroke-active hover:bg-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
    >
      {body}
    </button>
  );
}

/**
 * Responsive KPI row. Two-up on phones so the numbers stay legible, then one
 * tile per metric once there is room — never a single 1×4 row at 390px.
 */
export function KpiRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

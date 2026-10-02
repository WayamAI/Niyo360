import type { ReactNode } from "react";

export type StatusTone = "success" | "info" | "neutral" | "warning" | "error";

export type BadgeVariant =
  | "type-ii"
  | "type-ib"
  | "type-ia"
  | "type-cbe"
  | "type-pas"
  | "high-risk"
  | "medium-risk"
  | "low-risk"
  | "complete"
  | "in-progress"
  | "pending"
  | "overdue"
  | "open"
  | "agent"
  | "pillar-01"
  | "pillar-02"
  | "pillar-03"
  | "pillar-04"
  | "neutral"
  | "critical"
  | "major"
  | "minor"
  | "warning";

/**
 * Solid status badge from Chronos:
 * Solid colored pill background with crisp white label text for high-contrast queues.
 */
const SOLID_TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-success-badge text-badge",
  info: "bg-info-badge text-badge",
  neutral: "bg-neutral-badge text-badge",
  warning: "bg-warning-badge text-badge",
  error: "bg-error-badge text-badge",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-caption font-medium tracking-tight ${SOLID_TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Small indicator dot from Chronos for dense rows where a full badge is too heavy.
 */
export function StatusDot({ tone = "neutral" }: { tone?: StatusTone }) {
  const bg: Record<StatusTone, string> = {
    success: "bg-success-icon",
    info: "bg-info-icon",
    neutral: "bg-neutral-icon",
    warning: "bg-warning-icon",
    error: "bg-error-icon",
  };
  return <span className={`inline-block size-1.5 shrink-0 rounded-full ${bg[tone]}`} aria-hidden />;
}

/**
 * Subtle status badge from Chronos:
 * Translucent tint background with semantic content color.
 */
const SUBTLE_STYLES: Record<BadgeVariant, string> = {
  "type-ii": "text-error bg-error-bg border border-error-stroke/30",
  "type-ib": "text-warning bg-warning-bg border border-warning-stroke/30",
  "type-ia": "text-success bg-success-bg border border-success-stroke/30",
  "type-cbe": "text-info bg-info-bg border border-info-stroke/30",
  "type-pas":
    "text-[color:var(--pillar-02)] bg-[color:color-mix(in_oklab,var(--pillar-02)_12%,transparent)] border border-[color:color-mix(in_oklab,var(--pillar-02)_30%,transparent)]",
  "high-risk": "text-error bg-error-bg border border-error-stroke/30",
  "medium-risk": "text-warning bg-warning-bg border border-warning-stroke/30",
  "low-risk": "text-success bg-success-bg border border-success-stroke/30",
  complete: "text-success bg-success-bg border border-success-stroke/30",
  "in-progress": "text-warning bg-warning-bg border border-warning-stroke/30",
  pending: "text-neutral bg-neutral-bg border border-stroke-default/50",
  overdue: "text-error bg-error-bg border border-error-stroke/30",
  open: "text-info bg-info-bg border border-info-stroke/30",
  agent:
    "text-[color:var(--pillar-02)] bg-[color:color-mix(in_oklab,var(--pillar-02)_12%,transparent)] border border-[color:color-mix(in_oklab,var(--pillar-02)_30%,transparent)]",
  "pillar-01":
    "text-[color:var(--pillar-01)] bg-[color:color-mix(in_oklab,var(--pillar-01)_12%,transparent)] border border-[color:color-mix(in_oklab,var(--pillar-01)_30%,transparent)]",
  "pillar-02":
    "text-[color:var(--pillar-02)] bg-[color:color-mix(in_oklab,var(--pillar-02)_12%,transparent)] border border-[color:color-mix(in_oklab,var(--pillar-02)_30%,transparent)]",
  "pillar-03":
    "text-[color:var(--pillar-03)] bg-[color:color-mix(in_oklab,var(--pillar-03)_12%,transparent)] border border-[color:color-mix(in_oklab,var(--pillar-03)_30%,transparent)]",
  "pillar-04":
    "text-[color:var(--pillar-04)] bg-[color:color-mix(in_oklab,var(--pillar-04)_12%,transparent)] border border-[color:color-mix(in_oklab,var(--pillar-04)_30%,transparent)]",
  neutral: "text-neutral bg-neutral-bg border border-stroke-default/50",
  critical: "text-error bg-error-bg border border-error-stroke/30",
  major: "text-warning bg-warning-bg border border-warning-stroke/30",
  minor: "text-info bg-info-bg border border-info-stroke/30",
  warning: "text-warning bg-warning-bg border border-warning-stroke/30",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium tracking-tight whitespace-nowrap ${SUBTLE_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function badgeForVariation(v: string): BadgeVariant {
  if (v.includes("II")) return "type-ii";
  if (v.includes("IB")) return "type-ib";
  if (v.includes("IA")) return "type-ia";
  if (v.includes("CBE")) return "type-cbe";
  if (v.includes("PAS") || v.includes("Prior")) return "type-pas";
  return "neutral";
}

export function badgeForRisk(r: string): BadgeVariant {
  if (r === "High" || r === "Critical") return "high-risk";
  if (r === "Medium") return "medium-risk";
  return "low-risk";
}

export function badgeForStatus(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Open: "open",
    "In Progress": "in-progress",
    Complete: "complete",
    Overdue: "overdue",
    Pending: "pending",
    "Action Required": "overdue",
    "Under Review": "in-progress",
    Reviewed: "complete",
    "Impact Assessed": "open",
    "Draft Ready": "complete",
    Filed: "complete",
    "Filing Preparation": "in-progress",
    "In Classification": "in-progress",
    "Simulation Complete": "complete",
    "Pending Simulation": "pending",
    "Issues Found": "overdue",
    "Minor Issues": "in-progress",
    "In Review": "in-progress",
  };
  return map[s] || "neutral";
}

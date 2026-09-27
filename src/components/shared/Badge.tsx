import type { ReactNode } from "react";

type BadgeVariant =
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
 * Every status tone routes through the semantic feedback tokens
 * (feedback.success/info/neutral/warning/error) — never a raw colour.
 * This is the design system's StatusBadge.
 */
const styles: Record<BadgeVariant, string> = {
  "type-ii": "text-error bg-error-bg",
  "type-ib": "text-warning bg-warning-bg",
  "type-ia": "text-success bg-success-bg",
  "type-cbe": "text-info bg-info-bg",
  "type-pas":
    "text-[color:var(--pillar-02)] bg-[color:color-mix(in_oklab,var(--pillar-02)_12%,transparent)]",
  "high-risk": "text-error bg-error-bg",
  "medium-risk": "text-warning bg-warning-bg",
  "low-risk": "text-success bg-success-bg",
  complete: "text-success bg-success-bg",
  "in-progress": "text-warning bg-warning-bg",
  pending: "text-neutral bg-neutral-bg",
  overdue: "text-error bg-error-bg",
  open: "text-info bg-info-bg",
  agent:
    "text-[color:var(--pillar-02)] bg-[color:color-mix(in_oklab,var(--pillar-02)_12%,transparent)]",
  "pillar-01":
    "text-[color:var(--pillar-01)] bg-[color:color-mix(in_oklab,var(--pillar-01)_12%,transparent)]",
  "pillar-02":
    "text-[color:var(--pillar-02)] bg-[color:color-mix(in_oklab,var(--pillar-02)_12%,transparent)]",
  "pillar-03":
    "text-[color:var(--pillar-03)] bg-[color:color-mix(in_oklab,var(--pillar-03)_12%,transparent)]",
  "pillar-04":
    "text-[color:var(--pillar-04)] bg-[color:color-mix(in_oklab,var(--pillar-04)_12%,transparent)]",
  neutral: "text-neutral bg-neutral-bg",
  critical: "text-error bg-error-bg",
  major: "text-warning bg-warning-bg",
  minor: "text-info bg-info-bg",
  warning: "text-warning bg-warning-bg",
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
      className={`inline-flex items-center rounded px-2 py-0.5 type-label-md whitespace-nowrap ${styles[variant]} ${className}`}
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

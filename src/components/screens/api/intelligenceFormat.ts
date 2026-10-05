/**
 * Shared formatting for regulatory changes and obligations.
 *
 * In its own module rather than exported from a screen: a file that exports
 * both a component and a helper breaks React Fast Refresh, which is what
 * `react-refresh/only-export-components` is warning about.
 */

import type { ImpactLevel, ImpactAssessmentStatus } from "@/services/api";
import type { StatusTone } from "@/components/shared/Badge";

/**
 * Tone per assessment status, shared by the impact list and the drill-in so
 * the two cannot disagree about what "done" means.
 *
 * REVIEWED is the only signed-off state, so it is the only green one.
 * COMPLETED means the deterministic analysis finished and is still *waiting*
 * on a human decision; painting it as success made the one assessment needing
 * attention look healthier than the ones already reviewed.
 */
export const ASSESSMENT_STATUS_TONE: Record<ImpactAssessmentStatus, StatusTone> = {
  REVIEWED: "success",
  FAILED: "error",
  PENDING: "info",
  ANALYZING: "info",
  COMPLETED: "warning",
  REQUIRES_REVIEW: "warning",
};

/** Badge variant per impact level, shared by the impact list and drill-in. */
export const LEVEL_VARIANT: Record<
  ImpactLevel,
  "critical" | "high-risk" | "medium-risk" | "low-risk" | "neutral" | "pending"
> = {
  HIGH: "high-risk",
  MEDIUM: "medium-risk",
  LOW: "low-risk",
  POTENTIALLY_AFFECTED: "pending",
  REQUIRES_REVIEW: "pending",
  NO_MATCH: "neutral",
};

/** Humanises an enum-shaped value: LABELING_CHANGE -> Labeling change. */
export function label(value: string): string {
  const words = value.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Extraction confidence as a percentage.
 *
 * The backend sends 0–1. Shown rather than hidden, because these rows are a
 * pipeline's reading of a regulation and how sure it is belongs on screen next
 * to what it claims.
 */
export function confidence(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${Math.round(value * 100)}%`;
}

/**
 * Shared formatting for regulatory changes and obligations.
 *
 * In its own module rather than exported from a screen: a file that exports
 * both a component and a helper breaks React Fast Refresh, which is what
 * `react-refresh/only-export-components` is warning about.
 */

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

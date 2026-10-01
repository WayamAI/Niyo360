/**
 * How an audit event reads on screen.
 *
 * Shared because more than one screen renders the trail: the Audit Trail itself
 * and the dashboard's recent-activity panel. An event that reads one way in the
 * table and another on the dashboard would be the same record described twice.
 */

/**
 * Labels for the vocabulary the backend writes.
 *
 * Incomplete by design. `event_type` is a free string on the wire precisely so
 * an event written by another revision of the backend still reads back, and
 * `eventLabel` falls through to a humanised form of the raw value rather than
 * hiding a row it does not recognise. A trail that silently omits what it
 * cannot label is worse than one showing an ugly string.
 */
const EVENT_LABELS: Record<string, string> = {
  USER_SIGNED_IN: "Signed in",
  DOCUMENT_UPLOADED: "Document uploaded",
  DOCUMENT_PROCESSED: "Document processed",
  IMPACT_ASSESSMENT_CREATED: "Impact analysed",
  IMPACT_ASSESSMENT_REANALYZED: "Impact re-analysed",
  REPORT_GENERATED: "Report generated",
  REVIEW_FILED: "Decision filed",
  ACTION_CREATED: "Action raised",
  ACTION_UPDATED: "Action edited",
  ACTION_STATUS_CHANGED: "Action status changed",
  EVIDENCE_ATTACHED: "Evidence attached",
};

const ENTITY_LABELS: Record<string, string> = {
  USER: "User",
  REGULATORY_DOCUMENT: "Document",
  IMPACT_ASSESSMENT: "Assessment",
  IMPACT_REPORT: "Report",
  ACTION: "Action",
};

/** Humanises an unrecognised enum-shaped string: ACTION_CREATED -> Action created. */
export function humanise(value: string): string {
  const words = value.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function eventLabel(value: string): string {
  return EVENT_LABELS[value] ?? humanise(value);
}

export function entityLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return ENTITY_LABELS[value] ?? humanise(value);
}

/** The fallback event vocabulary, for when /audit/event-types is unavailable. */
export const knownEventTypes = Object.keys(EVENT_LABELS);

/** A full timestamp, not just a date: ordering within a day is the point here. */
export function stamp(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .replace("T", " ")
    .replace(/\.\d+/, "")
    .replace(/(Z|\+00:00)$/, "");
}

/** Just the clock part of a stamp, for a list too narrow to carry the date. */
export function clockOf(value: string | null | undefined): string {
  const full = stamp(value);
  return full === "—" ? "—" : (full.split(" ")[1] ?? full);
}

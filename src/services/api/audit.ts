import { api } from "./client";
import type { AuditEvent, AuditEventTypes } from "./types";
import type { PageParams } from "./portfolio";

/**
 * The audit trail (backend Phase 8).
 *
 * Read-only, and that is a property of the thing rather than a gap in this
 * client: events are written by the backend as a side effect of a real change,
 * never posted by a caller. The backend answers 405 to POST, PATCH and DELETE.
 * So there is no `create` here, and adding one later would be a mistake — the
 * way to add an event is to make the change it describes.
 *
 * Returns a bare JSON array with `skip`/`limit` paging and no total, the same
 * shape as every other collection here. The trailing slash on the collection
 * is exact: `/audit` 307-redirects to `/audit/`, and that can drop the
 * Authorization header.
 */

export type AuditFilters = PageParams & {
  entity_type?: string;
  entity_id?: string;
  actor_id?: string;
  event_type?: string;
  /** ISO 8601. Inclusive lower bound on `created_at`. */
  since?: string;
  /** ISO 8601. Inclusive upper bound on `created_at`. */
  until?: string;
};

export const auditApi = {
  /**
   * `entity_type` + `entity_id` together answer "the history of this record",
   * which is how a detail screen links to its own provenance.
   */
  list: (filters: AuditFilters = {}) =>
    api.get<AuditEvent[]>("/api/v1/audit/", { query: { ...filters } }),

  get: (eventId: string) => api.get<AuditEvent>(`/api/v1/audit/${eventId}`),

  /**
   * The vocabulary the backend writes, so a filter can be built from the server
   * rather than from a list hardcoded here that would drift from it.
   *
   * This describes what *can* be written, not what this organization has: an
   * event type with no matching rows is the normal case, so the UI must not
   * present these as counts.
   */
  eventTypes: () => api.get<AuditEventTypes>("/api/v1/audit/event-types"),
};

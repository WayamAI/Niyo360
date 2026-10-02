import { api, request } from "./client";
import type { Evidence } from "./types";
import type { PageParams } from "./portfolio";

/**
 * Evidence: files that substantiate an action (backend Phase 8).
 *
 * Evidence attaches to an **action and nothing else**. The backend table
 * carries an `action_id` with no generic entity pair, so evidence reaches the
 * rest of the chain through the action it belongs to:
 *
 *   evidence -> action -> impact item -> assessment -> change -> document
 *
 * A screen should render that real graph. There is deliberately no "attach to
 * any entity" call, because the backend cannot honour one.
 *
 * Two absences worth knowing before designing against this:
 *
 *   - There is no evidence type or category. No such column exists, so a
 *     picker for one would be inventing a field.
 *   - `storage_key` is never returned. It is an internal server path; bytes
 *     come back from the download endpoint, which checks the tenant first.
 */

export const evidenceApi = {
  list: (params: PageParams & { action_id?: string } = {}) =>
    api.get<Evidence[]>("/api/v1/evidence/", { query: { ...params } }),

  get: (evidenceId: string) => api.get<Evidence>(`/api/v1/evidence/${evidenceId}`),

  /**
   * Multipart upload. The body is FormData so the browser sets its own
   * boundary — the client deliberately does not set Content-Type. Given the
   * same longer timeout as a document upload, since this carries a file.
   *
   * The uploader is taken from the Bearer token by the backend, so there is no
   * `uploaded_by` field to send. An `action_id` belonging to another tenant is
   * answered 404, and nothing is stored.
   */
  upload: (file: File, fields: { action_id: string; description?: string }) => {
    const body = new FormData();
    body.append("file", file);
    body.append("action_id", fields.action_id);
    if (fields.description) body.append("description", fields.description);
    return request<Evidence>("/api/v1/evidence/upload", {
      method: "POST",
      body,
      timeoutMs: 120_000,
    });
  },

  /**
   * Path of the download endpoint, for a link or a fetch.
   *
   * Not a URL a browser can follow on its own: the endpoint requires the
   * Authorization header, so an `<a href>` straight to it would be answered
   * 401. A caller wanting a download must fetch it with the client and hand
   * the blob to the browser.
   */
  downloadPath: (evidenceId: string) => `/api/v1/evidence/${evidenceId}/download`,

  /**
   * Fetches the stored bytes, with the Bearer token attached.
   *
   * `parse: "blob"` is not optional here. The default path reads a non-JSON
   * body with `.text()`, which would decode a PDF or an image as UTF-8 and
   * hand back a corrupted file without failing.
   */
  download: (evidenceId: string) =>
    request<Blob>(`/api/v1/evidence/${evidenceId}/download`, {
      method: "GET",
      parse: "blob",
    }),

  // No delete: the backend serves none. Evidence that could be removed by the
  // party it incriminates would not be evidence.
};

import { api, request } from "./client";
import type {
  Authority,
  AuthorityCreate,
  AuthorityUpdate,
  DocumentUploadResult,
  IngestionRun,
  RegulatoryDocument,
  Source,
  SourceCreate,
  SourceUpdate,
} from "./types";
import type { PageParams } from "./portfolio";

/**
 * Regulatory registry: authorities, sources and their ingestion runs, and
 * documents.
 *
 * Endpoints present on the backend today. Regulatory *changes* and
 * *obligations* are extracted by the Phase 4 AI pipeline and persisted, but no
 * router exposes them yet — see PARIVART_BACKEND_INTEGRATION_STATUS.md. They
 * are deliberately absent here rather than stubbed.
 */
export const regulatoryApi = {
  authorities: {
    list: (params: PageParams = {}) =>
      api.get<Authority[]>("/api/v1/regulatory/authorities/", { query: { ...params } }),
    get: (id: string) => api.get<Authority>(`/api/v1/regulatory/authorities/${id}`),
    create: (body: AuthorityCreate) =>
      api.post<Authority>("/api/v1/regulatory/authorities/", { json: body }),
    update: (id: string, body: AuthorityUpdate) =>
      api.patch<Authority>(`/api/v1/regulatory/authorities/${id}`, { json: body }),
    remove: (id: string) => api.delete<void>(`/api/v1/regulatory/authorities/${id}`),
  },

  sources: {
    list: (params: PageParams = {}) =>
      api.get<Source[]>("/api/v1/regulatory/sources/", { query: { ...params } }),
    get: (id: string) => api.get<Source>(`/api/v1/regulatory/sources/${id}`),
    create: (body: SourceCreate) => api.post<Source>("/api/v1/regulatory/sources/", { json: body }),
    update: (id: string, body: SourceUpdate) =>
      api.patch<Source>(`/api/v1/regulatory/sources/${id}`, { json: body }),
    remove: (id: string) => api.delete<void>(`/api/v1/regulatory/sources/${id}`),

    /** Queues an ingestion run. Returns the run to poll. */
    run: (id: string) => api.post<IngestionRun>(`/api/v1/regulatory/sources/${id}/run`),
    runs: (id: string, params: PageParams = {}) =>
      api.get<IngestionRun[]>(`/api/v1/regulatory/sources/${id}/runs`, {
        query: { ...params },
      }),
    getRun: (runId: string) => api.get<IngestionRun>(`/api/v1/regulatory/sources/runs/${runId}`),
  },

  documents: {
    list: (params: PageParams = {}) =>
      api.get<RegulatoryDocument[]>("/api/v1/regulatory/documents/", {
        query: { ...params },
      }),
    get: (id: string) => api.get<RegulatoryDocument>(`/api/v1/regulatory/documents/${id}`),

    /**
     * Multipart upload. The body is FormData so the browser sets its own
     * boundary — the client deliberately does not set Content-Type here.
     * Given a longer timeout than a normal call, since this carries a file.
     */
    upload: (file: File, fields: Record<string, string> = {}) => {
      const body = new FormData();
      body.append("file", file);
      for (const [key, value] of Object.entries(fields)) body.append(key, value);
      return request<DocumentUploadResult>("/api/v1/regulatory/documents/upload", {
        method: "POST",
        body,
        timeoutMs: 120_000,
      });
    },

    /** Kicks off the asynchronous parse/analyse pipeline. */
    process: (id: string) =>
      api.post<RegulatoryDocument>(`/api/v1/regulatory/documents/${id}/process`),

    /** Current pipeline state. Poll this; stop at ANALYZED or FAILED. */
    status: (id: string) =>
      api.get<RegulatoryDocument>(`/api/v1/regulatory/documents/${id}/status`),
  },
};

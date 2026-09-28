import { api } from "./client";
import type {
  ImpactAssessment,
  ImpactAssessmentCreate,
  ImpactItem,
  ImpactReport,
  ImpactReportCreate,
} from "./types";
import type { PageParams } from "./portfolio";

/**
 * Impact assessments and reports (backend Phase 6).
 *
 * Analysis is asynchronous: `analyze` returns the assessment record, and its
 * `status` moves on the server. Callers poll `get` until the status settles —
 * they must not assume the result is ready on return.
 *
 * There is no download/export endpoint. The backend exposes list, detail,
 * versions and generate for reports; `GET /reports/{id}/download` appears in
 * the backend's contract document but is not in the served schema, so it is
 * not implemented here.
 */
export const impactApi = {
  list: (params: PageParams & { regulatory_change_id?: string } = {}) =>
    api.get<ImpactAssessment[]>("/api/v1/impact/", { query: { ...params } }),

  get: (assessmentId: string) => api.get<ImpactAssessment>(`/api/v1/impact/${assessmentId}`),

  items: (assessmentId: string) => api.get<ImpactItem[]>(`/api/v1/impact/${assessmentId}/items`),

  /** Starts an assessment. Poll `get` until its status settles. */
  analyze: (body: ImpactAssessmentCreate) =>
    api.post<ImpactAssessment>("/api/v1/impact/analyze", { json: body }),

  /** Re-runs analysis on an existing assessment, producing a new version. */
  reanalyze: (assessmentId: string) =>
    api.post<ImpactAssessment>(`/api/v1/impact/${assessmentId}/reanalyze`),
};

export const reportsApi = {
  list: (params: PageParams = {}) =>
    api.get<ImpactReport[]>("/api/v1/reports/", { query: { ...params } }),

  get: (reportId: string) => api.get<ImpactReport>(`/api/v1/reports/${reportId}`),

  versions: (reportId: string) => api.get<ImpactReport[]>(`/api/v1/reports/${reportId}/versions`),

  generate: (body: ImpactReportCreate) =>
    api.post<ImpactReport>("/api/v1/reports/generate", { json: body }),
};

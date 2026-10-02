import { api } from "./client";
import type {
  ChangeType,
  ObligationCategory,
  RegulatoryChange,
  RegulatoryObligation,
} from "./types";
import type { PageParams } from "./portfolio";

/**
 * Regulatory changes and the obligations they create.
 *
 * This is the "what changed / why does it matter" half of the product. Until
 * the backend served these, an impact assessment carried a
 * `regulatory_change_id` that nothing could resolve: a screen could show the id
 * and the engine's summary of the change, but could not link through to the
 * change itself or list the obligations behind a match.
 *
 * Read-only, and deliberately so. These rows are what the document-processing
 * pipeline extracted from a source document, not user-entered data, so the
 * backend serves no create, update or delete — editing an extracted obligation
 * by hand would destroy the provenance that makes it worth citing.
 *
 * Bare JSON arrays with `skip`/`limit`, like every other collection here.
 */

export const changesApi = {
  list: (params: PageParams & { document_id?: string; change_type?: ChangeType } = {}) =>
    api.get<RegulatoryChange[]>("/api/v1/regulatory/changes/", { query: { ...params } }),

  get: (changeId: string) => api.get<RegulatoryChange>(`/api/v1/regulatory/changes/${changeId}`),

  /**
   * The obligations this change creates.
   *
   * 404 — not an empty array — for an unknown or cross-tenant change, because
   * "this change requires nothing" and "you cannot see this change" are
   * different answers and the UI should not render them alike.
   */
  obligations: (changeId: string) =>
    api.get<RegulatoryObligation[]>(`/api/v1/regulatory/changes/${changeId}/obligations`),
};

export const obligationsApi = {
  list: (
    params: PageParams & {
      regulatory_change_id?: string;
      document_id?: string;
      category?: ObligationCategory;
    } = {},
  ) =>
    api.get<RegulatoryObligation[]>("/api/v1/regulatory/obligations/", {
      query: { ...params },
    }),

  get: (obligationId: string) =>
    api.get<RegulatoryObligation>(`/api/v1/regulatory/obligations/${obligationId}`),
};

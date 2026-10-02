/**
 * PARIVART API surface.
 *
 * Everything the frontend knows how to call. Each service maps 1:1 onto
 * endpoints present in the backend's served OpenAPI document (api/openapi.json,
 * regenerate types with `npm run api:types`).
 *
 * Still deliberately absent, because the backend does not serve them — adding
 * stubs here would let a page be written against an endpoint that will not
 * answer, which is exactly the drift this layer exists to prevent:
 *
 *   dashboard metrics      no /dashboard route
 *   report download        in the backend's contract doc, not in the schema;
 *                          screens export CSV client-side instead
 *   logout                 no endpoint by design — a JWT is discarded here
 *
 * Regulatory changes, obligations, evidence and the audit trail were on that
 * list and are now served; see the clients above.
 *
 * Status of each is tracked in PARIVART_BACKEND_INTEGRATION_STATUS.md.
 */
export { api, request, isApiConfigured, apiBaseUrl } from "./client";
export { getAccessToken, setAccessToken, setUnauthorizedHandler } from "./client";
export { ApiError, isTransient, type FieldError, type ApiErrorKind } from "./errors";

export { authApi } from "./auth";
export { portfolioApi, type PageParams } from "./portfolio";
export { regulatoryApi } from "./regulatory";
export { impactApi, reportsApi } from "./impact";
export { reviewsApi, actionsApi } from "./governance";
export { evidenceApi } from "./evidence";
export { auditApi, type AuditFilters } from "./audit";
export { changesApi, obligationsApi } from "./intelligence";
export { parseEvidence, type MatchEvidence, type MatchSignal } from "./matchEvidence";

export * from "./types";

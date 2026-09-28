/**
 * PARIVART API surface.
 *
 * Everything the frontend knows how to call. Each service maps 1:1 onto
 * endpoints present in the backend's served OpenAPI document (api/openapi.json,
 * regenerate types with `npm run api:types`).
 *
 * Deliberately absent, because the backend does not serve them yet — adding
 * stubs here would let a page be written against an endpoint that will not
 * answer, which is exactly the drift this layer exists to prevent:
 *
 *   dashboard metrics      no /dashboard route
 *   regulatory changes     extracted and stored, but no router
 *   obligations            extracted and stored, but no router
 *   actions                Phase 7
 *   evidence               Phase 7
 *   audit                  Phase 7
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

export * from "./types";

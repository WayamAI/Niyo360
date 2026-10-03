# 06 — API Integration and Data Flow

Evidence: `src/services/api/client.ts`, `vite.config.ts`, `.env.example`, `src/hooks/useApiQueries.ts` (45 exported hooks, listed by `grep`), `api/openapi.json` (295KB, 8,222 lines — path names sampled, not fully diffed against every hook).

## Base URL and proxy configuration

- `VITE_API_BASE_URL` (env var, no trailing slash) is the production base; `isApiConfigured` is also `true` in dev mode without it, relying on the Vite proxy instead.
- Dev proxy (`vite.config.ts`): `/api` → `http://localhost:8010`, `changeOrigin: true`.
- `.env.example` documents both `VITE_API_BASE_URL` and `VITE_DEMO_OPEN_SIGNIN` (demo-mode auto-registration flag — explicitly recommended to leave `false`/unset for strict auth). No values are reproduced here per the no-secrets rule (none were present anyway — `.env.example` ships only placeholders/comments).

## Authentication and token handling

Bearer token model, consistent with the OpenAPI's `OAuth2PasswordBearer` (`tokenUrl: /api/v1/auth/login`, VERIFIED present in `api/openapi.json` paths). Token stored in-memory + `sessionStorage` key `parivart.access-token` (not `localStorage`, deliberate XSS-surface reduction per code comment). Single global `setUnauthorizedHandler` for 401s, used for session-expiry redirect to sign-in.

## Query/mutation hooks (45 total, `src/hooks/useApiQueries.ts`)

Reads: `useAction, useActions, useAuditEvent, useAuditEvents, useAuditEventTypes, useAuthorities, useChangeObligations, useControl, useControls, useDocument, useDocuments, useDocumentStatus, useEvidence, useEvidenceItem, useImpactAssessment, useImpactAssessments, useImpactItems, useIngestionRun, useMarkets, useObligation, useObligations, useProcesses, useProduct, useProducts, useRegistration, useRegistrations, useRegulatoryChange, useRegulatoryChanges, useReport, useReports, useReportVersions, useReview, useReviews, useSourceRuns, useSources`.

Mutations: `useAnalyzeImpact, useCreateAction, useCreateReview, useGenerateReport, useProcessDocument, useReanalyzeImpact, useRunSource, useSetActionStatus, useUploadDocument, useUploadEvidence`.

Each wraps a typed function in one of the domain service modules: `auth.ts, audit.ts, evidence.ts, governance.ts, impact.ts, intelligence.ts, portfolio.ts, regulatory.ts` (plus `matchEvidence.ts`, a pure parsing helper, and `queryKeys.ts` centralizing TanStack Query cache keys).

## Endpoint domains confirmed in `api/openapi.json`

Sampled top-level paths: `/api/v1/actions/`, `/api/v1/actions/{action_id}`, `/api/v1/actions/{action_id}/status`, `/api/v1/audit/`, `/api/v1/audit/{event_id}`, `/api/v1/audit/event-types`, `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/register`, `/api/v1/evidence/*`, `/api/v1/impact/*`. The schema also almost certainly covers products/markets/processes/authorities/sources/documents/registrations/controls/regulatory-changes/obligations/reports/reviews, matching the hook list above — a full path-by-path diff against every one of the 45 hooks was **not** performed line-by-line in this pass; treat the endpoint-to-hook mapping as **IMPLEMENTED, UNVERIFIED** beyond the sampled paths and the confirmed auth/actions/audit/evidence/impact groups.

## Error handling, pagination, uploads

- Centralized `ApiError` + `apiErrorFromResponse` in `errors.ts`; consumed via `asApiError` in mutation-heavy screens (Actions, AttachEvidence, RaiseAction, RecordDecision, EvidenceDetail, Sources).
- `client.ts`'s `RequestOptions` supports `query` params (implying list-screen filtering/pagination is request-driven, not client-side-only) and `parse: "auto"|"blob"` for binary responses — used for evidence file download (`EvidenceDetailScreen`'s `download` action) and document upload (`FormData` body via `DocumentUploadScreen`).
- No explicit retry/backoff logic was found in `client.ts` beyond a configurable `timeoutMs` (default 20s) and `AbortSignal` support — retries, if any, would come from TanStack Query defaults, which were not inspected for custom `retry` configuration in this pass (**UNKNOWN**).

## Data invalidation/refresh

Not independently traced hook-by-hook; TanStack Query's standard invalidate-on-mutation pattern is the expected mechanism given `queryKeys.ts` exists as a centralized key registry, but exact `invalidateQueries` call sites were not enumerated in this audit (**IMPLEMENTED, UNVERIFIED**).

## Specifically investigated areas (per the user's brief)

- **Dashboard metrics**: confirmed MIXED — some KPIs come from live hooks (`useProducts`, `useMarkets`, `useProcesses`, `useAuthorities`, `useSources`, `useAuditEvents`), but `Dashboard.tsx` also imports from `mockData.ts`, so at least some dashboard content is still illustrative. Which specific KPI tiles are mock vs live was not individually traced tile-by-tile in this pass.
- **Source ingestion and run-log drill-in**: LIVE — `SourcesScreen.tsx` uses `useSources`, `useSourceRuns`, `useRunSource` (mutation), with the run-history drawer added in commit `8748f62`.
- **Document processing**: LIVE — `useProcessDocument` mutation in `DocumentDetailScreen.tsx`, added/enhanced in commit `45133e7`.
- **Registration name resolution**: LIVE — fixed in `ea094a0`, enhanced in `45133e7`.
- **Impact-analysis regulatory-change selection**: LIVE — change picker added in `45133e7` to `ImpactAnalysisScreen.tsx`.
- **Evidence download and integrity metadata**: LIVE — `EvidenceDetailScreen.tsx` calls `evidenceApi` directly plus the `useEvidenceItem` hook; the download action is confirmed present, but integrity-metadata display (hashes/checksums) was not specifically verified line-by-line.
- **Report export behavior**: Report generation (`useGenerateReport`) is LIVE; whether a generated report can be exported to a file (PDF/etc.) from `ReportDetailScreen.tsx` was not confirmed — mark **UNKNOWN**.
- **Calendar/escalation/feed-monitor/validation/intelligence-console backend support**: these frontend screens have **zero** API hook imports (confirmed in [04](./04-complete-screen-and-component-inventory.md)), so there is no frontend-side evidence of backend support for them at all — whether the backend has endpoints for these is a backend-repo question, out of scope here, and should be marked **BLOCKED** (backend repo not provided) rather than "missing," since the backend wasn't inspected.

## Backend OpenAPI comparison

Only partially completed: the schema file (`api/openapi.json`) is present and was sampled, but a full endpoint-by-endpoint diff against every frontend call site was not performed given the ~8,200-line schema size and session scope. This section should be treated as **PARTIAL** — mark any future "all endpoints matched" claim as unverified until that diff is actually run (e.g., scripted comparison of `openapi.json` paths vs `grep -r "apiRequest\|client\." src/services/api`).

# PARIVART Frontend API Contract

What the frontend is built against. Every row below was read from the
backend's own served OpenAPI document — captured at `api/openapi.json` — not
from prose. Nothing here is assumed.

| | |
|---|---|
| Source | `GET /openapi.json` from the running PARIVART backend |
| Captured | 2026-09-27, backend version 0.1.0 |
| Operations | 58 across 37 paths |
| Regenerate types | `npm run api:types` |

## Conventions, as actually served

These differ from the backend repo's own `PARIVART_API_CONTRACT.md`. Where
the two disagree, the served schema wins and is what the client implements.

| Aspect | Served schema (implemented) | Backend's contract doc (not implemented) |
|---|---|---|
| Base path | `/api/v1` | `/api` |
| List responses | bare JSON array | `{items, page, page_size, total, total_pages}` |
| Pagination | `skip` / `limit` query params | `page` / `page_size` |
| Errors | FastAPI `{"detail": string \| ValidationError[]}` | `{error: {code, message, details}}` |
| Login body | `application/x-www-form-urlencoded`, field `username` | JSON `{email, password}` |
| Logout | no endpoint exists | `POST /api/auth/logout` |
| Auth | `Authorization: Bearer <token>` (OAuth2 password flow) | unspecified |

## Endpoints

### Authentication

| Method | Path | Auth | Query | Request | Response |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/login` | none | — | `application/x-www-form-urlencoded` | `TokenResponse` |
| GET | `/api/v1/auth/me` | Bearer | — | — | `UserResponse` |
| POST | `/api/v1/auth/register` | none | — | `application/json` | `UserResponse` |

### Portfolio

| Method | Path | Auth | Query | Request | Response |
|---|---|---|---|---|---|
| POST | `/api/v1/portfolio/controls/` | Bearer | — | `application/json` | `ControlResponse` |
| GET | `/api/v1/portfolio/controls/` | Bearer | `skip,limit,category,status` | — | `ControlResponse[]` |
| GET | `/api/v1/portfolio/controls/{control_id}` | Bearer | — | — | `ControlResponse` |
| PATCH | `/api/v1/portfolio/controls/{control_id}` | Bearer | — | `application/json` | `ControlResponse` |
| DELETE | `/api/v1/portfolio/controls/{control_id}` | Bearer | — | — | `void` |
| POST | `/api/v1/portfolio/markets/` | Bearer | — | `application/json` | `MarketResponse` |
| GET | `/api/v1/portfolio/markets/` | Bearer | `skip,limit,status` | — | `MarketResponse[]` |
| GET | `/api/v1/portfolio/markets/{market_id}` | Bearer | — | — | `MarketResponse` |
| PATCH | `/api/v1/portfolio/markets/{market_id}` | Bearer | — | `application/json` | `MarketResponse` |
| DELETE | `/api/v1/portfolio/markets/{market_id}` | Bearer | — | — | `void` |
| POST | `/api/v1/portfolio/processes/` | Bearer | — | `application/json` | `ProcessResponse` |
| GET | `/api/v1/portfolio/processes/` | Bearer | `skip,limit` | — | `ProcessResponse[]` |
| GET | `/api/v1/portfolio/processes/{process_id}` | Bearer | — | — | `ProcessResponse` |
| PATCH | `/api/v1/portfolio/processes/{process_id}` | Bearer | — | `application/json` | `ProcessResponse` |
| DELETE | `/api/v1/portfolio/processes/{process_id}` | Bearer | — | — | `void` |
| POST | `/api/v1/portfolio/products/` | Bearer | — | `application/json` | `ProductResponse` |
| GET | `/api/v1/portfolio/products/` | Bearer | `skip,limit,status` | — | `ProductResponse[]` |
| GET | `/api/v1/portfolio/products/{product_id}` | Bearer | — | — | `ProductResponse` |
| PATCH | `/api/v1/portfolio/products/{product_id}` | Bearer | — | `application/json` | `ProductResponse` |
| DELETE | `/api/v1/portfolio/products/{product_id}` | Bearer | — | — | `void` |
| POST | `/api/v1/portfolio/registrations/` | Bearer | — | `application/json` | `RegistrationResponse` |
| GET | `/api/v1/portfolio/registrations/` | Bearer | `skip,limit,status,product_id,market_id,authority_id` | — | `RegistrationResponse[]` |
| GET | `/api/v1/portfolio/registrations/{registration_id}` | Bearer | — | — | `RegistrationResponse` |
| PATCH | `/api/v1/portfolio/registrations/{registration_id}` | Bearer | — | `application/json` | `RegistrationResponse` |
| DELETE | `/api/v1/portfolio/registrations/{registration_id}` | Bearer | — | — | `void` |

### Regulatory registry

| Method | Path | Auth | Query | Request | Response |
|---|---|---|---|---|---|
| POST | `/api/v1/regulatory/authorities/` | Bearer | — | `application/json` | `AuthorityResponse` |
| GET | `/api/v1/regulatory/authorities/` | Bearer | `skip,limit` | — | `AuthorityResponse[]` |
| GET | `/api/v1/regulatory/authorities/{authority_id}` | Bearer | — | — | `AuthorityResponse` |
| PATCH | `/api/v1/regulatory/authorities/{authority_id}` | Bearer | — | `application/json` | `AuthorityResponse` |
| DELETE | `/api/v1/regulatory/authorities/{authority_id}` | Bearer | — | — | `void` |
| POST | `/api/v1/regulatory/sources/` | Bearer | — | `application/json` | `SourceResponse` |
| GET | `/api/v1/regulatory/sources/` | Bearer | `skip,limit,authority_id,enabled` | — | `SourceResponse[]` |
| GET | `/api/v1/regulatory/sources/runs/{run_id}` | Bearer | — | — | `IngestionRunResponse` |
| GET | `/api/v1/regulatory/sources/{source_id}` | Bearer | — | — | `SourceResponse` |
| PATCH | `/api/v1/regulatory/sources/{source_id}` | Bearer | — | `application/json` | `SourceResponse` |
| DELETE | `/api/v1/regulatory/sources/{source_id}` | Bearer | — | — | `void` |
| POST | `/api/v1/regulatory/sources/{source_id}/run` | Bearer | — | — | `void` |
| GET | `/api/v1/regulatory/sources/{source_id}/runs` | Bearer | `skip,limit` | — | `IngestionRunResponse[]` |

### Documents

| Method | Path | Auth | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/v1/regulatory/documents/` | Bearer | `skip,limit` | — | `DocumentResponse[]` |
| POST | `/api/v1/regulatory/documents/upload` | Bearer | — | `multipart/form-data` | `DocumentUploadResponse` |
| GET | `/api/v1/regulatory/documents/{document_id}` | Bearer | — | — | `DocumentResponse` |
| POST | `/api/v1/regulatory/documents/{document_id}/process` | Bearer | — | — | `void` |
| GET | `/api/v1/regulatory/documents/{document_id}/status` | Bearer | — | — | `void` |

### Impact assessments

| Method | Path | Auth | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/v1/impact/` | Bearer | `skip,limit,regulatory_change_id` | — | `ImpactAssessmentResponse[]` |
| POST | `/api/v1/impact/analyze` | Bearer | — | `application/json` | `ImpactAssessmentResponse` |
| GET | `/api/v1/impact/{assessment_id}` | Bearer | — | — | `ImpactAssessmentResponse` |
| GET | `/api/v1/impact/{assessment_id}/items` | Bearer | — | — | `ImpactItemResponse[]` |
| POST | `/api/v1/impact/{assessment_id}/reanalyze` | Bearer | — | — | `ImpactAssessmentResponse` |

### Reports

| Method | Path | Auth | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/v1/reports/` | Bearer | `skip,limit` | — | `ImpactReportResponse[]` |
| POST | `/api/v1/reports/generate` | Bearer | — | `application/json` | `ImpactReportResponse` |
| GET | `/api/v1/reports/{report_id}` | Bearer | — | — | `ImpactReportResponse` |
| GET | `/api/v1/reports/{report_id}/versions` | Bearer | — | — | `ImpactReportResponse[]` |

### Health

| Method | Path | Auth | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/health` | none | — | — | `void` |
| GET | `/health/live` | none | — | — | `void` |
| GET | `/health/ready` | none | — | — | `void` |

## Not served

Referenced by the product brief or the backend's contract document, but
absent from the served schema. The frontend has no client code for these —
stubbing them would let a page be written against an endpoint that cannot
answer.

| Capability | Note |
|---|---|
| Dashboard metrics | no `/dashboard` route |
| Regulatory changes | extracted by the Phase 4 pipeline and persisted, but no router exposes them |
| Regulatory obligations | same |
| Actions | Phase 7 |
| Evidence | Phase 7 |
| Audit | Phase 7 |
| Report download/export | `GET /reports/{id}/download` is in the contract doc only |

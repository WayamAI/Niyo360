# PARIVART Backend Integration Status

Where each capability stands between this frontend and the PARIVART backend.
Statuses are derived from the served OpenAPI document (`api/openapi.json`) and
from requests actually made against a locally running backend — not from the
backend's roadmap or its contract document.

| Status | Meaning |
|---|---|
| `INTEGRATED` | Typed client exists, a screen consumes it, verified against a live response |
| `READY` | Endpoint served and typed client written; no screen consumes it yet |
| `BLOCKED` | Endpoint served, but calling it fails for a reason outside this repo |
| `BACKEND_PENDING` | No endpoint. No client code written |

## Current state

Verified by signing in against a locally running backend and calling each
endpoint with a real Bearer token.

| Capability | Status | Detail |
|---|---|---|
| Authentication | `INTEGRATED` | `register`, `login`, `me` all return 200. Login works end to end from the UI. |
| Portfolio — products | `INTEGRATED` | 200, returns `[]`. Products screen wired. |
| Portfolio — markets | `INTEGRATED` | 200, returns `[]`. Markets screen wired. |
| Portfolio — processes | `INTEGRATED` | 200, returns `[]`. Processes screen wired. |
| Portfolio — controls | `READY` | Typed client exists; no screen yet. |
| Portfolio — registrations | `READY` | Typed client exists; no screen yet. |
| Regulatory authorities | `INTEGRATED` | 200, returns `[]`. Authorities screen wired. |
| Regulatory sources | `INTEGRATED` | 200, returns `[]`. Sources screen wired, including Run. |
| Reports | `READY` | 200, returns `[]`. Typed client exists; no screen yet. |
| Documents | `BLOCKED` | 500 — `NameError: name 'RegulatoryDocument' is not defined` in the backend's documents router. |
| Impact assessments | `BLOCKED` | 500 — `column impact_assessments.ai_enrichment_status does not exist`. The ORM model has AI-status columns the table lacks. |
| Health | `INTEGRATED` | 200. |
| Dashboard metrics | `BACKEND_PENDING` | No `/dashboard` route in the schema. |
| Regulatory changes | `BACKEND_PENDING` | Model and pipeline exist; no router. |
| Regulatory obligations | `BACKEND_PENDING` | Same. |
| Actions | `BACKEND_PENDING` | `governance.py` models landed; no router yet. |
| Evidence | `BACKEND_PENDING` | Same. |
| Audit | `BACKEND_PENDING` | Same. |
| Report download/export | `BACKEND_PENDING` | In the backend's contract doc, not in the served schema. |

## Backend-side prerequisites

Three things are owned by the backend repository. None were changed from here.

**1. Documents router raises NameError**

```
GET /api/v1/regulatory/documents/  ->  500
NameError: name 'RegulatoryDocument' is not defined
```

A missing import in the documents router.

**2. Impact table is behind its model**

```
GET /api/v1/impact/  ->  500
asyncpg.exceptions.UndefinedColumnError:
column impact_assessments.ai_enrichment_status does not exist
```

`ImpactAssessment` declares `ai_enrichment_status`, `ai_enrichment_error` and
`ai_narrative`; the created table has none of them. A migration is needed. These
are the AI-status fields the frontend would use to distinguish "assessment
available, AI enrichment unavailable" from "API unavailable".

**3. No seed data**

All 18 tables exist and every one is empty, so every working endpoint returns
`[]`. The repo has `app/seeds/demo_data.py` for Asterion Medical Systems but it
is not invoked by any entry point. Running it is a backend-side task.

**4. passlib/bcrypt backend detection is unstable**

`passlib 1.7.4` cannot read `bcrypt.__about__` (removed in bcrypt 4.1+), and
`requirements.txt` pins neither. In one server process this poisoned password
hashing and every `register`/`login` returned
`ValueError: password cannot be longer than 72 bytes`; a fresh process worked.
Pinning bcrypt `<4.1`, or moving off passlib, would make it deterministic.

**A note on how backend 5xx appears in the browser**

FastAPI's CORSMiddleware does not add `Access-Control-Allow-Origin` to
unhandled exceptions, so a 500 is blocked by the browser and JavaScript sees
only `TypeError: Failed to fetch` — identical to the API being down. The client
therefore words that failure to cover both cases rather than asserting one.

## Screens

Five screens read the real API, grouped under "Live data · PARIVART API" in the
sidebar: Authorities, Sources, Products, Markets, Processes. Each renders an
honest loading, empty, error, forbidden or populated state — there is no path
through `ApiState` that substitutes invented rows for an empty response. All
five currently show their empty state, because the database has no data.

The screens above that group still render the illustrative dataset in
`src/data/`, badged as such in the UI. They cover domains the backend does not
expose (HAQ drafts, variation sections, CMC simulation, market heatmap,
validation reports) and were not converted, since there is no endpoint to
convert them to.

Next, in order, once the backend prerequisites are met: Documents and Impact
(both have typed clients and pollers already written, and are one backend fix
away), then Reports, Controls and Registrations.

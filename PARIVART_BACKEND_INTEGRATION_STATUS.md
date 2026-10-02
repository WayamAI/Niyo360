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

Last verified 2026-09-29, by signing in against a locally running backend as
`admin@asterion.com` and driving each screen in the browser.

| Capability | Status | Detail |
|---|---|---|
| Authentication | `INTEGRATED` | `register`, `login`, `me`. Sign-in works end to end, and a 401 clears the session. |
| Portfolio — products | `INTEGRATED` | 200, 5 rows. |
| Portfolio — markets | `INTEGRATED` | 200, 5 rows. |
| Portfolio — processes | `INTEGRATED` | 200, 9 rows. |
| Portfolio — controls | `INTEGRATED` | 200, 4 rows, with a drill-in. |
| Portfolio — registrations | `INTEGRATED` | 200, 0 rows — renders its empty state. |
| Regulatory authorities | `INTEGRATED` | 200, 5 rows. |
| Regulatory sources | `INTEGRATED` | 200, 3 rows, including Run. |
| Regulatory documents | `INTEGRATED` | 200, 1 row, with a drill-in and the upload flow. |
| Impact assessments | `INTEGRATED` | 200, 1 row. Drill-in resolves matched entity ids to portfolio names and shows the engine's match evidence. |
| Impact items | `INTEGRATED` | 200, 5 rows, with per-signal evidence. |
| Impact reports | `INTEGRATED` | 200, 1 row, with versions and the generate flow. |
| Human review | `INTEGRATED` | 200. List, plus filing a decision from an assessment. **Requires a backend serving the reviews router — see below.** |
| Actions | `INTEGRATED` | 200. List, status filter and status transitions. **Same backend requirement.** |
| Health | `INTEGRATED` | 200. |
| Dashboard metrics | `BACKEND_PENDING` | No `/dashboard` route. The Command Centre's live tiles are derived from the portfolio collections; every other section is marked Illustrative in the UI. |
| Regulatory changes | `BACKEND_PENDING` | Model and pipeline exist; no router. See below. |
| Regulatory obligations | `BACKEND_PENDING` | Same. |
| Audit | `BACKEND_PENDING` | No router. The Audit Trail screen says plainly that only this session's entries are real. |
| Report download/export | `BACKEND_PENDING` | In the backend's contract doc, not in the served schema. Screens export CSV client-side instead. |

## Backend-side prerequisites

Two things are owned by the backend repository (`reg_iq_Parivart_backend`).

**1. The reviews and actions routers are not committed**

The Phase 7 work — `app/api/routers/reviews.py`, `app/api/routers/actions.py`,
their schemas and services — exists in the backend working tree but is not
committed to `main`, and the long-running dev processes on :8010 and :8011 were
started before it was written, so neither serves it. Their `/openapi.json` has
37 paths; the code on disk serves 42.

Verified working by starting the backend's own code on a spare port:

```
GET /api/v1/reviews/   ->  200
GET /api/v1/actions/   ->  200
```

`api/openapi.json` in this repo is captured from that 42-path document, so the
frontend's types are against the contract the backend already implements.

To run the Human Review and Actions screens: commit that work and restart the
backend. Until then both screens render `ApiState`'s honest 404 state — "Not
available on this backend" — rather than failing or inventing rows. That was
verified too.

**2. No router for regulatory changes or obligations**

The document-processing pipeline extracts and stores both, and an impact
assessment references `regulatory_change_id`, but nothing serves them. The
consequence in the UI is that an assessment shows the change's id and the
engine's summary of it, and cannot link through to the change itself or list
the obligations behind a match. A read-only `GET /api/v1/regulatory/changes`
and `.../obligations` would close it.

**A note on how backend 5xx appears in the browser**

FastAPI's CORSMiddleware does not add `Access-Control-Allow-Origin` to
unhandled exceptions, so a 500 is blocked by the browser and JavaScript sees
only `TypeError: Failed to fetch` — identical to the API being down. The client
therefore words that failure to cover both cases rather than asserting one.

## Live and illustrative data

The app renders two things side by side, and the split is now visible in the
UI rather than left to be discovered:

- Screens under **Live data · PARIVART API** read the backend. So do the
  Command Centre's "Portfolio at a glance" tiles.
- The four capability-pillar groups (Change Intelligence, AI Writing,
  Compliance Validator, Change Simulator) and the Command Centre's other
  sections render the worked example in `src/data/`. Each carries an
  **Illustrative** marker in its page header, section header or nav group.

They were not converted because there is no endpoint to convert them to: the
backend serves nothing for HAQ drafts, variation sections, CMC simulation,
market heatmaps or validation reports.

## Deep links

Every screen and drill-in is addressable: `?screen=<id>` and, for a detail
screen, `&id=<record id>`. Back, Forward, Reload and a pasted link all resolve,
and an unrecognised `screen` falls back to the Command Centre.

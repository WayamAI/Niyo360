# PARIVART Frontend — Engineering Audit

**Audit date:** 2026-10-03
**Repository:** `WayamAI/Niyo360` (local path `reg_iq-main`), branch `main`, HEAD `491bf33` (in sync with `origin/main`)
**Auditor:** Claude Code, verifying code, git history, and freshly executed commands (not copying any prior report's claims without re-checking).

## Product overview

PARIVART is a regulatory-change-intelligence platform: it ingests regulatory documents from external authorities, extracts obligations, assesses the impact of regulatory changes against a company's product/market/process portfolio, routes findings through human review, and produces auditable Impact Delta Reports with an evidence trail. See [02-system-design-and-product-workflow.md](./02-system-design-and-product-workflow.md).

## Frontend purpose and responsibilities

This repo is the browser client: a React 19 + TanStack Start SSR application that renders the operational UI (dashboard, document/change/impact/evidence/action/review screens) against a FastAPI-shaped backend (OpenAPI schema committed at `api/openapi.json`). It owns presentation, client-side data fetching/caching (TanStack Query), auth-token handling, and the Chronos-derived design system. It does not own backend logic, data processing, or the OpenAPI contract — those are generated/consumed, not authored, here.

## Current implementation status (one-line verdict per area)

| Area | Status | Doc |
|---|---|---|
| Core CRUD/read screens under `screens/api/*` (24 screens) | **VERIFIED live-API**, no mock data | [04](./04-complete-screen-and-component-inventory.md) |
| Legacy/illustrative screens under `screens/*` (12 screens: Agent Console, Feed Monitor, Market Heatmap, Calendar, Escalations, HAQ Drafts, CMC Simulator, Validator, New Change Entry, Variation Drafts, Validation Reports, Report Detail (legacy)) | **MOCK/ILLUSTRATIVE** — hardcoded from `src/data/mockData.ts` / `regulatoryData.ts` | [04](./04-complete-screen-and-component-inventory.md), [09](./09-known-issues-and-technical-debt.md) |
| Dashboard | **MIXED** — live KPI hooks plus mock fallback data | [04](./04-complete-screen-and-component-inventory.md) |
| Chronos design-system adoption | **PARTIAL/VERIFIED structurally** — same Tier-1/Tier-2 token architecture, independent values; visual fidelity not screenshot-verified | [03](./03-chronos-design-system-and-ui-implementation.md) |
| Tests | **VERIFIED** — `npm test` → 5 files / 42 tests passed, freshly run 2026-10-03 | [07](./07-testing-and-quality-assurance.md) |
| Typecheck / Lint / Build | **VERIFIED** — all pass; lint has 16 pre-existing warnings, 0 errors; build has 2 chunk-size warnings | [07](./07-testing-and-quality-assurance.md) |
| Deployment config | **IMPLEMENTED, UNVERIFIED** — Vercel + Cloudflare Worker config present; no live deployment reachability check performed | [08](./08-deployment-and-environment.md) |

## Key architectural components

- **Shell/routing**: single TanStack Start route (`/`) with screen+record id carried in the URL query string, switched by `AppContext` state rather than per-screen file routes. See [01](./01-frontend-architecture.md).
- **Data layer**: `src/hooks/useApiQueries.ts` (45 typed hooks) wrapping `src/services/api/*` service modules and a single `client.ts` HTTP client, backed by a committed OpenAPI schema.
- **Design system**: `src/styles.css` (653 lines, 385 custom properties, light/dark via `:root`/`.dark`), structurally modeled on the Chronos reference app's Tier-1/Tier-2 token system.

## Known limitations of this audit

- No browser/visual testing was performed (no screenshot tooling in this environment) — visual-parity claims about Chronos are structural/code-level only, not pixel-verified.
- Backend reachability, live API responses, and the five "Design System Prompts" text files were not exercised/read in depth — out of scope for a frontend-only, read-mostly audit within the time available.
- Historical commits before 2026-10-02 are summarized from `git log`, not individually diffed line-by-line beyond what's cited.

## Documents in this package

1. [01-frontend-architecture.md](./01-frontend-architecture.md)
2. [02-system-design-and-product-workflow.md](./02-system-design-and-product-workflow.md)
3. [03-chronos-design-system-and-ui-implementation.md](./03-chronos-design-system-and-ui-implementation.md)
4. [04-complete-screen-and-component-inventory.md](./04-complete-screen-and-component-inventory.md)
5. [05-ui-fixes-and-implementation-history.md](./05-ui-fixes-and-implementation-history.md)
6. [06-api-integration-and-data-flow.md](./06-api-integration-and-data-flow.md)
7. [07-testing-and-quality-assurance.md](./07-testing-and-quality-assurance.md)
8. [08-deployment-and-environment.md](./08-deployment-and-environment.md)
9. [09-known-issues-and-technical-debt.md](./09-known-issues-and-technical-debt.md)
10. [10-git-history-and-change-register.md](./10-git-history-and-change-register.md)
11. [11-current-state-and-next-steps.md](./11-current-state-and-next-steps.md)
12. [12-ceo-demo-guide.md](./12-ceo-demo-guide.md) — added in the follow-up session that implemented §5–§9 fixes below.

## Follow-up session (2026-10-03, after initial audit)

Shared table sort logic was extracted and tested (`src/lib/tableSort.ts`), two document-processing/upload bugs were fixed (dead status-polling, swallowed upload errors), one dashboard date literal was fixed, and §6/§7 (regulatory changes/obligations, portfolio/impact/review/action/evidence) were inspected and found to have **no fixable frontend defects** — see updated entries in [09](./09-known-issues-and-technical-debt.md). Tests: 57/57 passing (up from 42). Commits `23ca492`..`2d78b25`, all pushed to `origin/main`. Browser/live-backend verification remains **BLOCKED** — the configured backend was unreachable this session.

## Evidence-quality legend (used throughout)

`VERIFIED` confirmed directly this audit · `HISTORICALLY VERIFIED` prior recorded output, not rerun · `IMPLEMENTED, UNVERIFIED` code exists, runtime unconfirmed · `PARTIAL` some but not all required behavior · `MOCK/ILLUSTRATIVE` not backed by live API · `BLOCKED` external constraint prevented verification · `UNKNOWN` insufficient evidence.

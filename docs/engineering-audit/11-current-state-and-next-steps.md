# 11 — Current State and Next Steps

## State breakdown

### 1. Implemented and verified
- Auth/session handling, bearer-token client, dev proxy, typed API services (VERIFIED by code read + passing tests).
- 24 `screens/api/*` screens + `audit` + 3 dialogs wired to live hooks, zero mock-data imports (VERIFIED by grep).
- Chronos token architecture (Tier 1/Tier 2 structure) adopted into `styles.css`, light/dark theme blocks present (VERIFIED by direct read).
- Unit tests: 42/42 passing (VERIFIED, freshly run). Typecheck clean (VERIFIED). Lint: 0 errors (VERIFIED). Production build succeeds, both client and SSR bundles (VERIFIED).
- Git state: clean, `main` in sync with `origin/main` (VERIFIED).

### 2. Implemented but not runtime-verified
- Actual correctness of each of the 45 API hooks against a live backend (only config/shape tested, not live calls).
- Visual fidelity of the 6 Chronos-aligned detail screens and the shell/token foundation (no browser/screenshot check performed).
- Data invalidation/refresh behavior after mutations (TanStack Query pattern assumed present, not traced call-by-call).
- Deployment reachability for both the Vercel and Cloudflare targets.

### 3. Partially implemented
- Dashboard (mixes live KPI hooks with mock data; which tiles are which was not fully enumerated).
- API-to-OpenAPI-schema coverage comparison (sampled, not exhaustive).

### 4. Illustrative/mock-only
- `feed-monitor`, `agent-console`, `haq-drafts`, `variation-drafts`, `validator`, `validation-reports`, `simulator`, `new-change`, `heatmap`, `calendar`, `escalations`, legacy `delta-reports`/`report-detail` — 13 screens total, confirmed by zero API-hook imports.

### 5. Known broken
- None identified in this audit. No failing test, no lint error, no build error, no reverted commit indicating an unresolved regression was found.

### 6. Blocked by an external dependency
- Live deployment verification (needs a reachable URL/credentials not provided).
- Browser/visual/accessibility verification (no browser automation tool available this session).
- Full OpenAPI-to-frontend endpoint diff (would benefit from scripting time beyond this session's scope, not a hard external blocker, but not completed).

### 7. Not yet implemented
- Screen-level code splitting (all 36 screens ship in one client bundle).
- Component/UI test coverage (currently zero).
- Any visible UI indicator distinguishing mock/illustrative screens from live ones.
- A documented policy on which deployment target (Vercel vs Cloudflare) is authoritative production.

### 8. Unknown due to missing evidence
- Minimum supported Node.js version (no `engines` field found).
- Role-based access control, if any, on the backend/frontend.
- Whether `design-system-retrofit` and `chore/rebrand-metadata-cleanup` branches represent live in-progress work or stale branches.
- Contents of the 5 "Design System Prompts" text files (not read).

## Remaining engineering tasks, in dependency order

1. Decide and document the authoritative production deployment target (Vercel static vs Cloudflare Worker SSR) — unblocks consistent env-var management and on-call runbooks.
2. Run a full OpenAPI-schema vs. frontend-hook coverage diff (`npm run api:types` against current backend, diff `schema.d.ts`) — unblocks confident claims about API-integration completeness.
3. Manually exercise the app in a browser against a real backend to verify the Chronos-aligned screens visually and functionally (document-process action, source run trigger, evidence download, review/action/evidence workflows end-to-end) — the biggest unverified risk area right now.
4. Decide the fate of the 13 mock-only screens: wire to real endpoints, or mark them visibly as previews, so users/demos aren't misled.
5. Resolve the Dashboard's mixed data sourcing — identify exactly which KPI tiles are mock and replace or label them.
6. Add component-level tests for at least the 24 live `screens/api/*` components, prioritizing the ones with mutations (Actions, Sources, DocumentDetail, dialogs).
7. Address the client bundle-size warning via code-splitting the `SCREENS` map in `Shell.tsx`.
8. Clean up or merge/delete `design-system-retrofit` and `chore/rebrand-metadata-cleanup` branches once their status is confirmed with whoever created them.

## Handover checklist for the next engineer

- [ ] Read [README.md](./README.md) and this document first.
- [ ] Confirm which deployment target is actually serving production traffic (not determinable from this repo alone).
- [ ] Set `VITE_API_BASE_URL` and run `npm run dev` against a real backend before trusting any `api-*` screen's behavior beyond what unit tests cover.
- [ ] Do not assume the 13 mock-only screens (see [04](./04-complete-screen-and-component-inventory.md)) reflect real data — verify with product/design before demoing them to anyone who might mistake them for live.
- [ ] Re-run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` before any release — all were clean as of `491bf33` on 2026-10-03, but this is a point-in-time snapshot.
- [ ] Do not claim "production-ready" solely because the build/typecheck/lint/test suite is clean — no browser-level or live-backend verification backs that claim yet.

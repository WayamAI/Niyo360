# 09 — Known Issues and Technical Debt

Non-scored register; each item verified against actual code/output in this session unless otherwise marked.

## 1. 12 screens are mock-only, with no backend wiring at all

- **Affected:** `feed-monitor`, `delta-reports`, legacy `report-detail`, `agent-console`, `haq-drafts`, `variation-drafts`, `validator`, `validation-reports`, `simulator`, `new-change`, `heatmap`, `calendar`, `escalations` (13 screens — see [04](./04-complete-screen-and-component-inventory.md) for the count discrepancy note: 12 "mock" + legacy `report-detail` makes 13 non-live top-level screens, `Dashboard` is separately MIXED).
- **Evidence:** zero imports from `@/hooks/useApiQueries` or `@/services/api` in any of these files; all import from `src/data/mockData.ts` or `regulatoryData.ts` (VERIFIED by grep, this session).
- **Impact:** these screens cannot reflect real organizational data; any demo or user exploring them will see static, non-representative content presented with the same visual polish as the live screens, with no in-UI indicator that it's illustrative.
- **Root cause:** feature scaffolding built ahead of backend capability, or intentionally kept as design/concept screens — not established from the frontend side alone.
- **Workaround:** none needed for demo purposes if users are informed; risk is only if someone mistakes these for live data.
- **Recommended next action:** either wire these to real endpoints (if the backend has them — unverified, see [06](./06-api-integration-and-data-flow.md)) or add a visible "preview/concept" badge to prevent user confusion.
- **Verification status:** VERIFIED (mock-data imports confirmed directly).

## 2. Dashboard mixes live and mock data — UPDATE: per-tile trace now done, UI already labels most of it

- **Affected:** `Dashboard.tsx`.
- **Correction (this session):** a per-tile trace (not performed in the prior pass) found the 5 KPI tiles (Products/Markets/Processes/Authorities/Sources) are live-API counts, "Recent activity" is live audit data, and the change-activity chart, agent cards, and pillar cards are mock-backed but already carry `source="illustrative"` tags in the rendered UI (`DataSourceTag`) — the "no visible distinction" claim from the prior audit pass does not hold up under direct inspection and is retracted.
- **Remaining real defect found and fixed:** the header date was a separate hardcoded literal (`"22 May 2025"`) not wired to `src/lib/demo-clock.ts`'s `DEMO_NOW`, so it could silently drift from the anchor date the mock dataset is authored against. Fixed in commit `2d78b25` to derive from `demoNow()`.
- **Verification status:** VERIFIED (read every tile's data source directly, this session).

## 3. No test coverage for any UI/screen component

- **Affected:** all 40 screen/dialog components, including the 6 Chronos-aligned detail screens.
- **Evidence:** only 5 test files exist, all under `src/services/api/` or `src/hooks/`; `npm test` confirms 42 tests, 0 of which touch a `.tsx` component directly.
- **Impact:** UI regressions (including the formatting bug that necessitated commit `491bf33`) are not caught by automated tests; relies entirely on manual review/prettier/eslint.
- **Recommended next action:** add component tests (e.g. React Testing Library) for at least the live `api/*` detail screens, given they carry the most business-critical workflow.
- **Verification status:** VERIFIED.

## 4. Client bundle has two chunks over Vite's 500kB warning threshold

- **Affected:** production client build.
- **Evidence:** `npm run build` output: `index-B5KZYVCt.js` 393.74 kB and `index-BhR3DnZA.js` 794.21 kB (gzip 123.74 kB / 207.44 kB respectively), with Vite's own warning suggesting dynamic `import()` or `manualChunks`.
- **Impact:** slower initial load, especially on constrained networks; all 36 screen components ship in the main bundle since there's no per-screen code splitting (confirmed in [01](./01-frontend-architecture.md)).
- **Root cause:** no lazy-loading/code-splitting strategy implemented for screens.
- **Recommended next action:** introduce `React.lazy`/dynamic `import()` per screen in the `SCREENS` map in `Shell.tsx`, or configure `manualChunks`.
- **Verification status:** VERIFIED (fresh build output, this session).

## 5. 16 ESLint warnings for `react-refresh/only-export-components`

- **Affected:** `RecordDecisionDialog.tsx`, `Badge.tsx`, `Page.tsx`, `Sidebar.tsx`, several `ui/*.tsx` primitives, `AppContext.tsx`, `AuthContext.tsx`, `ThemeContext.tsx`.
- **Evidence:** fresh `npm run lint` output, 0 errors / 16 warnings, all this one rule.
- **Impact:** slower Fast Refresh (HMR) for these files during development only; no runtime/production impact.
- **Recommended next action:** low priority; could split constant/helper exports into separate files from component exports if HMR friction becomes noticeable.
- **Verification status:** VERIFIED.

## 6. No browser/visual/accessibility verification exists for the Chronos UI work

- **Affected:** all 6 Chronos-aligned detail screens and the shell/token foundation commits.
- **Evidence:** no screenshot tooling or browser automation was used in this audit or found evidenced in the repo (no committed screenshots, no Playwright config).
- **Impact:** visual-parity and accessibility claims about the Chronos alignment work cannot be independently confirmed; regressions could exist that lint/typecheck/unit tests would not catch.
- **Recommended next action:** run the dev server and manually verify, or add visual regression tooling.
- **Verification status:** BLOCKED (no browser tooling available this session) — do not treat this as "confirmed working" nor "confirmed broken."

## 7. Dual deployment target (Vercel static + Cloudflare Worker SSR) with no documented policy on which is authoritative

- **Affected:** `vercel.json`, `wrangler.jsonc`, deployment process generally.
- **Evidence:** both configs are complete and current; no README/doc in the repo states which is the "real" production target versus a secondary/experimental one.
- **Impact:** operational ambiguity for whoever manages deploys — risk of divergent builds (e.g. an env-var change applied to one target and not the other, since `VITE_*` vars are baked in at build time per target).
- **Recommended next action:** document the intended production target explicitly (this audit could not determine it from the repo alone — mark **UNKNOWN**).
- **Verification status:** PARTIAL (both configs verified to exist and be complete; which is "production" is UNKNOWN).

## 8. Backend OpenAPI schema not fully cross-checked against every frontend call site

- **Affected:** API-integration confidence generally.
- **Evidence:** `api/openapi.json` (8,222 lines) was sampled, not exhaustively diffed against all 45 hooks.
- **Impact:** possible undetected drift between the committed schema and either the live backend or the frontend's actual usage.
- **Recommended next action:** run `npm run api:types` against the current backend and diff the result against the committed `schema.d.ts`; script a path-coverage comparison.
- **Verification status:** PARTIAL — explicitly incomplete, flagged rather than silently assumed complete.

## 9. Obligation rows have no visible source-change label — backend contract gap, not a frontend bug

- **Affected:** `ObligationListScreen.tsx`.
- **Evidence:** `RegulatoryObligationResponse` (`schema.d.ts:1980-2003`, confirmed in `api/openapi.json`) has `change_id` but no denormalized change title/summary field. The screen already routes each row's click-through to the originating change (`openRecord("api-change-detail", row.change_id)`), but a user scanning the table without clicking cannot see which change produced a given obligation.
- **Minimum backend change needed:** add a denormalized `change_summary` (or similar) field to `RegulatoryObligationResponse`, or support an `include=change` expand param on the obligations list endpoint.
- **Why not frontend-fixed:** adding this client-side would require one extra API call per row (N+1) to resolve each `change_id` to a label — explicitly out of scope per this session's instructions.
- **Verification status:** VERIFIED (schema field absence confirmed directly), reported rather than worked around.

## 10. Document upload: no real progress percentage, no backend-declared file-size limit

- **Affected:** `DocumentUploadScreen.tsx`.
- **Evidence:** `POST /api/v1/regulatory/documents/upload`'s OpenAPI schema declares no `maxLength`/size constraint on the file part, and the response (`DocumentUploadResponse`) carries no progress field; the request client has no XHR progress-event wiring.
- **Impact:** the upload button shows a static "Uploading…" label with no percentage, and there is no client-enforced size cap matching a real backend limit (the `accept=".pdf,.doc,.docx,.txt,.html"` attribute is a cosmetic hint only).
- **Why not frontend-fixed:** fabricating a progress bar or a size limit not backed by the API would misrepresent backend behavior, which this session's instructions explicitly prohibit.
- **Recommended next action:** backend should document/enforce a real max upload size and, if progress reporting matters for large files, expose chunked upload or a server-side progress channel.
- **Verification status:** VERIFIED (schema and client code read directly).

## 11. Backend was unreachable in the prior session — RESOLVED, two real bugs fixed, one real blocker remains

- **Root cause of unreachability:** local Postgres (`postgresql@14`) had a stale `postmaster.pid` lock file from an earlier unclean shutdown, referencing a PID that had been reused by an unrelated macOS system process (`pbs`). Removed the stale lock, restarted the service — resolved, no data lost (verified existing demo orgs, including Asterion Medical Systems, were intact before and after).
- **Also found:** DB was one migration behind (`0004_tenant_scoped_doc_dedup`, a non-destructive, self-guarding composite-uniqueness fix for cross-tenant document dedup). Applied via `alembic upgrade head` — backend now starts cleanly (`uvicorn app.main:app --port 8010`, `/docs` and `/openapi.json` both 200).
- **Verified this session:** frontend dev server (`npm run dev`, port 8080) → Vite `/api` proxy → backend returns identical responses to a direct backend call (401 with the same `request_id`-bearing error body for both an unauthenticated list call and a bad-credentials login) — the frontend↔backend wiring itself is confirmed working at the network level.
- **Remaining blocker:** no valid demo-account password was available this session (none documented in the backend repo's README/docs, and I will not guess/brute-force credentials). This blocks every authenticated workflow step (dashboard data, document upload, impact assessment, etc.) for both API-level and browser verification — not a code defect, a missing credential. **Next action:** whoever holds the Asterion demo password supplies it through a secure channel (not pasted into a prompt/chat), or resets it via the backend's own user-management path, after which this entire blocker clears.
- **Also note:** the backend repo has uncommitted, in-progress work from another session (`feat/ollama-cloud-integration` branch, modified `app/ai/base.py`, new `ollama_cloud_provider.py`) — not touched, per instructions not to modify backend application files.
- **Verification status:** VERIFIED (backend health, migration, proxy wiring) / BLOCKED (authenticated workflow — missing credential, not a defect).

## 12. Two accessibility defects found and fixed (code-inspection only, no screen-reader/browser run)

- **Found:** (1) `DataTable.tsx`'s sortable column header buttons set `outline-none` with only a text-color change on `:focus-visible` — every other interactive element in the file pairs `outline-none` with a visible `focus-visible:ring-2`, so keyboard focus on a sort header was effectively invisible. (2) `DocumentUploadScreen.tsx`'s three validated fields (title/authority/source) had `aria-invalid` but their error `<p>` text had no `id`, so it wasn't linked via `aria-describedby` — a screen-reader user would hear "invalid" with no reason given.
- **Fixed:** commits `09679a4` (focus ring) and `624622b` (aria-describedby).
- **Checked and found already correct, no change needed:** DataTable sort-header semantics (`<button>` inside `<th aria-sort>`), all icon-only buttons across `shared/`/`shell/` (all have `aria-label`), Sidebar active-item `aria-current="page"`, Radix-based dialogs (Escape/focus-trap free from the library), status badges (color + text, not color-only).
- **Flagged, not changed (no concrete bug, just a risk worth noting):** `src/components/shared/Drawer.tsx` (used by the Attach Evidence / Raise Action / Record Decision dialogs) is a hand-rolled focus-trap/Escape/scroll-lock implementation, not Radix — its correctness rests on custom logic rather than a vetted library. No defect was found in it this session, so it was left alone per the instruction not to redo working design/behavior without evidence of a real inconsistency.
- **Not performed:** any live screen-reader or browser-based accessibility check — no browser automation tool is installed in this project and none was available this session.
- **Verification status:** VERIFIED (both fixes), PARTIAL (code-inspection sweep only, not exhaustive, not browser-tested).

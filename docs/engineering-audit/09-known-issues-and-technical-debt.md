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

## 2. Dashboard mixes live and mock data with no visible distinction

- **Affected:** `Dashboard.tsx`.
- **Evidence:** imports both `useApiQueries` hooks (`useAuditEvents`, `useProducts`, `useMarkets`, `useProcesses`, `useAuthorities`, `useSources`) and `@/data/mockData`.
- **Impact:** a user cannot tell which KPI tiles are live and which are illustrative.
- **Reproduction:** read `Dashboard.tsx` imports directly.
- **Recommended next action:** identify and label (or replace) the specific mock-backed tiles; this requires a closer per-tile read than this audit performed.
- **Verification status:** VERIFIED (import list), PARTIAL (which exact tiles are mock not individually traced).

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

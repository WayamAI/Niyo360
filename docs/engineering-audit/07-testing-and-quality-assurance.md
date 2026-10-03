# 07 — Testing and Quality Assurance

All commands below were executed fresh in this session on **2026-10-03** from the repo root. Output is summarized, not fabricated — exit codes and key lines are quoted from actual terminal output captured during the audit.

## Test framework

Vitest 5.0.2 (`npm test` → `vitest run`). No separate e2e/browser test framework (no Playwright/Cypress in `package.json`).

## Fresh test run — `npm run test -- --run`

```
Test Files  5 passed (5)
     Tests  42 passed (42)
  Start at  12:23:58
  Duration  428ms
```
**VERIFIED** (freshly executed). This confirms the previously-reported "42 passing tests" figure is accurate as of current `HEAD` (`491bf33`) — it was independently re-run, not copied from a prior report.

Test files and what they cover:
- `src/services/api/client.test.ts` (221 lines) — client base-URL/config behavior across test/dev/prod modes (the regression area fixed by `07dd839`/added by `bd6b310`).
- `src/services/api/auth.test.ts` (117 lines) — auth service/login flow.
- `src/services/api/phase8.test.ts` (213 lines) — evidence/audit/regulatory-intelligence typed client functions.
- `src/services/api/matchEvidence.test.ts` (80 lines) — evidence-matching parser logic.
- `src/hooks/usePortfolioNames.test.ts` (113 lines) — human-readable portfolio name resolution hook (the `ea094a0` fix area).

**No test file exists for any screen/UI component** — none of the 40 screen/dialog components in [04](./04-complete-screen-and-component-inventory.md) have direct test coverage, including the 6 Chronos-aligned detail screens. This is a real coverage gap, not a historical artifact — confirmed by `find`/listing during exploration and consistent with there being only 5 test files total.

## Typecheck — `npm run typecheck` (`tsc --noEmit`)

Exit code 0, no output. **VERIFIED, clean.**

## Lint — `npm run lint` (`eslint .`)

Exit code 0. **16 warnings, 0 errors**, all the same rule: `react-refresh/only-export-components` ("Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components"). Affected files: `RecordDecisionDialog.tsx`, `Badge.tsx` (×3), `Page.tsx`, `Sidebar.tsx`, `ui/badge.tsx`, `ui/button.tsx`, `ui/form.tsx`, `ui/navigation-menu.tsx`, `ui/sidebar.tsx`, `ui/toggle.tsx`, `AppContext.tsx` (×2), `AuthContext.tsx`, `ThemeContext.tsx`. **VERIFIED, pre-existing, non-blocking** — these are dev-experience warnings (HMR granularity), not correctness issues.

## Production build — `npm run build`

Exit code 0. **VERIFIED, succeeds** for both targets:
- Client bundle (`dist/client`): 2,614 modules transformed. Two chunks exceed Vite's 500kB warning threshold: `index-B5KZYVCt.js` (393.74 kB / gzip 123.74 kB) and `index-BhR3DnZA.js` (794.21 kB / gzip 207.44 kB). Vite's own suggested remediation (dynamic `import()`, `manualChunks`) is not yet applied — consistent with the "no per-screen code splitting" finding in [01](./01-frontend-architecture.md).
- SSR bundle (`dist/server`): 2,672 modules transformed, largest asset `index-CqirbHxk.js` at 1,611.38 kB (uncompressed; no gzip warning threshold applies to the SSR bundle the way it does the client one, but it is a large single chunk).

## Areas with no tests

- Every screen/dialog component (UI logic, conditional rendering, form validation wiring).
- Routing/`AppContext` screen-switching logic.
- Theme/dark-mode switching.
- The 12 mock-only screens (no logic beyond rendering static data, lower risk, but still untested).

## Browser/accessibility/responsive testing

**Not performed in this audit** — no browser automation tool was invoked in this session. Any claim of visual or interactive correctness beyond compile/lint/unit-test level is **BLOCKED** (no browser tooling available in this environment/session) rather than verified or disproven.

## API integration testing

The 3 API-layer test files (`client`, `auth`, `phase8`) test client *configuration* and typed-wrapper *shape*, largely against mocked fetch, not a live backend — confirmed by the test file names/sizes, though exact mocking strategy per file was not read line-by-line. No test in the suite exercises a real running backend. This means "integration" here is integration between the frontend client code and its own types/config, not frontend-to-live-backend integration.

## Summary

| Check | Result | Evidence quality |
|---|---|---|
| Unit tests | 42/42 passed, 5 files | VERIFIED |
| Typecheck | Clean | VERIFIED |
| Lint | 0 errors, 16 pre-existing warnings | VERIFIED |
| Production build (client + SSR) | Succeeds, 2 chunk-size warnings | VERIFIED |
| Component/screen tests | None exist | VERIFIED (absence) |
| Browser/visual/a11y testing | Not performed | BLOCKED |
| Live backend integration testing | Not performed | BLOCKED |

# 05 — UI Fixes and Implementation History

Evidence: `git log --format="%h %ad %s" --date=short -20` run 2026-10-03 (VERIFIED, all commits same author `arkabera2004`, all dated 2026-10-02 — this appears to be one concentrated working session, not work spread across days/weeks). `git show --stat` was run in exploration for the 7 named commits; file-change counts below are from that output.

| Commit | Date | Message | Files changed | Problem addressed | Present on `main`? |
|---|---|---|---|---|---|
| `07dd839` | 2026-10-02 | fix(api): restore client base url validation in tests while preserving dev proxy | `client.ts` + test | Regression in base-URL validation logic vs the new dev proxy | Yes |
| `c37f8f0` | 2026-10-02 | feat(dev): add api reverse proxy in vite config for local backend development | `vite.config.ts` | No way to hit a local backend without CORS/base-URL config during dev | Yes |
| `0b612fb` | 2026-10-02 | feat(theme): add Chronos design tokens, semantic aliases, and typography utilities | `styles.css` (foundation commit) | No shared design-token layer | Yes |
| `a077af0` | 2026-10-02 | feat(ui): align AppShell, TopBar, Sidebar, Panel, Page, and DataTable with Chronos patterns | shell + shared components | Shell/chrome visually inconsistent with new tokens | Yes |
| `bd6b310` | 2026-10-02 | test(api): verify client configuration behavior in test, dev, and prod modes | `client.test.ts` | No regression coverage for the dev-proxy/base-URL change | Yes |
| `ea094a0` | 2026-10-02 | fix(portfolio): resolve human-readable names for registrations | `RegistrationsScreen.tsx` (portfolio hook) | Registrations list showed raw IDs instead of names | Yes |
| `45133e7` | 2026-10-02 | feat(screens): enhance DocumentDetail with process action, resolve names in Registrations, and add change picker to ImpactAnalysis | `DocumentDetailScreen.tsx`, `RegistrationsScreen.tsx`, `ImpactAnalysisScreen.tsx` | Missing document-processing trigger; no way to pick a regulatory change before running impact analysis | Yes |
| `5c9a249` | 2026-10-02 | feat(dashboard): refine KPI grid and responsive card proportions matching Chronos | `Dashboard.tsx` | KPI grid layout didn't match Chronos spacing/responsive rules | Yes |
| `3c094a9` | 2026-10-02 | feat(impact): align ImpactAssessmentListScreen status badges with Chronos StatusBadge tokens | `ImpactAssessmentListScreen.tsx` | Status badges used ad hoc styling instead of the new `Badge` tokens | Yes |
| `8748f62` | 2026-10-02 | feat(regulatory): display source run history in drawer | `SourcesScreen.tsx` | No visibility into ingestion run history per source | Yes |
| `641a4ec` | 2026-10-02 | style(regulatory): format SourceRunsDrawer in SourcesScreen | `SourcesScreen.tsx` | Formatting cleanup after the run-history feature | Yes |
| `b74ef66` | 2026-10-02 | merge: resolve package-lock.json conflict with origin/main and sync wrangler config | `package-lock.json`, `wrangler.jsonc` | Merge conflict from parallel branch work | Yes |
| `f7ce872` | 2026-10-02 | Merge pull request #3 from WayamAI/feat/enterprise-ui-overhaul | (merge commit) | Integrates the enterprise-UI-overhaul branch into `main` | Yes |
| `1823dd2` | 2026-10-02 | feat(ui): align document detail panel with Chronos patterns | `DocumentDetailScreen.tsx` (+64/-62) | Detail panel inconsistent with Chronos visual patterns | Yes |
| `df40625` | 2026-10-02 | feat(ui): align regulatory change detail screen with Chronos patterns | `RegulatoryChangeDetailScreen.tsx` (+60/-64) | Same, for the change-detail screen | Yes |
| `38bedab` | 2026-10-02 | feat(ui): align control detail screen with Chronos patterns | `ControlDetailScreen.tsx` (+26/-21) | Same, for control detail | Yes |
| `5788204` | 2026-10-02 | feat(ui): align evidence detail screen with Chronos patterns | `EvidenceDetailScreen.tsx` (+48/-48) | Same, for evidence detail | Yes |
| `fd3ca21` | 2026-10-02 | feat(ui): align impact assessment detail screen with Chronos patterns | `ImpactAssessmentDetailScreen.tsx` (+60/-63) | Same, for impact assessment detail | Yes |
| `1c2085e` | 2026-10-02 | feat(ui): align report detail screen with Chronos patterns | `ReportDetailScreen.tsx` (+34/-32) | Same, for report detail | Yes |
| `491bf33` | 2026-10-02 | style: fix prettier formatting errors in detail screens | `EvidenceDetailScreen.tsx` (+10/-2), `RegulatoryChangeDetailScreen.tsx` (+14/-4) | Prettier formatting violations introduced by the two commits above | Yes (current `HEAD`) |

## Verification performed per change

- Presence on `main` confirmed via `git log --oneline` containing every listed hash in this exact order (VERIFIED).
- File-level diff stats for the 7 "Chronos alignment" + formatting commits confirmed via `git show --stat` (VERIFIED, done during exploration).
- No UI-fix commit was found to be reverted or superseded later in history — all are the final state as of `HEAD`.
- Functional correctness of each fix (e.g., does `useProcessDocument` actually work against a live backend) was **not** independently re-tested beyond the unit/type/lint/build checks in [07](./07-testing-and-quality-assurance.md); this history records *that the change was made*, not an independent runtime re-verification of each one.

## Bug fixes, regressions, unresolved issues

No open regression was identified in this commit range — `07dd839` reads as a self-correction of a regression introduced by `c37f8f0` within the same session, and `491bf33` similarly self-corrects formatting from the immediately preceding commits. No currently-unresolved UI bug was found in git history (absence of evidence, not proof of absence — see [09](./09-known-issues-and-technical-debt.md) for issues found by direct code inspection instead).

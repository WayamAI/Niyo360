# 04 — Complete Screen and Component Inventory

Evidence: `src/components/Shell.tsx` (ground-truth screen-id → component map, read in full), `src/context/AppContext.tsx` (`SCREEN_IDS`), direct `grep` of every screen file for `@/data/*` imports vs `@/hooks/useApiQueries`/`@/services/api` imports and `onClick`/`mutate` calls, performed in this session on 2026-10-03. This is the single source of truth other docs reference as "the screen inventory."

## Routing mechanism (for context)

One real route (`/`). `Shell.tsx` holds a flat object `SCREENS: Record<ScreenId, Component>` and renders `SCREENS[currentScreen]`. `currentScreen`/`id` come from `AppContext`, which mirrors them into the URL query string. No per-screen lazy `import()` — all 36 screen components are in the client's main bundle (see bundle-size warning in [07](./07-testing-and-quality-assurance.md)).

## Inventory

| Screen id / file | Purpose | Data source | Evidence | Key user actions | Status |
|---|---|---|---|---|---|
| `dashboard` — `Dashboard.tsx` | Landing KPI overview | **MIXED** | imports `useAuditEvents`, `useProducts`, `useMarkets`, `useProcesses`, `useAuthorities`, `useSources` from `useApiQueries`, **and** imports from `@/data/mockData` | nav buttons to other screens | PARTIAL |
| `feed-monitor` — `FeedMonitor.tsx` | Live-looking feed of incoming regulatory items | MOCK | imports from `@/data/regulatoryData` | filter clearing (`clearFilters`) | MOCK/ILLUSTRATIVE |
| `delta-reports` — `DeltaReports.tsx` | Legacy delta-report list | MOCK | imports from `@/data/regulatoryData` | row clicks | MOCK/ILLUSTRATIVE |
| `report-detail` — `ReportDetail.tsx` (legacy, distinct file from `ReportDetailScreen.tsx`) | Legacy report detail view | MOCK | imports from `@/data/regulatoryData` | — | MOCK/ILLUSTRATIVE |
| `agent-console` — `AgentConsole.tsx` | "Regulatory Intelligence Agent" console UI | MOCK | imports from `@/data/regulatoryData` | pause/resume toggle (`togglePause`) | MOCK/ILLUSTRATIVE |
| `haq-drafts` — `HAQDrafts.tsx` | Health authority query draft list | MOCK | imports `HAQ_DRAFTS`, `PRODUCT_BY_ID` from `mockData` | row clicks | MOCK/ILLUSTRATIVE |
| `variation-drafts` — `VariationDrafts.tsx` | Variation filing section drafts | MOCK | imports `PRODUCT_BY_ID`, `VARIATION_SECTION_DRAFTS` from `mockData` | row clicks | MOCK/ILLUSTRATIVE |
| `validator` — `PreSubmissionValidator.tsx` | Pre-submission validation runner | MOCK | imports `CHANGES`, `PRODUCTS`, `PRODUCT_BY_ID`, `VALIDATION_REPORTS` from `mockData` | "start" validation run | MOCK/ILLUSTRATIVE |
| `validation-reports` — `ValidationReports.tsx` | List of validation reports | MOCK | imports `VALIDATION_REPORTS` from `mockData` | row clicks | MOCK/ILLUSTRATIVE |
| `simulator` — `CMCChangeSimulator.tsx` | CMC change impact simulator | MOCK | imports `CHANGES`, `PRODUCTS`, `PRODUCT_BY_ID` from `mockData` | simulate action | MOCK/ILLUSTRATIVE |
| `new-change` — `NewChangeEntry.tsx` | Manual new-change entry form | MOCK | imports `PRODUCTS` from `mockData` | form submit | MOCK/ILLUSTRATIVE |
| `heatmap` — `MarketHeatmap.tsx` | Market impact heatmap | MOCK | imports `CHANGES`, `MARKET_IMPACT_CHG_0047` from `mockData` | cell clicks | MOCK/ILLUSTRATIVE |
| `calendar` — `RegulatoryCalendar.tsx` | Regulatory calendar | MOCK | imports `CALENDAR_EVENTS`, `CHANGES`, `EXTERNAL_MILESTONES` from `mockData` | event clicks | MOCK/ILLUSTRATIVE |
| `audit` — `AuditTrailScreen.tsx` (**lives in `screens/api/`, mapped from the legacy `audit` id**) | Audit trail (global or record-scoped) | **LIVE** | `useAuditEvents`, `useAuditEventTypes` | scoped-record navigation, filter | IMPLEMENTED |
| `escalations` — `Escalations.tsx` | Escalation list | MOCK | imports `ESCALATIONS` from `mockData` | row clicks | MOCK/ILLUSTRATIVE |
| `api-products` — `ProductsScreen.tsx` | Product portfolio list | LIVE | `useProducts` | filter/list | IMPLEMENTED |
| `api-markets` — `MarketsScreen.tsx` | Market list | LIVE | `useMarkets` | filter/list | IMPLEMENTED |
| `api-processes` — `ProcessesScreen.tsx` | Process list | LIVE | `useProcesses` | filter/list | IMPLEMENTED |
| `api-authorities` — `AuthoritiesScreen.tsx` | Regulatory authority list | LIVE | `useAuthorities` | filter/list | IMPLEMENTED |
| `api-sources` — `SourcesScreen.tsx` | Ingestion source list + run history | LIVE | `useSources`, `useSourceRuns`, `useRunSource` (mutation) | trigger source run, open run-log drawer | IMPLEMENTED |
| `api-documents` — `DocumentsScreen.tsx` | Regulatory document list | LIVE | `useDocuments` | filter/list, navigate to detail | IMPLEMENTED |
| `api-document-detail` — `DocumentDetailScreen.tsx` | Single document detail (Chronos-aligned commit `1823dd2`) | LIVE | `useDocument`, `useProcessDocument` (mutation), `useSources` | trigger "process document" action, navigate to audit scoped to record | IMPLEMENTED |
| `api-document-upload` — `DocumentUploadScreen.tsx` | Upload a new document | LIVE | `useAuthorities`, `useSources`, `useUploadDocument` (mutation) | file upload form submit | IMPLEMENTED |
| `api-impact` — `ImpactAssessmentListScreen.tsx` | Impact assessment list (status badges aligned per commit `3c094a9`) | LIVE | `useImpactAssessments` | filter/list | IMPLEMENTED |
| `api-impact-detail` — `ImpactAssessmentDetailScreen.tsx` | Impact assessment detail (Chronos-aligned commit `fd3ca21`) | LIVE | `useImpactAssessment`, `useImpactItems`, `useActions`, `useReviews`, plus `parseEvidence` helper | navigate to raise-action / record-decision dialogs, open scoped audit trail | IMPLEMENTED |
| `api-impact-analyze` — `ImpactAnalysisScreen.tsx` | Run/trigger impact analysis for a regulatory change, with a change picker (added commit `45133e7`) | LIVE | `useApiQueries` imports (analysis hooks) | run analysis | IMPLEMENTED |
| `api-reports` — `ReportListScreen.tsx` | Impact Delta Report list | LIVE | `useReports` | filter/list, navigate to generate/detail | IMPLEMENTED |
| `api-report-generate` — `ReportGenerateScreen.tsx` | Generate a new report | LIVE | `useGenerateReport` (mutation), `useImpactAssessments` | generate action | IMPLEMENTED |
| `api-report-detail` — `ReportDetailScreen.tsx` (Chronos-aligned commit `1c2085e`) | Single report detail + version history | LIVE | `useReport`, `useReportVersions` | — | IMPLEMENTED |
| `api-controls` — `ControlsScreen.tsx` | Controls list | LIVE | `useControls` | filter/list | IMPLEMENTED |
| `api-control-detail` — `ControlDetailScreen.tsx` (Chronos-aligned commit `38bedab`) | Control detail | LIVE | `useControl` | — | IMPLEMENTED |
| `api-registrations` — `RegistrationsScreen.tsx` | Product registrations list (human-readable name resolution added commit `ea094a0`) | LIVE | `useRegistrations` | filter/list | IMPLEMENTED |
| `api-reviews` — `ReviewListScreen.tsx` | Human-review queue | LIVE | `useReviews` | — (decisions recorded via `RecordDecisionDialog`) | IMPLEMENTED |
| `api-actions` — `ActionListScreen.tsx` | Remediation action list | LIVE | `useActions`, `useEvidence`, `useSetActionStatus` (mutation) | change action status, open evidence attach dialog, navigate to scoped audit | IMPLEMENTED |
| `api-changes` — `RegulatoryChangeListScreen.tsx` | Regulatory change list | LIVE | `useRegulatoryChanges` | filter/list | IMPLEMENTED |
| `api-change-detail` — `RegulatoryChangeDetailScreen.tsx` (Chronos-aligned commit `df40625`) | Regulatory change detail + obligations | LIVE | `useRegulatoryChange`-family hooks, `useChangeObligations`-type import | navigate to impact analysis | IMPLEMENTED |
| `api-obligations` — `ObligationListScreen.tsx` | Regulatory obligation list | LIVE | `useObligations` | filter/list | IMPLEMENTED |
| `api-evidence` — `EvidenceListScreen.tsx` | Evidence list | LIVE | `useEvidence` | filter/list | IMPLEMENTED |
| `api-evidence-detail` — `EvidenceDetailScreen.tsx` (Chronos-aligned commit `5788204`) | Evidence detail | LIVE | `useAction`, `useEvidenceItem`, direct `evidenceApi` import | download evidence file, open related action, navigate to scoped audit | IMPLEMENTED |
| (dialog) `AttachEvidenceDialog.tsx` | Attach evidence to an action | LIVE | `useUploadEvidence` (mutation) | submit/cancel | IMPLEMENTED |
| (dialog) `RaiseActionDialog.tsx` | Raise a remediation action from an impact item | LIVE | `useCreateAction` (mutation) | submit/cancel | IMPLEMENTED |
| (dialog) `RecordDecisionDialog.tsx` | Record a human-review decision | LIVE | `useCreateReview` (mutation) | submit/cancel | IMPLEMENTED |
| `Login.tsx` (not in `SCREENS` map — rendered outside the shell when unauthenticated, per `routes/index.tsx`) | Sign-in | N/A (auth form) | `useAuth` context, no data hooks | sign-in submit | IMPLEMENTED |

**Total: 36 screen-id-mapped components + 3 dialogs + `Login.tsx` = 40 components.** 24 are 100%-live `screens/api/*` files; `audit` is also live despite its non-`api-` id; `Dashboard` is mixed; the remaining 12 top-level screens are mock-only.

## Component classification summary

- **LIVE (no mock data at all):** 24 `screens/api/*` files + `audit` (AuditTrailScreen) + 3 dialogs = **28 of 40** screens/components.
- **MIXED:** `Dashboard` (1).
- **MOCK/ILLUSTRATIVE:** `feed-monitor`, `delta-reports`, `report-detail` (legacy), `agent-console`, `haq-drafts`, `variation-drafts`, `validator`, `validation-reports`, `simulator`, `new-change`, `heatmap`, `calendar`, `escalations` = **12 of 40**.

This directly confirms — rather than assumes — the premise in the user's brief that "some modules remain mock-driven": specifically the CMC simulator, pre-submission validator, HAQ/variation drafting, feed monitor, agent console, market heatmap, regulatory calendar, escalations, and the legacy delta-reports/report-detail pair. The naming convention (`screens/` vs `screens/api/`) turned out to be a reliable predictor here — every file actually under `screens/api/` was confirmed live with zero exceptions, and the only live screen outside that folder (`AuditTrailScreen`) in fact *does* physically live under `screens/api/`, it is just mapped from the historically-named `audit` screen id rather than an `api-*` id.

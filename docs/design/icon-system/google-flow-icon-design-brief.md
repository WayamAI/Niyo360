# PARIVART Icon System — Google Flow Design Brief

**Status:** audit of real code, section A–E verified against source; sections F–K are proposed design decisions for your review, clearly marked as such. Nothing here claims generated artwork exists — no Google Flow output has been produced yet.

**Scope:** every icon in the PARIVART frontend (`reg_iq-main`), to prepare custom replacement artwork generated in Google Flow.

---

## A. Product and visual context

**What PARIVART does.** A regulatory-change-intelligence platform: it ingests regulatory documents from external authorities, extracts obligations and changes, assesses impact against a company's product/market/process portfolio, routes findings through human review, and produces an auditable Impact Delta Report with an evidence trail. Source: `docs/engineering-audit/02-system-design-and-product-workflow.md` (prior audit in this repo).

**Workflow the icon system must support:** Regulatory Sources → Regulatory Documents → Document Processing → Regulatory Intelligence (Changes/Obligations) → Portfolio (Products/Markets/Processes) → Impact Assessment → Impact Delta Report → Human Review → Actions → Evidence → Audit Trail. Verified against `src/components/shell/Sidebar.tsx`'s nav structure and `src/context/AppContext.tsx`'s `SCREEN_IDS`.

**Intended users:** enterprise regulatory-affairs and compliance teams at a regulated manufacturer (the seeded demo organization is "Asterion Medical Systems," a medical-device company) — professionals doing dense, data-heavy review work, not consumers. This implies a restrained, information-dense visual language over playful or decorative icon art.

**Existing visual design language (verified in code):**
- Typography: `Michroma` for display/headings, `Geist` for UI text, `Geist Mono` for tabular/numeric data (`src/styles.css:1,501-503`).
- Brand color: `--brand: var(--ref-orange-600)` in light theme, `var(--ref-orange-500)` in dark theme (`src/styles.css:195,334`). This is the only accent color used for primary actions/focus rings — the rest of the palette is semantic (success/warning/error/info) and neutral gray.
- Corner radii: base `--radius: 0.5rem` (8px), with derived scale `--radius-sm` (4px) → `--radius-2xl` (16px) (`src/styles.css:105,367-371`).
- Icon size scale (CSS custom properties, consumed by every icon in the app): `--icon-size-xs: 12px`, `sm: 14px`, `md: 16px`, `lg: 18px`, `xl: 20px`, `2xl: 24px`, `3xl: 28px` (`src/styles.css:15-21`). Documented per-context defaults in `src/components/icons/AppIcon.tsx:8-10`: sidebar 18px, button 16px, table/small action 14px, badge/status 12–14px, search 16px, empty state 24–28px.
- Stroke weight: every icon currently renders at `strokeWidth={1.75}` by default (`src/components/icons/AppIcon.tsx:34`), a thin/outline style, never filled — stated explicitly in the registry's own header comment: "a thin, uniform-weight outline set... not filled" (`src/components/icons/registry.ts:9-10`).
- Design system reference: the prior engineering audit (`docs/engineering-audit/03-chronos-design-system-and-ui-implementation.md`) found PARIVART's token *architecture* is modeled on an external "Chronos" reference app, with PARIVART's own independent color values — not a literal visual copy. The icon system described here is PARIVART's own and must not borrow Chronos's or Drishti's domain concepts, colors, or glyph choices.
- Current icon library: **lucide-react** (`package.json`, `"lucide-react": "^0.575.0"`), a thin uniform-stroke outline icon set — this is the family being replaced for domain concepts, not for every icon (see section D).

**Domain icons vs. interface-action icons — the distinction this brief uses throughout:**
- A **domain icon** represents a PARIVART-specific business concept (a regulatory change, an obligation, an impact assessment) — these carry the most product identity and are the primary candidates for custom replacement.
- An **interface-action icon** represents a conventional, universally-recognized UI action (search, close, chevron, download) — users' muscle memory for these symbols is a usability asset, not a branding opportunity. Section D gives a reasoned policy on which stay conventional.

**Marked `TO CONFIRM`:** no formal brand guideline document exists in this repository beyond the CSS tokens cited above; any color/identity claim beyond what's quoted is `TO CONFIRM` with the design/brand owner, not assumed here.

---

## B. Complete icon inventory

Verified by reading `src/components/icons/registry.ts` (the single icon registry — all icons resolve through `<AppIcon name="X">` / `<IconButton icon="X">`, backed by lucide-react) and grepping every usage site across `src/`. All 45 registry entries are listed; 39 are rendered somewhere, 6 are declared but never used (flagged).

| Icon ID | Display name | Current icon (lucide) | Current source | Screen/route | Context | Meaning | Approx. size | Current colour | Proposed replacement | Priority | Implementation notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `nav-dashboard` | Command Centre | `LayoutDashboard` | `registry.ts:75` (`dashboard`) | Sidebar | Nav item | Dashboard/overview | 18px (lg) | inherited | Custom | P1 | Sidebar `SECTIONS` data, `icon: "dashboard"` |
| `crumb-home` | Home breadcrumb | `Home` | `registry.ts:76` (`home`) | Every `PageHeader` | Breadcrumb | "Home" root crumb | 12px (xs) | `text-icon-quaternary` | Retain conventional | P4 | `Page.tsx:26` |
| `regulatory-feed` | Feed / Sources / Changes (reused) | `Radio` | `registry.ts:77` (`feed`) | Sidebar (×2: Sources, Regulatory Changes), Agent Console tab | Nav item, tab button | "Live regulatory feed" — **reused for 2 distinct domain concepts, see §E** | 18px / 16px | inherited | Split into `regulatory-source` + `regulatory-change` (custom) | P1 | `Sidebar.tsx:120,122`, `AgentConsole.tsx:157` |
| `impact-delta-report` | Impact Delta Report | `FileSearch` | `registry.ts:78` (`deltaReport`) | Sidebar (×2, consistent concept), Agent Console tab | Nav item, tab button | The product's signature deliverable | 18px / 16px | inherited | Custom (flagship icon) | P1 | `Sidebar.tsx:80,125` |
| `intelligence-agent` | Intelligence Agent / AI assistant | `Sparkles` | `registry.ts:79` (`agent`) | Sidebar, TopBar, AI Assistant, Feed Monitor, Report Detail, Agent Console (dynamic) | Nav item, button, attribution badge | "AI/agent-authored" marker | 18px/16px/14px | inherited | Custom | P1 | Also referenced dynamically via `ACTIVITY_ICONS`/`ICONS` lookup maps, see §E |
| `haq-response` | HAQ Responses | `PenLine` | `registry.ts:80` (`haqDraft`) | Sidebar | Nav item | AI-drafted health-authority-query responses | 18px | inherited | Custom | P2 | — |
| `variation-draft` | Variation Sections | `FileText` | `registry.ts:81` (`variationDraft`) | Sidebar | Nav item | Dossier variation drafting | 18px | inherited | Custom — **shares glyph with `document`, see §E** | P2 | — |
| `compliance-validator` | Pre-Submission Validator / Controls / Human Review (reused) | `ShieldCheck` | `registry.ts:82` (`validator`) | Sidebar (×3) | Nav item | "Compliance verification" — **reused for 3 distinct concepts, see §E** | 18px | inherited | Split into `pre-submission-validator` + `control` + `human-review` (custom) | P1 | `Sidebar.tsx:100,129,131` |
| `validation-report` | Validation Reports | `ClipboardCheck` | `registry.ts:83` (`validationReport`) | Sidebar | Nav item | Validator output document | 18px | inherited | Custom | P3 | — |
| `change-simulator` | CMC Simulator | `Zap` | `registry.ts:84` (`simulator`) | Sidebar, Dashboard, Pre-Submission Validator, New Change Entry, Market Heatmap | Nav item, alert row, buttons | "Run simulation" | 18px/16px/14px | inherited | Custom | P2 | — |
| `market-heatmap` | Market Heatmap / Markets (reused) | `Map` | `registry.ts:85` (`map`) | Sidebar (×2, same concept — geography) | Nav item | Geographic market view | 18px | inherited | Custom | P2 | Shared concept, not a collision |
| `regulatory-calendar` | Regulatory Calendar | `CalendarDays` | `registry.ts:86` (`calendar`) | Sidebar | Nav item | Deadline/filing calendar | 18px | inherited | Retain conventional (calendar is a universal pictogram) | P3 | — |
| `audit-registration` | Audit Trail / Registrations (reused) | `ListChecks` | `registry.ts:87` (`audit`) | Sidebar (×2), Sources screen | Nav item, button | "Checklist/record" — **reused for 2 distinct concepts, see §E** | 18px/14px | inherited | Split into `audit-trail` + `registration` (custom) | P1 | `Sidebar.tsx:130,134`, `SourcesScreen.tsx:120` |
| `escalation` | Escalations / Actions (reused) | `AlertTriangle` | `registry.ts:88` (`escalation`) | Sidebar (×2), Dashboard alert row | Nav item, alert | "Needs urgent attention" — **shares glyph with `warning`, and reused for 2 distinct nav concepts, see §E** | 18px/16px | inherited | Split into `escalation` + `action` (custom), keep visually distinct from the `warning` feedback icon | P1 | `Sidebar.tsx:132,143`, `Dashboard.tsx` |
| `search` | Search | `Search` | `registry.ts:91` | DataTable, Filters, empty state | Input, empty state | Search action | 16px | inherited | Retain conventional | P4 | `DataTable.tsx:247`, `Filters.tsx:159` |
| `filter` | Filter | `Filter` | `registry.ts:92` | — | — | Declared, **unused anywhere in `src/`** | — | — | Retain conventional if ever used | P4 | Flag as dead code, §E |
| `refresh` | Refresh/Retry | `RefreshCw` | `registry.ts:93` | States, ApiState, Dashboard, Feed Monitor, Agent Console | Button | Reload data | 14px | inherited | Retain conventional | P4 | — |
| `download` | Export/Download | `Download` | `registry.ts:94` | DataTable (CSV export), Report Detail, Validation Reports | Button | Export data | 14px | inherited | Retain conventional | P4 | — |
| `copy` | Copy | `Copy` | `registry.ts:95` | Report Detail | Icon button | Copy ID to clipboard | 14px | inherited | Retain conventional | P4 | — |
| `edit` | Edit | `Edit3` | `registry.ts:96` | Report Detail ("Override") | Button | Modify a value | 14px | inherited | Retain conventional | P4 | — |
| `share` | Share | `Share2` | `registry.ts:97` | — | — | Declared, **unused anywhere in `src/`** | — | — | Retain conventional if ever used | P4 | Flag as dead code, §E |
| `send` | Send | `Send` | `registry.ts:98` | AI Assistant | Chat send button | Submit message | 16px | inherited | Retain conventional | P4 | — |
| `close` | Close | `X` | `registry.ts:99` | AI Assistant, Drawer, Toast, Filters (clear chip) | Icon button | Dismiss | 14–16px | inherited | Retain conventional | P4 | — |
| `external-link` | External link | `ExternalLink` | `registry.ts:100` | Report Detail, Agent Console, Authorities | Link | Opens outside the app | 14px | inherited | Retain conventional | P4 | — |
| `view` | View | `Eye` | `registry.ts:101` | Feed Monitor row action | Icon-only row button | Open detail | 14px | inherited | Retain conventional | P4 | via `RowAction` wrapper |
| `obligation-flag` | Flag / Obligations | `Flag` | `registry.ts:102` | Sidebar, Feed Monitor row action | Nav item, row action | "Follow-up required" **and** sidebar label for the Obligations domain concept — dual-use, see §E | 18px/14px | inherited | Custom `obligation` domain icon for nav; keep generic `flag` interface icon separately | P1 (domain) / P4 (interface) | `Sidebar.tsx:123`, `FeedMonitor.tsx:165` |
| `assign` | Assign/Reassign | `UserPlus` | `registry.ts:103` | Report Detail, Feed Monitor row action | Button | Assign ownership | 14–16px | inherited | Retain conventional | P4 | — |
| `play` | Play/Run | `Play` | `registry.ts:104` | Agent Console (dynamic), Sources ("Run"), Document Detail ("Process Document") | Button | Start a process | 16px | inherited | Retain conventional | P4 | — |
| `pause` | Pause | `Pause` | `registry.ts:105` | Agent Console (dynamic) | Button | Pause polling | 16px | inherited | Retain conventional | P4 | — |
| `menu` | Menu/hamburger | `Menu` | `registry.ts:106` | TopBar | Sidebar-collapse toggle | Toggle nav | 16px | inherited | Retain conventional | P4 | — |
| `more` | More actions | `MoreHorizontal` | `registry.ts:107` | — | — | Declared, **unused anywhere in `src/`** | — | — | Retain conventional if ever used | P4 | Flag as dead code, §E |
| `chevron-up/down/left/right` | Sort/expand/collapse chevrons | `ChevronUp/Down/Left/Right` | `registry.ts:110-113` | DataTable (sort + pagination), Filters, Report Detail, Agent Console, TopBar, RightRail, Dashboard | Table header, pager, expand toggle | Direction/state | 14–16px | inherited | Retain conventional | P4 | Heavily reused, dynamic selection in several places |
| `arrow-left` | Back | `ArrowLeft` | `registry.ts:114` | States (`NotFoundState`), Page header | Button | Go back | 16px | inherited | Retain conventional | P4 | — |
| `arrow-right` | Forward | `ArrowRight` | `registry.ts:115` | — | — | Declared, **unused anywhere in `src/`** | — | — | Retain conventional if ever used | P4 | Flag as dead code, §E |
| `trend-up` / `trend-down` | KPI trend | `TrendingUp` / `TrendingDown` | `registry.ts:116-117` | Panel (KPI tile, dynamic `trendIcon` prop) | KPI tile | Metric direction | 12px (xs) | inherited | Retain conventional | P4 | — |
| `settings` | Settings / "system" event | `Cog` | `registry.ts:120` | Agent Console / Report Detail activity-timeline lookup (dynamic) | Timeline row icon | "System-originated event" | 14–16px | inherited | Retain conventional | P4 | Dynamic via `ACTIVITY_ICONS`/`ICONS` maps |
| `notification` | Notification bell | `Bell` | `registry.ts:121` | TopBar, activity-timeline lookup (dynamic) | Icon button, timeline row | Alerts | 16px | inherited | Retain conventional | P4 | — |
| `user` | User / "user" event | `User` | `registry.ts:122` | Audit-timeline lookup (dynamic, `ReportDetail.tsx` only) | Timeline row icon | "User-originated event" | 14px | inherited | Retain conventional | P4 | No literal `name="user"` call found outside the dynamic map |
| `organisation` | Authorities | `Building2` | `registry.ts:123` | Sidebar | Nav item | Regulatory authority / institution | 18px | inherited | Custom (`regulatory-authority`) | P1 | — |
| `sign-out` | Sign out | `LogOut` | `registry.ts:124` | TopBar (via `IconButton`) | Icon button | Log out | 16px (md) | inherited | Retain conventional | P4 | The only `<IconButton>` call site in the app |
| `theme-light` / `theme-dark` | Theme toggle | `Sun` / `Moon` | `registry.ts:125-126` | TopBar (dynamic ternary) | Icon button | Switch theme | 16px | inherited | Retain conventional | P4 | — |
| `inbox` | Ingestion event | `Inbox` | `registry.ts:127` | Activity-timeline lookup (dynamic), empty-state default | Timeline row, empty state | "Ingestion-originated event" / default empty icon | 14–24px | inherited | Retain conventional | P4 | — |
| `clock` | Timestamp | `Clock` | `registry.ts:128` | Agent Console (last-sync row) | Inline icon | "Time since" | 14px | inherited | Retain conventional | P4 | — |
| `timer` | Deadline urgency | `Timer` | `registry.ts:129` | Dashboard alert row | Alert icon | "Approaching SLA/deadline" | 16px | inherited | Retain conventional | P4 | — |
| `bot` | Agent event | `Bot` | `registry.ts:130` | Activity-timeline lookup (dynamic) | Timeline row icon | "Agent-authored event" | 14px | inherited | Could become custom if the `intelligence-agent` family extends here | P3 | — |
| `regulatory-document` | Documents / Products / Evidence (reused) | `FileText` | `registry.ts:133` (`document`) | Sidebar (×3), HAQ Drafts, Variation Drafts | Nav item, row icon | Generic "paper record" — **reused for 3 distinct domain concepts, see §E** | 18px/14px/16px | inherited | Split into `regulatory-document` + `portfolio-product` + `evidence` (custom) | P1 | `Sidebar.tsx:121,126,133` |
| `chart` | Chart | `BarChart3` | `registry.ts:134` | — | — | Declared, **unused anywhere in `src/`** | — | — | n/a | P4 | Dashboard's bar chart uses `recharts` directly, not this icon; flag as dead code |
| `activity` | Sidebar section marker | `Activity` | `registry.ts:135` | Sidebar (bottom section icon) | Section header | "Live/Governance" section marker | 18px | inherited | Retain conventional | P4 | `Sidebar.tsx:337` |
| `gauge` | Gauge | `Gauge` | `registry.ts:136` | — | — | Declared, **unused anywhere in `src/`** | — | — | n/a | P4 | Flag as dead code |
| `layers` | Impact Assessments / Processes (reused) | `Layers` | `registry.ts:137` | Sidebar (×2) | Nav item | "Stacked/composed records" — **reused for 2 distinct domain concepts, see §E** | 18px | inherited | Split into `impact-assessment` + `portfolio-process` (custom) | P1 | `Sidebar.tsx:124,128` |
| `risk-indicator` | Risk | `ShieldAlert` | `registry.ts:138` | Atoms (risk callout), States | Badge/callout | Risk level | 14–16px | `text-pillar-02` or inherited | Custom | P1 | `Atoms.tsx:12` |
| `success` | Success feedback | `CheckCircle2` | `registry.ts:141` | Toasts, Approve/Mark-reviewed buttons, Right Rail | Toast, button | Positive outcome | 16–18px | `text-success-icon` | Retain conventional | P4 | — |
| `warning` | Warning feedback | `AlertTriangle` | `registry.ts:142` | ApiState, Toasts, Feed Monitor, Sources, Report Detail | Toast, empty/error state, badge | Caution — **shares exact glyph with `escalation`, see §E** | 14–16px | `text-warning-icon` | Retain conventional, but give `escalation` a visually distinct custom glyph so the two are never confusable | P1 (resolving the collision) | — |
| `error` | Error feedback | `AlertCircle` | `registry.ts:143` | Toasts, Login form, Dashboard alert | Toast, form, alert | Failure | 16px | `text-error-icon` | Retain conventional | P4 | — |
| `info` | Info feedback | `Info` | `registry.ts:144` | Toasts, Dashboard | Toast, callout | Neutral information | 16px | `text-info-icon` (or inherited) | Retain conventional | P4 | — |

**Dynamic icon selection (verified, not assumed):** `Sidebar.tsx` (`name={item.icon}` from nav data), `States.tsx` (`StateBlock`'s `icon` prop), `TopBar.tsx` (collapse chevron + theme toggle ternaries), `RightRail.tsx` (collapse chevron), `Panel.tsx` (`trendIcon` prop), `Dashboard.tsx` (`attention` array), `FeedMonitor.tsx` (`RowAction`'s `icon` prop), and two near-identical event-type lookup dictionaries in `AgentConsole.tsx` and `ReportDetail.tsx` (both map `ingestion/agent/system/notification[/user]` → `inbox/bot/settings/notification[/user]`) — a duplication opportunity noted in §E.

---
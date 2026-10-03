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

## C. Domain icon taxonomy

Proposed custom-icon set, derived from the collisions found in §B — splitting each overloaded registry entry into one icon per real domain concept rather than preserving the current reuse. 17 custom domain icons, grouped by the workflow stage they represent.

### Regulatory intake

**`regulatory-authority`** — the issuing body (FDA, EMA, etc.). *Metaphor:* an institutional/column or shield-with-mark motif distinct from the generic `compliance-validator` shield. *Silhouette:* must read as "institution," not "security." *At small size must communicate:* "official body." *Must not resemble:* a generic shield (confusable with `control`/`human-review` if those also use shield language) or a building/office icon generic enough to mean "company." *Confusable with:* `control` if both use shield forms — give authority a columned/pedimented motif instead. *Appears in:* sidebar nav, authority detail screens, document metadata.

**`regulatory-source`** — an ingestion feed/channel (RSS, scrape target, API feed) that documents arrive from. *Metaphor:* a funnel/antenna/intake motif — "things flow in from here." *Silhouette:* directional, something entering a container. *Must not resemble:* `regulatory-change` (see next) despite both currently sharing the `feed`/Radio glyph. *Appears in:* sidebar nav ("Sources"), source list/detail, document provenance.

**`regulatory-document`** — a single ingested regulatory document (the object being processed). *Metaphor:* a page/sheet, but must be visually distinct from `portfolio-product` and `evidence`, which currently share this exact glyph. *Distinctive silhouette:* a page with a folded corner or a recognizable "official text" marking (e.g., a short rule/line pattern suggesting dense legal text), not a blank page. *Must not resemble:* a generic blank-page "file" icon users would read as "any document" — it needs a cue that this is specifically a *regulatory source text*. *Appears in:* sidebar nav, documents list/detail, upload screen, HAQ/Variation draft row icons.

**`document-processing`** — the pipeline state itself (new concept; currently represented only by colored text badges, no icon exists). *Metaphor:* a document mid-transformation — e.g., a page with a small gear or pulse motif overlaid, signaling "being worked on by the system," distinct from a generic settings gear. *Must communicate at small size:* "in motion," not "static record." *Appears in:* document detail status badge (optional icon pairing with the existing `PARSED`/`ANALYZED`/`FAILED` text badge), list status chip.

### Regulatory intelligence

**`regulatory-change`** — an extracted change from a document (the atomic unit of regulatory intelligence). *Metaphor:* a document with a delta/diff mark (e.g., a small arrow or asterisk breaking out of a page shape), signaling "something changed here." *Must not resemble:* `regulatory-document` (the source) or `impact-delta-report` (the downstream output) — this is the *middle* concept and needs its own clearly transitional visual language (e.g., a split/branch motif). *Appears in:* sidebar nav ("Regulatory Changes"), change list/detail, obligation's "originating change" link-through.

**`obligation`** — a specific compliance requirement derived from a change. *Metaphor:* currently borrows the generic `flag` interface icon for its nav entry — propose a checklist-item or pennant-with-mark motif that reads as "a requirement to satisfy," distinct from the plain interface `flag` (which should remain available separately for "flag for follow-up" row actions). *Must not resemble:* `audit-trail`'s checklist motif — keep obligation's mark singular/pointed vs. audit's multi-line list. *Appears in:* sidebar nav, obligation list, change-detail "Obligations" panel.

### Portfolio

**`portfolio-product`** — a company product/device in the portfolio. *Metaphor:* a tagged/labeled box or device outline — must NOT reuse the plain page glyph (`document`) that currently represents it. *Must communicate:* "a thing the company makes," not "paperwork about a thing." *Appears in:* sidebar nav, products list/detail, impact-assessment "potentially affected" references.

**`portfolio-market`** — a geographic market. Current `map` glyph is conceptually correct and reused consistently (Markets + Market Heatmap) — not a collision, but still a candidate for a custom treatment matching the family's visual language. *Metaphor:* simplified region/pin motif, avoid real-world geographic detail that would date or misrepresent actual geography. *Appears in:* sidebar nav (×2), portfolio screens, heatmap.

**`portfolio-process`** — an internal business process. *Metaphor:* currently shares `layers` with `impact-assessment` — needs its own flow/sequence motif (e.g., connected nodes or a simple flowchart glyph) distinct from "stacked layers." *Must not resemble:* `impact-assessment`'s stack motif or `regulatory-change`'s branch motif. *Appears in:* sidebar nav, processes list/detail.

**`control`** — a compliance control record. *Metaphor:* currently shares the `compliance-validator` shield with Pre-Submission Validator and Human Review. Needs a distinct checkmark-in-frame or gate motif — "a check that must pass," more static/structural than the validator's "run a check" action feel. *Must not resemble:* `human-review` (a person/decision concept) or `pre-submission-validator` (an action/run concept). *Appears in:* sidebar nav, controls list/detail.

**`registration`** — a product's regulatory registration/filing record. *Metaphor:* currently shares `audit-trail`'s `ListChecks` glyph — needs a stamped-document or certificate motif, distinct from audit's chronological-list motif. *Appears in:* sidebar nav, registrations list.

### Impact and reporting

**`impact-assessment`** — the core analytical record linking a change to portfolio entities. *Metaphor:* currently shares `layers` with `portfolio-process` — propose a crosshair/intersection motif (two things meeting) to visually encode "assessing where a change intersects the portfolio," which is the actual product concept. *Must be the most distinctive icon in the family* — this is PARIVART's core analytical primitive. *Appears in:* sidebar nav, impact list/detail, impact-analysis screen.

**`impact-delta-report`** — the exported deliverable. Current `FileSearch` concept (document + inspection) is reused consistently (not a collision) and is conceptually sound — propose a custom icon keeping the "document + magnifying/delta" idea but in the family's unified construction style. *Appears in:* sidebar nav (×2), report list/detail/generate.

**`risk-indicator`** — a risk-level callout. Current `ShieldAlert` is reasonable; propose a custom shield-with-signal motif distinct from `control`'s shield (if control also uses shield language, risk's must carry an alert/signal mark control's does not). *Appears in:* risk callouts, impact rationale.

### Governance

**`human-review`** — a review decision record. *Metaphor:* currently shares the `compliance-validator` shield — needs a distinct person/decision motif (e.g., a simple figure with a checkmark or a decision-fork glyph), explicitly about a *human* act, not an automated check. *Must not resemble:* `control` (structural/automated) or the generic `user` interface icon (too generic/unrelated to "decision"). *Appears in:* sidebar nav, reviews list, record-decision dialog.

**`action`** — a remediation action/task. *Metaphor:* currently shares `AlertTriangle` with `escalation` — needs a distinct motif, e.g., a checkbox-with-arrow or task-pointer glyph signaling "something to do," not "something urgent." *Must not resemble:* `escalation` (urgency) or `warning`/`escalation`'s shared triangle at all — this collision is the most important one to resolve since actions are a routine, frequent workflow object, not an alarm state. *Appears in:* sidebar nav, actions list/detail, raise-action dialog.

**`evidence`** — supporting evidence attached to an action/review. *Metaphor:* currently shares the plain `document` glyph — needs a document-with-attachment or document-with-seal motif signaling "proof," distinct from `regulatory-document` (an external source) and `portfolio-product` (an internal asset). *Appears in:* sidebar nav, evidence list/detail, attach-evidence dialog.

**`audit-trail`** — the chronological event log. Current `ListChecks` concept is reasonable for "audit" alone; propose a custom clock-and-list or timeline motif that visually distinguishes it from `registration`'s certificate motif (both currently share `ListChecks`). *Appears in:* sidebar nav, audit trail screen.

### Alerting (kept visually separate from the feedback-color system)

**`escalation`** — an SLA/urgency alert specific to the escalations workflow. *Must be visually distinct from the generic `warning` feedback icon*, which currently shares the exact same `AlertTriangle` glyph — this is the collision most likely to cause real user confusion, since one appears in toasts/forms (transient, low-stakes) and the other in a dedicated governance workflow (a tracked, named escalation record). Propose a distinct motif, e.g., a triangle-with-clock or flare glyph rather than the plain triangle every "warning" in the app already uses. *Appears in:* sidebar nav, dashboard alert row, escalations screen.

---

## D. Interface-action icon inventory

Conventional interface actions, inventoried separately from domain icons, with a reasoned retain/replace policy per icon (not a blanket rule).

| Action | Current icon | Policy | Reasoning |
|---|---|---|---|
| Search | `Search` | **Retain conventional** | Universally recognized magnifying glass; a custom alternative would cost recognition for no brand gain |
| Add/create | *(no dedicated registry entry found — screens use text buttons like "Upload document," "Raise action")* | n/a | No icon exists to replace; `TO CONFIRM` whether one should be introduced |
| Edit | `Edit3` | **Retain conventional** | Pencil silhouette is a settled convention |
| Delete | *(no dedicated registry entry found — no destructive delete action exists in the inspected screens)* | n/a | `TO CONFIRM` — not found in this audit |
| Close | `X` | **Retain conventional** | Universal dismiss symbol |
| Back/forward | `ArrowLeft` / `ArrowRight` (forward unused) | **Retain conventional** | Directional arrows are a settled convention; `arrowRight` currently has zero usages — see §E |
| Expand/collapse | `ChevronUp/Down/Left/Right` | **Retain conventional** | Chevrons are the settled disclosure convention; heavily reused across sort/pagination/collapse, replacing would touch the most call sites in the app for the least brand benefit |
| Filter | `Filter` | **Retain conventional, but currently unused** | Funnel glyph is a settled convention; flagged dead code in §E, not a design issue |
| Sort | reuses `chevronUp`/`chevronDown` dynamically | **Retain conventional** | Consistent with the chevron family above |
| Refresh | `RefreshCw` | **Retain conventional** | Circular-arrow refresh symbol is universal |
| Download/export | `Download` | **Retain conventional** | Settled convention, consistent usage |
| Upload/import | *(no dedicated icon — `DocumentUploadScreen` uses a plain `<input type="file">`, no icon)* | n/a | `TO CONFIRM` whether an upload icon should be added for visual balance with `download` |
| Notifications | `Bell` | **Retain conventional** | Settled convention |
| Settings | `Cog` | **Retain conventional** | Settled convention; also doubles as the "system event" icon in activity timelines — a secondary, defensible reuse (both mean "the system, not a person, did this") |
| Calendar/clock | `CalendarDays`, `Clock`, `Timer` | **Retain conventional** for the interface sense; `regulatory-calendar`'s *nav* icon is listed as a custom candidate in §C only because it's also a top-level domain destination, not because the pictogram itself needs to change | Calendar/clock pictograms are near-universal |
| Check/success | `CheckCircle2` | **Retain conventional** | Settled convention |
| Error/warning | `AlertCircle` / `AlertTriangle` | **Retain conventional**, but see the `escalation` collision in §C — the fix is giving `escalation` its own glyph, not changing `warning` | — |
| More actions | `MoreHorizontal` | **Retain conventional, but currently unused** | Settled convention; flagged dead code in §E |
| External link | `ExternalLink` | **Retain conventional** | Settled convention |
| Visibility controls | `Eye` (view only — no "hide/eye-off" found) | **Retain conventional** | Settled convention |
| Pagination | `ChevronLeft` / `ChevronRight` | **Retain conventional** | Same as expand/collapse above |
| Loading/progress | *(no dedicated icon — loading states use `TableSkeleton`/shimmer components, not an icon; `refresh`'s spin animation, if any, is `TO CONFIRM`)* | n/a | `TO CONFIRM` |
| Navigation arrows | `ArrowLeft`/`ArrowRight`, `ChevronLeft`/`ChevronRight` | **Retain conventional** | — |

**Overall policy:** every icon in this table stays on the conventional lucide/outline language. The custom family (§C) is reserved entirely for PARIVART's own domain vocabulary, where there is no pre-existing user expectation to preserve and real brand value in a distinctive mark.

---

## E. Inconsistency and duplication report

Every item below is a **verified defect** (confirmed by reading the cited source), not a subjective design opinion. Subjective opportunities are labeled as such separately.

### Verified: same exact glyph used for two unrelated registry entries

1. **`AlertTriangle` → both `escalation` and `warning`** (`registry.ts:88,142`). Impact: an "Escalations" nav icon and every generic warning toast/badge in the app render the identical symbol — a user cannot visually distinguish "this is the dedicated Escalations workflow" from "this is a generic caution state" by icon alone. **Resolution proposed in §C:** give `escalation` its own glyph.
2. **`FileText` → both `variationDraft` and `document`** (`registry.ts:81,133`). Impact: "Variation Sections" in the sidebar and "Documents"/"Products"/"Evidence" all render the same page glyph. **Resolution proposed in §C.**

### Verified: same registry icon applied to multiple, unrelated domain concepts (semantic reuse, not a glyph collision, but still a real defect)

Found directly in `src/components/shell/Sidebar.tsx`'s nav-item data (lines 71–143):

3. **`document`** → Documents, Products, Evidence (3 distinct domain concepts, one icon).
4. **`validator`** → Pre-Submission Validator, Controls, Human Review (3 distinct concepts).
5. **`feed`** → Sources, Regulatory Changes (plus reused again for the Agent Console's "Feed Monitor" tab button) — 2–3 distinct concepts.
6. **`layers`** → Impact Assessments, Processes (2 distinct concepts — PARIVART's *core analytical object*, Impact Assessment, currently has no icon of its own).
7. **`audit`** → Audit Trail, Registrations (2 distinct concepts).
8. **`escalation`** → Escalations, Actions (2 distinct concepts, in addition to the glyph collision with `warning` above).

Impact of 3–8: a user scanning the sidebar cannot rely on icon shape to distinguish these nav destinations at all — only the text label does the work, which defeats part of the purpose of having icons in a dense nav list. This is the primary justification for the 17-icon custom taxonomy in §C.

### Verified: unused registry declarations (dead code, not a design defect, but worth cleaning up alongside the redesign)

9. `filter` (`registry.ts:92`), `share` (`:97`), `more` (`:107`), `arrowRight` (`:115`), `chart` (`:134`), `gauge` (`:136`) — confirmed via exhaustive grep, zero usages anywhere in `src/` outside the registry file itself. Not harmful, but should either be wired up or removed when this redesign lands, so the registry doesn't silently carry assets nobody renders.

### Verified: duplicated hand-coded SVG (not an icon, but a related construction inconsistency)

10. **Two nearly-identical circular progress rings**, hand-coded as inline `<svg>` rather than sharing one component: `src/components/regulatory/atoms.tsx:102` (`ConfidenceRing`) and `src/components/screens/ValidationReports.tsx:81` (inline, for a "Readiness score" gauge). Both draw two `<circle>` strokes with a dash-offset animation for a percentage ring. Impact: any future visual tweak to this pattern (stroke width, animation easing) has to be made twice, and already risks drifting apart. Not part of the icon registry, but relevant to "one coherent system" — recommend consolidating into one shared component when the icon family lands.

### Verified: icon-registry bypasses (vendor pattern, not an app-authored defect)

11. **17 files under `src/components/ui/`** (the shadcn/ui primitive layer — `pagination.tsx`, `dialog.tsx`, `sheet.tsx`, `select.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `menubar.tsx`, `command.tsx`, `calendar.tsx`, `accordion.tsx`, `breadcrumb.tsx`, `checkbox.tsx`, `radio-group.tsx`, `navigation-menu.tsx`, `carousel.tsx`, `resizable.tsx`, `input-otp.tsx`) import `lucide-react` glyphs directly and render them inline, never through `<AppIcon>`. This is the unmodified upstream shadcn pattern, not an app-authored inconsistency, and touching it means editing vendored component internals — **out of scope for this icon-replacement effort** unless the brand owner explicitly wants these primitives' chevrons/checks restyled too (they're mostly the same `Check`/`ChevronDown`/`X` glyphs already in the main registry, so visually they already look consistent with it by coincidence).

### Verified: literal characters used as de facto icons instead of `AppIcon`

12. **`src/components/shared/DataTable.tsx:93`** — a literal `✓` character rendered as a "selected" indicator inside the custom `CheckBox` component, bypassing the `success` icon entirely.
13. **Six files use a literal `→` character as a "from → to" text separator**, arguably a navigational-arrow concept that could use `AppIcon name="arrowRight"` (which is currently unused — see item 9): `RegulatoryCalendar.tsx:215`, `ImpactAssessmentDetailScreen.tsx:292`, `AuditTrailScreen.tsx:152,160,331`, `ReviewListScreen.tsx:79,82`. Low-priority cosmetic inconsistency, not a functional defect — these render correctly, they just don't go through the icon system.

### Subjective design opportunities (not defects — flagged separately per the brief's own instruction)

- The two event-type icon lookup dictionaries (`AgentConsole.tsx`'s `ACTIVITY_ICONS`, `ReportDetail.tsx`'s `ICONS`, both mapping `ingestion/agent/system/notification[/user]` to the same glyphs) are near-identical and could be consolidated into one shared export from the icons module — a maintainability improvement, not a visible inconsistency to a user.
- `StatusDot` (`Badge.tsx:63-72`) is a plain colored CSS dot with no text, used only inline alongside other labeled content in this codebase — not a confirmed accessibility defect today, but worth keeping in mind if it's ever reused standalone (flagged in the prior engineering audit's accessibility section too).
- Icon stroke width is uniformly `1.75` via `AppIcon`'s default — no inconsistency found; this is listed here only to confirm it was checked, not assumed.

---

## F. Global construction rules for the replacement family

**Proposed design decisions, grounded in the measurements already in the codebase — not copied from the Drishti brief's dimensions.**

- **Artboard and viewBox:** `24×24`. Lucide (the current library) uses a 24×24 viewBox at `strokeWidth` units matching this app's default of `1.75`; keeping the same artboard means the custom family drops into `<AppIcon>` with zero changes to its sizing math (`width/height: var(--icon-size-{size})`, which just scales the whole viewBox).
- **Live area and padding:** 2px padding on all sides at the 24×24 reference scale (20×20 live area), matching Lucide's own convention — this keeps custom and retained-conventional icons optically the same size when placed side by side in the sidebar.
- **Grid and alignment:** align all custom glyphs to a 2px grid within the live area; center optically, not just bounding-box-center (a shape with more visual weight on one side should be nudged to look centered, per standard icon-design practice).
- **Stroke width:** `1.75px` at the 24×24 reference scale, matching `AppIcon`'s current default exactly — this is a hard constraint, not a suggestion, since every icon in the app (both retained-conventional and new custom) renders through the same `<AppIcon strokeWidth={1.75}>` default.
- **Stroke caps and joins:** round caps, round joins — matches Lucide's own convention (verify visually against a few existing glyphs like `Search`/`Flag` before finalizing; `TO CONFIRM` by rendering a sample side-by-side).
- **Corner-radius language:** where a custom glyph includes a rectangular or card-like element, use a corner radius proportional to the app's own `--radius-sm` (4px at the UI's 1x scale) — e.g., a document shape's corner should feel related to the same rounding language as the panels it sits inside, not a sharp right angle or an exaggerated pill curve.
- **Fill vs. outline:** **outline only, no fills**, matching the registry's own stated rule ("thin, uniform-weight outline set... not filled," `registry.ts:9-10`). A custom icon that requires a filled accent (e.g., a small dot or badge mark) should keep the fill area minimal and secondary to the outline silhouette — never a solid-filled icon body.
- **Colour inheritance:** icons must inherit `currentColor` (or equivalent), exactly as the current Lucide-backed icons do via `AppIcon`'s `className`/`style` props — never a hardcoded fill color baked into the SVG. Semantic coloring (success/warning/error/info, brand accent) is applied by the consuming component via CSS classes, not by the icon asset itself.
- **Minimum gaps between paths:** at least 1.5px of clear space between any two non-touching strokes at the 24×24 reference scale, so the glyph doesn't visually fuse into a blob when rendered at the app's smallest size (12px, `--icon-size-xs`).
- **Maximum visual complexity:** no more than 4–5 distinct path segments per icon (excluding simple duplicated elements like repeated dots). The current library's icons are all simple single-concept outlines — the custom family must match that restraint, not introduce illustrative detail.
- **Small-size legibility:** every custom icon must remain identifiable at 12px (`--icon-size-xs`, the smallest size actually used in the app, per badges/status contexts) — design and review at that size, not just at a large preview size, since Google Flow output will need to survive this exact downscale.
- **Light and dark themes:** icons must work purely via `currentColor` inheritance across both `:root` (light) and `.dark` theme blocks already defined in `src/styles.css` — no theme-specific icon variants should be necessary if the outline-only, inherited-color rule above is followed correctly.
- **Active/hover/disabled/selected states:** these are handled today by the *consuming component* (e.g., `IconButton`'s `ghost`/`subtle`/`inverse` variants and `disabled:opacity-50`), not by the icon asset — the custom family should continue this separation of concerns; no icon should be delivered as multiple state-specific variants.
- **Accessibility/contrast:** icons inherit text color, so contrast is governed by the same tokens as surrounding text (already passing whatever contrast bar the app's color tokens meet) — no additional icon-specific contrast work is needed as long as inheritance is preserved. Icons that are the *sole* carrier of meaning must continue to receive an explicit `aria-label` through `AppIcon`'s existing prop, exactly as today; decorative icons stay `aria-hidden`. This brief does not change that contract.
- **Export format and filename convention:** flat, clean SVG — no embedded raster images, no unnecessary `<g>` wrapper nesting, a single `viewBox="0 0 24 24"`, paths using `stroke="currentColor"` (never a hardcoded hex), `fill="none"` on the root unless a path specifically needs a fill accent per the fill-vs-outline rule above. Filename convention: `icon-{kebab-case-id}.svg` (e.g., `icon-impact-assessment.svg`), matching the Icon ID column in §B/§I exactly so the mapping table stays mechanically correct.

---

## G. Google Flow generation briefs

### Reusable style preamble

Paste this before every individual brief below, every generation session, so results stay consistent across separate sessions:

> **PARIVART icon family — style preamble.** Generate a single pictogram icon for an enterprise regulatory-compliance software product. Flat, line-based, outline-only construction — no fills except where explicitly noted, no gradients, no shadows, no 3D shading, no photorealism, no color (the icon must work as a single-color silhouette that inherits its color from surrounding text). 24×24 artboard, 2px padding on all sides (20×20 live area), 1.75px stroke weight, round line caps and round line joins, paths aligned to a 2px grid. Maximum 4–5 distinct path segments — this is a restrained, minimal enterprise-software pictogram, not an illustration. The icon must remain legible when scaled down to 12px, so avoid fine detail, thin internal gaps under 1.5px, or more than one small secondary element. Export as clean SVG: single `viewBox="0 0 24 24"`, `fill="none"` on the root, strokes using `currentColor`, no embedded raster images, no unnecessary group nesting. Do not use real-world logos, brand marks, flags, religious symbols, or any photorealistic reference. Do not add a background shape, frame, or container around the glyph unless specified in the individual brief.

### Individual briefs

Each brief below gives only what's unique to that icon — stroke/fill/size/format rules are the preamble above, applied identically to all 19.

---

**1. `regulatory-authority`** — Regulatory Authority
- *Context:* the issuing body of a regulation (e.g., a national health/medical-device authority); appears in sidebar nav and authority records.
- *Meaning:* "an official institution," not a generic company or shield.
- *Visual metaphor:* a classical institutional façade — a simple pediment/column motif, suggesting "government or regulatory body" without any specific national symbol.
- *Silhouette and composition:* a triangular pediment line over 2–3 short vertical column strokes resting on a single horizontal base line. Fully enclosed, roughly square proportions within the live area.
- *Shape/geometry:* straight lines only, no curves except the overall rounded stroke caps.
- *Relationship to other icons:* must not use a shield shape (reserved for `control` and `risk-indicator`) or a generic building/office silhouette.
- *Avoid:* real flags, national emblems, a generic "bank" or "courthouse" cliché beyond the simple column motif, any text or lettering.
- *Output:* SVG, `icon-regulatory-authority.svg`.

---

**2. `regulatory-source`** — Regulatory Source
- *Context:* an ingestion feed/channel documents are pulled from (an authority's website, an RSS feed, an API); sidebar nav ("Sources"), source records.
- *Meaning:* "things flow in from an external channel into the system."
- *Visual metaphor:* a funnel or an antenna/signal motif receiving something.
- *Silhouette and composition:* a simple funnel shape (two converging diagonal lines meeting a short vertical spout) with one small dot or short arc above it suggesting an incoming signal.
- *Shape/geometry:* mostly straight diagonal lines, one small arc permitted for the "signal" element.
- *Relationship to other icons:* must look distinct from `regulatory-change` (item 5) — this icon is about intake/channel, not about a document's content changing.
- *Avoid:* a literal antenna/radio-tower illustration, a Wi-Fi symbol (too generic/consumer-tech), satellite dishes.
- *Output:* SVG, `icon-regulatory-source.svg`.

---

**3. `regulatory-document`** — Regulatory Document
- *Context:* a single ingested regulatory document; sidebar nav ("Documents"), document list/detail, upload screen.
- *Meaning:* "an official regulatory text," specifically — not any generic file.
- *Visual metaphor:* a page with a folded top-right corner (the baseline "document" cue) plus 2–3 short horizontal lines suggesting dense official text (not a blank page).
- *Silhouette and composition:* rectangular page outline, folded corner, 2 short horizontal rule lines in the lower half.
- *Relationship to other icons:* must be visually distinguishable from `evidence` (item 17) and `portfolio-product` (item 7), which currently incorrectly share this exact glyph — this version keeps the text-rule-line detail; evidence and product must NOT reuse it.
- *Avoid:* a blank/empty page (too generic), a document with a magnifying glass (reserved conceptually for `impact-delta-report`).
- *Output:* SVG, `icon-regulatory-document.svg`.

---

**4. `document-processing`** — Document Processing
- *Context:* the pipeline state of a document being parsed/analyzed; optional status-badge icon pairing on the document detail/list screens.
- *Meaning:* "the system is actively transforming this document" — distinct from a static record and distinct from the generic `settings` gear.
- *Visual metaphor:* a page outline (simplified, no fold/rule-lines, to stay distinct from `regulatory-document`) with a small circular arrow or pulse mark overlapping one corner, suggesting active transformation.
- *Silhouette and composition:* simplified rectangular page, one small partial-circle arrow motif overlapping the bottom-right corner.
- *Relationship to other icons:* the partial-circle motif must look different from the `refresh`/`RefreshCw` interface icon's full circular arrow — keep this one partial/smaller so it reads as "status," not "click to reload."
- *Avoid:* a full refresh/sync icon (would be confused with the interface `refresh` action), a progress bar or percentage mark (the backend doesn't expose a percentage — don't imply one visually).
- *Output:* SVG, `icon-document-processing.svg`.

---

**5. `regulatory-change`** — Regulatory Change
- *Context:* an extracted change from a document — the atomic unit of regulatory intelligence; sidebar nav ("Regulatory Changes"), change list/detail.
- *Meaning:* "something in a regulation changed" — the bridge between a source document and its downstream obligations.
- *Visual metaphor:* a page outline with a single branching/forking line breaking out of its edge, suggesting a change point emerging from a document.
- *Silhouette and composition:* simplified rectangular page (no fold, no rule-lines — distinct from `regulatory-document`), one diagonal line breaking outward from the top-right edge, ending in a short perpendicular tick (like a small delta/branch mark).
- *Relationship to other icons:* must sit visually "between" `regulatory-document` (plain, enclosed) and `impact-delta-report` (the eventual output) — this one is the only domain icon with a line breaking the page's own boundary.
- *Avoid:* a literal delta (Δ) glyph (too mathematical/foreign to the rest of the family), scissors/cut imagery.
- *Output:* SVG, `icon-regulatory-change.svg`.

---

**6. `obligation`** — Obligation
- *Context:* a specific compliance requirement derived from a change; sidebar nav ("Obligations"), obligation list, change-detail panel.
- *Meaning:* "a requirement that must be satisfied" — distinct from the generic interface `flag` (which stays separate for "flag this row" actions).
- *Visual metaphor:* a single pennant/banner shape with one short checkmark-like tick inside it, suggesting "a marked requirement," not an alert.
- *Silhouette and composition:* a simple right-pointing pennant/triangle flag on a short vertical pole, with one small diagonal tick inside the flag's body.
- *Relationship to other icons:* must look different from the plain interface `flag` (no pole, or different proportions) and from `audit-trail`'s multi-line list motif (item 18) — obligation is singular/pointed, audit is a sequence.
- *Avoid:* multiple stacked flags, a checklist with multiple boxes (that's closer to `control`/`audit-trail`'s territory), alarm/siren imagery.
- *Output:* SVG, `icon-obligation.svg`.

---

**7. `portfolio-product`** — Portfolio Product
- *Context:* a company product/device tracked in the portfolio; sidebar nav ("Products"), product list/detail.
- *Meaning:* "a physical/manufactured thing the company makes" — must NOT read as "paperwork," unlike the glyph it currently shares with documents.
- *Visual metaphor:* a simple labeled box/package outline — a rectangle with one horizontal band near the top (a label strap), not a page.
- *Silhouette and composition:* a rectangle (slightly wider than tall, suggesting a package, not a page) with one horizontal line near the top third representing a label band.
- *Relationship to other icons:* must look nothing like `regulatory-document`/`evidence` — no folded corner, no page proportions (taller than wide).
- *Avoid:* a literal pill/capsule or medical-device illustration (too specific — PARIVART serves more than medical devices), a shopping-box/retail cliché.
- *Output:* SVG, `icon-portfolio-product.svg`.

---

**8. `portfolio-market`** — Portfolio Market
- *Context:* a geographic market the company operates in; sidebar nav ("Markets", "Market Heatmap"), portfolio/heatmap screens.
- *Meaning:* "a geographic/regional market," not a literal map.
- *Visual metaphor:* a simplified map-pin or a single rounded region outline with one small dot/pin marker — abstract, not tied to any real country's shape.
- *Silhouette and composition:* one rounded, irregular blob/region outline (abstract, not resembling a real continent) with a small filled dot near its center as the only permitted fill accent.
- *Relationship to other icons:* keep this abstract enough that it never reads as a specific real country or disputed territory.
- *Avoid:* any recognizable real-world country/region outline, a globe-with-grid-lines (too generic/corporate-stock-icon), literal pin-drop map-app icon (overused convention — make it flatter/simpler than that).
- *Output:* SVG, `icon-portfolio-market.svg`.

---

**9. `portfolio-process`** — Portfolio Process
- *Context:* an internal business process tracked in the portfolio; sidebar nav ("Processes"), process list/detail.
- *Meaning:* "a sequence of steps," distinct from `impact-assessment`'s "things intersecting" concept, which it currently incorrectly shares a glyph with.
- *Visual metaphor:* two or three small connected nodes in a simple line (a minimal flowchart fragment).
- *Silhouette and composition:* 2–3 small circles connected by straight line segments in a simple left-to-right sequence.
- *Relationship to other icons:* must not look like stacked/overlapping shapes (that's `impact-assessment`'s territory) — this one is explicitly sequential/linear.
- *Avoid:* a full flowchart with branches/decision diamonds (too complex for this scale), gears (reserved conceptually for `settings`/system concepts).
- *Output:* SVG, `icon-portfolio-process.svg`.

---

**10. `control`** — Compliance Control
- *Context:* a compliance control record; sidebar nav ("Controls"), controls list/detail.
- *Meaning:* "a structural check that must pass" — static/structural, distinct from `human-review`'s person-driven decision concept, which it currently shares a shield glyph with.
- *Visual metaphor:* a shield outline with a single checkmark inside — but the shield must be visually distinct from `risk-indicator`'s shield (item 14): give control's shield a flatter, more geometric top edge, and risk's a more angular/pointed top, so the two are never confused even though both use shield language.
- *Silhouette and composition:* a flat-topped shield outline with one centered checkmark tick.
- *Relationship to other icons:* the only icon permitted a checkmark-in-shield combination — `human-review` must use a person motif instead, not a shield.
- *Avoid:* a padlock (too security/IT-specific, wrong domain), a shield with a cross (medical/religious connotation, inappropriate for a generic compliance concept).
- *Output:* SVG, `icon-control.svg`.

---

**11. `registration`** — Regulatory Registration
- *Context:* a product's regulatory registration/filing record; sidebar nav ("Registrations"), registrations list.
- *Meaning:* "an official filed/certified record," distinct from `audit-trail`'s chronological-log concept, which it currently shares a glyph with.
- *Visual metaphor:* a document outline with a circular stamp/seal mark overlapping its bottom-right corner.
- *Silhouette and composition:* simplified page outline (no fold, no rule-lines — distinct from `regulatory-document`) with one small circle (the seal) overlapping the corner, containing one short tick or line (not a full design) to suggest a stamp without over-detailing.
- *Relationship to other icons:* the only icon with a circular "seal" accent — `regulatory-document` and `evidence` must not use this motif.
- *Avoid:* a literal wax-seal illustration (too ornate/historical for this flat system), a badge/medal ribbon (reads as "achievement," wrong meaning).
- *Output:* SVG, `icon-registration.svg`.

---

**12. `impact-assessment`** — Impact Assessment
- *Context:* PARIVART's core analytical record, linking a regulatory change to portfolio entities; sidebar nav ("Impact Assessments"), impact list/detail, impact-analysis screen. **This must be the single most distinctive icon in the family** — it is the product's primary analytical concept.
- *Meaning:* "where a regulatory change intersects the company's portfolio."
- *Visual metaphor:* two overlapping shapes (e.g., two rounded squares or circles) with their overlap region as the only filled accent in the icon — literally depicting "an intersection."
- *Silhouette and composition:* two same-size rounded shapes offset so they overlap by roughly a third of their area; the overlapping lens-shaped region is the one permitted small fill accent in this icon (everything else stays outline-only).
- *Relationship to other icons:* the ONLY icon in the family permitted this two-shapes-overlapping composition and the only one with an intentional fill accent beyond a single dot — this exclusivity is deliberate, reinforcing that Impact Assessment is the product's central concept.
- *Avoid:* a generic Venn-diagram cliché with three circles (keep it to exactly two shapes), a magnifying glass (reserved for `impact-delta-report`), a chart/graph motif (reserved conceptually for dashboard metrics, not this icon).
- *Output:* SVG, `icon-impact-assessment.svg`.

---

**13. `impact-delta-report`** — Impact Delta Report
- *Context:* the exported deliverable summarizing an impact assessment; sidebar nav (×2: "Impact Delta Reports", "Impact Reports"), report list/detail/generate.
- *Meaning:* "a document that explains what changed and what to do about it" — the product's signature output.
- *Visual metaphor:* a document outline (plain, no fold/rule-lines) with a small magnifying-glass motif overlapping its bottom-right corner, continuing the existing (sound) "document + inspection" concept from the current `FileSearch` glyph, rebuilt in this family's construction style.
- *Silhouette and composition:* simplified page outline, one small circle with a short diagonal handle line (magnifying glass) overlapping the corner.
- *Relationship to other icons:* the magnifying-glass accent is reserved exclusively for this icon — `regulatory-document`/`evidence`/`registration` must not reuse it (they use fold-lines, plain, and seal accents respectively).
- *Avoid:* a bar-chart or graph inside the page (too close to generic "report" stock-icon cliché and to dashboard iconography), a download arrow (that's the separate, retained-conventional `download` interface icon).
- *Output:* SVG, `icon-impact-delta-report.svg`.

---

**14. `risk-indicator`** — Risk Indicator
- *Context:* a risk-level callout inside impact-assessment rationale and risk badges.
- *Meaning:* "elevated risk requiring attention" — a badge/callout concept, not a nav destination.
- *Visual metaphor:* a shield outline (angular/pointed top, to stay visually distinct from `control`'s flat-topped shield) with a short vertical exclamation tick and a small dot beneath it, inside.
- *Silhouette and composition:* pointed-top shield outline, one vertical line + one small dot centered inside (a minimal exclamation mark).
- *Relationship to other icons:* the only icon permitted an exclamation-mark-in-shield combination; must read as clearly distinct from `control`'s checkmark-in-shield at the same small size — this is the pairing most likely to be confused, so the top-edge shape difference (flat vs. pointed) is load-bearing, not decorative.
- *Avoid:* a full exclamation-triangle (too close to the retained-conventional `warning`/`escalation` glyphs), a skull-and-crossbones or any literal hazard symbol (too alarming for a routine compliance-risk rating).
- *Output:* SVG, `icon-risk-indicator.svg`.

---

**15. `human-review`** — Human Review
- *Context:* a review decision record; sidebar nav ("Human Review"), reviews list, record-decision dialog.
- *Meaning:* "a person made a decision" — explicitly human/judgment-based, distinct from `control`'s automated/structural check, which it currently shares a shield glyph with.
- *Visual metaphor:* a simple person silhouette (head + shoulders arc) with a small checkmark tick beside it.
- *Silhouette and composition:* a circle (head) above a single rounded arc (shoulders), with a small separate checkmark tick positioned to the upper-right of the figure.
- *Relationship to other icons:* the only icon using a person silhouette besides the generic interface `user`/`assign` icons — keep this one's checkmark accent to visually differentiate it from plain `user` (which has no accent) and from `assign`'s `UserPlus` plus-sign accent.
- *Avoid:* a full body figure (keep it head-and-shoulders only, consistent with how compact the rest of the family is), a gavel/scales-of-justice (too literally "legal," overreaching PARIVART's actual review workflow).
- *Output:* SVG, `icon-human-review.svg`.

---

**16. `action`** — Remediation Action
- *Context:* a remediation task raised from a review or impact assessment; sidebar nav ("Actions"), actions list/detail, raise-action dialog. **High priority to resolve** — currently shares the alarm-triangle glyph with `escalation`, which is the collision most likely to cause real confusion since actions are routine, not urgent.
- *Meaning:* "a task to complete" — routine and procedural, explicitly NOT an alarm state.
- *Visual metaphor:* a checkbox (empty square) with a short arrow pointing into it from the left, suggesting "incoming task to check off."
- *Silhouette and composition:* a small rounded-square outline (the checkbox) with a short horizontal arrow (line + small arrowhead) approaching its left edge.
- *Relationship to other icons:* must share NO visual language with `escalation` (item 19) — no triangle, no exclamation mark, nothing suggesting urgency.
- *Avoid:* any triangle shape, any exclamation mark, a literal to-do-list-with-multiple-items (keep it to one single checkbox, not a list — that would compete with `control`/`audit-trail`).
- *Output:* SVG, `icon-action.svg`.

---

**17. `evidence`** — Evidence
- *Context:* supporting evidence attached to an action or review; sidebar nav ("Evidence"), evidence list/detail, attach-evidence dialog.
- *Meaning:* "proof attached to a record" — distinct from `regulatory-document` (an external source) and `portfolio-product` (an internal asset), both of which it currently incorrectly shares a glyph with.
- *Visual metaphor:* a document outline (plain, no fold/rule-lines) with a small paperclip shape overlapping its top-left corner.
- *Silhouette and composition:* simplified page outline, one small paperclip loop (a simple rounded rectangle bent into a clip shape) overlapping the top edge.
- *Relationship to other icons:* the paperclip accent is reserved exclusively for this icon.
- *Avoid:* a staple (too similar to a paperclip in silhouette at small size — pick one, use the paperclip), a camera/photo icon (evidence isn't always a photo — keep it document-based and medium-agnostic).
- *Output:* SVG, `icon-evidence.svg`.

---

**18. `audit-trail`** — Audit Trail
- *Context:* the chronological event log; sidebar nav ("Audit Trail"), audit trail screen.
- *Meaning:* "a sequential record of events over time," distinct from `registration`'s single-stamped-record concept, which it currently shares a glyph with.
- *Visual metaphor:* a short vertical timeline — a single vertical line with 3 small perpendicular ticks/dots at intervals along it, like a simplified timeline or ledger spine.
- *Silhouette and composition:* one vertical line with three short horizontal ticks branching off it at even intervals (top, middle, bottom).
- *Relationship to other icons:* the only icon using a vertical-timeline composition — must not resemble `control`'s checklist-in-shield or `obligation`'s single pennant-tick.
- *Avoid:* a literal clock face (too close to the retained-conventional `clock` interface icon), a full horizontal list-with-checkboxes (too close to `control`'s territory).
- *Output:* SVG, `icon-audit-trail.svg`.

---

**19. `escalation`** — Escalation
- *Context:* an SLA/urgency alert in the dedicated escalations workflow; sidebar nav ("Escalations"), dashboard alert row, escalations screen. **High priority to resolve** — currently shares its exact glyph with the generic `warning` feedback icon, which this brief must visibly distinguish.
- *Meaning:* "a tracked, named urgency record" — more severe and more specific than a generic transient warning toast.
- *Visual metaphor:* a triangle (acknowledging the urgency convention users already expect) but with a small clock/flare tick replacing the plain exclamation mark that `warning` already uses, so the two are never pixel-for-pixel identical.
- *Silhouette and composition:* an outlined triangle (flatter/more rounded corners than a sharp hazard-sign triangle, to visually soften it relative to `warning`) with a short curved tick (like a small flare or partial clock-hand) inside instead of a straight exclamation line.
- *Relationship to other icons:* must NOT be pixel-identical to the retained-conventional `warning` (`AlertTriangle`) — the internal mark is the required point of difference; must also not resemble `action`'s checkbox-and-arrow motif.
- *Avoid:* an exact exclamation-triangle (that's `warning`'s glyph — reusing it recreates the exact defect this brief exists to fix), a siren/bell (too close to the retained `notification` bell icon).
- *Output:* SVG, `icon-escalation.svg`.

---

## H. Batch generation plan

Organized so each batch is generated and reviewed as a visually coherent set before moving to the next — later batches can reference earlier ones' finished style once real output exists.

### Batch 1 — Primary domain concepts (generate first; these set the family's visual tone)
- [ ] `regulatory-authority` — generated / reviewed / exported / integrated
- [ ] `regulatory-document` — generated / reviewed / exported / integrated
- [ ] `regulatory-change` — generated / reviewed / exported / integrated
- [ ] `impact-assessment` — generated / reviewed / exported / integrated *(the flagship icon — review this one most carefully before proceeding)*

### Batch 2 — Regulatory intelligence and document lifecycle
- [ ] `regulatory-source` — generated / reviewed / exported / integrated
- [ ] `document-processing` — generated / reviewed / exported / integrated
- [ ] `obligation` — generated / reviewed / exported / integrated

### Batch 3 — Portfolio and impact assessment
- [ ] `portfolio-product` — generated / reviewed / exported / integrated
- [ ] `portfolio-market` — generated / reviewed / exported / integrated
- [ ] `portfolio-process` — generated / reviewed / exported / integrated
- [ ] `impact-delta-report` — generated / reviewed / exported / integrated
- [ ] `risk-indicator` — generated / reviewed / exported / integrated

### Batch 4 — Governance, review, evidence, audit
- [ ] `control` — generated / reviewed / exported / integrated
- [ ] `registration` — generated / reviewed / exported / integrated
- [ ] `human-review` — generated / reviewed / exported / integrated
- [ ] `action` — generated / reviewed / exported / integrated
- [ ] `evidence` — generated / reviewed / exported / integrated
- [ ] `audit-trail` — generated / reviewed / exported / integrated

### Batch 5 — Alerting (the two collision-resolution icons; generate last so they can be directly compared against the finished `warning`/action-adjacent icons already in the app)
- [ ] `escalation` — generated / reviewed / exported / integrated

**Note:** `action` is listed in Batch 4 rather than Batch 5 since it is a governance workflow object; it is cross-referenced here because its "must not resemble `escalation`" constraint (§G, brief 16/19) should be checked against Batch 5's output once both exist.

---

## I. Asset naming and integration mapping

The integration point is the existing registry — no second icon framework is proposed. `src/components/icons/registry.ts` currently maps a semantic `IconName` to a lucide component; the same pattern extends naturally to custom SVGs by importing them as React components (via the project's existing SVG-as-component tooling, `TO CONFIRM` exact Vite SVG plugin/loader in use — not verified in this audit) and adding them to the same `icons` object, so every existing `<AppIcon name="...">` / `<IconButton icon="...">` call site needs **zero changes** — only the registry's import list and the nav-data/lookup-table string values change.

| Icon ID | Output filename | Current source/component | Planned integration location | Status |
|---|---|---|---|---|
| `regulatory-authority` | `icon-regulatory-authority.svg` | `registry.ts:123` (`organisation` → `Building2`) | `registry.ts` entry; `Sidebar.tsx:119` nav data | Not generated |
| `regulatory-source` | `icon-regulatory-source.svg` | `registry.ts:77` (`feed` → `Radio`, partial) | New `registry.ts` entry; `Sidebar.tsx:120` nav data | Not generated |
| `regulatory-document` | `icon-regulatory-document.svg` | `registry.ts:133` (`document` → `FileText`, partial) | `registry.ts` entry; `Sidebar.tsx:121` nav data; `HAQDrafts.tsx:274`, `VariationDrafts.tsx:184` | Not generated |
| `document-processing` | `icon-document-processing.svg` | *(no current icon — status is text-only badge)* | New `registry.ts` entry; optional addition to `DocumentDetailScreen.tsx`/`DocumentsScreen.tsx` status badges | Not generated |
| `regulatory-change` | `icon-regulatory-change.svg` | `registry.ts:77` (`feed` → `Radio`, partial) | New `registry.ts` entry; `Sidebar.tsx:122` nav data | Not generated |
| `obligation` | `icon-obligation.svg` | `registry.ts:102` (`flag` → `Flag`, partial — interface `flag` stays separate) | New `registry.ts` entry; `Sidebar.tsx:123` nav data | Not generated |
| `portfolio-product` | `icon-portfolio-product.svg` | `registry.ts:133` (`document` → `FileText`, partial) | New `registry.ts` entry; `Sidebar.tsx:126` nav data | Not generated |
| `portfolio-market` | `icon-portfolio-market.svg` | `registry.ts:85` (`map` → `Map`) | `registry.ts` entry; `Sidebar.tsx:111,127` nav data | Not generated |
| `portfolio-process` | `icon-portfolio-process.svg` | `registry.ts:137` (`layers` → `Layers`, partial) | New `registry.ts` entry; `Sidebar.tsx:128` nav data | Not generated |
| `control` | `icon-control.svg` | `registry.ts:82` (`validator` → `ShieldCheck`, partial) | New `registry.ts` entry; `Sidebar.tsx:129` nav data | Not generated |
| `registration` | `icon-registration.svg` | `registry.ts:87` (`audit` → `ListChecks`, partial) | New `registry.ts` entry; `Sidebar.tsx:130` nav data | Not generated |
| `impact-assessment` | `icon-impact-assessment.svg` | `registry.ts:137` (`layers` → `Layers`, partial) | New `registry.ts` entry; `Sidebar.tsx:124` nav data | Not generated |
| `impact-delta-report` | `icon-impact-delta-report.svg` | `registry.ts:78` (`deltaReport` → `FileSearch`) | `registry.ts` entry; `Sidebar.tsx:80,125` nav data; `AgentConsole.tsx:160` | Not generated |
| `risk-indicator` | `icon-risk-indicator.svg` | `registry.ts:138` (`risk` → `ShieldAlert`) | `registry.ts` entry; `Atoms.tsx:12`; `States.tsx` (`risk` variant) | Not generated |
| `human-review` | `icon-human-review.svg` | `registry.ts:82` (`validator` → `ShieldCheck`, partial) | New `registry.ts` entry; `Sidebar.tsx:131` nav data | Not generated |
| `action` | `icon-action.svg` | `registry.ts:88` (`escalation` → `AlertTriangle`, partial) | New `registry.ts` entry; `Sidebar.tsx:132` nav data | Not generated |
| `evidence` | `icon-evidence.svg` | `registry.ts:133` (`document` → `FileText`, partial) | New `registry.ts` entry; `Sidebar.tsx:133` nav data | Not generated |
| `audit-trail` | `icon-audit-trail.svg` | `registry.ts:87` (`audit` → `ListChecks`, partial) | `registry.ts` entry (rename/replace `audit`); `Sidebar.tsx:134` nav data; `SourcesScreen.tsx:120` | Not generated |
| `escalation` | `icon-escalation.svg` | `registry.ts:88` (`escalation` → `AlertTriangle`) | `registry.ts` entry; `Sidebar.tsx:143` nav data; `Dashboard.tsx` attention-array | Not generated |

**SVG requirements for integration** (restating §F for this table's "Status" column to be actionable): clean paths, no embedded raster imagery, `viewBox="0 0 24 24"`, stroke using `currentColor` so the existing `className`/`style` colour-inheritance in `AppIcon.tsx` continues to work unmodified.

---

## J. Acceptance checklist

### Per-icon checklist (apply to each of the 19 custom icons before marking "integrated" in §H/§I)

- [ ] Semantically accurate to the concept described in its §G brief
- [ ] Distinct silhouette from every other icon in the family (cross-check against the "relationship to other icons" note in its own brief)
- [ ] Consistent visual weight (stroke width, path count) with the rest of the family
- [ ] Legible at 12px (`--icon-size-xs`) — test by rendering at that exact size, not just eyeballing a larger preview
- [ ] Renders correctly in both light (`:root`) and dark (`.dark`) themes via `currentColor` inheritance — no hardcoded color baked into the SVG
- [ ] Meets the app's existing contrast expectations by inheriting text/icon color tokens (no icon-specific contrast testing needed if inheritance is correct)
- [ ] Correct stroke/fill treatment per §F (outline-only, with the one explicitly-permitted fill accent only on `impact-assessment`'s overlap region and `portfolio-market`'s center dot)
- [ ] Not an accidental duplicate of another icon in the family or of a retained-conventional interface icon
- [ ] Not confusingly similar to another custom icon at 12–16px (the sizes actually used in sidebar/table contexts)
- [ ] Filename matches the convention in §F/§I exactly (`icon-{kebab-id}.svg`)
- [ ] Renders correctly inside the actual app component once integrated (`AppIcon` at each of its real call sites — sidebar nav, badge, panel, etc., per §I's "Planned integration location" column)

### Whole-family checklist (apply once all 19 are generated, before any integration)

- [ ] All 19 icons reviewed together on one sheet (not integrated one at a time) — see "icon-sheet review process" below
- [ ] No two icons are confusable at the smallest rendered size used anywhere in the app (12px)
- [ ] Visual weight is consistent across the full set (no icon looks noticeably "heavier" or "lighter" than its neighbors)
- [ ] The two collision-resolution pairs (`action` vs. `escalation`; `control` vs. `risk-indicator` vs. `human-review`) are each genuinely distinguishable side by side at small size — this is the whole point of the redesign and must be explicitly re-verified, not assumed from the brief text alone
- [ ] The family reads as one coherent design system, not 19 unrelated illustrations

### Icon-sheet review process

Before integrating any icon into the app, export all 19 as a single contact sheet (a grid, each icon labeled with its Icon ID, rendered at both 24px and 12px side by side) and review the whole set together. This catches cross-icon inconsistencies (stroke weight drift, silhouette collisions) that reviewing icons one at a time, as they're generated, will miss. Only after the full-sheet review passes should individual SVGs be handed to the integration pass described in §I.

---

## K. Final verified inventory summary

| Count | Value | Verification status |
|---|---|---|
| Unique icon names declared in the registry | 45 | VERIFIED — `src/components/icons/registry.ts` read in full |
| Unique icon names confirmed rendered somewhere in `src/` | 39 | VERIFIED — grepped every literal `name="X"`/`icon="X"` plus every dynamic lookup table |
| Declared but unused registry entries | 6 (`filter`, `share`, `more`, `arrowRight`, `chart`, `gauge`) | VERIFIED |
| Distinct lucide-react glyphs backing the registry | 43 *(45 names minus the 2 exact-glyph collisions: `AlertTriangle` and `FileText` each back 2 names)* | VERIFIED |
| Custom SVGs currently in the app (brand marks, not icons) | 3 (`parivart-logo-light.svg`, `parivart-logo-dark.svg`, `public/favicon.svg`) | VERIFIED |
| Inline hand-coded SVGs outside the icon system | 2 (`atoms.tsx`'s `ConfidenceRing`, `ValidationReports.tsx`'s readiness-score ring — duplicated, should be unified) | VERIFIED |
| Emoji or non-standard character substitutes rendered as icons | 7 (1 literal `✓` in `DataTable.tsx`; 6 files using a literal `→` as a separator) | VERIFIED |
| Repeated concepts rendered with inconsistent/reused glyphs | 8 distinct findings (2 exact glyph collisions + 6 semantic-reuse cases across unrelated domain concepts) | VERIFIED — see §E |
| Proposed custom replacement icons | 19 | PROPOSED (design decision, not yet generated) |
| Conventional interface icons proposed to remain unchanged | 26 of the 45 registry entries (everything in §D's table marked "Retain conventional," including the 6 unused ones) | PROPOSED |
| Google Flow-generated assets actually produced so far | **0** | VERIFIED — none exist in this repository; nothing in this document should be read as claiming otherwise |

**Not conclusively verified / `TO CONFIRM`:**
- Whether the repository's Vite config already has an SVG-as-React-component loader (needed for §I's integration approach) — not checked in this audit.
- Any formal brand-guideline document beyond the CSS tokens cited in §A.
- Exact round-trip visual fidelity of Google Flow output against this brief's construction rules — cannot be verified until real generated assets exist.

---

*End of brief. No icon replacement has been implemented in this session — this document is the specification for work that begins once Google Flow output exists. See the session's final report for commands run and commits created.*
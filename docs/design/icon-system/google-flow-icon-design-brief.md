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
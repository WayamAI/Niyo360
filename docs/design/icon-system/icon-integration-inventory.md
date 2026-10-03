# Icon Integration Inventory — Session Findings

**Status (2026-10-03 follow-up session): one icon wired in as an explicit opaque placeholder.** 18 new PNGs appeared in `Icons/` since the original findings below were written — re-verified with `scripts/verify-png-alpha.mjs` and found to have the identical defect as the original JPEGs: 8-bit RGB (colour type 2), no alpha channel at all; the checkerboard is still baked into opaque pixels, just re-encoded as PNG rather than JPEG. This does not unblock option 2 in "What would unblock this" below.

Per explicit product-owner instruction ("whatever is there, put that in the icon placeholder"), `Icons/Sculptural_3D_regulatory_icon_2K_20261003142854.png` (row 1 of the table below) was copied to `src/assets/icons/custom/icon-regulatory-authority.png` and wired into `customIcons`/the Sidebar "Authorities" nav item as-is, opaque background and all. This is a deliberate, documented exception to this document's own findings, not a silent reversal of them — the next real fix is still a genuine alpha re-export of this same asset.

**Original status: BLOCKED at the asset level. Zero icons integrated this session.** This is not a partial-progress report hiding behind caveats — it's the accurate outcome of inspecting every supplied asset against the actual rendering requirements of `src/components/icons/AppIcon.tsx`. The reason is explained in full below, with the exact technical defect, before any mapping or integration work.

## Critical finding: every asset has a blocking technical defect

All 19 files in `Icons/` were inspected both visually (`Read` on each image) and at the format level (`file` command). Every one is:

- **A JPEG (`.jpg`), not an SVG.** The entire `google-flow-icon-design-brief.md` specification (§F) called for flat, outline-only, 24×24 SVG with `currentColor` stroke inheritance — these are 2048×2048 raster photographs of glossy 3D renders.
- **JFIF/JPEG with `components 3` (RGB only) — confirmed via `file`, not assumed.** JPEG has no alpha channel in any variant; it cannot represent transparency. The checkerboard pattern visible behind every icon is **not real transparency** — it is a flat gray/white checkerboard pattern rendered into the opaque pixel data itself, almost certainly a visual "this area is transparent" indicator left over from whatever tool exported these from Google Flow, never actually converted to a real alpha channel.
- **Consequence if integrated as-is:** every icon would render in the live app as a square photograph with a visible gray-and-white checkerboard background — not an icon sitting cleanly in the sidebar/button/badge, but a small gray patch. This is a direct, visible regression against "preserve existing functionality... visual design" — the most important constraint in this task's own instructions — so no asset was wired into any component.
- **One file additionally has NO checkerboard at all** — `Sculptural_3D_document_product_icon_2K_20261003142914.jpg` has a flat solid gray background baked in, not even the checkerboard convention the other 18 use. Confirmed by direct visual inspection.
- **Fixed, non-inheriting color.** Every render is baked-in orange (`#E8792E`-ish)/gray, with realistic lighting, highlights, and drop shadows. `AppIcon` requires `currentColor` stroke inheritance so one icon asset works across light theme, dark theme, hover, disabled, and semantic-color (success/warning/error) contexts without a second asset. These renders are single fixed-palette photographs — they cannot invert for dark mode, cannot pick up `text-warning-icon` or any other semantic color class, and would look identical (and likely wrong) against light and dark panel backgrounds alike.
- **Photographic 3D detail, not a flat pictogram.** The construction rules in the design brief (§F) specify "no gradients, no shadows, no 3D shading... maximum 4-5 distinct path segments" specifically so icons stay legible at the app's actual minimum render size, 12px (`--icon-size-xs`). These renders have fine specular highlights, bevels, and multi-part geometry that would become an unrecognizable smear at 12-18px (the sizes actually used in the sidebar/badges per `AppIcon.tsx`'s documented defaults).

None of this is a stylistic objection — every point above is a concrete reason the asset cannot render correctly in the application as it exists today. Per this session's own instructions ("do not claim every asset has been integrated until every discovered asset has a recorded disposition," "if an asset's intended use is unclear... mark that asset as blocked... rather than guessing," and the explicit prohibition on regressing existing visual design), the correct action is to stop here, document precisely what's wrong, and recommend the fix — not to force a visibly broken integration to satisfy a commit quota.

## What would unblock this

Any ONE of the following, from whoever controls the Google Flow generation:

1. **Re-export as SVG** per the original brief (§F/§G) — the ready-to-paste briefs in `google-flow-icon-design-brief.md` are still valid and unused; Google Flow (or a vector-trace pass on the renders below) could target them directly.
2. **Re-export as PNG with a real alpha channel** (not JPEG, not a baked-in checkerboard) at a size that downscales cleanly to 12–28px, if a raster integration path is preferred over SVG. This still leaves the fixed-color/no-theme-inheritance problem unsolved — raster assets would need a separate dark-mode variant per icon, which is a real scope increase the original brief didn't ask for.
3. **Explicit instruction to proceed anyway** despite the checkerboard — e.g., if there's a way to reliably strip the checkerboard pattern programmatically that I'm not aware of having tried, or if a lower bar (accepting a solid colored chip background instead of true transparency) is acceptable for now. I did not attempt an automated background-removal pass — no `ImageMagick`/`PIL` is installed in this environment, installing one to attempt a fringe-prone chroma-key hack against anti-aliased 3D-render edges is likely to produce a worse result than no fix, and this falls outside "ordinary implementation decisions" this session was told it could make autonomously.

## Asset inventory — visual content, not filename-only

Every asset was opened and visually inspected (not inferred from filename) against the 19-icon taxonomy in `google-flow-icon-design-brief.md` §C. "Best-fit concept" is my read of the actual artwork; several are genuinely ambiguous and are marked as such rather than forced into a guess.

| # | Asset | Visual content (as inspected) | Best-fit concept | Confidence | Disposition |
|---|---|---|---|---|---|
| 1 | `Sculptural_3D_regulatory_icon_2K_20261003142854.jpg` | Orange/gray pedimented building with 4 columns and steps | `regulatory-authority` | High | Blocked (format) |
| 2 | `Sculptural_3D_document_product_icon_2K_20261003142914.jpg` | Orange page, folded top-right corner, gray text rule-lines | `regulatory-document` | High | Blocked (format + **solid gray background, not even checkerboard**) |
| 3 | `Document_transforming_through_3D…_2K_20261003142926.jpg` | A press/printer device with white "input" paper feeding in, orange "output" paper feeding out, both covered in diagram-like marks | `document-processing` | High (matches filename and brief concept) | Blocked (format; also far more detailed/multi-part than the brief's 4-5-segment construction rule permits) |
| 4 | `Abstract_geographic_form_with_ma…_2K_20261003142939.jpg` | Rounded diamond/region shape with a map-pin marker on top | `portfolio-market` | High | Blocked (format) |
| 5 | `Checkbox_and_arrow_3D_icon_2K_20261003142956.jpg` | Square frame/checkbox with an arrow pointing into it from the left | `action` | High (matches brief's exact composition) | Blocked (format) |
| 6 | `Create_3D_product_icon_2K_20261003142918.jpg` | Orange notched flag/pennant on a pole, mounted on an ornate stepped pyramid-like base | `obligation` | Medium — no checkmark tick as briefed, and the elaborate pedestal doesn't match any brief | Blocked (format + uncertain mapping) |
| 7 | `Creating_3D_product_icon_2K_20261003142908.jpg` | Abstract radiating orange blades converging into a cluster of gray cubes | *unclear* | Low — does not match any of the 19 briefs | **Requires clarification** |
| 8 | `Creating_3D_product_icon_2K_20261003142936.jpg` | Ornate sci-fi device/speaker-like object with ports and a belt bearing a chain-link emblem | *unclear* | Low — far more complex than any brief, no clear concept match | **Requires clarification** |
| 9 | `Creating_3D_product_icon_2K_20261003142951.jpg` | Gray document card with an orange paperclip across the top-left corner | `evidence` | High (near-exact match to the brief) | Blocked (format) |
| 10 | `Data_core_product_icon_rendering_2K_20261003142944.jpg` | Orange/gray cube cluster with two gray ramp/road arms extending left and right | *unclear* | Low — no brief matches a "core with two extending arms" composition | **Requires clarification** |
| 11 | `Geometric_checkmark_product_icon_2K_20261003142947.jpg` | Orange pedimented arch/gateway (open lattice) with a gray checkmark inside | `control` | Medium — plausible, but visually close to `regulatory-authority`'s pediment motif (collision risk the brief specifically tried to avoid) | Blocked (format + collision risk) |
| 12 | `Protective_shield_icon_rendering_2K_20261003143020.jpg` | Orange/gray shield with a circular gauge/dial and an upward arrow in the center | `risk-indicator` | Medium — brief specified an exclamation mark, not a gauge/arrow | Blocked (format + deviates from brief) |
| 13 | `Sculptural_3D_product_icon_design_2K_20261003143007.jpg` | Orange certificate/card with horizontal text lines and a circular seal in the bottom-right corner | `registration` | High (near-exact match) | Blocked (format) |
| 14 | `Sculptural_3D_product_icon_rende…_2K_20261003143013.jpg` | Orange/gray bound book with a jagged lightning-bolt-like notch cut into its right edge | `regulatory-change` | Medium — book rather than single page, but the "edge being broken" concept matches | Blocked (format) |
| 15 | `Sculptural_triangular_product_ic…_2K_20261003143008.jpg` | Orange outlined triangle with a red/orange faceted star-burst in the center | `escalation` | High (matches the brief's explicit "flare, not plain exclamation" instruction) | Blocked (format) |
| 16 | `Workflow_nodes_3D_product_icon_2K_20261003142930.jpg` | Orange chain-link/connected-node shape on a flat dark tile | `portfolio-process` | Medium — chain links rather than the briefed circle-and-line nodes, but "connected sequence" concept matches | Blocked (format) |
| 17 | `3D_figure_checkmark_icon_2K_20261003143016.jpg` | Orange featureless person bust (head + shoulders) with a gray checkmark beside it | `human-review` | High (near-exact match to the brief) | Blocked (format) |
| 18 | `3D_product_icon_design_2K_20261003142905.jpg` | Abstract gray/orange branching column forking into two curved arms, on a stepped base | *unclear*, closest to `regulatory-change` | Low-Medium | **Requires clarification** |
| 19 | `3D_timeline_ledger_icon_2K_20261003143003.jpg` | Orange vertical pillar with 2 gray horizontal bands at intervals, on a stepped base | `audit-trail` | High (matches the brief's "vertical timeline with interval ticks" concept) | Blocked (format) |

**Totals:** 19 assets discovered. 0 integrated. 15 have a confident-to-medium concept mapping but remain blocked purely on the format/transparency defect above. 4 (#7, #8, #10, #18) have no confident concept match at all and need either a source re-generation or explicit direction on intended use before they can even be assigned a target component.

## Not touched

- No files in `Icons/` were renamed, moved, deleted, or modified.
- No component in `src/` was changed — there is nothing yet safe to wire up.
- `src/components/icons/registry.ts`, `AppIcon.tsx`, and every screen/nav file referenced in the design brief's §I mapping table remain exactly as they were.

## Recommended next action

Pick one path from "What would unblock this" above. Once real transparent/vector assets exist for even a handful of the 15 confidently-mapped concepts, I can resume the icon-by-icon commit workflow exactly as instructed — one asset, one commit, starting with Batch 1 from the design brief (`regulatory-authority`, `regulatory-document`, `regulatory-change`, `impact-assessment`).

## Follow-up session: the 4 unmapped assets, re-examined with evidence separated from inference

Re-inspected each against every one of the 19 briefs again, plus one new signal not used in the prior pass: **filename clustering as a proxy for generation batch**. Three of the four files share the exact prefix `Creating_3D_product_icon` (`...142908.jpg`, `...142936.jpg`, `...142951.jpg`), generated 43 seconds apart by their embedded timestamps — this is directly observable from the filenames themselves (**evidence**, not inference), and strongly suggests all three came from one prompt submitted multiple times, the way `Creating_3D_product_icon_2K_20261003142951.jpg` (the paperclip, a confident `evidence` match) clearly did. Everything beyond "these three are siblings" is interpretation, labeled as such below.

- **`Creating_3D_product_icon_2K_20261003142908.jpg`** (orange blades radiating into a gray cube cluster).
  **Evidence:** shares the `Creating_3D_product_icon` prefix and a 43-second generation window with `...142951.jpg`, which already has a confident, different home (`evidence`). No brief in the design document describes a radiating/converging composition.
  **Inference:** most likely a discarded variant from the same generation batch that produced the `evidence` winner, not a separate intended concept.
  **Recommendation:** discard — do not assign to any of the 19 concepts. Medium confidence; a product owner should confirm before actually deleting anything (nothing has been deleted).

- **`Creating_3D_product_icon_2K_20261003142936.jpg`** (ornate sci-fi device with ports and a chain-link belt emblem).
  **Evidence:** same filename cluster as above. Far more detailed (ports, emblem, multi-material) than any brief's "max 4–5 path segments" construction rule allows at any confidence.
  **Inference:** same batch-sibling reasoning as `...142908.jpg` — a discarded variant, not a distinct concept.
  **Recommendation:** discard. Medium confidence, same caveat.

- **`3D_product_icon_design_2K_20261003142905.jpg`** (abstract branching column forking into two curved arms on a stepped base).
  **Evidence:** does not share the `Creating_3D_product_icon` filename cluster (different prefix, 3 seconds before it starts) — this one is not explained by the batch-sibling pattern above. Its "something branching outward" composition is the closest conceptual match to the `regulatory-change` brief (§C: "a line breaking outward from a document's edge").
  **Inference:** asset #14, `Sculptural_3D_product_icon_rende…_2K_20261003143013.jpg` (a bound book with a jagged notch cut into its edge), is a stronger, more literal match for that exact same brief — a page/book breaking at its edge, not an abstract architectural column.
  **Recommendation:** treat `...143013.jpg` (already mapped) as the `regulatory-change` candidate, and this one as redundant — not a different concept, just a weaker take on the same brief from a separate generation. Medium-high confidence.

- **`Data_core_product_icon_rendering_2K_20261003142944.jpg`** (orange cube core with two gray ramps/roads extending outward to both sides).
  **Evidence:** `impact-assessment` — PARIVART's flagship icon per the design brief's own emphasis — has zero matching assets among all 19 (confirmed again this session). This is the only one of the 19 renders with a "central element + two things connecting to it" composition, which is at least structurally adjacent to `impact-assessment`'s brief (§G: "two overlapping shapes... depicting an intersection").
  **Inference:** the match is a stretch — the brief calls for two *overlapping* shapes with a shared filled region, not a core with two *separate* arms extending outward. This is a materially different composition, not a close variant.
  **Recommendation:** this is the one case I'm not confident enough to resolve unilaterally — PARIVART's flagship icon is too important to assign from a weak structural echo. **Awaiting an explicit product-owner decision:** either accept this as a reinterpreted `impact-assessment` (re-exported with alpha), or commission a new render that actually matches the brief's silhouette.

**Net effect of this pass:** 3 of the 4 previously-"unclear" assets now have a specific, evidence-based recommendation (discard) rather than an open question. 1 — the `impact-assessment` candidate — still genuinely needs a human call, and is left marked as such rather than guessed.

**Reinforcing the one confirmed-unusable asset:** `Sculptural_3D_document_product_icon_2K_20261003142914.jpg` (the `regulatory-document` candidate) has a solid gray background baked into the pixels, not even the checkerboard the other 18 use — this is strictly worse than the rest, not just "also blocked." It is marked **unusable** until a clean transparent export or a faithful recreation exists; the original file itself remains untouched in `Icons/`.

## Follow-up session: Sidebar wiring complete, asset gate still the only blocker

The rendering architecture is now fully assembled end-to-end, verified, and committed:

- `src/components/icons/IconRef.tsx` — a discriminated `IconRef` type (`{ type: "lucide" | "custom", name: ... }`) and a `ResolveIconRef` component dispatching to `AppIcon` or `CustomIcon` accordingly.
- `src/components/shell/Sidebar.tsx` — all 28 nav items now declare `icon: { type: "lucide", name: "X" }` and render through `<ResolveIconRef>`. Every single one is still `type: "lucide"` — no nav item references a custom icon, because none exists.
- The empty-registry guarantee (`CustomIconName` is `never` until `customIcons` gains an entry) is enforced by the compiler, not just documented: `icons.test.tsx` has a `@ts-expect-error` test that fails the build (`npm run typecheck`) if that guarantee is ever accidentally weakened. This was verified to actually catch a mistake during this session — the directive was initially misplaced and `tsc` correctly flagged it as unused, confirming the check is live, not decorative.

**What this means for the next real integration:** adding the first custom icon to the sidebar is now a two-line change (one `customIcons` entry, one nav item's `icon` field switching from `{ type: "lucide", ... }` to `{ type: "custom", ... }`) plus the asset itself — no further architecture work is needed. The only remaining blocker, unchanged from every prior session, is that no asset has passed `scripts/verify-png-alpha.mjs`.

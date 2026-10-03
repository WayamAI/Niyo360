# Icon Re-export Checklist

**No conversion was attempted in this session.** No `ImageMagick`/`convert`/`magick`, `rsvg-convert`, `inkscape`, or Python `PIL` is installed in this environment (checked directly, not assumed), and automated background removal was explicitly not authorized. Per the task's own instruction — "if the assets cannot be converted without the original artwork or manual re-export, leave the original assets untouched and provide a precise re-export checklist" — this document is that checklist. The 19 original JPEGs in `Icons/` remain untouched.

## Format decision: PNG with alpha, not SVG

These 19 assets are glossy, lit, shadowed 3D renders (bevels, specular highlights, drop shadows — confirmed by direct visual inspection in the prior session). Re-exporting them as SVG would require either vector-tracing a raster photograph (producing a false "vector" that's actually a traced bitmap silhouette, misrepresenting the artwork) or regenerating entirely new flat artwork from the Google Flow briefs in `google-flow-icon-design-brief.md` §G (a different, legitimate path, but a new generation pass, not a re-export of what exists). Per the explicit instruction not to "falsely convert a raster image into an SVG and claim it is genuine vector artwork," **the recommended output format for re-exporting the existing 19 renders is high-resolution PNG with a real alpha channel**, preserving the actual 3D appearance as given.

**Architectural consequence worth flagging now, before any integration work:** `src/components/icons/AppIcon.tsx` renders every icon as an inline SVG component with `currentColor` stroke inheritance — it has no path for a raster `<img>` asset today. Keeping these 3D-rendered PNGs means either (a) adding a second, parallel rendering path for raster custom icons alongside `AppIcon`'s vector path, or (b) committing to full SVG regeneration later via the Google Flow briefs so everything stays on one rendering model. This checklist doesn't choose between them — it's a decision for whoever owns the icon system — but Phase 3 integration cannot start until one is picked, because it determines whether the shared-infrastructure preparatory commit builds a new `CustomIcon` component or extends `AppIcon` itself.

## Dimensions and resolution

Original renders are 2048×2048. The application's actual maximum rendered icon size is 28px (`--icon-size-3xl`, `src/styles.css:21`) — sidebar/button/badge contexts use 12–20px. Recommend re-exporting at **256×256px** (a clean 2× the common desktop max-DPI target for a 28px-logical icon at up to 4.5x pixel density, with generous headroom) rather than keeping the full 2048×2048 — nineteen 2048px PNGs with alpha would be multiple MB each, a real page-weight concern for icons used throughout the nav/tables with no corresponding visual benefit at a 12–28px display size. If a given icon is reused at a larger size anywhere (none currently identified in the inventory), re-export that one at 512×512 instead.

## Per-asset checklist

| Original filename | Intended purpose | Transparent output needed | Recommended size | Light/dark surface test needed | Destination path |
|---|---|---|---|---|---|
| `Sculptural_3D_regulatory_icon_2K_20261003142854.jpg` | `regulatory-authority` | Yes — real alpha PNG | 256×256 | Yes (orange/gray render must read clearly on both light and dark panel backgrounds) | `src/assets/icons/custom/icon-regulatory-authority.png` |
| `Sculptural_3D_document_product_icon_2K_20261003142914.jpg` | `regulatory-document` | Yes — **this file currently has a solid gray background, not even a checkerboard; needs a genuine alpha re-export, not just a format change** | 256×256 | Yes | `src/assets/icons/custom/icon-regulatory-document.png` |
| `Document_transforming_through_3D…_2K_20261003142926.jpg` | `document-processing` | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-document-processing.png` |
| `Abstract_geographic_form_with_ma…_2K_20261003142939.jpg` | `portfolio-market` | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-portfolio-market.png` |
| `Checkbox_and_arrow_3D_icon_2K_20261003142956.jpg` | `action` | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-action.png` |
| `Create_3D_product_icon_2K_20261003142918.jpg` | `obligation` (medium confidence — see inventory) | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-obligation.png` |
| `Creating_3D_product_icon_2K_20261003142908.jpg` | **unclear — needs clarification before a destination can be assigned** | Yes, if a use is confirmed | 256×256 | Yes | *(pending)* |
| `Creating_3D_product_icon_2K_20261003142936.jpg` | **unclear — needs clarification** | Yes, if a use is confirmed | 256×256 | Yes | *(pending)* |
| `Creating_3D_product_icon_2K_20261003142951.jpg` | `evidence` | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-evidence.png` |
| `Data_core_product_icon_rendering_2K_20261003142944.jpg` | **unclear — needs clarification** | Yes, if a use is confirmed | 256×256 | Yes | *(pending)* |
| `Geometric_checkmark_product_icon_2K_20261003142947.jpg` | `control` (medium confidence — visually close to `regulatory-authority`'s pediment motif, see inventory) | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-control.png` |
| `Protective_shield_icon_rendering_2K_20261003143020.jpg` | `risk-indicator` (medium confidence — gauge/arrow rather than the briefed exclamation mark) | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-risk-indicator.png` |
| `Sculptural_3D_product_icon_design_2K_20261003143007.jpg` | `registration` | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-registration.png` |
| `Sculptural_3D_product_icon_rende…_2K_20261003143013.jpg` | `regulatory-change` (medium confidence) | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-regulatory-change.png` |
| `Sculptural_triangular_product_ic…_2K_20261003143008.jpg` | `escalation` | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-escalation.png` |
| `Workflow_nodes_3D_product_icon_2K_20261003142930.jpg` | `portfolio-process` (medium confidence) | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-portfolio-process.png` |
| `3D_figure_checkmark_icon_2K_20261003143016.jpg` | `human-review` | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-human-review.png` |
| `3D_product_icon_design_2K_20261003142905.jpg` | **unclear — needs clarification** (closest to `regulatory-change`, low confidence) | Yes, if a use is confirmed | 256×256 | Yes | *(pending)* |
| `3D_timeline_ledger_icon_2K_20261003143003.jpg` | `audit-trail` | Yes | 256×256 | Yes | `src/assets/icons/custom/icon-audit-trail.png` |

**Totals:** 19 originals. 14 have a confirmed destination path pending only the alpha re-export. 4 remain unmapped pending clarification of intended use (`Creating_3D_product_icon_2K_20261003142908.jpg`, `Creating_3D_product_icon_2K_20261003142936.jpg`, `Data_core_product_icon_rendering_2K_20261003142944.jpg`, `3D_product_icon_design_2K_20261003142905.jpg`) — these were listed as low-confidence/no-match in the prior session's inventory and still have no clear target component.

## Every light/dark test needed, and why

All 19 are fixed-palette renders (baked orange/gray, no `currentColor` capability). Every one needs a manual visual check against both the light (`:root`) and dark (`.dark`) surface tokens in `src/styles.css` once integrated, because nothing in the rendering pipeline will automatically adapt them — unlike the app's existing lucide-backed icons, which invert for free via stroke-color inheritance. If any icon reads poorly on one theme (e.g., the gray elements losing contrast against a dark panel), that is new information this checklist cannot predict without the real transparent asset in hand.

## What happens next

Once transparent re-exports land at the destination paths above (and the 4 unclear assets are either dropped or assigned a concept), Phase 3 can resume exactly as specified: one icon integrated and verified per commit, starting with Batch 1 from `google-flow-icon-design-brief.md` §H.

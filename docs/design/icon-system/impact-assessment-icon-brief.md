# Impact Assessment — Flagship Icon Brief

**Status: artwork does not exist.** This is a generation brief only. No image has been produced or verified for this concept — see `docs/design/icon-system/icon-integration-inventory.md` for the confirmed finding that none of the 19 existing renders matches this concept closely enough to use (the closest candidate, `Data_core_product_icon_rendering_2K_20261003142944.jpg`, is flagged there as a weak structural echo, not a real match, and is pending a separate product-owner decision — this brief is for a *purpose-built* replacement, not a rescue of that asset).

## Why this icon matters more than the other 18

Per `google-flow-icon-design-brief.md` §C, impact assessment is "PARIVART's core analytical record, linking a regulatory change to portfolio entities" and "the single most distinctive icon in the family — it is the product's primary analytical concept." Every other domain icon supports a workflow step; this one represents the product's actual reason to exist: finding where a regulatory change touches something the company owns.

## Visual direction, grounded in the existing 3D icon family

The 19 existing renders (`Icons/*.jpg`, inspected directly) establish a consistent house style this brief must match, not reinvent:

- **Material:** glossy, slightly rounded plastic/metal hybrid — smooth beveled edges, soft specular highlights, no hard flat-shaded facets.
- **Palette:** primary orange (matches `--brand: var(--ref-orange-600)` in `src/styles.css`) for the dominant form, cool gray for secondary/structural elements and interior details.
- **Lighting:** a single soft key light from the upper-left, producing a gentle highlight on upper-left-facing surfaces and a soft ambient-occlusion darkening on lower-right-facing ones — consistently across all 19 renders.
- **Shadow:** a soft, diffuse contact shadow directly beneath the object, not a hard drop shadow offset to one side.
- **Framing:** object floats alone, centered, roughly filling 70–80% of the canvas height, no surrounding card/frame/base plate on most of the 19 (a few use a small pedestal — this brief does not require one).

This new icon must look like it belongs on the same shelf as the other 18, not like a different generation session with a different style.

## Primary visual metaphor

**Two distinct forms overlapping, with their intersection as the one area of emphasis.** This directly operationalizes the actual product concept: a regulatory change (one form) and a portfolio entity (a second form) meeting, with the assessment itself living in the overlap. This is the same metaphor specified in the original design brief (`google-flow-icon-design-brief.md`, brief #12) — reinforced here, not changed, because nothing in the 19 renders disproved it; nothing was ever generated against it at all.

## Shape and composition

- Two same-size rounded-square or rounded-diamond forms (matching the rounded, beveled language of the rest of the family — not sharp rectangles), offset so they overlap by roughly a third of their combined area, arranged along a diagonal (upper-left form, lower-right form) consistent with the family's upper-left lighting convention.
- The overlapping region is the single most visually emphasized area of the icon — rendered as a distinct, slightly raised or inset panel, not just a color blend, so it reads as a deliberate "meeting point," not an accidental overlap.
- Optional, if it doesn't clutter the silhouette at small size: a single small mark inside the overlap region (e.g., a subtle checkmark or dot) signaling "assessed," but only if it survives the 12px legibility test below — omit it entirely rather than let it muddy the silhouette.
- Exactly two forms. Do not add a third shape, connecting lines, orbiting elements, or any additional geometry — the brief in `google-flow-icon-design-brief.md` was explicit that this is the only icon in the family permitted a two-shape overlap composition, and adding complexity here undermines that exclusivity.

## Material and lighting

Match the established family exactly: glossy plastic/metal hybrid material, soft specular highlights, upper-left key light, beveled edges on both forms. The overlap region should read as subtly different material or depth from the two outer forms — e.g., slightly recessed with its own small shadow line — to reinforce that it's the focal point, not just where two colors meet.

## Color relationships

- One form in the family's primary orange.
- One form in the family's secondary gray.
- The overlap region in a third, distinguishing treatment — e.g., a warmer/brighter orange, or a visible seam where orange and gray meet — so the eye is drawn there first. Do not make the overlap simply "orange on top of gray" with no visual distinction; it needs to read as the focal point even in a quick glance.

## Depth, bevel, and shadow behavior

- Consistent bevel radius and depth with the rest of the family (inspect 2–3 existing renders side by side before finalizing — do not eyeball this from description alone).
- Soft, centered, diffuse contact shadow beneath the combined silhouette, matching the family's shadow treatment.
- The overlap region may sit slightly lower (recessed) or higher (raised) than the two outer forms to reinforce depth — pick one and apply it consistently; do not mix raised-and-recessed cues in the same icon.

## Transparent-background requirements

- **Must have a genuine alpha channel.** PNG, not JPEG — JPEG cannot carry transparency at all, which is the exact defect that blocked all 19 existing assets (see `icon-integration-inventory.md`).
- No checkerboard pattern baked into the pixels as a placeholder for transparency.
- No solid color matte or background panel of any kind.
- No white or gray fringe/halo around the silhouette edge — clean, properly anti-aliased alpha falloff.

## Recommended output dimensions

2048×2048 at generation time (matching the other 18, for consistent downstream re-export), re-exported to 256×256 with alpha for actual integration — same pipeline as every other asset in `icon-reexport-checklist.md`.

## Small-size legibility requirements

This is the single most important test for this specific icon, since it's more structurally complex (two overlapping forms) than most of the family's single-silhouette icons. At 12px (`--icon-size-xs`, the smallest size actually rendered in the app — badges/status contexts), the two-form overlap must still read as "two things meeting," not collapse into one blob or lose the overlap distinction entirely. If a candidate render fails this test, prefer simplifying the overlap treatment (e.g., a flatter color-seam instead of a raised/recessed panel) over abandoning the two-shape metaphor.

## Light and dark surface compatibility

Like all 19 existing renders, this icon will be a fixed-palette raster image with no `currentColor` capability — it carries its own orange/gray material regardless of app theme. Verify manually against both `:root` (light) and `.dark` (`src/styles.css`) surface tokens once a candidate exists: the gray secondary form in particular must not lose contrast against a dark panel background. If it does, lighten the gray rather than redesign the composition.

## Explicit exclusions

- No text, lettering, or numerals anywhere in the icon.
- No watermark, signature, or generator attribution mark.
- No surrounding card, frame, plinth, or base plate (unless a later design pass deliberately standardizes pedestals across the whole family — not assumed here).
- No background of any kind — transparent only.
- No checkerboard pattern anywhere in the final pixel data.
- No medical cross, no generic shield (that language is reserved for `control`/`risk-indicator`/`regulatory-authority` elsewhere in the family), no lightbulb, no dashboard/chart imagery, no magnifying glass (reserved for `impact-delta-report`).
- No more than two overlapping forms — not three, not a cluster.

## What happens after a candidate exists

Verify its alpha channel and appearance exactly as any other asset would be verified (see `icon-reexport-checklist.md`'s per-asset process), then it becomes a normal Batch 1 integration: one `customIcons` registry entry, one `Sidebar.tsx` wiring change, one commit.

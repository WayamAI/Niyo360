# Regulatory Authority — Asset Handoff Specification

**Status: artwork does not exist.** This supersedes the earlier plan in `icon-reexport-checklist.md` to simply re-export `Icons/Sculptural_3D_regulatory_icon_2K_20261003142854.jpg` (a pedimented-building render) with alpha. Per an explicit product decision this session, `regulatory-authority` is now specified as an **abstract institutional document-and-seal concept**, not the classical-building metaphor that render used — this is a new generation brief, not a re-export instruction. The original JPEG remains untouched in `Icons/` and is kept only as a style/material reference, not as source art to carry forward.

## Why this is the first integration target

Per the prior sessions' prioritization decision: prove the full pipeline — registry entry, `CustomIcon` wiring, `Sidebar.tsx` destination, alpha verification — on one icon before attempting any others. `regulatory-authority` has an unambiguous destination and no concept ambiguity (unlike the impact-assessment and 3 discard-candidate assets), making it the lowest-risk choice to validate the mechanism end-to-end.

## Destination

- **Asset file:** `src/assets/icons/custom/icon-regulatory-authority.png` (directory does not exist yet — confirmed this session; create it when the real asset is added, not before).
- **Registry entry (once the asset exists), in `src/components/icons/customRegistry.ts`:**
  ```ts
  import regulatoryAuthority from "@/assets/icons/custom/icon-regulatory-authority.png";

  export const customIcons = {
    "regulatory-authority": regulatoryAuthority,
  } as const satisfies Record<string, string>;
  ```
- **Consuming call site:** `src/components/shell/Sidebar.tsx`, the nav item currently reading `{ id: "api-authorities", label: "Authorities", icon: "organisation" }` (verified present at this line in the current file) — the `icon` field here keys into the *lucide* registry (`IconName`), so wiring a custom icon in here requires `Sidebar.tsx`'s render logic to check `CustomIconName` first or fall back to `AppIcon`'s `IconName`, OR requires a small, separate decision about whether this particular nav icon switches rendering components entirely. This mechanism is not yet decided and must be resolved as part of the actual integration commit, not assumed here.

## Expected dimensions and format

- **Generation canvas:** 2048×2048, matching the house style of the other 18 renders.
- **Delivered/integrated size:** 256×256px, matching every other entry in `icon-reexport-checklist.md`'s sizing rationale (headroom over the app's 28px maximum render size, without the multi-MB cost of keeping the full 2048px canvas for an icon that never displays larger than 28px).
- **Format:** PNG, 8-bit, RGBA (color type 6) or grayscale+alpha (color type 4) — genuinely decodable alpha channel, not a JPEG, not a flattened checkerboard, not a solid matte. Verified programmatically before integration — see "Verification" below, not assumed from the `.png` extension.

## Visual concept: abstract institutional document-and-seal

- **Primary visual metaphor:** an official document or charter bearing a circular seal/stamp — the universal visual shorthand for "an institution's authority," built from the same document-and-seal language already proven elsewhere in the family (compare the `registration` concept, which pairs a document with a circular seal accent, per `google-flow-icon-design-brief.md` §G brief #11) but composed as its own distinct silhouette so the two don't read as the same icon.
- **Composition:** a simplified document/certificate shape (rectangular, gently rounded corners matching the family's bevel language) with a prominent circular seal element — larger and more central than `registration`'s corner-accent seal, since here the seal *is* the subject (the authority), not a secondary detail on a document that's the subject.
- **Distinctiveness from `registration`:** `registration` is "a document that has been officially stamped" (the stamp is evidence of a process completed). `regulatory-authority` is "the body that issues the stamp" (the seal itself, document as a supporting frame) — the seal should dominate the composition here, not sit in a corner.
- **Material/lighting/shadow:** match the established family exactly — glossy plastic/metal hybrid, soft specular highlight, upper-left key light, soft centered contact shadow, consistent bevel depth with the other 18 (inspect 2–3 existing renders directly before finalizing, do not rely on this description alone).
- **Color:** primary orange for the document/charter form, gray for the seal's structural ring, consistent with the family's two-tone palette.

## Transparency requirements

- Fully transparent background outside the rendered object — no fill of any kind.
- No checkerboard pattern baked into the pixels (the defect found in all 19 original renders).
- No solid background color or matte.
- No text, lettering, or watermark anywhere in the image.
- No artificial/simulated transparency effect (e.g., a semi-transparent gray wash standing in for real alpha) — the alpha channel itself must be genuine and will be checked byte-for-byte, not visually approximated.

## Background removal constraint

If the source material requires background removal from an opaque render (rather than generating directly with alpha), **do not use an automated process that damages the object's edges, materials, or shadows** — no aggressive chroma-keying or thresholding that eats into anti-aliased edges, removes the soft contact shadow, or leaves a light/dark fringe around the silhouette. No such tool is installed in this environment regardless (`ImageMagick`/`PIL` confirmed absent in prior sessions), so this constraint currently has no way to be violated here — it's recorded for whoever produces the actual asset.

## Verification — run this the moment a candidate file exists

`scripts/verify-png-alpha.mjs` (added this session, self-tested against 4 synthetic PNGs with known alpha values before being trusted — see commit history) parses the PNG directly and reports:

```
node scripts/verify-png-alpha.mjs path/to/candidate.png
```

It confirms, independent of file extension: real PNG magic bytes, a color type that actually carries an alpha channel, and at least one non-fully-opaque pixel in the decoded pixel data. A candidate that fails any of these checks is not integrated, per the explicit instruction that a file extension alone is insufficient proof.

## What happens next

Once a candidate passes `verify-png-alpha.mjs`: place it at the destination path above, add the one `customIcons` entry, resolve the `Sidebar.tsx` rendering-path question noted above, test, review the diff, and commit — exactly one icon, one commit, per the standing rule.

/**
 * Registry for the custom 3D icon family — a second, deliberately separate
 * registry from `icons` (registry.ts), not a union inside it.
 *
 * Why separate rather than merged into `IconName`: the two families render
 * through different components with incompatible rendering models.
 * `icons`/`IconName` back `<AppIcon>`, a `currentColor`-inheriting SVG glyph
 * that looks correct in any semantic/theme colour with zero extra assets.
 * `customIcons`/`CustomIconName` back `<CustomIcon>`, a fixed-palette,
 * lit/shadowed 3D render with real alpha transparency — it carries its own
 * colour and needs no `currentColor` support, but also can't take one. A
 * single `IconName` union spanning both would let `<AppIcon name="...">`
 * accept a custom-icon name that it has no idea how to render as an SVG
 * glyph (or vice versa for `<CustomIcon>`), which defeats the type safety
 * the split is for. Keeping them as two distinct types makes "which
 * rendering model does this name belong to" a compile-time fact, not a
 * runtime assumption.
 *
 * Each value is a locally-imported image module path, resolved to a URL by
 * Vite at build time exactly like the brand marks in Logo.tsx — never a
 * literal string typed in at the call site, and never a remote URL.
 *
 * No asset has passed the alpha-transparency bar yet (see
 * docs/design/icon-system/icon-reexport-checklist.md — all 19 original
 * JPEGs and the later re-exported PNGs are opaque, checkerboard baked into
 * pixels, not real alpha). `regulatory-authority` below is a deliberate
 * exception: it is wired in as an opaque placeholder per explicit
 * product-owner instruction, not because it passed verification. See
 * docs/design/icon-system/icon-integration-inventory.md for the dated note.
 * Entries are added one at a time, each as its own integration commit.
 */
import regulatoryAuthority from "@/assets/icons/custom/icon-regulatory-authority.png";

export const customIcons = {
  "regulatory-authority": regulatoryAuthority,
} as const satisfies Record<string, string>;

export type CustomIconName = keyof typeof customIcons;

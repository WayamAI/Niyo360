import type { CSSProperties } from "react";
import type { IconSize } from "./AppIcon";

/**
 * Raster counterpart to AppIcon, for the custom 3D icon family.
 *
 * AppIcon renders a lucide SVG with `currentColor` stroke inheritance; that
 * model doesn't fit a baked-color, lit/shadowed 3D render, so this is a
 * separate component rather than a second branch inside AppIcon — the two
 * share the same size tokens and labelling contract so call sites read the
 * same way, but nothing about AppIcon's existing SVG path changes.
 *
 * `src` is a locally-imported image module (e.g. `import icon from
 * "@/assets/icons/custom/icon-x.png"`), resolved to a URL by Vite like every
 * other local asset in this app (see Logo.tsx) — never a remote URL.
 */
export interface CustomIconProps {
  src: string;
  size?: IconSize;
  className?: string;
  style?: CSSProperties;
  /** Give a label when the icon is the only carrier of meaning. */
  "aria-label"?: string;
  /** Decorative icons sitting next to a text label must be hidden. */
  "aria-hidden"?: boolean;
}

export function CustomIcon({
  src,
  size = "md",
  className = "",
  style,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: CustomIconProps) {
  // Same default as AppIcon: decorative unless a label is explicitly given.
  const decorative = ariaHidden ?? !ariaLabel;
  return (
    <img
      src={src}
      // alt is the correct accessible-name channel for <img>, not aria-label;
      // empty alt is what actually hides a decorative <img> from a screen
      // reader (aria-hidden is kept too, for the same visible contract as
      // AppIcon's aria-hidden prop).
      alt={decorative ? "" : (ariaLabel ?? "")}
      aria-hidden={decorative || undefined}
      className={`inline-block shrink-0 object-contain align-middle ${className}`}
      style={{
        width: `var(--icon-size-${size})`,
        height: `var(--icon-size-${size})`,
        ...style,
      }}
      // A missing/broken asset disappears instead of showing the browser's
      // broken-image glyph in what's usually a dense row of other icons.
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

import type { CSSProperties } from "react";
import type { IconSize } from "./AppIcon";
import { customIcons, type CustomIconName } from "./customRegistry";

/**
 * Raster counterpart to AppIcon, for the custom 3D icon family.
 *
 * AppIcon renders a lucide SVG with `currentColor` stroke inheritance; that
 * model doesn't fit a baked-color, lit/shadowed 3D render, so this is a
 * separate component rather than a second branch inside AppIcon — the two
 * share the same size tokens and labelling contract so call sites read the
 * same way, but nothing about AppIcon's existing SVG path changes.
 */
interface CustomIconImageProps {
  src: string;
  size?: IconSize;
  className?: string;
  style?: CSSProperties;
  /** Give a label when the icon is the only carrier of meaning. */
  "aria-label"?: string;
  /** Decorative icons sitting next to a text label must be hidden. */
  "aria-hidden"?: boolean;
}

/**
 * The rendering primitive, given an already-resolved image URL. Exported
 * because it's a genuinely reusable, independently testable piece — most
 * call sites should reach it through `<CustomIcon name="...">` below rather
 * than pass a `src` directly, the same way nothing calls a lucide component
 * straight from `registry.ts` instead of going through `<AppIcon name="...">`.
 */
export function CustomIconImage({
  src,
  size = "md",
  className = "",
  style,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: CustomIconImageProps) {
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

export interface CustomIconProps extends Omit<CustomIconImageProps, "src"> {
  /**
   * A name from the typed custom-icon registry (customRegistry.ts), not a
   * raw path — this is the type-safe entry point: a typo or an unregistered
   * name is a compile error, the same guarantee `<AppIcon name="...">` gives
   * for lucide glyphs. The registry is empty until a real asset passes the
   * alpha-transparency bar, so this prop has no valid value yet — that's
   * accurate, not a bug, since no usable custom icon currently exists.
   */
  name: CustomIconName;
}

/** The public entry point. Resolves `name` through the registry and renders it. */
export function CustomIcon({ name, ...rest }: CustomIconProps) {
  return <CustomIconImage src={customIcons[name]} {...rest} />;
}

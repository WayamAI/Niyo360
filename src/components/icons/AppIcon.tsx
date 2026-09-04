import type { CSSProperties } from "react";
import { icons, type IconName } from "./registry";

/**
 * Size scale, exposed as CSS custom properties in styles.css
 * (--icon-size-xs … --icon-size-3xl) and consumed here.
 *
 * Per-context defaults used across the app:
 *   sidebar 18 (lg) · button 16 (md) · table/small action 14 (sm)
 *   badge/status 12–14 (xs/sm) · search 16 (md) · empty state 24–28 (2xl/3xl)
 */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export interface AppIconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
  /**
   * Escape hatch for colours computed at runtime (deadline/confidence ramps).
   * Static colours belong in `className` as a token utility.
   */
  style?: CSSProperties;
  /** Give a label when the icon is the only carrier of meaning. */
  "aria-label"?: string;
  /** Decorative icons sitting next to a text label must be hidden. */
  "aria-hidden"?: boolean;
}

export function AppIcon({
  name,
  size = "md",
  className = "",
  strokeWidth = 1.75,
  style,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: AppIconProps) {
  const Glyph = icons[name];
  // Labelled icons are exposed to assistive tech; unlabelled icons are
  // decorative by definition and are hidden unless told otherwise.
  const hidden = ariaHidden ?? !ariaLabel;
  return (
    <Glyph
      className={`shrink-0 ${className}`}
      style={{
        width: `var(--icon-size-${size})`,
        height: `var(--icon-size-${size})`,
        ...style,
      }}
      strokeWidth={strokeWidth}
      aria-hidden={hidden || undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      focusable="false"
    />
  );
}

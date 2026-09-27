import parivartLockupLight from "@/assets/parivart-logo-light.svg";
import parivartLockupDark from "@/assets/parivart-logo-dark.svg";

/**
 * Brand assets.
 *
 * Theme switching is done with the `.dark` class that the theme system already
 * puts on <html>, not by reading theme state in JS. Both images are in the
 * markup and CSS picks one, which means the correct logo is present in the
 * server-rendered HTML — no wrong-logo flash on load, and it works on the sign
 * in screen, which renders outside the app context.
 *
 * Two shapes, because the supplied artwork demands it. The wordmark lockups
 * are 1403x564 canvases holding 1015x308 of ink — only 55% of the height and
 * 72% of the width is artwork. Scaled down to fit a 56px top bar, the letters
 * land around 5px wide and stop being readable. So the compact surfaces use
 * the square symbol and the roomy ones use the full lockup. Neither asset is
 * cropped, recoloured or stretched.
 */

/**
 * Square brand symbol, for compact chrome. This is the same artwork as the
 * favicon — a full-bleed orange gradient tile — so it needs no theme variant
 * and sits on any surface.
 */
export function BrandMark({
  size = 28,
  className = "",
}: {
  /** Rendered edge length in px. The asset is square, so width == height. */
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`shrink-0 rounded-md ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Full PARIVART lockup — symbol plus wordmark. Carries the product name, so it
 * is labelled and should not sit beside a repeated text wordmark.
 *
 * `height` is the box height; the artwork's own padding means the visible ink
 * is about 55% of it. Sized accordingly at each call site.
 */
export function BrandLockup({
  height = 64,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const shared = "w-auto max-w-full";
  return (
    <span className={`inline-flex items-center ${className}`} style={{ height }}>
      <img
        src={parivartLockupLight}
        alt="PARIVART"
        className={`${shared} dark:hidden`}
        style={{ height }}
      />
      <img
        src={parivartLockupDark}
        alt="PARIVART"
        className={`hidden ${shared} dark:block`}
        style={{ height }}
      />
    </span>
  );
}

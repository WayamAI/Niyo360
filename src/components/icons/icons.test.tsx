import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppIcon } from "./AppIcon";
import { CustomIcon } from "./CustomIcon";

/**
 * No DOM test environment (jsdom/happy-dom) is configured for this project —
 * vitest runs in plain Node here, and the existing test suite is logic-only.
 * Rather than add a new dependency to get a DOM, these render to a real HTML
 * string via react-dom/server (already a dependency) and assert against the
 * markup directly. That's a genuine rendering check, not a mock.
 */

describe("AppIcon (existing SVG/currentColor path, unchanged)", () => {
  it("renders the lucide glyph for a known icon name", () => {
    const html = renderToStaticMarkup(<AppIcon name="search" />);
    expect(html).toContain("<svg");
    // lucide icons carry stroke="currentColor" by default — this is the
    // inheritance behaviour the custom raster path explicitly does not have.
    expect(html).toContain('stroke="currentColor"');
  });

  it("sizes via the --icon-size-* CSS variable scale, unchanged", () => {
    const html = renderToStaticMarkup(<AppIcon name="search" size="lg" />);
    expect(html).toContain("--icon-size-lg");
  });

  it("defaults to decorative (aria-hidden) when no label is given", () => {
    const html = renderToStaticMarkup(<AppIcon name="search" />);
    expect(html).toContain('aria-hidden="true"');
  });

  it("exposes an accessible name and role when aria-label is given", () => {
    const html = renderToStaticMarkup(<AppIcon name="search" aria-label="Search" />);
    expect(html).toContain('aria-label="Search"');
    expect(html).toContain('role="img"');
    expect(html).not.toContain("aria-hidden");
  });
});

describe("CustomIcon (new raster/alpha-PNG path)", () => {
  const PNG = "/assets/icons/custom/icon-example.png";

  it("renders an <img> with the given src", () => {
    const html = renderToStaticMarkup(<CustomIcon src={PNG} />);
    expect(html).toContain("<img");
    expect(html).toContain(`src="${PNG}"`);
  });

  it("sizes via the same --icon-size-* scale as AppIcon", () => {
    const html = renderToStaticMarkup(<CustomIcon src={PNG} size="xl" />);
    expect(html).toContain("--icon-size-xl");
  });

  it("preserves aspect ratio via object-contain rather than stretching", () => {
    const html = renderToStaticMarkup(<CustomIcon src={PNG} />);
    expect(html).toContain("object-contain");
  });

  it("is decorative (empty alt, aria-hidden) by default, matching AppIcon", () => {
    const html = renderToStaticMarkup(<CustomIcon src={PNG} />);
    expect(html).toContain('alt=""');
    expect(html).toContain('aria-hidden="true"');
  });

  it("exposes an accessible name via alt, not aria-label, when labelled", () => {
    const html = renderToStaticMarkup(<CustomIcon src={PNG} aria-label="Regulatory authority" />);
    expect(html).toContain('alt="Regulatory authority"');
    expect(html).not.toContain("aria-hidden");
  });

  it("an explicit aria-hidden override still hides a labelled icon", () => {
    const html = renderToStaticMarkup(
      <CustomIcon src={PNG} aria-label="Regulatory authority" aria-hidden />,
    );
    expect(html).toContain('aria-hidden="true"');
  });

  it("never applies a currentColor stroke filter to the raster image", () => {
    const html = renderToStaticMarkup(<CustomIcon src={PNG} />);
    expect(html).not.toContain("currentColor");
  });

  // CustomIcon's onError handler (hides a broken/missing asset instead of
  // showing the browser's broken-image glyph) is a runtime event callback —
  // it has no representation in static server-rendered markup, and this
  // project has no jsdom/DOM test environment to fire a real "error" event
  // against. Verified by code inspection only: `onError={(e) =>
  // e.currentTarget.style.display = "none"}` in CustomIcon.tsx. Flagging
  // this gap explicitly rather than writing an assertion that can't fail.
});

import { describe, expect, it } from "vitest";
import { buildSourceCreatePayload, canSubmitSource, sourceNeedsUrl } from "./CreateSourceDialog";

/**
 * No DOM test environment is configured for this project (see
 * icons.test.tsx) — interactive behaviour like typing into a field or
 * clicking submit can't be simulated. What's actually logic, not rendering,
 * is pulled into plain functions and tested directly here instead.
 */

describe("sourceNeedsUrl", () => {
  it("is true for every pollable source type", () => {
    expect(sourceNeedsUrl("RSS")).toBe(true);
    expect(sourceNeedsUrl("HTML")).toBe(true);
    expect(sourceNeedsUrl("API")).toBe(true);
    expect(sourceNeedsUrl("WEB_SERVICE")).toBe(true);
  });

  it("is false for DOCUMENT, which has no URL to poll", () => {
    expect(sourceNeedsUrl("DOCUMENT")).toBe(false);
  });
});

describe("canSubmitSource", () => {
  const base = { name: "FDA Recalls", authorityId: "auth-1", sourceType: "RSS" as const, url: "" };

  it("requires a name", () => {
    expect(canSubmitSource({ ...base, name: "  " })).toBe(false);
  });

  it("requires an authority", () => {
    expect(canSubmitSource({ ...base, authorityId: "" })).toBe(false);
  });

  it("requires a URL for a pollable type", () => {
    expect(canSubmitSource({ ...base, url: "" })).toBe(false);
    expect(canSubmitSource({ ...base, url: "https://example.com/feed" })).toBe(true);
  });

  it("does not require a URL for DOCUMENT", () => {
    expect(canSubmitSource({ ...base, sourceType: "DOCUMENT", url: "" })).toBe(true);
  });
});

describe("buildSourceCreatePayload", () => {
  it("sends source_type and connector_type as the same selected type", () => {
    const payload = buildSourceCreatePayload({
      name: "FDA Recalls",
      authorityId: "auth-1",
      sourceType: "API",
      url: "https://example.com/feed.json",
      description: "",
    });
    expect(payload.source_type).toBe("API");
    expect(payload.connector_type).toBe("API");
  });

  it("trims name, url and description, and omits an empty description", () => {
    const payload = buildSourceCreatePayload({
      name: "  FDA Recalls  ",
      authorityId: "auth-1",
      sourceType: "HTML",
      url: "  https://example.com  ",
      description: "   ",
    });
    expect(payload.name).toBe("FDA Recalls");
    expect(payload.url).toBe("https://example.com");
    expect(payload.description).toBeNull();
  });

  it("sends a null url for DOCUMENT regardless of what was typed", () => {
    const payload = buildSourceCreatePayload({
      name: "Manual Upload",
      authorityId: "auth-1",
      sourceType: "DOCUMENT",
      url: "https://this-should-be-ignored.example.com",
      description: "",
    });
    expect(payload.url).toBeNull();
  });

  it("always creates enabled", () => {
    const payload = buildSourceCreatePayload({
      name: "FDA Recalls",
      authorityId: "auth-1",
      sourceType: "RSS",
      url: "https://example.com/feed",
      description: "",
    });
    expect(payload.enabled).toBe(true);
  });
});

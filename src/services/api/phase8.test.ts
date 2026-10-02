import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Request shapes for the Phase 8 clients.
 *
 * These assert what actually goes on the wire — the paths, the trailing
 * slashes, how filters are serialised and how a binary body is read. They do
 * not assert what the backend returns; that is covered by the backend's own
 * suite. fetch is replaced rather than hitting a real API.
 */

const BASE = "http://api.test";

async function load() {
  vi.stubEnv("VITE_API_BASE_URL", BASE);
  vi.resetModules();
  return {
    client: await import("./client"),
    audit: await import("./audit"),
    evidence: await import("./evidence"),
    intelligence: await import("./intelligence"),
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Returns the single URL that was fetched. */
function fetchedUrl(fetchMock: ReturnType<typeof vi.fn>): string {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  return String(fetchMock.mock.calls[0][0]);
}

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem">);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("auditApi", () => {
  it("keeps the collection's trailing slash", async () => {
    // /audit without it 307-redirects, and a redirect can drop the
    // Authorization header.
    const { audit } = await load();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await audit.auditApi.list();
    expect(fetchedUrl(fetchMock)).toBe(`${BASE}/api/v1/audit/`);
  });

  it("sends entity filters as query parameters", async () => {
    const { audit } = await load();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await audit.auditApi.list({
      entity_type: "IMPACT_ASSESSMENT",
      entity_id: "assessment-1",
      limit: 50,
    });

    const url = new URL(fetchedUrl(fetchMock));
    expect(url.pathname).toBe("/api/v1/audit/");
    expect(url.searchParams.get("entity_type")).toBe("IMPACT_ASSESSMENT");
    expect(url.searchParams.get("entity_id")).toBe("assessment-1");
    expect(url.searchParams.get("limit")).toBe("50");
  });

  it("omits filters that were not set", async () => {
    // buildUrl drops undefined/null/"" — an absent filter must not become
    // `?entity_id=undefined`, which the backend would treat as a real value.
    const { audit } = await load();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await audit.auditApi.list({ entity_type: "ACTION", entity_id: undefined });

    const url = new URL(fetchedUrl(fetchMock));
    expect(url.searchParams.has("entity_id")).toBe(false);
    expect(url.searchParams.get("entity_type")).toBe("ACTION");
  });

  it("reads the vocabulary from its own path", async () => {
    const { audit } = await load();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ event_types: ["REVIEW_FILED"], entity_types: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const types = await audit.auditApi.eventTypes();
    expect(fetchedUrl(fetchMock)).toBe(`${BASE}/api/v1/audit/event-types`);
    expect(types.event_types).toEqual(["REVIEW_FILED"]);
  });
});

describe("evidenceApi", () => {
  it("uploads as multipart without setting Content-Type itself", async () => {
    // The browser must set the boundary; a hand-set Content-Type breaks it.
    const { evidence } = await load();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: "e1" }));
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["signed off"], "signoff.txt", { type: "text/plain" });
    await evidence.evidenceApi.upload(file, {
      action_id: "action-1",
      description: "QA sign-off",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${BASE}/api/v1/evidence/upload`);
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);

    const body = init.body as FormData;
    expect(body.get("action_id")).toBe("action-1");
    expect(body.get("description")).toBe("QA sign-off");
    expect(body.get("file")).toBeInstanceOf(File);

    const headers = new Headers(init.headers);
    expect(headers.has("content-type")).toBe(false);
  });

  it("omits an empty description rather than sending a blank field", async () => {
    const { evidence } = await load();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: "e1" }));
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["x"], "x.txt", { type: "text/plain" });
    await evidence.evidenceApi.upload(file, { action_id: "a1" });

    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body.has("description")).toBe(false);
  });

  it("filters the list by action", async () => {
    const { evidence } = await load();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await evidence.evidenceApi.list({ action_id: "action-1" });

    const url = new URL(fetchedUrl(fetchMock));
    expect(url.pathname).toBe("/api/v1/evidence/");
    expect(url.searchParams.get("action_id")).toBe("action-1");
  });

  it("reads a download as bytes, not as text", async () => {
    // The default path reads a non-JSON body with .text(), which decodes bytes
    // as UTF-8 and silently corrupts anything that is not text. A download must
    // come back as a Blob.
    const { evidence } = await load();
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0xff]);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(bytes, {
        status: 200,
        headers: { "content-type": "application/octet-stream" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const blob = await evidence.evidenceApi.download("e1");
    expect(blob).toBeInstanceOf(Blob);
    expect(new Uint8Array(await blob.arrayBuffer())).toEqual(bytes);
  });
});

describe("intelligence clients", () => {
  it("reads a change and its obligations from the nested path", async () => {
    const { intelligence } = await load();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await intelligence.changesApi.obligations("change-1");
    expect(fetchedUrl(fetchMock)).toBe(`${BASE}/api/v1/regulatory/changes/change-1/obligations`);
  });

  it("keeps the trailing slash on both collections", async () => {
    const { intelligence } = await load();

    const changes = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", changes);
    await intelligence.changesApi.list();
    expect(fetchedUrl(changes)).toBe(`${BASE}/api/v1/regulatory/changes/`);

    const obligations = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", obligations);
    await intelligence.obligationsApi.list();
    expect(fetchedUrl(obligations)).toBe(`${BASE}/api/v1/regulatory/obligations/`);
  });

  it("passes the category filter through", async () => {
    const { intelligence } = await load();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await intelligence.obligationsApi.list({ category: "LABELING" });
    expect(new URL(fetchedUrl(fetchMock)).searchParams.get("category")).toBe("LABELING");
  });
});

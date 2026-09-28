import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errors";

/**
 * Client behaviour tests.
 *
 * The module reads VITE_API_BASE_URL at import time, so each test imports it
 * fresh after stubbing the env. fetch is replaced rather than hitting a real
 * backend — these assert how the client classifies responses, not what the
 * server returns.
 */

const BASE = "http://api.test";

async function loadClient() {
  vi.stubEnv("VITE_API_BASE_URL", BASE);
  vi.resetModules();
  return import("./client");
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

beforeEach(() => {
  // Minimal sessionStorage — the client is a browser module; tests run in node.
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

describe("request", () => {
  it("returns the parsed body on success", async () => {
    const { api } = await loadClient();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([{ id: "p1" }])));

    await expect(api.get("/api/v1/portfolio/products/")).resolves.toEqual([{ id: "p1" }]);
  });

  it("builds the URL from the base and drops empty query params", async () => {
    const { api } = await loadClient();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await api.get("/api/v1/portfolio/products/", {
      query: { skip: 0, limit: 25, status: undefined },
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${BASE}/api/v1/portfolio/products/?skip=0&limit=25`);
  });

  it("attaches the bearer token when authenticated", async () => {
    const { api, setAccessToken } = await loadClient();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal("fetch", fetchMock);
    setAccessToken("tok-123");

    await api.get("/api/v1/auth/me");

    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok-123");
  });

  it("omits the token when the call is unauthenticated", async () => {
    const { request, setAccessToken } = await loadClient();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal("fetch", fetchMock);
    setAccessToken("tok-123");

    await request("/api/v1/auth/login", {
      method: "POST",
      authenticated: false,
      form: { username: "a@b.com", password: "x" },
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Headers).get("Authorization")).toBeNull();
    expect((init.headers as Headers).get("Content-Type")).toBe("application/x-www-form-urlencoded");
    expect(init.body).toBe("username=a%40b.com&password=x");
  });

  it("clears the token and notifies the handler on 401", async () => {
    const { api, setAccessToken, getAccessToken, setUnauthorizedHandler } = await loadClient();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ detail: "nope" }, 401)));
    setAccessToken("stale");
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(api.get("/api/v1/auth/me")).rejects.toMatchObject({ kind: "unauthorized" });
    expect(getAccessToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("keeps the session on 403 — forbidden is not unauthenticated", async () => {
    const { api, setAccessToken, getAccessToken, setUnauthorizedHandler } = await loadClient();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ detail: "denied" }, 403)));
    setAccessToken("good-token");
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(api.get("/api/v1/impact/")).rejects.toMatchObject({ kind: "forbidden" });
    expect(getAccessToken()).toBe("good-token");
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("classifies 404 and surfaces the server's detail message", async () => {
    const { api } = await loadClient();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ detail: "Product not found" }, 404)),
    );

    await expect(api.get("/api/v1/portfolio/products/x")).rejects.toMatchObject({
      kind: "not_found",
      message: "Product not found",
    });
  });

  it("maps a 422 body to per-field messages", async () => {
    const { api } = await loadClient();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { detail: [{ loc: ["body", "email"], msg: "not a valid email", type: "value_error" }] },
            422,
          ),
        ),
    );

    // Asserted by shape, not instanceof: vi.resetModules() gives each test a
    // fresh module graph, so the ApiError class here is not the one the
    // re-imported client throws.
    const error = (await api
      .post("/api/v1/auth/register", { json: {} })
      .then(() => null)
      .catch((e: unknown) => e)) as ApiError;

    expect(error.kind).toBe("validation");
    expect(error.fieldErrors).toEqual({ email: "not a valid email" });
  });

  it("reads Retry-After on 429 and does not retry by itself", async () => {
    const { api } = await loadClient();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ detail: "slow down" }, 429, { "retry-after": "30" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.get("/api/v1/impact/")).rejects.toMatchObject({
      kind: "rate_limited",
      retryAfter: 30,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("classifies 500 as a server error", async () => {
    const { api } = await loadClient();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 500 })));

    await expect(api.get("/api/v1/impact/")).rejects.toMatchObject({ kind: "server" });
  });

  it("turns a transport failure into a network ApiError", async () => {
    const { api } = await loadClient();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(api.get("/api/v1/impact/")).rejects.toMatchObject({ kind: "network" });
  });

  it("fails fast with a clear message when no base URL is configured", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "");
    vi.resetModules();
    const { api, isApiConfigured } = await import("./client");

    expect(isApiConfigured).toBe(false);
    await expect(api.get("/api/v1/impact/")).rejects.toMatchObject({ kind: "network" });
  });

  it("returns undefined for 204 rather than trying to parse a body", async () => {
    const { api } = await loadClient();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(api.delete("/api/v1/portfolio/products/x")).resolves.toBeUndefined();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Open sign-in: what an unknown email is turned into.
 *
 * The register endpoint needs a user and an organization, and the demo flow has
 * only an email and a password to build them from. These pin the derivation and
 * the one request it makes — not what the backend does with it.
 */

const BASE = "http://api.test";

async function loadAuth() {
  vi.stubEnv("VITE_API_BASE_URL", BASE);
  vi.resetModules();
  return import("./auth");
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

describe("accountFromEmail", () => {
  it("names the user from the local part and the org from the domain", async () => {
    const { accountFromEmail } = await loadAuth();

    const { user, organization } = accountFromEmail("ra.lead@asterion-medical.com", "demo1234");

    expect(user.name).toBe("Ra Lead");
    expect(user.email).toBe("ra.lead@asterion-medical.com");
    expect(user.role).toBe("ADMIN");
    expect(organization.name).toBe("Asterion Medical");
  });

  it("slugs the whole address, so two people at one domain do not collide", async () => {
    const { accountFromEmail } = await loadAuth();

    const first = accountFromEmail("ceo@asterion.com", "demo1234").organization.slug;
    const second = accountFromEmail("cfo@asterion.com", "demo1234").organization.slug;

    expect(first).toBe("ceo-asterion-com");
    expect(second).not.toBe(first);
  });

  it("lower-cases and trims what was typed", async () => {
    const { accountFromEmail } = await loadAuth();

    const { user, organization } = accountFromEmail("  CEO@Asterion.COM ", "demo1234");

    expect(user.email).toBe("ceo@asterion.com");
    expect(organization.slug).toBe("ceo-asterion-com");
  });
});

describe("authApi.registerFromEmail", () => {
  it("posts both objects to register and stores the returned token", async () => {
    const { authApi } = await loadAuth();
    const { getAccessToken } = await import("./client");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ access_token: "tok-new", token_type: "bearer", user: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await authApi.registerFromEmail("ra.lead@asterion-medical.com", "demo1234");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/api/v1/auth/register`);
    expect(JSON.parse(init.body as string)).toMatchObject({
      user_in: { email: "ra.lead@asterion-medical.com", password: "demo1234", role: "ADMIN" },
      org_in: { name: "Asterion Medical", slug: "ra-lead-asterion-medical-com" },
    });
    expect(getAccessToken()).toBe("tok-new");
  });

  it("surfaces the backend's rejection rather than swallowing it", async () => {
    const { authApi } = await loadAuth();
    const { ApiError } = await import("./errors");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: [
              {
                loc: ["body", "user_in", "password"],
                msg: "String should have at least 8 characters",
                type: "string_too_short",
              },
            ],
          }),
          { status: 422, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const failure = await authApi.registerFromEmail("ceo@asterion.com", "short").catch((e) => e);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as InstanceType<typeof ApiError>).fieldErrors["user_in.password"]).toBe(
      "String should have at least 8 characters",
    );
  });
});

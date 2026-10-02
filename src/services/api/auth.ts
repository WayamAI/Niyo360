import { api, request, setAccessToken } from "./client";
import type { OrganizationCreate, TokenResponse, User, UserCreate } from "./types";

/**
 * Authentication against the real backend contract.
 *
 * Two things about /api/v1/auth/login differ from what a JSON API usually
 * looks like, and both come straight from the served schema:
 *
 *  - It is an OAuth2 password flow, so the body is
 *    application/x-www-form-urlencoded with `username` and `password` fields —
 *    not JSON, and the email goes in `username`.
 *  - It returns {access_token, token_type, user}, so the signed-in user
 *    arrives with the token and needs no follow-up request.
 *
 * There is no /logout endpoint. The token is stateless, so signing out is a
 * client-side discard; `logout()` reflects that rather than calling an
 * endpoint that does not exist.
 */

/**
 * Derives an organization and a user from an email address alone.
 *
 * The register endpoint needs a name for both, and the demo sign-in flow has
 * nothing but what was typed into the two fields. The slug is built from the
 * whole address rather than the domain so two people at the same domain get
 * two organizations instead of the second one colliding on a taken slug.
 */
export function accountFromEmail(email: string, password: string) {
  const address = email.trim().toLowerCase();
  const [local = "", domain = ""] = address.split("@");
  const titleCase = (value: string) =>
    value
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  return {
    user: {
      name: titleCase(local) || address,
      email: address,
      password,
      // First user of a brand-new organization — anything less and the session
      // could not reach the screens this flow exists for.
      role: "ADMIN",
    } satisfies UserCreate,
    organization: {
      name: titleCase(domain.split(".")[0] ?? "") || address,
      slug: address.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    } satisfies OrganizationCreate,
  };
}

export const authApi = {
  /** Exchanges credentials for a Bearer token and stores it. */
  async login(email: string, password: string): Promise<TokenResponse> {
    const token = await request<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      authenticated: false,
      form: { username: email, password, grant_type: "password" },
    });
    setAccessToken(token.access_token);
    return token;
  },

  /**
   * Creates an organization and its first user together — the endpoint takes
   * both objects in one body (`user_in` and `org_in`).
   */
  async register(user: UserCreate, organization: OrganizationCreate): Promise<TokenResponse> {
    const token = await request<TokenResponse>("/api/v1/auth/register", {
      method: "POST",
      authenticated: false,
      json: { user_in: user, org_in: organization },
    });
    setAccessToken(token.access_token);
    return token;
  },

  /**
   * Registers an organization and user derived from an email address. Used by
   * the demo open sign-in, where an unknown address is taken as a new tenant
   * rather than a typo.
   */
  registerFromEmail(email: string, password: string): Promise<TokenResponse> {
    const { user, organization } = accountFromEmail(email, password);
    return authApi.register(user, organization);
  },

  /** The signed-in user. Used to restore a session after a reload. */
  me(): Promise<User> {
    return api.get<User>("/api/v1/auth/me");
  },

  /** Discards the token. No server call — the backend exposes no /logout. */
  logout(): void {
    setAccessToken(null);
  },
};

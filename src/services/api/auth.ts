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

  /** The signed-in user. Used to restore a session after a reload. */
  me(): Promise<User> {
    return api.get<User>("/api/v1/auth/me");
  },

  /** Discards the token. No server call — the backend exposes no /logout. */
  logout(): void {
    setAccessToken(null);
  },
};

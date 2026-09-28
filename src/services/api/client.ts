import { ApiError, apiErrorFromResponse } from "./errors";

/**
 * The single HTTP client for the PARIVART backend.
 *
 * Everything that talks to the API goes through `request`, so base URL,
 * credentials, timeouts, JSON handling and error classification exist once.
 * Components never build an Authorization header or call fetch directly.
 *
 * Auth is a Bearer token: the backend declares an OAuth2PasswordBearer scheme
 * with tokenUrl /api/v1/auth/login, so there is no cookie session to ride on.
 */

/**
 * Base URL, from the environment — never hard-coded, so the same build can
 * point at a local or a deployed backend. Trailing slash is trimmed so callers
 * can always pass a leading-slash path.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

/** How long a single request may take before the client aborts it. */
const DEFAULT_TIMEOUT_MS = 20_000;

/** True when no backend URL is configured, so the UI can say so plainly. */
export const isApiConfigured = BASE_URL.length > 0;

export function apiBaseUrl(): string {
  return BASE_URL;
}

// --- token store -----------------------------------------------------------
//
// Held in memory, with sessionStorage as the reload survival mechanism. Not
// localStorage: that persists across tabs and browser restarts, which widens
// the window for a token lifted by XSS. The backend issues a Bearer token
// rather than an HttpOnly cookie, so the token has to live somewhere reachable
// by JS; sessionStorage is the narrower of the two options available.

const TOKEN_KEY = "parivart.access-token";

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private mode or storage disabled — the in-memory copy still works for
    // this page view.
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  try {
    accessToken = sessionStorage.getItem(TOKEN_KEY);
  } catch {
    accessToken = null;
  }
  return accessToken;
}

/**
 * Registers the single place that reacts to a 401: clearing auth state and
 * sending the user to sign-in. Centralised here so no call site has to.
 */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// --- request ---------------------------------------------------------------

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Serialised as JSON. Mutually exclusive with `form` and `body`. */
  json?: unknown;
  /** Serialised as application/x-www-form-urlencoded — the login endpoint. */
  form?: Record<string, string>;
  /** Passed through untouched — multipart uploads send a FormData here. */
  body?: BodyInit;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Overrides the default timeout for long operations. */
  timeoutMs?: number;
  /** Set false for endpoints that must not carry credentials. */
  authenticated?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query: RequestOptions["query"]): string {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Performs one API call and returns the parsed body.
 *
 * Throws ApiError for every failure mode — including network and timeout — so
 * callers have one error type to handle rather than a mix of TypeError,
 * DOMException and HTTP status codes.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    json,
    form,
    body,
    query,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    authenticated = true,
    signal,
  } = options;

  if (!isApiConfigured) {
    throw new ApiError({
      kind: "network",
      message: "No PARIVART API URL is configured. Set VITE_API_BASE_URL and reload.",
    });
  }

  const headers = new Headers();
  let payload: BodyInit | undefined;

  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(json);
  } else if (form) {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    payload = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    // FormData sets its own multipart boundary — deliberately no Content-Type.
    payload = body;
  }

  if (authenticated) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Accept", "application/json");

  // The caller's signal and our timeout both have to be able to abort.
  // Bare setTimeout, not window.setTimeout: this module is imported during
  // server rendering too, where `window` does not exist.
  const controller = new AbortController();
  const timer: ReturnType<typeof setTimeout> = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      signal: controller.signal,
    });
  } catch (cause) {
    // fetch rejects for aborts and for transport failures; the two need
    // different messages, and neither is an HTTP status.
    const aborted = controller.signal.aborted;
    throw new ApiError({
      kind: aborted && !signal?.aborted ? "timeout" : "network",
      // A browser cannot tell a genuine transport failure from a response it
      // blocked: a 5xx that escapes FastAPI's CORS middleware arrives with no
      // Access-Control-Allow-Origin and surfaces here as "Failed to fetch",
      // identical to the backend being down. The message covers both rather
      // than asserting the one we cannot distinguish.
      message:
        aborted && !signal?.aborted
          ? "The PARIVART API did not respond in time."
          : "Could not complete the request. The PARIVART API may be unreachable, " +
            "or it returned an error the browser blocked. Check the backend logs.",
      detail: cause instanceof Error ? cause.message : null,
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }

  if (!response.ok) {
    const error = await apiErrorFromResponse(response);
    // 401 means the credentials are gone or stale — drop them and let the app
    // send the user to sign in. 403 is NOT that: the user is authenticated and
    // simply lacks permission, so the session must survive it.
    if (error.kind === "unauthorized") {
      setAccessToken(null);
      onUnauthorized?.();
    }
    throw error;
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "POST" }),
  patch: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "PATCH" }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

/**
 * The API error model, typed from what the backend actually returns.
 *
 * PARIVART's backend is FastAPI, so failures come back as `{"detail": ...}` —
 * a string for HTTPException, or an array of validation objects for a 422.
 * It does NOT use the `{error: {code, message, details}}` envelope described
 * in the backend's own PARIVART_API_CONTRACT.md; that document does not match
 * the served schema. Typed against the schema, not the document.
 */

/** One entry of FastAPI's 422 body. Mirrors components.schemas.ValidationError. */
export interface FieldError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export type ApiErrorKind =
  | "network" // request never completed — offline, DNS, CORS, connection refused
  | "timeout" // client-side abort
  | "unauthorized" // 401 — no/expired credentials
  | "forbidden" // 403 — authenticated, not permitted
  | "not_found" // 404
  | "conflict" // 409
  | "validation" // 422
  | "rate_limited" // 429
  | "server" // 5xx
  | "http"; // any other non-2xx

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  /** FastAPI's parsed `detail`, when the body had one. */
  readonly detail: string | FieldError[] | null;
  /** Seconds from a Retry-After header, when the server sent one. */
  readonly retryAfter: number | null;

  constructor(init: {
    kind: ApiErrorKind;
    status?: number | null;
    message: string;
    detail?: string | FieldError[] | null;
    retryAfter?: number | null;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.kind = init.kind;
    this.status = init.status ?? null;
    this.detail = init.detail ?? null;
    this.retryAfter = init.retryAfter ?? null;
  }

  /** Field errors keyed by field name, for attaching messages to inputs. */
  get fieldErrors(): Record<string, string> {
    if (!Array.isArray(this.detail)) return {};
    const out: Record<string, string> = {};
    for (const item of this.detail) {
      // loc is like ["body", "user_in", "email"]; the last segment names the field.
      const field = item.loc.filter((part) => part !== "body").join(".");
      if (field) out[field] = item.msg;
    }
    return out;
  }
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "http";
}

/** A sentence to show a user. Never leaks a stack or a raw body. */
function messageForStatus(status: number, detail: string | FieldError[] | null): string {
  if (typeof detail === "string" && detail.trim()) return detail;
  switch (kindForStatus(status)) {
    case "unauthorized":
      return "Your session has expired. Sign in again to continue.";
    case "forbidden":
      return "You do not have permission to do this.";
    case "not_found":
      return "That record could not be found.";
    case "conflict":
      return "That change conflicts with the current state of the record.";
    case "validation":
      return "Some of the submitted values were rejected.";
    case "rate_limited":
      return "Too many requests. Wait a moment and try again.";
    case "server":
      return "The PARIVART API failed to complete this request.";
    default:
      return `Request failed with status ${status}.`;
  }
}

/** Builds an ApiError from a non-2xx Response, reading `detail` when present. */
export async function apiErrorFromResponse(response: Response): Promise<ApiError> {
  let detail: string | FieldError[] | null = null;
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "detail" in body) {
      const raw = (body as { detail: unknown }).detail;
      if (typeof raw === "string" || Array.isArray(raw)) {
        detail = raw as string | FieldError[];
      }
    }
  } catch {
    // Non-JSON body (an HTML error page, or empty). The status still classifies it.
  }

  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null;

  return new ApiError({
    kind: kindForStatus(response.status),
    status: response.status,
    message: messageForStatus(response.status, detail),
    detail,
    retryAfter: Number.isFinite(retryAfter) ? retryAfter : null,
  });
}

/** True when retrying could plausibly succeed. Used to gate query retries. */
export function isTransient(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.kind === "network" || error.kind === "timeout" || error.kind === "server";
}

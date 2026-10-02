import { api } from "./client";
import type {
  Action,
  ActionCreate,
  ActionStatus,
  ActionUpdate,
  Review,
  ReviewCreate,
} from "./types";
import type { PageParams } from "./portfolio";

/**
 * Human review and actions (backend Phase 7).
 *
 * These close the loop the rest of the app opens: an impact assessment is
 * produced by the engine, a person accepts or disputes it, and the work that
 * follows is tracked as actions against the individual matched entities.
 *
 * Both collections page with `skip`/`limit` and return a bare JSON array, the
 * same shape as portfolio and impact. The trailing slashes are exact, for the
 * same reason as everywhere else: `/reviews` redirects to `/reviews/` with a
 * 307 that can drop the Authorization header.
 *
 * The reviewer and the tenant are taken from the Bearer token by the backend,
 * never sent from here — there is deliberately no `reviewer_id` on the create
 * payload.
 */

export const reviewsApi = {
  list: (params: PageParams & { impact_assessment_id?: string; reviewer_id?: string } = {}) =>
    api.get<Review[]>("/api/v1/reviews/", { query: { ...params } }),

  get: (reviewId: string) => api.get<Review>(`/api/v1/reviews/${reviewId}`),

  /**
   * Files a decision against an assessment. The backend answers 409 when the
   * assessment exists but is not in a state that can carry a decision, and 404
   * when it does not exist or belongs to another tenant.
   */
  create: (body: ReviewCreate) => api.post<Review>("/api/v1/reviews/", { json: body }),

  // No update: the served schema exposes GET, POST and list only. A review is
  // a decision that was taken at a point in time, so the way to change the
  // position is to file another one, which is also the auditable way.
};

export const actionsApi = {
  list: (
    params: PageParams & {
      owner_id?: string;
      impact_item_id?: string;
      status?: ActionStatus;
      due_within_days?: number;
    } = {},
  ) => api.get<Action[]>("/api/v1/actions/", { query: { ...params } }),

  get: (actionId: string) => api.get<Action>(`/api/v1/actions/${actionId}`),

  create: (body: ActionCreate) => api.post<Action>("/api/v1/actions/", { json: body }),

  update: (actionId: string, body: ActionUpdate) =>
    api.patch<Action>(`/api/v1/actions/${actionId}`, { json: body }),

  /**
   * Status-only transition. Separate from `update` because the backend owns
   * the side effects of a status change — `completed_at` is stamped there, not
   * sent from here.
   */
  setStatus: (actionId: string, status: ActionStatus) =>
    api.patch<Action>(`/api/v1/actions/${actionId}/status`, { json: { status } }),
};

import type { PageParams } from "./portfolio";

/**
 * Query keys, in one place.
 *
 * Every key starts with a domain segment so a mutation can invalidate a whole
 * collection with a prefix match, and list keys carry their params so two
 * different filters do not share a cache entry.
 */
export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  portfolio: {
    all: ["portfolio"] as const,
    products: (params?: PageParams & { status?: string }) =>
      ["portfolio", "products", params ?? {}] as const,
    product: (id: string) => ["portfolio", "products", "detail", id] as const,
    markets: (params?: PageParams & { status?: string }) =>
      ["portfolio", "markets", params ?? {}] as const,
    market: (id: string) => ["portfolio", "markets", "detail", id] as const,
    processes: (params?: PageParams) => ["portfolio", "processes", params ?? {}] as const,
    process: (id: string) => ["portfolio", "processes", "detail", id] as const,
    controls: (params?: PageParams) => ["portfolio", "controls", params ?? {}] as const,
    control: (id: string) => ["portfolio", "controls", "detail", id] as const,
    registrations: (params?: PageParams) => ["portfolio", "registrations", params ?? {}] as const,
    registration: (id: string) => ["portfolio", "registrations", "detail", id] as const,
  },
  regulatory: {
    all: ["regulatory"] as const,
    authorities: (params?: PageParams) => ["regulatory", "authorities", params ?? {}] as const,
    authority: (id: string) => ["regulatory", "authorities", "detail", id] as const,
    sources: (params?: PageParams) => ["regulatory", "sources", params ?? {}] as const,
    source: (id: string) => ["regulatory", "sources", "detail", id] as const,
    sourceRuns: (id: string) => ["regulatory", "sources", id, "runs"] as const,
    run: (runId: string) => ["regulatory", "runs", runId] as const,
    documents: (params?: PageParams) => ["regulatory", "documents", params ?? {}] as const,
    document: (id: string) => ["regulatory", "documents", "detail", id] as const,
    documentStatus: (id: string) => ["regulatory", "documents", id, "status"] as const,
  },
  impact: {
    all: ["impact"] as const,
    list: (params?: PageParams & { regulatory_change_id?: string }) =>
      ["impact", "list", params ?? {}] as const,
    detail: (id: string) => ["impact", "detail", id] as const,
    items: (id: string) => ["impact", "detail", id, "items"] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    list: (params?: PageParams & { impact_assessment_id?: string; reviewer_id?: string }) =>
      ["reviews", "list", params ?? {}] as const,
    detail: (id: string) => ["reviews", "detail", id] as const,
  },
  actions: {
    all: ["actions"] as const,
    list: (
      params?: PageParams & {
        owner_id?: string;
        impact_item_id?: string;
        status?: string;
        due_within_days?: number;
      },
    ) => ["actions", "list", params ?? {}] as const,
    detail: (id: string) => ["actions", "detail", id] as const,
  },
  reports: {
    all: ["reports"] as const,
    list: (params?: PageParams) => ["reports", "list", params ?? {}] as const,
    detail: (id: string) => ["reports", "detail", id] as const,
    versions: (id: string) => ["reports", "detail", id, "versions"] as const,
  },
} as const;

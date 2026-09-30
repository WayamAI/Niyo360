import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  actionsApi,
  ApiError,
  auditApi,
  changesApi,
  evidenceApi,
  impactApi,
  isTransient,
  obligationsApi,
  portfolioApi,
  regulatoryApi,
  reportsApi,
  reviewsApi,
  isDocumentSettled,
  isIngestionSettled,
  type ActionStatus,
  type AuditFilters,
  type ChangeType,
  type ObligationCategory,
  type PageParams,
  type ProductStatus,
} from "@/services/api";
import { queryKeys } from "@/services/api/queryKeys";

/**
 * React Query bindings for the PARIVART API.
 *
 * The app already mounts a QueryClientProvider, so this is the one server
 * state layer — no second fetching mechanism.
 *
 * Retry policy: only GETs, and only for failures where retrying could work
 * (network, timeout, 5xx). A 401/403/404/422 is a settled answer and retrying
 * it just delays the error the user needs to see; a 429 is explicitly not
 * retried, so the client cannot amplify a rate limit.
 */
// Typed as Error, not unknown, so TError infers as React Query's default
// rather than widening every UseQueryResult in the app to `unknown`.
export function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) return false;
  return isTransient(error);
}

/**
 * Opt-in gate for a collection query.
 *
 * A collection hook is enabled by default, because most call sites want the
 * whole collection. A call site that only wants a *filtered* subset has a
 * different need: until it has the id to filter by, the correct number of
 * requests is zero. Passing `{}` instead would not express that — it asks for
 * the entire collection, which is both a wasted round trip and a cache entry
 * the filtered view can later be seeded from, showing counts that belong to
 * other records. Such a call site passes `{ enabled: Boolean(id) }`, matching
 * what the single-record hooks do with their own id.
 */
export type CollectionOptions = { enabled?: boolean };

const baseQuery = { retry: shouldRetry, staleTime: 30_000 } as const;

/** Polling cadence while a background job is still running. */
const POLL_INTERVAL_MS = 3_000;
/**
 * Hard ceiling on polling, so a job that never settles cannot leave a timer
 * running for the life of the session. At 3s this is ten minutes.
 */
const MAX_POLLS = 200;

// --- portfolio -------------------------------------------------------------

export function useProducts(params: PageParams & { status?: ProductStatus } = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.portfolio.products(params),
    queryFn: () => portfolioApi.products.list(params),
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.portfolio.product(id ?? ""),
    queryFn: () => portfolioApi.products.get(id!),
    enabled: Boolean(id),
  });
}

export function useMarkets(params: PageParams = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.portfolio.markets(params),
    queryFn: () => portfolioApi.markets.list(params),
  });
}

export function useProcesses(params: PageParams = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.portfolio.processes(params),
    queryFn: () => portfolioApi.processes.list(params),
  });
}

export function useControls(params: PageParams = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.portfolio.controls(params),
    queryFn: () => portfolioApi.controls.list(params),
  });
}

export function useRegistrations(params: PageParams = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.portfolio.registrations(params),
    queryFn: () => portfolioApi.registrations.list(params),
  });
}

export function useControl(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.portfolio.control(id ?? ""),
    queryFn: () => portfolioApi.controls.get(id!),
    enabled: Boolean(id),
  });
}

export function useRegistration(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.portfolio.registration(id ?? ""),
    queryFn: () => portfolioApi.registrations.get(id!),
    enabled: Boolean(id),
  });
}

// --- regulatory ------------------------------------------------------------

export function useAuthorities(params: PageParams = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.regulatory.authorities(params),
    queryFn: () => regulatoryApi.authorities.list(params),
  });
}

export function useSources(params: PageParams = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.regulatory.sources(params),
    queryFn: () => regulatoryApi.sources.list(params),
  });
}

export function useSourceRuns(sourceId: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.regulatory.sourceRuns(sourceId ?? ""),
    queryFn: () => regulatoryApi.sources.runs(sourceId!),
    enabled: Boolean(sourceId),
  });
}

export function useDocuments(params: PageParams = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.regulatory.documents(params),
    queryFn: () => regulatoryApi.documents.list(params),
  });
}

export function useDocument(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.regulatory.document(id ?? ""),
    queryFn: () => regulatoryApi.documents.get(id!),
    enabled: Boolean(id),
  });
}

/**
 * A document's pipeline state, polled while it is still moving.
 *
 * `refetchInterval` returns false once the status is terminal, which is what
 * stops the timer — React Query owns the interval and tears it down on
 * unmount, so there is no hand-rolled setInterval to leak. The poll counter is
 * a second stop condition for a job that never reaches a terminal state.
 */
export function useDocumentStatus(documentId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.regulatory.documentStatus(documentId ?? ""),
    queryFn: () => regulatoryApi.documents.status(documentId!),
    enabled: Boolean(documentId) && enabled,
    retry: shouldRetry,
    refetchInterval: (query) => {
      const status = query.state.data?.processing_status;
      if (status && isDocumentSettled(status)) return false;
      if (query.state.dataUpdateCount > MAX_POLLS) return false;
      return POLL_INTERVAL_MS;
    },
    // Without this the poll pauses when the tab is hidden, which is usually
    // what you want; a pipeline the user is watching is the exception.
    refetchIntervalInBackground: false,
  });
}

/** Same pattern for an ingestion run. */
export function useIngestionRun(runId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.regulatory.run(runId ?? ""),
    queryFn: () => regulatoryApi.sources.getRun(runId!),
    enabled: Boolean(runId) && enabled,
    retry: shouldRetry,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && isIngestionSettled(status)) return false;
      if (query.state.dataUpdateCount > MAX_POLLS) return false;
      return POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: false,
  });
}

// --- impact and reports ----------------------------------------------------

export function useImpactAssessments(params: PageParams & { regulatory_change_id?: string } = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.impact.list(params),
    queryFn: () => impactApi.list(params),
  });
}

export function useImpactAssessment(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.impact.detail(id ?? ""),
    queryFn: () => impactApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useImpactItems(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.impact.items(id ?? ""),
    queryFn: () => impactApi.items(id!),
    enabled: Boolean(id),
  });
}

export function useReports(params: PageParams = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.reports.list(params),
    queryFn: () => reportsApi.list(params),
  });
}

export function useReport(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.reports.detail(id ?? ""),
    queryFn: () => reportsApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useReportVersions(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.reports.versions(id ?? ""),
    queryFn: () => reportsApi.versions(id!),
    enabled: Boolean(id),
  });
}

// --- human review and actions (Phase 7) ------------------------------------

export function useReviews(
  params: PageParams & { impact_assessment_id?: string; reviewer_id?: string } = {},
  options: CollectionOptions = {},
) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.reviews.list(params),
    queryFn: () => reviewsApi.list(params),
    enabled: options.enabled ?? true,
  });
}

export function useReview(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.reviews.detail(id ?? ""),
    queryFn: () => reviewsApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useActions(
  params: PageParams & {
    owner_id?: string;
    impact_item_id?: string;
    status?: ActionStatus;
    due_within_days?: number;
  } = {},
  options: CollectionOptions = {},
) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.actions.list(params),
    queryFn: () => actionsApi.list(params),
    enabled: options.enabled ?? true,
  });
}

export function useAction(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.actions.detail(id ?? ""),
    queryFn: () => actionsApi.get(id!),
    enabled: Boolean(id),
  });
}

// --- regulatory intelligence -----------------------------------------------
//
// The "what changed / why does it matter" half of the chain. An assessment's
// `regulatory_change_id` is resolvable through these, so a drill-in can link
// to the change instead of dead-ending on an id.

export function useRegulatoryChanges(
  params: PageParams & { document_id?: string; change_type?: ChangeType } = {},
) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.changes.list(params),
    queryFn: () => changesApi.list(params),
  });
}

export function useRegulatoryChange(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.changes.detail(id ?? ""),
    queryFn: () => changesApi.get(id!),
    enabled: Boolean(id),
  });
}

/**
 * The obligations a change creates.
 *
 * The backend answers 404 for an unknown or cross-tenant change rather than an
 * empty array, so a caller can tell "requires nothing" from "cannot see it".
 */
export function useChangeObligations(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.changes.obligations(id ?? ""),
    queryFn: () => changesApi.obligations(id!),
    enabled: Boolean(id),
  });
}

export function useObligations(
  params: PageParams & {
    regulatory_change_id?: string;
    document_id?: string;
    category?: ObligationCategory;
  } = {},
) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.obligations.list(params),
    queryFn: () => obligationsApi.list(params),
  });
}

export function useObligation(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.obligations.detail(id ?? ""),
    queryFn: () => obligationsApi.get(id!),
    enabled: Boolean(id),
  });
}

// --- evidence ---------------------------------------------------------------

export function useEvidence(
  params: PageParams & { action_id?: string } = {},
  options: CollectionOptions = {},
) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.evidence.list(params),
    queryFn: () => evidenceApi.list(params),
    enabled: options.enabled ?? true,
  });
}

export function useEvidenceItem(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.evidence.detail(id ?? ""),
    queryFn: () => evidenceApi.get(id!),
    enabled: Boolean(id),
  });
}

// --- audit trail ------------------------------------------------------------

export function useAuditEvents(filters: AuditFilters = {}, options: CollectionOptions = {}) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.audit.list(filters),
    queryFn: () => auditApi.list(filters),
    enabled: options.enabled ?? true,
  });
}

export function useAuditEvent(id: string | null) {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.audit.detail(id ?? ""),
    queryFn: () => auditApi.get(id!),
    enabled: Boolean(id),
  });
}

/**
 * The event vocabulary the backend writes.
 *
 * Effectively static for the life of a backend build, so it is cached far
 * longer than the 30s default — refetching a fixed list on every screen visit
 * is a request that can never return anything new.
 */
export function useAuditEventTypes() {
  return useQuery({
    ...baseQuery,
    queryKey: queryKeys.audit.eventTypes(),
    queryFn: () => auditApi.eventTypes(),
    staleTime: 60 * 60_000,
  });
}

// --- mutations -------------------------------------------------------------
//
// Each invalidates the collection it changed. React Query's `isPending` is what
// call sites use to disable their trigger, so a double click cannot create two
// records — none of these are retried, because POST here is not idempotent.

function invalidate(client: QueryClient, key: readonly unknown[]) {
  return client.invalidateQueries({ queryKey: key });
}

export function useUploadDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ file, fields }: { file: File; fields?: Record<string, string> }) =>
      regulatoryApi.documents.upload(file, fields),
    retry: false,
    onSuccess: () => invalidate(client, queryKeys.regulatory.all),
  });
}

export function useProcessDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => regulatoryApi.documents.process(documentId),
    retry: false,
    onSuccess: (_data, documentId) => {
      invalidate(client, queryKeys.regulatory.documentStatus(documentId));
      invalidate(client, queryKeys.regulatory.all);
    },
  });
}

export function useRunSource() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => regulatoryApi.sources.run(sourceId),
    retry: false,
    onSuccess: (_run, sourceId) => {
      invalidate(client, queryKeys.regulatory.sourceRuns(sourceId));
      invalidate(client, queryKeys.regulatory.all);
    },
  });
}

export function useAnalyzeImpact() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: impactApi.analyze,
    retry: false,
    onSuccess: () => invalidate(client, queryKeys.impact.all),
  });
}

export function useReanalyzeImpact() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => impactApi.reanalyze(assessmentId),
    retry: false,
    onSuccess: (_data, assessmentId) => {
      invalidate(client, queryKeys.impact.detail(assessmentId));
      invalidate(client, queryKeys.impact.all);
    },
  });
}

export function useGenerateReport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.generate,
    retry: false,
    onSuccess: () => invalidate(client, queryKeys.reports.all),
  });
}

export function useCreateReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    retry: false,
    onSuccess: (review) => {
      invalidate(client, queryKeys.reviews.all);
      // A decision moves the assessment's own state, so its cached copy is
      // stale the moment the review lands.
      invalidate(client, queryKeys.impact.detail(review.impact_assessment_id));
      invalidate(client, queryKeys.impact.all);
    },
  });
}

export function useCreateAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: actionsApi.create,
    retry: false,
    onSuccess: () => invalidate(client, queryKeys.actions.all),
  });
}

export function useSetActionStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, status }: { actionId: string; status: ActionStatus }) =>
      actionsApi.setStatus(actionId, status),
    retry: false,
    onSuccess: (_action, { actionId }) => {
      invalidate(client, queryKeys.actions.detail(actionId));
      invalidate(client, queryKeys.actions.all);
    },
  });
}

/**
 * Attaches a file to an action.
 *
 * Invalidates the audit trail as well as the evidence collection, because the
 * upload writes an audit event server-side: leaving the trail cached would show
 * a history that is missing the thing the user just did.
 */
export function useUploadEvidence() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      actionId,
      description,
    }: {
      file: File;
      actionId: string;
      description?: string;
    }) => evidenceApi.upload(file, { action_id: actionId, description }),
    retry: false,
    onSuccess: () => {
      invalidate(client, queryKeys.evidence.all);
      invalidate(client, queryKeys.audit.all);
    },
  });
}

/** Narrows an unknown mutation/query error to the app's error type. */
export function asApiError(error: unknown): ApiError | null {
  return error instanceof ApiError ? error : null;
}

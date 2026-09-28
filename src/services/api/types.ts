import type { components } from "./schema";

/**
 * Names for the schema types the app uses.
 *
 * Every one of these is an alias into `schema.d.ts`, which is generated from
 * the backend's served OpenAPI document — so none of it is hand-maintained and
 * it cannot drift from the API without regeneration showing a type error.
 * Regenerate with `npm run api:types`.
 */
type S = components["schemas"];

// --- auth ------------------------------------------------------------------
export type TokenResponse = S["TokenResponse"];
export type User = S["UserResponse"];
export type UserRole = S["UserRole"];
export type UserCreate = S["UserCreate"];
export type OrganizationCreate = S["OrganizationCreate"];

// --- portfolio -------------------------------------------------------------
export type Product = S["ProductResponse"];
export type ProductCreate = S["ProductCreate"];
export type ProductUpdate = S["ProductUpdate"];
export type ProductStatus = S["ProductStatus"];

export type Market = S["MarketResponse"];
export type MarketCreate = S["MarketCreate"];
export type MarketUpdate = S["MarketUpdate"];
export type MarketStatus = S["MarketStatus"];

export type Process = S["ProcessResponse"];
export type ProcessCreate = S["ProcessCreate"];
export type ProcessUpdate = S["ProcessUpdate"];

export type Control = S["ControlResponse"];
export type ControlCreate = S["ControlCreate"];
export type ControlUpdate = S["ControlUpdate"];
export type ControlCategory = S["ControlCategory"];
export type ControlStatus = S["ControlStatus"];

export type Registration = S["RegistrationResponse"];
export type RegistrationCreate = S["RegistrationCreate"];
export type RegistrationUpdate = S["RegistrationUpdate"];
export type RegistrationStatus = S["RegistrationStatus"];

// --- regulatory ------------------------------------------------------------
export type Authority = S["AuthorityResponse"];
export type AuthorityCreate = S["AuthorityCreate"];
export type AuthorityUpdate = S["AuthorityUpdate"];

export type Source = S["SourceResponse"];
export type SourceCreate = S["SourceCreate"];
export type SourceUpdate = S["SourceUpdate"];
export type SourceType = S["SourceType"];
export type ConnectorType = S["ConnectorType"];

export type IngestionRun = S["IngestionRunResponse"];
export type IngestionStatus = S["IngestionStatus"];

export type RegulatoryDocument = S["DocumentResponse"];
export type DocumentUploadResult = S["DocumentUploadResponse"];
export type DocumentProcessingStatus = S["DocumentProcessingStatus"];
export type DocumentType = S["DocumentType"];

// --- impact ----------------------------------------------------------------
export type ImpactAssessment = S["ImpactAssessmentResponse"];
export type ImpactAssessmentCreate = S["ImpactAssessmentCreate"];
export type ImpactAssessmentStatus = S["ImpactAssessmentStatus"];
export type ImpactItem = S["ImpactItemResponse"];
export type ImpactLevel = S["ImpactLevel"];

// --- reports ---------------------------------------------------------------
export type ImpactReport = S["ImpactReportResponse"];
export type ImpactReportCreate = S["ImpactReportCreate"];
export type ImpactReportStatus = S["ImpactReportStatus"];

/**
 * Terminal states, used to stop polling. Taken from the served enums, not
 * assumed: the document pipeline ends at ANALYZED or FAILED — there is no
 * "COMPLETED" state, despite that being the obvious guess.
 */
export const TERMINAL_DOCUMENT_STATES: readonly DocumentProcessingStatus[] = [
  "ANALYZED",
  "FAILED",
] as const;

export const TERMINAL_INGESTION_STATES: readonly IngestionStatus[] = [
  "COMPLETED",
  "PARTIAL",
  "FAILED",
] as const;

export function isDocumentSettled(status: DocumentProcessingStatus): boolean {
  return TERMINAL_DOCUMENT_STATES.includes(status);
}

export function isIngestionSettled(status: IngestionStatus): boolean {
  return TERMINAL_INGESTION_STATES.includes(status);
}

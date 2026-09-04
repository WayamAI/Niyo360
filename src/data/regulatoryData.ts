// Regulatory Change Intelligence (Pillar 01) — full spec data set.
// Mirrors section 9 of the Niyo360 Regulatory Change Intelligence Module spec.

export type AuthorityCode = "FDA" | "EMA" | "MHRA" | "CDSCO" | "TGA" | "ANVISA";
export type FilingType = "IA" | "IB" | "II" | "NDA" | "None" | "TBD";
export type EventStage = "Detected" | "Processing" | "Mapped" | "Under Review" | "Filed" | "Closed";
export type ReportStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Overridden"
  | "Filed"
  | "Closed"
  | "No Action"
  | "Detected";

export interface AuthorityInfo {
  id: AuthorityCode;
  name: string;
  country: string;
  color: string;
  url: string;
}

export const AUTHORITIES: Record<AuthorityCode, AuthorityInfo> = {
  FDA: {
    id: "FDA",
    name: "U.S. Food and Drug Administration",
    country: "United States",
    color: "var(--data-01)",
    url: "https://www.fda.gov",
  },
  EMA: {
    id: "EMA",
    name: "European Medicines Agency",
    country: "European Union",
    color: "var(--data-02)",
    url: "https://www.ema.europa.eu",
  },
  MHRA: {
    id: "MHRA",
    name: "Medicines and Healthcare products Regulatory Agency",
    country: "United Kingdom",
    color: "var(--data-03)",
    url: "https://www.gov.uk/government/organisations/mhra",
  },
  CDSCO: {
    id: "CDSCO",
    name: "Central Drugs Standard Control Organisation",
    country: "India",
    color: "var(--data-04)",
    url: "https://cdsco.gov.in",
  },
  TGA: {
    id: "TGA",
    name: "Therapeutic Goods Administration",
    country: "Australia",
    color: "var(--data-05)",
    url: "https://www.tga.gov.au",
  },
  ANVISA: {
    id: "ANVISA",
    name: "Agência Nacional de Vigilância Sanitária",
    country: "Brazil",
    color: "var(--data-06)",
    url: "https://www.gov.br/anvisa",
  },
};

export interface RegProduct {
  id: string;
  name: string;
  activeSubstance: string;
  therapeuticArea: string;
  dosageForm: string;
  markets: string[];
  dossierVersion: string;
}

export const REG_PRODUCTS: RegProduct[] = [
  {
    id: "MPG-001",
    name: "Cardivex 5mg",
    activeSubstance: "Amlodipine besylate",
    therapeuticArea: "Cardiovascular",
    dosageForm: "Oral solid — film-coated tablet",
    markets: ["EU", "UK", "IN", "AU", "BR"],
    dossierVersion: "CTD 4.2",
  },
  {
    id: "MPG-002",
    name: "Cardivex 10mg",
    activeSubstance: "Amlodipine besylate",
    therapeuticArea: "Cardiovascular",
    dosageForm: "Oral solid — film-coated tablet",
    markets: ["EU", "UK", "IN", "AU"],
    dossierVersion: "CTD 4.2",
  },
  {
    id: "MPG-003",
    name: "Respira 200mcg Inhaler",
    activeSubstance: "Budesonide",
    therapeuticArea: "Respiratory",
    dosageForm: "Inhalation — pressurised metered-dose inhaler",
    markets: ["EU", "UK", "US", "AU"],
    dossierVersion: "CTD 3.1",
  },
  {
    id: "MPG-004",
    name: "Respira 400mcg Inhaler",
    activeSubstance: "Budesonide",
    therapeuticArea: "Respiratory",
    dosageForm: "Inhalation — pressurised metered-dose inhaler",
    markets: ["EU", "UK"],
    dossierVersion: "CTD 3.1",
  },
  {
    id: "MPG-005",
    name: "Oncovax-RL 50mg",
    activeSubstance: "Ribociclib",
    therapeuticArea: "Oncology",
    dosageForm: "Oral solid — capsule",
    markets: ["EU", "US", "UK"],
    dossierVersion: "CTD 5.0",
  },
  {
    id: "MPG-006",
    name: "Oncovax-RL 100mg",
    activeSubstance: "Ribociclib",
    therapeuticArea: "Oncology",
    dosageForm: "Oral solid — capsule",
    markets: ["EU", "US"],
    dossierVersion: "CTD 5.0",
  },
  {
    id: "MPG-007",
    name: "Diabetex 500mg",
    activeSubstance: "Metformin hydrochloride",
    therapeuticArea: "Endocrinology — Diabetes",
    dosageForm: "Oral solid — extended-release tablet",
    markets: ["EU", "UK", "IN", "AU", "BR", "US"],
    dossierVersion: "CTD 3.2",
  },
  {
    id: "MPG-008",
    name: "Neurix 25mg",
    activeSubstance: "Pregabalin",
    therapeuticArea: "Neurology — Neuropathic Pain",
    dosageForm: "Oral solid — capsule",
    markets: ["EU", "UK", "AU"],
    dossierVersion: "CTD 4.1",
  },
  {
    id: "MPG-009",
    name: "Infectex 500mg IV",
    activeSubstance: "Meropenem",
    therapeuticArea: "Infectious Disease",
    dosageForm: "Parenteral — powder for infusion",
    markets: ["EU", "UK", "IN"],
    dossierVersion: "CTD 2.1",
  },
  {
    id: "MPG-010",
    name: "Osteomax 70mg",
    activeSubstance: "Alendronic acid",
    therapeuticArea: "Musculoskeletal",
    dosageForm: "Oral solid — tablet",
    markets: ["EU", "UK", "AU", "BR"],
    dossierVersion: "CTD 3.0",
  },
];
export const REG_PRODUCT_BY_ID = (id: string) => REG_PRODUCTS.find((p) => p.id === id);

export interface ConfidenceBreakdown {
  guidelineInterpretation: number;
  productImpactMapping: number;
  filingTypeClassification: number;
  deadlineCalculation: number | null;
}

export interface FeedEvent {
  id: string;
  authority: AuthorityCode;
  title: string;
  documentRef: string;
  publishedDate: string;
  documentUrl: string;
  summary: string;
  stage: EventStage;
  filingType: FilingType;
  affectedProductIds: string[];
  affectedMarkets: string[];
  deadlineDate: string | null;
  responsibleAffiliate: string | null;
  confidenceScore: number | null;
  confidenceBreakdown: ConfidenceBreakdown | null;
  reportId: string | null;
  status: ReportStatus;
  urgencyFlag?: boolean;
}

export const FEED_EVENTS: FeedEvent[] = [
  {
    id: "FEED-2025-0041",
    authority: "EMA",
    title:
      "Guideline on Excipients in the Labelling and Package Leaflet of Medicinal Products — Revision 2",
    documentRef: "EMA/CHMP/QWP/185401/2004 Rev.2",
    publishedDate: "2025-05-21",
    documentUrl: "https://www.ema.europa.eu/documents/scientific-guideline",
    summary:
      "Revised EMA guidance requires updated labelling for all medicinal products containing excipients listed in Annex II (e.g. lactose, benzalkonium chloride, propylene glycol). Products approved before 2019 must submit a Type IB labelling variation. The revision adds 12 new excipients to the mandatory disclosure list and updates threshold concentrations for 8 existing substances.",
    stage: "Mapped",
    filingType: "IB",
    affectedProductIds: [
      "MPG-001",
      "MPG-002",
      "MPG-003",
      "MPG-007",
      "MPG-008",
      "MPG-009",
      "MPG-010",
    ],
    affectedMarkets: ["EU", "UK"],
    deadlineDate: "2025-07-12",
    responsibleAffiliate: "AFF-EU",
    confidenceScore: 91,
    confidenceBreakdown: {
      guidelineInterpretation: 94,
      productImpactMapping: 89,
      filingTypeClassification: 91,
      deadlineCalculation: 90,
    },
    reportId: "IDR-2025-0041",
    status: "Under Review",
  },
  {
    id: "FEED-2025-0040",
    authority: "FDA",
    title:
      "Guidance for Industry — Dissolution Testing of Immediate-Release Solid Oral Dosage Forms (Revised)",
    documentRef: "FDA-2025-D-0214",
    publishedDate: "2025-05-19",
    documentUrl: "https://www.fda.gov/regulatory-information",
    summary:
      "FDA revised dissolution testing guidance imposes updated methodology requirements for all marketed immediate-release oral solid dosage forms. Sponsors must assess existing dissolution specifications against Apparatus II (paddle) at 50 rpm with revised media pH requirements. Products not meeting updated criteria require a Prior Approval Supplement (PAS) with reformulation data.",
    stage: "Mapped",
    filingType: "NDA",
    affectedProductIds: ["MPG-001", "MPG-002", "MPG-007", "MPG-010"],
    affectedMarkets: ["US"],
    deadlineDate: "2025-08-19",
    responsibleAffiliate: "AFF-US",
    confidenceScore: 88,
    confidenceBreakdown: {
      guidelineInterpretation: 90,
      productImpactMapping: 85,
      filingTypeClassification: 88,
      deadlineCalculation: 92,
    },
    reportId: "IDR-2025-0040",
    status: "Approved",
  },
  {
    id: "FEED-2025-0039",
    authority: "MHRA",
    title:
      "Variation Procedure — Update to UK Specific Product Characteristics Requirements Post-Brexit Transitional Period",
    documentRef: "MHRA-REG-2025-008",
    publishedDate: "2025-05-15",
    documentUrl: "https://www.gov.uk/government/publications/medicines-guidance",
    summary:
      "MHRA requires all products approved under EU centralised procedure before 31 December 2023 to update SmPCs to reflect UK-specific national requirements, including UK contact addresses, updated benefit-risk statements, and revised post-marketing surveillance obligations. Failure to submit by the deadline will result in suspension of UK marketing authorisation.",
    stage: "Mapped",
    filingType: "IB",
    affectedProductIds: [
      "MPG-001",
      "MPG-002",
      "MPG-003",
      "MPG-004",
      "MPG-005",
      "MPG-008",
      "MPG-010",
    ],
    affectedMarkets: ["UK"],
    deadlineDate: "2025-06-30",
    responsibleAffiliate: "AFF-UK",
    confidenceScore: 95,
    confidenceBreakdown: {
      guidelineInterpretation: 97,
      productImpactMapping: 93,
      filingTypeClassification: 96,
      deadlineCalculation: 95,
    },
    reportId: "IDR-2025-0039",
    status: "Under Review",
    urgencyFlag: true,
  },
  {
    id: "FEED-2025-0038",
    authority: "CDSCO",
    title: "eCTD Submission Mandate — Phase 3 Extension to All New Drug Applications",
    documentRef: "CDSCO-CIR-2025-042",
    publishedDate: "2025-05-10",
    documentUrl: "https://cdsco.gov.in/opencms/opencms/en/Guidance_Documents",
    summary:
      "CDSCO extends mandatory eCTD submission format to all new drug applications, including new indications and variations for currently marketed products. Non-eCTD submissions will be rejected from 1 October 2025. Sponsors using legacy paper-based dossiers must convert and resubmit under eCTD format for any variation filed after this date.",
    stage: "Mapped",
    filingType: "IA",
    affectedProductIds: ["MPG-001", "MPG-002", "MPG-007", "MPG-009"],
    affectedMarkets: ["IN"],
    deadlineDate: "2025-10-01",
    responsibleAffiliate: "AFF-APAC",
    confidenceScore: 82,
    confidenceBreakdown: {
      guidelineInterpretation: 85,
      productImpactMapping: 79,
      filingTypeClassification: 83,
      deadlineCalculation: 82,
    },
    reportId: "IDR-2025-0038",
    status: "Draft",
  },
  {
    id: "FEED-2025-0037",
    authority: "EMA",
    title: "Reflection Paper on the Use of Artificial Intelligence in the Lifecycle of Medicines",
    documentRef: "EMA/83256/2023",
    publishedDate: "2025-05-08",
    documentUrl: "https://www.ema.europa.eu/en/documents/scientific-guideline",
    summary:
      "EMA reflection paper clarifies expectations for sponsors using AI/ML in drug development, clinical data analysis, and post-market surveillance. The paper does not impose new filing obligations but requires sponsors to maintain AI system documentation in their quality management systems. An impact assessment is recommended for all products where AI tools inform regulatory dossier content.",
    stage: "Mapped",
    filingType: "None",
    affectedProductIds: [],
    affectedMarkets: ["EU"],
    deadlineDate: null,
    responsibleAffiliate: "AFF-EU",
    confidenceScore: 78,
    confidenceBreakdown: {
      guidelineInterpretation: 82,
      productImpactMapping: 74,
      filingTypeClassification: 77,
      deadlineCalculation: null,
    },
    reportId: "IDR-2025-0037",
    status: "No Action",
  },
  {
    id: "FEED-2025-0036",
    authority: "FDA",
    title:
      "Updated Guidance on Container Closure System Compatibility for Parenteral Drug Products",
    documentRef: "FDA-2025-D-0189",
    publishedDate: "2025-05-05",
    documentUrl: "https://www.fda.gov/regulatory-information",
    summary:
      "Revised FDA guidance requires sponsors of parenteral drug products to conduct updated extractables and leachables studies for container closure systems. Products approved prior to 2015 with glass primary packaging must submit a Prior Approval Supplement with updated compatibility data within 18 months.",
    stage: "Mapped",
    filingType: "NDA",
    affectedProductIds: ["MPG-009"],
    affectedMarkets: ["US"],
    deadlineDate: "2026-11-05",
    responsibleAffiliate: "AFF-US",
    confidenceScore: 87,
    confidenceBreakdown: {
      guidelineInterpretation: 89,
      productImpactMapping: 85,
      filingTypeClassification: 88,
      deadlineCalculation: 87,
    },
    reportId: "IDR-2025-0036",
    status: "Approved",
  },
  {
    id: "FEED-2025-0035",
    authority: "TGA",
    title: "Therapeutic Goods (Standard for Tablets, Capsules and Pills) Amendment",
    documentRef: "TGA-2025-REG-004",
    publishedDate: "2025-04-28",
    documentUrl: "https://www.tga.gov.au/resources/publication",
    summary:
      "TGA amends the Australian standard for oral solid dosage forms to align with Ph. Eur. and BP specifications for disintegration and dissolution. Sponsors with currently registered products must conduct a comparability assessment and, where non-compliant, file a Category 3 (minor) variation within 12 months.",
    stage: "Filed",
    filingType: "IA",
    affectedProductIds: ["MPG-001", "MPG-002", "MPG-007", "MPG-008", "MPG-010"],
    affectedMarkets: ["AU"],
    deadlineDate: "2026-04-28",
    responsibleAffiliate: "AFF-APAC",
    confidenceScore: 93,
    confidenceBreakdown: {
      guidelineInterpretation: 95,
      productImpactMapping: 91,
      filingTypeClassification: 94,
      deadlineCalculation: 93,
    },
    reportId: "IDR-2025-0035",
    status: "Filed",
  },
  {
    id: "FEED-2025-0034",
    authority: "EMA",
    title:
      "ICH Q12 Technical and Regulatory Considerations for Pharmaceutical Product Lifecycle Management — Implementation Guidance",
    documentRef: "EMA/CHMP/ICH/804273/2021",
    publishedDate: "2025-04-22",
    documentUrl: "https://www.ema.europa.eu/en/documents/scientific-guideline",
    summary:
      "EMA finalises the EU implementation guidance for ICH Q12, enabling sponsors to use post-approval change management protocols (PACMPs) and established conditions (ECs) to manage lifecycle changes with reduced regulatory submissions.",
    stage: "Mapped",
    filingType: "IA",
    affectedProductIds: ["MPG-003", "MPG-004", "MPG-005", "MPG-006"],
    affectedMarkets: ["EU", "UK"],
    deadlineDate: "2025-10-22",
    responsibleAffiliate: "AFF-EU",
    confidenceScore: 76,
    confidenceBreakdown: {
      guidelineInterpretation: 80,
      productImpactMapping: 71,
      filingTypeClassification: 75,
      deadlineCalculation: 79,
    },
    reportId: "IDR-2025-0034",
    status: "Draft",
  },
  {
    id: "FEED-2025-0033",
    authority: "ANVISA",
    title:
      "RDC 204/2025 — Updated Requirements for Post-Approval Variations of Registered Pharmaceutical Products",
    documentRef: "ANVISA-RDC-204-2025",
    publishedDate: "2025-04-15",
    documentUrl: "https://www.gov.br/anvisa/pt-br",
    summary:
      "ANVISA updates post-approval variation requirements for all registered pharmaceutical products in Brazil. New requirements for stability data and analytical method validation. Affected products must submit updated technical dossier within 90 days of guideline effective date.",
    stage: "Mapped",
    filingType: "IB",
    affectedProductIds: ["MPG-001", "MPG-007", "MPG-010"],
    affectedMarkets: ["BR"],
    deadlineDate: "2025-07-15",
    responsibleAffiliate: "AFF-LATAM",
    confidenceScore: 86,
    confidenceBreakdown: {
      guidelineInterpretation: 88,
      productImpactMapping: 84,
      filingTypeClassification: 86,
      deadlineCalculation: 87,
    },
    reportId: "IDR-2025-0033",
    status: "Under Review",
  },
  {
    id: "FEED-2025-0032",
    authority: "FDA",
    title: "Pharmaceutical Quality / Manufacturing Standards (CGMP) — Annual Industry Update",
    documentRef: "FDA-2025-D-0156",
    publishedDate: "2025-04-10",
    documentUrl: "https://www.fda.gov/regulatory-information",
    summary:
      "Annual FDA update to CGMP expectations. Clarifies inspection scope for combination products and data integrity expectations for electronic batch records. No filing obligations; sponsors must update internal quality manuals.",
    stage: "Closed",
    filingType: "None",
    affectedProductIds: [],
    affectedMarkets: ["US"],
    deadlineDate: null,
    responsibleAffiliate: "AFF-US",
    confidenceScore: 80,
    confidenceBreakdown: {
      guidelineInterpretation: 84,
      productImpactMapping: 76,
      filingTypeClassification: 80,
      deadlineCalculation: null,
    },
    reportId: "IDR-2025-0032",
    status: "No Action",
  },
  {
    id: "FEED-2025-0031",
    authority: "MHRA",
    title:
      "Guidance on Real-World Evidence Submissions Supporting Post-Authorisation Efficacy Studies",
    documentRef: "MHRA-GUID-2025-006",
    publishedDate: "2025-04-04",
    documentUrl: "https://www.gov.uk/government/publications/medicines-guidance",
    summary:
      "MHRA issues guidance on the use of real-world evidence (RWE) for post-authorisation efficacy studies. Optional pathway, no mandatory filing.",
    stage: "Mapped",
    filingType: "None",
    affectedProductIds: ["MPG-005", "MPG-006"],
    affectedMarkets: ["UK"],
    deadlineDate: null,
    responsibleAffiliate: "AFF-UK",
    confidenceScore: 88,
    confidenceBreakdown: {
      guidelineInterpretation: 91,
      productImpactMapping: 86,
      filingTypeClassification: 87,
      deadlineCalculation: null,
    },
    reportId: "IDR-2025-0031",
    status: "No Action",
  },
  {
    id: "FEED-2025-0030",
    authority: "MHRA",
    title:
      "Post-Brexit Pharmacovigilance Reporting — Updated SUSAR and PSUR Submission Requirements",
    documentRef: "MHRA-PV-2025-002",
    publishedDate: "2025-03-28",
    documentUrl: "https://www.gov.uk/government/publications/medicines-guidance",
    summary:
      "MHRA updates UK-specific requirements for SUSAR and PSUR submissions, requiring UK-specific addenda for all products registered via the MHRA national procedure. Sponsors must appoint a UK Pharmacovigilance Contact Person (PVCP) and update MHRA within 30 days.",
    stage: "Filed",
    filingType: "IA",
    affectedProductIds: ["MPG-001", "MPG-002", "MPG-003", "MPG-004", "MPG-005", "MPG-008"],
    affectedMarkets: ["UK"],
    deadlineDate: "2025-07-01",
    responsibleAffiliate: "AFF-UK",
    confidenceScore: 96,
    confidenceBreakdown: {
      guidelineInterpretation: 98,
      productImpactMapping: 95,
      filingTypeClassification: 96,
      deadlineCalculation: 97,
    },
    reportId: "IDR-2025-0030",
    status: "Filed",
  },
  {
    id: "FEED-2025-0029",
    authority: "TGA",
    title: "Guidance on Stability Testing Requirements for Registration of Medicines in Australia",
    documentRef: "TGA-2025-GUID-012",
    publishedDate: "2025-03-20",
    documentUrl: "https://www.tga.gov.au/resources/publication",
    summary:
      "TGA updates stability testing requirements to align with ICH Q1A(R2) and adopts mean kinetic temperature requirements for products stored in non-refrigerated conditions in Australian climate zones.",
    stage: "Detected",
    filingType: "TBD",
    affectedProductIds: [],
    affectedMarkets: ["AU"],
    deadlineDate: null,
    responsibleAffiliate: null,
    confidenceScore: null,
    confidenceBreakdown: null,
    reportId: null,
    status: "Detected",
  },
  {
    id: "FEED-2025-0028",
    authority: "EMA",
    title: "ICH E6(R3) Good Clinical Practice Guideline — Final Implementation Guidance",
    documentRef: "EMA/CHMP/ICH/135/1995",
    publishedDate: "2025-03-14",
    documentUrl: "https://www.ema.europa.eu/en/documents/scientific-guideline",
    summary:
      "EMA finalises implementation guidance for ICH E6(R3) GCP, updating requirements for clinical trial oversight, monitoring, and data integrity.",
    stage: "Closed",
    filingType: "IA",
    affectedProductIds: ["MPG-005", "MPG-006"],
    affectedMarkets: ["EU", "UK"],
    deadlineDate: "2025-03-14",
    responsibleAffiliate: "AFF-EU",
    confidenceScore: 85,
    confidenceBreakdown: {
      guidelineInterpretation: 88,
      productImpactMapping: 82,
      filingTypeClassification: 85,
      deadlineCalculation: 86,
    },
    reportId: "IDR-2025-0028",
    status: "Closed",
  },
];

export const FEED_KPIS = {
  newThisWeek: 14,
  newThisWeekDelta: 3,
  processingNow: 3,
  reportsGenerated: 11,
  reportsGeneratedOfTotal: 14,
  overdueOrAtRisk: 2,
  avgConfidenceScore: 85,
  agentItemsToday: 6,
  lastSyncMinutesAgo: 2,
};

export interface RAAffiliate {
  id: string;
  name: string;
  region: string;
  location: string;
  lead: string;
  initials: string;
  email: string;
}
export const RA_AFFILIATES: RAAffiliate[] = [
  {
    id: "AFF-EU",
    name: "EU Regulatory Affairs",
    region: "Europe",
    location: "Basel, Switzerland",
    lead: "Dr. Sophie Renard",
    initials: "SR",
    email: "s.renard@meridianpharma.com",
  },
  {
    id: "AFF-UK",
    name: "UK Regulatory Affairs",
    region: "United Kingdom",
    location: "London, UK",
    lead: "James Whitfield",
    initials: "JW",
    email: "j.whitfield@meridianpharma.com",
  },
  {
    id: "AFF-US",
    name: "US Regulatory Affairs",
    region: "North America",
    location: "New Jersey, USA",
    lead: "Patricia Chen",
    initials: "PC",
    email: "p.chen@meridianpharma.com",
  },
  {
    id: "AFF-APAC",
    name: "APAC Regulatory Affairs",
    region: "Asia-Pacific",
    location: "Singapore",
    lead: "Rajan Mehta",
    initials: "RM",
    email: "r.mehta@meridianpharma.com",
  },
  {
    id: "AFF-LATAM",
    name: "LatAm Regulatory Affairs",
    region: "Latin America",
    location: "São Paulo, Brazil",
    lead: "Ana Lima",
    initials: "AL",
    email: "a.lima@meridianpharma.com",
  },
];
export const AFFILIATE_BY_ID = (id: string | null) =>
  id ? RA_AFFILIATES.find((a) => a.id === id) : undefined;

export const MONTHLY_ACTIVITY = [
  { month: "Dec 2024", newEvents: 8, reportsGenerated: 7, filed: 5, closed: 4 },
  { month: "Jan 2025", newEvents: 11, reportsGenerated: 9, filed: 7, closed: 6 },
  { month: "Feb 2025", newEvents: 9, reportsGenerated: 8, filed: 6, closed: 8 },
  { month: "Mar 2025", newEvents: 13, reportsGenerated: 11, filed: 9, closed: 7 },
  { month: "Apr 2025", newEvents: 12, reportsGenerated: 10, filed: 8, closed: 10 },
  { month: "May 2025", newEvents: 14, reportsGenerated: 11, filed: 3, closed: 1 },
];

export interface ReasoningStep {
  stepNumber: number;
  title: string;
  detail: string;
  confidence: number | null;
  timestamp: string;
}
export const DEFAULT_REASONING: ReasoningStep[] = [
  {
    stepNumber: 1,
    title: "Feed ingestion",
    detail:
      "Document fetched and parsed. Text extraction complete across all pages with table and footnote preservation.",
    confidence: null,
    timestamp: "08:28",
  },
  {
    stepNumber: 2,
    title: "Guideline interpretation",
    detail:
      "Summarised into key change areas. Scope and applicability classified against EMA / FDA / MHRA taxonomies.",
    confidence: 94,
    timestamp: "08:30",
  },
  {
    stepNumber: 3,
    title: "Product impact mapping",
    detail:
      "Queried product-market matrix. Matched affected products across therapeutic areas using semantic similarity (cosine ≥ 0.87).",
    confidence: 89,
    timestamp: "08:31",
  },
  {
    stepNumber: 4,
    title: "Filing type classification",
    detail:
      "Applied EMA Variation Regulation EC 1234/2008. Labelling change to excipient section classified as Type IB (minor variation, 30-day assessment).",
    confidence: 91,
    timestamp: "08:31",
  },
  {
    stepNumber: 5,
    title: "Deadline extraction",
    detail:
      "Guideline effective date extracted. Filing deadline computed using 60-day prior-notice window per jurisdiction calendar.",
    confidence: 90,
    timestamp: "08:32",
  },
];

export interface AuditEvent {
  ts: string;
  actor: string;
  type: "agent" | "user" | "system" | "notification" | "ingestion";
  message: string;
}
export const REPORT_AUDIT_TRAIL: AuditEvent[] = [
  {
    ts: "2025-05-22 08:28",
    actor: "System",
    type: "ingestion",
    message: "Feed event FEED-2025-0041 detected from EMA RSS feed.",
  },
  {
    ts: "2025-05-22 08:29",
    actor: "Regulatory Intelligence Agent",
    type: "agent",
    message: "Document fetched (48 pages). Text extraction complete.",
  },
  {
    ts: "2025-05-22 08:30",
    actor: "Regulatory Intelligence Agent",
    type: "agent",
    message: "Guideline summary generated. 3 key change areas identified. Confidence: 94%.",
  },
  {
    ts: "2025-05-22 08:31",
    actor: "Regulatory Intelligence Agent",
    type: "agent",
    message:
      "Product impact mapping complete. 7 products matched across cardiovascular, respiratory, and metabolic disease areas. Confidence: 89%.",
  },
  {
    ts: "2025-05-22 08:31",
    actor: "Regulatory Intelligence Agent",
    type: "agent",
    message:
      "Filing type classified as Type IB variation. Reference: EMA Regulation EC 1234/2008, Annex I. Confidence: 91%.",
  },
  {
    ts: "2025-05-22 08:32",
    actor: "Regulatory Intelligence Agent",
    type: "agent",
    message:
      "Deadline calculated: 12 July 2025 (60-day window from EMA guideline effective date). Confidence: 90%.",
  },
  {
    ts: "2025-05-22 08:32",
    actor: "System",
    type: "system",
    message: "Impact Delta Report IDR-2025-0041 generated. Status set to Draft.",
  },
  {
    ts: "2025-05-22 08:33",
    actor: "System",
    type: "notification",
    message:
      "Alert dispatched to EU Regulatory Affairs — Basel (Dr. Sophie Renard). Email + Slack.",
  },
  {
    ts: "2025-05-22 09:15",
    actor: "Dr. Sophie Renard",
    type: "user",
    message: "Report IDR-2025-0041 opened. Status updated to Under Review.",
  },
  {
    ts: "2025-05-22 09:47",
    actor: "Dr. Sophie Renard",
    type: "user",
    message:
      "Product impact list reviewed. MPG-004 (Respira 400mcg) removed from affected list — formulation does not contain affected excipients. Override logged.",
  },
  {
    ts: "2025-05-22 10:02",
    actor: "Dr. Sophie Renard",
    type: "user",
    message: "Report returned to Under Review pending affiliate confirmation from UK team.",
  },
  {
    ts: "2025-05-22 14:30",
    actor: "James Whitfield",
    type: "user",
    message:
      "UK affiliate review complete. Affected product list confirmed. Recommend proceeding with IB variation.",
  },
];

export function filingTypeExplanation(t: FilingType): string {
  switch (t) {
    case "IA":
      return 'Type IA — minor variation of administrative nature. "Do and tell" notification with annual reporting. Minimal documentation required.';
    case "IB":
      return "Type IB — minor variation with prior notification (30-day assessment window). Requires updated SmPC, package leaflet, and supporting quality data.";
    case "II":
      return "Type II — major variation requiring prior approval (60–90 day assessment). Full technical justification, comparability data, and updated dossier modules required.";
    case "NDA":
      return "Prior Approval Supplement / NDA amendment — full FDA review cycle with PDUFA timelines. Reformulation or comparability package usually required.";
    case "None":
      return "No filing required. Internal quality system update or impact assessment may still be advisable.";
    default:
      return "Filing classification pending agent review.";
  }
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function deadlineColor(days: number | null): string {
  if (days === null) return "var(--fg-tertiary)";
  if (days < 0) return "var(--feedback-error-icon)";
  if (days <= 30) return "var(--feedback-error-icon)";
  if (days <= 60) return "var(--feedback-warning-icon)";
  return "var(--feedback-success-icon)";
}

export function confidenceColor(score: number | null): string {
  if (score === null) return "var(--fg-tertiary)";
  if (score >= 85) return "var(--feedback-success-icon)";
  if (score >= 65) return "var(--feedback-warning-icon)";
  return "var(--feedback-error-icon)";
}

// ─── Section 10 — Regulatory Intelligence Agent definition ──────────────────
export interface RegulatoryAgentDefinition {
  name: string;
  id: string;
  description: string;
  capabilities: string[];
  avgConfidenceScore: number;
  itemsProcessedToday: number;
  itemsThisWeek: number;
  queueDepth: number;
  modelUsed: string;
  lastActive: string;
  status: "active" | "idle" | "paused";
  avgCycleSeconds: number;
  uptimeDays: number;
  confidenceTrend: { x: string; value: number }[];
}

export const REGULATORY_INTELLIGENCE_AGENT: RegulatoryAgentDefinition = {
  name: "Regulatory Intelligence Agent",
  id: "RI-AGENT-01",
  description:
    "Monitors global regulatory authority feeds, interprets new guidelines, and generates structured Impact Delta Reports for RA specialist review.",
  capabilities: [
    "Feed monitoring across 6 regulatory authorities (FDA, EMA, MHRA, CDSCO, TGA, ANVISA)",
    "Guideline summarisation and plain-English translation",
    "Product-portfolio impact mapping via semantic similarity",
    "Variation type classification (IA / IB / II / NDA / No Action)",
    "Deadline extraction and jurisdiction-specific calendar calculation",
  ],
  avgConfidenceScore: 85,
  itemsProcessedToday: 6,
  itemsThisWeek: 14,
  queueDepth: 3,
  modelUsed: "Claude Sonnet",
  lastActive: "08:32 today",
  status: "active",
  avgCycleSeconds: 47,
  uptimeDays: 28,
  confidenceTrend: [
    { x: "D-8", value: 78 },
    { x: "D-7", value: 82 },
    { x: "D-6", value: 85 },
    { x: "D-5", value: 88 },
    { x: "D-4", value: 83 },
    { x: "D-3", value: 87 },
    { x: "D-2", value: 85 },
    { x: "D-1", value: 91 },
    { x: "Today", value: 85 },
  ],
};

// Items currently in agent queue (Detected/Processing stages)
export interface AgentQueueItem {
  feedId: string;
  authority: AuthorityCode;
  title: string;
  stage: EventStage;
  progress: number; // 0-100
  startedAt: string;
  etaSeconds: number;
}

export const AGENT_QUEUE: AgentQueueItem[] = [
  {
    feedId: "FEED-2025-0029",
    authority: "TGA",
    title: "Stability Testing Requirements for Registration of Medicines in Australia",
    stage: "Processing",
    progress: 62,
    startedAt: "08:31",
    etaSeconds: 18,
  },
  {
    feedId: "FEED-2025-0042",
    authority: "FDA",
    title: "Draft Guidance — Bioavailability Studies for IND/NDA Submissions",
    stage: "Processing",
    progress: 34,
    startedAt: "08:32",
    etaSeconds: 31,
  },
  {
    feedId: "FEED-2025-0043",
    authority: "CDSCO",
    title: "Notice on Pharmacovigilance Master File Submission for Imported Products",
    stage: "Detected",
    progress: 8,
    startedAt: "08:32",
    etaSeconds: 52,
  },
];

// ─── Section 9.7 — Upcoming deadlines ───────────────────────────────────────
export interface UpcomingDeadline {
  reportId: string;
  productSummary: string;
  market: string;
  deadline: string;
  daysRemaining: number;
  authority: AuthorityCode;
  filingType: FilingType;
  urgency: "critical" | "warning" | "normal";
}

export const UPCOMING_DEADLINES: UpcomingDeadline[] = [
  {
    reportId: "IDR-2025-0039",
    productSummary: "7 products",
    market: "UK",
    deadline: "2025-06-30",
    daysRemaining: 38,
    authority: "MHRA",
    filingType: "IB",
    urgency: "critical",
  },
  {
    reportId: "IDR-2025-0030",
    productSummary: "6 products",
    market: "UK",
    deadline: "2025-07-01",
    daysRemaining: 39,
    authority: "MHRA",
    filingType: "IA",
    urgency: "warning",
  },
  {
    reportId: "IDR-2025-0041",
    productSummary: "7 products",
    market: "EU / UK",
    deadline: "2025-07-12",
    daysRemaining: 50,
    authority: "EMA",
    filingType: "IB",
    urgency: "warning",
  },
  {
    reportId: "IDR-2025-0033",
    productSummary: "3 products",
    market: "BR",
    deadline: "2025-07-15",
    daysRemaining: 53,
    authority: "ANVISA",
    filingType: "IB",
    urgency: "warning",
  },
  {
    reportId: "IDR-2025-0040",
    productSummary: "4 products",
    market: "US",
    deadline: "2025-08-19",
    daysRemaining: 88,
    authority: "FDA",
    filingType: "NDA",
    urgency: "normal",
  },
];

// ─── Live agent activity ticker (last 24h, newest first) ────────────────────
export interface AgentActivityEntry {
  ts: string;
  type: "ingestion" | "agent" | "system" | "notification";
  feedId?: string;
  message: string;
}

export const AGENT_ACTIVITY_LOG: AgentActivityEntry[] = [
  {
    ts: "08:32",
    type: "agent",
    feedId: "FEED-2025-0041",
    message: "Deadline calculated for FEED-2025-0041: 12 July 2025. Confidence 90%.",
  },
  {
    ts: "08:31",
    type: "agent",
    feedId: "FEED-2025-0041",
    message: "Filing type classified as Type IB. Confidence 91%.",
  },
  {
    ts: "08:31",
    type: "agent",
    feedId: "FEED-2025-0041",
    message: "Product impact mapping complete. 7 products matched. Confidence 89%.",
  },
  {
    ts: "08:30",
    type: "agent",
    feedId: "FEED-2025-0041",
    message: "Guideline summary generated. 3 key change areas identified. Confidence 94%.",
  },
  {
    ts: "08:29",
    type: "ingestion",
    feedId: "FEED-2025-0041",
    message: "Document fetched (48 pages). Text extraction complete.",
  },
  {
    ts: "08:28",
    type: "ingestion",
    feedId: "FEED-2025-0041",
    message: "New EMA RSS event detected — Excipients Labelling Revision 2.",
  },
  {
    ts: "08:14",
    type: "notification",
    feedId: "IDR-2025-0039",
    message: "Deadline alert dispatched to UK Regulatory Affairs (38 days remaining).",
  },
  {
    ts: "07:58",
    type: "agent",
    feedId: "FEED-2025-0040",
    message:
      "Confirmatory analysis complete for FDA dissolution guidance. Report approved by P. Chen.",
  },
  {
    ts: "07:42",
    type: "system",
    message: "Authority feeds re-synchronised. 6 / 6 endpoints reachable.",
  },
  {
    ts: "07:30",
    type: "agent",
    feedId: "FEED-2025-0038",
    message: "CDSCO eCTD mandate impact mapping refreshed. 4 products affected.",
  },
  {
    ts: "07:14",
    type: "ingestion",
    feedId: "FEED-2025-0042",
    message: "New FDA draft guidance queued for processing.",
  },
  {
    ts: "06:50",
    type: "notification",
    feedId: "IDR-2025-0033",
    message: "ANVISA Brazil follow-up sent to LatAm Regulatory Affairs.",
  },
];

// ─── Authority sync state (for coverage grid) ───────────────────────────────
export interface AuthoritySync {
  code: AuthorityCode;
  lastSyncMinutesAgo: number;
  itemsToday: number;
  isHealthy: boolean;
}

export const AUTHORITY_SYNC: AuthoritySync[] = [
  { code: "EMA", lastSyncMinutesAgo: 2, itemsToday: 3, isHealthy: true },
  { code: "FDA", lastSyncMinutesAgo: 4, itemsToday: 2, isHealthy: true },
  { code: "MHRA", lastSyncMinutesAgo: 6, itemsToday: 1, isHealthy: true },
  { code: "CDSCO", lastSyncMinutesAgo: 11, itemsToday: 1, isHealthy: true },
  { code: "TGA", lastSyncMinutesAgo: 18, itemsToday: 0, isHealthy: true },
  { code: "ANVISA", lastSyncMinutesAgo: 47, itemsToday: 0, isHealthy: false },
];

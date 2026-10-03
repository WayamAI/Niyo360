import { useApp, type ScreenId } from "@/context/AppContext";
import { DataSourceTag, type DataSource } from "@/components/shared/Page";
import { AppIcon, ResolveIconRef, type IconRef } from "@/components/icons";
import { BrandMark } from "@/components/shared/Logo";
import { AUTHORITY_SYNC } from "@/data/regulatoryData";
import { ESCALATIONS } from "@/data/mockData";

/**
 * Primary navigation metadata for top-bar breadcrumbs & titles.
 */
export const SCREEN_NAV_META: Record<ScreenId, { group: string; label: string }> = {
  dashboard: { group: "Overview", label: "Command Centre" },
  "feed-monitor": { group: "01 · Change Intelligence", label: "Feed Monitor" },
  "delta-reports": { group: "01 · Change Intelligence", label: "Impact Delta Reports" },
  "report-detail": { group: "01 · Change Intelligence", label: "Report Detail" },
  "agent-console": { group: "01 · Change Intelligence", label: "Intelligence Agent" },
  "haq-drafts": { group: "02 · AI Writing", label: "HAQ Responses" },
  "variation-drafts": { group: "02 · AI Writing", label: "Variation Sections" },
  validator: { group: "03 · Compliance Validator", label: "Pre-Submission Validator" },
  "validation-reports": { group: "03 · Compliance Validator", label: "Validation Reports" },
  simulator: { group: "04 · Change Simulator", label: "CMC Simulator" },
  "new-change": { group: "04 · Change Simulator", label: "New Change Entry" },
  heatmap: { group: "04 · Change Simulator", label: "Market Heatmap" },
  "api-authorities": { group: "Live Data · API", label: "Authorities" },
  "api-sources": { group: "Live Data · API", label: "Sources" },
  "api-documents": { group: "Live Data · API", label: "Documents" },
  "api-document-detail": { group: "Live Data · API", label: "Document Detail" },
  "api-document-upload": { group: "Live Data · API", label: "Upload Document" },
  "api-changes": { group: "Live Data · API", label: "Regulatory Changes" },
  "api-change-detail": { group: "Live Data · API", label: "Change Detail" },
  "api-obligations": { group: "Live Data · API", label: "Obligations" },
  "api-impact": { group: "Live Data · API", label: "Impact Assessments" },
  "api-impact-detail": { group: "Live Data · API", label: "Assessment Detail" },
  "api-impact-analyze": { group: "Live Data · API", label: "Impact Analysis" },
  "api-reports": { group: "Live Data · API", label: "Impact Reports" },
  "api-report-detail": { group: "Live Data · API", label: "Impact Report Detail" },
  "api-report-generate": { group: "Live Data · API", label: "Generate Report" },
  "api-products": { group: "Live Data · API", label: "Products" },
  "api-markets": { group: "Live Data · API", label: "Markets" },
  "api-processes": { group: "Live Data · API", label: "Processes" },
  "api-controls": { group: "Live Data · API", label: "Controls" },
  "api-control-detail": { group: "Live Data · API", label: "Control Detail" },
  "api-registrations": { group: "Live Data · API", label: "Registrations" },
  "api-reviews": { group: "Live Data · API", label: "Human Review" },
  "api-actions": { group: "Live Data · API", label: "Actions" },
  "api-evidence": { group: "Live Data · API", label: "Evidence" },
  "api-evidence-detail": { group: "Live Data · API", label: "Evidence Detail" },
  audit: { group: "Live Data · API", label: "Audit Trail" },
  calendar: { group: "Governance", label: "Regulatory Calendar" },
  escalations: { group: "Governance", label: "Escalations" },
};

/**
 * Primary navigation groups structured according to the product's capability pillars.
 */
const SECTIONS: Array<{
  label: string;
  short: string;
  source?: DataSource;
  pillar?: "01" | "02" | "03" | "04";
  items: Array<{
    id: ScreenId;
    label: string;
    icon: IconRef;
    badge?: "escalations";
  }>;
}> = [
  {
    label: "Overview",
    short: "OV",
    items: [
      { id: "dashboard", label: "Command Centre", icon: { type: "lucide", name: "dashboard" } },
    ],
  },
  {
    label: "01 · Change Intelligence",
    source: "illustrative",
    short: "01",
    pillar: "01",
    items: [
      { id: "feed-monitor", label: "Feed Monitor", icon: { type: "lucide", name: "feed" } },
      {
        id: "delta-reports",
        label: "Impact Delta Reports",
        icon: { type: "lucide", name: "deltaReport" },
      },
      {
        id: "agent-console",
        label: "Intelligence Agent",
        icon: { type: "lucide", name: "agent" },
      },
    ],
  },
  {
    label: "02 · AI Writing",
    source: "illustrative",
    short: "02",
    pillar: "02",
    items: [
      { id: "haq-drafts", label: "HAQ Responses", icon: { type: "lucide", name: "haqDraft" } },
      {
        id: "variation-drafts",
        label: "Variation Sections",
        icon: { type: "lucide", name: "variationDraft" },
      },
    ],
  },
  {
    label: "03 · Compliance Validator",
    source: "illustrative",
    short: "03",
    pillar: "03",
    items: [
      {
        id: "validator",
        label: "Pre-Submission Validator",
        icon: { type: "lucide", name: "validator" },
      },
      {
        id: "validation-reports",
        label: "Validation Reports",
        icon: { type: "lucide", name: "validationReport" },
      },
    ],
  },
  {
    label: "04 · Change Simulator",
    source: "illustrative",
    short: "04",
    pillar: "04",
    items: [
      { id: "simulator", label: "CMC Simulator", icon: { type: "lucide", name: "simulator" } },
      { id: "heatmap", label: "Market Heatmap", icon: { type: "lucide", name: "map" } },
    ],
  },
  {
    label: "Live data · PARIVART API",
    source: "live",
    short: "API",
    items: [
      {
        id: "api-authorities",
        label: "Authorities",
        icon: { type: "lucide", name: "organisation" },
      },
      { id: "api-sources", label: "Sources", icon: { type: "lucide", name: "feed" } },
      { id: "api-documents", label: "Documents", icon: { type: "lucide", name: "document" } },
      {
        id: "api-changes",
        label: "Regulatory Changes",
        icon: { type: "lucide", name: "feed" },
      },
      { id: "api-obligations", label: "Obligations", icon: { type: "lucide", name: "flag" } },
      {
        id: "api-impact",
        label: "Impact Assessments",
        icon: { type: "lucide", name: "layers" },
      },
      {
        id: "api-reports",
        label: "Impact Reports",
        icon: { type: "lucide", name: "deltaReport" },
      },
      { id: "api-products", label: "Products", icon: { type: "lucide", name: "document" } },
      { id: "api-markets", label: "Markets", icon: { type: "lucide", name: "map" } },
      { id: "api-processes", label: "Processes", icon: { type: "lucide", name: "layers" } },
      { id: "api-controls", label: "Controls", icon: { type: "lucide", name: "validator" } },
      {
        id: "api-registrations",
        label: "Registrations",
        icon: { type: "lucide", name: "audit" },
      },
      { id: "api-reviews", label: "Human Review", icon: { type: "lucide", name: "validator" } },
      { id: "api-actions", label: "Actions", icon: { type: "lucide", name: "escalation" } },
      { id: "api-evidence", label: "Evidence", icon: { type: "lucide", name: "document" } },
      { id: "audit", label: "Audit Trail", icon: { type: "lucide", name: "audit" } },
    ],
  },
  {
    label: "Governance",
    source: "illustrative",
    short: "GV",
    items: [
      {
        id: "calendar",
        label: "Regulatory Calendar",
        icon: { type: "lucide", name: "calendar" },
      },
      {
        id: "escalations",
        label: "Escalations",
        icon: { type: "lucide", name: "escalation" },
        badge: "escalations",
      },
    ],
  },
];

const PARENT_OF: Partial<Record<ScreenId, ScreenId>> = {
  "report-detail": "delta-reports",
  "api-control-detail": "api-controls",
  "api-document-detail": "api-documents",
  "api-report-detail": "api-reports",
  "api-impact-detail": "api-impact",
  "api-report-generate": "api-reports",
  "api-document-upload": "api-documents",
  "api-impact-analyze": "api-impact",
  "api-evidence-detail": "api-evidence",
  "api-change-detail": "api-changes",
  "api-obligations": "api-changes",
  "new-change": "simulator",
};

export function Sidebar({
  open = false,
  onClose,
  collapsed = false,
}: {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}) {
  const { currentScreen, navigateTo, resolvedEscalations } = useApp();
  const activeId = PARENT_OF[currentScreen] ?? currentScreen;
  const unhealthy = AUTHORITY_SYNC.filter((a) => !a.isHealthy);
  const healthy = AUTHORITY_SYNC.length - unhealthy.length;

  function go(id: ScreenId) {
    navigateTo(id);
    onClose?.();
  }

  return (
    <aside
      aria-label="Primary"
      className={[
        "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-stroke-muted bg-container transition-[width,transform] duration-200 ease-out lg:relative lg:z-30 lg:translate-x-0",
        collapsed ? "w-[252px] lg:w-[68px]" : "w-[252px]",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      {/* Brand header */}
      <div
        className={[
          "flex h-14 shrink-0 items-center border-b border-stroke-muted",
          collapsed ? "lg:justify-center px-4" : "gap-2.5 px-4",
        ].join(" ")}
      >
        <BrandMark size={26} />
        <div className={`flex min-w-0 items-baseline gap-2 ${collapsed ? "lg:hidden" : ""}`}>
          <span className="font-display text-sm tracking-wider text-primary">PARIVART</span>
          <span className="text-caption text-quaternary">v2.4</span>
        </div>
      </div>

      <nav
        aria-label="Sections"
        className={`scrollbar-thin min-h-0 flex-1 overflow-y-auto py-3 ${
          collapsed ? "px-2 lg:px-2" : "px-3"
        }`}
      >
        <ul className="flex flex-col gap-3.5">
          {SECTIONS.map((section) => (
            <li key={section.label}>
              <h2
                className={[
                  "mb-1 px-2 text-caption font-medium tracking-[0.08em] text-quaternary uppercase",
                  collapsed ? "lg:text-center lg:px-0" : "",
                ].join(" ")}
                style={section.pillar ? { color: `var(--pillar-${section.pillar})` } : undefined}
              >
                <span
                  className={`${collapsed ? "lg:hidden" : ""} inline-flex items-center gap-1.5`}
                >
                  {section.label}
                  {section.source === "illustrative" && <DataSourceTag source="illustrative" />}
                </span>
                <span className={collapsed ? "hidden lg:inline" : "hidden"} aria-hidden="true">
                  {section.short}
                </span>
              </h2>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const active = activeId === item.id;
                  const badgeCount =
                    item.badge === "escalations"
                      ? ESCALATIONS.filter((e) => !resolvedEscalations.has(e.id)).length
                      : 0;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => go(item.id)}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={[
                          "group relative flex items-center rounded-full outline-none transition-colors duration-[180ms] ease-out focus-visible:ring-2 focus-visible:ring-ring",
                          collapsed ? "w-full lg:justify-center" : "w-full gap-2.5 pr-2.5",
                        ].join(" ")}
                      >
                        {/* Chronos circular puck navigation indicator */}
                        <span
                          className={[
                            "flex size-9 shrink-0 items-center justify-center rounded-full transition-[background-color,color] duration-[180ms] ease-out",
                            active
                              ? "bg-action-primary text-on-action-primary shadow-sm"
                              : "bg-action text-icon-tertiary group-hover:bg-raised-2 group-hover:text-icon-secondary",
                          ].join(" ")}
                        >
                          <ResolveIconRef
                            icon={item.icon}
                            size="sm"
                            className={
                              active
                                ? "text-on-action-primary"
                                : "text-icon-tertiary group-hover:text-icon-secondary"
                            }
                          />
                        </span>
                        <span
                          className={[
                            "min-w-0 flex-1 truncate text-left text-label-sm transition-colors duration-[180ms]",
                            active
                              ? "font-medium text-primary"
                              : "text-tertiary group-hover:text-secondary",
                            collapsed ? "lg:hidden" : "",
                          ].join(" ")}
                        >
                          {item.label}
                        </span>
                        {badgeCount > 0 && (
                          <span
                            className={[
                              "text-caption tabular shrink-0 rounded-full px-2 py-0.5 font-mono",
                              active
                                ? "bg-action-secondary text-primary"
                                : "bg-error-bg text-error-icon",
                              collapsed ? "lg:hidden" : "",
                            ].join(" ")}
                          >
                            {badgeCount}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* Feed health telemetry footer */}
      <div className={`shrink-0 border-t border-stroke-muted p-2.5 ${collapsed ? "lg:px-2" : ""}`}>
        <button
          type="button"
          onClick={() => go("feed-monitor")}
          title={collapsed ? "Authority feed health" : undefined}
          className={[
            "w-full rounded-lg border border-stroke-muted bg-raised px-3 py-2 text-left transition-colors duration-[180ms] hover:border-stroke-default hover:bg-raised-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            collapsed ? "lg:grid lg:h-9 lg:place-items-center lg:px-0 lg:py-0 rounded-full" : "",
          ].join(" ")}
        >
          <span
            className={`flex items-center justify-between gap-2 ${collapsed ? "lg:hidden" : ""}`}
          >
            <span className="text-caption font-medium tracking-[0.06em] text-quaternary uppercase">
              Authority Feeds
            </span>
            <span
              className={`size-2 shrink-0 rounded-full ${
                unhealthy.length ? "bg-warning-icon" : "bg-success-icon"
              }`}
            />
          </span>
          <span
            className={`text-caption tabular mt-0.5 block font-mono ${
              unhealthy.length ? "text-warning" : "text-success"
            } ${collapsed ? "lg:hidden" : ""}`}
          >
            {unhealthy.length
              ? `${healthy}/${AUTHORITY_SYNC.length} live · ${unhealthy[0].code} stale`
              : `${healthy}/${AUTHORITY_SYNC.length} live`}
          </span>
          <span className={collapsed ? "hidden lg:block" : "hidden"} aria-hidden="true">
            <AppIcon
              name="activity"
              size="sm"
              className={unhealthy.length ? "text-warning-icon" : "text-success-icon"}
            />
          </span>
        </button>
      </div>
    </aside>
  );
}

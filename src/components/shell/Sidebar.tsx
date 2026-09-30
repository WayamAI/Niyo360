import { useApp, type ScreenId } from "@/context/AppContext";
import { DataSourceTag, type DataSource } from "@/components/shared/Page";
import { AppIcon, type IconName } from "@/components/icons";
import { AUTHORITY_SYNC } from "@/data/regulatoryData";
import { ESCALATIONS } from "@/data/mockData";

/**
 * Primary navigation.
 *
 * The information architecture is the product's own: an overview, then one
 * group per capability pillar, then governance. Group labels carry the pillar
 * accent because that is the one place in the app where pillar colour means
 * something structural rather than decorative.
 *
 * Three widths: a 232px rail, a 56px icon rail, and an off-canvas drawer below
 * the lg breakpoint. Collapse state and the drawer are owned by Shell, which
 * is also what draws the scrim.
 */
const SECTIONS: Array<{
  label: string;
  /** Short form shown in the collapsed icon rail as a group separator. */
  short: string;
  /**
   * Whether this group's screens read the PARIVART API or the bundled example
   * dataset. Shown beside the group label so the split is visible from the
   * navigation, not only once a screen is open.
   */
  source?: DataSource;
  pillar?: "01" | "02" | "03" | "04";
  items: Array<{
    id: ScreenId;
    label: string;
    icon: IconName;
    /** Names a live count to show; never a literal, so it cannot go stale. */
    badge?: "escalations";
  }>;
}> = [
  {
    label: "Overview",
    short: "OV",
    items: [{ id: "dashboard", label: "Command Centre", icon: "dashboard" }],
  },
  {
    label: "01 · Change Intelligence",
    source: "illustrative",
    short: "01",
    pillar: "01",
    items: [
      { id: "feed-monitor", label: "Feed Monitor", icon: "feed" },
      { id: "delta-reports", label: "Impact Delta Reports", icon: "deltaReport" },
      { id: "agent-console", label: "Intelligence Agent", icon: "agent" },
    ],
  },
  {
    label: "02 · AI Writing",
    source: "illustrative",
    short: "02",
    pillar: "02",
    items: [
      { id: "haq-drafts", label: "HAQ Responses", icon: "haqDraft" },
      { id: "variation-drafts", label: "Variation Sections", icon: "variationDraft" },
    ],
  },
  {
    label: "03 · Compliance Validator",
    source: "illustrative",
    short: "03",
    pillar: "03",
    items: [
      { id: "validator", label: "Pre-Submission Validator", icon: "validator" },
      { id: "validation-reports", label: "Validation Reports", icon: "validationReport" },
    ],
  },
  {
    label: "04 · Change Simulator",
    source: "illustrative",
    short: "04",
    pillar: "04",
    items: [
      { id: "simulator", label: "CMC Simulator", icon: "simulator" },
      { id: "heatmap", label: "Market Heatmap", icon: "map" },
    ],
  },
  {
    // Screens reading the real PARIVART API. Separated from the sections above,
    // which still render the illustrative dataset in src/data.
    label: "Live data · PARIVART API",
    source: "live",
    short: "API",
    items: [
      { id: "api-authorities", label: "Authorities", icon: "organisation" },
      { id: "api-sources", label: "Sources", icon: "feed" },
      // Ordered to follow the chain the product actually models, so the nav
      // reads as the workflow rather than an alphabetical list of tables.
      { id: "api-documents", label: "Documents", icon: "document" },
      { id: "api-changes", label: "Regulatory Changes", icon: "feed" },
      { id: "api-obligations", label: "Obligations", icon: "flag" },
      { id: "api-impact", label: "Impact Assessments", icon: "layers" },
      { id: "api-reports", label: "Impact Reports", icon: "deltaReport" },
      { id: "api-products", label: "Products", icon: "document" },
      { id: "api-markets", label: "Markets", icon: "map" },
      { id: "api-processes", label: "Processes", icon: "layers" },
      { id: "api-controls", label: "Controls", icon: "validator" },
      { id: "api-registrations", label: "Registrations", icon: "audit" },
      { id: "api-reviews", label: "Human Review", icon: "validator" },
      { id: "api-actions", label: "Actions", icon: "escalation" },
      { id: "audit", label: "Audit Trail", icon: "audit" },
    ],
  },
  {
    // Calendar and Escalations still render the illustrative dataset. The group
    // is tagged as such because the two screens in it are, now that Audit has
    // moved to the live group -- an untagged group beside a tagged one reads as
    // a claim that this one is live.
    label: "Governance",
    source: "illustrative",
    short: "GV",
    items: [
      { id: "calendar", label: "Regulatory Calendar", icon: "calendar" },
      { id: "escalations", label: "Escalations", icon: "escalation", badge: "escalations" },
    ],
  },
];

/** Screens reachable only by drilling in; they light up their parent's row. */
const PARENT_OF: Partial<Record<ScreenId, ScreenId>> = {
  "report-detail": "delta-reports",
  "api-control-detail": "api-controls",
  "api-document-detail": "api-documents",
  "api-report-detail": "api-reports",
  "api-impact-detail": "api-impact",
  "api-report-generate": "api-reports",
  "api-document-upload": "api-documents",
  "api-impact-analyze": "api-impact",
  "api-change-detail": "api-changes",
  "api-obligations": "api-changes",
  "new-change": "simulator",
};

export function Sidebar({
  /** Drawer visibility below lg. Ignored at lg and above. */
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
      className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-stroke-muted bg-container transition-[width,transform] duration-200 ease-out lg:relative lg:z-30 lg:translate-x-0 ${
        collapsed ? "w-[232px] lg:w-14" : "w-[232px]"
      } ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <nav
        aria-label="Sections"
        className={`scrollbar-thin min-h-0 flex-1 overflow-y-auto py-3 ${
          collapsed ? "px-2 lg:px-1.5" : "px-2"
        }`}
      >
        <ul className="flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <li key={section.label}>
              <h2
                className={`type-label-sm mb-1 px-2 ${section.pillar ? "" : "text-fg-quaternary"} ${
                  collapsed ? "lg:text-center lg:px-0" : ""
                }`}
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
              <ul className="flex flex-col gap-0.5">
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
                        className={`relative flex h-9 w-full items-center gap-2.5 rounded-md px-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                          active
                            ? "bg-raised-2 text-fg-primary"
                            : "text-fg-tertiary hover:bg-action-tertiary-hover hover:text-fg-secondary"
                        } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
                      >
                        {/* Active marker: a 2px brand rail rather than
                            inverting the whole row, which made one of
                            thirteen items the loudest element on screen. */}
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand"
                          />
                        )}
                        <AppIcon
                          name={item.icon}
                          size="md"
                          className={active ? "text-icon-primary" : "text-icon-tertiary"}
                        />
                        <span
                          className={`type-body-md min-w-0 flex-1 truncate text-left ${
                            active ? "font-medium" : ""
                          } ${collapsed ? "lg:hidden" : ""}`}
                        >
                          {item.label}
                        </span>
                        {badgeCount > 0 && (
                          <span
                            className={`type-caption tabular shrink-0 rounded px-1.5 font-mono ${
                              active ? "bg-action text-fg-secondary" : "bg-error-bg text-error-icon"
                            } ${collapsed ? "lg:hidden" : ""}`}
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

      {/* Feed health, derived from AUTHORITY_SYNC rather than asserted. The
          previous copy read "Active, 112 markets indexed" — a number the
          dataset does not contain, over a green dot that hid a stale feed. */}
      <div className={`shrink-0 p-2 ${collapsed ? "lg:px-1.5" : ""}`}>
        <button
          type="button"
          onClick={() => go("feed-monitor")}
          title={collapsed ? "Authority feed health" : undefined}
          className={`w-full rounded-md border border-stroke-muted bg-raised px-2.5 py-2 text-left transition-colors duration-150 hover:border-stroke-default focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
            collapsed ? "lg:grid lg:h-9 lg:place-items-center lg:px-0 lg:py-0" : ""
          }`}
        >
          <span
            className={`flex items-center justify-between gap-2 ${collapsed ? "lg:hidden" : ""}`}
          >
            <span className="type-caption text-fg-tertiary">Authority feeds</span>
            <span
              className={`size-2 shrink-0 rounded-full ${
                unhealthy.length ? "bg-warning-icon" : "bg-success-icon"
              }`}
            />
          </span>
          <span
            className={`type-caption tabular mt-0.5 block font-mono ${
              unhealthy.length ? "text-warning" : "text-success"
            } ${collapsed ? "lg:hidden" : ""}`}
          >
            {unhealthy.length
              ? `${healthy}/${AUTHORITY_SYNC.length} healthy · ${unhealthy[0].code} stale`
              : `${healthy}/${AUTHORITY_SYNC.length} healthy`}
          </span>
          <span className={collapsed ? "hidden lg:block" : "hidden"} aria-hidden="true">
            <AppIcon
              name="activity"
              size="md"
              className={unhealthy.length ? "text-warning-icon" : "text-success-icon"}
            />
          </span>
        </button>
      </div>
    </aside>
  );
}

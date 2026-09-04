import { useApp, type ScreenId } from "@/context/AppContext";
import { AppIcon, type IconName } from "@/components/icons";

const SECTIONS: Array<{
  label: string;
  pillar?: "01" | "02" | "03" | "04";
  items: Array<{ id: ScreenId; label: string; icon: IconName; badge?: string }>;
}> = [
  // Scope: this build ships only Pillar 01 (Change Intelligence). The other
  // pillar screens still exist in src/components/screens/ and are wired into
  // Shell.tsx, but they are intentionally hidden from the sidebar. Uncomment
  // the corresponding section to re-enable.

  {
    label: "OVERVIEW",
    items: [{ id: "dashboard", label: "Command Centre", icon: "dashboard" }],
  },
  {
    label: "PILLAR 01, CHANGE INTELLIGENCE",
    pillar: "01",
    items: [
      { id: "feed-monitor", label: "Regulatory Feed Monitor", icon: "feed" },
      { id: "delta-reports", label: "Impact Delta Reports", icon: "deltaReport" },
      { id: "agent-console", label: "Regulatory Intelligence Agent", icon: "agent" },
    ],
  },
  {
    label: "PILLAR 02, AI WRITING",
    pillar: "02",
    items: [
      { id: "haq-drafts", label: "HAQ Response Drafts", icon: "haqDraft" },
      { id: "variation-drafts", label: "Variation Section Drafts", icon: "variationDraft" },
    ],
  },
  {
    label: "PILLAR 03, COMPLIANCE VALIDATOR",
    pillar: "03",
    items: [
      { id: "validator", label: "Pre-Submission Validator", icon: "validator" },
      { id: "validation-reports", label: "Validation Reports", icon: "validationReport" },
    ],
  },
  {
    label: "PILLAR 04, CHANGE SIMULATOR",
    pillar: "04",
    items: [
      { id: "simulator", label: "CMC Change Simulator", icon: "simulator" },
      { id: "heatmap", label: "Market Heatmap", icon: "map" },
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      { id: "calendar", label: "Regulatory Calendar", icon: "calendar" },
      { id: "audit", label: "Audit Trail", icon: "audit" },
      { id: "escalations", label: "Escalations", icon: "escalation", badge: "4" },
    ],
  },
];

export function Sidebar() {
  const { currentScreen, navigateTo } = useApp();
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-[220px] bg-container border-r border-stroke-muted z-40 flex flex-col overflow-y-auto scrollbar-thin">
      <nav className="flex-1 p-3 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div
              className={`px-3 mb-1.5 type-label-sm ${section.pillar ? "" : "text-fg-quaternary"}`}
              style={section.pillar ? { color: `var(--pillar-${section.pillar})` } : undefined}
            >
              {section.label}
            </div>
            {section.items.map((it) => {
              const active = currentScreen === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => navigateTo(it.id)}
                  aria-current={active ? "page" : undefined}
                  className={`w-full h-9 px-3 rounded-md flex items-center gap-2.5 text-sm transition-colors duration-200
                    ${
                      active
                        ? "bg-action-primary text-on-action-primary font-medium"
                        : "text-fg-tertiary hover:bg-action-tertiary-hover hover:text-fg-secondary"
                    }`}
                >
                  <AppIcon
                    name={it.icon}
                    size="lg"
                    className={active ? "text-on-action-primary" : "text-icon-tertiary"}
                  />
                  <span className="flex-1 text-left truncate">{it.label}</span>
                  {it.badge && (
                    <span
                      className={`text-3xs font-mono rounded px-1.5 ${
                        active
                          ? "bg-on-action-primary/15 text-on-action-primary"
                          : "bg-error-bg text-error-icon"
                      }`}
                    >
                      {it.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3">
        <div className="rounded-lg bg-raised border border-stroke-muted px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-2xs text-fg-tertiary">Simulation Engine</span>
            <span className="w-2 h-2 rounded-full animate-pulse bg-success-icon" />
          </div>
          <div className="font-mono text-3xs mt-1 text-success">
            Active, 112 markets indexed
          </div>
        </div>
      </div>
    </aside>
  );
}

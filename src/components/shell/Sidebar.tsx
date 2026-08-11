import { useApp, type ScreenId } from "@/context/AppContext";
import {
  Radio,
  FileSearch,
  Sparkles,
  // Icons retained for the commented-out sections below — uncomment when
  // bringing those pillars back into the sidebar.
  LayoutDashboard,
  PenLine,
  FileText,
  ShieldCheck,
  ClipboardCheck,
  Zap,
  Map,
  CalendarDays,
  ListChecks,
  AlertTriangle,
} from "lucide-react";

const SECTIONS: Array<{
  label: string;
  pillar?: "01" | "02" | "03" | "04";
  items: Array<{ id: ScreenId; label: string; icon: any; badge?: string }>;
}> = [
  // Scope: this build ships only Pillar 01 (Change Intelligence). The other
  // pillar screens still exist in src/components/screens/ and are wired into
  // Shell.tsx, but they are intentionally hidden from the sidebar. Uncomment
  // the corresponding section + its icon import above to re-enable.

  {
    label: "OVERVIEW",
    items: [{ id: "dashboard", label: "Command Centre", icon: LayoutDashboard }],
  },
  {
    label: "PILLAR 01, CHANGE INTELLIGENCE",
    pillar: "01",
    items: [
      { id: "feed-monitor", label: "Regulatory Feed Monitor", icon: Radio },
      { id: "delta-reports", label: "Impact Delta Reports", icon: FileSearch },
      { id: "agent-console", label: "Regulatory Intelligence Agent", icon: Sparkles },
    ],
  },
  {
    label: "PILLAR 02, AI WRITING",
    pillar: "02",
    items: [
      { id: "haq-drafts", label: "HAQ Response Drafts", icon: PenLine },
      { id: "variation-drafts", label: "Variation Section Drafts", icon: FileText },
    ],
  },
  {
    label: "PILLAR 03, COMPLIANCE VALIDATOR",
    pillar: "03",
    items: [
      { id: "validator", label: "Pre-Submission Validator", icon: ShieldCheck },
      { id: "validation-reports", label: "Validation Reports", icon: ClipboardCheck },
    ],
  },
  {
    label: "PILLAR 04, CHANGE SIMULATOR",
    pillar: "04",
    items: [
      { id: "simulator", label: "CMC Change Simulator", icon: Zap },
      { id: "heatmap", label: "Market Heatmap", icon: Map },
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      { id: "calendar", label: "Regulatory Calendar", icon: CalendarDays },
      { id: "audit", label: "Audit Trail", icon: ListChecks },
      { id: "escalations", label: "Escalations", icon: AlertTriangle, badge: "4" },
    ],
  },
];

export function Sidebar() {
  const { currentScreen, navigateTo } = useApp();
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-[220px] bg-card border-r border-border z-40 flex flex-col overflow-y-auto scrollbar-thin">
      <nav className="flex-1 p-3 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div
              className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-[0.1em]"
              style={{
                color: section.pillar
                  ? `var(--pillar-${section.pillar})`
                  : "var(--muted-foreground)",
              }}
            >
              {section.label}
            </div>
            {section.items.map((it) => {
              const active = currentScreen === it.id;
              const Icon = it.icon;
              return (
                <button
                  key={it.id}
                  onClick={() => navigateTo(it.id)}
                  className={`w-full h-9 px-3 rounded-md flex items-center gap-2.5 text-[13px] transition-colors
                    ${
                      active
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  style={
                    active
                      ? { borderLeft: `2px solid var(--primary)`, paddingLeft: "10px" }
                      : undefined
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{it.label}</span>
                  {it.badge && (
                    <span
                      className="text-[10px] font-mono rounded px-1.5"
                      style={{ background: "var(--status-red)", color: "white" }}
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
        <div className="rounded-lg bg-muted px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Simulation Engine</span>
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--status-green)" }}
            />
          </div>
          <div className="font-mono text-[10px] mt-1" style={{ color: "var(--status-green)" }}>
            Active, 112 markets indexed
          </div>
        </div>
      </div>
    </aside>
  );
}

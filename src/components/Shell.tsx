import { useState } from "react";
import { useApp, type ScreenId } from "@/context/AppContext";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { RightRail } from "@/components/shell/RightRail";
import { AIAssistant } from "@/components/overlays/AIAssistant";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { PageBody } from "@/components/shared/Page";
import { Dashboard } from "@/components/screens/Dashboard";
import { FeedMonitor } from "@/components/screens/FeedMonitor";
import { DeltaReports } from "@/components/screens/DeltaReports";
import { ReportDetail } from "@/components/screens/ReportDetail";
import { AgentConsole } from "@/components/screens/AgentConsole";
import { HAQDrafts } from "@/components/screens/HAQDrafts";
import { VariationDrafts } from "@/components/screens/VariationDrafts";
import { PreSubmissionValidator } from "@/components/screens/PreSubmissionValidator";
import { ValidationReports } from "@/components/screens/ValidationReports";
import { CMCChangeSimulator } from "@/components/screens/CMCChangeSimulator";
import { NewChangeEntry } from "@/components/screens/NewChangeEntry";
import { MarketHeatmap } from "@/components/screens/MarketHeatmap";
import { RegulatoryCalendar } from "@/components/screens/RegulatoryCalendar";
import { AuditTrail } from "@/components/screens/AuditTrail";
import { Escalations } from "@/components/screens/Escalations";

const SCREENS = {
  dashboard: Dashboard,
  "feed-monitor": FeedMonitor,
  "delta-reports": DeltaReports,
  "report-detail": ReportDetail,
  "agent-console": AgentConsole,
  "haq-drafts": HAQDrafts,
  "variation-drafts": VariationDrafts,
  validator: PreSubmissionValidator,
  "validation-reports": ValidationReports,
  simulator: CMCChangeSimulator,
  "new-change": NewChangeEntry,
  heatmap: MarketHeatmap,
  calendar: RegulatoryCalendar,
  audit: AuditTrail,
  escalations: Escalations,
} as const;

/**
 * Screens that render their own PageHeader + PageBody.
 *
 * Transitional: the rest are still wrapped in a default PageBody below so they
 * keep working while they are migrated one at a time. When every screen is in
 * this set, the set and the fallback branch both go away.
 */
const OWNS_LAYOUT = new Set<ScreenId>([]);

/**
 * Application shell.
 *
 * A flex column inside a flex row — sidebar, then the header/content stack.
 * The previous version positioned every region with `fixed` and hard-coded
 * offsets (`left-[220px]`, `top-14`, an inline `right: isRailOpen ? 320 : 0`),
 * which is why nothing about it responded to width: the main region simply sat
 * underneath the sidebar on a narrow screen. With flex, each region claims its
 * own space and `min-w-0` lets the content column actually shrink.
 */
export function Shell() {
  const { currentScreen } = useApp();
  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const Screen = SCREENS[currentScreen] ?? Dashboard;

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-page text-fg-primary"
      style={{ "--page-max": "1600px" } as React.CSSProperties}
    >
      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-scrim lg:hidden"
        />
      )}

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} collapsed={navCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          onOpenNav={() => setNavOpen(true)}
          onToggleCollapse={() => setNavCollapsed((value) => !value)}
          collapsed={navCollapsed}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main
            key={currentScreen}
            className="page-enter flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            {OWNS_LAYOUT.has(currentScreen) ? (
              <Screen />
            ) : (
              <PageBody className="gap-4">
                <Screen />
              </PageBody>
            )}
          </main>
          <RightRail />
        </div>
      </div>

      <AIAssistant />
      <ToastContainer />
    </div>
  );
}

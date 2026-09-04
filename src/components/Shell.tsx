import { useApp } from "@/context/AppContext";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { RightRail } from "@/components/shell/RightRail";
import { AIAssistant } from "@/components/overlays/AIAssistant";
import { ToastContainer } from "@/components/shared/ToastContainer";
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

export function Shell() {
  const { currentScreen, isRailOpen } = useApp();
  const Screen = SCREENS[currentScreen] || Dashboard;
  return (
    <div className="h-screen overflow-hidden bg-page text-fg-primary">
      <TopBar />
      <Sidebar />
      <RightRail />
      <main
        className="fixed top-14 bottom-0 left-[220px] overflow-y-auto scrollbar-thin transition-all duration-250"
        style={{ right: isRailOpen ? 320 : 0 }}
      >
        <div className="p-7 max-w-[1600px] mx-auto" key={currentScreen}>
          <Screen />
        </div>
      </main>
      <AIAssistant />
      <ToastContainer />
    </div>
  );
}

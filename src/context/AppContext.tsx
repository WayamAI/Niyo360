import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SEED_AUDIT_EVENTS } from "@/data/mockData";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { demoTimestamp } from "@/lib/demo-clock";

export type ScreenId =
  | "dashboard"
  | "feed-monitor"
  | "delta-reports"
  | "report-detail"
  | "agent-console"
  | "haq-drafts"
  | "variation-drafts"
  | "validator"
  | "validation-reports"
  | "simulator"
  | "new-change"
  | "heatmap"
  | "calendar"
  | "audit"
  | "escalations"
  // Screens backed by the real PARIVART API (see src/components/screens/api).
  | "api-products"
  | "api-markets"
  | "api-processes"
  | "api-authorities"
  | "api-sources"
  | "api-documents"
  | "api-impact"
  | "api-reports"
  | "api-controls"
  | "api-registrations"
  | "api-control-detail"
  | "api-document-detail"
  | "api-report-detail";

export interface AuditEvent {
  id: string;
  actor: string;
  actorType: "user" | "agent" | "system";
  pillar?: string | null;
  action: string;
  changeId?: string | null;
  timestamp: string;
}

export interface Toast {
  id: string;
  message: string;
  variant: "default" | "success" | "warning" | "error";
}

interface AppContextType {
  currentScreen: ScreenId;
  navigateTo: (s: ScreenId) => void;
  auditLog: AuditEvent[];
  logAudit: (e: Omit<AuditEvent, "id" | "timestamp">) => void;
  toasts: Toast[];
  showToast: (msg: string, variant?: Toast["variant"]) => void;
  dismissToast: (id: string) => void;
  isRailOpen: boolean;
  toggleRail: () => void;
  isAssistantOpen: boolean;
  toggleAssistant: () => void;
  selectedChangeId: string | null;
  setSelectedChangeId: (id: string | null) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  /**
   * Id of the record an API drill-in screen should load.
   *
   * Screens are switched by state rather than by URL, so a detail screen has
   * no route parameter to read. openRecord sets the id and navigates in one
   * step, which keeps the id and the screen from disagreeing.
   */
  selectedRecordId: string | null;
  openRecord: (screen: ScreenId, id: string) => void;
  fixedIssues: Set<string>;
  markIssueFixed: (id: string) => void;
  resolvedEscalations: Set<string>;
  resolveEscalation: (id: string) => void;
  reviewedFeed: Set<string>;
  markFeedReviewed: (id: string) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>("dashboard");
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(
    SEED_AUDIT_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}` })),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  // The context rail is inline at xl and overlays the page below it, so
  // starting it open on a laptop or phone would cover the screen the user
  // just navigated to. SSR renders it closed and the client opens it only
  // where there is room for it to sit beside the content.
  const [isRailOpen, setRailOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>("CHG-2025-0047");
  const [selectedReportId, setSelectedReportId] = useState<string | null>("IDR-2025-0041");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [fixedIssues, setFixed] = useState<Set<string>>(new Set());
  const [resolvedEscalations, setResolved] = useState<Set<string>>(new Set());
  const [reviewedFeed, setReviewed] = useState<Set<string>>(new Set());

  // Theme lives in ThemeProvider, which wraps the whole tree including the
  // sign-in screen. Re-exposed here so every existing useApp().theme call site
  // keeps working and there is still one theme system.
  const { theme, toggleTheme } = useTheme();

  // Open the rail once there is room, and fold it away again on the way down,
  // so resizing never leaves a 320px panel sitting on top of the content.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const wide = window.matchMedia("(min-width: 1280px)");
    const sync = (event: MediaQueryList | MediaQueryListEvent) => setRailOpen(event.matches);
    sync(wide);
    wide.addEventListener("change", sync);
    return () => wide.removeEventListener("change", sync);
  }, []);

  const logAudit = useCallback((e: Omit<AuditEvent, "id" | "timestamp">) => {
    setAuditLog((prev) => [
      { ...e, id: `evt-${Date.now()}-${Math.random()}`, timestamp: demoTimestamp() },
      ...prev,
    ]);
  }, []);

  // Auto-dismiss timers are tracked so signing out (which unmounts this
  // provider) does not leave up to a dozen timeouts writing into dead state.
  const toastTimers = useRef<number[]>([]);
  useEffect(() => {
    const pending = toastTimers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const showToast = useCallback((message: string, variant: Toast["variant"] = "default") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    toastTimers.current.push(
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500),
    );
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const navigateTo = useCallback(
    (s: ScreenId) => {
      setCurrentScreen(s);
      logAudit({ actor: "Regulatory Operations", actorType: "user", action: `Navigated to ${s}` });
    },
    [logAudit],
  );

  const openRecord = useCallback(
    (screen: ScreenId, id: string) => {
      setSelectedRecordId(id);
      navigateTo(screen);
    },
    [navigateTo],
  );

  const value: AppContextType = {
    currentScreen,
    navigateTo,
    auditLog,
    logAudit,
    toasts,
    showToast,
    dismissToast,
    isRailOpen,
    toggleRail: () => setRailOpen((o) => !o),
    isAssistantOpen,
    toggleAssistant: () => setAssistantOpen((o) => !o),
    selectedChangeId,
    setSelectedChangeId,
    selectedReportId,
    setSelectedReportId,
    selectedRecordId,
    openRecord,
    fixedIssues,
    markIssueFixed: (id) => setFixed((prev) => new Set(prev).add(id)),
    resolvedEscalations,
    resolveEscalation: (id) => setResolved((prev) => new Set(prev).add(id)),
    reviewedFeed,
    markFeedReviewed: (id) => setReviewed((prev) => new Set(prev).add(id)),
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

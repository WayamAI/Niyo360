import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_AUDIT_EVENTS } from "@/data/mockData";

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
  | "escalations";

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

type Theme = "light" | "dark";

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

const nowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>("agent-console");
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(
    SEED_AUDIT_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}` })),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isRailOpen, setRailOpen] = useState(true);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>("CHG-2025-0047");
  const [selectedReportId, setSelectedReportId] = useState<string | null>("IDR-2025-0041");
  const [fixedIssues, setFixed] = useState<Set<string>>(new Set());
  const [resolvedEscalations, setResolved] = useState<Set<string>>(new Set());
  const [reviewedFeed, setReviewed] = useState<Set<string>>(new Set());

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("regiq-theme") as Theme | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("regiq-theme", theme);
  }, [theme]);

  const logAudit = useCallback((e: Omit<AuditEvent, "id" | "timestamp">) => {
    setAuditLog((prev) => [
      { ...e, id: `evt-${Date.now()}-${Math.random()}`, timestamp: nowStamp() },
      ...prev,
    ]);
  }, []);

  const showToast = useCallback((message: string, variant: Toast["variant"] = "default") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
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
    fixedIssues,
    markIssueFixed: (id) => setFixed((prev) => new Set(prev).add(id)),
    resolvedEscalations,
    resolveEscalation: (id) => setResolved((prev) => new Set(prev).add(id)),
    reviewedFeed,
    markFeedReviewed: (id) => setReviewed((prev) => new Set(prev).add(id)),
    theme,
    toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

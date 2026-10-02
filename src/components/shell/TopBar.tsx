import { AppIcon, IconButton } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { SCREEN_NAV_META } from "@/components/shell/Sidebar";
import { ESCALATIONS } from "@/data/mockData";

/**
 * Chronos-inspired application top bar:
 * Shows active scope/hierarchy, global AI assistant trigger, real-time live indicator,
 * notification alerts, and user authentication status.
 */
export function TopBar({
  onOpenNav,
  onToggleCollapse,
  collapsed,
}: {
  /** Opens the off-canvas sidebar. Rendered below lg only. */
  onOpenNav: () => void;
  /** Collapses the sidebar to an icon rail. lg and above only. */
  onToggleCollapse: () => void;
  collapsed: boolean;
}) {
  const { currentScreen, toggleAssistant, theme, toggleTheme, navigateTo, resolvedEscalations } =
    useApp();
  const { user, logout } = useAuth();

  const openEscalations = ESCALATIONS.filter((e) => !resolvedEscalations.has(e.id)).length;
  const currentMeta = SCREEN_NAV_META[currentScreen] ?? {
    group: "Overview",
    label: "Command Centre",
  };

  const initials =
    (user?.name || user?.email?.split("@")[0] || "?")
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-stroke-muted bg-page px-4 sm:gap-4 sm:px-5">
      {/* Scope / Location hierarchy */}
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-action text-icon-tertiary transition-colors duration-[180ms] hover:bg-raised-2 hover:text-icon-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
        >
          <AppIcon name="menu" size="sm" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-pressed={collapsed}
          className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-action text-icon-tertiary transition-colors duration-[180ms] hover:bg-raised-2 hover:text-icon-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:flex"
        >
          <AppIcon name={collapsed ? "chevronRight" : "chevronLeft"} size="sm" />
        </button>

        <span className="hidden text-caption font-medium tracking-[0.08em] text-quaternary uppercase sm:inline">
          {currentMeta.group}
        </span>
        <span aria-hidden="true" className="hidden text-caption text-quaternary sm:inline">
          /
        </span>
        <h1 className="truncate font-display text-display-lg text-primary">{currentMeta.label}</h1>
      </div>

      {/* Global Actions & Controls */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {/* Search / Ask AI button */}
        <button
          type="button"
          onClick={toggleAssistant}
          className="flex h-8 items-center gap-2 rounded-full border border-stroke-muted bg-action px-3 text-label-sm text-tertiary outline-none transition-colors duration-[180ms] hover:border-stroke-default hover:bg-raised-2 hover:text-secondary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AppIcon name="agent" size="xs" className="text-pillar-01" />
          <span className="hidden sm:inline">Ask AI</span>
          <kbd className="hidden rounded border border-stroke-muted px-1 font-mono text-caption text-quaternary sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Real-time status pill */}
        <div className="hidden h-8 items-center gap-1.5 rounded-full border border-stroke-muted bg-action px-3 text-label-sm text-tertiary sm:flex">
          <span>Today</span>
          <span className="text-quaternary">·</span>
          <span className="inline-flex items-center gap-1 text-success font-medium">
            <span className="size-1.5 rounded-full bg-success-icon animate-pulse" />
            Live
          </span>
        </div>

        {/* Escalation alert bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => navigateTo("escalations")}
            aria-label={
              openEscalations ? `Escalations, ${openEscalations} open` : "Escalations, none open"
            }
            className="flex size-8 items-center justify-center rounded-full bg-action text-icon-tertiary transition-colors duration-[180ms] hover:bg-raised-2 hover:text-icon-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <AppIcon name="notification" size="sm" />
          </button>
          {openEscalations > 0 && (
            <span
              aria-hidden="true"
              className="text-caption tabular pointer-events-none absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-error-icon font-mono text-[10px] font-semibold text-fg-on-color"
            >
              {openEscalations}
            </span>
          )}
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          className="flex size-8 items-center justify-center rounded-full bg-action text-icon-tertiary transition-colors duration-[180ms] hover:bg-raised-2 hover:text-icon-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <AppIcon name={theme === "light" ? "themeDark" : "themeLight"} size="sm" />
        </button>

        {/* User avatar badge */}
        <div
          className="grid size-8 shrink-0 place-items-center rounded-full border text-pillar-01"
          style={{
            background: "color-mix(in oklab, var(--pillar-01) 12%, transparent)",
            borderColor: "color-mix(in oklab, var(--pillar-01) 30%, transparent)",
          }}
          title={user?.email}
        >
          <span className="text-caption font-medium">{initials}</span>
        </div>

        {/* Sign out */}
        <IconButton icon="signOut" size="sm" onClick={logout} aria-label="Sign out" />
      </div>
    </header>
  );
}

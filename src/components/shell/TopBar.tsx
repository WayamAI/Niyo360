import { AppIcon, IconButton } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import niyo360Logo from "@/assets/niyo360-logo.svg";
import niyo360LogoDark from "@/assets/niyo360-logo-dark.svg";
import { ESCALATIONS } from "@/data/mockData";

/**
 * Global chrome: product identity, the assistant entry point, and account
 * controls. Everything about *where you are* lives in the page header instead,
 * so this bar stays one compact line at every width.
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
  const { toggleAssistant, theme, toggleTheme, navigateTo, resolvedEscalations } = useApp();
  const { session, logout } = useAuth();

  // Open escalations are the app's only real "needs your attention" count, so
  // the bell reports that rather than a hard-coded 3.
  const openEscalations = ESCALATIONS.filter((e) => !resolvedEscalations.has(e.id)).length;

  const initials =
    (session?.email ?? "?")
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-stroke-muted bg-container px-3 sm:gap-3 sm:px-4">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="grid size-8 shrink-0 place-items-center rounded-md text-icon-secondary transition-colors duration-150 hover:bg-action-tertiary-hover hover:text-icon-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
      >
        <AppIcon name="menu" size="md" />
      </button>
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        aria-pressed={collapsed}
        className="hidden size-8 shrink-0 place-items-center rounded-md text-icon-tertiary transition-colors duration-150 hover:bg-action-tertiary-hover hover:text-icon-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:grid"
      >
        <AppIcon name={collapsed ? "chevronRight" : "chevronLeft"} size="md" />
      </button>

      <div className="flex min-w-0 items-center gap-2.5">
        <img
          src={theme === "dark" ? niyo360LogoDark : niyo360Logo}
          alt="Niyo360"
          className="h-6 w-auto shrink-0"
        />
        <span aria-hidden="true" className="hidden h-5 w-px bg-stroke-default sm:block" />
        {/* Michroma carries the product identity; the descriptor stays in Geist
            so the header reads as one line. The descriptor is the first thing
            to go when space is tight — the logo already says the product. */}
        <span className="hidden min-w-0 items-baseline gap-2 sm:flex">
          <span className="type-display-section text-fg-primary">Niyo360</span>
          <span className="type-body-sm truncate text-fg-tertiary">Change Intelligence</span>
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={toggleAssistant}
          className="flex h-8 items-center gap-2 rounded-md border border-stroke-default bg-action px-2.5 text-fg-tertiary transition-colors duration-150 hover:border-stroke-active hover:bg-raised hover:text-fg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <AppIcon name="agent" size="sm" className="text-pillar-02" />
          <span className="type-body-md hidden sm:inline">Ask AI</span>
          <kbd className="type-caption hidden rounded border border-stroke-muted px-1 font-mono text-fg-quaternary md:inline">
            ⌘K
          </kbd>
        </button>

        <div className="relative">
          <IconButton
            icon="notification"
            size="sm"
            onClick={() => navigateTo("escalations")}
            aria-label={
              openEscalations ? `Escalations, ${openEscalations} open` : "Escalations, none open"
            }
          />
          {openEscalations > 0 && (
            <span
              aria-hidden="true"
              className="type-caption tabular pointer-events-none absolute top-0 right-0 grid size-3.5 place-items-center rounded-full bg-error-icon font-mono text-fg-on-color"
            >
              {openEscalations}
            </span>
          )}
        </div>

        <IconButton
          icon={theme === "light" ? "themeDark" : "themeLight"}
          size="sm"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        />

        <div
          className="grid size-8 shrink-0 place-items-center rounded-full border text-pillar-03"
          style={{
            background: "color-mix(in oklab, var(--pillar-03) 12%, transparent)",
            borderColor: "color-mix(in oklab, var(--pillar-03) 30%, transparent)",
          }}
          title={session?.email}
        >
          <span className="type-body-sm font-medium">{initials}</span>
        </div>
        <IconButton icon="signOut" size="sm" onClick={logout} aria-label="Sign out" />
      </div>
    </header>
  );
}

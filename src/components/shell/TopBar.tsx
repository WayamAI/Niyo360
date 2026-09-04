import { AppIcon, IconButton } from "@/components/icons";
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import niyo360Logo from '@/assets/niyo360-logo.svg';
import niyo360LogoDark from '@/assets/niyo360-logo-dark.svg';

export function TopBar() {
  const { showToast, toggleAssistant, theme, toggleTheme } = useApp();
  const { session, logout } = useAuth();
  const initials = (session?.email ?? '?')
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || '?';
  return (
    <header className="fixed top-0 inset-x-0 h-14 z-50 bg-container border-b border-stroke-muted flex items-center px-4 gap-4">
      <div className="flex items-center gap-3">
        <img src={theme === 'dark' ? niyo360LogoDark : niyo360Logo} alt="Niyo360" className="h-7 w-auto" />
        <div className="h-6 w-px bg-stroke-default" />
        {/* Michroma carries the product identity; the descriptor stays in
            Geist so the header reads as one compact line. */}
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <h1 className="type-display-section text-fg-primary">Niyo360</h1>
          <span className="text-xs font-medium text-fg-tertiary">
            Change Intelligence
          </span>
        </div>

        {/* <span
          className="rounded px-1.5 py-0.5 text-3xs font-medium uppercase tracking-wider"
          style={{ background: 'color-mix(in oklab, var(--pillar-02) 12%, transparent)', color: 'var(--pillar-02)' }}
        >
          POC
        </span> */}
      </div>

      <div className="flex-1 flex justify-center">
        {/* <div className="flex items-center gap-2 rounded-full bg-action border border-stroke-default px-3.5 py-1">
          <AppIcon name="organisation" size="sm" className="text-fg-tertiary" />
          <span className="text-xs text-fg-tertiary">Pharma Client</span>
        </div> */}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleAssistant}
          className="flex items-center gap-2 rounded-md bg-action border border-stroke-muted px-3 h-8 text-fg-tertiary hover:bg-raised hover:text-fg-secondary transition-colors duration-200"
        >
          <AppIcon name="agent" size="sm" className="text-pillar-02" />
          <span className="text-xs">Ask AI</span>
          <span className="font-mono text-3xs text-fg-quaternary">⌘K</span>
        </button>
        <IconButton
          icon={theme === 'light' ? 'themeDark' : 'themeLight'}
          size="sm"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        />
        <div className="relative">
          <IconButton
            icon="notification"
            size="sm"
            onClick={() => showToast('3 pending notifications')}
            aria-label="Notifications, 3 pending"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full text-3xs font-mono grid place-items-center bg-error-icon text-fg-on-color"
          >
            3
          </span>
        </div>
        <div
          className="w-8 h-8 rounded-full grid place-items-center border text-pillar-03"
          style={{
            background: 'color-mix(in oklab, var(--pillar-03) 12%, transparent)',
            borderColor: 'color-mix(in oklab, var(--pillar-03) 30%, transparent)',
          }}
          title={session?.email}
        >
          <span className="text-xs font-medium">{initials}</span>
        </div>
        <IconButton icon="signOut" size="sm" onClick={logout} aria-label="Sign out" title="Sign out" />
      </div>
    </header>
  );
}

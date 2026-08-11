import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Bell, Building2, Sparkles, Sun, Moon, LogOut } from 'lucide-react';
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
    <header className="fixed top-0 inset-x-0 h-14 z-50 bg-card border-b border-border flex items-center px-4 gap-4">
      <div className="flex items-center gap-3">
        <img src={theme === 'dark' ? niyo360LogoDark : niyo360Logo} alt="Niyo360" className="h-7 w-auto" />
        <div className="h-6 w-px bg-border" />
        <div className="flex items-baseline gap-1.5">
          <h1 className="font-display text-[16px] font-semibold text-foreground leading-none">Niyo360</h1>
          <span className="font-display text-[16px] font-semibold leading-none" style={{ color: 'var(--pillar-01)' }}>
            Change Intelligence
          </span>
        </div>

        {/* <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
          style={{ background: 'color-mix(in oklab, var(--pillar-02) 12%, transparent)', color: 'var(--pillar-02)' }}
        >
          POC
        </span> */}
      </div>

      <div className="flex-1 flex justify-center">
        {/* <div className="flex items-center gap-2 rounded-full bg-muted border border-border px-3.5 py-1">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">Pharma Client</span>
        </div> */}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleAssistant}
          className="flex items-center gap-2 rounded-md bg-muted border border-border px-3 h-8 hover:bg-accent transition"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--pillar-02)' }} />
          <span className="text-[12px] text-muted-foreground">Ask AI</span>
          <span className="font-mono text-[10px] text-muted-foreground/70">⌘K</span>
        </button>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-md hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <button
          onClick={() => showToast('3 pending notifications')}
          className="relative w-8 h-8 rounded-md hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-[9px] font-mono grid place-items-center text-white" style={{ background: 'var(--status-red)' }}>3</span>
        </button>
        <div
          className="w-8 h-8 rounded-full grid place-items-center border"
          style={{
            background: 'color-mix(in oklab, var(--pillar-03) 12%, transparent)',
            borderColor: 'color-mix(in oklab, var(--pillar-03) 30%, transparent)',
            color: 'var(--pillar-03)',
          }}
          title={session?.email}
        >
          <span className="text-[12px] font-medium">{initials}</span>
        </div>
        <button
          onClick={logout}
          className="w-8 h-8 rounded-md hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

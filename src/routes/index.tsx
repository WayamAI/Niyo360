import { createFileRoute } from "@tanstack/react-router";
import { AppProvider, isScreenId, type ScreenId } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Shell } from "@/components/Shell";
import { Login } from "@/components/screens/Login";
import { BrandLockup } from "@/components/shared/Logo";

/**
 * Which screen the shell is showing, and which record it is showing, are
 * carried in the URL.
 *
 * The shell switches screens by state rather than by route, which is why
 * refreshing a drill-in used to drop the user back on the dashboard and why
 * the browser's Back button skipped the whole session in one step. Putting the
 * pair in the query string gives every screen a shareable address and makes
 * Back, Forward and Reload behave, without splitting a 30-screen shell into 30
 * file routes.
 *
 * `screen` is validated against the real screen list, so a hand-edited URL
 * falls back to the dashboard instead of rendering nothing.
 */
export interface ShellSearch {
  screen?: ScreenId;
  id?: string;
}

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>): ShellSearch => ({
    screen: isScreenId(search.screen) ? search.screen : undefined,
    id: typeof search.id === "string" && search.id.length > 0 ? search.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "PARIVART — Regulatory Change Intelligence" },
      {
        name: "description",
        content:
          "PARIVART — regulatory feed monitor, Impact Delta Reports, and the Regulatory Intelligence Agent.",
      },
    ],
  }),
});

function Index() {
  // ThemeProvider sits outside the auth gate so the `.dark` class is applied
  // on the sign-in screen too; AppProvider stays inside it so signing out
  // still resets app state.
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Shown while the stored token is validated against /auth/me. Without it the
 * sign-in screen flashes for anyone with a valid session, and protected
 * screens could fire API calls before the session is confirmed.
 */
function AuthSplash() {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-page"
      role="status"
      aria-live="polite"
    >
      <BrandLockup height={72} />
      <p className="type-body-md text-fg-tertiary">Restoring your session…</p>
    </div>
  );
}

function Gate() {
  const { status } = useAuth();

  if (status === "checking") return <AuthSplash />;
  if (status === "unauthenticated") return <Login />;

  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

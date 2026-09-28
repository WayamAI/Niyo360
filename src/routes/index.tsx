import { createFileRoute } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Shell } from "@/components/Shell";
import { Login } from "@/components/screens/Login";
import { BrandLockup } from "@/components/shared/Logo";

export const Route = createFileRoute("/")({
  component: Index,
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

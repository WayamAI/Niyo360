import { createFileRoute } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Shell } from "@/components/Shell";
import { Login } from "@/components/screens/Login";

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

function Gate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Login />;
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

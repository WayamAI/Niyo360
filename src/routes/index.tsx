import { createFileRoute } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Niyo360 Change Intelligence" },
      {
        name: "description",
        content:
          "Niyo360 Change Intelligence — regulatory feed monitor, Impact Delta Reports, and the Regulatory Intelligence Agent.",
      },
    ],
  }),
});

function Index() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

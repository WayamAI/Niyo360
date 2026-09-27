import type { ReactNode } from "react";

/**
 * Agent output surface.
 *
 * The one card treatment left after the design-system migration: a block whose
 * left edge is tinted with a pillar accent, marking content the user is
 * reading as *generated* rather than recorded. Everything that used to be a
 * generic `Card` is now a `Panel` (Panel.tsx), which owns a header strip and
 * can bound its own scroll area.
 */
export function AgentCard({
  pillar = "02",
  children,
  className = "",
}: {
  pillar?: "01" | "02" | "03" | "04";
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-stroke-default bg-container p-4 ${className}`}
      style={{ borderLeft: `2px solid var(--pillar-${pillar})` }}
    >
      {children}
    </section>
  );
}

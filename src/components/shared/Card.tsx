import type { ReactNode, HTMLAttributes } from "react";

/**
 * Surface primitives. All elevation is expressed through the semantic
 * surface + stroke tokens — restrained, no glass blur, no large shadows.
 */
export function Card({ children, className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-stroke-default bg-raised p-5 shadow-sm transition-colors duration-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

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
    <div
      className={`rounded-2xl border border-stroke-default bg-raised p-5 border-l-[3px] transition-colors duration-200 ${className}`}
      style={{ borderLeftColor: `var(--pillar-${pillar})` }}
    >
      {children}
    </div>
  );
}

export function PillarCard({
  pillar,
  children,
  className = "",
}: {
  pillar: "01" | "02" | "03" | "04";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-stroke-default p-5 border-l-4 transition-colors duration-200 ${className}`}
      style={{
        borderLeftColor: `var(--pillar-${pillar})`,
        background: `color-mix(in oklab, var(--pillar-${pillar}) 5%, var(--surface-raised))`,
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`type-label-md text-fg-quaternary mb-3 ${className}`}>{children}</div>;
}

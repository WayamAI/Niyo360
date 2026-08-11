import type { ReactNode, HTMLAttributes } from 'react';

export function Card({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-5 transition-colors duration-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function AgentCard({ pillar = '02', children, className = '' }: { pillar?: '01'|'02'|'03'|'04'; children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-5 border-l-[3px] ${className}`}
      style={{ borderLeftColor: `var(--pillar-${pillar})` }}
    >
      {children}
    </div>
  );
}

export function PillarCard({ pillar, children, className = '' }: { pillar: '01'|'02'|'03'|'04'; children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border p-5 border-l-4 transition-colors ${className}`}
      style={{
        borderLeftColor: `var(--pillar-${pillar})`,
        background: `color-mix(in oklab, var(--pillar-${pillar}) 4%, var(--card))`,
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-[11px] font-medium uppercase tracking-[0.09em] text-muted-foreground mb-3 ${className}`}>
      {children}
    </div>
  );
}

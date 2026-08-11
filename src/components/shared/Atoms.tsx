import { ShieldAlert } from 'lucide-react';

export function HumanInLoopBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border ${compact ? 'p-3' : 'p-4'}`}
      style={{
        background: 'color-mix(in oklab, var(--pillar-02) 8%, var(--card))',
        borderColor: 'color-mix(in oklab, var(--pillar-02) 30%, transparent)',
      }}
    >
      <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--pillar-02)' }} />
      <p className="text-[12px] text-foreground/80 leading-relaxed">
        All AI-generated drafts require regulatory specialist review and approval before submission.
        AI output is a structured first draft only. FDA oversight requirements for AI-assisted submissions
        are satisfied through mandatory human-in-the-loop sign-off.
      </p>
    </div>
  );
}

export function ConfidencePill({ value, pillar = '02' }: { value: number; pillar?: '01'|'02'|'03'|'04' }) {
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px]"
      style={{
        color: `var(--pillar-${pillar})`,
        background: `color-mix(in oklab, var(--pillar-${pillar}) 12%, transparent)`,
      }}
    >
      {value}% confidence
    </span>
  );
}

export function ThinkingDots() {
  return (
    <span className="dot-pulse inline-flex items-center">
      <span /><span /><span />
    </span>
  );
}

export function ValueSignal({ level }: { level: 'High Value' | 'Medium-High Value' | 'Conditional Value' }) {
  const map = {
    'High Value':         { color: 'var(--status-green)', label: level },
    'Medium-High Value':  { color: 'var(--status-amber)', label: level },
    'Conditional Value':  { color: 'var(--status-blue)',  label: level },
  } as const;
  const { color, label } = map[level];
  return (
    <div
      className="flex items-center gap-2 rounded-md px-3 h-8 text-[12px] font-medium"
      style={{ color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

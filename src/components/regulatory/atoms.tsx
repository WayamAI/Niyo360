import { AUTHORITIES, type AuthorityCode, type FilingType, type EventStage, type ReportStatus, daysUntil, deadlineColor, confidenceColor } from '@/data/regulatoryData';

export function AuthorityBadge({ code }: { code: AuthorityCode }) {
  const a = AUTHORITIES[code];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
      style={{ background: `color-mix(in oklab, ${a.color} 14%, transparent)`, color: a.color, borderLeft: `2px solid ${a.color}` }}
      title={a.name}
    >
      {a.id}
    </span>
  );
}

const FILING_COLOR: Record<FilingType, string> = {
  IA: '#818cf8', IB: '#a78bfa', II: '#f472b6', NDA: '#fb923c', None: '#6b7280', TBD: '#9ca3af',
};

export function FilingTypeBadge({ type, large = false }: { type: FilingType; large?: boolean }) {
  const color = FILING_COLOR[type];
  return (
    <span
      className={`inline-flex items-center rounded font-semibold uppercase tracking-wider whitespace-nowrap ${large ? 'px-3 py-1.5 text-[13px]' : 'px-2 py-0.5 text-[11px]'}`}
      style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
    >
      {type === 'None' ? 'No Action' : `Type ${type === 'NDA' ? 'NDA / PAS' : type}`}
    </span>
  );
}

const STAGE_TONE: Record<EventStage | ReportStatus, string> = {
  Detected:       'var(--muted-foreground)',
  Processing:     'var(--status-blue)',
  Mapped:         'var(--pillar-01)',
  'Under Review': 'var(--status-amber)',
  Approved:       'var(--status-green)',
  Overridden:     'var(--status-blue)',
  Filed:          '#14b8a6',
  Closed:         'var(--muted-foreground)',
  Draft:          'var(--muted-foreground)',
  'No Action':    'var(--muted-foreground)',
};

export function StatusPill({ status }: { status: EventStage | ReportStatus }) {
  const color = STAGE_TONE[status] ?? 'var(--muted-foreground)';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap"
      style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

export function DeadlineCountdown({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground text-[12px]">—</span>;
  const days = daysUntil(date)!;
  const color = deadlineColor(days);
  return (
    <div className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-[12px] font-medium" style={{ color }}>
        {days < 0 ? 'OVERDUE' : `${days}d`}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">{date}</span>
    </div>
  );
}

export function ConfidenceRing({ value, size = 36 }: { value: number | null; size?: number }) {
  if (value === null) return <span className="text-muted-foreground text-[11px]">—</span>;
  const color = confidenceColor(value);
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--muted)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute font-mono font-semibold" style={{ color, fontSize: size > 60 ? 16 : 10 }}>{value}</span>
    </div>
  );
}

export function ConfidenceBreakdownBars({ breakdown }: { breakdown: { label: string; value: number | null }[] }) {
  return (
    <div className="space-y-2">
      {breakdown.map(b => (
        <div key={b.label}>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">{b.label}</span>
            <span className="font-mono" style={{ color: confidenceColor(b.value) }}>{b.value === null ? 'n/a' : `${b.value}%`}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${b.value ?? 0}%`, background: confidenceColor(b.value) }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketBadge({ code, tone = 'confirmed' }: { code: string; tone?: 'confirmed' | 'review' }) {
  const color = tone === 'confirmed' ? 'var(--status-green)' : 'var(--status-amber)';
  return (
    <span
      className="inline-flex items-center rounded px-2 py-1 text-[11px] font-medium font-mono"
      style={{ background: `color-mix(in oklab, ${color} 12%, transparent)`, color, border: `1px solid color-mix(in oklab, ${color} 30%, transparent)` }}
    >
      {code}
    </span>
  );
}

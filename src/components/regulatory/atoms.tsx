import {
  AUTHORITIES,
  type AuthorityCode,
  type FilingType,
  type EventStage,
  type ReportStatus,
  daysUntil,
  deadlineColor,
  confidenceColor,
} from "@/data/regulatoryData";

export function AuthorityBadge({ code }: { code: AuthorityCode }) {
  const a = AUTHORITIES[code];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-2xs font-medium uppercase tracking-wider"
      style={{
        background: `color-mix(in oklab, ${a.color} 14%, transparent)`,
        color: a.color,
        borderLeft: `2px solid ${a.color}`,
      }}
      title={a.name}
    >
      {a.id}
    </span>
  );
}

const FILING_COLOR: Record<FilingType, string> = {
  IA: "var(--filing-ia)",
  IB: "var(--filing-ib)",
  II: "var(--filing-ii)",
  NDA: "var(--filing-nda)",
  None: "var(--filing-none)",
  TBD: "var(--filing-tbd)",
};

export function FilingTypeBadge({ type, large = false }: { type: FilingType; large?: boolean }) {
  const color = FILING_COLOR[type];
  return (
    <span
      className={`inline-flex items-center rounded font-semibold uppercase tracking-wider whitespace-nowrap ${large ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-2xs"}`}
      style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
    >
      {type === "None" ? "No Action" : `Type ${type === "NDA" ? "NDA / PAS" : type}`}
    </span>
  );
}

const STAGE_TONE: Record<EventStage | ReportStatus, string> = {
  Detected: "var(--fg-tertiary)",
  Processing: "var(--feedback-info-icon)",
  Mapped: "var(--pillar-01)",
  "Under Review": "var(--feedback-warning-icon)",
  Approved: "var(--feedback-success-icon)",
  Overridden: "var(--feedback-info-icon)",
  Filed: "var(--data-accent)",
  Closed: "var(--fg-tertiary)",
  Draft: "var(--fg-tertiary)",
  "No Action": "var(--fg-tertiary)",
};

export function StatusPill({ status }: { status: EventStage | ReportStatus }) {
  const color = STAGE_TONE[status] ?? "var(--fg-tertiary)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-medium whitespace-nowrap"
      style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

export function DeadlineCountdown({ date }: { date: string | null }) {
  if (!date) return <span className="text-fg-tertiary text-xs">—</span>;
  const days = daysUntil(date)!;
  const color = deadlineColor(days);
  return (
    <div className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-xs font-medium" style={{ color }}>
        {days < 0 ? "OVERDUE" : `${days}d`}
      </span>
      <span className="font-mono text-3xs text-fg-tertiary">{date}</span>
    </div>
  );
}

export function ConfidenceRing({ value, size = 36 }: { value: number | null; size?: number }) {
  if (value === null) return <span className="text-fg-tertiary text-2xs">—</span>;
  const color = confidenceColor(value);
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--surface-action)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute font-mono font-semibold"
        style={{ color, fontSize: size > 60 ? 16 : 10 }}
      >
        {value}
      </span>
    </div>
  );
}

export function ConfidenceBreakdownBars({
  breakdown,
}: {
  breakdown: { label: string; value: number | null }[];
}) {
  return (
    <div className="space-y-2">
      {breakdown.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between text-2xs mb-1">
            <span className="text-fg-tertiary">{b.label}</span>
            <span className="font-mono" style={{ color: confidenceColor(b.value) }}>
              {b.value === null ? "n/a" : `${b.value}%`}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-action overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${b.value ?? 0}%`, background: confidenceColor(b.value) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketBadge({
  code,
  tone = "confirmed",
}: {
  code: string;
  tone?: "confirmed" | "review";
}) {
  const color =
    tone === "confirmed" ? "var(--feedback-success-icon)" : "var(--feedback-warning-icon)";
  return (
    <span
      className="inline-flex items-center rounded px-2 py-1 text-2xs font-medium font-mono"
      style={{
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        color,
        border: `1px solid color-mix(in oklab, ${color} 30%, transparent)`,
      }}
    >
      {code}
    </span>
  );
}

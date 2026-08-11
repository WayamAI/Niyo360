import type { ReactNode } from 'react';

type BadgeVariant =
  | 'type-ii' | 'type-ib' | 'type-ia' | 'type-cbe' | 'type-pas'
  | 'high-risk' | 'medium-risk' | 'low-risk'
  | 'complete' | 'in-progress' | 'pending' | 'overdue' | 'open'
  | 'agent'
  | 'pillar-01' | 'pillar-02' | 'pillar-03' | 'pillar-04'
  | 'neutral' | 'critical' | 'major' | 'minor' | 'warning';

const styles: Record<BadgeVariant, string> = {
  'type-ii':       'text-[color:var(--status-red)] bg-[color:var(--status-red)]/10',
  'type-ib':       'text-[color:var(--status-amber)] bg-[color:var(--status-amber)]/10',
  'type-ia':       'text-[color:var(--status-green)] bg-[color:var(--status-green)]/10',
  'type-cbe':      'text-[color:var(--status-blue)] bg-[color:var(--status-blue)]/10',
  'type-pas':      'text-[color:var(--pillar-02)] bg-[color:var(--pillar-02)]/10',
  'high-risk':     'text-[color:var(--status-red)] bg-[color:var(--status-red)]/10',
  'medium-risk':   'text-[color:var(--status-amber)] bg-[color:var(--status-amber)]/10',
  'low-risk':      'text-[color:var(--status-green)] bg-[color:var(--status-green)]/10',
  'complete':      'text-[color:var(--status-green)] bg-[color:var(--status-green)]/10',
  'in-progress':   'text-[color:var(--status-amber)] bg-[color:var(--status-amber)]/10',
  'pending':       'text-muted-foreground bg-muted',
  'overdue':       'text-[color:var(--status-red)] bg-[color:var(--status-red)]/10',
  'open':          'text-[color:var(--status-blue)] bg-[color:var(--status-blue)]/10',
  'agent':         'text-[color:var(--pillar-02)] bg-[color:var(--pillar-02)]/10',
  'pillar-01':     'text-[color:var(--pillar-01)] bg-[color:var(--pillar-01)]/10',
  'pillar-02':     'text-[color:var(--pillar-02)] bg-[color:var(--pillar-02)]/10',
  'pillar-03':     'text-[color:var(--pillar-03)] bg-[color:var(--pillar-03)]/10',
  'pillar-04':     'text-[color:var(--pillar-04)] bg-[color:var(--pillar-04)]/10',
  'neutral':       'text-muted-foreground bg-muted',
  'critical':      'text-[color:var(--status-red)] bg-[color:var(--status-red)]/10',
  'major':         'text-[color:var(--status-amber)] bg-[color:var(--status-amber)]/10',
  'minor':         'text-[color:var(--status-blue)] bg-[color:var(--status-blue)]/10',
  'warning':       'text-[color:var(--status-amber)] bg-[color:var(--status-amber)]/10',
};

export function Badge({ variant = 'neutral', children, className = '' }: { variant?: BadgeVariant; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider whitespace-nowrap ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function badgeForVariation(v: string): BadgeVariant {
  if (v.includes('II')) return 'type-ii';
  if (v.includes('IB')) return 'type-ib';
  if (v.includes('IA')) return 'type-ia';
  if (v.includes('CBE')) return 'type-cbe';
  if (v.includes('PAS') || v.includes('Prior')) return 'type-pas';
  return 'neutral';
}
export function badgeForRisk(r: string): BadgeVariant {
  if (r === 'High' || r === 'Critical') return 'high-risk';
  if (r === 'Medium') return 'medium-risk';
  return 'low-risk';
}
export function badgeForStatus(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'Open': 'open', 'In Progress': 'in-progress', 'Complete': 'complete',
    'Overdue': 'overdue', 'Pending': 'pending', 'Action Required': 'overdue',
    'Under Review': 'in-progress', 'Reviewed': 'complete', 'Impact Assessed': 'open',
    'Draft Ready': 'complete', 'Filed': 'complete', 'Filing Preparation': 'in-progress',
    'In Classification': 'in-progress', 'Simulation Complete': 'complete',
    'Pending Simulation': 'pending', 'Issues Found': 'overdue', 'Minor Issues': 'in-progress',
    'In Review': 'in-progress',
  };
  return map[s] || 'neutral';
}

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/shared/Card';
import { Badge, badgeForRisk, badgeForStatus } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Drawer } from '@/components/shared/Drawer';
import { ESCALATIONS } from '@/data/mockData';

export function Escalations() {
  const { showToast, logAudit, resolveEscalation, resolvedEscalations } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? ESCALATIONS.find(e => e.id === openId) : null;

  const counts = {
    critical: ESCALATIONS.filter(e => e.severity === 'Critical').length,
    high: ESCALATIONS.filter(e => e.severity === 'High').length,
    inProgress: ESCALATIONS.filter(e => e.status === 'In Progress').length,
  };

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="type-display-page text-fg-primary">Escalations</h1>
          <p className="text-sm text-fg-tertiary mt-1">Open items requiring regulatory affairs attention across all capability pillars.</p>
        </div>
        <Badge variant="open">{ESCALATIONS.length} open escalations</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="CRITICAL / OPEN" value={counts.critical} color="var(--feedback-error-icon)" />
        <StatCard label="HIGH / OPEN" value={counts.high} color="var(--feedback-warning-icon)" />
        <StatCard label="IN PROGRESS" value={counts.inProgress} color="var(--feedback-info-icon)" />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-action text-fg-quaternary type-label-md sticky top-0 z-10">
                {['ID', 'Severity', 'Pillar', 'Product / Market', 'Issue Type', 'Summary', 'SLA Days', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {ESCALATIONS.map(e => {
                const resolved = resolvedEscalations.has(e.id);
                const daysColor = e.slaDaysRemaining < 7 ? 'var(--feedback-error-icon)' : e.slaDaysRemaining < 21 ? 'var(--feedback-warning-icon)' : 'var(--feedback-success-icon)';
                return (
                  <tr key={e.id} className="border-t border-stroke-muted transition-colors duration-200 hover:bg-raised-2">
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--brand)' }}>{e.id}</td>
                    <td className="px-4 py-3"><Badge variant={badgeForRisk(e.severity)}>{e.severity}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={`pillar-${e.pillar}` as any}>P{e.pillar}</Badge></td>
                    <td className="px-4 py-3"><div className="text-fg-primary font-medium">{e.productName}</div><div className="text-2xs text-fg-tertiary">{e.market}</div></td>
                    <td className="px-4 py-3 text-fg-tertiary">{e.issueType}</td>
                    <td className="px-4 py-3 text-fg-tertiary max-w-[300px]"><span className="line-clamp-2">{e.issue}</span></td>
                    <td className="px-4 py-3 font-mono" style={{ color: daysColor }}>{e.slaDaysRemaining}</td>
                    <td className="px-4 py-3"><Badge variant={resolved ? 'complete' : badgeForStatus(e.status)}>{resolved ? 'Resolved' : e.status}</Badge></td>
                    <td className="px-4 py-3 flex gap-1">
                      <Button size="sm" onClick={() => setOpenId(e.id)}>View</Button>
                      {!resolved && <Button variant="ghost" size="sm" onClick={() => { resolveEscalation(e.id); showToast(`${e.id} resolved.`, 'success'); logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: e.pillar, action: `Resolved escalation ${e.id}` }); }}>Resolve</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.id || ''}
        subtitle={open ? `${open.productName} · ${open.market}` : ''}
        width={520}
        footer={
          open && (
            <>
              <Button variant="ghost" onClick={() => setOpenId(null)}>Close</Button>
              <Button variant="secondary" onClick={() => showToast('Escalated to senior leadership.')}>Escalate Further</Button>
              <Button onClick={() => { resolveEscalation(open.id); showToast(`${open.id} marked as resolved.`, 'success'); setOpenId(null); }}>Mark as Resolved</Button>
            </>
          )
        }
      >
        {open && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={badgeForRisk(open.severity)}>{open.severity}</Badge>
              <Badge variant={`pillar-${open.pillar}` as any}>Pillar {open.pillar}</Badge>
              <Badge variant={badgeForStatus(open.status)}>{open.status}</Badge>
            </div>
            <p className="text-sm text-fg-primary leading-relaxed">{open.issue}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md bg-action p-2.5"><div className="text-3xs uppercase tracking-wider text-fg-tertiary">Raised By</div><div className="text-fg-primary mt-1">{open.raisedBy}</div></div>
              <div className="rounded-md bg-action p-2.5"><div className="text-3xs uppercase tracking-wider text-fg-tertiary">SLA Deadline</div><div className="text-fg-primary mt-1 font-mono">{open.slaDeadline}</div></div>
              <div className="rounded-md bg-action p-2.5"><div className="text-3xs uppercase tracking-wider text-fg-tertiary">Days Remaining</div><div className="text-fg-primary mt-1 font-mono">{open.slaDaysRemaining}</div></div>
              <div className="rounded-md bg-action p-2.5"><div className="text-3xs uppercase tracking-wider text-fg-tertiary">Change ID</div><div className="text-fg-primary mt-1 font-mono">{open.changeId}</div></div>
            </div>
            <label className="block">
              <span className="text-2xs uppercase tracking-wider text-fg-tertiary">Assign To</span>
              <select className="mt-1 w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm">
                {['Regulatory Operations Team', 'EU Regulatory Affairs Team', 'CMC Regulatory Team', 'Quality Assurance'].map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-2xs uppercase tracking-wider text-fg-tertiary">Notes</span>
              <textarea rows={3} className="mt-1 w-full rounded-md bg-action border border-stroke-default px-3 py-2 text-sm" placeholder="Add notes..." />
            </label>
          </>
        )}
      </Drawer>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <div className="text-2xs uppercase tracking-wider text-fg-tertiary mb-2">{label}</div>
      <div className="type-display-metric-md" style={{ color }}>{value}</div>
    </Card>
  );
}

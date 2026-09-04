import { AppIcon } from "@/components/icons";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Eyebrow } from '@/components/shared/Card';
import { Badge, badgeForStatus } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Drawer';
import { VALIDATION_REPORTS, CHANGES, PRODUCTS, PRODUCT_BY_ID } from '@/data/mockData';

export function PreSubmissionValidator() {
  const { navigateTo, showToast, logAudit } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [jurisdiction, setJurisdiction] = useState('EMA');

  const start = () => {
    setModalOpen(false);
    setRunning(true);
    logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '03', action: `Started validation run for ${productId} / ${jurisdiction}` });
    setTimeout(() => {
      setRunning(false);
      showToast('Validation complete. 148 checks performed.', 'success');
      logAudit({ actor: 'Compliance Validator', actorType: 'agent', pillar: '03', action: 'Validation run completed. 148 checks, 12 failed.' });
    }, 3000);
  };

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="type-display-page text-fg-primary">Pre-Submission Dossier Validator</h1>
            <Badge variant="pillar-03">Pillar 03</Badge>
          </div>
          <p className="text-sm text-fg-tertiary mt-1 max-w-3xl">
            Semantic-layer validation across CTD modules. Checks cross-module consistency, jurisdiction-specific mandatory field completeness, and labelling compliance against current authority requirements.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}><AppIcon name="simulator" size="sm" /> Run New Validation</Button>
      </div>

      {running && (
        <Card>
          <div className="text-xs text-fg-tertiary mb-2">Validation in progress...</div>
          <div className="h-2 rounded-full bg-action overflow-hidden">
            <div className="sim-bar h-full" style={{ background: 'var(--pillar-03)' }} />
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {VALIDATION_REPORTS.map(r => {
          const scoreColor = r.overallScore >= 90 ? 'var(--feedback-success-icon)' : r.overallScore >= 75 ? 'var(--feedback-warning-icon)' : 'var(--feedback-error-icon)';
          const p = PRODUCT_BY_ID(r.productId)!;
          return (
            <Card key={r.id} className="border-t-[3px]" style={{ borderTopColor: 'var(--pillar-03)' }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[220px]">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs" style={{ color: 'var(--pillar-03)' }}>{r.id}</span>
                    <span className="text-sm text-fg-primary font-medium">{p.name}</span>
                    <Badge variant="pillar-03">{r.jurisdiction}</Badge>
                    <span className="font-mono text-2xs text-fg-tertiary">{r.validationDate}</span>
                    <span className="font-mono text-2xs text-fg-tertiary rounded bg-action px-1.5 py-0.5">{r.ectdVersion}</span>
                  </div>
                  <div className="text-xs text-fg-tertiary mt-1">{r.dossierTitle}</div>
                  <div className="text-xs text-fg-tertiary mt-2">{r.totalChecks} checks · {r.passed} passed · {r.warnings} warnings · {r.failed} failed</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="font-mono leading-none" style={{ color: scoreColor, fontSize: 40 }}>{r.overallScore}</div>
                  <div className="text-2xs text-fg-tertiary mt-1">/ 100</div>
                  <Badge variant={badgeForStatus(r.status)} className="mt-2">{r.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { l: 'Critical', v: r.issues.filter(i => i.severity === 'Critical').length, c: 'var(--feedback-error-icon)' },
                  { l: 'Major', v: r.issues.filter(i => i.severity === 'Major').length, c: 'var(--feedback-warning-icon)' },
                  { l: 'Minor', v: r.issues.filter(i => i.severity === 'Minor').length, c: 'var(--feedback-info-icon)' },
                  { l: 'Passed', v: r.passed, c: 'var(--feedback-success-icon)' },
                ].map(s => (
                  <div key={s.l} className="rounded-md bg-action p-3">
                    <div className="text-2xs uppercase tracking-wider text-fg-tertiary">{s.l}</div>
                    <div className="type-display-metric-xs mt-1" style={{ color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => navigateTo('validation-reports')}>View Full Report</Button>
                <Button variant="ghost" onClick={() => showToast('Report exported as PDF', 'success')}>Export Report</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Validation Run"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={start}>Start Validation</Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="text-2xs uppercase tracking-wider text-fg-tertiary">Product</span>
            <select value={productId} onChange={e => setProductId(e.target.value)} className="mt-1 w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm text-fg-primary">
              {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-2xs uppercase tracking-wider text-fg-tertiary">Change</span>
            <select className="mt-1 w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm text-fg-primary">
              {CHANGES.filter(c => c.productId === productId).map(c => <option key={c.id}>{c.id}, {c.title}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-2xs uppercase tracking-wider text-fg-tertiary">Jurisdiction</span>
            <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} className="mt-1 w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm text-fg-primary">
              {['EMA', 'FDA', 'PMDA', 'ANVISA', 'MHRA', 'Health Canada'].map(j => <option key={j}>{j}</option>)}
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}

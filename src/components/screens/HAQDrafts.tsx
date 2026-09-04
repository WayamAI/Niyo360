import { AppIcon } from "@/components/icons";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, AgentCard, Eyebrow } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { ConfidencePill, HumanInLoopBanner } from '@/components/shared/Atoms';
import { Drawer } from '@/components/shared/Drawer';
import { HAQ_DRAFTS, PRODUCT_BY_ID } from '@/data/mockData';

export function HAQDrafts() {
  const { showToast, logAudit } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? HAQ_DRAFTS.find(h => h.id === openId) : null;

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="type-display-page text-fg-primary">HAQ Response Drafts</h1>
            <Badge variant="pillar-02">Pillar 02</Badge>
          </div>
          <p className="text-sm text-fg-tertiary mt-1 max-w-3xl">
            AI-drafted Health Authority Query responses grounded in approved dossier content and current regulatory guidelines. All output requires human review before submission.
          </p>
        </div>
        <Button onClick={() => showToast('New HAQ intake created.', 'success')}>New HAQ</Button>
      </div>

      <HumanInLoopBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'OPEN HAQS', v: '4', n: '2 High priority' },
          { l: 'DRAFTS READY', v: '2', n: 'Awaiting reviewer sign-off' },
          { l: 'UNDER REVIEW', v: '1' },
          { l: 'OVERDUE', v: '1', c: 'var(--feedback-error-icon)', red: true },
        ].map(k => (
          <Card key={k.l} className={k.red ? '' : ''} style={k.red ? { background: 'color-mix(in oklab, var(--feedback-error-icon) 6%, var(--surface-raised))' } : undefined}>
            <div className="text-2xs font-medium uppercase tracking-wider text-fg-tertiary mb-2">{k.l}</div>
            <div className="type-display-metric-md" style={{ color: k.c || 'var(--fg-primary)' }}>{k.v}</div>
            {k.n && <div className="text-xs text-fg-tertiary mt-2">{k.n}</div>}
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-action text-fg-quaternary type-label-md sticky top-0 z-10">
                {['HAQ ID', 'Product', 'Market / Authority', 'Deadline', 'Days', 'Status', 'Confidence', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HAQ_DRAFTS.map(h => {
                const p = PRODUCT_BY_ID(h.productId)!;
                const daysColor = h.daysRemaining < 1 ? 'var(--feedback-error-icon)' : h.daysRemaining < 14 ? 'var(--feedback-error-icon)' : h.daysRemaining < 30 ? 'var(--feedback-warning-icon)' : 'var(--feedback-success-icon)';
                return (
                  <tr key={h.id} className="border-t border-stroke-muted transition-colors duration-200 hover:bg-raised-2">
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--pillar-02)' }}>{h.id}</td>
                    <td className="px-4 py-3"><div className="text-fg-primary font-medium">{p.name}</div><div className="text-2xs text-fg-tertiary">{p.dosageForm}</div></td>
                    <td className="px-4 py-3 text-fg-primary">{h.market}, {h.authority}</td>
                    <td className="px-4 py-3 font-mono text-fg-tertiary">{h.queryDeadline}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: daysColor }}>{h.daysRemaining}</td>
                    <td className="px-4 py-3"><Badge variant={h.status === 'Draft Ready' ? 'complete' : h.status === 'Overdue' ? 'overdue' : 'in-progress'}>{h.status}</Badge></td>
                    <td className="px-4 py-3"><ConfidencePill value={h.aiConfidence} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => { setOpenId(h.id); logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '02', action: `Viewed draft ${h.id}` }); }}>View Draft</Button>
                      </div>
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
        title={open ? `${open.id} · ${PRODUCT_BY_ID(open.productId)?.name}` : ''}
        subtitle={open ? `${open.market}, ${open.authority} · ${open.daysRemaining} days remaining` : ''}
        width={620}
        footer={
          open && (
            <>
              <Button variant="ghost" onClick={() => showToast('Draft downloaded as .docx', 'success')}>Download Draft</Button>
              <Button variant="secondary" onClick={() => showToast('Revision request sent to drafting queue.')}>Request Edits</Button>
              <Button onClick={() => { showToast('HAQ response approved. Added to submission queue.', 'success'); logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '02', action: `Approved HAQ response ${open.id}` }); setOpenId(null); }}>Approve for Submission</Button>
            </>
          )
        }
      >
        {open && (
          <>
            <section>
              <Eyebrow>Health Authority Query</Eyebrow>
              <div className="rounded-md bg-action p-3.5" style={{ borderLeft: '3px solid var(--feedback-error-icon)' }}>
                <p className="text-sm text-fg-tertiary italic leading-relaxed">{open.queryText}</p>
                <div className="text-2xs text-fg-tertiary mt-2 flex gap-3">
                  <span>Received: <span className="font-mono">{open.queryReceivedDate}</span></span>
                  <span>Deadline: <span className="font-mono">{open.queryDeadline}</span></span>
                </div>
              </div>
            </section>

            <AgentCard pillar="02">
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <span className="text-sm font-medium text-fg-primary">HAQ Drafting Agent</span>
                <div className="flex items-center gap-2">
                  <ConfidencePill value={open.aiConfidence} />
                  <span className="font-mono text-2xs text-fg-tertiary">{open.draftWordCount} words</span>
                </div>
              </div>
              <div className="text-sm text-fg-primary leading-relaxed space-y-2.5 whitespace-pre-line">{open.draftBody}</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {open.ctdSectionsReferenced.map(c => (
                  <span key={c} className="text-2xs rounded bg-action px-2 py-1 text-fg-tertiary font-mono">{c}</span>
                ))}
              </div>
            </AgentCard>

            <HumanInLoopBanner compact />

            <section>
              <Eyebrow>Source Documents Referenced</Eyebrow>
              <ul className="space-y-1.5">
                {open.ctdSectionsReferenced.map(s => (
                  <li key={s} className="flex items-center gap-2 text-xs text-fg-primary">
                    <AppIcon name="document" size="sm" className="text-fg-tertiary" /> {s}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </Drawer>
    </div>
  );
}

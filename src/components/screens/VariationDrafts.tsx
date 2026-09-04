import { AppIcon } from "@/components/icons";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, AgentCard, Eyebrow } from '@/components/shared/Card';
import { Badge, badgeForVariation } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { ConfidencePill, HumanInLoopBanner } from '@/components/shared/Atoms';
import { Drawer } from '@/components/shared/Drawer';
import { VARIATION_SECTION_DRAFTS, PRODUCT_BY_ID } from '@/data/mockData';

export function VariationDrafts() {
  const { showToast, logAudit } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? VARIATION_SECTION_DRAFTS.find(d => d.id === openId) : null;

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="type-display-page text-fg-primary">Variation Section Drafts</h1>
            <Badge variant="pillar-02">Pillar 02</Badge>
          </div>
          <p className="text-sm text-fg-tertiary mt-1 max-w-3xl">
            AI-generated first drafts for CTD variation sections, grounded in approved dossier content. All output requires regulatory specialist review.
          </p>
        </div>
        <Button onClick={() => showToast('Draft request submitted. HAQ Drafting Agent will begin within 2 minutes.', 'success')}>New Draft Request</Button>
      </div>

      <HumanInLoopBanner />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-action text-fg-quaternary type-label-md sticky top-0 z-10">
                {['Draft ID', 'Product', 'CTD Section', 'Variation', 'Status', 'Confidence', 'Words', 'Sources', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VARIATION_SECTION_DRAFTS.map(d => {
                const p = PRODUCT_BY_ID(d.productId)!;
                return (
                  <tr key={d.id} className="border-t border-stroke-muted transition-colors duration-200 hover:bg-raised-2">
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--pillar-02)' }}>{d.id}</td>
                    <td className="px-4 py-3 text-fg-primary">{p.name}</td>
                    <td className="px-4 py-3 text-fg-primary">{d.sectionTitle}</td>
                    <td className="px-4 py-3"><Badge variant={badgeForVariation(d.variationType)}>{d.variationType}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={d.draftStatus === 'Complete' ? 'complete' : 'in-progress'}>{d.draftStatus}</Badge></td>
                    <td className="px-4 py-3"><ConfidencePill value={d.aiConfidence} /></td>
                    <td className="px-4 py-3 font-mono text-fg-primary">{d.wordCount}</td>
                    <td className="px-4 py-3 text-fg-tertiary"><span className="rounded bg-action px-2 py-1">{d.sourceDocs.length} sources</span></td>
                    <td className="px-4 py-3"><Button size="sm" onClick={() => { setOpenId(d.id); logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '02', action: `Viewed variation draft ${d.id}` }); }}>View Draft</Button></td>
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
        subtitle={open?.sectionTitle}
        width={620}
        footer={
          open && (
            <>
              <Button variant="ghost" onClick={() => showToast('Draft downloaded as .docx', 'success')}>Download .docx</Button>
              <Button variant="secondary" onClick={() => showToast('Edit request sent.')}>Request Edits</Button>
              <Button onClick={() => { showToast(`Draft ${open.id} approved.`, 'success'); setOpenId(null); }}>Approve</Button>
            </>
          )
        }
      >
        {open && (
          <>
            <section>
              <Eyebrow>Section Summary</Eyebrow>
              <p className="text-sm text-fg-primary leading-relaxed">{open.summaryOfChanges}</p>
            </section>
            <section>
              <Eyebrow>Source Documents</Eyebrow>
              <ul className="space-y-1.5">
                {open.sourceDocs.map(s => <li key={s} className="flex items-center gap-2 text-xs text-fg-primary"><AppIcon name="document" size="sm" className="text-fg-tertiary" /> {s}</li>)}
              </ul>
            </section>
            <AgentCard pillar="02">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-fg-primary">Draft Text (Excerpt)</span>
                <ConfidencePill value={open.aiConfidence} />
              </div>
              <div className="text-sm text-fg-primary leading-relaxed whitespace-pre-line">{open.excerpt}</div>
            </AgentCard>
            <HumanInLoopBanner compact />
          </>
        )}
      </Drawer>
    </div>
  );
}

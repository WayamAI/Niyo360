import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/shared/Card';
import { Badge, badgeForRisk, badgeForStatus } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { CHANGES, PRODUCT_BY_ID } from '@/data/mockData';

export function CMCChangeSimulator() {
  const { navigateTo, showToast, logAudit, setSelectedChangeId } = useApp();
  const [product, setProduct] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const filtered = useMemo(() => CHANGES.filter(c =>
    (product === 'All' || c.productId === product) &&
    (riskFilter === 'All' || c.riskLevel === riskFilter)
  ), [product, riskFilter]);

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[26px] font-semibold text-foreground">CMC Change Impact Simulator</h1>
            <Badge variant="pillar-04">Pillar 04</Badge>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1 max-w-3xl">
            Simulate the regulatory cascade of a proposed CMC or label change across all registered markets before authoring begins. Powered by the CCDS-to-label knowledge graph.
          </p>
        </div>
        <Button onClick={() => navigateTo('new-change')}>New Change</Button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <select value={product} onChange={e => setProduct(e.target.value)} className="h-9 rounded-md bg-muted border border-border px-3 text-[12px]">
            <option value="All">Product: All</option>
            <option value="PRD-001">Volantis</option>
            <option value="PRD-002">Orentis</option>
            <option value="PRD-003">MMR Vaccine</option>
          </select>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="h-9 rounded-md bg-muted border border-border px-3 text-[12px]">
            {['All', 'High', 'Medium', 'Low'].map(r => <option key={r} value={r}>Risk: {r}</option>)}
          </select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-muted text-muted-foreground text-[11px] uppercase tracking-wider">
                {['Change ID', 'Product', 'Type', 'Markets', 'Sim Status', 'Risk', 'Filing Deadline', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const p = PRODUCT_BY_ID(c.productId)!;
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-accent/50">
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--pillar-04)' }}>{c.id}</td>
                    <td className="px-4 py-3 text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[260px]"><span className="line-clamp-2">{c.changeType}</span></td>
                    <td className="px-4 py-3 font-mono text-foreground">{c.affectedMarkets}</td>
                    <td className="px-4 py-3"><Badge variant={badgeForStatus(c.status)}>{c.status}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={badgeForRisk(c.riskLevel)}>{c.riskLevel}</Badge></td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{c.filingDeadline}</td>
                    <td className="px-4 py-3">
                      {c.simulationStatus === 'complete'
                        ? <Button size="sm" onClick={() => { setSelectedChangeId(c.id); navigateTo('heatmap'); logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '04', action: `Viewed simulation results for ${c.id}` }); }}>View Results</Button>
                        : <Button size="sm" onClick={() => showToast('Simulation queued.', 'success')}>Run Simulation</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

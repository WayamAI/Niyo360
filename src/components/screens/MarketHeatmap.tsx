import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, AgentCard, Eyebrow } from '@/components/shared/Card';
import { Badge, badgeForVariation, badgeForRisk } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { ConfidencePill } from '@/components/shared/Atoms';
import { Drawer } from '@/components/shared/Drawer';
import { MARKET_IMPACT_CHG_0047, CHANGES } from '@/data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const ZONES = ['All', 'EU/EEA', 'Americas', 'Asia Pacific', 'MEA', 'Eastern Europe'];

export function MarketHeatmap() {
  const { showToast, logAudit, selectedChangeId, setSelectedChangeId } = useApp();
  const [zone, setZone] = useState('All');
  const [risk, setRisk] = useState('All');
  const [open, setOpen] = useState<typeof MARKET_IMPACT_CHG_0047[0] | null>(null);

  const change = CHANGES.find(c => c.id === selectedChangeId) || CHANGES[0];

  const markets = useMemo(() => MARKET_IMPACT_CHG_0047.filter(m =>
    (zone === 'All' || m.zone === zone) &&
    (risk === 'All' || m.haQueryRisk === risk)
  ), [zone, risk]);

  const grouped = useMemo(() => {
    const m: Record<string, typeof MARKET_IMPACT_CHG_0047> = {};
    markets.forEach(x => { (m[x.zone] = m[x.zone] || []).push(x); });
    return m;
  }, [markets]);

  const variationCounts = MARKET_IMPACT_CHG_0047.reduce<Record<string, number>>((acc, m) => {
    acc[m.variationType] = (acc[m.variationType] || 0) + 1; return acc;
  }, {});
  const variationData = Object.entries(variationCounts).map(([name, value]) => ({ name, value }));
  const VAR_COLORS = ['var(--status-red)', 'var(--status-amber)', 'var(--status-green)', 'var(--status-blue)', 'var(--pillar-02)'];

  const zoneCounts = Object.entries(MARKET_IMPACT_CHG_0047.reduce<Record<string, number>>((acc, m) => { acc[m.zone] = (acc[m.zone] || 0) + 1; return acc; }, {})).map(([zone, count]) => ({ zone, count }));

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[26px] font-semibold text-foreground">Market Impact Heatmap</h1>
            <Badge variant="pillar-04">Pillar 04</Badge>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">{change.id}, {change.title}</p>
        </div>
        <select value={selectedChangeId || ''} onChange={e => setSelectedChangeId(e.target.value)} className="h-9 rounded-md bg-muted border border-border px-3 text-[12px]">
          {CHANGES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'MARKETS IMPACTED', v: '47' },
          { l: 'HA QUERY RISK FLAGS', v: '6' },
          { l: 'FILING WINDOW', v: '4 to 18mo' },
          { l: 'CASCADE CONFIDENCE', v: '94%', c: 'var(--status-green)' },
        ].map(k => (
          <Card key={k.l}>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">{k.l}</div>
            <div className="font-mono text-[28px] leading-none" style={{ color: k.c || 'var(--foreground)' }}>{k.v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <Eyebrow>Variation Mix</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {variationData.map((v, i) => (
            <Badge key={v.name} variant={badgeForVariation(v.name)}>{v.name}, {v.value}</Badge>
          ))}
        </div>
      </Card>

      <AgentCard pillar="04">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <span className="text-[13px] font-medium text-foreground">Cascade Agent</span>
          <ConfidencePill value={94} pillar="04" />
        </div>
        <p className="text-[13px] text-foreground leading-relaxed">
          The proposed manufacturing site addition triggers variation obligations in 47 markets. The recommended filing sequence is: EU Centralised first (12 to 18 month review), Japan PMDA in parallel (estimated 14 months), then Brazil ANVISA after GMP renewal completes. Six markets carry a High HA query risk based on historical correspondence.
        </p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={() => { showToast('Cascade recommendation accepted.', 'success'); logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '04', action: 'Accepted Cascade Agent recommendation' }); }}>Accept Recommendation</Button>
          <Button size="sm" variant="secondary" onClick={() => showToast('HA query predictions panel opened.')}>View HA Query Predictions</Button>
          <Button size="sm" variant="ghost" onClick={() => showToast('Flagged for senior review.')}>Flag for Review</Button>
        </div>
      </AgentCard>

      <Card>
        <div className="flex flex-wrap gap-2">
          <select value={zone} onChange={e => setZone(e.target.value)} className="h-9 rounded-md bg-muted border border-border px-3 text-[12px]">
            {ZONES.map(z => <option key={z}>{z}</option>)}
          </select>
          <select value={risk} onChange={e => setRisk(e.target.value)} className="h-9 rounded-md bg-muted border border-border px-3 text-[12px]">
            {['All', 'High', 'Medium', 'Low'].map(r => <option key={r}>Risk: {r}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-5">
          {Object.entries(grouped).map(([zoneName, list]) => (
            <div key={zoneName}>
              <Eyebrow>{zoneName}, {list.length} markets</Eyebrow>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map(m => (
                  <button
                    key={m.market}
                    onClick={() => { setOpen(m); logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '04', action: `Opened market detail: ${m.market}` }); }}
                    className="text-left rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors"
                    style={{ borderLeft: `3px solid var(--pillar-04)`, background: `color-mix(in oklab, var(--pillar-04) 3%, var(--card))` }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-[13px] font-medium text-foreground truncate">{m.market}</div>
                      <Badge variant={badgeForRisk(m.haQueryRisk)}>{m.haQueryRisk}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mb-1.5">{m.authority}</div>
                    <div className="flex items-center justify-between">
                      <Badge variant={badgeForVariation(m.variationType)}>{m.variationType}</Badge>
                      <span className="font-mono text-[10px] text-muted-foreground">{m.filingDeadline}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-3">
          <Card>
            <Eyebrow>Variation Breakdown</Eyebrow>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={variationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={36} outerRadius={70}>
                    {variationData.map((_, i) => <Cell key={i} fill={VAR_COLORS[i % VAR_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <Eyebrow>Zone Distribution</Eyebrow>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneCounts}>
                  <XAxis dataKey="zone" stroke="var(--muted-foreground)" fontSize={9} tickFormatter={(v) => v.split(' ')[0]} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="var(--pillar-04)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <Eyebrow>Export</Eyebrow>
            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full" onClick={() => showToast('Simulation exported as PDF', 'success')}>Export PDF</Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => showToast('Simulation exported as CSV', 'success')}>Download CSV</Button>
            </div>
          </Card>
        </aside>
      </div>

      <Drawer
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.market || ''}
        subtitle={open ? `${open.authority} · ${open.zone}` : ''}
        width={500}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(null)}>Close</Button>
            <Button onClick={() => { showToast(`Filing task created for ${open!.market}`, 'success'); setOpen(null); }}>Create Filing Task</Button>
          </>
        }
      >
        {open && (
          <>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <Item label="Variation Type">{open.variationType}</Item>
              <Item label="Filing Deadline" mono>{open.filingDeadline}</Item>
              <Item label="HA Query Risk">{open.haQueryRisk} ({open.riskScore})</Item>
              <Item label="Registration">{open.registrationStatus}</Item>
              <Item label="Approval Year" mono>{open.approvalYear}</Item>
              <Item label="Prior HA Correspondence" mono>{open.priorHACorrespondenceCount}</Item>
            </div>

            <AgentCard pillar="04">
              <span className="text-[12px] font-medium text-foreground">HA Query Prediction</span>
              <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                Based on {open.priorHACorrespondenceCount} prior correspondence records, the {open.authority} is likely to request additional comparability batch data and analytical method bridging. Estimated review timeline: {open.zone === 'EU/EEA' ? '12 to 18 months' : open.zone === 'Asia Pacific' ? '10 to 14 months' : '6 to 10 months'}.
              </p>
            </AgentCard>

            <section>
              <Eyebrow>Documentation Requirements</Eyebrow>
              <ul className="text-[12px] text-muted-foreground space-y-1 list-disc pl-4">
                <li>Updated Module 3.2.S.2.1 (Manufacturer)</li>
                <li>Comparability study report (3 batches)</li>
                <li>GMP certificate, valid scope</li>
                <li>Stability commitment letter</li>
              </ul>
            </section>
          </>
        )}
      </Drawer>
    </div>
  );
}

function Item({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-md bg-muted p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-foreground mt-1 ${mono ? 'font-mono text-[12px]' : 'text-[13px]'}`}>{children}</div>
    </div>
  );
}

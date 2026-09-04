import { AppIcon } from "@/components/icons";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Eyebrow } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { ThinkingDots } from '@/components/shared/Atoms';
import { PRODUCTS } from '@/data/mockData';

export function NewChangeEntry() {
  const { navigateTo, showToast, logAudit, setSelectedChangeId } = useApp();
  const [title, setTitle] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);

  const run = () => {
    if (!title.trim()) {
      showToast('Change title is required.', 'error');
      return;
    }
    setSimulating(true);
    setSteps(['Indexing affected markets...']);
    logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '04', action: `Triggered simulation for new change: "${title}"` });
    setTimeout(() => setSteps(s => [...s, 'Classifying variation types by jurisdiction...']), 700);
    setTimeout(() => setSteps(s => [...s, 'Mapping CCDS-to-label cascade...']), 1500);
    setTimeout(() => {
      setSelectedChangeId('CHG-2025-0047');
      navigateTo('heatmap');
      logAudit({ actor: 'Cascade Agent', actorType: 'agent', pillar: '04', action: 'Cascade simulation complete. 47 markets mapped. Confidence 94%.' });
    }, 2800);
  };

  return (
    <div className="page-enter max-w-3xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="type-display-page text-fg-primary">New Change Entry</h1>
          <Badge variant="pillar-04">Pillar 04</Badge>
        </div>
        <p className="text-sm text-fg-tertiary mt-1">Enter a proposed change to simulate its regulatory cascade impact across all registered markets before authoring begins.</p>
      </div>

      <Card>
        <Eyebrow>Change Identification</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Change ID" hint="Auto-generated">
            <div className="font-mono text-sm text-fg-primary rounded-md bg-action border border-stroke-default px-3 h-9 flex items-center">CHG-2025-0054</div>
          </Field>
          <Field label="Initiated By">
            <div className="text-sm text-fg-primary rounded-md bg-action border border-stroke-default px-3 h-9 flex items-center">Regulatory Operations Team</div>
          </Field>
          <Field label="Change Title" full>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Secondary API Synthesis Site Addition"
              className="w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
          </Field>
          <Field label="Date">
            <div className="text-sm text-fg-primary rounded-md bg-action border border-stroke-default px-3 h-9 flex items-center font-mono">22 May 2025</div>
          </Field>
        </div>
      </Card>

      <Card>
        <Eyebrow>Product and Scope</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Product">
            <select className="w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm">
              {PRODUCTS.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Change Category">
            <select className="w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm">
              {['CMC', 'Label', 'Safety', 'Clinical', 'Administrative'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Change Type" full>
            <select className="w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm">
              {['Manufacturing Site Transfer / Addition', 'Excipient Specification Change', 'Analytical Method Change', 'Packaging Change', 'Shelf Life Extension', 'Specification Change'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Change Description" full>
            <textarea rows={4} className="w-full rounded-md bg-action border border-stroke-default px-3 py-2 text-sm" placeholder="Describe the proposed change..." />
          </Field>
          <Field label="Affected Markets" full>
            <div className="flex flex-wrap gap-2">
              {['Global', 'EU/EEA', 'Americas', 'Asia Pacific', 'MEA', 'Eastern Europe'].map((z, i) => (
                <button key={z} className={`px-3 h-8 rounded-md text-xs border ${i === 0 ? 'bg-brand text-on-brand border-brand' : 'bg-action border-stroke-default text-fg-tertiary hover:text-fg-primary'}`}>{z}</button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      <Card>
        <Eyebrow>Regulatory Context</Eyebrow>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle label="CCDS Impacted" defaultOn />
          <Toggle label="Core Label Impacted" />
          <Field label="Submission History Reference" full>
            <input className="w-full h-9 rounded-md bg-action border border-stroke-default px-3 text-sm" placeholder="e.g. CHG-2024-0031" />
          </Field>
          <Field label="Priority Level" full>
            <div className="flex gap-2">
              {['Standard', 'Expedited', 'Urgent'].map((p, i) => (
                <label key={p} className="flex items-center gap-2 text-sm text-fg-primary">
                  <input type="radio" name="prio" defaultChecked={i === 0} /> {p}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => showToast('Change draft saved.', 'success')}>Save as Draft</Button>
        <Button onClick={run} disabled={simulating}>
          {simulating ? <><ThinkingDots /> Simulating</> : <><AppIcon name="simulator" size="sm" /> Run Impact Simulation</>}
        </Button>
      </div>

      {simulating && (
        <Card>
          <div className="text-xs text-fg-tertiary mb-2">Cascade simulation in progress...</div>
          <div className="h-2 rounded-full bg-action overflow-hidden">
            <div className="sim-bar h-full" style={{ background: 'var(--pillar-04)' }} />
          </div>
          <ul className="mt-3 space-y-1.5">
            {steps.map((s, i) => <li key={i} className="text-xs text-fg-primary event-enter">→ {s}</li>)}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xs uppercase tracking-wider text-fg-tertiary">{label}</span>
        {hint && <span className="text-3xs rounded bg-action px-1.5 py-0.5 text-fg-tertiary">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between rounded-md bg-action border border-stroke-default px-3 h-9">
      <span className="text-sm text-fg-primary">{label}</span>
      <button onClick={() => setOn(!on)} className={`w-9 h-5 rounded-full transition-colors ${on ? 'bg-brand' : 'bg-border'}`}>
        <span className={`block w-4 h-4 rounded-full bg-on-brand-surface transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

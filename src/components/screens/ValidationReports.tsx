import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, AgentCard, Eyebrow } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { ConfidencePill } from '@/components/shared/Atoms';
import { VALIDATION_REPORTS } from '@/data/mockData';

type Filter = 'all' | 'critical' | 'major' | 'minor' | 'warning';

export function ValidationReports() {
  const { showToast, logAudit, markIssueFixed, fixedIssues } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const report = VALIDATION_REPORTS[0];

  const issues = report.issues.filter(i => filter === 'all' ? true : i.severity.toLowerCase() === filter);
  const score = report.overallScore;
  const scoreColor = score >= 90 ? 'var(--status-green)' : score >= 75 ? 'var(--status-amber)' : 'var(--status-red)';
  const total = report.totalChecks;

  const counts = {
    all: report.issues.length,
    critical: report.issues.filter(i => i.severity === 'Critical').length,
    major: report.issues.filter(i => i.severity === 'Major').length,
    minor: report.issues.filter(i => i.severity === 'Minor').length,
    warning: report.issues.filter(i => i.severity === 'Warning').length,
  };

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[26px] font-semibold text-foreground">Validation Report, {report.id}</h1>
            <Badge variant="pillar-03">Pillar 03</Badge>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">{report.dossierTitle}, {report.jurisdiction}</p>
        </div>
        <Button variant="ghost" onClick={() => showToast('Report exported', 'success')}>Export</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" stroke="var(--border)" strokeWidth="10" fill="none" />
              <circle cx="70" cy="70" r="60" stroke={scoreColor} strokeWidth="10" fill="none"
                strokeDasharray={`${2 * Math.PI * 60 * (score / 100)} ${2 * Math.PI * 60}`}
                strokeLinecap="round" transform="rotate(-90 70 70)" />
              <text x="70" y="78" textAnchor="middle" fill={scoreColor} fontSize="32" fontFamily="IBM Plex Mono">{score}</text>
            </svg>
            <div className="text-[12px] mt-1" style={{ color: scoreColor }}>Submission not recommended</div>
          </div>
          <div>
            <Eyebrow>Check Breakdown</Eyebrow>
            <div className="h-4 rounded-full bg-muted overflow-hidden flex">
              <div style={{ width: `${report.passed / total * 100}%`, background: 'var(--status-green)' }} />
              <div style={{ width: `${report.warnings / total * 100}%`, background: 'var(--status-amber)' }} />
              <div style={{ width: `${report.failed / total * 100}%`, background: 'var(--status-red)' }} />
            </div>
            <div className="flex justify-between text-[11px] mt-2 text-muted-foreground font-mono">
              <span style={{ color: 'var(--status-green)' }}>{report.passed} passed</span>
              <span style={{ color: 'var(--status-amber)' }}>{report.warnings} warnings</span>
              <span style={{ color: 'var(--status-red)' }}>{report.failed} failed</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: 'Critical', v: counts.critical, c: 'var(--status-red)' },
              { l: 'Major', v: counts.major, c: 'var(--status-amber)' },
              { l: 'Minor', v: counts.minor, c: 'var(--status-blue)' },
            ].map(s => (
              <div key={s.l} className="rounded-md bg-muted p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div className="font-mono text-[22px] mt-1" style={{ color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <AgentCard pillar="03">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <span className="text-[13px] font-medium text-foreground">Compliance Validator</span>
          <div className="flex items-center gap-2">
            <ConfidencePill value={74} pillar="03" />
            <span className="font-mono text-[11px] text-muted-foreground">{report.validationDate}</span>
          </div>
        </div>
        <p className="text-[13px] text-foreground leading-relaxed">
          The dossier for CHG-2025-0047 (EU Centralised Type II variation) contains 2 Critical issues that must be resolved before submission. The acceptance limits inconsistency between Module 3.2.S.4.3 and Module 3.2.S.4.1 will be flagged by the EMA during technical screening. The missing Change Rationale Statement in Module 1.3.1 is a mandatory field under EC No 1234/2008 and will result in an immediate validation failure. Resolving these two Critical issues would raise the readiness score to approximately 86/100.
        </p>
        <div className="flex gap-2 mt-3">
          <Button variant="secondary" size="sm" onClick={() => showToast('Remediation checklist downloaded.', 'success')}>Download Remediation Checklist</Button>
          <Button size="sm" onClick={() => showToast('Re-validation queued.', 'success')}>Re-validate After Fixes</Button>
        </div>
      </AgentCard>

      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'all', label: `All (${counts.all})` },
          { id: 'critical', label: `Critical (${counts.critical})` },
          { id: 'major', label: `Major (${counts.major})` },
          { id: 'minor', label: `Minor (${counts.minor})` },
          { id: 'warning', label: `Warnings (${counts.warning})` },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3 h-8 rounded-md text-[12px] border transition-colors ${
              filter === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {issues.map(iss => {
          const fixed = fixedIssues.has(iss.id);
          const stripe = fixed ? 'var(--status-green)' : iss.severity === 'Critical' ? 'var(--status-red)' : iss.severity === 'Major' ? 'var(--status-amber)' : 'var(--status-blue)';
          return (
            <Card key={iss.id} style={{ borderLeft: `4px solid ${stripe}` }}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-[11px] text-muted-foreground">{iss.id}</span>
                <Badge variant={iss.severity === 'Critical' ? 'critical' : iss.severity === 'Major' ? 'major' : iss.severity === 'Warning' ? 'warning' : 'minor'}>{iss.severity}</Badge>
                <Badge variant="pillar-03">{iss.module}</Badge>
                <span className="text-[11px] text-muted-foreground">{iss.issueType}</span>
              </div>
              <p className={`text-[13px] mb-3 ${fixed ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}>{iss.description}</p>
              <div className="rounded-md bg-muted p-3" style={{ borderLeft: '3px solid var(--status-green)' }}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Suggested Remediation</div>
                <p className="text-[12px] text-foreground">{iss.suggestedRemediation}</p>
              </div>
              <div className="flex gap-2 mt-3">
                {!fixed && (
                  <Button variant="secondary" size="sm" onClick={() => { markIssueFixed(iss.id); showToast(`Issue ${iss.id} marked as resolved.`, 'success'); logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '03', action: `Marked validation issue ${iss.id} as fixed` }); }}>Mark as Fixed</Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => showToast(`${iss.id} assigned`)}>Assign to Team</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

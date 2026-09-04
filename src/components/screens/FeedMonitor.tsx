import { AppIcon } from "@/components/icons";
import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { FEED_EVENTS, FEED_KPIS, type AuthorityCode, type FilingType } from '@/data/regulatoryData';
import { AuthorityBadge, FilingTypeBadge, StatusPill, DeadlineCountdown, ConfidenceRing } from '@/components/regulatory/atoms';

const AUTH_OPTIONS: ('All' | AuthorityCode)[] = ['All', 'FDA', 'EMA', 'MHRA', 'CDSCO', 'TGA', 'ANVISA'];
const STATUS_OPTIONS = ['All', 'Detected', 'Processing', 'Mapped', 'Under Review', 'Approved', 'Filed', 'Closed', 'No Action'] as const;
const FILING_OPTIONS: ('All' | FilingType)[] = ['All', 'IA', 'IB', 'II', 'NDA', 'None', 'TBD'];

export function FeedMonitor() {
  const { logAudit, showToast, navigateTo, setSelectedReportId } = useApp();
  const [authority, setAuthority] = useState<typeof AUTH_OPTIONS[number]>('All');
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>('All');
  const [filing, setFiling] = useState<typeof FILING_OPTIONS[number]>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => FEED_EVENTS.filter(e =>
    (authority === 'All' || e.authority === authority) &&
    (status === 'All' || e.status === status) &&
    (filing === 'All' || e.filingType === filing) &&
    (search === '' || e.title.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()))
  ), [authority, status, filing, search]);

  const openReport = (eventId: string, reportId: string | null) => {
    logAudit({ actor: 'Regulatory Operations', actorType: 'user', pillar: '01', action: `Opened feed event ${eventId}` });
    if (reportId) {
      setSelectedReportId(reportId);
      navigateTo('report-detail');
    } else {
      showToast('Awaiting report — agent has not yet generated an Impact Delta Report for this event.', 'warning');
    }
  };

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="type-display-page text-fg-primary">Regulatory Feed Monitor</h1>
          <p className="text-sm text-fg-tertiary mt-1 max-w-3xl">
            Inbox of every regulatory event ingested from FDA, EMA, MHRA, CDSCO, TGA, and ANVISA feeds. Each event is mapped against the active product–market portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs text-fg-tertiary">Last sync: {FEED_KPIS.lastSyncMinutesAgo} min ago</span>
          <Button variant="secondary" size="sm" onClick={() => showToast('Feed refresh queued.', 'success')}>
            <AppIcon name="refresh" size="sm" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'NEW THIS WEEK',     v: FEED_KPIS.newThisWeek,       n: `+${FEED_KPIS.newThisWeekDelta} vs last week`, c: 'var(--pillar-01)' },
          { l: 'PROCESSING NOW',    v: FEED_KPIS.processingNow,     n: 'Regulatory Intelligence Agent running' },
          { l: 'REPORTS GENERATED', v: FEED_KPIS.reportsGenerated,  n: `of ${FEED_KPIS.reportsGeneratedOfTotal} resolved`, c: 'var(--feedback-success-icon)' },
          { l: 'OVERDUE / AT RISK', v: FEED_KPIS.overdueOrAtRisk,   n: 'Deadline breach risk', c: 'var(--feedback-error-icon)' },
        ].map(k => (
          <Card key={k.l}>
            <div className="text-2xs font-medium uppercase tracking-wider text-fg-tertiary mb-2">{k.l}</div>
            <div className="type-display-metric-md" style={{ color: k.c || 'var(--fg-primary)' }}>{k.v}</div>
            <div className="text-xs text-fg-tertiary mt-2">{k.n}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <FilterSelect label="Authority" value={authority} onChange={v => setAuthority(v as any)} options={AUTH_OPTIONS} />
          <FilterSelect label="Status"    value={status}    onChange={v => setStatus(v as any)}    options={STATUS_OPTIONS as any} />
          <FilterSelect label="Filing"    value={filing}    onChange={v => setFiling(v as any)}    options={FILING_OPTIONS} />
          <div className="flex-1 min-w-[200px] relative">
            <AppIcon name="search" size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-tertiary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events by title or ID…"
              className="w-full h-9 rounded-md bg-action border border-stroke-default pl-8 pr-3 text-xs text-fg-primary focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => showToast('Feed exported to CSV.', 'success')}>
            <AppIcon name="download" size="sm" /> Export CSV
          </Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-action text-fg-quaternary type-label-md sticky top-0 z-10">
                <Th>Event ID</Th><Th>Authority</Th><Th>Published</Th><Th>Event Title</Th>
                <Th>Stage</Th><Th>Filing</Th><Th>Deadline</Th><Th className="text-center">Conf.</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-t border-stroke-muted transition-colors duration-200 hover:bg-raised-2 cursor-pointer" onClick={() => openReport(e.id, e.reportId)}>
                  <td className="px-4 py-3 font-mono text-2xs" style={{ color: 'var(--pillar-01)' }}>
                    {e.urgencyFlag && <AppIcon name="warning" size="xs" className="inline mr-1 text-error-icon" />}
                    {e.id}
                  </td>
                  <td className="px-4 py-3"><AuthorityBadge code={e.authority} /></td>
                  <td className="px-4 py-3 font-mono text-2xs text-fg-tertiary">{e.publishedDate}</td>
                  <td className="px-4 py-3 max-w-[360px]"><div className="text-fg-primary line-clamp-2" title={e.title}>{e.title}</div></td>
                  <td className="px-4 py-3"><StatusPill status={e.status} /></td>
                  <td className="px-4 py-3"><FilingTypeBadge type={e.filingType} /></td>
                  <td className="px-4 py-3"><DeadlineCountdown date={e.deadlineDate} /></td>
                  <td className="px-4 py-3"><div className="flex justify-center"><ConfidenceRing value={e.confidenceScore} /></div></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={ev => ev.stopPropagation()}>
                      <IconBtn label="View Report" onClick={() => openReport(e.id, e.reportId)}><AppIcon name="view" size="sm" /></IconBtn>
                      <IconBtn label="Reassign" onClick={() => showToast(`Reassign dialog for ${e.id}.`)}><AppIcon name="assign" size="sm" /></IconBtn>
                      <IconBtn label="Flag" onClick={() => showToast(`${e.id} flagged for follow-up.`, 'warning')}><AppIcon name="flag" size="sm" /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border-l-[3px]" style={{ borderLeftColor: 'var(--pillar-02)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md grid place-items-center" style={{ background: 'color-mix(in oklab, var(--pillar-02) 14%, transparent)' }}>
              <AppIcon name="agent" className="text-pillar-02" />
            </div>
            <div>
              <div className="text-sm font-medium text-fg-primary">Regulatory Intelligence Agent</div>
              <div className="text-2xs text-fg-tertiary">
                {FEED_KPIS.avgConfidenceScore}% avg confidence · {FEED_KPIS.agentItemsToday} items today · 
              </div>
            </div>
          </div>
          <div className="text-2xs font-mono text-fg-tertiary truncate max-w-[420px]">
            ▸ 08:32 Deadline calc complete · ▸ 08:31 Filing type IB · ▸ 08:30 7 products mapped
          </div>
        </div>
      </Card>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`h-8 rounded-md border px-2.5 text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
        value && value !== "All"
          ? "bg-raised-2 border-stroke-active text-fg-primary"
          : "bg-action border-stroke-muted text-fg-tertiary hover:text-fg-secondary"
      }`}>
      {options.map(o => <option key={o} value={o}>{label}: {o}</option>)}
    </select>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left px-4 py-3 font-medium ${className}`}>{children}</th>;
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label}
      className="w-7 h-7 grid place-items-center rounded-md hover:bg-action-tertiary-hover text-icon-tertiary hover:text-icon-primary transition-colors duration-200">
      {children}
    </button>
  );
}

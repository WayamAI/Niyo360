import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { FEED_EVENTS, FEED_KPIS, type AuthorityCode, type FilingType } from '@/data/regulatoryData';
import { AuthorityBadge, FilingTypeBadge, StatusPill, DeadlineCountdown, ConfidenceRing } from '@/components/regulatory/atoms';
import { RefreshCw, Download, Search, Eye, Flag, UserPlus, Sparkles, AlertTriangle } from 'lucide-react';

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
          <h1 className="font-display text-[26px] font-semibold text-foreground">Regulatory Feed Monitor</h1>
          <p className="text-[13px] text-muted-foreground mt-1 max-w-3xl">
            Inbox of every regulatory event ingested from FDA, EMA, MHRA, CDSCO, TGA, and ANVISA feeds. Each event is mapped against the active product–market portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted-foreground">Last sync: {FEED_KPIS.lastSyncMinutesAgo} min ago</span>
          <Button variant="secondary" size="sm" onClick={() => showToast('Feed refresh queued.', 'success')}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'NEW THIS WEEK',     v: FEED_KPIS.newThisWeek,       n: `+${FEED_KPIS.newThisWeekDelta} vs last week`, c: 'var(--pillar-01)' },
          { l: 'PROCESSING NOW',    v: FEED_KPIS.processingNow,     n: 'Regulatory Intelligence Agent running' },
          { l: 'REPORTS GENERATED', v: FEED_KPIS.reportsGenerated,  n: `of ${FEED_KPIS.reportsGeneratedOfTotal} resolved`, c: 'var(--status-green)' },
          { l: 'OVERDUE / AT RISK', v: FEED_KPIS.overdueOrAtRisk,   n: 'Deadline breach risk', c: 'var(--status-red)' },
        ].map(k => (
          <Card key={k.l}>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">{k.l}</div>
            <div className="font-mono text-[28px] leading-none" style={{ color: k.c || 'var(--foreground)' }}>{k.v}</div>
            <div className="text-[12px] text-muted-foreground mt-2">{k.n}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <FilterSelect label="Authority" value={authority} onChange={v => setAuthority(v as any)} options={AUTH_OPTIONS} />
          <FilterSelect label="Status"    value={status}    onChange={v => setStatus(v as any)}    options={STATUS_OPTIONS as any} />
          <FilterSelect label="Filing"    value={filing}    onChange={v => setFiling(v as any)}    options={FILING_OPTIONS} />
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events by title or ID…"
              className="w-full h-9 rounded-md bg-muted border border-border pl-8 pr-3 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => showToast('Feed exported to CSV.', 'success')}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-muted text-muted-foreground text-[11px] uppercase tracking-wider">
                <Th>Event ID</Th><Th>Authority</Th><Th>Published</Th><Th>Event Title</Th>
                <Th>Stage</Th><Th>Filing</Th><Th>Deadline</Th><Th className="text-center">Conf.</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-t border-border hover:bg-accent/50 cursor-pointer" onClick={() => openReport(e.id, e.reportId)}>
                  <td className="px-4 py-3 font-mono text-[11px]" style={{ color: 'var(--pillar-01)' }}>
                    {e.urgencyFlag && <AlertTriangle className="inline w-3 h-3 mr-1" style={{ color: 'var(--status-red)' }} />}
                    {e.id}
                  </td>
                  <td className="px-4 py-3"><AuthorityBadge code={e.authority} /></td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{e.publishedDate}</td>
                  <td className="px-4 py-3 max-w-[360px]"><div className="text-foreground line-clamp-2" title={e.title}>{e.title}</div></td>
                  <td className="px-4 py-3"><StatusPill status={e.status} /></td>
                  <td className="px-4 py-3"><FilingTypeBadge type={e.filingType} /></td>
                  <td className="px-4 py-3"><DeadlineCountdown date={e.deadlineDate} /></td>
                  <td className="px-4 py-3"><div className="flex justify-center"><ConfidenceRing value={e.confidenceScore} /></div></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={ev => ev.stopPropagation()}>
                      <IconBtn label="View Report" onClick={() => openReport(e.id, e.reportId)}><Eye className="w-3.5 h-3.5" /></IconBtn>
                      <IconBtn label="Reassign" onClick={() => showToast(`Reassign dialog for ${e.id}.`)}><UserPlus className="w-3.5 h-3.5" /></IconBtn>
                      <IconBtn label="Flag" onClick={() => showToast(`${e.id} flagged for follow-up.`, 'warning')}><Flag className="w-3.5 h-3.5" /></IconBtn>
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
              <Sparkles className="w-4 h-4" style={{ color: 'var(--pillar-02)' }} />
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground">Regulatory Intelligence Agent</div>
              <div className="text-[11px] text-muted-foreground">
                {FEED_KPIS.avgConfidenceScore}% avg confidence · {FEED_KPIS.agentItemsToday} items today · 
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground truncate max-w-[420px]">
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
      className="h-9 rounded-md bg-muted border border-border px-3 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
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
      className="w-7 h-7 grid place-items-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition">
      {children}
    </button>
  );
}

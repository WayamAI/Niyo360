import { AppIcon, type IconName } from "@/components/icons";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, Eyebrow } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import {
  FEED_EVENTS,
  AUTHORITIES,
  AFFILIATE_BY_ID,
  REG_PRODUCT_BY_ID,
  DEFAULT_REASONING,
  REPORT_AUDIT_TRAIL,
  filingTypeExplanation,
  daysUntil,
  deadlineColor,
} from "@/data/regulatoryData";
import {
  AuthorityBadge,
  FilingTypeBadge,
  StatusPill,
  ConfidenceRing,
  ConfidenceBreakdownBars,
  MarketBadge,
} from "@/components/regulatory/atoms";

export function ReportDetail() {
  const { selectedReportId, navigateTo, showToast, logAudit } = useApp();
  const event = FEED_EVENTS.find((e) => e.reportId === selectedReportId) ?? FEED_EVENTS[0];
  const authority = AUTHORITIES[event.authority];
  const affiliate = AFFILIATE_BY_ID(event.responsibleAffiliate);
  const products = event.affectedProductIds
    .map((id) => REG_PRODUCT_BY_ID(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof REG_PRODUCT_BY_ID>>[];
  const dDays = daysUntil(event.deadlineDate);

  const copy = (text: string) => {
    if (typeof navigator !== "undefined") navigator.clipboard?.writeText(text);
    showToast(`Copied ${text}`, "success");
  };

  return (
    <div className="page-enter space-y-5">
      {/* Breadcrumb + header */}
      <div>
        <button
          onClick={() => navigateTo("delta-reports")}
          className="inline-flex items-center gap-1 text-xs text-fg-tertiary hover:text-fg-primary mb-3"
        >
          <AppIcon name="chevronLeft" size="sm" /> Impact Delta Reports
          <span className="text-fg-tertiary/60 mx-1">/</span>
          <span className="font-mono text-fg-primary">{event.reportId}</span>
        </button>

        <Card className="border-l-4" style={{ borderLeftColor: authority.color }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <AuthorityBadge code={event.authority} />
                <FilingTypeBadge type={event.filingType} />
                <StatusPill status={event.status} />
                {event.urgencyFlag && (
                  <span
                    className="inline-flex items-center gap-1 text-2xs font-medium"
                    style={{ color: "var(--feedback-error-icon)" }}
                  >
                    <AppIcon name="warning" size="xs" /> Urgent
                  </span>
                )}
              </div>
              <h1 className="type-display-page-sm text-fg-primary max-w-3xl">{event.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-xs text-fg-tertiary">
                <span>
                  Generated <span className="font-mono text-fg-primary">22 May 2025, 08:30</span>
                </span>
                <span className="opacity-50">·</span>
                <span>
                  Confidence{" "}
                  <span className="font-mono" style={{ color: "var(--feedback-success-icon)" }}>
                    {event.confidenceScore ?? "—"}%
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  logAudit({
                    actor: "Regulatory Operations",
                    actorType: "user",
                    pillar: "01",
                    action: `Approved ${event.reportId}`,
                  });
                  showToast(`${event.reportId} approved.`, "success");
                }}
              >
                <AppIcon name="success" size="sm" /> Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showToast("Override editor opened.")}
              >
                <AppIcon name="edit" size="sm" /> Override
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showToast("Reassign dialog opened.")}
              >
                <AppIcon name="assign" size="sm" /> Reassign
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showToast("PDF exported.", "success")}
              >
                <AppIcon name="download" size="sm" /> Export PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showToast("Share link copied.", "success")}
              >
                <AppIcon name="share" size="sm" /> Share
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        {/* Left column: 11 report fields */}
        <div className="space-y-4">
          {/* 1. Event Reference */}
          <ReportField label="Event Reference" number="01">
            <button
              onClick={() => copy(event.id)}
              className="inline-flex items-center gap-2 rounded-md border border-stroke-default bg-action px-3 py-1.5 font-mono text-sm text-fg-primary hover:bg-action-tertiary-hover transition"
            >
              {event.id} <AppIcon name="copy" size="sm" className="text-fg-tertiary" />
            </button>
          </ReportField>

          {/* 2. Source Authority */}
          <ReportField label="Source Authority" number="02">
            <div className="flex items-center gap-3">
              <div
                className="rounded-md p-3 border-l-[3px]"
                style={{
                  borderLeftColor: authority.color,
                  background: `color-mix(in oklab, ${authority.color} 6%, var(--surface-raised))`,
                }}
              >
                <div className="text-md font-semibold text-fg-primary">{authority.name}</div>
                <div className="text-2xs text-fg-tertiary mt-0.5">
                  {authority.country} ·{" "}
                  <a
                    href={authority.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline inline-flex items-center gap-1"
                  >
                    Source document <AppIcon name="external" size="xs" />
                  </a>
                </div>
              </div>
            </div>
          </ReportField>

          {/* 3. Guideline Summary */}
          <ReportField label="Guideline Summary" number="03">
            <div
              className="rounded-md border-l-[3px] p-3"
              style={{
                borderLeftColor: "var(--feedback-warning-icon)",
                background:
                  "color-mix(in oklab, var(--feedback-warning-icon) 4%, var(--surface-raised))",
              }}
            >
              <p className="text-sm text-fg-primary leading-relaxed">{event.summary}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-3xs text-fg-tertiary uppercase tracking-wider">
                <AppIcon name="agent" size="xs" className="text-pillar-02" />
                Generated by Regulatory Intelligence Agent
              </div>
            </div>
          </ReportField>

          {/* 4. Affected Products */}
          <ReportField label="Affected Products" number="04">
            {products.length === 0 ? (
              <p className="text-xs text-fg-tertiary">
                No products in the active portfolio are impacted by this guideline.
              </p>
            ) : products.length <= 5 ? (
              <div className="flex flex-wrap gap-2">
                {products.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 rounded-md bg-action border border-stroke-default px-2.5 py-1 text-xs text-fg-primary hover:bg-action-tertiary-hover cursor-pointer transition"
                    title={p.therapeuticArea}
                  >
                    {p.name}{" "}
                    <span className="text-3xs text-fg-tertiary">
                      · {p.therapeuticArea.split(" ")[0]}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border border-stroke-default">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-action text-2xs uppercase tracking-wider text-fg-tertiary">
                      <th className="text-left px-3 py-2">Product</th>
                      <th className="text-left px-3 py-2">Therapeutic Area</th>
                      <th className="text-left px-3 py-2">Dossier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-stroke-muted transition-colors duration-200 hover:bg-raised-2"
                      >
                        <td className="px-3 py-2 text-fg-primary">{p.name}</td>
                        <td className="px-3 py-2 text-fg-tertiary">{p.therapeuticArea}</td>
                        <td className="px-3 py-2 font-mono text-2xs text-fg-tertiary">
                          {p.dossierVersion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ReportField>

          {/* 5. Affected Markets */}
          <ReportField label="Affected Markets" number="05">
            <div className="flex flex-wrap gap-2">
              {event.affectedMarkets.length === 0 ? (
                <span className="text-xs text-fg-tertiary">—</span>
              ) : (
                event.affectedMarkets.map((m) => <MarketBadge key={m} code={m} />)
              )}
            </div>
          </ReportField>

          {/* 6. Filing Type Required */}
          <ReportField label="Filing Type Required" number="06">
            <div className="flex items-start gap-4 flex-wrap">
              <FilingTypeBadge type={event.filingType} large />
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs text-fg-primary leading-relaxed">
                  {filingTypeExplanation(event.filingType)}
                </p>
                {event.confidenceScore !== null && (
                  <div className="mt-2.5">
                    <div className="flex justify-between text-2xs mb-1">
                      <span className="text-fg-tertiary">AI classification confidence</span>
                      <span className="font-mono" style={{ color: "var(--feedback-success-icon)" }}>
                        {event.confidenceBreakdown?.filingTypeClassification ??
                          event.confidenceScore}
                        %
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-action overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${event.confidenceBreakdown?.filingTypeClassification ?? event.confidenceScore}%`,
                          background: "var(--feedback-success-icon)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ReportField>

          {/* 7. Deadline Window */}
          <ReportField label="Deadline Window" number="07">
            {event.deadlineDate ? (
              <div className="flex items-center gap-5">
                <div
                  className="grid place-items-center rounded-full border-2 w-20 h-20"
                  style={{ borderColor: deadlineColor(dDays) }}
                >
                  <span className="type-display-metric-xs" style={{ color: deadlineColor(dDays) }}>
                    {dDays! < 0 ? "!" : dDays}
                  </span>
                  <span className="text-3xs uppercase tracking-wider text-fg-tertiary">
                    {dDays! < 0 ? "overdue" : "days"}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-fg-primary">{event.deadlineDate}</div>
                  <div className="text-2xs text-fg-tertiary mt-1">Per-jurisdiction deadlines:</div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-2xs">
                    {event.affectedMarkets.map((m) => (
                      <div key={m} className="flex items-center justify-between gap-3">
                        <span className="font-mono">{m}</span>
                        <span className="font-mono text-fg-tertiary">{event.deadlineDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-fg-tertiary">
                No filing deadline applies to this guideline.
              </p>
            )}
          </ReportField>

          {/* 8. Responsible RA Affiliate */}
          <ReportField label="Responsible RA Affiliate" number="08">
            {affiliate ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center text-sm font-semibold"
                    style={{
                      background: "color-mix(in oklab, var(--pillar-01) 14%, transparent)",
                      color: "var(--pillar-01)",
                    }}
                  >
                    {affiliate.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-fg-primary">{affiliate.name}</div>
                    <div className="text-2xs text-fg-tertiary">
                      {affiliate.lead} · {affiliate.location}
                    </div>
                    <div className="text-3xs text-fg-tertiary mt-0.5">Viewed 2 hours ago</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showToast("Reassign people-picker opened.")}
                >
                  Reassign
                </Button>
              </div>
            ) : (
              <p className="text-xs text-fg-tertiary">Unassigned.</p>
            )}
          </ReportField>

          {/* 9. Confidence Score */}
          <ReportField label="Confidence Score" number="09">
            <div className="flex items-center gap-5 flex-wrap">
              <ConfidenceRing value={event.confidenceScore} size={84} />
              <div className="flex-1 min-w-[220px]">
                {event.confidenceBreakdown && (
                  <ConfidenceBreakdownBars
                    breakdown={[
                      {
                        label: "Guideline Interpretation",
                        value: event.confidenceBreakdown.guidelineInterpretation,
                      },
                      {
                        label: "Product Impact Mapping",
                        value: event.confidenceBreakdown.productImpactMapping,
                      },
                      {
                        label: "Filing Type Classification",
                        value: event.confidenceBreakdown.filingTypeClassification,
                      },
                      {
                        label: "Deadline Calculation",
                        value: event.confidenceBreakdown.deadlineCalculation,
                      },
                    ]}
                  />
                )}
                <p className="mt-3 text-2xs text-fg-tertiary italic">
                  Score reflects AI certainty. Human review is required before filing.
                </p>
              </div>
            </div>
          </ReportField>

          {/* 10. Source Citation */}
          <ReportField label="Source Citation" number="10">
            <div className="rounded-md border border-stroke-default p-3">
              <div className="font-mono text-xs text-fg-primary">{event.documentRef}</div>
              <div className="text-xs text-fg-tertiary mt-1">{event.title}</div>
              <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-3xs text-fg-tertiary uppercase tracking-wider">
                  <span className="font-mono normal-case">{event.publishedDate}</span>
                  <span className="opacity-50">·</span>
                  <span className="rounded bg-action px-1.5 py-0.5">Guideline</span>
                </div>
                <a
                  href={event.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-2xs hover:underline"
                  style={{ color: "var(--pillar-01)" }}
                >
                  Open source document <AppIcon name="external" size="xs" />
                </a>
              </div>
            </div>
          </ReportField>

          {/* 11. Recommended Next Action */}
          <ReportField label="Recommended Next Action" number="11">
            <RecommendedAction
              event={event}
              onAct={(msg) => {
                showToast(msg, "success");
                logAudit({
                  actor: "Regulatory Operations",
                  actorType: "user",
                  pillar: "01",
                  action: msg,
                });
              }}
            />
          </ReportField>
        </div>

        {/* Right column: Reasoning + Audit + Related */}
        <div className="space-y-4">
          <ReasoningTrace confidence={event.confidenceScore ?? 0} />
          <AuditTimeline />
          <RelatedReports authority={event.authority} excludeId={event.reportId!} />
        </div>
      </div>
    </div>
  );
}

function ReportField({
  label,
  number,
  children,
}: {
  label: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <Eyebrow className="!mb-0">{label}</Eyebrow>
        <span className="font-mono text-3xs text-fg-quaternary">FIELD {number}</span>
      </div>
      {children}
    </Card>
  );
}

function RecommendedAction({
  event,
  onAct,
}: {
  event: ReturnType<(typeof FEED_EVENTS)["find"]> & {};
  onAct: (msg: string) => void;
}) {
  const isHigh =
    event!.filingType === "IB" || event!.filingType === "II" || event!.filingType === "NDA";
  const priority =
    event!.urgencyFlag || isHigh ? "High" : event!.filingType === "IA" ? "Medium" : "Low";
  const priColor =
    priority === "High"
      ? "var(--feedback-error-icon)"
      : priority === "Medium"
        ? "var(--feedback-warning-icon)"
        : "var(--feedback-success-icon)";
  const headline =
    event!.filingType === "None"
      ? "No filing required. Log the impact assessment in the regulatory QMS."
      : `Prepare ${event!.filingType === "NDA" ? "PAS" : `Type ${event!.filingType}`} variation dossier for ${event!.affectedMarkets.join(" / ")} markets.`;
  const steps = [
    `Notify ${event!.affectedProductIds.length} affected product owners and confirm scope`,
    `Draft Module 1 cover letter referencing ${event!.documentRef}`,
    `Compile Module 3 quality updates and comparability data`,
    `Open Veeva Vault task and route for QA / RA approval`,
    `Submit to authority and update internal change tracker`,
  ];
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider"
          style={{
            background: `color-mix(in oklab, ${priColor} 14%, transparent)`,
            color: priColor,
          }}
        >
          {priority} Priority
        </span>
        <span className="text-sm font-medium text-fg-primary">{headline}</span>
      </div>
      <ol className="space-y-1.5 mt-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-xs text-fg-primary">
            <span className="font-mono text-2xs text-fg-tertiary shrink-0 w-5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAct("Veeva Vault task created from recommended action.")}
        >
          Create Task
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAct("Affiliate assignment dialog opened.")}
        >
          Assign to Affiliate
        </Button>
      </div>
      <div className="mt-2 inline-flex items-center gap-1.5 text-3xs text-fg-tertiary uppercase tracking-wider">
        <AppIcon name="agent" size="xs" className="text-pillar-02" />
        Recommended by Regulatory Intelligence Agent
      </div>
    </div>
  );
}

function ReasoningTrace({ confidence }: { confidence: number }) {
  const [open, setOpen] = useState<Set<number>>(new Set([1]));
  return (
    <Card className="border-l-[3px]" style={{ borderLeftColor: "var(--pillar-02)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AppIcon name="agent" className="text-pillar-02" />
          <span className="text-sm font-medium text-fg-primary">Reasoning Trace</span>
        </div>
        <span className="text-2xs text-fg-tertiary">08:30 today</span>
      </div>
      <div className="divide-y divide-border">
        {DEFAULT_REASONING.map((step) => {
          const isOpen = open.has(step.stepNumber);
          return (
            <div key={step.stepNumber} className="py-2.5 first:pt-0 last:pb-0">
              <button
                onClick={() =>
                  setOpen((prev) => {
                    const next = new Set(prev);
                    if (isOpen) next.delete(step.stepNumber);
                    else next.add(step.stepNumber);
                    return next;
                  })
                }
                className="w-full flex items-center gap-2 text-left hover:text-fg-primary transition"
              >
                {isOpen ? (
                  <AppIcon name="chevronDown" size="sm" className="text-fg-tertiary shrink-0" />
                ) : (
                  <AppIcon name="chevronRight" size="sm" className="text-fg-tertiary shrink-0" />
                )}
                <span className="font-mono text-2xs text-fg-tertiary">Step {step.stepNumber}</span>
                <span className="text-xs font-medium text-fg-primary">{step.title}</span>
                {step.confidence !== null && (
                  <span
                    className="ml-auto font-mono text-2xs"
                    style={{ color: "var(--feedback-success-icon)" }}
                  >
                    {step.confidence}%
                  </span>
                )}
              </button>
              {isOpen && (
                <p className="mt-2 pl-6 text-xs text-fg-tertiary leading-relaxed">{step.detail}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-stroke-default flex items-center justify-between">
        <span className="text-2xs text-fg-tertiary uppercase tracking-wider">
          Overall confidence
        </span>
        <span
          className="font-mono text-base font-semibold"
          style={{ color: "var(--feedback-success-icon)" }}
        >
          {confidence}%
        </span>
      </div>
    </Card>
  );
}

function AuditTimeline() {
  const ICONS = {
    agent: "bot",
    user: "user",
    system: "settings",
    notification: "notification",
    ingestion: "inbox",
  } as const satisfies Record<string, IconName>;
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-fg-primary">Audit Timeline</span>
        <span className="text-2xs text-fg-tertiary">{REPORT_AUDIT_TRAIL.length} events</span>
      </div>
      <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
        {REPORT_AUDIT_TRAIL.map((evt, i) => {
          const iconName: IconName = ICONS[evt.type] ?? "document";
          const color =
            evt.type === "agent"
              ? "var(--pillar-02)"
              : evt.type === "user"
                ? "var(--pillar-01)"
                : "var(--fg-tertiary)";
          return (
            <div key={i} className="flex gap-3">
              <div
                className="shrink-0 w-7 h-7 rounded-full grid place-items-center mt-0.5"
                style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
              >
                <AppIcon name={iconName} size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs font-medium text-fg-primary">{evt.actor}</span>
                  <span className="font-mono text-3xs text-fg-tertiary">{evt.ts}</span>
                </div>
                <p className="text-2xs text-fg-tertiary mt-0.5 leading-relaxed">{evt.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function RelatedReports({ authority, excludeId }: { authority: string; excludeId: string }) {
  const related = FEED_EVENTS.filter(
    (e) => e.authority === authority && e.reportId && e.reportId !== excludeId,
  ).slice(0, 4);
  const { setSelectedReportId, navigateTo } = useApp();
  return (
    <Card>
      <Eyebrow>Related Reports</Eyebrow>
      <div className="space-y-2">
        {related.length === 0 && (
          <p className="text-xs text-fg-tertiary">No related reports from this authority.</p>
        )}
        {related.map((e) => (
          <button
            key={e.id}
            onClick={() => {
              setSelectedReportId(e.reportId!);
              navigateTo("report-detail");
            }}
            className="w-full text-left rounded-md border border-stroke-default p-2.5 hover:bg-action-tertiary-hover/50 transition"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-3xs" style={{ color: "var(--pillar-01)" }}>
                {e.reportId}
              </span>
              <FilingTypeBadge type={e.filingType} />
            </div>
            <div className="text-xs text-fg-primary line-clamp-2">{e.title}</div>
            <div className="text-3xs text-fg-tertiary mt-1 font-mono">{e.publishedDate}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}

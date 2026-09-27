import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppIcon } from "@/components/icons";
import { PageBody, PageHeader, SectionHeader } from "@/components/shared/Page";
import { Panel } from "@/components/shared/Panel";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { FilterChips } from "@/components/shared/Filters";
import { EmptyState } from "@/components/shared/States";
import { AgentCard } from "@/components/shared/Card";
import { ConfidencePill } from "@/components/shared/Atoms";
import { VALIDATION_REPORTS } from "@/data/mockData";

type Severity = "critical" | "major" | "minor" | "warning";
type Filter = "all" | Severity | "resolved";

const SEVERITY_TONE: Record<string, string> = {
  Critical: "var(--feedback-error-icon)",
  Major: "var(--feedback-warning-icon)",
  Minor: "var(--feedback-info-icon)",
  Warning: "var(--feedback-warning-icon)",
};

function scoreTone(score: number): string {
  if (score >= 90) return "var(--feedback-success-icon)";
  if (score >= 75) return "var(--feedback-warning-icon)";
  return "var(--feedback-error-icon)";
}

/** The readiness verdict follows the score rather than always reading "not recommended". */
function verdict(score: number): string {
  if (score >= 90) return "Ready for submission";
  if (score >= 75) return "Submit with caution";
  return "Submission not recommended";
}

export function ValidationReports() {
  const { showToast, logAudit, markIssueFixed, fixedIssues } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const report = VALIDATION_REPORTS[0];

  const outstanding = report.issues.filter((issue) => !fixedIssues.has(issue.id));
  const resolved = report.issues.filter((issue) => fixedIssues.has(issue.id));

  const countBySeverity = (severity: Severity) =>
    outstanding.filter((issue) => issue.severity.toLowerCase() === severity).length;

  const visible =
    filter === "all"
      ? outstanding
      : filter === "resolved"
        ? resolved
        : outstanding.filter((issue) => issue.severity.toLowerCase() === filter);

  const total = report.totalChecks;
  const tone = scoreTone(report.overallScore);

  return (
    <>
      <PageHeader
        title={`Validation Report ${report.id}`}
        description={`${report.dossierTitle} · ${report.jurisdiction}`}
        breadcrumb={[{ label: "Compliance Validator" }, { label: "Validation Reports" }]}
        badges={<Badge variant="pillar-03">Pillar 03</Badge>}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => showToast("Report exported.", "success")}
          >
            <AppIcon name="download" size="sm" /> Export
          </Button>
        }
      />

      <PageBody className="gap-4">
        <Panel>
          <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[auto_1fr_auto]">
            <div className="flex flex-col items-center gap-1">
              <svg
                width="104"
                height="104"
                viewBox="0 0 104 104"
                role="img"
                aria-label={`Readiness score ${report.overallScore} out of 100`}
              >
                <circle
                  cx="52"
                  cy="52"
                  r="44"
                  stroke="var(--surface-action)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="52"
                  cy="52"
                  r="44"
                  stroke={tone}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 44 * (report.overallScore / 100)} ${2 * Math.PI * 44}`}
                  strokeLinecap="round"
                  transform="rotate(-90 52 52)"
                />
                {/* Uses the app's own mono face; this previously asked for
                    "IBM Plex Mono", which the app never loads, so the number
                    fell back to the browser default and broke the rhythm. */}
                <text
                  x="52"
                  y="60"
                  textAnchor="middle"
                  fill={tone}
                  fontSize="26"
                  fontFamily="var(--font-mono)"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {report.overallScore}
                </text>
              </svg>
              <span className="type-body-sm text-center" style={{ color: tone }}>
                {verdict(report.overallScore)}
              </span>
            </div>

            <div className="min-w-0">
              <SectionHeader title="Check breakdown" />
              <div
                className="flex h-3 overflow-hidden rounded-full bg-action"
                role="img"
                aria-label={`${report.passed} passed, ${report.warnings} warnings, ${report.failed} failed of ${total} checks`}
              >
                <span
                  style={{
                    width: `${(report.passed / total) * 100}%`,
                    background: "var(--feedback-success-icon)",
                  }}
                />
                <span
                  style={{
                    width: `${(report.warnings / total) * 100}%`,
                    background: "var(--feedback-warning-icon)",
                  }}
                />
                <span
                  style={{
                    width: `${(report.failed / total) * 100}%`,
                    background: "var(--feedback-error-icon)",
                  }}
                />
              </div>
              <div className="type-caption tabular mt-2 flex flex-wrap justify-between gap-2 font-mono">
                <span className="text-success">{report.passed} passed</span>
                <span className="text-warning">{report.warnings} warnings</span>
                <span className="text-error">{report.failed} failed</span>
                <span className="text-fg-quaternary">{total} checks</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["Critical", countBySeverity("critical"), "var(--feedback-error-icon)"],
                  ["Major", countBySeverity("major"), "var(--feedback-warning-icon)"],
                  ["Minor", countBySeverity("minor"), "var(--feedback-info-icon)"],
                ] as const
              ).map(([label, value, color]) => (
                <div
                  key={label}
                  className="rounded-md border border-stroke-muted bg-action px-3 py-2 text-center"
                >
                  <div className="type-label-sm text-fg-quaternary">{label}</div>
                  <div className="type-display-metric-sm mt-0.5" style={{ color }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <AgentCard pillar="03">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="type-heading-sm text-fg-primary">Compliance Validator</span>
            <span className="flex items-center gap-2">
              <ConfidencePill value={report.overallScore} pillar="03" />
              <span className="type-caption tabular font-mono text-fg-quaternary">
                {report.validationDate}
              </span>
            </span>
          </div>
          <p className="type-body-lg text-fg-primary">
            The dossier for {report.changeId} ({report.jurisdiction}) carries{" "}
            {countBySeverity("critical")} critical{" "}
            {countBySeverity("critical") === 1 ? "issue" : "issues"} that must be resolved before
            submission. The acceptance-limits inconsistency between Module 3.2.S.4.3 and Module
            3.2.S.4.1 will be flagged during EMA technical screening, and the missing Change
            Rationale Statement in Module 1.3.1 is mandatory under EC No 1234/2008. Resolving both
            would raise the readiness score to approximately 86/100.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => showToast("Remediation checklist downloaded.", "success")}
            >
              Download checklist
            </Button>
            <Button size="sm" onClick={() => showToast("Re-validation queued.", "success")}>
              Re-validate after fixes
            </Button>
          </div>
        </AgentCard>

        <section>
          <SectionHeader
            title="Issues"
            description="Outstanding findings, grouped by severity. Resolving one moves it to Resolved."
          />
          <FilterChips
            label="Filter issues by severity"
            value={filter}
            onChange={setFilter}
            options={[
              { id: "all", label: "Outstanding", count: outstanding.length },
              { id: "critical", label: "Critical", count: countBySeverity("critical") },
              { id: "major", label: "Major", count: countBySeverity("major") },
              { id: "minor", label: "Minor", count: countBySeverity("minor") },
              { id: "warning", label: "Warnings", count: countBySeverity("warning") },
              { id: "resolved", label: "Resolved", count: resolved.length },
            ]}
          />

          <ul className="mt-3 space-y-2.5">
            {visible.length === 0 && (
              <li>
                <Panel>
                  <EmptyState
                    icon={filter === "all" ? "success" : "inbox"}
                    title={
                      filter === "all"
                        ? "All issues resolved"
                        : filter === "resolved"
                          ? "Nothing resolved yet"
                          : `No ${filter} issues outstanding`
                    }
                    detail={
                      filter === "all"
                        ? "Re-validate the dossier to confirm the score before submitting."
                        : undefined
                    }
                  />
                </Panel>
              </li>
            )}

            {visible.map((issue) => {
              const isFixed = fixedIssues.has(issue.id);
              return (
                <li
                  key={issue.id}
                  className="rounded-lg border border-stroke-default bg-container p-3.5"
                  style={{
                    borderLeft: `2px solid ${
                      isFixed ? "var(--feedback-success-icon)" : SEVERITY_TONE[issue.severity]
                    }`,
                  }}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="type-caption font-mono text-fg-quaternary">{issue.id}</span>
                    <Badge
                      variant={
                        issue.severity === "Critical"
                          ? "critical"
                          : issue.severity === "Major"
                            ? "major"
                            : issue.severity === "Warning"
                              ? "warning"
                              : "minor"
                      }
                    >
                      {issue.severity}
                    </Badge>
                    <Badge variant="neutral">{issue.module}</Badge>
                    <span className="type-caption text-fg-quaternary">{issue.issueType}</span>
                    {isFixed && <Badge variant="complete">Resolved</Badge>}
                  </div>

                  <p
                    className={`type-body-lg mb-2.5 ${
                      isFixed ? "text-fg-quaternary line-through" : "text-fg-secondary"
                    }`}
                  >
                    {issue.description}
                  </p>

                  <div
                    className="rounded-md bg-action p-2.5"
                    style={{ borderLeft: "2px solid var(--feedback-success-icon)" }}
                  >
                    <div className="type-label-sm text-fg-quaternary">Suggested remediation</div>
                    <p className="type-body-md mt-0.5 text-fg-primary">
                      {issue.suggestedRemediation}
                    </p>
                  </div>

                  {!isFixed && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          markIssueFixed(issue.id);
                          showToast(`${issue.id} marked resolved.`, "success");
                          logAudit({
                            actor: "Regulatory Operations",
                            actorType: "user",
                            pillar: "03",
                            action: `Marked validation issue ${issue.id} as fixed`,
                          });
                        }}
                      >
                        Mark resolved
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showToast(`${issue.id} assigned to the CMC team.`)}
                      >
                        Assign
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </PageBody>
    </>
  );
}

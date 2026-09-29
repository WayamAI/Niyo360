import { useState, type ReactNode } from "react";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { ApiRecord, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Badge } from "@/components/shared/Badge";
import { useApp } from "@/context/AppContext";
import { useReport, useReportVersions } from "@/hooks/useApiQueries";
import type { ImpactReportStatus } from "@/services/api";

/**
 * Impact report detail, from GET /api/v1/reports/{report_id}, with the
 * version history from /versions.
 *
 * The tabs follow the right rail's markup rather than introducing a Tabs
 * component: this is the only other place in the app that needs them, and the
 * rail already establishes the tablist/tab/tabpanel roles and the underline.
 */

const STATUS_VARIANT: Record<ImpactReportStatus, "complete" | "neutral" | "pending"> = {
  DRAFT: "pending",
  GENERATED: "complete",
  UNDER_REVIEW: "pending",
  REVIEWED: "complete",
  ARCHIVED: "neutral",
};

const TABS = [
  { id: "details", label: "Details" },
  { id: "versions", label: "Versions" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ReportDetailScreen() {
  const { selectedRecordId, navigateTo } = useApp();
  const [tab, setTab] = useState<TabId>("details");
  const reportQuery = useReport(selectedRecordId);
  // Only fetched once the version tab is actually opened.
  const versionsQuery = useReportVersions(tab === "versions" ? selectedRecordId : null);

  return (
    <>
      <PageHeader
        title="Impact Report"
        description="A generated impact delta report and its version history."
        breadcrumb={[
          { label: "Reports", onClick: () => navigateTo("api-reports") },
          { label: selectedRecordId ?? "—" },
        ]}
        onBack={() => navigateTo("api-reports")}
        actions={<ApiRefresh query={reportQuery} />}
      />
      <PageBody>
        <div
          role="tablist"
          aria-label="Report sections"
          className="mb-6 flex h-11 shrink-0 border-b border-stroke-muted"
        >
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`type-label-md border-b-2 px-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none ${
                  selected
                    ? "border-brand text-fg-primary"
                    : "border-transparent text-fg-tertiary hover:text-fg-secondary"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {tab === "details" ? (
            <ApiRecord
              query={reportQuery}
              notFoundTitle="Report not found"
              notFoundDetail="This report does not exist, or it belongs to another organization."
            >
              {(report) => (
                <div className="space-y-8">
                  <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Title">
                        <span className="type-body-md text-fg-primary">{report.title}</span>
                      </Field>
                    </div>
                    <Field label="Status">
                      <Badge variant={STATUS_VARIANT[report.status]}>{report.status}</Badge>
                    </Field>
                    <Field label="Version">
                      <Mono>v{report.version}</Mono>
                    </Field>
                    <Field label="Report ID">
                      <Mono>{report.id}</Mono>
                    </Field>
                    <Field label="Created">
                      <Mono>{report.created_at.slice(0, 10)}</Mono>
                    </Field>
                    <Field label="Impact assessment">
                      <Mono>{report.impact_assessment_id}</Mono>
                    </Field>
                    <Field label="Regulatory change">
                      <Mono>{report.regulatory_change_id}</Mono>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Summary">{report.summary ?? "—"}</Field>
                    </div>
                  </dl>

                  {/* report_data is typed unknown in the contract, so it is shown
                      as the API returned it rather than given an invented shape. */}
                  {report.report_data != null && (
                    <section>
                      <h2 className="type-label-sm text-fg-quaternary">Report data</h2>
                      <pre className="type-body-sm mt-2 max-h-96 overflow-auto rounded-md border border-stroke-muted bg-raised-1 p-4 whitespace-pre-wrap text-fg-secondary">
                        {JSON.stringify(report.report_data, null, 2)}
                      </pre>
                    </section>
                  )}
                </div>
              )}
            </ApiRecord>
          ) : (
            <ApiState
              query={versionsQuery}
              emptyTitle="No earlier versions"
              emptyDetail="This report has only ever been generated once."
              skeletonCols={3}
            >
              {(versions) => (
                <ul className="space-y-3">
                  {versions.map((version) => (
                    <li
                      key={version.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-stroke-muted p-4"
                    >
                      <Mono>v{version.version}</Mono>
                      <Badge variant={STATUS_VARIANT[version.status]}>{version.status}</Badge>
                      <span className="type-body-md text-fg-secondary">{version.title}</span>
                      <Mono>{version.created_at.slice(0, 10)}</Mono>
                    </li>
                  ))}
                </ul>
              )}
            </ApiState>
          )}
        </div>
      </PageBody>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="type-label-sm text-fg-quaternary">{label}</dt>
      <dd className="type-body-md mt-1 text-fg-secondary">{children}</dd>
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="tabular font-mono text-fg-tertiary">{children}</span>;
}

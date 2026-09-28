import { PageBody, PageHeader, Tabs, TabList, Tab, TabPanels, TabPanel } from "@/components/shared/Page";
import { ApiState } from "@/components/shared/ApiState";
import { useReport, useReportVersions } from "@/hooks/useApiQueries";
import type { ImpactReport } from "@/services/api";

export function ReportDetailScreen() {
  // In a real implementation, we would get the report ID from route params
  // For now, we'll use a placeholder approach similar to how other detail screens work
  const [reportId, setReportId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("details");

  // This would normally come from route parameters
  // We're using state to simulate route params for now
  const reportQuery = useReport(reportId ?? "");
  const versionsQuery = useReportVersions(reportId ?? "");

  return (
    <>
      <PageHeader
        title="Report Detail"
        description="Detailed view of an impact report"
        breadcrumb={[
          { label: "Reports", onClick: () => {/* navigate to reports list */} },
          { label: reportId ?? "Select a report" },
        ]}
        onBack={() => {/* navigate to reports list */}}
        actions={
          <>
            {reportId && (
              <>
                <ApiCount query={versionsQuery} />
                <ApiRefresh query={versionsQuery} />
              </>
            )}
          </>
        }
      />
      <PageBody>
        <Tabs defaultValue="details" onValueChange={setActiveTab}>
          <TabList>
            <Tab value="details">Details</Tab>
            <Tab value="versions">Versions</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="details">
              <ApiState
                query={reportQuery}
                emptyTitle="Select a report"
                emptyDetail="Choose a report from the list to view its details."
              >
                {(report) => (
                  <div className="space-y-6">
                    <div>
                      <h2 className="type-heading-md text-fg-primary">{report.title}</h2>
                      <p className="type-body-sm text-fg-tertiary">
                        Report ID: {report.id}
                      </p>
                      <p className="type-body-sm text-fg-tertiary">
                        Status:{" "}
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                            report.status === "COMPLETED"
                              ? "bg-success-bg text-success-icon"
                              : report.status === "DRAFT"
                                ? "bg-warning-bg text-warning-icon"
                                : "bg-error-bg text-error-icon"
                          }`}
                        >
                          {report.status}
                        </span>
                      </p>
                      <p className="type-body-sm text-fg-tertiary">
                        Created:{" "}
                        <span className="font-mono text-fg-tertiary">
                          {report.created_at ? report.created_at.slice(0, 10) : "—"}
                        </span>
                      </p>
                    </div>

                    {/* Additional report details would go here based on actual API response */}
                    {/* For now, showing placeholder for other potential fields */}
                    <div className="border-t border-stroke-default pt-4">
                      <h3 className="type-heading-sm text-fg-primary">Report Details</h3>
                      <p className="type-body-sm text-fg-tertiary">
                        Detailed report content would be displayed here based on the
                        actual ImpactReportResponse structure from the backend.
                      </p>
                    </div>
                  </div>
                )}
              </ApiState>
            </TabPanel>
            <TabPanel value="versions">
              <ApiState
                query={versionsQuery}
                emptyTitle="No versions yet"
                emptyDetail="This report has no versions. Versions appear here when the report is regenerated or updated."
              >
                {(versions) => (
                  <div className="space-y-4">
                    {versions.length > 0 ? (
                      <div>
                        <h3 className="type-heading-sm text-fg-primary">Report Versions</h3>
                        <div className="space-y-2">
                          {versions.map((version) => (
                            <div key={version.id} className="border border-stroke-default rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                                    version.status === "COMPLETED"
                                      ? "success-bg text-success-icon"
                                      : version.status === "DRAFT"
                                        ? "bg-warning-bg text-warning-icon"
                                        : "bg-error-bg text-error-icon"
                                  }`}
                                  >
                                    {version.status}
                                  </span>
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="type-body-md text-fg-primary">{version.title}</p>
                                  <p className="type-body-sm text-fg-tertiary">
                                    Version ID: {version.id}
                                  </p>
                                  <p className="type-body-sm text-fg-tertiary">
                                    Created:{" "}
                                    <span className="font-mono text-fg-tertiary">
                                      {version.created_at ? version.created_at.slice(0, 10) : "—"}
                                    </span>
                                  </p>
                                  <p className="type-body-sm text-fg-tertiary">
                                    Generated by:{" "}
                                    <span className="text-fg-tertiary">
                                      {version.generated_by ?? "System"}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </ApiState>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </PageBody>
    </>
  );
}
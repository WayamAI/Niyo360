import { PageBody, PageHeader } from "@/components/shared/Page";
import { ApiState } from "@/components/shared/ApiState";
import { useReport } from "@/hooks/useApiQueries";
import type { ImpactReport } from "@/services/api";

export function ReportDetailScreen() {
  // In a real implementation, we would get the report ID from route params
  // For now, we'll use a placeholder approach similar to how other detail screens work
  const [reportId, setReportId] = React.useState<string | null>(null);

  // This would normally come from route parameters
  // We're using state to simulate route params for now
  const query = useReport(reportId ?? "");

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
      />
      <PageBody>
        <ApiState
          query={query}
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
      </PageBody>
    </>
  );
}
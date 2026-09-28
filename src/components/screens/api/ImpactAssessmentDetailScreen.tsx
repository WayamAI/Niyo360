import { PageBody, PageHeader } from "@/components/shared/Page";
import { ApiState } from "@/components/shared/ApiState";
import { useImpactAssessment, useImpactItems } from "@/hooks/useApiQueries";
import type { ImpactAssessment, ImpactItem } from "@/services/api";

/** Impact assessment detail view, from GET /api/v1/impact/{assessment_id}. */
export function ImpactAssessmentDetailScreen() {
  // In a real implementation, we would get the assessment ID from route params
  // For now, we'll use a placeholder approach similar to how other detail screens work
  const [assessmentId, setAssessmentId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("overview");

  // These would normally come from route parameters
  // We're using state to simulate route params for now
  const assessmentQuery = useImpactAssessment(assessmentId ?? "");
  const itemsQuery = useImpactItems(assessmentId ?? "");

  return (
    <>
      <PageHeader
        title="Impact Assessment Detail"
        description="Detailed view of an impact assessment"
        breadcrumb={[
          { label: "Impact", onClick: () => {/* navigate to impact */} },
          { label: "Assessments", onClick: () => {/* navigate to assessments list */} },
          { label: assessmentId ?? "Select an assessment" },
        ]}
        onBack={() => {/* navigate to assessments list */}}
        actions={
          <>
            {assessmentId && (
              <>
                <ApiCount query={itemsQuery} />
                <ApiRefresh query={itemsQuery} />
              </>
            )}
          </>
        }
      />
      <PageBody>
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabList>
            <Tab value="overview">Overview</Tab>
            <Tab value="items">Impact Items</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="overview">
              <ApiState
                query={assessmentQuery}
                emptyTitle="Select an assessment"
                emptyDetail="Choose an assessment from the list to view its details."
              >
                {(assessment) => (
                  <div className="space-y-6">
                    <div>
                      <h2 className="type-heading-md text-fg-primary">{assessment.title ?? "Untitled Assessment"}</h2>
                      <p className="type-body-sm text-fg-tertiary">
                        Assessment ID: {assessment.id}
                      </p>
                      <p className="type-body-sm text-fg-tertiary">
                        Status:{" "}
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                            assessment.status === "COMPLETED"
                              ? "success-bg text-success-icon"
                              : assessment.status === "FAILED"
                                ? "error-bg text-error-icon"
                                : assessment.status === "PENDING" || assessment.status === "RUNNING" || assessment.status === "ANALYZING"
                                  ? "warning-bg text-warning-icon"
                                  : "text-fg-tertiary"
                          }`}
                        >
                          {assessment.status ?? "—"}
                        </span>
                      </p>
                      <p className="type-body-sm text-fg-tertiary">
                        Created:{" "}
                        <span className="font-mono text-fg-tertiary">
                          {assessment.created_at ? assessment.created_at.slice(0, 10) : "—"}
                        </span>
                      </p>
                      <p className="type-body-sm text-fg-tertiary">
                        Updated:{" "}
                        <span className="font-mono text-fg-tertiary">
                          {assessment.updated_at ? assessment.updated_at.slice(0, 10) : "—"}
                        </span>
                      </p>
                    </div>

                    {/* Additional assessment details would go here based on actual API response */}
                    <div className="border-t border-stroke-default pt-4">
                      <h3 className="type-heading-sm text-fg-primary">Assessment Details</h3>
                      <p className="type-body-sm text-fg-tertiary">
                        Detailed assessment content would be displayed here based on the
                        actual ImpactAssessmentResponse structure from the backend.
                      </p>
                    </div>

                    {/* Impact level indicator */}
                    <div className="border-t border-stroke-default pt-4">
                      <h3 className="type-heading-sm text-fg-primary">Impact Level</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                            assessment.impact_level === "CRITICAL"
                              ? "error-bg text-error-icon"
                              : assessment.impact_level === "HIGH"
                                ? "warning-bg text-warning-icon"
                                : assessment.impact_level === "MEDIUM"
                                  ? "info-bg text-info-icon"
                                  : assessment.impact_level === "LOW"
                                    ? "success-bg text-success-icon"
                                    : "text-fg-tertiary"
                          }`}>
                            {assessment.impact_level ?? "—"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="type-body-sm text-fg-tertiary">
                            The overall impact level of this regulatory change on your portfolio.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ApiState>
            </TabPanel>
            <TabPanel value="items">
              <ApiState
                query={itemsQuery}
                emptyTitle="No impact items yet"
                emptyDetail="Impact items appear here once the assessment is completed."
              >
                {(items) => (
                  <div className="space-y-4">
                    {items.length > 0 ? (
                      <div>
                        <h3 className="type-heading-sm text-fg-primary">Impact Items</h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="border border-stroke-default rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                                    item.impact_level === "CRITICAL"
                                      ? "error-bg text-error-icon"
                                      : item.impact_level === "HIGH"
                                        ? "warning-bg text-warning-icon"
                                        : item.impact_level === "MEDIUM"
                                          ? "info-bg text-info-icon"
                                          : item.impact_level === "LOW"
                                            ? "success-bg text-success-icon"
                                            : "text-fg-tertiary"
                                  }`}>
                                    {item.impact_level ?? "—"}
                                  </span>
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="type-body-md text-fg-primary">{item.title}</p>
                                  <p className="type-body-sm text-fg-tertiary">
                                    Item ID: {item.id}
                                  </p>
                                  <p className="type-body-sm text-fg-tertiary">
                                    Product:{" "}
                                    <span className="text-fg-tertiary">
                                      {item.product_id ?? "—"}
                                    </span>
                                  </p>
                                  <p className="type-body-sm text-fg-tertiary">
                                    Market:{" "}
                                    <span className="text-fg-tertiary">
                                      {item.market_id ?? "—"}
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
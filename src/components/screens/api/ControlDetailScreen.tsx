import { PageBody, PageHeader } from "@/components/shared/Page";
import { ApiState } from "@/components/shared/ApiState";
import { useControl } from "@/hooks/useApiQueries";
import type { Control } from "@/services/api";

/** Control detail view, from GET /api/v1/portfolio/controls/{control_id}. */
export function ControlDetailScreen() {
  // In a real implementation, we would get the control ID from route params
  // For now, we'll use a placeholder approach similar to how other detail screens work
  const [controlId, setControlId] = React.useState<string | null>(null);

  // This would normally come from route parameters
  // We're using state to simulate route params for now
  const query = useControl(controlId ?? "");

  return (
    <>
      <PageHeader
        title="Control Detail"
        description="Detailed view of a portfolio control"
        breadcrumb={[
          { label: "Portfolio", onClick: () => /* navigate to portfolio */ },
          { label: "Controls", onClick: () => /* navigate to controls list */ },
          { label: controlId ?? "Select a control" },
        ]}
        onBack={() => /* navigate to controls list */}
      />
      <PageBody>
        <ApiState
          query={query}
          emptyTitle="Select a control"
          emptyDetail="Choose a control from the list to view its details."
        >
          {(control) => (
            <div className="space-y-6">
              <div>
                <h2 className="type-heading-md text-fg-primary">{control.title}</h2>
                <p className="type-body-sm text-fg-tertiary">
                  Control ID: {control.control_id}
                </p>
                <p className="type-body-sm text-fg-tertiary">
                  Category:{" "}
                  <span className="text-fg-tertiary">
                    {control.category ?? "—"}
                  </span>
                </p>
                <p className="type-body-sm text-fg-tertiary">
                  Status:{" "}
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                      control.status === "Active"
                        ? "success-bg text-success-icon"
                        : control.status === "Inactive"
                          ? "error-bg text-error-icon"
                          : "warning-bg text-warning-icon"
                    }`}
                  >
                    {control.status ?? "—"}
                  </span>
                </p>
                <p className="type-body-sm text-fg-tertiary">
                  Description:{" "}
                  <span className="text-fg-tertiary">
                    {control.description ?? "—"}
                  </span>
                </p>
              </div>

              {/* Additional control details would go here based on actual API response */}
              {/* For now, showing placeholder for other potential fields */}
              <div className="border-t border-stroke-default pt-4">
                <h3 className="type-heading-sm text-fg-primary">Control Details</h3>
                <p className="type-body-sm text-fg-tertiary">
                  Detailed control information would be displayed here based on the
                  actual ControlResponse structure from the backend.
                </p>
              </div>
            </div>
          )}
        </ApiState>
      </PageBody>
    </>
  );
}
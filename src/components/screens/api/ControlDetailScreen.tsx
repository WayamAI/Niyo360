import { PageBody, PageHeader } from "@/components/shared/Page";
import { ApiRecord, ApiRefresh } from "@/components/shared/ApiState";
import { Badge } from "@/components/shared/Badge";
import { useApp } from "@/context/AppContext";
import { useControl } from "@/hooks/useApiQueries";
import type { ControlStatus } from "@/services/api";

/** Control detail, from GET /api/v1/portfolio/controls/{control_id}. */

const STATUS_VARIANT: Record<ControlStatus, "complete" | "neutral" | "pending"> = {
  ACTIVE: "complete",
  INACTIVE: "neutral",
  DRAFT: "pending",
};

export function ControlDetailScreen() {
  const { selectedRecordId, navigateTo } = useApp();
  const query = useControl(selectedRecordId);

  return (
    <>
      <PageHeader
        title="Control"
        description="A single control from your portfolio's regulatory framework."
        breadcrumb={[
          { label: "Portfolio" },
          { label: "Controls", onClick: () => navigateTo("api-controls") },
          { label: selectedRecordId ?? "—" },
        ]}
        onBack={() => navigateTo("api-controls")}
        actions={<ApiRefresh query={query} />}
      />
      <PageBody>
        <ApiRecord
          query={query}
          notFoundTitle="Control not found"
          notFoundDetail="This control does not exist, or it belongs to another organization."
        >
          {(control) => (
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field label="Name">
                <span className="type-body-md text-fg-primary">{control.name}</span>
              </Field>
              <Field label="Status">
                <Badge variant={STATUS_VARIANT[control.status]}>{control.status}</Badge>
              </Field>
              <Field label="Category">{control.category}</Field>
              <Field label="Owner">{control.owner ?? "—"}</Field>
              <Field label="Control ID">
                <span className="font-mono text-fg-tertiary">{control.id}</span>
              </Field>
              <Field label="Created">
                <span className="tabular font-mono text-fg-tertiary">
                  {control.created_at.slice(0, 10)}
                </span>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">{control.description ?? "—"}</Field>
              </div>
            </dl>
          )}
        </ApiRecord>
      </PageBody>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="type-label-sm text-fg-quaternary">{label}</dt>
      <dd className="type-body-md mt-1 text-fg-secondary">{children}</dd>
    </div>
  );
}

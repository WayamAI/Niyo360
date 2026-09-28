import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { AppIcon } from "@/components/icons";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useControls } from "@/hooks/useApiQueries";
import type { Control } from "@/services/api";

/** Portfolio controls, from GET /api/v1/portfolio/controls/. */
export function ControlsScreen() {
  const query = useControls();

  const columns: Column<Control>[] = [
    {
      key: "control_id",
      header: "ID",
      value: (row) => row.control_id,
      render: (row) => <span className="font-mono text-fg-primary">{row.control_id}</span>,
    },
    {
      key: "title",
      header: "Title",
      value: (row) => row.title,
      render: (row) => <span className="text-fg-primary">{row.title}</span>,
    },
    {
      key: "category",
      header: "Category",
      value: (row) => row.category ?? null,
      render: (row) => (
        row.category ? (
          <span className="text-fg-tertiary">{row.category}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        )
      ),
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (row) => row.status ?? null,
      render: (row) => (
        row.status ? (
          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
            row.status === "Active"
              ? "success-bg text-success-icon"
              : row.status === "Inactive"
                ? "error-bg text-error-icon"
                : "warning-bg text-warning-icon"
          }`}>
            {row.status}
          </span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        )
      ),
    },
    {
      key: "description",
      header: "Description",
      hide: "md",
      value: (row) => row.description ?? null,
      render: (row) => (
        row.description ? (
          <span className="text-fg-tertiary">{row.description}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        )
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Portfolio Controls"
        description="Controls from your portfolio's regulatory framework."
        breadcrumb={[{ label: "Portfolio" }, { label: "Controls" }]}
        actions={
          <>
            <ApiCount query={query} />
            <ApiRefresh query={query} />
          </>
        }
      />
      <PageBody>
        <ApiState
          query={query}
          emptyTitle="No controls defined"
          emptyDetail="Controls appear here once they are defined in your portfolio."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.control_id}
              searchPlaceholder="Search controls by ID or title"
              getSearchText={(row) => `${row.control_id} ${row.title} ${row.category ?? ""} ${row.description ?? ""}`}
              exportName="parivart-controls"
              emptyTitle="No controls match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}
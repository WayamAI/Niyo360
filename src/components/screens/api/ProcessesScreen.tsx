import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useProcesses } from "@/hooks/useApiQueries";
import type { Process } from "@/services/api";

/** Processes, from GET /api/v1/portfolio/processes/. */
export function ProcessesScreen() {
  const query = useProcesses();

  const columns: Column<Process>[] = [
    {
      key: "name",
      header: "Process",
      card: "title",
      value: (row) => row.name,
      render: (row) => <span className="font-medium text-fg-primary">{row.name}</span>,
    },
    {
      key: "category",
      header: "Category",
      card: "meta",
      value: (row) => row.category ?? null,
      render: (row) =>
        row.category ? (
          <span className="text-fg-tertiary">{row.category}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "description",
      header: "Description",
      value: (row) => row.description ?? null,
      render: (row) =>
        row.description ? (
          <span className="line-clamp-2 max-w-[60ch] text-fg-tertiary">{row.description}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Processes"
        description="Business processes that regulatory obligations are mapped against."
        breadcrumb={[{ label: "Portfolio" }, { label: "Processes" }]}
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
          skeletonCols={3}
          emptyTitle="No processes yet"
          emptyDetail="Processes appear here once they are defined in the portfolio."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              searchPlaceholder="Search processes"
              getSearchText={(row) => `${row.name} ${row.description ?? ""}`}
              exportName="parivart-processes"
              emptyTitle="No processes match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

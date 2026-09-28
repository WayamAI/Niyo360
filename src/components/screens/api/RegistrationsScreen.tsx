import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { AppIcon } from "@/components/icons";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useRegistrations } from "@/hooks/useApiQueries";
import type { Registration } from "@/services/api";

/** Portfolio registrations, from GET /api/v1/portfolio/registrations/. */
export function RegistrationsScreen() {
  const query = useRegistrations();

  const columns: Column<Registration>[] = [
    {
      key: "registration_id",
      header: "ID",
      value: (row) => row.registration_id,
      render: (row) => <span className="font-mono text-fg-primary">{row.registration_id}</span>,
    },
    {
      key: "product_id",
      header: "Product",
      value: (row) => row.product_id ?? null,
      render: (row) => (
        row.product_id ? (
          <span className="font-mono text-fg-primary">{row.product_id}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        )
      ),
    },
    {
      key: "market_id",
      header: "Market",
      value: (row) => row.market_id ?? null,
      render: (row) => (
        row.market_id ? (
          <span className="font-mono text-fg-primary">{row.market_id}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        )
      ),
    },
    {
      key: "authority_id",
      header: "Authority",
      value: (row) => row.authority_id ?? null,
      render: (row) => (
        row.authority_id ? (
          <span className="font-mono text-fg-primary">{row.authority_id}</span>
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
            row.status === "Registered"
              ? "success-bg text-success-icon"
              : row.status === "Pending"
                ? "warning-bg text-warning-icon"
                : row.status === "Rejected"
                  ? "error-bg text-error-icon"
                  : "text-fg-tertiary"
          }`}>
            {row.status}
          </span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        )
      ),
    },
    {
      key: "registered_at",
      header: "Registered",
      hide: "lg",
      value: (row) => row.registered_at ?? null,
      render: (row) => (
        row.registered_at ? (
          <span className="tabular font-mono text-fg-tertiary">
            {row.registered_at.slice(0, 10)}
          </span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        )
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Portfolio Registrations"
        description="Registrations of your products in various markets."
        breadcrumb={[{ label: "Portfolio" }, { label: "Registrations" }]}
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
          emptyTitle="No registrations yet"
          emptyDetail="Registrations appear here once you register your products in markets."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.registration_id}
              searchPlaceholder="Search registrations by ID or product"
              getSearchText={(row) => `${row.registration_id} ${row.product_id ?? ""} ${row.market_id ?? ""} ${row.authority_id ?? ""}`}
              exportName="parivart-registrations"
              emptyTitle="No registrations match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}
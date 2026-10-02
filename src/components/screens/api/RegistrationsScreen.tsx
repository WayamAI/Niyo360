import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useRegistrations } from "@/hooks/useApiQueries";
import { usePortfolioNames } from "@/hooks/usePortfolioNames";
import type { Registration } from "@/services/api";

/** Portfolio registrations, from GET /api/v1/portfolio/registrations/. */
export function RegistrationsScreen() {
  const query = useRegistrations();
  const names = usePortfolioNames();

  const columns: Column<Registration>[] = [
    {
      key: "registration_number",
      header: "Registration",
      card: "title",
      value: (row) => row.registration_number ?? row.id,
      render: (row) => (
        <div className="min-w-0">
          <span className="block truncate font-mono font-medium text-fg-primary">
            {row.registration_number ?? "—"}
          </span>
          <span
            className="type-caption block truncate font-mono text-fg-quaternary"
            title={row.id}
          >
            {row.id}
          </span>
        </div>
      ),
    },
    {
      key: "product_id",
      header: "Product",
      value: (row) =>
        row.product_id ? names.resolve("PRODUCT", row.product_id).name ?? row.product_id : null,
      render: (row) => {
        if (!row.product_id) return <span className="text-fg-quaternary">—</span>;
        const resolved = names.resolve("PRODUCT", row.product_id);
        return (
          <div className="min-w-0">
            <span className="block truncate font-medium text-fg-primary">
              {resolved.name ?? (
                <span className="font-mono text-fg-tertiary" title={row.product_id}>
                  {names.isLoading ? "Resolving…" : `${row.product_id.slice(0, 8)}…`}
                </span>
              )}
            </span>
            {resolved.detail && (
              <span className="type-caption block truncate text-fg-quaternary">
                {resolved.detail}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "market_id",
      header: "Market",
      value: (row) =>
        row.market_id ? names.resolve("MARKET", row.market_id).name ?? row.market_id : null,
      render: (row) => {
        if (!row.market_id) return <span className="text-fg-quaternary">—</span>;
        const resolved = names.resolve("MARKET", row.market_id);
        return (
          <div className="min-w-0">
            <span className="block truncate font-medium text-fg-primary">
              {resolved.name ?? (
                <span className="font-mono text-fg-tertiary" title={row.market_id}>
                  {names.isLoading ? "Resolving…" : `${row.market_id.slice(0, 8)}…`}
                </span>
              )}
            </span>
            {resolved.detail && (
              <span className="type-caption block truncate text-fg-quaternary">
                {resolved.detail}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "authority_id",
      header: "Authority",
      value: (row) =>
        row.authority_id
          ? names.resolve("AUTHORITY", row.authority_id).name ?? row.authority_id
          : null,
      render: (row) => {
        if (!row.authority_id) return <span className="text-fg-quaternary">—</span>;
        const resolved = names.resolve("AUTHORITY", row.authority_id);
        return (
          <div className="min-w-0">
            <span className="block truncate font-medium text-fg-primary">
              {resolved.name ?? (
                <span className="font-mono text-fg-tertiary" title={row.authority_id}>
                  {names.isLoading ? "Resolving…" : `${row.authority_id.slice(0, 8)}…`}
                </span>
              )}
            </span>
            {resolved.detail && (
              <span className="type-caption block truncate text-fg-quaternary">
                {resolved.detail}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (row) => row.status ?? null,
      render: (row) =>
        row.status ? (
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
              row.status === "ACTIVE"
                ? "success-bg text-success-icon"
                : row.status === "PENDING"
                  ? "warning-bg text-warning-icon"
                  : row.status === "REJECTED"
                    ? "error-bg text-error-icon"
                    : "text-fg-tertiary"
            }`}
          >
            {row.status}
          </span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "valid_from",
      header: "Valid from",
      hide: "lg",
      value: (row) => row.valid_from ?? null,
      render: (row) =>
        row.valid_from ? (
          <span className="tabular font-mono text-fg-tertiary">{row.valid_from.slice(0, 10)}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
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
              rowKey={(row) => row.id}
              searchPlaceholder="Search registrations by number, product, market, or authority"
              getSearchText={(row) => {
                const prod = row.product_id
                  ? (names.resolve("PRODUCT", row.product_id).name ?? "")
                  : "";
                const mkt = row.market_id
                  ? (names.resolve("MARKET", row.market_id).name ?? "")
                  : "";
                const auth = row.authority_id
                  ? (names.resolve("AUTHORITY", row.authority_id).name ?? "")
                  : "";
                return `${row.id} ${row.registration_number ?? ""} ${prod} ${mkt} ${auth} ${row.status ?? ""}`;
              }}
              exportName="parivart-registrations"
              emptyTitle="No registrations match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

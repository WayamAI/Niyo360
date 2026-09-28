import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useMarkets } from "@/hooks/useApiQueries";
import type { Market, MarketStatus } from "@/services/api";

/** Markets, from GET /api/v1/portfolio/markets/. */

const STATUS_VARIANT: Record<MarketStatus, "complete" | "neutral" | "pending"> = {
  ACTIVE: "complete",
  INACTIVE: "neutral",
  PLANNED: "pending",
};

export function MarketsScreen() {
  const query = useMarkets();

  const columns: Column<Market>[] = [
    {
      key: "name",
      header: "Market",
      card: "title",
      value: (row) => row.name,
      render: (row) => <span className="font-medium text-fg-primary">{row.name}</span>,
    },
    {
      key: "country",
      header: "Country",
      value: (row) => row.country,
      render: (row) => <span className="text-fg-tertiary">{row.country}</span>,
    },
    {
      key: "region",
      header: "Region",
      hide: "md",
      value: (row) => row.region ?? null,
      render: (row) =>
        row.region ? (
          <span className="text-fg-tertiary">{row.region}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "regulatory_jurisdiction",
      header: "Jurisdiction",
      hide: "lg",
      value: (row) => row.regulatory_jurisdiction ?? null,
      render: (row) =>
        row.regulatory_jurisdiction ? (
          <span className="text-fg-tertiary">{row.regulatory_jurisdiction}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (row) => row.status,
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Markets"
        description="Territories this organization is registered in, served by the PARIVART API."
        breadcrumb={[{ label: "Portfolio" }, { label: "Markets" }]}
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
          emptyTitle="No markets yet"
          emptyDetail="This organization has no markets registered. They appear here once they are created in the portfolio."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              searchPlaceholder="Search markets by name or country"
              getSearchText={(row) => `${row.name} ${row.country} ${row.region ?? ""}`}
              exportName="parivart-markets"
              emptyTitle="No markets match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

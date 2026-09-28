import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useProducts } from "@/hooks/useApiQueries";
import type { Product, ProductStatus } from "@/services/api";

/**
 * Products, from GET /api/v1/portfolio/products/.
 *
 * Every column maps to a field on ProductResponse in the served schema. There
 * is no fallback dataset: an empty portfolio renders an empty state.
 */

const STATUS_VARIANT: Record<ProductStatus, "complete" | "neutral" | "pending" | "in-progress"> = {
  ACTIVE: "complete",
  INACTIVE: "neutral",
  ARCHIVED: "neutral",
  DRAFT: "pending",
};

function formatDate(value: string): string {
  // Backend sends ISO 8601; show the date part, which is what a list needs.
  return value.slice(0, 10);
}

export function ProductsScreen() {
  const query = useProducts();

  const columns: Column<Product>[] = [
    {
      key: "product_code",
      header: "Code",
      card: "title",
      value: (row) => row.product_code,
      render: (row) => <span className="font-mono text-brand">{row.product_code}</span>,
    },
    {
      key: "name",
      header: "Name",
      value: (row) => row.name,
      render: (row) => <span className="font-medium text-fg-primary">{row.name}</span>,
    },
    {
      key: "category",
      header: "Category",
      hide: "md",
      value: (row) => row.category ?? null,
      render: (row) =>
        row.category ? (
          <span className="text-fg-tertiary">{row.category}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "regulatory_class",
      header: "Regulatory class",
      hide: "lg",
      value: (row) => row.regulatory_class ?? null,
      render: (row) =>
        row.regulatory_class ? (
          <span className="text-fg-tertiary">{row.regulatory_class}</span>
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
    {
      key: "updated_at",
      header: "Updated",
      hide: "lg",
      value: (row) => row.updated_at,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{formatDate(row.updated_at)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Registered products in your organization's portfolio, served by the PARIVART API."
        breadcrumb={[{ label: "Portfolio" }, { label: "Products" }]}
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
          skeletonCols={6}
          emptyTitle="No products yet"
          emptyDetail="This organization has no products registered. They appear here once they are created in the portfolio."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              searchPlaceholder="Search products by name or code"
              getSearchText={(row) => `${row.product_code} ${row.name} ${row.description ?? ""}`}
              exportName="parivart-products"
              emptyTitle="No products match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

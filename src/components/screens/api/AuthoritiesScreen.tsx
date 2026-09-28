import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { AppIcon } from "@/components/icons";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useAuthorities } from "@/hooks/useApiQueries";
import type { Authority } from "@/services/api";

/** Regulatory authorities, from GET /api/v1/regulatory/authorities/. */
export function AuthoritiesScreen() {
  const query = useAuthorities();

  const columns: Column<Authority>[] = [
    {
      key: "short_name",
      header: "Code",
      card: "title",
      value: (row) => row.short_name,
      render: (row) => <span className="font-mono text-brand">{row.short_name}</span>,
    },
    {
      key: "name",
      header: "Authority",
      value: (row) => row.name,
      render: (row) => <span className="font-medium text-fg-primary">{row.name}</span>,
    },
    {
      key: "country",
      header: "Country",
      hide: "md",
      value: (row) => row.country ?? null,
      render: (row) =>
        row.country ? (
          <span className="text-fg-tertiary">{row.country}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "jurisdiction",
      header: "Jurisdiction",
      hide: "lg",
      value: (row) => row.jurisdiction ?? null,
      render: (row) =>
        row.jurisdiction ? (
          <span className="text-fg-tertiary">{row.jurisdiction}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "is_active",
      header: "State",
      card: "meta",
      value: (row) => String(row.is_active),
      render: (row) => (
        <Badge variant={row.is_active ? "complete" : "neutral"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "website",
      header: "",
      card: false,
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 rounded text-fg-tertiary hover:text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={`Open the ${row.short_name} website`}
          >
            <AppIcon name="external" size="sm" />
          </a>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Regulatory Authorities"
        description="Authorities PARIVART monitors. This registry is global configuration, shared across organizations."
        breadcrumb={[{ label: "Regulatory" }, { label: "Authorities" }]}
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
          skeletonCols={5}
          emptyTitle="No authorities registered"
          emptyDetail="The authority registry is empty on this backend. Authorities appear here once they are configured."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              searchPlaceholder="Search authorities by name or code"
              getSearchText={(row) => `${row.short_name} ${row.name} ${row.country ?? ""}`}
              exportName="parivart-authorities"
              emptyTitle="No authorities match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

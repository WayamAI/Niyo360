import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { AppIcon } from "@/components/icons";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useRunSource, useSources } from "@/hooks/useApiQueries";
import { useApp } from "@/context/AppContext";
import { ApiError, type Source } from "@/services/api";

/**
 * Regulatory sources, from GET /api/v1/regulatory/sources/.
 *
 * The Run action calls POST /sources/{id}/run. It is disabled while the
 * mutation is in flight so a double click cannot queue two ingestion runs —
 * the endpoint is not idempotent.
 */
export function SourcesScreen() {
  const query = useSources();
  const runSource = useRunSource();
  const { showToast } = useApp();

  function run(source: Source) {
    runSource.mutate(source.id, {
      onSuccess: (runRecord) =>
        showToast(`Ingestion queued for ${source.name} (${runRecord.status}).`, "success"),
      onError: (error) =>
        showToast(
          error instanceof ApiError ? error.message : `Could not queue a run for ${source.name}.`,
          "error",
        ),
    });
  }

  const columns: Column<Source>[] = [
    {
      key: "name",
      header: "Source",
      card: "title",
      value: (row) => row.name,
      render: (row) => <span className="font-medium text-fg-primary">{row.name}</span>,
    },
    {
      key: "source_type",
      header: "Type",
      value: (row) => row.source_type,
      render: (row) => <Badge variant="neutral">{row.source_type}</Badge>,
    },
    {
      key: "connector_type",
      header: "Connector",
      hide: "md",
      value: (row) => row.connector_type,
      render: (row) => (
        <span className="type-body-sm font-mono text-fg-tertiary">{row.connector_type}</span>
      ),
    },
    {
      key: "country",
      header: "Country",
      hide: "lg",
      value: (row) => row.country ?? null,
      render: (row) =>
        row.country ? (
          <span className="text-fg-tertiary">{row.country}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "last_run_at",
      header: "Last run",
      hide: "md",
      value: (row) => row.last_run_at ?? null,
      render: (row) =>
        row.last_run_at ? (
          <span className="tabular font-mono text-fg-tertiary">{row.last_run_at.slice(0, 16)}</span>
        ) : (
          <span className="text-fg-quaternary">Never</span>
        ),
    },
    {
      key: "enabled",
      header: "State",
      card: "meta",
      value: (row) => String(row.enabled),
      render: (row) => (
        <span className="flex items-center gap-1.5">
          <Badge variant={row.enabled ? "complete" : "neutral"}>
            {row.enabled ? "Enabled" : "Disabled"}
          </Badge>
          {row.last_error && (
            <AppIcon
              name="warning"
              size="xs"
              className="text-warning-icon"
              aria-label={`Last run reported an error: ${row.last_error}`}
            />
          )}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      card: false,
      render: (row) => (
        <span className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            disabled={runSource.isPending || !row.enabled}
            onClick={(event) => {
              event.stopPropagation();
              run(row);
            }}
          >
            <AppIcon name="play" size="sm" />
            {runSource.isPending ? "Queueing…" : "Run"}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Regulatory Sources"
        description="Feeds PARIVART ingests from. Running a source queues an ingestion job on the backend."
        breadcrumb={[{ label: "Regulatory" }, { label: "Sources" }]}
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
          emptyTitle="No sources configured"
          emptyDetail="Ingestion sources appear here once they are registered against an authority."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              searchPlaceholder="Search sources by name or type"
              getSearchText={(row) => `${row.name} ${row.url ?? ""} ${row.description ?? ""}`}
              exportName="parivart-sources"
              emptyTitle="No sources match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

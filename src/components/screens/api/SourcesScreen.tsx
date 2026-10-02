import { useState } from "react";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { AppIcon } from "@/components/icons";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Drawer } from "@/components/shared/Drawer";
import { useRunSource, useSources, useSourceRuns } from "@/hooks/useApiQueries";
import { useApp } from "@/context/AppContext";
import { ApiError, type IngestionStatus, type Source } from "@/services/api";

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
  const [historySource, setHistorySource] = useState<Source | null>(null);

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
        <span className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setHistorySource(row);
            }}
          >
            <AppIcon name="audit" size="xs" />
            Runs
          </Button>
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
              onRowOpen={(row) => setHistorySource(row)}
              searchPlaceholder="Search sources by name or type"
              getSearchText={(row) => `${row.name} ${row.url ?? ""} ${row.description ?? ""}`}
              exportName="parivart-sources"
              emptyTitle="No sources match this search"
            />
          )}
        </ApiState>
      </PageBody>

      <SourceRunsDrawer source={historySource} onClose={() => setHistorySource(null)} />
    </>
  );
}

function SourceRunsDrawer({ source, onClose }: { source: Source | null; onClose: () => void }) {
  const runsQuery = useSourceRuns(source?.id ?? null);

  const statusVariant = (
    status: IngestionStatus,
  ): "complete" | "critical" | "in-progress" | "neutral" => {
    switch (status) {
      case "COMPLETED":
        return "complete";
      case "FAILED":
        return "critical";
      case "RUNNING":
      case "PARTIAL":
        return "in-progress";
      case "QUEUED":
      default:
        return "neutral";
    }
  };

  return (
    <Drawer
      open={source !== null}
      onClose={onClose}
      title={source ? `Run History: ${source.name}` : "Run History"}
      subtitle={source ? `${source.source_type} · ${source.connector_type}` : undefined}
      width={600}
    >
      <div className="space-y-4 p-4">
        {runsQuery.isLoading ? (
          <div className="py-8 text-center type-body-md text-fg-tertiary">Loading run history…</div>
        ) : runsQuery.isError ? (
          <div className="rounded-lg border border-stroke-muted bg-container p-4 text-center">
            <p className="type-body-md text-error">Failed to load run history.</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => runsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : runsQuery.data && runsQuery.data.length > 0 ? (
          <div className="divide-y divide-stroke-muted rounded-lg border border-stroke-default bg-container">
            {runsQuery.data.map((run) => (
              <div key={run.id} className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                    <span className="font-mono type-caption text-fg-quaternary" title={run.id}>
                      {run.id.slice(0, 8)}
                    </span>
                  </div>
                  <span className="tabular font-mono type-body-sm text-fg-tertiary">
                    {run.started_at ? run.started_at.slice(0, 16).replace("T", " ") : "—"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono type-body-sm">
                  <div className="rounded bg-raised-1 p-1.5">
                    <div className="type-caption text-fg-quaternary">Discovered</div>
                    <div className="font-medium text-fg-primary">{run.documents_discovered}</div>
                  </div>
                  <div className="rounded bg-raised-1 p-1.5">
                    <div className="type-caption text-fg-quaternary">Downloaded</div>
                    <div className="font-medium text-fg-primary">{run.documents_downloaded}</div>
                  </div>
                  <div className="rounded bg-raised-1 p-1.5">
                    <div className="type-caption text-fg-quaternary">Processed</div>
                    <div className="font-medium text-fg-primary">{run.documents_processed}</div>
                  </div>
                  <div className="rounded bg-raised-1 p-1.5">
                    <div className="type-caption text-fg-quaternary">Failed</div>
                    <div className="font-medium text-fg-primary">{run.documents_failed}</div>
                  </div>
                </div>

                {run.error && (
                  <p className="rounded border border-stroke-muted bg-action p-2 type-body-sm text-error">
                    {run.error}
                  </p>
                )}

                {run.completed_at && (
                  <div className="text-right font-mono type-caption text-fg-quaternary">
                    Completed: {run.completed_at.slice(0, 16).replace("T", " ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center type-body-md text-fg-tertiary">
            No ingestion runs recorded for this source.
          </div>
        )}
      </div>
    </Drawer>
  );
}

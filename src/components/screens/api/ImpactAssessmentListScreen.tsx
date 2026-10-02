import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge, type StatusTone } from "@/components/shared/Badge";
import { AppIcon } from "@/components/icons";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/context/AppContext";
import { useImpactAssessments } from "@/hooks/useApiQueries";
import type { ImpactAssessment } from "@/services/api";

/** Impact assessments list, from GET /api/v1/impact/. */
export function ImpactAssessmentListScreen() {
  const { openRecord, navigateTo } = useApp();
  const query = useImpactAssessments();

  const columns: Column<ImpactAssessment>[] = [
    {
      key: "id",
      header: "ID",
      value: (row) => row.id,
      render: (row) => <span className="font-mono text-fg-primary">{row.id}</span>,
    },
    {
      // The assessment carries a generated summary, not a title.
      key: "summary",
      header: "Summary",
      value: (row) => row.summary ?? null,
      render: (row) =>
        row.summary ? (
          <span className="text-fg-primary">{row.summary}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      value: (row) => row.status ?? null,
      render: (row) => {
        if (!row.status) return <span className="text-fg-quaternary">—</span>;

        const status = row.status;
        const tone: StatusTone =
          status === "COMPLETED"
            ? "success"
            : status === "FAILED"
              ? "error"
              : status === "PENDING" || status === "ANALYZING"
                ? "warning"
                : "neutral";
        return <StatusBadge tone={tone}>{status}</StatusBadge>;
      },
    },
    {
      key: "created_at",
      header: "Created",
      hide: "lg",
      value: (row) => row.created_at ?? null,
      render: (row) =>
        row.created_at ? (
          <span className="tabular font-mono text-fg-tertiary">{row.created_at.slice(0, 10)}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Impact Assessments"
        description="Assessments of regulatory changes impact on your products."
        breadcrumb={[{ label: "Impact" }, { label: "Assessments" }]}
        actions={
          <>
            <ApiCount query={query} />
            <ApiRefresh query={query} />
            <Button variant="primary" size="sm" onClick={() => navigateTo("api-impact-analyze")}>
              Run analysis
            </Button>
          </>
        }
      />
      <PageBody>
        <ApiState
          query={query}
          emptyTitle="No assessments yet"
          emptyDetail="Impact assessments appear here once you analyze regulatory changes."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              onRowOpen={(row) => openRecord("api-impact-detail", row.id)}
              searchPlaceholder="Search assessments by ID or summary"
              getSearchText={(row) => `${row.id} ${row.summary ?? ""}`}
              exportName="parivart-impact-assessments"
              emptyTitle="No assessments match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

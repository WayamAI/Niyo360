import { PageBody, PageHeader } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useApp } from "@/context/AppContext";
import { useReports } from "@/hooks/useApiQueries";
import type { ImpactReport, ImpactReportStatus } from "@/services/api";

/** Impact reports, from GET /api/v1/reports/. */

// ReportStatus is a review lifecycle, not a job outcome: there is no COMPLETED
// or FAILED. A report that has been produced or signed off reads as complete,
// one still moving through review as pending, and an archived one as neutral.
const STATUS_VARIANT: Record<ImpactReportStatus, "complete" | "neutral" | "pending"> = {
  DRAFT: "pending",
  GENERATED: "complete",
  UNDER_REVIEW: "pending",
  REVIEWED: "complete",
  ARCHIVED: "neutral",
};

export function ReportListScreen() {
  const { openRecord } = useApp();
  const query = useReports();

  const columns: Column<ImpactReport>[] = [
    {
      key: "id",
      header: "Report ID",
      card: "title",
      value: (row) => row.id,
      render: (row) => <span className="font-mono text-fg-primary">{row.id}</span>,
    },
    {
      key: "title",
      header: "Title",
      value: (row) => row.title,
      render: (row) => <span className="text-fg-primary">{row.title}</span>,
    },
    {
      key: "status",
      header: "Status",
      card: "meta",
      value: (row) => row.status,
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>,
    },
    {
      key: "created_at",
      header: "Created",
      hide: "lg",
      value: (row) => row.created_at,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">
          {row.created_at ? row.created_at.slice(0, 10) : "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Impact Reports"
        description="Generated impact reports served by the PARIVART API."
        breadcrumb={[{ label: "Reports" }, { label: "Report List" }]}
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
          emptyTitle="No reports yet"
          emptyDetail="This organization has no reports generated. They appear here once reports are created via the API."
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              onRowOpen={(row) => openRecord("api-report-detail", row.id)}
              searchPlaceholder="Search reports by ID or title"
              getSearchText={(row) => `${row.id} ${row.title}`}
              exportName="parivart-reports"
              emptyTitle="No reports match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}
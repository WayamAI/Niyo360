import { useState } from "react";
import { PageBody, PageHeader, recordCrumb } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { FilterBar, FilterSelect } from "@/components/shared/Filters";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useApp } from "@/context/AppContext";
import { useRegulatoryChanges } from "@/hooks/useApiQueries";
import { confidence, label } from "@/components/screens/api/intelligenceFormat";
import type { ChangeType, RegulatoryChange } from "@/services/api";

/**
 * Regulatory changes, from GET /api/v1/regulatory/changes/.
 *
 * The start of the chain and the question a CEO asks first: what changed? Each
 * row is something the document pipeline extracted from a source document, with
 * the confidence of that extraction attached — these are readings of a
 * regulation, not the regulation itself, and the screen says so.
 */

const CHANGE_TYPES: readonly ChangeType[] = [
  "NEW_REQUIREMENT",
  "REQUIREMENT_CHANGE",
  "DELETED_REQUIREMENT",
  "SCOPE_CHANGE",
  "DEADLINE_CHANGE",
  "LABELING_CHANGE",
  "REPORTING_CHANGE",
  "PROCESS_CHANGE",
  "SAFETY_CHANGE",
  "DEFINITION_CHANGE",
  "OTHER",
];

const TYPE_FILTER = ["All", ...CHANGE_TYPES] as const;
type TypeFilter = (typeof TYPE_FILTER)[number];

/**
 * A change that removes or narrows an obligation is a different kind of news
 * from one that adds a requirement, so the two do not read alike.
 */
const TYPE_VARIANT: Record<string, "high-risk" | "medium-risk" | "neutral" | "open"> = {
  NEW_REQUIREMENT: "high-risk",
  SAFETY_CHANGE: "high-risk",
  DEADLINE_CHANGE: "medium-risk",
  REQUIREMENT_CHANGE: "medium-risk",
  SCOPE_CHANGE: "medium-risk",
  DELETED_REQUIREMENT: "neutral",
  DEFINITION_CHANGE: "neutral",
};

export function RegulatoryChangeListScreen() {
  const { openRecord } = useApp();
  const [changeType, setChangeType] = useState<TypeFilter>("All");

  const query = useRegulatoryChanges(
    changeType === "All" ? {} : { change_type: changeType as ChangeType },
  );

  const columns: Column<RegulatoryChange>[] = [
    {
      key: "summary",
      header: "What changed",
      card: "title",
      value: (row) => row.summary,
      render: (row) => <span className="text-fg-primary">{row.summary}</span>,
    },
    {
      key: "change_type",
      header: "Type",
      card: "meta",
      value: (row) => row.change_type,
      render: (row) => (
        <Badge variant={TYPE_VARIANT[row.change_type] ?? "open"}>{label(row.change_type)}</Badge>
      ),
    },
    {
      key: "section",
      header: "Section",
      hide: "md",
      card: "field",
      value: (row) => row.section ?? null,
      render: (row) =>
        row.section ? (
          <span className="text-fg-tertiary">{row.section}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      card: "meta",
      value: (row) => row.confidence ?? null,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{confidence(row.confidence)}</span>
      ),
    },
    {
      key: "document_id",
      header: "Source document",
      hide: "lg",
      card: "field",
      value: (row) => row.document_id ?? null,
      render: (row) =>
        row.document_id ? (
          <span className="font-mono text-fg-quaternary">{recordCrumb(row.document_id)}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Regulatory Changes"
        description="What the document pipeline extracted from each source document, with the confidence of the extraction. These are readings of a regulation, not the regulation itself."
        breadcrumb={[{ label: "Regulatory Intelligence" }, { label: "Changes" }]}
        actions={
          <>
            <ApiCount query={query} />
            <ApiRefresh query={query} />
          </>
        }
      >
        <FilterBar
          activeCount={changeType === "All" ? 0 : 1}
          onClear={changeType === "All" ? undefined : () => setChangeType("All")}
        >
          <FilterSelect
            label="Type"
            value={changeType}
            onChange={setChangeType}
            options={TYPE_FILTER}
            optionLabel={(option) => (option === "All" ? "All" : label(option))}
          />
        </FilterBar>
      </PageHeader>
      <PageBody>
        <ApiState
          query={query}
          emptyTitle={
            changeType === "All" ? "No regulatory changes yet" : `No ${label(changeType)} changes`
          }
          emptyDetail={
            changeType === "All"
              ? "Changes appear once a source document has been uploaded and processed."
              : "Clear the type filter to see the rest."
          }
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              onRowOpen={(row) => openRecord("api-change-detail", row.id)}
              defaultSort={{ key: "confidence", dir: "desc" }}
              searchPlaceholder="Search changes by summary, section or type"
              getSearchText={(row) =>
                `${row.summary} ${row.section ?? ""} ${row.change_type} ${row.source_reference ?? ""}`
              }
              exportName="parivart-regulatory-changes"
              emptyTitle="No changes match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

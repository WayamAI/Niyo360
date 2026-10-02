import { useState } from "react";
import { PageBody, PageHeader, recordCrumb } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { FilterBar, FilterSelect } from "@/components/shared/Filters";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { useApp } from "@/context/AppContext";
import { useObligations } from "@/hooks/useApiQueries";
import { confidence, label } from "@/components/screens/api/intelligenceFormat";
import type { ObligationCategory, RegulatoryObligation } from "@/services/api";

/**
 * Obligations, from GET /api/v1/regulatory/obligations/.
 *
 * What the regulations actually require, extracted from source documents and
 * categorised. Opening a row goes to the change that created it, because an
 * obligation without its change is a requirement with no cause.
 */

const CATEGORIES: readonly ObligationCategory[] = [
  "LABELING",
  "MANUFACTURING",
  "QUALITY",
  "SAFETY",
  "REPORTING",
  "REGISTRATION",
  "SUBMISSION",
  "POST_MARKET",
  "CLINICAL",
  "PACKAGING",
  "DATA",
  "CYBERSECURITY",
  "RECORDKEEPING",
  "OTHER",
];

const CATEGORY_FILTER = ["All", ...CATEGORIES] as const;
type CategoryFilter = (typeof CATEGORY_FILTER)[number];

function day(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "—";
}

export function ObligationListScreen() {
  const { openRecord } = useApp();
  const [category, setCategory] = useState<CategoryFilter>("All");

  const query = useObligations(
    category === "All" ? {} : { category: category as ObligationCategory },
  );

  const columns: Column<RegulatoryObligation>[] = [
    {
      key: "text",
      header: "Requirement",
      card: "title",
      value: (row) => row.text,
      render: (row) => <span className="text-fg-primary">{row.text}</span>,
    },
    {
      key: "category",
      header: "Category",
      card: "meta",
      value: (row) => row.category,
      render: (row) => <Badge variant="open">{label(row.category)}</Badge>,
    },
    {
      key: "jurisdiction",
      header: "Jurisdiction",
      card: "meta",
      value: (row) => row.jurisdiction ?? null,
      render: (row) =>
        row.jurisdiction ? (
          <span className="text-fg-tertiary">{row.jurisdiction}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "effective_date",
      header: "Effective",
      align: "right",
      card: "meta",
      value: (row) => row.effective_date ?? null,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{day(row.effective_date)}</span>
      ),
    },
    {
      key: "source_section",
      header: "Source",
      hide: "md",
      card: "field",
      value: (row) => row.source_section ?? null,
      render: (row) => (
        <span className="text-fg-quaternary">
          {[row.source_section, row.source_page].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      hide: "lg",
      card: "field",
      value: (row) => row.confidence ?? null,
      render: (row) => (
        <span className="tabular font-mono text-fg-quaternary">{confidence(row.confidence)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Obligations"
        description="What the regulations require, extracted from source documents. Opening one goes to the change that created it."
        breadcrumb={[{ label: "Regulatory Intelligence" }, { label: "Obligations" }]}
        actions={
          <>
            <ApiCount query={query} />
            <ApiRefresh query={query} />
          </>
        }
      >
        <FilterBar
          activeCount={category === "All" ? 0 : 1}
          onClear={category === "All" ? undefined : () => setCategory("All")}
        >
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={CATEGORY_FILTER}
            optionLabel={(option) => (option === "All" ? "All" : label(option))}
          />
        </FilterBar>
      </PageHeader>
      <PageBody>
        <ApiState
          query={query}
          emptyTitle={
            category === "All" ? "No obligations yet" : `No ${label(category)} obligations`
          }
          emptyDetail={
            category === "All"
              ? "Obligations appear once a source document has been processed and its requirements extracted."
              : "Clear the category filter to see the rest."
          }
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              // The obligation has no detail screen of its own; its meaning is
              // its change, so that is where a row leads.
              onRowOpen={(row) =>
                row.change_id ? openRecord("api-change-detail", row.change_id) : undefined
              }
              defaultSort={{ key: "category", dir: "asc" }}
              searchPlaceholder="Search obligations by text, category or jurisdiction"
              getSearchText={(row) =>
                `${row.text} ${row.category} ${row.jurisdiction ?? ""} ${row.applicability ?? ""}`
              }
              exportName="parivart-obligations"
              emptyTitle="No obligations match this search"
            />
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { KpiRow, KpiTile } from "@/components/shared/Panel";
import { Badge, badgeForRisk, badgeForStatus } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { FilterBar, FilterSelect } from "@/components/shared/Filters";
import { CHANGES, PRODUCTS, PRODUCT_BY_ID } from "@/data/mockData";

type Change = (typeof CHANGES)[number];

const RISKS = ["All", "High", "Medium", "Low"] as const;

export function CMCChangeSimulator() {
  const { navigateTo, showToast, logAudit, setSelectedChangeId, selectedChangeId } = useApp();
  const [product, setProduct] = useState("All");
  const [risk, setRisk] = useState<(typeof RISKS)[number]>("All");

  // Built from PRODUCTS rather than three hard-coded <option>s, which had
  // drifted to short names ("Volantis") that no longer matched the records.
  const productOptions = useMemo(() => ["All", ...PRODUCTS.map((p) => p.id)], []);

  const rows = useMemo(
    () =>
      CHANGES.filter(
        (change) =>
          (product === "All" || change.productId === product) &&
          (risk === "All" || change.riskLevel === risk),
      ),
    [product, risk],
  );

  const activeFilters = [product, risk].filter((value) => value !== "All").length;
  const simulated = CHANGES.filter((c) => c.simulationStatus === "complete").length;
  const highRisk = CHANGES.filter((c) => c.riskLevel === "High").length;
  const marketsTouched = CHANGES.reduce((sum, c) => Math.max(sum, c.affectedMarkets), 0);

  function openResults(change: Change) {
    if (change.simulationStatus !== "complete") {
      showToast(`Simulation queued for ${change.id}.`, "success");
      return;
    }
    setSelectedChangeId(change.id);
    navigateTo("heatmap");
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "04",
      action: `Viewed simulation results for ${change.id}`,
    });
  }

  const columns: Column<Change>[] = [
    {
      key: "id",
      header: "Change",
      card: "title",
      value: (change) => change.id,
      render: (change) => (
        <span className="font-mono text-[color:var(--pillar-04)]">{change.id}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      value: (change) => PRODUCT_BY_ID(change.productId)?.name ?? "",
      render: (change) => (
        <span className="text-fg-primary">{PRODUCT_BY_ID(change.productId)?.name ?? "—"}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      value: (change) => change.changeType,
      render: (change) => (
        <span className="line-clamp-2 max-w-[30ch] text-fg-tertiary">{change.changeType}</span>
      ),
    },
    {
      key: "markets",
      header: "Markets",
      align: "right",
      value: (change) => change.affectedMarkets,
      render: (change) => (
        <span className="tabular font-mono text-fg-primary">{change.affectedMarkets}</span>
      ),
    },
    {
      key: "status",
      header: "Simulation",
      card: "meta",
      value: (change) => change.status,
      render: (change) => <Badge variant={badgeForStatus(change.status)}>{change.status}</Badge>,
    },
    {
      key: "risk",
      header: "Risk",
      value: (change) => change.riskLevel,
      render: (change) => (
        <Badge variant={badgeForRisk(change.riskLevel)}>{change.riskLevel}</Badge>
      ),
    },
    {
      key: "deadline",
      header: "Filing deadline",
      hide: "md",
      value: (change) => change.filingDeadline,
      render: (change) => (
        <span className="tabular font-mono text-fg-tertiary">{change.filingDeadline}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      card: false,
      render: (change) => (
        <span className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              openResults(change);
            }}
          >
            {change.simulationStatus === "complete" ? "View results" : "Run simulation"}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="CMC Change Impact Simulator"
        description="Simulate the regulatory cascade of a proposed CMC or label change across every registered market before authoring begins."
        breadcrumb={[{ label: "Change Simulator" }, { label: "CMC Simulator" }]}
        badges={<Badge variant="pillar-04">Pillar 04</Badge>}
        actions={
          <Button size="sm" onClick={() => navigateTo("new-change")}>
            New change
          </Button>
        }
      />

      <PageBody className="gap-4">
        <KpiRow>
          <KpiTile label="Active changes" value={CHANGES.length} />
          <KpiTile
            label="Simulated"
            value={simulated}
            note={`of ${CHANGES.length}`}
            tone="success"
          />
          <KpiTile label="High risk" value={highRisk} tone={highRisk > 0 ? "warning" : "neutral"} />
          <KpiTile label="Largest cascade" value={marketsTouched} note="Markets in one change" />
        </KpiRow>

        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(change) => change.id}
          onRowOpen={openResults}
          isRowActive={(change) => change.id === selectedChangeId}
          searchPlaceholder="Search changes by ID, title or type"
          getSearchText={(change) => `${change.id} ${change.title} ${change.description}`}
          exportName="cmc-changes"
          emptyTitle="No changes match these filters"
          emptyDetail="Widen the product or risk filter to see more of the portfolio."
          toolbar={
            <FilterBar
              activeCount={activeFilters}
              onClear={() => {
                setProduct("All");
                setRisk("All");
              }}
            >
              <FilterSelect
                label="Product"
                value={product}
                onChange={setProduct}
                options={productOptions}
                optionLabel={(id) => (id === "All" ? "All" : (PRODUCT_BY_ID(id)?.name ?? id))}
              />
              <FilterSelect label="Risk" value={risk} onChange={setRisk} options={RISKS} />
            </FilterBar>
          }
        />
      </PageBody>
    </>
  );
}

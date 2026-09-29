import { useEffect, useMemo, useRef, useState } from "react";
import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { Panel } from "@/components/shared/Panel";
import { Badge, badgeForStatus } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Drawer";
import { CHANGES, PRODUCTS, PRODUCT_BY_ID, VALIDATION_REPORTS } from "@/data/mockData";

function scoreTone(score: number): string {
  if (score >= 90) return "var(--feedback-success-icon)";
  if (score >= 75) return "var(--feedback-warning-icon)";
  return "var(--feedback-error-icon)";
}

export function PreSubmissionValidator() {
  const { navigateTo, showToast, logAudit } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [changeId, setChangeId] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState("EMA");
  const timers = useRef<number[]>([]);

  const changesForProduct = useMemo(
    () => CHANGES.filter((change) => change.productId === productId),
    [productId],
  );

  // Keep the change selection valid when the product changes, rather than
  // leaving a change belonging to a different product selected.
  useEffect(() => {
    setChangeId(changesForProduct[0]?.id ?? "");
  }, [changesForProduct]);

  // A run left in flight when the screen unmounts used to fire its toast and
  // setState into a dead component.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  function start() {
    setModalOpen(false);
    setRunning(true);
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "03",
      action: `Started validation run for ${changeId || productId} (${jurisdiction})`,
    });
    const checks = VALIDATION_REPORTS[0].totalChecks;
    const failed = VALIDATION_REPORTS[0].failed;
    timers.current.push(
      window.setTimeout(() => {
        setRunning(false);
        showToast(`Validation complete. ${checks} checks performed.`, "success");
        logAudit({
          actor: "Compliance Validator",
          actorType: "agent",
          pillar: "03",
          action: `Validation run completed. ${checks} checks, ${failed} failed.`,
        });
      }, 3000),
    );
  }

  return (
    <>
      <PageHeader
        title="Pre-Submission Validator"
        source="illustrative"
        description="Semantic validation across CTD modules: cross-module consistency, jurisdiction-specific mandatory fields, and labelling compliance against current authority requirements."
        breadcrumb={[{ label: "Compliance Validator" }, { label: "Pre-Submission Validator" }]}
        badges={<Badge variant="pillar-03">Pillar 03</Badge>}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)} disabled={running}>
            <AppIcon name="simulator" size="sm" /> Run validation
          </Button>
        }
      />

      <PageBody className="gap-4">
        {running && (
          <Panel>
            <div role="status" aria-live="polite">
              <div className="type-body-md mb-2 text-fg-tertiary">Validation in progress…</div>
              <div className="h-1.5 overflow-hidden rounded-full bg-action">
                <div className="sim-bar h-full" style={{ background: "var(--pillar-03)" }} />
              </div>
            </div>
          </Panel>
        )}

        <ul className="flex flex-col gap-3">
          {VALIDATION_REPORTS.map((report) => {
            const product = PRODUCT_BY_ID(report.productId);
            const tone = scoreTone(report.overallScore);
            const counts = {
              critical: report.issues.filter((i) => i.severity === "Critical").length,
              major: report.issues.filter((i) => i.severity === "Major").length,
              minor: report.issues.filter((i) => i.severity === "Minor").length,
            };
            return (
              <li key={report.id}>
                <article
                  className="rounded-lg border border-stroke-default bg-container p-4"
                  style={{ borderTop: "2px solid var(--pillar-03)" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-[220px] flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="type-body-md font-mono text-[color:var(--pillar-03)]">
                          {report.id}
                        </span>
                        <span className="type-heading-sm text-fg-primary">
                          {product?.name ?? "Unknown product"}
                        </span>
                        <Badge variant="pillar-03">{report.jurisdiction}</Badge>
                        <span className="type-caption tabular font-mono text-fg-quaternary">
                          {report.validationDate}
                        </span>
                        <span className="type-caption rounded bg-action px-1.5 py-0.5 font-mono text-fg-tertiary">
                          {report.ectdVersion}
                        </span>
                      </div>
                      <p className="type-body-md text-fg-tertiary">{report.dossierTitle}</p>
                      <p className="type-body-sm tabular mt-1.5 text-fg-quaternary">
                        {report.totalChecks} checks · {report.passed} passed · {report.warnings}{" "}
                        warnings · {report.failed} failed
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <span className="type-display-metric tabular" style={{ color: tone }}>
                        {report.overallScore}
                      </span>
                      <span className="type-caption text-fg-quaternary">/ 100</span>
                      <Badge variant={badgeForStatus(report.status)}>{report.status}</Badge>
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(
                      [
                        ["Critical", counts.critical, "var(--feedback-error-icon)"],
                        ["Major", counts.major, "var(--feedback-warning-icon)"],
                        ["Minor", counts.minor, "var(--feedback-info-icon)"],
                        ["Passed", report.passed, "var(--feedback-success-icon)"],
                      ] as const
                    ).map(([label, value, color]) => (
                      <div
                        key={label}
                        className="rounded-md border border-stroke-muted bg-action px-3 py-2"
                      >
                        <dt className="type-label-sm text-fg-quaternary">{label}</dt>
                        <dd className="type-display-metric-xs mt-0.5" style={{ color }}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => navigateTo("validation-reports")}>
                      View full report
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showToast(`${report.id} exported as PDF.`, "success")}
                    >
                      Export
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </PageBody>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New validation run"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={start}>Start validation</Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="type-label-sm text-fg-quaternary">Product</span>
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="type-body-md mt-1 h-8 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {PRODUCTS.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="type-label-sm text-fg-quaternary">Change</span>
            <select
              value={changeId}
              onChange={(event) => setChangeId(event.target.value)}
              disabled={changesForProduct.length === 0}
              className="type-body-md mt-1 h-8 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {changesForProduct.length === 0 ? (
                <option value="">No open changes for this product</option>
              ) : (
                changesForProduct.map((change) => (
                  <option key={change.id} value={change.id}>
                    {change.id} · {change.title}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block">
            <span className="type-label-sm text-fg-quaternary">Jurisdiction</span>
            <select
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
              className="type-body-md mt-1 h-8 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {["EMA", "FDA", "PMDA", "ANVISA", "MHRA", "Health Canada"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </Modal>
    </>
  );
}

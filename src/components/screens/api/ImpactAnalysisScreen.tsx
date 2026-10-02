import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { Button } from "@/components/shared/Button";
import { ApiState } from "@/components/shared/ApiState";
import {
  useAnalyzeImpact,
  useImpactAssessments,
  useReanalyzeImpact,
  useRegulatoryChanges,
} from "@/hooks/useApiQueries";
import { useApp } from "@/context/AppContext";

const FIELD =
  "h-9 w-full rounded-md border border-stroke-muted bg-action px-3 text-body-md text-primary placeholder:text-quaternary outline-none transition-colors duration-150 hover:border-stroke-default focus-visible:ring-2 focus-visible:ring-ring";

const TABS = [
  { id: "analyze", label: "Analyze a change" },
  { id: "reanalyze", label: "Re-analyze an assessment" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ImpactAnalysisScreen() {
  const { showToast, navigateTo, openRecord } = useApp();
  const [tab, setTab] = useState<TabId>("analyze");
  const assessmentsQuery = useImpactAssessments();
  const changesQuery = useRegulatoryChanges({ limit: 100 });
  const analyzeImpact = useAnalyzeImpact();
  const reanalyzeImpact = useReanalyzeImpact();

  const analyzeForm = useForm<{ regulatory_change_id: string; force_reanalyze: boolean }>({
    defaultValues: { regulatory_change_id: "", force_reanalyze: false },
  });
  const reanalyzeForm = useForm<{ assessment_id: string }>({
    defaultValues: { assessment_id: "" },
  });

  const onAnalyze = analyzeForm.handleSubmit(async (data) => {
    try {
      const assessment = await analyzeImpact.mutateAsync({
        regulatory_change_id: data.regulatory_change_id.trim(),
        force_reanalyze: data.force_reanalyze,
      });
      showToast("Impact analysis complete.", "success");
      openRecord("api-impact-detail", assessment.id);
    } catch {
      showToast("Could not run the impact analysis.", "error");
    }
  });

  const onReanalyze = reanalyzeForm.handleSubmit(async (data) => {
    try {
      const assessment = await reanalyzeImpact.mutateAsync(data.assessment_id);
      showToast("Re-analysis complete.", "success");
      openRecord("api-impact-detail", assessment.id);
    } catch {
      showToast("Could not re-analyse this assessment.", "error");
    }
  });

  return (
    <>
      <PageHeader
        title="Impact Analysis"
        description="Match a regulatory change against your portfolio using deterministic rules."
        breadcrumb={[
          { label: "Impact" },
          { label: "Assessments", onClick: () => navigateTo("api-impact") },
          { label: "Analysis" },
        ]}
        onBack={() => navigateTo("api-impact")}
      />
      <PageBody>
        <div role="tablist" aria-label="Analysis modes" className="mb-6 flex items-center gap-2">
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={[
                  "inline-flex h-8 items-center rounded-full px-4 text-label-sm outline-none transition-colors duration-[180ms]",
                  selected
                    ? "bg-action-primary text-on-action-primary font-medium"
                    : "border border-stroke-muted bg-action text-tertiary hover:border-stroke-default hover:text-secondary",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {tab === "analyze" ? (
            <form
              onSubmit={onAnalyze}
              className="max-w-xl space-y-5 rounded-lg border border-stroke-muted bg-container p-6 shadow-sm"
            >
              <div className="space-y-1.5">
                <label
                  className="text-caption font-medium tracking-[0.06em] text-quaternary uppercase"
                  htmlFor="regulatory_change_id"
                >
                  Regulatory Change
                </label>
                {changesQuery.isLoading ? (
                  <div className="py-1 text-body-sm text-quaternary">
                    Loading regulatory changes…
                  </div>
                ) : changesQuery.isError ? (
                  <div className="space-y-1">
                    <p className="text-body-sm text-error">
                      Could not load regulatory changes from API.
                    </p>
                    <input
                      id="regulatory_change_id"
                      className={FIELD}
                      placeholder="Enter regulatory change UUID…"
                      aria-invalid={Boolean(analyzeForm.formState.errors.regulatory_change_id)}
                      {...analyzeForm.register("regulatory_change_id", {
                        required: "A regulatory change ID is required.",
                      })}
                    />
                  </div>
                ) : changesQuery.data && changesQuery.data.length > 0 ? (
                  <select
                    id="regulatory_change_id"
                    className={FIELD}
                    aria-invalid={Boolean(analyzeForm.formState.errors.regulatory_change_id)}
                    {...analyzeForm.register("regulatory_change_id", {
                      required: "Please choose a regulatory change to analyze.",
                    })}
                  >
                    <option value="">Select a regulatory change…</option>
                    {changesQuery.data.map((c) => {
                      const label = [
                        c.section ? `§${c.section}` : null,
                        c.change_type,
                        c.summary
                          ? c.summary.length > 45
                            ? `${c.summary.slice(0, 45)}…`
                            : c.summary
                          : null,
                        `(${c.id.slice(0, 8)})`,
                      ]
                        .filter(Boolean)
                        .join(" · ");
                      return (
                        <option key={c.id} value={c.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <p className="text-body-sm text-quaternary">
                      No regulatory changes found in the system. Enter a change UUID manually:
                    </p>
                    <input
                      id="regulatory_change_id"
                      className={FIELD}
                      placeholder="Enter regulatory change UUID…"
                      aria-invalid={Boolean(analyzeForm.formState.errors.regulatory_change_id)}
                      {...analyzeForm.register("regulatory_change_id", {
                        required: "A regulatory change ID is required.",
                      })}
                    />
                  </div>
                )}
                {analyzeForm.formState.errors.regulatory_change_id && (
                  <p className="text-body-sm text-error">
                    {analyzeForm.formState.errors.regulatory_change_id.message}
                  </p>
                )}
              </div>

              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...analyzeForm.register("force_reanalyze")}
                />
                <span>
                  <span className="text-body-md font-medium text-secondary">Force re-analysis</span>
                  <span className="block text-body-sm text-quaternary">
                    Analysis is idempotent: without this, a change that already has an assessment
                    returns the existing one instead of producing a new version.
                  </span>
                </span>
              </label>

              <Button type="submit" variant="primary" disabled={analyzeForm.formState.isSubmitting}>
                {analyzeForm.formState.isSubmitting ? "Analysing…" : "Run analysis"}
              </Button>
            </form>
          ) : (
            <ApiState
              query={assessmentsQuery}
              emptyTitle="No assessments yet"
              emptyDetail="Run an analysis first; re-analysis works on an existing assessment."
              skeletonCols={2}
            >
              {(assessments) => (
                <form
                  onSubmit={onReanalyze}
                  className="max-w-xl space-y-5 rounded-lg border border-stroke-muted bg-container p-6 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <label
                      className="text-caption font-medium tracking-[0.06em] text-quaternary uppercase"
                      htmlFor="assessment_id"
                    >
                      Assessment
                    </label>
                    <select
                      id="assessment_id"
                      className={FIELD}
                      aria-invalid={Boolean(reanalyzeForm.formState.errors.assessment_id)}
                      {...reanalyzeForm.register("assessment_id", {
                        required: "Choose the assessment to re-analyse.",
                      })}
                    >
                      <option value="">Select an assessment…</option>
                      {assessments.map((assessment) => (
                        <option key={assessment.id} value={assessment.id}>
                          {assessment.id.slice(0, 8)} · v{assessment.analysis_version} ·{" "}
                          {assessment.overall_impact_level}
                        </option>
                      ))}
                    </select>
                    {reanalyzeForm.formState.errors.assessment_id && (
                      <p className="text-body-sm text-error">
                        {reanalyzeForm.formState.errors.assessment_id.message}
                      </p>
                    )}
                  </div>

                  <p className="text-body-sm text-quaternary">
                    Re-analysis produces a new analysis version of this assessment.
                  </p>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={reanalyzeForm.formState.isSubmitting}
                  >
                    {reanalyzeForm.formState.isSubmitting ? "Re-analysing…" : "Re-analyse"}
                  </Button>
                </form>
              )}
            </ApiState>
          )}
        </div>
      </PageBody>
    </>
  );
}

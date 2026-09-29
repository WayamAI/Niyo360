import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { Button } from "@/components/shared/Button";
import { ApiState } from "@/components/shared/ApiState";
import { useAnalyzeImpact, useImpactAssessments, useReanalyzeImpact } from "@/hooks/useApiQueries";
import { useApp } from "@/context/AppContext";

/**
 * Run impact analysis: POST /api/v1/impact/analyze, or
 * POST /api/v1/impact/{assessment_id}/reanalyze.
 *
 * Analysis is idempotent by regulatory change: asking again for a change that
 * already has an assessment returns the existing one unless force_reanalyze is
 * set, which is why that is an explicit checkbox rather than a hidden default.
 *
 * The change id is typed rather than picked because this backend exposes no
 * endpoint that lists regulatory changes -- inventing one here would mean
 * inventing a contract. Re-analysis picks from the assessments that do exist.
 */

const FIELD =
  "type-body-lg h-9 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary placeholder:text-fg-quaternary transition-colors duration-150 hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const TABS = [
  { id: "analyze", label: "Analyze a change" },
  { id: "reanalyze", label: "Re-analyze an assessment" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ImpactAnalysisScreen() {
  const { showToast, navigateTo, openRecord } = useApp();
  const [tab, setTab] = useState<TabId>("analyze");
  const assessmentsQuery = useImpactAssessments();
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
        description="Match a regulatory change against your portfolio."
        breadcrumb={[
          { label: "Impact" },
          { label: "Assessments", onClick: () => navigateTo("api-impact") },
          { label: "Analysis" },
        ]}
        onBack={() => navigateTo("api-impact")}
      />
      <PageBody>
        <div
          role="tablist"
          aria-label="Analysis modes"
          className="mb-6 flex h-11 shrink-0 border-b border-stroke-muted"
        >
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`type-label-md border-b-2 px-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none ${
                  selected
                    ? "border-brand text-fg-primary"
                    : "border-transparent text-fg-tertiary hover:text-fg-secondary"
                }`}
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
              className="max-w-xl space-y-5 rounded-lg border border-stroke-default bg-container p-5"
            >
              <div className="space-y-1.5">
                <label className="type-label-sm text-fg-quaternary" htmlFor="regulatory_change_id">
                  Regulatory change ID
                </label>
                <input
                  id="regulatory_change_id"
                  className={FIELD}
                  placeholder="UUID of the regulatory change"
                  aria-invalid={Boolean(analyzeForm.formState.errors.regulatory_change_id)}
                  {...analyzeForm.register("regulatory_change_id", {
                    required: "A regulatory change ID is required.",
                  })}
                />
                {analyzeForm.formState.errors.regulatory_change_id && (
                  <p className="type-body-md text-error">
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
                  <span className="type-body-md text-fg-secondary">Force re-analysis</span>
                  <span className="type-body-md block text-fg-quaternary">
                    Analysis is idempotent: without this, a change that already has an
                    assessment returns the existing one instead of producing a new version.
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
                  className="max-w-xl space-y-5 rounded-lg border border-stroke-default bg-container p-5"
                >
                  <div className="space-y-1.5">
                    <label className="type-label-sm text-fg-quaternary" htmlFor="assessment_id">
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
                      <p className="type-body-md text-error">
                        {reanalyzeForm.formState.errors.assessment_id.message}
                      </p>
                    )}
                  </div>

                  <p className="type-body-md text-fg-quaternary">
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

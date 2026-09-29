import { useForm } from "react-hook-form";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { Button } from "@/components/shared/Button";
import { ApiState } from "@/components/shared/ApiState";
import { useGenerateReport, useImpactAssessments } from "@/hooks/useApiQueries";
import { useApp } from "@/context/AppContext";

/**
 * Generate an impact report, POST /api/v1/reports/generate.
 *
 * ImpactReportCreate takes an impact_assessment_id and an optional title --
 * nothing else. The assessment is chosen from the ones this organization
 * actually has rather than typed as a free-text id, so the request cannot name
 * an assessment that does not exist.
 *
 * Field styling follows the sign-in form, which is where this app's inputs are
 * already defined; there is no Input component in the design system.
 */

const FIELD =
  "type-body-lg h-9 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary placeholder:text-fg-quaternary transition-colors duration-150 hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

interface GenerateFields {
  impact_assessment_id: string;
  title: string;
}

export function ReportGenerateScreen() {
  const { showToast, navigateTo, openRecord } = useApp();
  const assessmentsQuery = useImpactAssessments();
  const generateReport = useGenerateReport();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GenerateFields>({
    defaultValues: { impact_assessment_id: "", title: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const report = await generateReport.mutateAsync({
        impact_assessment_id: data.impact_assessment_id,
        // An empty box means "let the backend title it", not an empty title.
        title: data.title.trim() || undefined,
      });
      showToast("Report generated.", "success");
      openRecord("api-report-detail", report.id);
    } catch {
      showToast("Could not generate the report.", "error");
    }
  });

  return (
    <>
      <PageHeader
        title="Generate Report"
        description="Produce an impact delta report from a completed assessment."
        breadcrumb={[
          { label: "Reports", onClick: () => navigateTo("api-reports") },
          { label: "Generate" },
        ]}
        onBack={() => navigateTo("api-reports")}
      />
      <PageBody>
        <ApiState
          query={assessmentsQuery}
          emptyTitle="No assessments to report on"
          emptyDetail="Run an impact analysis first; a report is generated from an existing assessment."
          skeletonCols={2}
        >
          {(assessments) => (
            <form
              onSubmit={onSubmit}
              className="max-w-xl space-y-5 rounded-lg border border-stroke-default bg-container p-5"
            >
              <div className="space-y-1.5">
                <label className="type-label-sm text-fg-quaternary" htmlFor="impact_assessment_id">
                  Impact assessment
                </label>
                <select
                  id="impact_assessment_id"
                  className={FIELD}
                  aria-invalid={Boolean(errors.impact_assessment_id)}
                  {...register("impact_assessment_id", {
                    required: "Choose the assessment to report on.",
                  })}
                >
                  <option value="">Select an assessment…</option>
                  {assessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.id.slice(0, 8)} · {assessment.overall_impact_level} ·{" "}
                      {assessment.status}
                    </option>
                  ))}
                </select>
                {errors.impact_assessment_id && (
                  <p className="type-body-md text-error">{errors.impact_assessment_id.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="type-label-sm text-fg-quaternary" htmlFor="title">
                  Title <span className="text-fg-quaternary">(optional)</span>
                </label>
                <input
                  id="title"
                  className={FIELD}
                  placeholder="Defaults to the assessment's own title"
                  {...register("title", {
                    maxLength: { value: 200, message: "Maximum 200 characters." },
                  })}
                />
                {errors.title && <p className="type-body-md text-error">{errors.title.message}</p>}
              </div>

              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Generating…" : "Generate report"}
              </Button>
            </form>
          )}
        </ApiState>
      </PageBody>
    </>
  );
}

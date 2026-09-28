import { PageBody, PageHeader } from "@/components/shared/Page";
import { Button } from "@/components/shared/Button";
import { Form, FormControl, FormLabel, FormMessage, FormDescription, useForm } from "@/components/shared/Form";
import { useAnalyzeImpact, useReanalyzeImpact } from "@/hooks/useApiQueries";
import { useApp } from "@/context/AppContext";

/** Impact analysis screen for analyzing or reanalyzing regulatory changes */
export function ImpactAnalysisScreen() {
  const analyzeImpact = useAnalyzeImpact();
  const reanalyzeImpact = useReanalyzeImpact();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = React.useState<string>("analyze");
  const [regulatoryChangeId, setRegulatoryChangeId] = React.useState<string>("");

  const {
    register: registerAnalyze,
    handleSubmit: handleSubmitAnalyze,
    formState: { errors: errorsAnalyze, isSubmitting: isSubmittingAnalyze, isSuccess: isSuccessAnalyze },
  } = useForm<{
    regulatory_change_id: string;
  }>();

  const {
    register: registerReanalyze,
    handleSubmit: handleSubmitReanalyze,
    formState: { errors: errorsReanalyze, isSubmitting: isSubmittingReanalyze, isSuccess: isSuccessReanalyze },
  } = useForm<{
    assessment_id: string;
  }>();

  const onSubmitAnalyze = handleSubmitAnalyze(async (data) => {
    try {
      await analyzeImpact.mutateAsync({
        regulatory_change_id: data.regulatory_change_id,
      });
      showToast("Impact analysis started.", "success");
      setRegulatoryChangeId(""); // Reset form
    } catch (error) {
      showToast("Failed to start impact analysis.", "error");
    }
  });

  const onSubmitReanalyze = handleSubmitReanalyze(async (data) => {
    try {
      await reanalyzeImpact.mutateAsync({
        assessment_id: data.assessment_id,
      });
      showToast("Impact re-analysis started.", "success");
    } catch (error) {
      showToast("Failed to start impact re-analysis.", "error");
    }
  });

  return (
    <>
      <PageHeader
        title="Impact Analysis"
        description="Analyze or reanalyze regulatory changes impact"
        breadcrumb={[
          { label: "Impact", onClick: () => {/* navigate to impact */} },
          { label: "Analysis" },
        ]}
        onBack={() => {/* navigate to impact */}}
      />
      <PageBody>
        <Tabs defaultValue="analyze" onValueChange={setActiveTab}>
          <TabList>
            <Tab value="analyze">Analyze New Change</Tab>
            <Tab value="reanalyze">Reanalyze Existing</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="analyze">
              <Form onSubmit={onSubmitAnalyze} resettable defaultValues={{ regulatory_change_id: "" }}>
                <FormLabel htmlFor="regulatoryChangeId">Regulatory Change ID</FormLabel>
                <FormControl
                  id="regulatoryChangeId"
                  placeholder="Enter regulatory change ID to analyze"
                  {...registerAnalyze("regulatory_change_id", {
                    required: "Regulatory change ID is required",
                    pattern: {
                      value: /^[a-zA-Z0-9\-_]+$/,
                      message: "Enter a valid ID (letters, numbers, hyphens, underscores only)",
                    },
                  })}
                />
                {errorsAnalyze.regulatory_change_id && <FormMessage>{errorsAnalyze.regulatory_change_id.message}</FormMessage>}

                <FormDescription>
                  Start a new impact analysis for a regulatory change. This will assess how the change impacts
                  your products, markets, and processes. The analysis may take some time to complete.
                </FormDescription>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmittingAnalyze}
                  className="w-full"
                >
                  {isSubmittingAnalyze ? "Analyzing..." : "Start Analysis"}
                </Button>
              </Form>

              {isSuccessAnalyze && (
                <div className="mt-6 p-4 bg-success-bg rounded-lg border border-success-border">
                  <h3 className="type-heading-sm text-success-icon">Analysis Started</h3>
                  <p className="type-body-sm text-fg-tertiary">
                    Your impact analysis has been started. Check the assessments list for updates.
                  </p>
                </div>
              )}
            </TabPanel>
            <TabPanel value="reanalyze">
              <Form onSubmit={onSubmitReanalyze} resettable defaultValues={{ assessment_id: "" }}>
                <FormLabel htmlFor="assessmentId">Assessment ID</FormLabel>
                <FormControl
                  id="assessmentId"
                  placeholder="Enter assessment ID to reanalyze"
                  {...registerReanalyze("assessment_id", {
                    required: "Assessment ID is required",
                    pattern: {
                      value: /^[a-zA-Z0-9\-_]+$/,
                      message: "Enter a valid ID (letters, numbers, hyphens, underscores only)",
                    },
                  })}
                />
                {errorsReanalyze.assessment_id && <FormMessage>{errorsReanalyze.assessment_id.message}</FormMessage>}

                <FormDescription>
                  Re-run impact analysis on an existing assessment. This is useful when regulatory change
                  details have been updated or when you want to refresh the analysis with the latest data.
                </FormDescription>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmittingReanalyze}
                  className="w-full"
                >
                  {isSubmittingReanalyze ? "Re-analyzing..." : "Start Re-analysis"}
                </Button>
              </Form>

              {isSuccessReanalyze && (
                <div className="mt-6 p-4 bg-success-bg rounded-lg border border-success-border">
                  <h3 className="type-heading-sm text-success-icon">Re-analysis Started</h3>
                  <p className="type-body-sm text-fg-tertiary">
                    Your impact re-analysis has been started. Check the assessment details for updates.
                  </p>
                </div>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </PageBody>
    </>
  );
}
import { PageBody, PageHeader } from "@/components/shared/Page";
import { Button } from "@/components/shared/Button";
import { Form, FormControl, FormLabel, FormMessage, FormDescription, useForm } from "@/components/shared/Form";
import { useGenerateReport } from "@/hooks/useApiQueries";
import { useApp } from "@/context/AppContext";

/** Report generation screen */
export function ReportGenerateScreen() {
  const generateReport = useGenerateReport();
  const { showToast } = useApp();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSuccess },
  } = useForm<{
    title: string;
    description?: string;
  }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await generateReport.mutateAsync({
        title: data.title,
        description: data.description || undefined,
      });
      showToast("Report generation started.", "success");
    } catch (error) {
      showToast("Failed to start report generation.", "error");
    }
  });

  return (
    <>
      <PageHeader
        title="Generate Report"
        description="Create a new impact report"
        breadcrumb={[
          { label: "Reports", onClick: () => /* navigate to reports list */ },
          { label: "Generate Report" },
        ]}
        onBack={() => /* navigate to reports list */}
      />
      <PageBody>
        <Form onSubmit={onSubmit} resettable defaultValues={{ title: "", description: "" }}>
          <FormLabel htmlFor="title">Report Title</FormLabel>
          <FormControl
            id="title"
            placeholder="Enter report title"
            {...register("title", {
              required: "Title is required",
              maxLength: { value: 200, message: "Maximum 200 characters" },
            })}
          />
          {errors.title && <FormMessage>{errors.title.message}</FormMessage>}

          <FormLabel htmlFor="description">Description (Optional)</FormLabel>
          <FormControl
            id="description"
            as="textarea"
            rows={4}
            placeholder="Enter report description"
            {...register("description", {
              maxLength: { value: 1000, message: "Maximum 1000 characters" },
            })}
          />
          {errors.description && <FormMessage>{errors.description.message}</FormMessage>}

          <FormDescription>
            Generating a report may take some time depending on the amount of data
            and complexity of the analysis. You will be notified when the report
            is ready for viewing.
          </FormDescription>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Generating..." : "Generate Report"}
          </Button>
        </Form>

        {isSuccess && (
          <div className="mt-6 p-4 bg-success-bg rounded-lg border border-success-border">
            <h3 className="type-heading-sm text-success-icon">Report Generation Started</h3>
            <p className="type-body-sm text-fg-tertiary">
              Your report is being generated. Check the reports list for updates.
            </p>
          </div>
        )}
      </PageBody>
    </>
  );
}
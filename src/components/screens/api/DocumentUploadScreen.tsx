import { PageBody, PageHeader } from "@/components/shared/Page";
import { Button } from "@/components/shared/Button";
import { Form, FormControl, FormLabel, FormMessage, FormDescription, useForm } from "@/components/shared/Form";
import { useUploadDocument } from "@/hooks/useApiQueries";
import { useApp } from "@/context/AppContext";
import * as React from "react";

/** Document upload screen */
export function DocumentUploadScreen() {
  const uploadDocument = useUploadDocument();
  const { showToast } = useApp();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSuccess },
  } = useForm<{
    title: string;
    documentType: string;
  }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!selectedFile) {
        showToast("Please select a file to upload.", "error");
        return;
      }

      await uploadDocument.mutateAsync({
        file: selectedFile,
        fields: {
          title: data.title,
          documentType: data.documentType,
        },
      });
      showToast("Document uploaded successfully.", "success");
      setSelectedFile(null); // Reset file selection
    } catch (error) {
      showToast("Failed to upload document.", "error");
    }
  });

  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Upload a regulatory document for processing"
        breadcrumb={[
          { label: "Regulatory", onClick: () => {/* navigate to regulatory */} },
          { label: "Documents", onClick: () => {/* navigate to documents list */} },
          { label: "Upload Document" },
        ]}
        onBack={() => {/* navigate to documents list */}}
      />
      <PageBody>
        <Form onSubmit={onSubmit} resettable defaultValues={{ title: "", documentType: "" }}>
          <FormLabel htmlFor="title">Document Title</FormLabel>
          <FormControl
            id="title"
            placeholder="Enter document title"
            {...register("title", {
              required: "Title is required",
              maxLength: { value: 200, message: "Maximum 200 characters" },
            })}
          />
          {errors.title && <FormMessage>{errors.title.message}</FormMessage>}

          <FormLabel htmlFor="documentType">Document Type</FormLabel>
          <FormControl
            id="documentType"
            placeholder="Enter document type (e.g., REGULATORY_GUIDANCE, PRODUCT_LICENSE)"
            {...register("documentType", {
              required: "Document type is required",
              maxLength: { value: 100, message: "Maximum 100 characters" },
            })}
          />
          {errors.documentType && <FormMessage>{errors.documentType.message}</FormMessage>}

          <FormDescription>
            Select a regulatory document file to upload. Supported formats include PDF, DOC, DOCX, and image files.
            The document will be processed automatically after upload to extract relevant regulatory information.
          </FormDescription>

          <div className="mb-4">
            <label className="form-label" htmlFor="documentFile">
              Document File
            </label>
            <div className="form-control">
              <input
                type="file"
                id="documentFile"
                className="input input-bordered w-full"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  } else {
                    setSelectedFile(null);
                  }
                }}
              />
              {selectedFile && (
                <p className="form-help-text text-fg-primary">
                  Selected: {selectedFile.name}
                </p>
              )}
              <p className="form-help-text">
                Maximum file size: 50MB
              </p>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !selectedFile}
            className="w-full"
          >
            {isSubmitting ? "Uploading..." : "Upload Document"}
          </Button>
        </Form>

        {isSuccess && (
          <div className="mt-6 p-4 bg-success-bg rounded-lg border border-success-border">
            <h3 className="type-heading-sm text-success-icon">Document Uploaded</h3>
            <p className="type-body-sm text-fg-tertiary">
              Your document has been uploaded and is being processed. Check the documents list for updates.
            </p>
          </div>
        )}
      </PageBody>
    </>
  );
}
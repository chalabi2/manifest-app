import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ProposalFormData, ProposalAction } from "@/helpers/formReducer";
import { TextInput, TextArea } from "@/components/react/inputs";

const ProposalSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .max(50, "Title must not exceed 50 characters"),
  authors: Yup.string()
    .required("Authors are required")
    .max(200, "Authors must not exceed 200 characters"),
  summary: Yup.string()
    .required("Summary is required")
    .min(10, "Summary must be at least 10 characters")
    .max(500, "Summary must not exceed 500 characters"),
  details: Yup.string()
    .required("Details are required")
    .min(10, "Details must be at least 10 characters")
    .max(500, "Summary must not exceed 500 characters"),
});

export default function ProposalMetadataForm({
  nextStep,
  prevStep,
  formData,
  dispatch,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: ProposalFormData;
  dispatch: React.Dispatch<ProposalAction>;
}>) {
  const handleChange = (
    field: keyof ProposalFormData["metadata"],
    value: any,
  ) => {
    dispatch({
      type: "UPDATE_FIELD",
      field: "metadata",
      value: {
        ...formData.metadata,
        [field]: value,
      },
    });
  };

  return (
    <section className="">
      <div className="lg:flex  mx-auto">
        <div className="flex items-center mx-auto md:w-[42rem] px-4 md:px-8 xl:px-0">
          <div className="w-full">
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:mb-6 leading-tight">
              Proposal Metadata
            </h1>
            <Formik
              initialValues={formData.metadata}
              validationSchema={ProposalSchema}
              onSubmit={nextStep}
              validateOnChange={true}
            >
              {({ isValid, dirty, setFieldValue }) => (
                <Form className="min-h-[330px]">
                  <div className="grid gap-5 my-6 sm:grid-cols-2">
                    <TextInput
                      label="Title"
                      name="title"
                      placeholder="Type here"
                      value={formData.metadata.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange("title", e.target.value);
                        setFieldValue("title", e.target.value);
                      }}
                    />
                    <TextInput
                      label="Authors"
                      name="authors"
                      placeholder="Type here"
                      value={formData.metadata.authors}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange("authors", e.target.value);
                        setFieldValue("authors", e.target.value);
                      }}
                    />
                    <TextArea
                      label="Summary"
                      name="summary"
                      placeholder="Short Description"
                      value={formData.metadata.summary}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handleChange("summary", e.target.value);
                        setFieldValue("summary", e.target.value);
                      }}
                    />
                    <TextArea
                      label="Details"
                      name="details"
                      placeholder="Long Description"
                      value={formData.metadata.details}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handleChange("details", e.target.value);
                        setFieldValue("details", e.target.value);
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 btn btn-primary"
                    disabled={!isValid || !dirty}
                  >
                    Next: Confirmation
                  </button>
                </Form>
              )}
            </Formik>
            <div className="flex space-x-3 ga-4 mt-6">
              <button
                onClick={prevStep}
                className="text-center items-center w-1/2 py-2.5 sm:py-3.5 btn btn-neutral"
              >
                <span className="hidden sm:inline">Prev: Messages</span>
                <span className="sm:hidden"> Prev: TXs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

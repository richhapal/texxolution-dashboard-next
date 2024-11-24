"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusIcon, MinusIcon, InfoIcon, XIcon } from "lucide-react";
import TinyMceTextEditor from "./tinyMceEditor";
import jobCategory from "@/_lib/utils/utils";
import {
  useAddNewPostMutation,
  useGetJobDetailsQuery,
  useUpdateJobPostMutation,
} from "@/_lib/rtkQuery/listRtkQuery";
import { Bounce, toast } from "react-toastify";
import { Button } from "@nextui-org/react";

const formSchema = z.object({
  jobCategory: z.string().min(1, "Job category is required"),
  postName: z.string().min(1, "Post name is required"),
  title: z.string().min(1, "Title is required"),
  qualifications: z.string().min(1, "Qualifications are required"),
  importantLinks: z.array(
    z.object({
      displayText: z.string().min(1, "Display text is required"),
      type: z.string().min(1, "Type is required"),
      value: z.string().url("Must be a valid URL"),
      text: z.string().min(1, "Text is required"),
    })
  ),
  applicationFeeDetails: z
    .string()
    .min(1, "Application fee details are required"),
  vacancyDetails: z.string().min(1, "Vacancy details are required"),
  metaTags: z.array(z.string()),
  jobPublish: z.string().min(1, "Publication status is required"),
  isVacancyOver: z.string().min(1, "Vacancy status is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function JobForm({
  jobCategoryName,
  postNameSlug,
  jobFormTitle,
}: {
  jobCategoryName?: string;
  postNameSlug?: string;
  jobFormTitle: string;
}) {
  const [metaTagInput, setMetaTagInput] = useState("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  }: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      importantLinks: [{ displayText: "", type: "", value: "", text: "" }],
      metaTags: [],
    },
  });
  const [
    addNewPost,
    { isLoading: isAddLoading, error: addError, data: addData },
  ] = useAddNewPostMutation();
  const [
    updateJob,
    { isLoading: isUpdateLoading, error: updateError, data: updateData },
  ] = useUpdateJobPostMutation();
  const {
    data: jobData,
    isLoading: isJobLoading,
    error: jobError,
  } = useGetJobDetailsQuery(
    {
      postName: postNameSlug as string,
      jobCategory: jobCategoryName as string,
    },
    { skip: !postNameSlug && !jobCategoryName }
  );

  useEffect(() => {
    if (jobData) {
      reset(jobData);
    }
  }, [jobData, reset]);

  useEffect(() => {
    if (addData || updateData) {
      toast.success(
        jobCategory && postNameSlug ? "Job Updated" : "Job Created",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        }
      );
    }
    if (addError || updateError || jobError) {
      const error = addError || updateError || jobError;
      toast.error(error?.data?.message || "An error occurred", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  }, [addError, updateError, jobError, addData, updateData]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (postNameSlug && jobCategoryName) {
        await updateJob({
          jobCategory: data.jobCategory,
          postName: data.postName,
          body: data,
        }).unwrap();
      } else {
        await addNewPost({
          jobCategory: data.jobCategory,
          postName: data.postName,
          body: data,
        }).unwrap();
      }
    } catch (error: any) {
      console.error("Error submitting job:", error?.data?.message);
    }
  };

  const addMetaTag = (tag: string) => {
    const currentTags = watch("metaTags");
    setValue("metaTags", [...currentTags, tag]);
    setMetaTagInput("");
  };

  const removeMetaTag = (index: number) => {
    const currentTags = watch("metaTags");
    setValue(
      "metaTags",
      currentTags.filter((_, i) => i !== index)
    );
  };

  const isLoading = isAddLoading || isUpdateLoading || isJobLoading;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{jobFormTitle}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="jobCategory"
            className="block text-sm font-medium text-gray-700"
          >
            Job Category <span className="text-red-500">*</span>
          </label>
          <select
            disabled={isLoading}
            id="jobCategory"
            {...register("jobCategory")}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Job Category</option>
            {jobCategory.map((data: any) => {
              return (
                <option key={data.key} value={data.key}>
                  {data.label}
                </option>
              );
            })}
          </select>
          {errors.jobCategory && (
            <p className="mt-2 text-sm text-red-600">
              {errors.jobCategory.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="postName"
            className="block text-sm font-medium text-gray-700"
          >
            Post Name <span className="text-red-500">*</span>
          </label>
          <input
            disabled={isLoading}
            type="text"
            id="postName"
            {...register("postName")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="RRB Railway NTPC"
          />
          {errors.postName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.postName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            disabled={isLoading}
            type="text"
            id="title"
            {...register("title")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="RRB Railway NTPC Admit Card Release"
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <Controller
          name="qualifications"
          control={control}
          disabled={isLoading}
          render={({ field }) => (
            <TinyMceTextEditor
              label="Qualifications"
              onChange={field.onChange}
              initialValue={field.value}
              required
              error={errors.qualifications?.message ?? ""}
            />
          )}
        />

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Important Notification <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <InfoIcon className="h-5 w-5 text-gray-400" />
              <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 right-0 bottom-full mb-2 w-48">
                Add important links and notifications related to the job posting
              </div>
            </div>
          </div>
          <Controller
            disabled={isLoading}
            name="importantLinks"
            control={control}
            render={({ field }) => (
              <div className="space-y-4 mt-2">
                {field.value.map((_, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4">
                    <input
                      type="text"
                      {...register(`importantLinks.${index}.displayText`)}
                      placeholder="Display Text"
                      className="col-span-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      {...register(`importantLinks.${index}.type`)}
                      placeholder="Type"
                      className="col-span-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      {...register(`importantLinks.${index}.value`)}
                      placeholder="Enter Value"
                      className="col-span-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="col-span-1 flex items-center space-x-2">
                      <input
                        type="text"
                        {...register(`importantLinks.${index}.text`)}
                        placeholder="Text"
                        className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      {index === 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            field.onChange([
                              ...field.value,
                              {
                                displayText: "",
                                type: "",
                                value: "",
                                text: "",
                              },
                            ])
                          }
                          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PlusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            field.onChange(
                              field.value.filter((_, i) => i !== index)
                            )
                          }
                          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <MinusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>

        <Controller
          disabled={isLoading}
          name="applicationFeeDetails"
          control={control}
          render={({ field }) => (
            <TinyMceTextEditor
              label="Application Fee Details"
              onChange={field.onChange}
              initialValue={field.value}
              required
              error={errors.applicationFeeDetails?.message ?? ""}
            />
          )}
        />

        <Controller
          disabled={isLoading}
          name="vacancyDetails"
          control={control}
          render={({ field }) => (
            <TinyMceTextEditor
              label="Vacancy Details"
              onChange={field.onChange}
              initialValue={field.value}
              required
              error={errors.vacancyDetails?.message ?? ""}
            />
          )}
        />

        <div>
          <label
            htmlFor="metaTags"
            className="block text-sm font-medium text-gray-700"
          >
            Meta Tags (SEO)
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              disabled={isLoading}
              type="text"
              value={metaTagInput}
              onChange={(e) => setMetaTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && metaTagInput) {
                  e.preventDefault();
                  addMetaTag(metaTagInput);
                }
              }}
              className="flex-1 min-w-0 block w-full px-3 py-2 border rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
              placeholder="Enter tags..."
            />
            <button
              disabled={isLoading}
              type="button"
              onClick={() => addMetaTag(metaTagInput)}
              className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {watch("metaTags").map((tag, index) => (
              <span
                key={index}
                className="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-indigo-100 text-indigo-700"
              >
                {tag}
                <button
                  disabled={isLoading}
                  type="button"
                  onClick={() => removeMetaTag(index)}
                  className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <span className="sr-only">Remove tag</span>
                  <XIcon className="h-2 w-2" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="jobPublish"
            className="block text-sm font-medium text-gray-700"
          >
            Job Publish <span className="text-red-500">*</span>
          </label>
          <select
            disabled={isLoading}
            id="jobPublish"
            {...register("jobPublish")}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select publish status</option>
            <option value="listed">Listed</option>
            <option value="unlisted">Unlisted</option>
          </select>
          {errors.jobPublish && (
            <p className="mt-2 text-sm text-red-600">
              {errors.jobPublish.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="isVacancyOver"
            className="block text-sm font-medium text-gray-700"
          >
            Is Vacancy Over <span className="text-red-500">*</span>
          </label>
          <select
            disabled={isLoading}
            id="isVacancyOver"
            {...register("isVacancyOver")}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select vacancy status</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
          {errors.isVacancyOver && (
            <p className="mt-2 text-sm text-red-600">
              {errors.isVacancyOver.message}
            </p>
          )}
        </div>

        <div>
          <Button
            isLoading={isLoading}
            disabled={isLoading}
            type="submit"
            className="w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

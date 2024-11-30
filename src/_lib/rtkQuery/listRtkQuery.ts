// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { url } from "inspector";
import { CategoryListData, ListData } from "../utils/utils";
import build from "next/dist/build";
// import type { Pokemon } from "./types";

type QueryArgType = {
  jobCategory: string;
  pageNo: number;
  pageSize?: number;
};

type CategoryListArgs = {
  pageNo: number;
  pageSize?: number;
};

type addEditPostQueryArgType = {
  jobCategory: string;
  postName: string;
  body: any;
};

type getJobDetailsQueryArgType = {
  jobCategory: string;
  postName: string;
};

// Define a service using a base URL and expected endpoints
export const listApi = createApi({
  reducerPath: "listApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_DASHBOARD_URL,
  }),
  tagTypes: ["category-list"],
  endpoints: (builder) => ({
    addNewPost: builder.mutation<any, addEditPostQueryArgType>({
      query: (arg: addEditPostQueryArgType) => {
        console.log("arg", arg);
        return {
          url: `/add-new-job`,
          method: "POST", // Specify HTTP method
          params: {
            jobCategory: arg.jobCategory,
            postName: arg.postName,
          }, // Query parameters
          body: arg.body,
        };
      },
    }),
    updateJobPost: builder.mutation<any, addEditPostQueryArgType>({
      query: (arg: addEditPostQueryArgType) => {
        console.log("arg", arg);
        return {
          url: `/update-job`,
          method: "PUT", // Specify HTTP method
          params: {
            jobCategory: arg.jobCategory,
            postName: arg.postName,
          }, // Query parameters
          body: arg.body,
        };
      },
    }),
    getJobDetails: builder.query<ListData, getJobDetailsQueryArgType>({
      query: (arg: getJobDetailsQueryArgType) => {
        return {
          url: `/get-job-details`,
          params: { jobCategory: arg.jobCategory, postName: arg.postName },
        };
      },
    }),
    getAllListByCategory: builder.query<ListData, QueryArgType>({
      query: (arg: QueryArgType) => {
        return {
          url: `/get-job-list`,
          params: { jobCategory: arg.jobCategory, pageNo: arg.pageNo },
        };
      },
    }),
    getAllCategoryList: builder.query<CategoryListData, CategoryListArgs>({
      query: (arg: CategoryListArgs) => {
        return {
          url: `/get-category-list`,
          params: { pageNo: arg.pageNo, pageSize: arg.pageSize || 10 },
        };
      },
      providesTags: [`category-list`],
    }),
    AddNewCategory: builder.mutation<any, any>({
      query: (arg: any) => {
        console.log("arg", arg);
        return {
          url: `/add-category-list`,
          method: "POST", // Specify HTTP method
          body: arg?.body ?? {},
        };
      },
      invalidatesTags: [`category-list`],
    }),
    getAllJobCategoryTypeList: builder.query<any, any>({
      query: () => {
        return {
          url: "/get-category-list",
          params: { pageNo: 1, pageSize: 100 },
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetAllListByCategoryQuery,
  useAddNewPostMutation,
  useUpdateJobPostMutation,
  useGetJobDetailsQuery,
  useGetAllCategoryListQuery,
  useAddNewCategoryMutation,
  useGetAllJobCategoryTypeListQuery,
} = listApi;

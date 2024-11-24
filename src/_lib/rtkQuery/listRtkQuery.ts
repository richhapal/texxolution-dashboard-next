// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { url } from "inspector";
import { ListData } from "../utils/utils";
// import type { Pokemon } from "./types";

type QueryArgType = {
  jobCategory: string;
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
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetAllListByCategoryQuery,
  useAddNewPostMutation,
  useUpdateJobPostMutation,
  useGetJobDetailsQuery,
} = listApi;

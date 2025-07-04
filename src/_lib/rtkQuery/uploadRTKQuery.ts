import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Upload API base path
const UPLOAD_BASE = "/v2/upload";

const customFetchBaseQuery = fetchBaseQuery({
  baseUrl:
    process.env.NEXT_PUBLIC_BACKEND_DASHBOARD_URL ||
    "http://localhost:3001/api",
  credentials: "include",
  prepareHeaders: (headers) => {
    // Read token from cookies for authorization
    const match =
      typeof window !== "undefined" &&
      document.cookie.match(/(^| )token=([^;]+)/);
    const token = match ? match[2] : null;
    if (token) {
      headers.set("Authorization", `${token}`);
    }
    return headers;
  },
});

// Types
export type UploadPath = "products" | "homepage" | "utils";

export interface ImageFile {
  fileName: string;
  fullPath: string;
  url: string;
  size: number;
  lastModified: string;
}

export interface UploadSingleRequest {
  file: File;
  uploadPath: UploadPath;
}

export interface UploadSingleResponse {
  success?: boolean;
  imageUrl?: string;
  fileName?: string;
  fullPath?: string;
  size?: number;
  message?: string;
  uploadPath?: string;
}

export interface UploadMultipleRequest {
  files: File[];
  uploadPath: UploadPath;
}

export interface UploadMultipleResponse {
  success: boolean;
  urls?: string[];
  files?: Array<{
    fileName: string;
    fullPath: string;
    url: string;
    size: number;
  }>;
  message?: string;
}

export interface DeleteImageRequest {
  imageUrl: string;
}

export interface DeleteMultipleRequest {
  imageUrls: string[];
}

export interface ListImagesResponse {
  message: string;
  environment: string;
  data: {
    products: ImageFile[];
    homepage: ImageFile[];
    utils: ImageFile[];
  };
  summary: {
    products: number;
    homepage: number;
    utils: number;
    total: number;
  };
}

export interface AllowedPathsResponse {
  allowedPaths: UploadPath[];
  currentEnvironment: string;
}

// Upload API
export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: customFetchBaseQuery,
  tagTypes: ["Image", "ImageList", "UploadPaths"],
  endpoints: (builder) => ({
    // Upload single image
    uploadSingle: builder.mutation<UploadSingleResponse, UploadSingleRequest>({
      query: ({ file, uploadPath }) => {
        const formData = new FormData();
        formData.append("image", file);

        return {
          url: `${UPLOAD_BASE}/single?uploadPath=${uploadPath}`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: any) => {
        // Transform the backend response to match our expected format
        const transformedResponse: UploadSingleResponse = {
          success: !!response.message, // Consider it successful if there's a message
          imageUrl: response.imageUrl
            ? response.imageUrl.startsWith("http")
              ? response.imageUrl
              : `https://${response.imageUrl}`
            : undefined,
          fileName: response.fileName,
          message: response.message,
          uploadPath: response.uploadPath,
        };
        return transformedResponse;
      },
      invalidatesTags: ["ImageList"],
    }),

    // Upload multiple images
    uploadMultiple: builder.mutation<
      UploadMultipleResponse,
      UploadMultipleRequest
    >({
      query: ({ files, uploadPath }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("images", file);
        });

        return {
          url: `${UPLOAD_BASE}/multiple?uploadPath=${uploadPath}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ImageList"],
    }),

    // List all images
    listImages: builder.query<ListImagesResponse, void>({
      query: () => `${UPLOAD_BASE}/list`,
      providesTags: ["ImageList"],
    }),

    // Delete single image
    deleteImage: builder.mutation<
      { success: boolean; message?: string },
      DeleteImageRequest
    >({
      query: ({ imageUrl }) => ({
        url: `${UPLOAD_BASE}/delete`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
        }),
      }),
      invalidatesTags: ["ImageList"],
    }),

    // Delete multiple images
    deleteMultipleImages: builder.mutation<
      { success: boolean; message?: string },
      DeleteMultipleRequest
    >({
      query: ({ imageUrls }) => ({
        url: `${UPLOAD_BASE}/delete-multiple`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrls,
        }),
      }),
      invalidatesTags: ["ImageList"],
    }),

    // Get allowed upload paths
    getAllowedPaths: builder.query<AllowedPathsResponse, void>({
      query: () => `${UPLOAD_BASE}/paths`,
      providesTags: ["UploadPaths"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useUploadSingleMutation,
  useUploadMultipleMutation,
  useListImagesQuery,
  useDeleteImageMutation,
  useDeleteMultipleImagesMutation,
  useGetAllowedPathsQuery,
} = uploadApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Admin Auth API base path
const ADMIN_AUTH_BASE = "/v2/adminAuth";

const customFetchBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_DASHBOARD_URL,
  credentials: "include", // This will include cookies in requests
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
export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  isLoggedIn?: boolean;
  message?: string;
  tokens?: {
    token: string;
    expires: string; // ISO date string
  };
  loginAdmin?: {
    id: string;
    email: string;
    name?: string;
    userType: string;
    permissions?: any[];
  };
};

export type RegisterRequest = { email: string; password: string; name: string };
export type RegisterResponse = {
  isLoggedIn?: boolean;
  message?: string;
  newAdmin?: {
    _id: string;
    name: string;
    email: string;
    userType: string;
    permissions: any[];
    createdAt: string;
    updatedAt: string;
  };
  tokens?: {
    token: string;
    expires: string;
  };
};

export type ProfileResponse = { profile: any };

export type UpdatePermissionsRequest = {
  userId: string;
  permissions: any;
};
export type UpdatePermissionsResponse = { message: string };

export type PermissionsListResponse = {
  message: string;
  endpointsByCategory: any;
  flatEndpoints: any[];
  totalEndpoints: number;
  summary: any;
};

// API
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: customFetchBaseQuery,
  endpoints: (builder) => ({
    // Admin signup
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: `${ADMIN_AUTH_BASE}/signup`,
        method: "POST",
        body: data,
      }),
    }),
    // Admin signin
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: `${ADMIN_AUTH_BASE}/signin`,
        method: "POST",
        body: credentials,
      }),
    }),
    // Get admin profile
    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: `${ADMIN_AUTH_BASE}/getProfile`,
        method: "GET",
      }),
    }),
    // Update permissions (superadmin only)
    updatePermissions: builder.mutation<
      UpdatePermissionsResponse,
      UpdatePermissionsRequest
    >({
      query: (data) => ({
        url: `${ADMIN_AUTH_BASE}/permissions`,
        method: "PUT",
        body: data,
      }),
    }),
    // Get permissions list (superadmin only)
    getPermissionsList: builder.query<PermissionsListResponse, void>({
      query: () => ({
        url: `${ADMIN_AUTH_BASE}/permissionsList`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdatePermissionsMutation,
  useGetPermissionsListQuery,
} = authApi;

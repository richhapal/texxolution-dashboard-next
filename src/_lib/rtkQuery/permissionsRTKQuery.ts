import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types for permissions
export interface Permission {
  path: string;
  methods: string[];
}

export interface PermissionWithCategory extends Permission {
  category: string;
  showText: string;
}

export interface PermissionCategory {
  showText: string;
  endpoints: Permission[];
}

export interface PermissionsResponse {
  message: string;
  endpointsByCategory: Record<string, PermissionCategory>;
  flatEndpoints: PermissionWithCategory[];
  totalEndpoints: number;
  summary: Record<string, number>;
}

export interface AdminUser {
  data: {
    _id: string;
    name: string;
    email: string;
    userType: "admin" | "superadmin";
    permissions: Permission[];
    assignRoles: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdatePermissionsPayload {
  adminId: string;
  permissions: Permission[];
}

const baseQuery = fetchBaseQuery({
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

export const permissionsApi = createApi({
  reducerPath: "permissionsApi",
  baseQuery,
  tagTypes: ["Permissions", "AdminUser"],
  endpoints: (builder) => ({
    // Get all available permissions
    getPermissionsList: builder.query<PermissionsResponse, void>({
      query: () => "/v2/adminAuth/permissionsList",
      providesTags: ["Permissions"],
    }),

    // Get admin user profile by ID
    getAdminUserProfile: builder.query<AdminUser, string>({
      query: (id) => `/v2/adminUsers/${id}`,
      providesTags: (result, error, id) => [{ type: "AdminUser", id }],
    }),

    // Update admin user permissions
    updateAdminPermissions: builder.mutation<
      { message: string },
      UpdatePermissionsPayload
    >({
      query: ({ adminId, permissions }) => ({
        url: "/v2/adminAuth/permissions",
        method: "PUT",
        body: { adminId, permissions },
      }),
      invalidatesTags: (result, error, { adminId }) => [
        { type: "AdminUser", id: adminId },
      ],
    }),

    // Revoke all permissions from admin user
    revokeAdminPermissions: builder.mutation<
      { message: string },
      { adminId: string }
    >({
      query: ({ adminId }) => ({
        url: "/v2/adminAuth/permissions",
        method: "PUT",
        body: { adminId, permissions: [] },
      }),
      invalidatesTags: (result, error, { adminId }) => [
        { type: "AdminUser", id: adminId },
      ],
    }),
  }),
});

export const {
  useGetPermissionsListQuery,
  useGetAdminUserProfileQuery,
  useUpdateAdminPermissionsMutation,
  useRevokeAdminPermissionsMutation,
} = permissionsApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  userType: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: string | null;
  __v: number;
}

// Admin User interface
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  userType: "admin" | "superadmin";
  assignRoles: string[];
  permissions: {
    path: string;
    methods: string[];
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// User List Response
export interface UserListResponse {
  message: string;
  data: {
    users: User[];
    pagination: Pagination & {
      totalUsers: number;
    };
    summary: {
      totalRegisteredUsers: number;
      userTypeBreakdown: {
        _id: string;
        count: number;
      }[];
      recentRegistrations: {
        _id: {
          year: number;
          month: number;
        };
        count: number;
      }[];
    };
  };
}

// Admin User List Response
export interface AdminUserListResponse {
  message: string;
  data: {
    adminUsers: AdminUser[];
    pagination: Pagination & {
      totalAdminUsers: number;
    };
    summary: {
      totalAdminUsers: number;
      adminTypeBreakdown: {
        _id: string;
        count: number;
      }[];
      recentRegistrations: {
        _id: {
          year: number;
          month: number;
        };
        count: number;
      }[];
    };
  };
}

// Query parameters
export interface UserListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  userType?: string;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  userType?: "admin" | "superadmin";
}

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({
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
  }),
  tagTypes: ["Users", "AdminUsers"],
  endpoints: (builder) => ({
    // Get normal users
    getUsers: builder.query<UserListResponse, UserListParams>({
      query: (params) => ({
        url: "/v2/users/userlist",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.searchTerm && { search: params.searchTerm }),
          ...(params.userType && { userType: params.userType }),
        },
      }),
      providesTags: ["Users"],
    }),

    // Get admin users
    getAdminUsers: builder.query<AdminUserListResponse, AdminUserListParams>({
      query: (params) => ({
        url: "/v2/adminUsers/adminuserlist",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.searchTerm && { search: params.searchTerm }),
          ...(params.userType && { userType: params.userType }),
        },
      }),
      providesTags: ["AdminUsers"],
    }),
  }),
});

export const { useGetUsersQuery, useGetAdminUsersQuery } = customerApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const customFetchBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_DASHBOARD_URL,
  credentials: "include", // This will include cookies in requests
});

// Types
export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string };

export type RegisterRequest = { email: string; password: string; name: string };
export type RegisterResponse = { user: any };

export type ProfileResponse = { user: any };

// API
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: customFetchBaseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = authApi;

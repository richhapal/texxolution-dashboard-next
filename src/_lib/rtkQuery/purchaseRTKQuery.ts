import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

// Custom base query with error handling for 401 Unauthorized
const customBaseQueryWithReauth = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  const result = await customFetchBaseQuery(args, api, extraOptions);

  // Handle 401 unauthorized errors
  if (result.error && result.error.status === 401) {
    // Clear the token cookie
    if (typeof window !== "undefined") {
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    // Redirect to signin page
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
  }

  return result;
};

// Types for Purchase Management
export interface CustomerDetails {
  name: string;
  email: string;
  country: string;
}

export interface PaymentDetails {
  method: string;
  status: string;
}

export interface UserId {
  _id: string;
  name: string;
  email: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
  totalPrice: number;
  thumbnail: string;
  _id: string;
}

export interface StatusHistory {
  status: string;
  updatedBy: string;
  updatedAt: string;
  notes: string;
  _id: string;
  updatedByName: string;
}

export interface Purchase {
  _id: string;
  customerDetails: CustomerDetails;
  paymentDetails: PaymentDetails;
  userId: UserId;
  items: PurchaseItem[];
  totalItems: number;
  totalAmount: number;
  status: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
  purchaseId: string;
  __v: number;
}

export interface PurchasePagination {
  currentPage: number;
  totalPages: number | null;
  totalPurchases: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PurchaseListResponse {
  success: boolean;
  message: string;
  data: {
    purchases: Purchase[];
    pagination: PurchasePagination;
    filters: number;
  };
}

export interface PurchaseAnalyticsSummary {
  _id: null;
  totalPurchases: number;
  totalRevenue: number;
  totalItems: number;
  averageOrderValue: number;
}

export interface StatusBreakdown {
  _id: string;
  count: number;
  revenue: number;
}

export interface DailyStats {
  _id: string;
  purchases: number;
  revenue: number;
}

export interface PurchaseAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    summary: PurchaseAnalyticsSummary;
    statusBreakdown: StatusBreakdown[];
    dailyStats: DailyStats[];
  };
}

export interface PurchaseDetailResponse {
  success: boolean;
  message: string;
  data: Purchase;
}

export interface UpdatePurchaseStatusRequest {
  id: string;
  status: string;
  notes?: string;
  userName: string;
}

export interface UpdatePurchaseNotesRequest {
  id: string;
  notes: string;
}

export interface ResendQuotationRequest {
  id: string;
}

export interface ExportPurchasesRequest {
  format: "csv" | "excel";
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

// API Definition
export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: customBaseQueryWithReauth,
  tagTypes: ["Purchase", "PurchaseAnalytics"],
  endpoints: (builder) => ({
    // Get purchases list with pagination and filters
    getPurchases: builder.query<
      PurchaseListResponse,
      {
        page?: number;
        limit?: number;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        searchTerm?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 10,
        status,
        dateFrom,
        dateTo,
        searchTerm,
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) params.append("status", status);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        if (searchTerm) params.append("search", searchTerm);

        return `/v2/purchases/?${params.toString()}`;
      },
      providesTags: ["Purchase"],
    }),

    // Get purchase analytics
    getPurchaseAnalytics: builder.query<PurchaseAnalyticsResponse, void>({
      query: () => "/v2/purchases/analytics",
      providesTags: ["PurchaseAnalytics"],
    }),

    // Get purchase by ID
    getPurchaseById: builder.query<PurchaseDetailResponse, string>({
      query: (id) => `/v2/purchases/${id}`,
      providesTags: (result, error, id) => [{ type: "Purchase", id }],
    }),

    // Update purchase status
    updatePurchaseStatus: builder.mutation<
      { success: boolean; message: string },
      UpdatePurchaseStatusRequest
    >({
      query: ({ id, status, notes, userName }) => ({
        url: `/v2/purchases/${id}/status`,
        method: "PUT",
        body: { status, notes, userName },
      }),
      invalidatesTags: ["Purchase", "PurchaseAnalytics"],
    }),

    // Update purchase notes
    updatePurchaseNotes: builder.mutation<
      { success: boolean; message: string },
      UpdatePurchaseNotesRequest
    >({
      query: ({ id, notes }) => ({
        url: `/v2/purchases/${id}/notes`,
        method: "PUT",
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Purchase", id }],
    }),

    // Resend quotation
    resendQuotation: builder.mutation<
      { success: boolean; message: string },
      ResendQuotationRequest
    >({
      query: ({ id }) => ({
        url: `/v2/purchases/${id}/resend-quotation`,
        method: "POST",
      }),
    }),

    // Export purchases
    exportPurchases: builder.mutation<Blob, ExportPurchasesRequest>({
      query: ({ format, filters }) => {
        const params = new URLSearchParams({
          format,
        });

        if (filters?.status) params.append("status", filters.status);
        if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
        if (filters?.dateTo) params.append("dateTo", filters.dateTo);

        return {
          url: `/v2/purchases/export/data?${params.toString()}`,
          method: "GET",
          responseHandler: (response: Response) => response.blob(),
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPurchasesQuery,
  useGetPurchaseAnalyticsQuery,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseStatusMutation,
  useUpdatePurchaseNotesMutation,
  useResendQuotationMutation,
  useExportPurchasesMutation,
} = purchaseApi;

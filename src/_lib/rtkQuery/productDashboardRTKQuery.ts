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

// Types for Product Dashboard
export interface CategoryCount {
  categoryDisplayName: string;
  category: string;
  count: number;
  percentage: string;
}

export interface ProductSummary {
  averageProductsPerCategory: string;
  topCategory: string;
  topCategoryDisplayName: string;
  topCategoryCount: number;
}

export interface ProductDashboardData {
  totalProducts: number;
  categoryCounts: CategoryCount[];
  totalCategories: number;
  summary: ProductSummary;
}

export interface ProductDashboardResponse {
  success: boolean;
  message: string;
  data: ProductDashboardData;
}

// Types for Product List
export interface ProductPrice {
  size: string;
  price: number;
}

export interface Product {
  _id: string;
  category: string;
  productName: string;
  description?: string;
  size: string[];
  color: string[];
  price: ProductPrice[];
  thumbnail: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductPagination {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductListResponse {
  data: Product[];
  pagination: ProductPagination;
}

export interface GetProductsByCategoryRequest {
  category: string;
  pageNo?: number;
  pageSize?: number;
}

export interface GetProductByIdRequest {
  id: string;
  category: string;
}

export interface GetProductByIdResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface AddProductRequest {
  productName: string;
  category: string;
  size: string[];
  thumbnail: string;
  images?: string[];
  price: { size: string; price: string }[];
  color?: string[];
  description?: string;
}

export interface EditProductRequest {
  productName: string;
  category: string;
  size: string[];
  thumbnail: string;
  images?: string[];
  price: { size: string; price: string }[];
  color?: string[];
  description?: string;
}

export interface AddProductResponse {
  success: boolean;
  message: string;
  data?: Product;
}

export interface EditProductResponse {
  success: boolean;
  message: string;
  data?: Product;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

// Product Dashboard API
export const productDashboardApi = createApi({
  reducerPath: "productDashboardApi",
  baseQuery: customBaseQueryWithReauth,
  tagTypes: ["ProductSummary", "ProductList"],
  endpoints: (builder) => ({
    // Get product dashboard summary
    getProductSummary: builder.query<ProductDashboardResponse, void>({
      query: () => "/v2/productDashboard/summary",
      providesTags: ["ProductSummary"],
    }),

    // Get products by category with pagination
    getProductsByCategory: builder.query<
      ProductListResponse,
      GetProductsByCategoryRequest
    >({
      query: ({ category, pageNo = 1, pageSize = 10 }) => ({
        url: `/v2/productDashboard/getProductByCategory/${encodeURIComponent(
          category
        )}`,
        method: "GET",
        params: {
          pageNo,
          pageSize,
        },
      }),
      providesTags: (result, error, arg) => [
        { type: "ProductList", id: arg.category },
        "ProductList",
      ],
    }),

    // Get single product by ID
    getProductById: builder.query<Product, GetProductByIdRequest>({
      query: ({ id, category }) => ({
        url: `/v2/productDashboard/product/${id}`,
        method: "GET",
        params: {
          category,
        },
      }),
      providesTags: (result, error, arg) => [
        { type: "ProductList", id: arg.id },
      ],
    }),

    // Add new product
    addProduct: builder.mutation<AddProductResponse, AddProductRequest>({
      query: (productData) => ({
        url: "/v2/productDashboard/add",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["ProductSummary", "ProductList"],
    }),

    // Edit existing product
    editProduct: builder.mutation<
      EditProductResponse,
      EditProductRequest & { id: string }
    >({
      query: ({ id, ...productData }) => ({
        url: `/v2/productDashboard/product/${id}`,
        method: "PUT",
        body: productData,
      }),
      invalidatesTags: ["ProductSummary", "ProductList"],
    }),

    // Delete existing product
    deleteProduct: builder.mutation<DeleteProductResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/v2/productDashboard/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductSummary", "ProductList"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetProductSummaryQuery,
  useGetProductsByCategoryQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useEditProductMutation,
  useDeleteProductMutation,
} = productDashboardApi;

export default productDashboardApi;

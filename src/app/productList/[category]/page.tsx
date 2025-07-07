"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
// Optimized imports - use specific component imports instead of barrel imports
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Pagination } from "@heroui/pagination";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  AlertCircle,
} from "lucide-react";
import {
  useGetProductsByCategoryQuery,
  useDeleteProductMutation,
  Product,
} from "@/_lib/rtkQuery/productDashboardRTKQuery";
import SafeImage from "@/_components/genericComponents/SafeImage";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import { productCategoryMapping } from "@/_lib/utils/utils";
import { is401Error, handleAPIError } from "@/_lib/utils/errorUtils";

// Dynamic imports for heavy components
const ProductViewModal = dynamic(
  () => import("@/_components/genericComponents/ProductViewModal"),
  {
    loading: () => null, // Modal loading state can be null since it's overlay
    ssr: false,
  }
);

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params?.category as string;

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Client-side only state to prevent hydration issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when items per page changes (remove search dependency for now)
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Handle product view
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle product edit
  const handleEditProduct = (product: Product) => {
    // Navigate to edit page with category parameter
    router.push(`/productList/edit/${product._id}?category=${categorySlug}`);
  };

  // Handle product delete
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  // Confirm and execute delete
  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct({ id: productToDelete._id }).unwrap();

      // Close modal and reset state
      setShowDeleteConfirm(false);
      setProductToDelete(null);

      // Show success message
      toast.success("Product deleted successfully!");
    } catch (error: any) {
      handleAPIError(error, toast);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Display name for UI
  const displayCategoryName = useMemo(() => {
    if (productCategoryMapping[categorySlug]) {
      return productCategoryMapping[categorySlug];
    }
    return (
      categorySlug
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "Products"
    );
  }, [categorySlug]);

  // Fetch products for this category
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductsByCategoryQuery(
    {
      category: categorySlug,
      pageNo: currentPage,
      pageSize: itemsPerPage,
    },
    {
      skip: !categorySlug || !isClient,
      // Force refetch when parameters change
      refetchOnMountOrArgChange: true,
    }
  ); // Only log on client side to prevent hydration issues and handle errors
  useEffect(() => {
    if (error && isClient) {
      console.log("error", error);
      handleAPIError(error, toast);
    }
  }, [error, isClient]);

  // Debug pagination
  useEffect(() => {
    console.log(
      `Page changed to: ${currentPage}, Items per page: ${itemsPerPage}`
    );
    console.log("Products data:", productsData);
  }, [currentPage, itemsPerPage, productsData]);
  // Display products - show exactly what comes from API for proper pagination
  const displayProducts = useMemo(() => {
    if (!productsData?.data || !Array.isArray(productsData.data)) return [];
    return productsData.data; // Show exactly what API returns
  }, [productsData?.data]);

  // Handle 401 error
  if (is401Error(error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          <div className="backdrop-blur-sm bg-white/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
            <PermissionDenied
              message="You don't have permission to view products in this category. Please contact your super admin."
              onRetry={() => refetch()}
            />
          </div>
        </div>
      </div>
    );
  }

  // Loading skeleton component
  const ProductCardSkeleton = () => (
    <div className="backdrop-blur-sm bg-white/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/30 animate-pulse h-full">
      <div className="w-full h-36 sm:h-48 bg-gray-200/50 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
      <div className="space-y-2 sm:space-y-3">
        <div className="h-4 sm:h-6 bg-gray-200/50 rounded w-3/4"></div>
        <div className="h-3 sm:h-4 bg-gray-200/50 rounded w-full"></div>
        <div className="h-3 sm:h-4 bg-gray-200/50 rounded w-2/3"></div>
        <div className="flex justify-between items-center mt-3 sm:mt-4">
          <div className="h-4 sm:h-6 bg-gray-200/50 rounded w-16 sm:w-20"></div>
          <div className="h-6 sm:h-8 bg-gray-200/50 rounded w-16 sm:w-24"></div>
        </div>
        <div className="flex gap-1 sm:gap-2 mt-2">
          <div className="h-6 sm:h-8 bg-gray-200/50 rounded flex-1"></div>
          <div className="h-6 sm:h-8 bg-gray-200/50 rounded w-6 sm:w-8"></div>
          <div className="h-6 sm:h-8 bg-gray-200/50 rounded w-6 sm:w-8"></div>
        </div>
      </div>
    </div>
  );

  // Prevent hydration issues by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          <div className="backdrop-blur-sm bg-white/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 shadow-xl border border-white/20">
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              <span>Product Categories</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Loading...</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg animate-pulse">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Loading...
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Loading products...
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Header with Breadcrumb */}
        <div className="backdrop-blur-sm bg-white/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 shadow-xl border border-white/20 animate-fade-in">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            <Link
              href="/productList"
              className="hover:text-blue-600 transition-colors duration-200 font-medium truncate"
            >
              Categories
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate">
              {displayCategoryName}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 line-clamp-2">
                  {displayCategoryName}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                  {isLoading ? (
                    <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `${productsData?.pagination?.total || 0} products available`
                  )}
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.back()}
              variant="bordered"
              startContent={<ArrowLeft className="w-4 h-4" />}
              className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex-shrink-0 touch-manipulation"
              size="sm"
            >
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="backdrop-blur-sm bg-gradient-to-r from-red-50/90 to-rose-50/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 shadow-xl border border-red-200/50 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-lg flex-shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  Failed to load products
                </h3>
                <div className="text-red-600 text-sm sm:text-base mb-1">
                  {error && typeof error === "object" && "data" in error
                    ? `Error: ${
                        (error.data as any)?.message || "Unknown error"
                      }`
                    : "Please try refreshing the page"}
                </div>
                <div className="text-red-600 text-xs sm:text-sm mb-2 sm:mb-3">
                  {error && typeof error === "object" && "data" in error
                    ? `Allowed category: ${
                        (error.data as any)?.allowedCategories ||
                        "Unknown error"
                      }`
                    : "Please try refreshing the page"}
                </div>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onClick={() => refetch()}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="backdrop-blur-sm bg-white/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 shadow-xl border border-white/20 animate-fade-in">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                  className="w-full bg-white/80 backdrop-blur-sm"
                  isDisabled
                  size="sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Search temporarily disabled for pagination testing
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Select
                  placeholder="Items per page"
                  selectedKeys={[itemsPerPage.toString()]}
                  onSelectionChange={(keys) =>
                    setItemsPerPage(Number(Array.from(keys)[0]))
                  }
                  className="w-full sm:w-32 bg-white/80 backdrop-blur-sm"
                  size="sm"
                >
                  <SelectItem key="10">10</SelectItem>
                  <SelectItem key="20">20</SelectItem>
                  <SelectItem key="50">50</SelectItem>
                  <SelectItem key="100">100</SelectItem>
                </Select>
                <Select
                  placeholder="Sort by"
                  selectedKeys={[sortBy]}
                  onSelectionChange={(keys) =>
                    setSortBy(Array.from(keys)[0] as string)
                  }
                  className="w-full sm:w-40 bg-white/80 backdrop-blur-sm"
                  size="sm"
                >
                  <SelectItem key="name">Name</SelectItem>
                  <SelectItem key="price">Price</SelectItem>
                  <SelectItem key="newest">Newest</SelectItem>
                </Select>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  as={Link}
                  href="/productList/add"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation"
                  size="sm"
                >
                  <span className="hidden sm:inline">Add Product</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>

            {/* Pagination Info */}
            {!isLoading && productsData?.pagination && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-600 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-100/50">
                <span className="font-medium">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    productsData.pagination.total
                  )}{" "}
                  of {productsData.pagination.total} products
                </span>
                <span className="font-medium">
                  Page {currentPage} of {productsData.pagination.totalPages}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : displayProducts.length > 0 ? (
            // Actual products
            displayProducts.map((product) => (
              <div
                key={product._id}
                className="backdrop-blur-sm bg-white/70 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 h-full group cursor-pointer transform hover:-translate-y-1 animate-fade-in touch-manipulation active:scale-95"
                onClick={() => handleViewProduct(product)}
              >
                <div className="w-full h-36 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl overflow-hidden relative mb-3 sm:mb-4 group-hover:shadow-lg transition-all duration-300">
                  {product.thumbnail ? (
                    <SafeImage
                      src={product.thumbnail}
                      alt={product.productName}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      onError={() => {
                        console.log(
                          "SafeImage: Failed to load image:",
                          product.thumbnail
                        );
                      }}
                      onLoad={() => {
                        console.log(
                          "SafeImage: Image loaded:",
                          product.thumbnail
                        );
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <Button
                      color="primary"
                      variant="solid"
                      startContent={<Eye className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transform scale-95 hover:scale-100 transition-all duration-300 text-xs sm:text-sm"
                      size="sm"
                    >
                      <span className="hidden sm:inline">Quick View</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
                      {product.productName}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {product.size.slice(0, 2).map((size, index) => (
                      <Chip
                        key={index}
                        size="sm"
                        variant="flat"
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200/50 text-xs"
                      >
                        {size}
                      </Chip>
                    ))}
                    {product.size.length > 2 && (
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs"
                      >
                        +{product.size.length - 2}
                      </Chip>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{product.price[0]?.price || 0}
                      </span>
                      {product.price[0]?.size && (
                        <span className="text-xs sm:text-sm text-gray-500">
                          /{product.price[0].size}
                        </span>
                      )}
                    </div>
                    <Badge
                      color="success"
                      variant="flat"
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200/50 text-xs"
                    >
                      In Stock
                    </Badge>
                  </div>

                  <div className="flex gap-1 sm:gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={<Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                      className="flex-1 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-700 border-blue-200/50 transition-all duration-300 text-xs sm:text-sm touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                    >
                      <span className="hidden sm:inline">View</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="warning"
                      isIconOnly
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                      className="bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 border-amber-200/50 transition-all duration-300 touch-manipulation min-w-8 min-h-8"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isIconOnly
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product);
                      }}
                      className="bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 border-red-200/50 transition-all duration-300 touch-manipulation min-w-8 min-h-8"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="col-span-full">
              <div className="backdrop-blur-sm bg-white/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-white/20 text-center animate-fade-in">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl sm:rounded-2xl shadow-lg inline-block mb-4 sm:mb-6">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-2 sm:mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
                  {debouncedSearchTerm
                    ? `No products found matching "${debouncedSearchTerm}"`
                    : `No products available in ${displayCategoryName} category`}
                </p>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  as={Link}
                  href="/productList/add"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation"
                  size="sm"
                >
                  <span className="hidden sm:inline">Add First Product</span>
                  <span className="sm:hidden">Add Product</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading &&
          productsData?.pagination &&
          productsData.pagination.totalPages > 1 && (
            <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
              <div className="backdrop-blur-sm bg-white/70 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl border border-white/20 w-full sm:w-auto">
                <Pagination
                  total={productsData.pagination.totalPages}
                  page={currentPage}
                  onChange={(page) => {
                    console.log("Pagination clicked, going to page:", page);
                    setCurrentPage(page);
                  }}
                  showControls
                  showShadow
                  color="primary"
                  key={`pagination-${itemsPerPage}-${categorySlug}`}
                  className="gap-1 sm:gap-2"
                  size="sm"
                  classNames={{
                    item: "min-w-8 h-8 sm:min-w-10 sm:h-10 text-xs sm:text-sm",
                    cursor:
                      "min-w-8 h-8 sm:min-w-10 sm:h-10 text-xs sm:text-sm",
                  }}
                />
              </div>
            </div>
          )}

        {/* Product View Modal */}
        <ProductViewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && productToDelete && (
          <Modal
            isOpen={showDeleteConfirm}
            onClose={cancelDelete}
            size="md"
            backdrop="blur"
            classNames={{
              base: "mx-4 my-4 sm:mx-0 sm:my-0",
              wrapper: "items-end sm:items-center justify-center",
            }}
          >
            <ModalContent className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl mb-0 sm:mb-auto">
              <ModalHeader className="border-b border-gray-200/50 pb-3 sm:pb-4">
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Confirm Delete
                </h3>
              </ModalHeader>
              <ModalBody className="py-4 sm:py-6">
                <div className="text-center">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl sm:rounded-2xl shadow-lg inline-block mb-4 sm:mb-6">
                    <Trash2 className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Delete Product
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base lg:text-lg">
                    Are you sure you want to delete &quot;
                    {productToDelete.productName}&quot;? This action cannot be
                    undone.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200/50 pt-3 sm:pt-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                  <Button
                    color="default"
                    variant="bordered"
                    onClick={cancelDelete}
                    className="flex-1 border-gray-300 hover:border-gray-400 transition-all duration-300 touch-manipulation"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onClick={confirmDelete}
                    isLoading={isDeleting}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation"
                    size="sm"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </div>
    </div>
  );
}

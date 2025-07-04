"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Badge,
  Chip,
  Skeleton,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
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
import ProductViewModal from "@/_components/genericComponents/ProductViewModal";
import SafeImage from "@/_components/genericComponents/SafeImage";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import { productCategoryMapping } from "@/_lib/utils/utils";
import { is401Error, handleAPIError } from "@/_lib/utils/errorUtils";

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
      <div className="container mx-auto p-6">
        <PermissionDenied
          message="You don't have permission to view products in this category. Please contact your super admin."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Loading skeleton component
  const ProductCardSkeleton = () => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="w-full h-48 rounded-lg" />
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Prevent hydration issues by not rendering until client-side
  if (!isClient) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <span>Product Categories</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Loading...</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Loading...
              </h1>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/productList" className="hover:text-blue-600">
            Product Categories
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {displayCategoryName}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {displayCategoryName}
            </h1>
            <p className="text-gray-600">
              {isLoading ? (
                <Skeleton className="h-4 w-32 rounded" />
              ) : (
                `${productsData?.pagination?.total || 0} products available`
              )}
            </p>
          </div>

          <Button
            onClick={() => router.back()}
            variant="ghost"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">
                Failed to load products
              </h3>
              <div className="text-red-600 text-sm mt-1">
                {error && typeof error === "object" && "data" in error
                  ? `Error: ${(error.data as any)?.message || "Unknown error"}`
                  : "Please try refreshing the page"}
              </div>
              <div className="text-red-600 text-sm mt-1">
                {error && typeof error === "object" && "data" in error
                  ? `Allowed category: ${
                      (error.data as any)?.allowedCategories || "Unknown error"
                    }`
                  : "Please try refreshing the page"}
              </div>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onClick={() => refetch()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products... (temporarily disabled for pagination testing)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="w-full"
              isDisabled
            />
          </div>

          <div className="flex gap-2">
            <Select
              placeholder="Items per page"
              selectedKeys={[itemsPerPage.toString()]}
              onSelectionChange={(keys) =>
                setItemsPerPage(Number(Array.from(keys)[0]))
              }
              className="w-32"
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
              className="w-40"
            >
              <SelectItem key="name">Name</SelectItem>
              <SelectItem key="price">Price</SelectItem>
              <SelectItem key="newest">Newest</SelectItem>
            </Select>{" "}
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              as={Link}
              href="/productList/add"
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* Pagination Info */}
        {!isLoading && productsData?.pagination && (
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                productsData.pagination.total
              )}{" "}
              of {productsData.pagination.total} products
            </span>
            <span>
              Page {currentPage} of {productsData.pagination.totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))
        ) : displayProducts.length > 0 ? (
          // Actual products
          displayProducts.map((product) => (
            <Card
              key={product._id}
              className="hover:shadow-lg transition-shadow h-full group cursor-pointer"
              onClick={() => handleViewProduct(product)}
            >
              <CardHeader className="pb-2">
                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden relative">
                  {product.thumbnail ? (
                    <SafeImage
                      src={product.thumbnail}
                      alt={product.productName}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      color="primary"
                      variant="solid"
                      startContent={<Eye className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                    >
                      Quick View
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {product.productName}
                    </h3>
                    {/* <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div> */}
                  </div>

                  {/* <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description || "No description available"}
                  </p> */}

                  <div className="flex flex-wrap gap-1">
                    {product.size.slice(0, 3).map((size, index) => (
                      <Chip
                        key={index}
                        size="sm"
                        variant="flat"
                        color="primary"
                      >
                        {size}
                      </Chip>
                    ))}
                    {product.size.length > 3 && (
                      <Chip size="sm" variant="flat" color="default">
                        +{product.size.length - 3}
                      </Chip>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold text-green-600">
                        ₹{product.price[0]?.price || 0}
                      </span>
                      {product.price[0]?.size && (
                        <span className="text-sm text-gray-500 ml-1">
                          /{product.price[0].size}
                        </span>
                      )}
                    </div>
                    <Badge color="success" variant="flat">
                      In Stock
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={<Eye className="w-4 h-4" />}
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                    >
                      View
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
                    >
                      <Edit className="w-4 h-4" />
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4">
              {debouncedSearchTerm
                ? `No products found matching "${debouncedSearchTerm}"`
                : `No products available in ${displayCategoryName} category`}
            </p>
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              as={Link}
              href="/productList/add"
            >
              Add First Product
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading &&
        productsData?.pagination &&
        productsData.pagination.totalPages > 1 && (
          <div className="flex justify-center">
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
            />
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
        <Modal isOpen={showDeleteConfirm} onClose={cancelDelete} size="md">
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold text-red-600">
                Confirm Delete
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="text-center py-4">
                <Trash2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Product
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete &quot;
                  {productToDelete.productName}&quot;? This action cannot be
                  undone.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex gap-2 w-full">
                <Button
                  color="default"
                  variant="flat"
                  onClick={cancelDelete}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onClick={confirmDelete}
                  isLoading={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

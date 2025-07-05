"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useGetProductByIdQuery } from "@/_lib/rtkQuery/productDashboardRTKQuery";
import ProductForm from "@/_components/genericComponents/ProductForm";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import { is401Error, handleAPIError } from "@/_lib/utils/errorUtils";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  // Fetch product data from API
  const {
    data: productResponse,
    isLoading,
    error,
    isSuccess,
    refetch,
  } = useGetProductByIdQuery(
    { id: id as string, category: category || "" },
    { skip: !id || !category }
  );

  // Handle API errors with toast notifications
  React.useEffect(() => {
    if (error) {
      handleAPIError(error, toast);
    }
  }, [error]);

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

        <div className="container mx-auto p-6 relative z-10">
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href={category ? `/productList/${category}` : "/productList"}
              >
                <Button
                  variant="bordered"
                  isIconOnly
                  className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Product
              </h1>
            </div>
            <PermissionDenied
              message="You don't have permission to edit products. Please contact your super admin."
              onRetry={() => refetch()}
            />
          </div>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    // Navigate back to the product list
    if (category) {
      router.push(`/productList/${category}`);
    } else {
      router.push("/productList");
    }
  };

  const handleCancel = () => {
    // Navigate back to the product list
    if (category) {
      router.push(`/productList/${category}`);
    } else {
      router.push("/productList");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <div className="container mx-auto p-6 relative z-10">
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center gap-4 mb-8">
              <Link
                href={category ? `/productList/${category}` : "/productList"}
              >
                <Button
                  variant="bordered"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                  className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Back to Products
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Product
              </h1>
            </div>
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600 text-lg">
                  Loading product data...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !productResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <div className="container mx-auto p-6 relative z-10">
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center gap-4 mb-8">
              <Link
                href={category ? `/productList/${category}` : "/productList"}
              >
                <Button
                  variant="bordered"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                  className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Back to Products
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Product
              </h1>
            </div>
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow-lg inline-block mb-6">
                  <AlertCircle className="w-16 h-16 text-white mx-auto" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3">
                  Product Not Found
                </h2>
                <p className="text-gray-600 mb-4 text-lg">
                  The product you&apos;re trying to edit could not be found or
                  there was an error loading it.
                </p>
                {error && "data" in error && (
                  <p className="text-sm text-red-500 mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
                    Error:{" "}
                    {(error.data as any)?.message || "Failed to load product"}
                  </p>
                )}
                <Link
                  href={category ? `/productList/${category}` : "/productList"}
                >
                  <Button
                    color="primary"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Return to Product List
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show missing category parameter error
  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <div className="container mx-auto p-6 relative z-10">
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/productList">
                <Button
                  variant="bordered"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                  className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Back to Products
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Product
              </h1>
            </div>
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg inline-block mb-6">
                  <AlertCircle className="w-16 h-16 text-white mx-auto" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  Missing Category Parameter
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Category parameter is required to edit a product. Please
                  navigate from a product list.
                </p>
                <Link href="/productList">
                  <Button
                    color="primary"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Go to Product List
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the edit form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/productList/${category}`}>
              <Button
                variant="bordered"
                startContent={<ArrowLeft className="w-4 h-4" />}
                className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                Back to Products
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Product
              </h1>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <ProductForm
              mode="edit"
              product={productResponse}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

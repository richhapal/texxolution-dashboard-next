"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useGetProductByIdQuery } from "@/_lib/rtkQuery/productDashboardRTKQuery";
import ProductForm from "@/_components/genericComponents/ProductForm";

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
  } = useGetProductByIdQuery(
    { id: id as string, category: category || "" },
    { skip: !id || !category }
  );

  const product = productResponse?.data;

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
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Link
                href={category ? `/productList/${category}` : "/productList"}
              >
                <Button
                  variant="light"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Products
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Edit Product</h1>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Loading product data...</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Link
                href={category ? `/productList/${category}` : "/productList"}
              >
                <Button
                  variant="light"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Products
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Edit Product</h1>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Product Not Found
                </h2>
                <p className="text-gray-600 mb-4">
                  The product you're trying to edit could not be found or there
                  was an error loading it.
                </p>
                {error && "data" in error && (
                  <p className="text-sm text-red-500 mb-4">
                    Error:{" "}
                    {(error.data as any)?.message || "Failed to load product"}
                  </p>
                )}
                <Link
                  href={category ? `/productList/${category}` : "/productList"}
                >
                  <Button color="primary">Return to Product List</Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Show missing category parameter error
  if (!category) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Link href="/productList">
                <Button
                  variant="light"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Products
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Edit Product</h1>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Missing Category Parameter
                </h2>
                <p className="text-gray-600 mb-4">
                  Category parameter is required to edit a product. Please
                  navigate from a product list.
                </p>
                <Link href="/productList">
                  <Button color="primary">Go to Product List</Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Render the edit form
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link href={`/productList/${category}`}>
              <Button
                variant="light"
                startContent={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Products
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Product</h1>
          </div>
        </CardHeader>
        <CardBody>
          <ProductForm
            mode="edit"
            product={product}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardBody>
      </Card>
    </div>
  );
}

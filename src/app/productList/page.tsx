"use client";

import React from "react";
import { Card, CardBody, CardHeader, Badge, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Shirt,
  Scissors,
  Palette,
  Package,
  Settings,
  Home,
  Layers,
  Factory,
  Wrench,
  Paintbrush,
  Box,
  Zap,
  Plus,
} from "lucide-react";
import { useGetProductSummaryQuery } from "@/_lib/rtkQuery/productDashboardRTKQuery";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import {
  StatCardSkeleton,
  CategoryCardSkeleton,
} from "@/_components/genericComponents/SkeletonCard";
import { is401Error, handleAPIError } from "@/_lib/utils/errorUtils";
import QuickActions from "@/_components/productList/QuickActions";
import CategoryHeader from "@/_components/productList/CategoryHeader";

// Category configuration for display
const categoryConfig: Record<
  string,
  {
    name: string;
    description: string;
    icon: React.ReactElement;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger";
    path: string;
  }
> = {
  "textile-farming": {
    name: "Textile Farming",
    description: "Raw materials and agricultural textile products",
    icon: <Factory className="w-8 h-8" />,
    color: "success",
    path: "/productList/textile-farming",
  },
  fibre: {
    name: "Fibre",
    description: "Natural and synthetic fibres for textile production",
    icon: <Layers className="w-8 h-8" />,
    color: "primary",
    path: "/productList/fibre",
  },
  yarn: {
    name: "Yarn",
    description: "Various types of yarns and threads",
    icon: <Zap className="w-8 h-8" />,
    color: "secondary",
    path: "/productList/yarn",
  },
  "greige-fabric": {
    name: "Greige Fabric Unveiled",
    description: "Unfinished woven and knitted fabrics",
    icon: <Layers className="w-8 h-8" />,
    color: "warning",
    path: "/productList/greige-fabric",
  },
  denim: {
    name: "Denim",
    description: "Denim fabrics and related products",
    icon: <Shirt className="w-8 h-8" />,
    color: "primary",
    path: "/productList/denim",
  },
  "finished-fabrics": {
    name: "Woven and Knitted Finished Fabrics",
    description: "Complete finished fabrics ready for garment production",
    icon: <Layers className="w-8 h-8" />,
    color: "success",
    path: "/productList/finished-fabrics",
  },
  garments: {
    name: "Garments",
    description: "Ready-made clothing and apparel items",
    icon: <Shirt className="w-8 h-8" />,
    color: "danger",
    path: "/productList/garments",
  },
  "trims-accessories": {
    name: "Trims and Garment Accessories",
    description: "Buttons, zippers, labels, and other accessories",
    icon: <Scissors className="w-8 h-8" />,
    color: "secondary",
    path: "/productList/trims-accessories",
  },
  packing: {
    name: "Packing",
    description: "Packaging materials and solutions",
    icon: <Package className="w-8 h-8" />,
    color: "warning",
    path: "/productList/packing",
  },
  "dyes-chemicals": {
    name: "Dyes and Chemicals",
    description: "Textile dyes, chemicals, and treatment solutions",
    icon: <Palette className="w-8 h-8" />,
    color: "danger",
    path: "/productList/dyes-chemicals",
  },
  machineries: {
    name: "Textile Machineries and Equipment",
    description: "Industrial textile machinery and equipment",
    icon: <Settings className="w-8 h-8" />,
    color: "default",
    path: "/productList/machineries",
  },
  "home-decor": {
    name: "Home Decor",
    description: "Home textile and decorative items",
    icon: <Home className="w-8 h-8" />,
    color: "success",
    path: "/productList/home-decor",
  },
};

export default function ProductListPage() {
  const router = useRouter();

  // Fetch product dashboard summary data
  const {
    data: productSummaryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductSummaryQuery();

  // Transform API data to match our category structure
  const categoryData = React.useMemo(() => {
    if (!productSummaryData?.data?.categoryCounts) return [];

    return productSummaryData.data.categoryCounts
      .map((categoryCount) => {
        const config = categoryConfig[categoryCount.category] || {
          name: categoryCount.categoryDisplayName,
          description: `Products in ${categoryCount.category} category`,
          icon: <Package className="w-8 h-8" />,
          color: "default" as const,
          path: `/productList/${categoryCount.category}`,
        };

        return {
          id: categoryCount.category,
          name: config.name,
          description: config.description,
          icon: config.icon,
          color: config.color,
          itemCount: categoryCount.count,
          percentage: categoryCount.percentage,
          path: config.path,
        };
      })
      .sort((a, b) => b.itemCount - a.itemCount); // Sort by item count descending
  }, [productSummaryData]);

  // Handle API errors with toast notifications
  React.useEffect(() => {
    if (isError && error) {
      handleAPIError(error, toast);
    }
  }, [isError, error]);

  // Handle 401 error
  if (is401Error(error)) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Product Categories</h1>
        </div>
        <PermissionDenied
          message="You don't have permission to view product data. Please contact your super admin."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <CategoryHeader
        totalCategories={productSummaryData?.data?.totalCategories}
        totalProducts={productSummaryData?.data?.totalProducts}
        isLoading={isLoading}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Categories */}
        {isLoading ? (
          <StatCardSkeleton className="bg-gradient-to-r from-blue-500 to-blue-600" />
        ) : (
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Categories</p>
                  <p className="text-2xl font-bold">
                    {productSummaryData?.data?.totalCategories || 0}
                  </p>
                </div>
                <Box className="w-8 h-8 opacity-80" />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Total Products */}
        {isLoading ? (
          <StatCardSkeleton className="bg-gradient-to-r from-green-500 to-green-600" />
        ) : (
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Products</p>
                  <p className="text-2xl font-bold">
                    {productSummaryData?.data?.totalProducts || 0}
                  </p>
                </div>
                <Package className="w-8 h-8 opacity-80" />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Active Categories (same as total for now) */}
        {isLoading ? (
          <StatCardSkeleton className="bg-gradient-to-r from-purple-500 to-purple-600" />
        ) : (
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Active Categories</p>
                  <p className="text-2xl font-bold">
                    {productSummaryData?.data?.totalCategories || 0}
                  </p>
                </div>
                <Layers className="w-8 h-8 opacity-80" />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Average per Category */}
        {isLoading ? (
          <StatCardSkeleton className="bg-gradient-to-r from-orange-500 to-orange-600" />
        ) : (
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg per Category</p>
                  <p className="text-2xl font-bold">
                    {productSummaryData?.data?.summary
                      ?.averageProductsPerCategory || "0"}
                  </p>
                </div>
                <Factory className="w-8 h-8 opacity-80" />
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Top Category Highlight */}
      {!isLoading && productSummaryData?.data?.summary?.topCategory && (
        <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-indigo-900 font-semibold">
                Top Performing Category
              </h3>
              <p className="text-indigo-700 mt-1">
                <span className="font-medium">
                  {productSummaryData.data.summary.topCategoryDisplayName}
                </span>{" "}
                leads with{" "}
                <span className="font-bold">
                  {productSummaryData.data.summary.topCategoryCount}
                </span>{" "}
                products
              </p>
            </div>
            <div className="text-indigo-600">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          // Show skeleton loading state
          Array.from({ length: 8 }).map((_, index) => (
            <CategoryCardSkeleton key={index} />
          ))
        ) : categoryData.length > 0 ? (
          // Show actual category data
          categoryData.map((category) => (
            <Link
              key={category.id}
              href={category.path}
              className="no-underline"
            >
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:scale-105 border-0 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-3 rounded-lg bg-${category.color}-100`}>
                      {React.cloneElement(category.icon, {
                        className: `w-8 h-8 text-${category.color}-600`,
                      })}
                    </div>
                    <div className="text-right">
                      <Badge color={category.color} variant="flat" size="sm">
                        {category.itemCount} items
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {category.percentage}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="pt-0">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">View Products</span>
                      <div className="w-5 h-5 text-gray-400">→</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))
        ) : (
          // Show empty state when no categories
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-500">
              There are no product categories available at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

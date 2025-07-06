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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Header */}
        <CategoryHeader
          totalCategories={productSummaryData?.data?.totalCategories}
          totalProducts={productSummaryData?.data?.totalProducts}
          isLoading={isLoading}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Categories */}
          {isLoading ? (
            <StatCardSkeleton className="bg-gradient-to-r from-blue-500 to-blue-600" />
          ) : (
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-white/5 rounded-full blur-2xl"></div>
              <CardBody className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">
                      Total Categories
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {productSummaryData?.data?.totalCategories || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Box className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Total Products */}
          {isLoading ? (
            <StatCardSkeleton className="bg-gradient-to-r from-green-500 to-green-600" />
          ) : (
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-white/5 rounded-full blur-2xl"></div>
              <CardBody className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-green-100 text-xs sm:text-sm font-medium">
                      Total Products
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {productSummaryData?.data?.totalProducts || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Active Categories */}
          {isLoading ? (
            <StatCardSkeleton className="bg-gradient-to-r from-purple-500 to-purple-600" />
          ) : (
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-white/5 rounded-full blur-2xl"></div>
              <CardBody className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-purple-100 text-xs sm:text-sm font-medium">
                      Active Categories
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {productSummaryData?.data?.totalCategories || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Average per Category */}
          {isLoading ? (
            <StatCardSkeleton className="bg-gradient-to-r from-orange-500 to-orange-600" />
          ) : (
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-white/5 rounded-full blur-2xl"></div>
              <CardBody className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-orange-100 text-xs sm:text-sm font-medium">
                      Avg per Category
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">
                      {productSummaryData?.data?.summary
                        ?.averageProductsPerCategory || "0"}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Top Category Highlight */}
        {!isLoading && productSummaryData?.data?.summary?.topCategory && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-indigo-50 via-purple-50/50 to-pink-50/30 border border-indigo-200/50 rounded-2xl backdrop-blur-sm shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-indigo-900 font-semibold text-sm sm:text-base flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  Top Performing Category
                </h3>
                <p className="text-indigo-700 mt-2 text-sm sm:text-base">
                  <span className="font-medium">
                    {productSummaryData.data.summary.topCategoryDisplayName}
                  </span>{" "}
                  leads with{" "}
                  <span className="font-bold text-indigo-800">
                    {productSummaryData.data.summary.topCategoryCount}
                  </span>{" "}
                  products
                </p>
              </div>
              <div className="text-indigo-600 bg-indigo-100 p-3 rounded-xl">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {isLoading ? (
            // Show skeleton loading state
            Array.from({ length: 8 }).map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))
          ) : categoryData.length > 0 ? (
            // Show actual category data
            categoryData.map((category, index) => (
              <Link
                key={category.id}
                href={category.path}
                className="no-underline group block"
              >
                <Card
                  className={`
                relative h-full transition-all duration-500 ease-out cursor-pointer
                hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 border-0 
                bg-gradient-to-br from-white via-gray-50/30 to-white
                backdrop-blur-sm overflow-hidden
                hover:shadow-${category.color}-500/20
                ring-1 ring-gray-200/50 hover:ring-${category.color}-300/50
                before:absolute before:inset-0 before:bg-gradient-to-br 
                before:from-${category.color}-50/30 before:via-transparent before:to-${category.color}-50/10
                before:opacity-0 before:transition-opacity before:duration-500 
                hover:before:opacity-100
                touch-manipulation
                active:scale-95
              `}
                >
                  {/* Decorative elements */}
                  <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  {/* Top pattern */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>

                  <CardHeader className="pb-3 sm:pb-4 relative z-10">
                    <div className="flex items-center justify-between w-full">
                      {/* Icon with enhanced styling */}
                      <div
                        className={`
                      relative p-3 sm:p-4 rounded-xl sm:rounded-2xl 
                      bg-gradient-to-br from-${category.color}-100 to-${category.color}-200/70
                      group-hover:scale-105 sm:group-hover:scale-110 group-hover:rotate-1 sm:group-hover:rotate-3 
                      transition-all duration-500 ease-out
                      shadow-lg shadow-${category.color}-500/20
                      ring-1 ring-${category.color}-200/50
                      before:absolute before:inset-0 before:bg-gradient-to-br 
                      before:from-white/20 before:to-transparent before:rounded-xl sm:before:rounded-2xl
                      before:opacity-0 before:transition-opacity before:duration-300
                      group-hover:before:opacity-100
                    `}
                      >
                        {/* Icon glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {React.cloneElement(category.icon, {
                          className: `w-6 h-6 sm:w-8 sm:h-8 text-${category.color}-700 relative z-10 drop-shadow-sm transition-all duration-300 group-hover:scale-105`,
                        })}
                      </div>

                      {/* Badge and stats */}
                      <div className="text-right space-y-1">
                        <Badge
                          color={category.color}
                          variant="flat"
                          size="sm"
                          className="group-hover:scale-105 transition-transform duration-300 text-xs"
                        >
                          {category.itemCount} items
                        </Badge>
                        <div className="flex items-center gap-1 justify-end">
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-${category.color}-500 animate-pulse`}
                          ></div>
                          <p className="text-xs text-gray-500 font-medium">
                            {category.percentage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardBody className="pt-0 relative z-10">
                    <div className="space-y-2 sm:space-y-3">
                      <h3
                        className={`
                      text-base sm:text-lg font-bold text-gray-900 line-clamp-1 
                      group-hover:text-${category.color}-700 
                      transition-colors duration-300
                    `}
                      >
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                        {category.description}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 sm:mt-4 mb-4 sm:mb-6">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                        <div
                          className={`h-1.5 sm:h-2 bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 rounded-full transition-all duration-1000 ease-out`}
                          style={{
                            width: `${Math.min(
                              (category.itemCount /
                                (categoryData[0]?.itemCount || 1)) *
                                100,
                              100
                            )}%`,
                            transform: "translateX(-100%)",
                            animation: "slideIn 1s ease-out forwards",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Action section */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div
                            className={`w-1 h-1 bg-${category.color}-400 rounded-full group-hover:w-1.5 sm:group-hover:w-2 transition-all duration-300`}
                          ></div>
                          <div
                            className={`w-1 h-1 bg-${category.color}-300 rounded-full group-hover:w-1.5 sm:group-hover:w-2 transition-all duration-300 delay-75`}
                          ></div>
                          <div
                            className={`w-1 h-1 bg-${category.color}-200 rounded-full group-hover:w-1.5 sm:group-hover:w-2 transition-all duration-300 delay-150`}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          Explore
                        </span>
                      </div>

                      <div
                        className={`
                      w-7 h-7 sm:w-8 sm:h-8 rounded-full 
                      bg-gradient-to-br from-${category.color}-50 to-${category.color}-100
                      flex items-center justify-center 
                      group-hover:scale-105 sm:group-hover:scale-110 group-hover:rotate-6 sm:group-hover:rotate-12 
                      transition-all duration-300 
                      shadow-sm group-hover:shadow-md
                    `}
                      >
                        <div
                          className={`
                        w-3 h-3 sm:w-4 sm:h-4 text-${category.color}-600 font-bold
                        group-hover:translate-x-0.5 transition-transform duration-300
                      `}
                        >
                          →
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))
          ) : (
            // Show empty state when no categories
            <div className="col-span-full text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto blur-2xl opacity-50"></div>
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4 relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Categories Found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                There are no product categories available at the moment. Check
                back later or contact support.
              </p>
              <Button
                color="primary"
                variant="flat"
                onClick={() => refetch()}
                startContent={<Plus className="w-4 h-4" />}
              >
                Refresh Categories
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}

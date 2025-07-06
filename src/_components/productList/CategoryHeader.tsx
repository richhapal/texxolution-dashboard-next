import React from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface CategoryHeaderProps {
  totalCategories?: number;
  totalProducts?: number;
  isLoading?: boolean;
}

export default function CategoryHeader({
  totalCategories = 0,
  totalProducts = 0,
  isLoading = false,
}: CategoryHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Product Categories
          </h1>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">
            Manage your textile product inventory by category
          </p>
          {!isLoading && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-blue-700">
                  {totalCategories}
                </span>
                <span className="text-blue-600">Categories</span>
              </span>
              <span className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-green-700">
                  {totalProducts}
                </span>
                <span className="text-green-600">Products</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link href="/productList/add" className="flex-1 sm:flex-none">
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

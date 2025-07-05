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
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Categories
          </h1>
          <p className="text-gray-600 mb-2">
            Manage your textile product inventory by category
          </p>
          {!isLoading && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {totalCategories} Categories
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {totalProducts} Products
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/productList/add">
            <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

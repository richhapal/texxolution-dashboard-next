"use client";

import React from "react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import ProductForm from "@/_components/genericComponents/ProductForm";

export default function AddProductPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/productList");
  };

  const handleCancel = () => {
    router.push("/productList");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 relative z-10">
        <div className="backdrop-blur-sm bg-white/70 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 xl:p-8 shadow-xl border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
            <Link href="/productList" className="w-full sm:w-auto">
              <Button
                variant="bordered"
                startContent={<ArrowLeft className="w-4 h-4" />}
                className="w-full sm:w-auto border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 touch-manipulation min-h-[44px] sm:min-h-[40px]"
                size="sm"
              >
                <span className="hidden sm:inline">Back to Products</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1">
              <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Add New Product
              </h1>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 xl:p-6">
            <ProductForm
              mode="add"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

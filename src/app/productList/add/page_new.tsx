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
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Add New Product
              </h1>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
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

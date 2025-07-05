"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FolderIcon } from "lucide-react";
import MenuIcon from "@/_lib/svgIcons/menuIcon";
import OrderListIcon from "@/_lib/svgIcons/orderList";
import UserIcon from "@/_lib/svgIcons/user";
import SettingIcon from "@/_lib/svgIcons/setting";
import KeyIcon from "@/_lib/svgIcons/keyIcon";
import DashboardCard from "@/_components/dashboard/DashboardCard";

const pages = [
  {
    name: "Product List",
    path: "/productList",
    description: "Manage your product catalog",
    icon: <MenuIcon />,
  },
  {
    name: "Order List",
    path: "/orderList",
    description: "Track and manage customer orders",
    icon: <OrderListIcon />,
  },
  {
    name: "Customer List",
    path: "/customer-list",
    description: "View and manage customer information",
    icon: <UserIcon />,
  },
  {
    name: "Image Upload",
    path: "/image-upload",
    description: "Upload images to AWS S3",
    icon: <FolderIcon />,
  },
  // {
  //   name: "Setting",
  //   path: "/setting",
  //   description: "Configure your store settings",
  //   icon: <SettingIcon />,
  // },
  {
    name: "Permissions",
    path: "/permissions",
    description: "Manage user permissions",
    icon: <KeyIcon />,
  },
];

export default function PageDirectory() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>

      {/* Floating orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"></div>
            </div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-4">
            Welcome to Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Streamline your business operations with our powerful, intuitive
            tools designed for modern workflows
          </p>

          {/* Stats or badges */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                All Systems Active
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                🚀 Latest Updates
              </span>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {pages.map((page, index) => (
            <div
              key={page.path}
              className="opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <DashboardCard
                name={page.name}
                path={page.path}
                description={page.description}
                icon={page.icon}
              />
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Regular Updates</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Need assistance? Our support team is here to help you succeed
          </p>
        </div>
      </div>
    </div>
  );
}

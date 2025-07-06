"use client";

import React, { useState } from "react";
import { Card, CardBody, Button, Chip, Tabs, Tab } from "@heroui/react";
import {
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useAppSelector } from "@/_lib/store/store";
import { toast } from "react-toastify";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import {
  useGetUsersQuery,
  useGetAdminUsersQuery,
} from "@/_lib/rtkQuery/customerRTKQuery";
import NormalUsersTable from "@/_components/customerList/NormalUsersTable";
import AdminUsersTable from "@/_components/customerList/AdminUsersTable";
import { usePaginationLimit } from "@/_lib/hooks/usePaginationLimit";

// User type color mapping
const userTypeColorMap: Record<
  string,
  "success" | "warning" | "danger" | "default" | "primary"
> = {
  user: "primary",
  admin: "success",
  superadmin: "danger",
};

export default function CustomerListPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  // Custom hook for pagination limit management
  const { limit, updateLimit } = usePaginationLimit(10, "customer-list-limit");

  // Get user data from Redux store
  const user = useAppSelector((state) => state.userSlice.user);

  // RTK Query hooks for checking permissions
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsersQuery(
    {
      page: 1,
      limit: limit || 10,
    },
    { skip: activeTab !== "users" || limit === null }
  );

  const {
    data: adminUsersData,
    isLoading: isLoadingAdminUsers,
    error: adminUsersError,
    refetch: refetchAdminUsers,
  } = useGetAdminUsersQuery(
    {
      page: 1,
      limit: limit || 10,
    },
    { skip: activeTab !== "admins" || limit === null }
  );

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1); // Reset to first page when changing tabs
    setSearchTerm(""); // Clear search when switching tabs
    setUserTypeFilter("all"); // Reset filter when switching tabs
  };

  // Handle export functionality
  const handleExport = async (format: "csv" | "excel") => {
    try {
      // Here you would implement the export functionality
      // For now, we'll just show a success message
      toast.success(`${format.toUpperCase()} export will be implemented soon!`);
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error(
          "You don't have permission to export data. Please contact your super admin."
        );
      } else {
        toast.error("Export failed. Please try again.");
        console.error("Export failed:", error);
      }
    }
  };

  // Handle 401 error for users
  if (
    (usersError && "status" in usersError && usersError.status === 401) ||
    (adminUsersError &&
      "status" in adminUsersError &&
      adminUsersError.status === 401)
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto p-6 max-w-4xl relative z-10">
          <div className="flex items-center justify-center min-h-screen">
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-12 max-w-2xl mx-auto text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <span className="text-white text-4xl">🔒</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                  Access Restricted
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  You don&apos;t have permission to view customer data. Please
                  contact your super admin.
                </p>
                <PermissionDenied
                  message="You don't have permission to view customer data. Please contact your super admin."
                  onRetry={() => {
                    refetchUsers();
                    refetchAdminUsers();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current data based on active tab for summary
  const currentSummary =
    activeTab === "users"
      ? usersData?.data?.summary
      : adminUsersData?.data?.summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-violet-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div
          className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-40"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-float opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float opacity-70"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 max-w-7xl relative z-10">
        {/* Enhanced Header - Mobile Responsive */}
        <div
          className="mb-8 lg:mb-12 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "100ms", animationFillMode: "both" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Customer Management
                </h1>
                <p className="text-sm sm:text-lg lg:text-xl text-gray-600 mt-1 sm:mt-2">
                  Manage users, admins, and view comprehensive analytics
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Live Data
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Real-time Updates
                </span>{" "}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  size="sm"
                  startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm"
                  onPress={() => handleExport("csv")}
                >
                  <span className="sm:hidden">CSV</span>
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
                <Button
                  size="sm"
                  startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm"
                  onPress={() => handleExport("excel")}
                >
                  <span className="sm:hidden">Excel</span>
                  <span className="hidden sm:inline">Export Excel</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards - Mobile Responsive */}
        {currentSummary && (
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            {/* Total Users Card */}
            <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
              <div className="relative z-10 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                      Total {activeTab === "users" ? "Users" : "Admin Users"}
                    </p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {activeTab === "users"
                        ? (currentSummary as any)?.totalRegisteredUsers
                        : (currentSummary as any)?.totalAdminUsers}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Registered accounts
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl blur-xl"></div>
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {activeTab === "users" ? (
                        <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      ) : (
                        <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Type Distribution Card */}
            <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500"></div>
              <div className="relative z-10 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">
                      User Type Distribution
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {(activeTab === "users"
                        ? (currentSummary as any)?.userTypeBreakdown
                        : (currentSummary as any)?.adminTypeBreakdown
                      )?.map((type: any) => (
                        <div key={type._id} className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-sm"></div>
                          <Chip
                            size="sm"
                            color={userTypeColorMap[type._id] || "default"}
                            variant="flat"
                            className="relative bg-white/80 backdrop-blur-sm font-semibold text-xs"
                          >
                            {type._id}: {type.count}
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative sm:ml-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl sm:rounded-2xl blur-xl"></div>
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-lg sm:text-2xl">👥</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 group-hover:from-orange-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
              <div className="relative z-10 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">
                      Recent Activity
                    </p>
                    <div className="space-y-1 sm:space-y-2">
                      {currentSummary?.recentRegistrations
                        ?.slice(0, 3)
                        ?.map((reg: any) => (
                          <div
                            key={`${reg._id.year}-${reg._id.month}`}
                            className="flex items-center justify-between bg-white/60 rounded-lg px-2 sm:px-3 py-1 sm:py-2 hover:bg-white/80 transition-colors duration-200"
                          >
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              {reg._id.month}/{reg._id.year}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-orange-600">
                              {reg.count}
                            </span>
                          </div>
                        )) || (
                        <div className="text-xs sm:text-sm text-gray-500">
                          No recent activity
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative sm:ml-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl blur-xl"></div>
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-lg sm:text-2xl">📈</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Tabs Section - Mobile Responsive */}
        <div
          className="mb-6 sm:mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "400ms", animationFillMode: "both" }}
        >
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-1 sm:p-2">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-x"></div>

            {/* Glass Effect Overlay */}
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl">
              <Tabs
                aria-label="Customer types"
                selectedKey={activeTab}
                onSelectionChange={(key) => handleTabChange(key as string)}
                variant="underlined"
                size="lg"
                classNames={{
                  base: "w-full",
                  tabList:
                    "gap-1 sm:gap-2 w-full relative rounded-none p-2 sm:p-4 bg-transparent flex-col sm:flex-row",
                  cursor:
                    "w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 h-1 rounded-full shadow-lg",
                  tab: "max-w-full sm:max-w-fit px-4 sm:px-8 py-3 sm:py-4 h-auto font-semibold rounded-xl sm:rounded-2xl transition-all duration-500 hover:bg-white/30 hover:scale-105 hover:shadow-xl data-[selected=true]:bg-white/90 data-[selected=true]:shadow-xl data-[selected=true]:backdrop-blur-sm mb-2 sm:mb-0",
                  tabContent:
                    "group-data-[selected=true]:text-transparent group-data-[selected=true]:bg-gradient-to-r group-data-[selected=true]:from-blue-600 group-data-[selected=true]:via-purple-600 group-data-[selected=true]:to-pink-600 group-data-[selected=true]:bg-clip-text group-data-[selected=true]:font-bold group-data-[hover=true]:text-gray-700 text-gray-600",
                }}
              >
                <Tab
                  key="users"
                  title={
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm sm:text-base">
                          Normal Users
                        </div>
                        <div className="text-xs opacity-70 hidden sm:block">
                          Regular customers
                        </div>
                      </div>
                    </div>
                  }
                />
                <Tab
                  key="admins"
                  title={
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm sm:text-base">
                          Admin Users
                        </div>
                        <div className="text-xs opacity-70 hidden sm:block">
                          System administrators
                        </div>
                      </div>
                    </div>
                  }
                />
              </Tabs>
            </div>
          </div>
        </div>

        {/* Enhanced Table Container - Fully Mobile Responsive */}
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: "500ms", animationFillMode: "both" }}
        >
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600"></div>
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl transform translate-x-10 sm:translate-x-16 -translate-y-10 sm:-translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl transform -translate-x-8 sm:-translate-x-12 translate-y-8 sm:translate-y-12"></div>

            <div className="relative z-10 p-4 sm:p-6">
              {/* Table Header - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <span className="text-white text-lg sm:text-2xl">
                      {activeTab === "users" ? "👥" : "🛡️"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                      {activeTab === "users" ? "Normal Users" : "Admin Users"}{" "}
                      Management
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 truncate">
                      {activeTab === "users"
                        ? "Manage regular customer accounts and their information"
                        : "Oversee administrator accounts and permissions"}
                    </p>
                  </div>
                </div>

                {/* Export Buttons - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-4">
                  <Button
                    size="sm"
                    startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm"
                    onPress={() => handleExport("csv")}
                  >
                    <span className="sm:hidden">CSV</span>
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>
                  <Button
                    size="sm"
                    startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm"
                    onPress={() => handleExport("excel")}
                  >
                    <span className="sm:hidden">Excel</span>
                    <span className="hidden sm:inline">Export Excel</span>
                  </Button>
                </div>
              </div>

              {/* Table Container with Horizontal Scroll on Mobile */}
              <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg">
                <div className="min-w-full px-4 sm:px-0">
                  {/* Enhanced Help Section - Mobile Responsive */}
                  <div
                    className="mt-8 sm:mt-12 opacity-0 animate-fade-in-up"
                    style={{
                      animationDelay: "600ms",
                      animationFillMode: "both",
                    }}
                  >
                    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-4 sm:p-8 backdrop-blur-sm">
                      {/* Help Section Header - Mobile Responsive */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
                        <div className="flex items-center flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                            <span className="text-white text-lg sm:text-2xl">
                              💡
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                              Quick Tips
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
                              Get the most out of your customer management tools
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tips Grid - Mobile Responsive */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:bg-white/90">
                          <div className="flex items-center mb-2">
                            <span className="text-xl sm:text-2xl mr-2">🔍</span>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              Search Users
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Use the search bar to quickly find users by name,
                            email, or ID
                          </p>
                        </div>
                        <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:bg-white/90">
                          <div className="flex items-center mb-2">
                            <span className="text-xl sm:text-2xl mr-2">📊</span>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              Export Data
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Export user lists to CSV or Excel for external
                            analysis
                          </p>
                        </div>
                        <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:bg-white/90">
                          <div className="flex items-center mb-2">
                            <span className="text-xl sm:text-2xl mr-2">�</span>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              User Types
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Filter by user type to focus on specific customer
                            segments
                          </p>
                        </div>
                        <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:bg-white/90">
                          <div className="flex items-center mb-2">
                            <span className="text-xl sm:text-2xl mr-2">�</span>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              Analytics
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            View registration trends and user activity patterns
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                  <span className="font-semibold text-gray-900">
                    Export Data
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Export user lists to CSV or Excel for external analysis
                </p>
              </div>
              <div className="bg-white/80 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">👥</span>
                  <span className="font-semibold text-gray-900">
                    User Types
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Filter by user type to focus on specific customer segments
                </p>
              </div>
              <div className="bg-white/80 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📈</span>
                  <span className="font-semibold text-gray-900">Analytics</span>
                </div>
                <p className="text-sm text-gray-600">
                  View registration trends and user activity patterns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const { limit, updateLimit } = usePaginationLimit(10);

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
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer List</h1>
        </div>
        <PermissionDenied
          message="You don't have permission to view customer data. Please contact your super admin."
          onRetry={() => {
            refetchUsers();
            refetchAdminUsers();
          }}
        />
      </div>
    );
  }

  // Get current data based on active tab for summary
  const currentSummary =
    activeTab === "users"
      ? usersData?.data?.summary
      : adminUsersData?.data?.summary;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer List</h1>
        {/* <div className="flex gap-2">
          <Button
            startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
            variant="bordered"
            onPress={() => handleExport("csv")}
          >
            Export CSV
          </Button>
          <Button
            startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
            variant="bordered"
            onPress={() => handleExport("excel")}
          >
            Export Excel
          </Button>
        </div> */}
      </div>

      {/* Summary Cards */}
      {currentSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Total {activeTab === "users" ? "Users" : "Admin Users"}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {activeTab === "users"
                      ? (currentSummary as any)?.totalRegisteredUsers
                      : (currentSummary as any)?.totalAdminUsers}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  {activeTab === "users" ? (
                    <UserGroupIcon className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">User Type Breakdown</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(activeTab === "users"
                      ? (currentSummary as any)?.userTypeBreakdown
                      : (currentSummary as any)?.adminTypeBreakdown
                    )?.map((type: any) => (
                      <Chip
                        key={type._id}
                        size="sm"
                        color={userTypeColorMap[type._id] || "default"}
                        variant="flat"
                      >
                        {type._id}: {type.count}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent Registrations</p>
                  <div className="mt-1">
                    {currentSummary?.recentRegistrations
                      ?.slice(0, 3)
                      ?.map((reg: any) => (
                        <div
                          key={`${reg._id.year}-${reg._id.month}`}
                          className="text-xs text-gray-500"
                        >
                          {reg._id.month}/{reg._id.year}: {reg.count} users
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          aria-label="Customer types"
          selectedKey={activeTab}
          onSelectionChange={(key) => handleTabChange(key as string)}
        >
          <Tab key="users" title="Normal Users" />
          <Tab key="admins" title="Admin Users" />
        </Tabs>
      </div>

      {/* Conditional Table Components */}
      {activeTab === "users" ? (
        <NormalUsersTable
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userTypeFilter={userTypeFilter}
          onUserTypeFilterChange={setUserTypeFilter}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={updateLimit}
        />
      ) : (
        <AdminUsersTable
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userTypeFilter={userTypeFilter}
          onUserTypeFilterChange={setUserTypeFilter}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={updateLimit}
        />
      )}
    </div>
  );
}

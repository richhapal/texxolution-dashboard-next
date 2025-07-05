"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Badge,
  Tabs,
  Tab,
  Avatar,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from "@heroui/react";
import {
  MagnifyingGlassIcon as SearchIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useAppSelector } from "@/_lib/store/store";
import { toast } from "react-toastify";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import {
  useGetUsersQuery,
  useGetAdminUsersQuery,
  User,
  AdminUser,
} from "@/_lib/rtkQuery/customerRTKQuery";
import { formatDate } from "@/_lib/utils/utils";

// User type color mapping
const userTypeColorMap: Record<
  string,
  "success" | "warning" | "danger" | "default" | "primary"
> = {
  user: "primary",
  admin: "success",
  superadmin: "danger",
};

// HTTP method color mapping
const methodColorMap: Record<
  string,
  "success" | "warning" | "danger" | "default" | "primary"
> = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  DELETE: "danger",
  PATCH: "warning",
  DELTE: "danger", // Handle typo in API
  Error: "danger",
};
const userTypeOptions = [
  { key: "all", label: "All Types" },
  { key: "user", label: "User" },
  { key: "admin", label: "Admin" },
  { key: "superadmin", label: "Super Admin" },
];

export default function CustomerListPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | AdminUser | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get user data from Redux store
  const user = useAppSelector((state) => state.userSlice.user);

  // RTK Query hooks for normal users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsersQuery({
    page,
    limit: 10,
    userType: userTypeFilter === "all" ? undefined : userTypeFilter,
    searchTerm: searchTerm || undefined,
  });

  // RTK Query hooks for admin users
  const {
    data: adminUsersData,
    isLoading: isLoadingAdminUsers,
    error: adminUsersError,
    refetch: refetchAdminUsers,
  } = useGetAdminUsersQuery({
    page,
    limit: 10,
    userType:
      userTypeFilter === "all"
        ? undefined
        : (userTypeFilter as "admin" | "superadmin"),
    searchTerm: searchTerm || undefined,
  });

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  // Handle user type filter change
  const handleUserTypeFilterChange = (value: string) => {
    setUserTypeFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1); // Reset to first page when changing tabs
    setSearchTerm(""); // Clear search when switching tabs
    setUserTypeFilter("all"); // Reset filter when switching tabs
  };

  // Handle view user profile
  const handleViewProfile = (userItem: User | AdminUser) => {
    setSelectedUser(userItem);
    onOpen();
  };
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

  // Get current data based on active tab
  const currentData = activeTab === "users" ? usersData : adminUsersData;
  const currentUsers =
    activeTab === "users"
      ? usersData?.data?.users || []
      : adminUsersData?.data?.adminUsers || [];
  const currentPagination =
    activeTab === "users"
      ? usersData?.data?.pagination
      : adminUsersData?.data?.pagination;
  const currentSummary =
    activeTab === "users"
      ? usersData?.data?.summary
      : adminUsersData?.data?.summary;
  const isCurrentlyLoading =
    activeTab === "users" ? isLoadingUsers : isLoadingAdminUsers;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer List</h1>
        <div className="flex gap-2">
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
        </div>
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

      {/* Filters */}
      <Card className="mb-6 shadow-sm">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder={`Search ${
                activeTab === "users" ? "users" : "admin users"
              }...`}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              startContent={<SearchIcon className="w-4 h-4" />}
              className="flex-1"
            />
            <Select
              placeholder="Filter by user type"
              selectedKeys={[userTypeFilter]}
              onSelectionChange={(keys) =>
                handleUserTypeFilterChange(Array.from(keys)[0] as string)
              }
              className="w-full sm:w-48"
            >
              {userTypeOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm">
        <CardBody className="p-0">
          {activeTab === "users" ? (
            <Table aria-label="Users table">
              <TableHeader>
                <TableColumn width="200">USER</TableColumn>
                <TableColumn width="250">EMAIL</TableColumn>
                <TableColumn width="120">USER TYPE</TableColumn>
                <TableColumn width="150">CREATED AT</TableColumn>
                <TableColumn width="150">LAST UPDATED</TableColumn>
                <TableColumn width="100">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isCurrentlyLoading}
                loadingContent={<Spinner label="Loading users..." />}
                emptyContent="No users found"
              >
                {currentUsers.map((userItem: User | AdminUser) => (
                  <TableRow key={userItem._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={userItem.name}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium">{userItem.name}</p>
                          <p className="text-sm text-gray-500">
                            ID: {userItem._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{userItem.email}</div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={userTypeColorMap[userItem.userType] || "default"}
                        variant="flat"
                      >
                        {userItem.userType}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {formatDate(userItem.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {formatDate(userItem.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => handleViewProfile(userItem)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table aria-label="Admin users table">
              <TableHeader>
                <TableColumn width="200">USER</TableColumn>
                <TableColumn width="250">EMAIL</TableColumn>
                <TableColumn width="120">USER TYPE</TableColumn>
                <TableColumn width="200">PERMISSIONS</TableColumn>
                <TableColumn width="150">CREATED AT</TableColumn>
                <TableColumn width="150">LAST UPDATED</TableColumn>
                <TableColumn width="100">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isCurrentlyLoading}
                loadingContent={<Spinner label="Loading admin users..." />}
                emptyContent="No admin users found"
              >
                {currentUsers.map((userItem: User | AdminUser) => (
                  <TableRow key={userItem._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={userItem.name}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium">{userItem.name}</p>
                          <p className="text-sm text-gray-500">
                            ID: {userItem._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{userItem.email}</div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={userTypeColorMap[userItem.userType] || "default"}
                        variant="flat"
                      >
                        {userItem.userType}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(userItem as AdminUser).permissions
                          ?.slice(0, 2)
                          ?.map((permission, idx) => (
                            <Chip
                              key={idx}
                              size="sm"
                              variant="bordered"
                              className="text-xs"
                            >
                              {permission.path}
                            </Chip>
                          ))}
                        {(userItem as AdminUser).permissions?.length > 2 && (
                          <Chip
                            size="sm"
                            variant="bordered"
                            className="text-xs"
                          >
                            +{(userItem as AdminUser).permissions.length - 2}{" "}
                            more
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {formatDate(userItem.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {formatDate(userItem.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => handleViewProfile(userItem)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {currentPagination && currentPagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={currentPagination.totalPages}
            page={page}
            onChange={setPage}
            showControls
            showShadow
            color="primary"
          />
        </div>
      )}

      {/* User Profile Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Avatar
                name={selectedUser?.name}
                size="md"
                className="flex-shrink-0"
              />
              <div>
                <h2 className="text-xl font-semibold">{selectedUser?.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser?.email}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Full Name
                      </label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedUser.name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Email Address
                      </label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        User Type
                      </label>
                      <div className="flex items-center">
                        <Chip
                          size="sm"
                          color={
                            userTypeColorMap[selectedUser.userType] || "default"
                          }
                          variant="flat"
                        >
                          {selectedUser.userType}
                        </Chip>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        User ID
                      </label>
                      <p className="text-sm bg-gray-50 p-2 rounded font-mono">
                        {selectedUser._id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Created At
                      </label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Last Updated
                      </label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {formatDate(selectedUser.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin-specific Information */}
                {selectedUser.userType === "admin" ||
                selectedUser.userType === "superadmin" ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <KeyIcon className="w-5 h-5" />
                      Permissions & Roles
                    </h3>

                    {/* Assigned Roles */}
                    {(selectedUser as AdminUser).assignRoles &&
                      (selectedUser as AdminUser).assignRoles.length > 0 && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-gray-600 mb-2 block">
                            Assigned Roles
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(selectedUser as AdminUser).assignRoles.map(
                              (role, index) => (
                                <Chip
                                  key={index}
                                  size="sm"
                                  variant="bordered"
                                  color="primary"
                                >
                                  {role}
                                </Chip>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Permissions */}
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-3 block">
                        API Permissions
                      </label>
                      {(selectedUser as AdminUser).permissions &&
                      (selectedUser as AdminUser).permissions.length > 0 ? (
                        <div className="space-y-3">
                          {(selectedUser as AdminUser).permissions.map(
                            (permission, index) => (
                              <Card
                                key={index}
                                className="border border-gray-200"
                              >
                                <CardBody className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                          Endpoint:
                                        </span>
                                        <code className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                          {permission.path}
                                        </code>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">
                                          Methods:
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                          {permission.methods.map(
                                            (method, methodIndex) => (
                                              <Chip
                                                key={methodIndex}
                                                size="sm"
                                                color={
                                                  methodColorMap[method] ||
                                                  "default"
                                                }
                                                variant="flat"
                                                className="text-xs"
                                              >
                                                {method}
                                              </Chip>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <KeyIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No permissions assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Regular User Information */
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5" />
                      User Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(selectedUser as User).resetPasswordToken && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">
                            Reset Token Status
                          </label>
                          <div className="flex items-center gap-2">
                            <Chip size="sm" color="warning" variant="flat">
                              Active
                            </Chip>
                            <span className="text-xs text-gray-500">
                              Expires:{" "}
                              {(selectedUser as User).resetPasswordExpiry
                                ? formatDate(
                                    (selectedUser as User).resetPasswordExpiry!
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Account Status
                        </label>
                        <div className="flex items-center">
                          <Chip size="sm" color="success" variant="flat">
                            Active
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

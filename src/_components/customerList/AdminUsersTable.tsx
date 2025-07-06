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
  Avatar,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  MagnifyingGlassIcon as SearchIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  KeyIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  useGetAdminUsersQuery,
  AdminUser,
} from "@/_lib/rtkQuery/customerRTKQuery";
import { formatDate } from "@/_lib/utils/utils";
import { useAppSelector } from "@/_lib/store/store";

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

const adminUserTypeOptions = [
  { key: "all", label: "All Types" },
  { key: "admin", label: "Admin" },
  { key: "superadmin", label: "Super Admin" },
];

interface AdminUsersTableProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  userTypeFilter: string;
  onUserTypeFilterChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number | null;
  onLimitChange: (newLimit: number) => void;
}

export default function AdminUsersTable({
  searchTerm,
  onSearchChange,
  userTypeFilter,
  onUserTypeFilterChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
}: AdminUsersTableProps) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get current user to check permissions
  const currentUser = useAppSelector((state) => state.userSlice.user);

  // RTK Query hooks for admin users
  const {
    data: adminUsersData,
    isLoading: isLoadingAdminUsers,
    error: adminUsersError,
    refetch: refetchAdminUsers,
  } = useGetAdminUsersQuery(
    {
      page,
      limit: limit || 10,
      userType:
        userTypeFilter === "all"
          ? undefined
          : (userTypeFilter as "admin" | "superadmin"),
      searchTerm: searchTerm || undefined,
    },
    {
      skip: limit === null,
    }
  );

  // Handle view user profile
  const handleViewProfile = (userItem: AdminUser) => {
    setSelectedUser(userItem);
    onOpen();
  };

  // Handle copy user ID to clipboard
  const handleCopyUserId = async (userId: string, userName: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success(`${userName}'s ID copied to clipboard!`);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = userId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success(`${userName}'s ID copied to clipboard!`);
    }
  };

  // Handle manage permissions
  const handleManagePermissions = (userItem: AdminUser) => {
    if (currentUser?.userType !== "superadmin") {
      toast.error("Only Super Admins can manage permissions");
      return;
    }
    router.push(`/permissions?userId=${userItem._id}`);
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    onPageChange(1); // Reset to first page when searching
  };

  // Handle user type filter change
  const handleUserTypeFilterChange = (value: string) => {
    onUserTypeFilterChange(value);
    onPageChange(1); // Reset to first page when filtering
  };

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    onLimitChange(newLimit);
    onPageChange(1); // Reset to first page when changing limit
  };

  const currentUsers = adminUsersData?.data?.adminUsers || [];
  const currentPagination = adminUsersData?.data?.pagination;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Filters - Mobile Responsive */}
      <Card className="shadow-sm bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-white/60">
        <CardBody className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Input - Full width on mobile */}
            <div className="w-full">
              <Input
                placeholder="Search admin users by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                startContent={<SearchIcon className="w-4 h-4" />}
                className="w-full"
                size="sm"
                classNames={{
                  input: "text-sm",
                  inputWrapper:
                    "bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 focus-within:bg-white/90",
                }}
              />
            </div>

            {/* Filter Row - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select
                placeholder="Filter by user type"
                selectedKeys={[userTypeFilter]}
                onSelectionChange={(keys) =>
                  handleUserTypeFilterChange(Array.from(keys)[0] as string)
                }
                className="w-full sm:w-48"
                size="sm"
                classNames={{
                  trigger:
                    "bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 data-[open=true]:bg-white/90",
                }}
              >
                {adminUserTypeOptions.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>
              <Select
                placeholder="Items per page"
                selectedKeys={[limit?.toString() || "10"]}
                onSelectionChange={(keys) =>
                  handleLimitChange(parseInt(Array.from(keys)[0] as string))
                }
                className="w-full sm:w-32"
                size="sm"
                classNames={{
                  trigger:
                    "bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 data-[open=true]:bg-white/90",
                }}
              >
                <SelectItem key="5">5</SelectItem>
                <SelectItem key="10">10</SelectItem>
                <SelectItem key="20">20</SelectItem>
                <SelectItem key="50">50</SelectItem>
                <SelectItem key="100">100</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Enhanced Admin Users Table - Mobile Responsive */}
      <Card className="shadow-sm bg-white/80 backdrop-blur-sm border-white/50">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table
              aria-label="Admin users table"
              classNames={{
                wrapper: "min-h-[200px]",
                table: "min-w-[900px]", // Wider for admin actions
              }}
            >
              <TableHeader>
                <TableColumn width="200">USER</TableColumn>
                <TableColumn width="250" className="hidden sm:table-cell">
                  EMAIL
                </TableColumn>
                <TableColumn width="120">TYPE</TableColumn>
                <TableColumn width="150" className="hidden md:table-cell">
                  CREATED
                </TableColumn>
                <TableColumn width="150" className="hidden lg:table-cell">
                  UPDATED
                </TableColumn>
                <TableColumn width="130">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isLoadingAdminUsers}
                loadingContent={<Spinner label="Loading admin users..." />}
                emptyContent={
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <KeyIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      No admin users found
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                }
              >
                {currentUsers.map((userItem: AdminUser) => (
                  <TableRow key={userItem._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={userItem.name}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {userItem.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 truncate">
                              ID: {userItem._id.slice(-8)}
                            </p>
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              className="h-4 w-4 min-w-4"
                              onPress={() =>
                                handleCopyUserId(userItem._id, userItem.name)
                              }
                            >
                              <ClipboardDocumentIcon className="w-3 h-3" />
                            </Button>
                          </div>
                          {/* Show email on mobile when email column is hidden */}
                          <div className="sm:hidden">
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {userItem.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm truncate">{userItem.email}</div>
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
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm text-gray-600">
                        {formatDate(userItem.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm text-gray-600">
                        {formatDate(userItem.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => handleViewProfile(userItem)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        {currentUser?.userType === "superadmin" && (
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => handleManagePermissions(userItem)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-600"
                          >
                            <KeyIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Enhanced Pagination - Mobile Responsive */}
      {currentPagination && currentPagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Showing {(page - 1) * (limit || 10) + 1} to{" "}
            {Math.min(page * (limit || 10), currentPagination.totalAdminUsers)}{" "}
            of {currentPagination.totalAdminUsers} admin users
          </div>
          <div className="order-1 sm:order-2">
            <Pagination
              total={currentPagination.totalPages}
              page={page}
              onChange={onPageChange}
              showControls
              showShadow
              color="secondary"
              size="sm"
              classNames={{
                wrapper: "gap-0 overflow-visible h-8",
                item: "w-8 h-8 text-small rounded-none bg-transparent",
                cursor:
                  "bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg text-white font-bold",
              }}
            />
          </div>
        </div>
      )}

      {/* Admin User Profile Modal */}
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm bg-gray-50 p-2 rounded font-mono flex-1">
                          {selectedUser._id}
                        </p>
                        <Button
                          size="sm"
                          variant="bordered"
                          isIconOnly
                          onPress={() =>
                            handleCopyUserId(
                              selectedUser._id,
                              selectedUser.name
                            )
                          }
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </Button>
                      </div>
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
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <KeyIcon className="w-5 h-5" />
                    Permissions & Roles
                  </h3>

                  {/* Assigned Roles */}
                  {selectedUser.assignRoles &&
                    selectedUser.assignRoles.length > 0 && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Assigned Roles
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.assignRoles.map((role, index) => (
                            <Chip
                              key={index}
                              size="sm"
                              variant="bordered"
                              color="primary"
                            >
                              {role}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Permissions */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-3 block">
                      API Permissions
                    </label>
                    {selectedUser.permissions &&
                    selectedUser.permissions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.permissions.map((permission, index) => (
                          <Card key={index} className="border border-gray-200">
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
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <KeyIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No permissions assigned</p>
                      </div>
                    )}
                  </div>
                </div>
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

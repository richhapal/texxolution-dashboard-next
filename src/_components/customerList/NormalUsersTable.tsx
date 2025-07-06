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
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useGetUsersQuery, User } from "@/_lib/rtkQuery/customerRTKQuery";
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

const userTypeOptions = [
  { key: "all", label: "All Types" },
  { key: "user", label: "User" },
];

interface NormalUsersTableProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  userTypeFilter: string;
  onUserTypeFilterChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number | null;
  onLimitChange: (newLimit: number) => void;
}

export default function NormalUsersTable({
  searchTerm,
  onSearchChange,
  userTypeFilter,
  onUserTypeFilterChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
}: NormalUsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // RTK Query hooks for normal users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsersQuery(
    {
      page,
      limit: limit || 10,
      userType: userTypeFilter === "all" ? undefined : userTypeFilter,
      searchTerm: searchTerm || undefined,
    },
    {
      skip: limit === null,
    }
  );

  // Handle view user profile
  const handleViewProfile = (userItem: User) => {
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

  const currentUsers = usersData?.data?.users || [];
  const currentPagination = usersData?.data?.pagination;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Filters - Mobile Responsive */}
      <Card className="shadow-sm bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-white/60">
        <CardBody className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Input - Full width on mobile */}
            <div className="w-full">
              <Input
                placeholder="Search users by name, email, or ID..."
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
                {userTypeOptions.map((option) => (
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

      {/* Enhanced Users Table - Mobile Responsive */}
      <Card className="shadow-sm bg-white/80 backdrop-blur-sm border-white/50">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table
              aria-label="Users table"
              classNames={{
                wrapper: "min-h-[200px]",
                table: "min-w-[800px]", // Ensures table doesn't get too cramped
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
                <TableColumn width="100">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isLoadingUsers}
                loadingContent={<Spinner label="Loading users..." />}
                emptyContent={
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserGroupIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm">No users found</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                }
              >
                {currentUsers.map((userItem: User) => (
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
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => handleViewProfile(userItem)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
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
            {Math.min(page * (limit || 10), currentPagination.totalUsers)} of{" "}
            {currentPagination.totalUsers} users
          </div>
          <div className="order-1 sm:order-2">
            <Pagination
              total={currentPagination.totalPages}
              page={page}
              onChange={onPageChange}
              showControls
              showShadow
              color="primary"
              size="sm"
              classNames={{
                wrapper: "gap-0 overflow-visible h-8",
                item: "w-8 h-8 text-small rounded-none bg-transparent",
                cursor:
                  "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg text-white font-bold",
              }}
            />
          </div>
        </div>
      )}

      {/* Enhanced User Profile Modal - Mobile Responsive */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          wrapper: "p-4",
          base: "bg-white/95 backdrop-blur-sm border-white/50",
          header: "border-b border-gray-200/50",
          body: "py-6",
          footer: "border-t border-gray-200/50",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Avatar
                name={selectedUser?.name}
                size="md"
                className="flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold truncate">
                  {selectedUser?.name}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  {selectedUser?.email}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Full Name
                      </label>
                      <p className="text-sm bg-gray-50 p-2 rounded break-words">
                        {selectedUser.name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Email Address
                      </label>
                      <p className="text-sm bg-gray-50 p-2 rounded break-words">
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
                        <p className="text-sm bg-gray-50 p-2 rounded font-mono flex-1 truncate">
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
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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

                {/* User Details */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5" />
                    User Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {selectedUser.resetPasswordToken && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Reset Token Status
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Chip size="sm" color="warning" variant="flat">
                            Active
                          </Chip>
                          <span className="text-xs text-gray-500">
                            Expires:{" "}
                            {selectedUser.resetPasswordExpiry
                              ? formatDate(selectedUser.resetPasswordExpiry!)
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
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

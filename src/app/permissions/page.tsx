"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Checkbox,
  Spinner,
  Divider,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  ShieldCheckIcon,
  KeyIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useAppSelector } from "@/_lib/store/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import {
  useGetPermissionsListQuery,
  useGetAdminUserProfileQuery,
  useUpdateAdminPermissionsMutation,
  useRevokeAdminPermissionsMutation,
  Permission,
  PermissionWithCategory,
} from "@/_lib/rtkQuery/permissionsRTKQuery";

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
};

interface PermissionsPageProps {
  searchParams?: {
    userId?: string;
  };
}

export default function PermissionsPage({
  searchParams,
}: PermissionsPageProps) {
  const router = useRouter();
  const userId = searchParams?.userId;
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Revoke confirmation modal
  const {
    isOpen: isRevokeModalOpen,
    onOpen: onRevokeModalOpen,
    onClose: onRevokeModalClose,
  } = useDisclosure();

  // Get user data from Redux store
  const user = useAppSelector((state) => state.userSlice.user);

  // Check if user is superadmin
  const isSuperAdmin = user?.userType === "superadmin";

  // RTK Query hooks
  const {
    data: permissionsData,
    isLoading: isLoadingPermissions,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useGetPermissionsListQuery(undefined, {
    skip: !isSuperAdmin,
  });

  const {
    data: adminUserData,
    isLoading: isLoadingAdminUser,
    error: adminUserError,
    refetch: refetchAdminUser,
  } = useGetAdminUserProfileQuery(userId || "", {
    skip: !userId || !isSuperAdmin,
  });
  console.log("Admin User Data:", adminUserData);
  const [updatePermissions] = useUpdateAdminPermissionsMutation();
  const [revokePermissions] = useRevokeAdminPermissionsMutation();

  // Check if the admin user is a superadmin (cannot edit permissions)
  const isTargetUserSuperAdmin = adminUserData?.data?.userType === "superadmin";

  // Initialize selected permissions when admin user data is loaded
  React.useEffect(() => {
    if (adminUserData?.data?.permissions) {
      setSelectedPermissions(adminUserData?.data?.permissions);
    }
  }, [adminUserData]);

  // Handle permission toggle
  const handlePermissionToggle = (
    endpoint: PermissionWithCategory | undefined,
    method: string,
    checked: boolean
  ) => {
    if (!endpoint) return;

    setSelectedPermissions((prev) => {
      const existingPermissionIndex = prev.findIndex(
        (p) => p.path === endpoint.path
      );

      if (existingPermissionIndex >= 0) {
        // Permission exists, update methods
        const updatedPermissions = [...prev];
        const existingPermission = updatedPermissions[existingPermissionIndex];

        if (checked) {
          // Add method if not already present
          if (!existingPermission.methods.includes(method)) {
            updatedPermissions[existingPermissionIndex] = {
              ...existingPermission,
              methods: [...existingPermission.methods, method],
            };
          }
        } else {
          // Remove method - create new object
          const newMethods = existingPermission.methods.filter(
            (m) => m !== method
          );

          if (newMethods.length === 0) {
            // Remove permission if no methods left
            updatedPermissions.splice(existingPermissionIndex, 1);
          } else {
            updatedPermissions[existingPermissionIndex] = {
              ...existingPermission,
              methods: newMethods,
            };
          }
        }

        return updatedPermissions;
      } else if (checked) {
        // Add new permission
        return [...prev, { path: endpoint.path, methods: [method] }];
      }

      return prev;
    });
  };

  // Check if a specific method is selected for an endpoint
  const isMethodSelected = (
    endpoint: PermissionWithCategory | undefined,
    method: string
  ) => {
    if (!endpoint) return false;

    const permission = selectedPermissions.find(
      (p) => p.path === endpoint.path
    );
    return permission?.methods.includes(method) || false;
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    if (!userId) {
      toast.error("No user selected");
      return;
    }

    setIsUpdating(true);
    try {
      await updatePermissions({
        adminId: userId,
        permissions: selectedPermissions,
      }).unwrap();
      toast.success("Permissions updated successfully!");
      router.push("/customer-list");
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("You don't have permission to update permissions");
      } else {
        toast.error("Failed to update permissions. Please try again.");
      }
      console.error("Update permissions error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle revoke all permissions - open confirmation modal
  const handleRevokePermissions = () => {
    if (!userId) {
      toast.error("No user selected");
      return;
    }
    onRevokeModalOpen();
  };

  // Confirm revoke all permissions
  const confirmRevokePermissions = async () => {
    if (!userId) {
      toast.error("No user selected");
      return;
    }

    setIsUpdating(true);
    onRevokeModalClose(); // Close modal first

    try {
      await revokePermissions({
        adminId: userId,
      }).unwrap();
      toast.success("All permissions revoked successfully!");
      setSelectedPermissions([]); // Clear selected permissions
      refetchAdminUser(); // Refresh user data
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("You don't have permission to revoke permissions");
      } else {
        toast.error("Failed to revoke permissions. Please try again.");
      }
      console.error("Revoke permissions error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle 401 or permission denied
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <div className="container mx-auto p-6 relative z-10">
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 mb-8 shadow-xl border border-white/20">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Permissions Management
            </h1>
            <PermissionDenied
              message="Only Super Admins can access the permissions management page."
              onRetry={() => router.push("/customer-list")}
            />
          </div>
        </div>
      </div>
    );
  }

  if (
    (permissionsError &&
      "status" in permissionsError &&
      permissionsError.status === 401) ||
    (adminUserError &&
      "status" in adminUserError &&
      adminUserError.status === 401)
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <div className="container mx-auto p-6 relative z-10">
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 mb-8 shadow-xl border border-white/20">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Permissions Management
            </h1>
            <PermissionDenied
              message="You don't have permission to access permissions data."
              onRetry={() => {
                refetchPermissions();
                refetchAdminUser();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Header Section */}
        <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 mb-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Permissions Management
                </h1>
                {adminUserData && (
                  <p className="text-gray-600 mt-1 text-lg">
                    Managing permissions for{" "}
                    <span className="font-semibold text-blue-600">
                      {adminUserData?.data?.name}
                    </span>{" "}
                    ({adminUserData?.data?.email})
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="bordered"
                onPress={() => router.push("/customer-list")}
                className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                Back to Customer List
              </Button>
              <Button
                color="primary"
                onPress={handleSavePermissions}
                isLoading={isUpdating}
                isDisabled={!userId}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </div>{" "}
        {/* Admin User Info */}
        {adminUserData && (
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-6 mb-8 shadow-xl border border-white/20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Admin User Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 hover:shadow-md transition-all duration-300">
                <p className="text-sm text-gray-500 mb-2 font-medium">Name</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {adminUserData?.data?.name}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100/50 hover:shadow-md transition-all duration-300">
                <p className="text-sm text-gray-500 mb-2 font-medium">Email</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {adminUserData?.data?.email}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100/50 hover:shadow-md transition-all duration-300">
                <p className="text-sm text-gray-500 mb-2 font-medium">
                  User Type
                </p>
                <Chip
                  color={
                    adminUserData?.data?.userType === "superadmin"
                      ? "danger"
                      : "success"
                  }
                  variant="flat"
                  size="lg"
                  className="font-semibold"
                >
                  {adminUserData?.data?.userType}
                </Chip>
              </div>
            </div>
          </div>
        )}{" "}
        {/* Super Admin Warning */}
        {isTargetUserSuperAdmin && (
          <div className="backdrop-blur-sm bg-gradient-to-r from-amber-50/90 to-orange-50/90 rounded-3xl p-6 mb-8 shadow-xl border border-amber-200/50 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Super Admin Account
                </h3>
                <p className="text-amber-700 mt-1">
                  This user is a Super Admin. Their permissions cannot be
                  modified as they have full system access.
                </p>
              </div>
            </div>
          </div>
        )}{" "}
        {/* Permissions Summary */}
        {permissionsData && (
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-6 mb-8 shadow-xl border border-white/20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Permissions Summary
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(permissionsData.summary).map(
                ([category, count]) => (
                  <div
                    key={category}
                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 hover:shadow-md transition-all duration-300 text-center group"
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 capitalize font-medium mt-2">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        {/* Permissions List */}
        {isLoadingPermissions || isLoadingAdminUser ? (
          <div className="flex justify-center items-center py-16">
            <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
              <Spinner size="lg" label="Loading permissions..." />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {permissionsData?.endpointsByCategory &&
              Object.entries(permissionsData.endpointsByCategory).map(
                ([categoryKey, category]) => (
                  <div
                    key={categoryKey}
                    className="backdrop-blur-sm bg-white/70 rounded-3xl p-6 shadow-xl border border-white/20 animate-fade-in"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg">
                          <KeyIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          {category.showText}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">
                          {category.endpoints.length} endpoints
                        </span>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {category.endpoints.length}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {category.endpoints.map((endpoint, index) => {
                        const fullEndpoint = permissionsData.flatEndpoints.find(
                          (fe) =>
                            fe.path === endpoint.path &&
                            fe.category === categoryKey
                        );

                        // Skip if fullEndpoint is not found
                        if (!fullEndpoint) {
                          return null;
                        }

                        return (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-br from-gray-50/80 to-white/80 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="p-2 bg-gray-800 rounded-lg inline-block">
                                  <code className="text-sm text-white font-mono">
                                    {endpoint.path}
                                  </code>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {endpoint.methods.map((method) => (
                                <label
                                  key={method}
                                  className="flex items-center gap-3 cursor-pointer group"
                                >
                                  <Checkbox
                                    isSelected={isMethodSelected(
                                      fullEndpoint,
                                      method
                                    )}
                                    onValueChange={(checked) =>
                                      handlePermissionToggle(
                                        fullEndpoint,
                                        method,
                                        checked
                                      )
                                    }
                                    isDisabled={isTargetUserSuperAdmin}
                                    className="data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-blue-500 data-[selected=true]:to-purple-600"
                                  />
                                  <Chip
                                    color={methodColorMap[method] || "default"}
                                    variant="flat"
                                    size="md"
                                    className="group-hover:scale-105 transition-transform duration-200 font-semibold"
                                  >
                                    {method}
                                  </Chip>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
          </div>
        )}
        {/* Summary of Selected Permissions */}
        {selectedPermissions.length > 0 && (
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl p-6 mt-8 shadow-xl border border-white/20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Selected Permissions ({selectedPermissions.length})
              </h3>
            </div>
            <div className="space-y-3">
              {selectedPermissions.map((permission, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-100/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <code className="text-sm text-white font-mono">
                      {permission.path}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    {permission.methods.map((method) => (
                      <Chip
                        key={method}
                        color={methodColorMap[method] || "default"}
                        variant="flat"
                        size="md"
                        className="font-semibold"
                      >
                        {method}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="bordered"
            onPress={() => router.push("/customer-list")}
            className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
          >
            Cancel
          </Button>

          {!isTargetUserSuperAdmin && (
            <>
              <Button
                color="danger"
                variant="bordered"
                onPress={handleRevokePermissions}
                isDisabled={!userId || !adminUserData}
                className="border-red-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
              >
                Revoke All Permissions
              </Button>
              <Button
                color="primary"
                onPress={handleSavePermissions}
                isLoading={isUpdating}
                isDisabled={selectedPermissions.length === 0}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Save Permissions
              </Button>
            </>
          )}

          {isTargetUserSuperAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
              <ShieldCheckIcon className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Super Admin permissions cannot be modified
              </span>
            </div>
          )}
        </div>
        {/* Revoke Permissions Confirmation Modal */}
        <Modal
          isOpen={isRevokeModalOpen}
          onClose={onRevokeModalClose}
          size="lg"
          backdrop="blur"
          isDismissable={false}
          hideCloseButton
          className="backdrop-blur-sm"
        >
          <ModalContent className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <ModalHeader className="border-b border-gray-200/50 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-lg">
                  <XCircleIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    Revoke All Permissions
                  </h3>
                  <p className="text-gray-600 mt-1 font-medium">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-xl">
                  <p className="text-red-800 font-medium">
                    <strong>Warning:</strong> You are about to revoke all
                    permissions for <strong>{adminUserData?.data?.name}</strong>{" "}
                    ({adminUserData?.data?.email}).
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 font-medium">
                    This will remove access to:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100/50">
                      <p className="text-sm text-blue-800 font-medium">
                        • All API endpoints and methods
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100/50">
                      <p className="text-sm text-emerald-800 font-medium">
                        • Dashboard features and data
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100/50">
                      <p className="text-sm text-purple-800 font-medium">
                        • Administrative functions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl">
                  <p className="text-amber-800 font-medium">
                    The user will need to be assigned new permissions to access
                    the system again.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-gray-200/50 pt-4">
              <Button
                variant="light"
                onPress={onRevokeModalClose}
                isDisabled={isUpdating}
                className="hover:bg-gray-100 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={confirmRevokePermissions}
                isLoading={isUpdating}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Revoke All Permissions
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

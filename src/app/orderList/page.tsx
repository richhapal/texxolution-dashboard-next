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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import {
  MagnifyingGlassIcon as SearchIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/_lib/store/store";
import { toast } from "react-toastify";
import SafeImage from "@/_components/genericComponents/SafeImage";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import AnalyticsCards from "@/_components/orderList/AnalyticsCards";
import StatusBreakdown from "@/_components/orderList/StatusBreakdown";
import {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseStatusMutation,
  useUpdatePurchaseNotesMutation,
  useResendQuotationMutation,
  useExportPurchasesMutation,
  Purchase,
} from "@/_lib/rtkQuery/purchaseRTKQuery";
import { formatCurrency, formatDate } from "@/_lib/utils/utils";
import { usePaginationLimit } from "@/_lib/hooks/usePaginationLimit";

// Status color mapping
const statusColorMap: Record<
  string,
  "success" | "warning" | "danger" | "default" | "primary"
> = {
  pending: "warning",
  processing: "primary",
  shipped: "success",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

// Status options for filter
const statusOptions = [
  { key: "all", label: "All Status" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returned" },
];

export default function OrderListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Custom hook for pagination limit management
  const { limit, updateLimit } = usePaginationLimit(10, "order-list-limit");

  // Get user data from Redux store
  const user = useAppSelector((state) => state.userSlice.user);

  // RTK Query hooks
  const {
    data: purchasesData,
    isLoading: isLoadingPurchases,
    error: purchasesError,
    refetch: refetchPurchases,
  } = useGetPurchasesQuery(
    {
      page,
      limit: limit || 10,
      status: statusFilter === "all" ? undefined : statusFilter,
      searchTerm: searchTerm || undefined,
    },
    {
      skip: limit === null, // Skip the query until limit is loaded from localStorage
    }
  );

  const [updateStatus] = useUpdatePurchaseStatusMutation();
  const [updateNotes] = useUpdatePurchaseNotesMutation();
  const [resendQuotation] = useResendQuotationMutation();
  const [exportPurchases] = useExportPurchasesMutation();

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  // Handle view purchase details
  const handleViewPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    onOpen();
  };

  // Handle export
  const handleExport = async (format: "csv" | "excel") => {
    try {
      const result = await exportPurchases({
        format,
        filters: {
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      }).unwrap();
      const file = format === "csv" ? ".csv" : ".xlsx";

      // Create download link
      const url = window.URL.createObjectURL(result);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `purchases.${file}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} export completed successfully!`);
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

  // Handle status update
  const handleStatusUpdate = async (purchaseId: string, newStatus: string) => {
    try {
      await updateStatus({
        id: purchaseId,
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
        userName: user?.name || user?.email || "Unknown User",
      }).unwrap();
      refetchPurchases();
      toast.success(`Order status updated to ${newStatus} successfully!`);
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error(
          "You don't have permission to update order status. Please contact your super admin."
        );
      } else {
        toast.error("Status update failed. Please try again.");
        console.error("Status update failed:", error);
      }
    }
  };

  // Handle resend quotation
  const handleResendQuotation = async (purchaseId: string) => {
    try {
      await resendQuotation({ id: purchaseId }).unwrap();
      toast.success("Quotation resent successfully!");
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error(
          "You don't have permission to resend quotations. Please contact your super admin."
        );
      } else {
        toast.error("Failed to resend quotation. Please try again.");
        console.error("Resend quotation failed:", error);
      }
    }
  };

  // Handle 401 error for purchases
  if (
    purchasesError &&
    "status" in purchasesError &&
    purchasesError.status === 401
  ) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order List</h1>
        </div>
        <PermissionDenied
          message="You don't have permission to view order data. Please contact your super admin."
          onRetry={() => refetchPurchases()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>

      {/* Floating orbs - responsive sizing */}
      <div className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 relative z-10">
        {/* Header with mobile-friendly styling */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track and manage all your orders in one place
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
              variant="bordered"
              className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 min-h-[44px] sm:min-h-[40px] touch-manipulation"
              onPress={() => handleExport("csv")}
              size="sm"
            >
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button
              startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
              variant="bordered"
              className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 min-h-[44px] sm:min-h-[40px] touch-manipulation"
              onPress={() => handleExport("excel")}
              size="sm"
            >
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </Button>
          </div>
        </div>

        {/* Analytics Cards with enhanced animation */}
        <div
          className="mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "100ms", animationFillMode: "both" }}
        >
          <AnalyticsCards />
        </div>

        {/* Status Breakdown with enhanced animation */}
        <div
          className="mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
          <StatusBreakdown />
        </div>

        {/* Enhanced Filters Card - Mobile Optimized */}
        <Card
          className="mb-6 sm:mb-8 shadow-lg backdrop-blur-sm bg-white/80 border-0 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "300ms", animationFillMode: "both" }}
        >
          <CardBody className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                startContent={<SearchIcon className="w-4 h-4" />}
                className="w-full"
                classNames={{
                  input: "bg-transparent text-sm sm:text-base",
                  inputWrapper:
                    "bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors duration-200 min-h-[44px] sm:min-h-[40px]",
                }}
                size="sm"
              />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select
                  placeholder="Filter by status"
                  selectedKeys={[statusFilter]}
                  onSelectionChange={(keys) =>
                    handleStatusFilterChange(Array.from(keys)[0] as string)
                  }
                  className="w-full sm:flex-1"
                  classNames={{
                    trigger:
                      "bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors duration-200 min-h-[44px] sm:min-h-[40px]",
                    value: "text-sm sm:text-base",
                  }}
                  size="sm"
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
                <Select
                  placeholder="Items per page"
                  selectedKeys={limit ? [limit.toString()] : []}
                  onSelectionChange={(keys) => {
                    const selectedLimit = Array.from(keys)[0] as string;
                    if (selectedLimit) {
                      updateLimit(parseInt(selectedLimit, 10));
                      setPage(1);
                    }
                  }}
                  className="w-full sm:w-32"
                  classNames={{
                    trigger:
                      "bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors duration-200 min-h-[44px] sm:min-h-[40px]",
                    value: "text-sm sm:text-base",
                  }}
                  size="sm"
                >
                  <SelectItem key="10">10</SelectItem>
                  <SelectItem key="25">25</SelectItem>
                  <SelectItem key="50">50</SelectItem>
                  <SelectItem key="100">100</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Enhanced Orders Table - Mobile Responsive */}
        <Card
          className="shadow-xl backdrop-blur-sm bg-white/90 border-0 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "400ms", animationFillMode: "both" }}
        >
          <CardBody className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table aria-label="Orders table" className="min-h-[400px]">
                <TableHeader>
                  <TableColumn width="120">ORDER ID</TableColumn>
                  <TableColumn width="200">CUSTOMER</TableColumn>
                  <TableColumn width="80">ITEMS</TableColumn>
                  <TableColumn width="120">TOTAL</TableColumn>
                  <TableColumn width="100">STATUS</TableColumn>
                  <TableColumn width="120">DATE</TableColumn>
                  <TableColumn width="120">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                  isLoading={isLoadingPurchases}
                  loadingContent={<Spinner label="Loading orders..." />}
                  emptyContent={
                    <div className="text-center py-16">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto blur-2xl opacity-50"></div>
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4 relative z-10" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Orders Found
                      </h3>
                      <p className="text-gray-500 mb-6">
                        There are no orders matching your current filters.
                      </p>
                      <Button
                        color="primary"
                        variant="flat"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setPage(1);
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  }
                >
                  {purchasesData?.data?.purchases?.map((purchase, index) => (
                    <TableRow
                      key={purchase._id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
                    >
                      <TableCell>
                        <div className="font-mono text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                          {purchase.purchaseId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium truncate text-gray-900">
                            {purchase.customerDetails.name}
                          </div>
                          <div
                            className="text-sm text-gray-500 truncate"
                            title={purchase.customerDetails.email}
                          >
                            {purchase.customerDetails.email.length > 30
                              ? `${purchase.customerDetails.email.substring(
                                  0,
                                  30
                                )}...`
                              : purchase.customerDetails.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <Badge
                            content={purchase.totalItems}
                            color="primary"
                            size="sm"
                            className="hover:scale-110 transition-transform duration-200"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <ShoppingCartIcon className="w-5 h-5 text-white" />
                            </div>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          {formatCurrency(purchase.totalAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={statusColorMap[purchase.status] || "default"}
                          variant="flat"
                          size="sm"
                          className="hover:scale-105 transition-transform duration-200"
                        >
                          {purchase.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(purchase.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => handleViewPurchase(purchase)}
                            className="hover:scale-110 transition-transform duration-200 hover:bg-blue-50"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                className="hover:scale-110 transition-transform duration-200 hover:bg-gray-50"
                              >
                                <EllipsisVerticalIcon className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu className="backdrop-blur-sm bg-white/90">
                              <DropdownItem
                                key="pending"
                                onPress={() =>
                                  handleStatusUpdate(
                                    purchase.purchaseId,
                                    "pending"
                                  )
                                }
                              >
                                Mark as Pending
                              </DropdownItem>
                              <DropdownItem
                                key="processing"
                                onPress={() =>
                                  handleStatusUpdate(
                                    purchase.purchaseId,
                                    "processing"
                                  )
                                }
                              >
                                Mark as Processing
                              </DropdownItem>
                              <DropdownItem
                                key="shipped"
                                onPress={() =>
                                  handleStatusUpdate(
                                    purchase.purchaseId,
                                    "shipped"
                                  )
                                }
                              >
                                Mark as Shipped
                              </DropdownItem>
                              <DropdownItem
                                key="delivered"
                                onPress={() =>
                                  handleStatusUpdate(
                                    purchase.purchaseId,
                                    "delivered"
                                  )
                                }
                              >
                                Mark as Delivered
                              </DropdownItem>
                              <DropdownItem
                                key="resend"
                                onPress={() =>
                                  handleResendQuotation(purchase.purchaseId)
                                }
                              >
                                Resend Quotation
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {isLoadingPurchases ? (
                <div className="flex justify-center items-center py-16">
                  <Spinner label="Loading orders..." />
                </div>
              ) : purchasesData?.data?.purchases?.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 mx-auto blur-2xl opacity-50"></div>
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4 relative z-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Orders Found
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm">
                    There are no orders matching your current filters.
                  </p>
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 p-3 sm:p-4">
                  {purchasesData?.data?.purchases?.map((purchase, index) => (
                    <div
                      key={purchase._id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-mono text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                            {purchase.purchaseId}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(purchase.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip
                            color={statusColorMap[purchase.status] || "default"}
                            variant="flat"
                            size="sm"
                            className="text-xs"
                          >
                            {purchase.status}
                          </Chip>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                className="min-w-8 h-8 touch-manipulation"
                              >
                                <EllipsisVerticalIcon className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu className="backdrop-blur-sm bg-white/90">
                              <DropdownItem
                                key="pending"
                                onPress={() =>
                                  handleStatusUpdate(
                                    purchase.purchaseId,
                                    "pending"
                                  )
                                }
                              >
                                Mark as Pending
                              </DropdownItem>
                              <DropdownItem
                                key="processing"
                                onPress={() =>
                                  handleStatusUpdate(
                                    purchase.purchaseId,
                                    "processing"
                                  )
                                }
                              >
                                Mark as Processing
                              </DropdownItem>
                              <DropdownItem
                                key="shipped"
                                onPress={() =>
                                  handleStatusUpdate(
                                    purchase.purchaseId,
                                    "shipped"
                                  )
                                }
                              >
                                Mark as Shipped
                              </DropdownItem>
                              <DropdownItem
                                key="delivered"
                                onPress={() =>
                                  handleStatusUpdate(
                                    purchase.purchaseId,
                                    "delivered"
                                  )
                                }
                              >
                                Mark as Delivered
                              </DropdownItem>
                              <DropdownItem
                                key="resend"
                                onPress={() =>
                                  handleResendQuotation(purchase.purchaseId)
                                }
                              >
                                Resend Quotation
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {purchase.customerDetails.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {purchase.customerDetails.email}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <Badge
                              content={purchase.totalItems}
                              color="primary"
                              size="sm"
                              className="scale-90"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <ShoppingCartIcon className="w-4 h-4 text-white" />
                              </div>
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {purchase.totalItems} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {formatCurrency(purchase.totalAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<EyeIcon className="w-4 h-4" />}
                          onPress={() => handleViewPurchase(purchase)}
                          className="w-full touch-manipulation min-h-[44px]"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Enhanced Pagination - Mobile Optimized */}
        {purchasesData?.data?.pagination && (
          <div
            className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-3 sm:gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "500ms", animationFillMode: "both" }}
          >
            <div className="text-xs sm:text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full order-2 sm:order-1">
              Showing {(page - 1) * (limit || 10) + 1} to{" "}
              {Math.min(
                page * (limit || 10),
                purchasesData.data.pagination.totalPurchases || 0
              )}{" "}
              of {purchasesData.data.pagination.totalPurchases || 0} orders
            </div>
            <div className="order-1 sm:order-2">
              <Pagination
                total={purchasesData.data.pagination.totalPages || 1}
                page={page}
                onChange={setPage}
                showControls
                showShadow
                size="sm"
                classNames={{
                  wrapper: "backdrop-blur-sm bg-white/80 gap-1 sm:gap-2",
                  item: "hover:scale-105 transition-transform duration-200 min-w-8 h-8 sm:min-w-10 sm:h-10",
                  cursor: "bg-gradient-to-r from-blue-500 to-purple-600",
                  prev: "min-w-8 h-8 sm:min-w-10 sm:h-10",
                  next: "min-w-8 h-8 sm:min-w-10 sm:h-10",
                }}
              />
            </div>
          </div>
        )}

        {/* Enhanced Purchase Detail Modal - Mobile Optimized */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="4xl"
          scrollBehavior="inside"
          backdrop="blur"
          classNames={{
            wrapper: "backdrop-blur-sm p-3 sm:p-4",
            backdrop: "bg-gradient-to-br from-blue-900/20 to-purple-900/20",
            base: "bg-white/95 backdrop-blur-sm mx-2 sm:mx-4 my-2 sm:my-4",
            header: "border-b border-gray-100 p-4 sm:p-6",
            body: "p-4 sm:p-6",
            footer: "border-t border-gray-100 p-4 sm:p-6",
          }}
        >
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 font-mono">
                    {selectedPurchase?.purchaseId}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedPurchase && (
                <div className="space-y-6 sm:space-y-8">
                  {/* Customer Details */}
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Name
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {selectedPurchase.customerDetails.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Email
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900 break-all">
                          {selectedPurchase.customerDetails.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Country
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {selectedPurchase.customerDetails.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Status
                        </p>
                        <Chip
                          color={
                            statusColorMap[selectedPurchase.status] || "default"
                          }
                          variant="flat"
                          size="sm"
                          className="text-xs"
                        >
                          {selectedPurchase.status}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Order Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Total Items
                        </p>
                        <p className="font-bold text-lg sm:text-xl text-gray-900">
                          {selectedPurchase.totalItems}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <p className="font-bold text-lg sm:text-xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          {formatCurrency(selectedPurchase.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Order Date
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {formatDate(selectedPurchase.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Items
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedPurchase.items.map((item, index) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex-shrink-0">
                            <SafeImage
                              src={item.thumbnail}
                              alt={item.productName}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                              {item.productName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">
                              {item.category}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Size: {item.size} | Color: {item.color}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm sm:text-lg text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status History */}
                  {selectedPurchase.statusHistory &&
                    selectedPurchase.statusHistory.length > 0 && (
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Status History
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {selectedPurchase.statusHistory.map(
                            (history, index) => (
                              <div
                                key={history._id}
                                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                              >
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm sm:text-base text-gray-900">
                                    {history.status}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                                    {history.notes}
                                  </p>
                                </div>
                                <div className="text-right text-xs sm:text-sm text-gray-500 flex-shrink-0">
                                  <p>{formatDate(history.updatedAt)}</p>
                                  <p>By: {history.updatedBy}</p>
                                  <p>
                                    Name:{" "}
                                    {history.updatedByName || "Unknown Admin"}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 min-h-[44px] sm:min-h-[40px] touch-manipulation"
                size="sm"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

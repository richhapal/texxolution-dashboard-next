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

      {/* Floating orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Header with enhanced styling */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-gray-600">
              Track and manage all your orders in one place
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
              variant="bordered"
              className="hover:scale-105 transition-transform duration-200"
              onPress={() => handleExport("csv")}
            >
              Export CSV
            </Button>
            <Button
              startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
              variant="bordered"
              className="hover:scale-105 transition-transform duration-200"
              onPress={() => handleExport("excel")}
            >
              Export Excel
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

        {/* Enhanced Filters Card */}
        <Card
          className="mb-8 shadow-lg backdrop-blur-sm bg-white/80 border-0 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "300ms", animationFillMode: "both" }}
        >
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                startContent={<SearchIcon className="w-4 h-4" />}
                className="flex-1"
                classNames={{
                  input: "bg-transparent",
                  inputWrapper:
                    "bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors duration-200",
                }}
              />
              <Select
                placeholder="Filter by status"
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) =>
                  handleStatusFilterChange(Array.from(keys)[0] as string)
                }
                className="w-full sm:w-48"
                classNames={{
                  trigger:
                    "bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors duration-200",
                }}
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
                    "bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors duration-200",
                }}
              >
                <SelectItem key="10">10</SelectItem>
                <SelectItem key="25">25</SelectItem>
                <SelectItem key="50">50</SelectItem>
                <SelectItem key="100">100</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Enhanced Orders Table */}
        <Card
          className="shadow-xl backdrop-blur-sm bg-white/90 border-0 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "400ms", animationFillMode: "both" }}
        >
          <CardBody className="p-0">
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
          </CardBody>
        </Card>

        {/* Enhanced Pagination */}
        {purchasesData?.data?.pagination && (
          <div
            className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "500ms", animationFillMode: "both" }}
          >
            <div className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              Showing {(page - 1) * (limit || 10) + 1} to{" "}
              {Math.min(
                page * (limit || 10),
                purchasesData.data.pagination.totalPurchases || 0
              )}{" "}
              of {purchasesData.data.pagination.totalPurchases || 0} orders
            </div>
            <Pagination
              total={purchasesData.data.pagination.totalPages || 1}
              page={page}
              onChange={setPage}
              showControls
              showShadow
              classNames={{
                wrapper: "backdrop-blur-sm bg-white/80",
                item: "hover:scale-105 transition-transform duration-200",
                cursor: "bg-gradient-to-r from-blue-500 to-purple-600",
              }}
            />
          </div>
        )}

        {/* Enhanced Purchase Detail Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="4xl"
          scrollBehavior="inside"
          backdrop="blur"
          classNames={{
            wrapper: "backdrop-blur-sm",
            backdrop: "bg-gradient-to-br from-blue-900/20 to-purple-900/20",
            base: "bg-white/95 backdrop-blur-sm",
          }}
        >
          <ModalContent>
            <ModalHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">
                    {selectedPurchase?.purchaseId}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="p-6">
              {selectedPurchase && (
                <div className="space-y-8">
                  {/* Customer Details */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Name</p>
                        <p className="font-medium text-gray-900">
                          {selectedPurchase.customerDetails.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium text-gray-900">
                          {selectedPurchase.customerDetails.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Country</p>
                        <p className="font-medium text-gray-900">
                          {selectedPurchase.customerDetails.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <Chip
                          color={
                            statusColorMap[selectedPurchase.status] || "default"
                          }
                          variant="flat"
                          size="sm"
                        >
                          {selectedPurchase.status}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Order Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Items
                        </p>
                        <p className="font-bold text-xl text-gray-900">
                          {selectedPurchase.totalItems}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <p className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          {formatCurrency(selectedPurchase.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(selectedPurchase.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Items
                    </h3>
                    <div className="space-y-3">
                      {selectedPurchase.items.map((item, index) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex-shrink-0">
                            <SafeImage
                              src={item.thumbnail}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              {item.category}
                            </p>
                            <p className="text-sm text-gray-500">
                              Size: {item.size} | Color: {item.color}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </p>
                            <p className="text-sm text-gray-500">
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Status History
                        </h3>
                        <div className="space-y-3">
                          {selectedPurchase.statusHistory.map(
                            (history, index) => (
                              <div
                                key={history._id}
                                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                              >
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {history.status}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {history.notes}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
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
            <ModalFooter className="border-t border-gray-100">
              <Button
                variant="light"
                onPress={onClose}
                className="hover:scale-105 transition-transform duration-200"
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

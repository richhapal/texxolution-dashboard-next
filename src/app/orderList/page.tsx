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

  // Get user data from Redux store
  const user = useAppSelector((state) => state.userSlice.user);

  // RTK Query hooks
  const {
    data: purchasesData,
    isLoading: isLoadingPurchases,
    error: purchasesError,
    refetch: refetchPurchases,
  } = useGetPurchasesQuery({
    page,
    limit: 10,
    status: statusFilter === "all" ? undefined : statusFilter,
    searchTerm: searchTerm || undefined,
  });

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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order List</h1>
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

      {/* Analytics Cards */}
      <AnalyticsCards />

      {/* Status Breakdown */}
      <StatusBreakdown />

      {/* Filters */}
      <Card className="mb-6 shadow-sm">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              startContent={<SearchIcon className="w-4 h-4" />}
              className="flex-1"
            />
            <Select
              placeholder="Filter by status"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) =>
                handleStatusFilterChange(Array.from(keys)[0] as string)
              }
              className="w-full sm:w-48"
            >
              {statusOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-sm">
        <CardBody className="p-0">
          <Table aria-label="Orders table">
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
              emptyContent="No orders found"
            >
              {purchasesData?.data?.purchases?.map((purchase) => (
                <TableRow key={purchase._id}>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {purchase.purchaseId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="font-medium truncate">
                        {purchase.customerDetails.name}
                      </div>
                      <div
                        className="text-sm text-gray-600 truncate"
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
                      >
                        <ShoppingCartIcon className="w-5 h-5" />
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {formatCurrency(purchase.totalAmount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={statusColorMap[purchase.status] || "default"}
                      variant="flat"
                      size="sm"
                    >
                      {purchase.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
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
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button size="sm" variant="light" isIconOnly>
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="pending"
                            onPress={() =>
                              handleStatusUpdate(purchase.purchaseId, "pending")
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
                              handleStatusUpdate(purchase.purchaseId, "shipped")
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

      {/* Pagination */}
      {purchasesData?.data?.pagination && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={purchasesData.data.pagination.totalPages || 1}
            page={page}
            onChange={setPage}
            showControls
            showShadow
          />
        </div>
      )}

      {/* Purchase Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-semibold">
              Order Details - {selectedPurchase?.purchaseId}
            </h2>
          </ModalHeader>
          <ModalBody>
            {selectedPurchase && (
              <div className="space-y-6">
                {/* Customer Details */}
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedPurchase.customerDetails.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">
                        {selectedPurchase.customerDetails.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-medium">
                        {selectedPurchase.customerDetails.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
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
                <div>
                  <h3 className="text-lg font-medium mb-3">Order Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="font-medium">
                        {selectedPurchase.totalItems}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium">
                        {formatCurrency(selectedPurchase.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">
                        {formatDate(selectedPurchase.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Items</h3>
                  <div className="space-y-3">
                    {selectedPurchase.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <SafeImage
                            src={item.thumbnail}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {item.category}
                          </p>
                          <p className="text-sm text-gray-600">
                            Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.totalPrice)}
                          </p>
                          <p className="text-sm text-gray-600">
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
                      <h3 className="text-lg font-medium mb-3">
                        Status History
                      </h3>
                      <div className="space-y-3">
                        {selectedPurchase.statusHistory.map((history) => (
                          <div
                            key={history._id}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{history.status}</p>
                              <p className="text-sm text-gray-600">
                                {history.notes}
                              </p>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <p>{formatDate(history.updatedAt)}</p>
                              <p>By: {history.updatedBy}</p>
                              <p>
                                Name: {history.updatedByName || "Unknown Admin"}
                              </p>
                            </div>
                          </div>
                        ))}
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

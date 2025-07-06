"use client";

import React from "react";
import { Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";
import { useGetPurchaseAnalyticsQuery } from "@/_lib/rtkQuery/purchaseRTKQuery";
import { formatCurrency } from "@/_lib/utils/utils";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";

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

export default function StatusBreakdown() {
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch,
  } = useGetPurchaseAnalyticsQuery();

  if (isLoadingAnalytics) {
    return (
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Status Breakdown</h3>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-20">
            <Spinner size="sm" />
          </div>
        </CardBody>
      </Card>
    );
  }

  // Handle 401 Unauthorized error
  if (
    analyticsError &&
    "status" in analyticsError &&
    analyticsError.status === 401
  ) {
    return (
      <div className="mb-6">
        <PermissionDenied
          message="You don't have permission to view status breakdown data. Please contact your super admin."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (analyticsError || !analyticsData?.data?.statusBreakdown) {
    return null;
  }

  return (
    <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <h3 className="text-base sm:text-lg font-semibold">Status Breakdown</h3>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {analyticsData.data.statusBreakdown.map((status) => (
            <div
              key={status._id}
              className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg"
            >
              <Chip
                color={statusColorMap[status._id] || "default"}
                variant="flat"
                size="sm"
                className="flex-shrink-0"
              >
                {status._id}
              </Chip>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm text-gray-600 block">
                  {status.count} orders
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 block truncate">
                  {formatCurrency(status.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

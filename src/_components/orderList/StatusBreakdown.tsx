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
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">Status Breakdown</h3>
      </CardHeader>
      <CardBody>
        <div className="flex flex-wrap gap-4">
          {analyticsData.data.statusBreakdown.map((status) => (
            <div key={status._id} className="flex items-center gap-2">
              <Chip
                color={statusColorMap[status._id] || "default"}
                variant="flat"
                size="sm"
              >
                {status._id}
              </Chip>
              <span className="text-sm text-gray-600">
                {status.count} orders ({formatCurrency(status.revenue)})
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

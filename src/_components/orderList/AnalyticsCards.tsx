"use client";

import React from "react";
import { Card, CardBody, Spinner } from "@heroui/react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Package } from "lucide-react";
import { useGetPurchaseAnalyticsQuery } from "@/_lib/rtkQuery/purchaseRTKQuery";
import { formatCurrency } from "@/_lib/utils/utils";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";

export default function AnalyticsCards() {
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch,
  } = useGetPurchaseAnalyticsQuery();

  // Analytics cards configuration
  const analyticsCards = [
    {
      title: "Total Orders",
      value: analyticsData?.data?.summary?.totalPurchases || 0,
      icon: <ShoppingCartIcon className="w-6 h-6" />,
      color: "primary" as const,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(analyticsData?.data?.summary?.totalRevenue || 0),
      icon: (
        <span className="w-6 h-6 flex items-center justify-center text-lg font-bold">
          ₹
        </span>
      ),
      color: "success" as const,
    },
    {
      title: "Total Items",
      value: analyticsData?.data?.summary?.totalItems || 0,
      icon: <Package className="w-6 h-6" />,
      color: "warning" as const,
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(
        analyticsData?.data?.summary?.averageOrderValue || 0
      ),
      icon: (
        <span className="w-6 h-6 flex items-center justify-center text-lg font-bold">
          ₹
        </span>
      ),
      color: "secondary" as const,
    },
  ];

  if (isLoadingAnalytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-center h-20">
                <Spinner size="sm" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
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
          message="You don't have permission to view analytics data. Please contact your super admin."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm col-span-full">
          <CardBody className="p-4">
            <div className="text-center text-red-500">
              Failed to load analytics data
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {analyticsCards.map((card, index) => (
        <Card
          key={index}
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {card.title}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 text-gray-900 truncate">
                  {card.value}
                </p>
              </div>
              <div
                className={`p-2 sm:p-3 rounded-full bg-${card.color}-100 flex-shrink-0 ml-2`}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">
                  {card.icon}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

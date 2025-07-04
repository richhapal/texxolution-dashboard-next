import React from "react";
import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react";

interface StatCardSkeletonProps {
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({
  className = "",
}) => {
  return (
    <Card
      className={`bg-gradient-to-r from-gray-300 to-gray-400 text-white ${className}`}
    >
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-gray-200/50 rounded" />
            <Skeleton className="h-8 w-16 bg-gray-200/50 rounded" />
          </div>
          <Skeleton className="w-8 h-8 bg-gray-200/50 rounded" />
        </div>
      </CardBody>
    </Card>
  );
};

interface CategoryCardSkeletonProps {
  className?: string;
}

export const CategoryCardSkeleton: React.FC<CategoryCardSkeletonProps> = ({
  className = "",
}) => {
  return (
    <Card
      className={`hover:shadow-lg transition-all duration-300 h-full border-0 shadow-md ${className}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="w-5 h-5 rounded" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

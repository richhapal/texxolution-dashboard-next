"use client";

import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import {
  ExclamationTriangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

interface PermissionDeniedProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function PermissionDenied({
  message = "You don't have permission to access this resource. Please contact your super admin.",
  onRetry,
  showRetry = true,
}: PermissionDeniedProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full shadow-lg">
        <CardBody className="text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600 mb-6">{message}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              color="primary"
              variant="flat"
              startContent={<EnvelopeIcon className="w-4 h-4" />}
              onPress={() => {
                // You can customize this to open email client or contact form
                window.location.href =
                  "mailto:admin@texxolution.com?subject=Access Request";
              }}
            >
              Contact Admin
            </Button>

            {showRetry && onRetry && (
              <Button color="default" variant="bordered" onPress={onRetry}>
                Try Again
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

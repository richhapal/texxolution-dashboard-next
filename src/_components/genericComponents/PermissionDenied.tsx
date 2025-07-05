"use client";

import React from "react";
import { Button } from "@heroui/react";
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
      <div className="max-w-md w-full backdrop-blur-sm bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow-lg">
              <ExclamationTriangleIcon className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3">
            Access Denied
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Contact Admin
            </Button>

            {showRetry && onRetry && (
              <Button
                color="default"
                variant="bordered"
                onPress={onRetry}
                className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Image as ImageIcon, Upload, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onUploadClick: () => void;
  uploadMode: "single" | "multiple";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onUploadClick,
  uploadMode,
}) => {
  return (
    <Card className="shadow-lg">
      <CardBody className="text-center py-16 px-8">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-300" />
            <Sparkles className="w-6 h-6 text-blue-500 absolute -top-2 -right-2 animate-bounce" />
          </div>
        </div>

        {/* Main Message */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          No images uploaded yet
        </h3>

        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          {uploadMode === "single"
            ? "Upload your first image to get started. Perfect for profile pictures, logos, or featured images."
            : "Start building your image gallery. Upload multiple images at once or add them one by one."}
        </p>

        {/* Action Button */}
        <Button
          color="primary"
          size="lg"
          onClick={onUploadClick}
          startContent={<Upload className="w-5 h-5" />}
          className="font-medium px-8"
        >
          Upload Your First Image
        </Button>

        {/* Features List */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">What you can do:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Drag & drop upload</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Get S3 URLs instantly</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Copy links to clipboard</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

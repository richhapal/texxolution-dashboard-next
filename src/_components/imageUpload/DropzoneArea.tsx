"use client";

import React, { useCallback } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Upload, Cloud, FileImage } from "lucide-react";

interface DropzoneAreaProps {
  dragActive: boolean;
  uploadMode: "single" | "multiple";
  onFileSelect: (files: FileList | null) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  disabled?: boolean;
}

export const DropzoneArea: React.FC<DropzoneAreaProps> = ({
  dragActive,
  uploadMode,
  onFileSelect,
  onDrag,
  onDrop,
  disabled = false,
}) => {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFileSelect(e.target.files);
    },
    [onFileSelect]
  );

  return (
    <Card className="mb-6">
      <CardBody className="p-6">
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : dragActive
              ? "border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
          onDragEnter={disabled ? undefined : onDrag}
          onDragLeave={disabled ? undefined : onDrag}
          onDragOver={disabled ? undefined : onDrag}
          onDrop={disabled ? undefined : onDrop}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-8 gap-2 h-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="bg-gray-400 rounded-full w-1 h-1"></div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-4">
              {dragActive ? (
                <Cloud className="w-16 h-16 text-blue-500 mx-auto animate-bounce" />
              ) : (
                <Upload className="w-16 h-16 text-gray-400 mx-auto" />
              )}
            </div>

            {/* Main Text */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {dragActive ? "Drop your images here!" : "Upload your images"}
            </h3>

            {/* Description */}
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">
                Drag and drop your images here, or click the button below to
                browse
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileImage className="w-4 h-4" />
                  <span>JPG, PNG, WebP</span>
                </div>
                <span>•</span>
                <span>Max 10MB each</span>
                {uploadMode === "multiple" && (
                  <>
                    <span>•</span>
                    <span>Multiple files supported</span>
                  </>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <input
              type="file"
              multiple={uploadMode === "multiple"}
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              id="file-upload"
              disabled={disabled}
            />
            <label htmlFor="file-upload">
              <Button
                color="primary"
                variant={dragActive ? "solid" : "flat"}
                as="span"
                size="lg"
                disabled={disabled}
                startContent={<Upload className="w-5 h-5" />}
                className="cursor-pointer"
              >
                {dragActive ? "Drop Files" : "Choose Files"}
              </Button>
            </label>

            {/* Additional Info */}
            <div className="mt-4 text-xs text-gray-500">
              {uploadMode === "single"
                ? "Previous image will be replaced when uploading a new one"
                : "You can select multiple images at once or upload them one by one"}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

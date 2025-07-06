"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Image as ImageIcon, Trash2, Download, Copy } from "lucide-react";
import { UploadedImage } from "./types";
import { ImageCard } from "./ImageCard";

interface ImageGridProps {
  images: UploadedImage[];
  copiedUrl: string | null;
  onRemoveImage: (imageId: string) => void;
  onRetryUpload: (imageId: string) => void;
  onPreviewImage: (image: UploadedImage) => void;
  onCopyUrl: (url: string) => void;
  onClearAll: () => void;
  onBulkDownload?: () => void;
  onBulkCopy?: () => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  copiedUrl,
  onRemoveImage,
  onRetryUpload,
  onPreviewImage,
  onCopyUrl,
  onClearAll,
  onBulkDownload,
  onBulkCopy,
}) => {
  const completedImages = images.filter((img) => img.status === "completed");
  const uploadingImages = images.filter((img) => img.status === "uploading");
  const errorImages = images.filter((img) => img.status === "error");

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-0">
          {/* Left side - Title and Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                Uploaded Images ({images.length})
              </span>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              {completedImages.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700">
                    {completedImages.length} Complete
                  </span>
                </div>
              )}
              {uploadingImages.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-orange-700">
                    {uploadingImages.length} Uploading
                  </span>
                </div>
              )}
              {errorImages.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-700">
                    {errorImages.length} Failed
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Bulk Actions */}
            {completedImages.length > 1 && (
              <>
                {onBulkCopy && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={onBulkCopy}
                    startContent={<Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                    className="min-h-[36px] touch-manipulation text-xs sm:text-sm"
                  >
                    Copy All URLs
                  </Button>
                )}
                {onBulkDownload && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    onClick={onBulkDownload}
                    startContent={
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    }
                    className="min-h-[36px] touch-manipulation text-xs sm:text-sm"
                  >
                    Download All
                  </Button>
                )}
              </>
            )}

            {/* Clear All Button */}
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onClick={onClearAll}
              startContent={<Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              className="min-h-[36px] touch-manipulation text-xs sm:text-sm"
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              copiedUrl={copiedUrl}
              onRemove={onRemoveImage}
              onRetry={onRetryUpload}
              onPreview={onPreviewImage}
              onCopyUrl={onCopyUrl}
            />
          ))}
        </div>

        {/* Upload Summary */}
        {images.length > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {completedImages.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Successfully Uploaded
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {uploadingImages.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Currently Uploading
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {errorImages.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Failed Uploads
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

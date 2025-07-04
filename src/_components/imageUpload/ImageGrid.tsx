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
        <div className="flex items-center justify-between w-full">
          {/* Left side - Title and Stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">
                Uploaded Images ({images.length})
              </span>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-3 text-sm">
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
          <div className="flex items-center space-x-2">
            {/* Bulk Actions */}
            {completedImages.length > 1 && (
              <>
                {onBulkCopy && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={onBulkCopy}
                    startContent={<Copy className="w-4 h-4" />}
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
                    startContent={<Download className="w-4 h-4" />}
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
              startContent={<Trash2 className="w-4 h-4" />}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {completedImages.length}
                </p>
                <p className="text-sm text-gray-600">Successfully Uploaded</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {uploadingImages.length}
                </p>
                <p className="text-sm text-gray-600">Currently Uploading</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {errorImages.length}
                </p>
                <p className="text-sm text-gray-600">Failed Uploads</p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

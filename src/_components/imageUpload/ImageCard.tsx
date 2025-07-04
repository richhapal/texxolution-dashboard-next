"use client";

import React from "react";
import {
  Card,
  CardBody,
  Button,
  Progress,
  Badge,
  Chip,
  Input,
  Tooltip,
} from "@heroui/react";
import {
  X,
  Copy,
  Check,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { UploadedImage } from "./types";

interface ImageCardProps {
  image: UploadedImage;
  copiedUrl: string | null;
  onRemove: (imageId: string) => void;
  onRetry: (imageId: string) => void;
  onPreview: (image: UploadedImage) => void;
  onCopyUrl: (url: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  copiedUrl,
  onRemove,
  onRetry,
  onPreview,
  onCopyUrl,
}) => {
  const getStatusIcon = (status: UploadedImage["status"]) => {
    switch (status) {
      case "uploading":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: UploadedImage["status"]) => {
    switch (status) {
      case "uploading":
        return "warning" as const;
      case "completed":
        return "success" as const;
      case "error":
        return "danger" as const;
    }
  };

  const getStatusText = (status: UploadedImage["status"]) => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "completed":
        return "Upload Complete";
      case "error":
        return "Upload Failed";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardBody className="p-0">
        {/* Image Preview Section */}
        <div className="relative aspect-square group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.preview}
            alt={image.name}
            className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
            onClick={() => onPreview(image)}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="sm"
              variant="flat"
              className="bg-white/90 text-black"
              onClick={() => onPreview(image)}
              startContent={<Eye className="w-4 h-4" />}
            >
              Preview
            </Button>
          </div>

          {/* Remove Button */}
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              isIconOnly
              variant="flat"
              className="bg-white/90 backdrop-blur-sm hover:bg-red-50"
              onClick={() => onRemove(image.id)}
            >
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge
              color={getStatusColor(image.status)}
              variant="flat"
              className="backdrop-blur-sm"
            >
              <div className="flex items-center space-x-1">
                {getStatusIcon(image.status)}
                <span className="text-xs">{getStatusText(image.status)}</span>
              </div>
            </Badge>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-3">
          {/* File Info Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <ImageIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <h4 className="font-medium text-sm truncate" title={image.name}>
                {image.name}
              </h4>
            </div>
            <Chip size="sm" variant="flat" color="default">
              {image.size}
            </Chip>
          </div>

          {/* Progress Bar */}
          {image.status === "uploading" && (
            <div className="space-y-2">
              <Progress
                value={image.progress}
                color="primary"
                size="sm"
                className="w-full"
                showValueLabel
              />
              <p className="text-xs text-gray-600 text-center">
                Uploading... {image.progress}%
              </p>
            </div>
          )}

          {/* Error Message */}
          {image.status === "error" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-xs">
                  {image.error || "Upload failed. Please try again."}
                </p>
              </div>
            </div>
          )}

          {/* Success State - URL Display */}
          {image.status === "completed" && image.url && (
            <div className="space-y-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-green-700 text-xs font-medium">
                  Successfully uploaded to S3
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-2">Image URL:</p>
                <div className="flex items-center space-x-2">
                  <Input
                    value={image.url}
                    readOnly
                    size="sm"
                    className="flex-1 text-xs"
                    variant="bordered"
                  />
                  <Tooltip
                    content={copiedUrl === image.url ? "Copied!" : "Copy URL"}
                    color={copiedUrl === image.url ? "success" : "default"}
                  >
                    <Button
                      size="sm"
                      isIconOnly
                      variant="flat"
                      color={copiedUrl === image.url ? "success" : "primary"}
                      onClick={() => onCopyUrl(image.url!)}
                    >
                      {copiedUrl === image.url ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex space-x-2">
              <Tooltip content="Preview Image">
                <Button
                  size="sm"
                  variant="flat"
                  isIconOnly
                  onClick={() => onPreview(image)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </Tooltip>

              {image.status === "completed" && image.url && (
                <Tooltip content="Download Image">
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    as="a"
                    href={image.url}
                    download={image.name}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* Retry Button for Failed Uploads */}
            {image.status === "error" && (
              <Button
                size="sm"
                variant="flat"
                color="warning"
                onClick={() => onRetry(image.id)}
                startContent={<RefreshCw className="w-4 h-4" />}
              >
                Retry
              </Button>
            )}

            {/* Remove Button */}
            <Tooltip content="Remove Image">
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                color="danger"
                onClick={() => onRemove(image.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

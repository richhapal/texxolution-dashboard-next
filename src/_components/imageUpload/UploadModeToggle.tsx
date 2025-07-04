"use client";

import React from "react";
import { Card, CardBody, Tabs, Tab, Select, SelectItem } from "@heroui/react";
import { UploadPath } from "./types";

interface UploadModeToggleProps {
  uploadMode: "single" | "multiple";
  onModeChange: (mode: "single" | "multiple") => void;
  uploadPath: UploadPath;
  onPathChange: (path: UploadPath) => void;
}

export const UploadModeToggle: React.FC<UploadModeToggleProps> = ({
  uploadMode,
  onModeChange,
  uploadPath,
  onPathChange,
}) => {
  return (
    <Card className="mb-6">
      <CardBody className="p-4">
        <div className="space-y-4">
          {/* Upload Path Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Upload Destination
            </label>
            <Select
              selectedKeys={[uploadPath]}
              onSelectionChange={(keys) =>
                onPathChange(Array.from(keys)[0] as UploadPath)
              }
              className="max-w-xs"
              variant="bordered"
            >
              <SelectItem key="products">
                Products - Product images and catalogs
              </SelectItem>
              <SelectItem key="homepage">
                Homepage - Hero images and banners
              </SelectItem>
              <SelectItem key="utils">
                Utils - General utility images
              </SelectItem>
            </Select>
          </div>

          {/* Upload Mode Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Upload Mode
            </label>
            <Tabs
              selectedKey={uploadMode}
              onSelectionChange={(key) =>
                onModeChange(key as "single" | "multiple")
              }
              variant="bordered"
              fullWidth
            >
              <Tab key="single" title="Single Upload">
                <div className="pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        Single Image Mode
                      </p>
                      <p className="text-xs text-gray-600">
                        Upload one image at a time. Perfect for profile
                        pictures, featured images, or when you need precise
                        control over individual uploads.
                      </p>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab key="multiple" title="Multiple Upload">
                <div className="pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        Batch Upload Mode
                      </p>
                      <p className="text-xs text-gray-600">
                        Upload multiple images simultaneously (max 5 files).
                        Ideal for product galleries and image collections.
                      </p>
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

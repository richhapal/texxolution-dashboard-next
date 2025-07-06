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
    <Card className="mb-4 sm:mb-6">
      <CardBody className="p-3 sm:p-4">
        <div className="space-y-4">
          {/* Upload Path Selection */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
              Upload Destination
            </label>
            <Select
              selectedKeys={[uploadPath]}
              onSelectionChange={(keys) =>
                onPathChange(Array.from(keys)[0] as UploadPath)
              }
              className="w-full sm:max-w-xs"
              variant="bordered"
              size="sm"
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
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
              Upload Mode
            </label>
            <Tabs
              selectedKey={uploadMode}
              onSelectionChange={(key) =>
                onModeChange(key as "single" | "multiple")
              }
              variant="bordered"
              fullWidth
              size="sm"
              classNames={{
                tabList: "gap-1 sm:gap-2 p-1 sm:p-1.5",
                tab: "px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm",
                tabContent: "text-xs sm:text-sm font-medium",
              }}
            >
              <Tab key="single" title="Single Upload">
                <div className="pt-3 sm:pt-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 sm:mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">
                        Single Image Mode
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Upload one image at a time. Perfect for profile
                        pictures, featured images, or when you need precise
                        control over individual uploads.
                      </p>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab key="multiple" title="Multiple Upload">
                <div className="pt-3 sm:pt-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1 sm:mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">
                        Batch Upload Mode
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
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

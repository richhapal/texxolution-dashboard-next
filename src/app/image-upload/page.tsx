"use client";

import React, { useState, useCallback } from "react";
import {
  useDisclosure,
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  Badge,
} from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// RTK Query
import {
  useUploadSingleMutation,
  UploadPath,
} from "@/_lib/rtkQuery/uploadRTKQuery";

// Components
import { UploadModeToggle } from "@/_components/imageUpload/UploadModeToggle";
import { DropzoneArea } from "@/_components/imageUpload/DropzoneArea";
import { ImageGrid } from "@/_components/imageUpload/ImageGrid";
import { EmptyState } from "@/_components/imageUpload/EmptyState";
import { ImagePreviewModal } from "@/_components/imageUpload/ImagePreviewModal";
import { ImageGallery } from "@/_components/imageUpload/ImageGallery";

// Types and Utils
import { UploadedImage } from "@/_components/imageUpload/types";
import {
  formatFileSize,
  generateImageId,
  validateImageFile,
  createImagePreview,
  cleanupImagePreviews,
  copyToClipboard,
  processImageUrl,
} from "@/_components/imageUpload/utils";
import { useAppSelector } from "@/_lib/store/store";
import { canUploadImages, canDeleteImages } from "@/_lib/utils/roleUtils";

export default function ImageUploadPage() {
  // Router for navigation
  const router = useRouter();

  // Get user role from Redux store
  const user = useAppSelector((state) => state.userSlice.user);
  const userCanUpload = canUploadImages(user?.userType);
  const userCanDelete = canDeleteImages(user?.userType);

  // State
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState<"single" | "multiple">("single");
  const [uploadPath, setUploadPath] = useState<UploadPath>("products");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("upload");

  // RTK Query hooks
  const [uploadSingle] = useUploadSingleMutation();

  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Handle file selection with RTK Query upload
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || !userCanUpload) return;

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          console.warn(`Invalid file ${file.name}: ${validation.error}`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Handle actual upload with RTK Query
      const handleUpload = async (image: UploadedImage) => {
        try {
          // Set uploading status
          setSelectedImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? { ...img, status: "uploading", progress: 50 }
                : img
            )
          );

          const result = await uploadSingle({
            file: image.file,
            uploadPath,
          }).unwrap();

          if (result.message && result.imageUrl) {
            setSelectedImages((prev) =>
              prev.map((img) =>
                img.id === image.id
                  ? {
                      ...img,
                      status: "completed",
                      progress: 100,
                      url: result.imageUrl,
                      fileName: result.fileName,
                      fullPath: result.fileName, // Use fileName as fullPath since backend returns full path in fileName
                    }
                  : img
              )
            );
          }
        } catch (error: any) {
          console.error("Upload failed:", error);
          setSelectedImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    status: "error",
                    error: error?.data?.message || "Upload failed",
                  }
                : img
            )
          );
        }
      };

      if (uploadMode === "single" && validFiles.length > 0) {
        // Clean up existing previews
        selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));

        // For single mode, only take the first file and replace existing
        const file = validFiles[0];
        const newImage: UploadedImage = {
          id: generateImageId(),
          file,
          preview: createImagePreview(file),
          status: "uploading",
          progress: 0,
          size: formatFileSize(file.size),
          name: file.name,
        };
        setSelectedImages([newImage]);
        await handleUpload(newImage);
      } else if (uploadMode === "multiple") {
        // For multiple mode, add to existing files (max 5)
        const remainingSlots = 5 - selectedImages.length;
        const filesToAdd = validFiles.slice(0, remainingSlots);

        const newImages: UploadedImage[] = filesToAdd.map((file) => ({
          id: generateImageId(),
          file,
          preview: createImagePreview(file),
          status: "uploading",
          progress: 0,
          size: formatFileSize(file.size),
          name: file.name,
        }));

        setSelectedImages((prev) => [...prev, ...newImages]);

        // Upload each image individually for better progress tracking
        for (const image of newImages) {
          await handleUpload(image);
        }
      }
    },
    [uploadMode, selectedImages, uploadPath, uploadSingle, userCanUpload]
  );

  // Upload handler for retry functionality
  const performUpload = async (image: UploadedImage) => {
    try {
      const result = await uploadSingle({
        file: image.file,
        uploadPath,
      }).unwrap();

      if (result.message && result.imageUrl) {
        setSelectedImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: "completed",
                  progress: 100,
                  url: result.imageUrl,
                  fileName: result.fileName,
                  fullPath: result.fileName, // Use fileName as fullPath since backend returns full path in fileName
                }
              : img
          )
        );
      }
    } catch (error: any) {
      setSelectedImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                status: "error",
                error: error?.data?.message || "Upload failed",
              }
            : img
        )
      );
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Copy URL to clipboard
  const handleCopyUrl = async (url: string) => {
    const processedUrl = processImageUrl(url);
    const success = await copyToClipboard(processedUrl);
    if (success) {
      setCopiedUrl(processedUrl);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  // Remove image
  const handleRemoveImage = (imageId: string) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  // Retry upload
  const handleRetryUpload = (imageId: string) => {
    const imageToRetry = selectedImages.find((img) => img.id === imageId);
    if (imageToRetry) {
      setSelectedImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: "uploading", progress: 0, error: undefined }
            : img
        )
      );
      performUpload(imageToRetry);
    }
  };

  // Clear all images
  const handleClearAllImages = () => {
    cleanupImagePreviews(selectedImages.map((img) => img.preview));
    setSelectedImages([]);
  };

  // Open image preview
  const handleOpenImagePreview = (image: UploadedImage) => {
    setSelectedImage(image);
    onOpen();
  };

  // Trigger file input click
  const triggerFileInput = () => {
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header with Back Button */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="light"
            isIconOnly
            onClick={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">
            Upload Image on AWS S3 Bucket
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Upload images to your AWS S3 bucket and manage your image gallery with
          RTK Query
        </p>
        {user && (
          <div className="mt-4 flex items-center space-x-4">
            <Badge color={userCanUpload ? "success" : "warning"} variant="flat">
              Role: {user.userType}
            </Badge>
            <Badge
              color={userCanDelete ? "danger" : "secondary"}
              variant="flat"
            >
              {userCanDelete ? "Can Delete Images" : "Cannot Delete Images"}
            </Badge>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      {!userCanUpload ? (
        <Card className="mb-6">
          <CardBody className="text-center py-12">
            <div className="text-red-500 mb-4">
              <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
              <p>You need admin privileges to upload images.</p>
              <p className="text-sm text-gray-600 mt-2">
                Current role: {user?.userType || "Not authenticated"}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardBody>
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              variant="underlined"
              size="lg"
            >
              <Tab key="upload" title="Upload Images">
                <div className="space-y-6 mt-6">
                  {/* Upload Configuration */}
                  <UploadModeToggle
                    uploadMode={uploadMode}
                    onModeChange={setUploadMode}
                    uploadPath={uploadPath}
                    onPathChange={setUploadPath}
                  />

                  {/* Upload Area */}
                  <DropzoneArea
                    dragActive={dragActive}
                    uploadMode={uploadMode}
                    onFileSelect={handleFileSelect}
                    onDrag={handleDrag}
                    onDrop={handleDrop}
                  />

                  {/* Images Grid or Empty State */}
                  {selectedImages.length > 0 ? (
                    <ImageGrid
                      images={selectedImages}
                      copiedUrl={copiedUrl}
                      onRemoveImage={handleRemoveImage}
                      onRetryUpload={handleRetryUpload}
                      onPreviewImage={handleOpenImagePreview}
                      onCopyUrl={handleCopyUrl}
                      onClearAll={handleClearAllImages}
                      onBulkDownload={() => {}} // Not implemented for upload grid
                      onBulkCopy={() => {}} // Not implemented for upload grid
                    />
                  ) : (
                    <EmptyState
                      onUploadClick={triggerFileInput}
                      uploadMode={uploadMode}
                    />
                  )}
                </div>
              </Tab>

              <Tab key="gallery" title="Image Gallery">
                <div className="mt-6">
                  {user ? (
                    <ImageGallery onRefresh={() => {}} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">
                        Please log in to view the image gallery.
                      </p>
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        image={selectedImage}
        isOpen={isOpen}
        onClose={onClose}
        onCopyUrl={handleCopyUrl}
      />
    </div>
  );
}

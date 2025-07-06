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
          if (error?.status === 401) {
            alert(
              "You don't have permission to upload images. Please contact your super admin."
            );
          }
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
      if (error?.status === 401) {
        alert(
          "You don't have permission to upload images. Please contact your super admin."
        );
      }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements - Mobile Optimized */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-pink-400/10 to-violet-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles - Responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div
          className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-40"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-float opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float opacity-70"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl relative z-10">
        {/* Enhanced Header - Mobile Optimized */}
        <div
          className="mb-8 sm:mb-12 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "100ms", animationFillMode: "both" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
            <Button
              variant="light"
              isIconOnly
              onClick={() => router.back()}
              className="mb-2 sm:mb-0 sm:mr-4 hover:scale-110 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg min-w-10 h-10 sm:min-w-12 sm:h-12 touch-manipulation"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl animate-pulse flex-shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                    Image Upload Studio
                  </h1>
                  <p className="text-sm sm:text-base lg:text-xl text-gray-600 mt-1 sm:mt-2">
                    Upload, manage, and organize your images with style
                  </p>
                </div>
              </div>

              {/* Feature highlights - Mobile Responsive */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    AWS S3 Storage
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Drag & Drop
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Real-time Progress
                  </span>
                </div>
              </div>
            </div>
          </div>

          {user && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-lg">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Welcome back!
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <div
                    className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto ${
                      userCanUpload
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                        : "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                      <div
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                          userCanUpload
                            ? "bg-green-500 animate-pulse"
                            : "bg-yellow-500 animate-pulse"
                        }`}
                      ></div>
                      <span className="text-xs sm:text-sm font-bold tracking-wide text-gray-800">
                        {user.userType.charAt(0).toUpperCase() +
                          user.userType.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative w-full sm:w-auto">
                  <div
                    className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto ${
                      userCanDelete
                        ? "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold tracking-wide text-gray-800 block text-center sm:text-left">
                      {userCanDelete ? "✨ Delete Access" : "👁️ View Only"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Mobile Optimized */}
        {!userCanUpload ? (
          <Card
            className="opacity-0 animate-fade-in-up backdrop-blur-sm bg-white/80 border-0 shadow-2xl"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <CardBody className="text-center py-12 sm:py-16 px-4 sm:px-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto blur-2xl opacity-50"></div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 relative z-10 shadow-xl">
                  <span className="text-white text-xl sm:text-2xl lg:text-3xl">
                    🔒
                  </span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Access Restricted
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-2">
                You need admin privileges to upload images.
              </p>
              <p className="text-sm text-gray-500">
                Current role:{" "}
                <span className="font-semibold">
                  {user?.userType || "Not authenticated"}
                </span>
              </p>
              <div className="mt-6 sm:mt-8">
                <Button
                  color="primary"
                  variant="flat"
                  size="lg"
                  onClick={() => router.push("/signin")}
                  className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                >
                  Contact Administrator
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card
            className="opacity-0 animate-fade-in-up backdrop-blur-sm bg-white/90 border-0 shadow-2xl overflow-hidden"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            {/* Enhanced Card Header with Beautiful Tabs */}
            <div className="relative overflow-hidden">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-600 animate-gradient-x"></div>

              {/* Floating Orbs */}
              <div className="absolute top-4 left-8 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float"></div>
              <div
                className="absolute bottom-4 right-12 w-16 h-16 bg-white/15 rounded-full blur-xl animate-float"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-8 right-20 w-12 h-12 bg-white/10 rounded-full blur-lg animate-float"
                style={{ animationDelay: "2s" }}
              ></div>

              {/* Glass Effect Overlay */}
              <div className="relative bg-white/5 backdrop-blur-xl border-b border-white/10">
                <CardBody className="p-0">
                  <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    variant="underlined"
                    size="lg"
                    classNames={{
                      base: "w-full",
                      tabList:
                        "gap-1 sm:gap-2 w-full relative rounded-none p-2 sm:p-3 bg-transparent overflow-x-auto",
                      cursor:
                        "w-full bg-gradient-to-r from-white via-blue-50 to-purple-50 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-white/30 h-full",
                      tab: "max-w-fit px-3 sm:px-6 py-2 sm:py-3 h-auto font-semibold rounded-xl sm:rounded-2xl mx-0.5 sm:mx-1 transition-all duration-500 hover:bg-white/30 hover:scale-105 hover:shadow-xl data-[selected=true]:bg-transparent data-[selected=true]:shadow-2xl data-[selected=true]:scale-105 min-w-0 flex-shrink-0",
                      tabContent:
                        "group-data-[selected=true]:text-gray-800 text-white/90 group-data-[selected=true]:font-bold text-sm sm:text-base transition-all duration-500 group-data-[selected=true]:drop-shadow-sm",
                    }}
                  >
                    <Tab
                      key="upload"
                      title={
                        <div className="flex items-center space-x-2 sm:space-x-4 p-1 sm:p-2">
                          <div className="relative">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
                              <span className="text-white text-base sm:text-lg lg:text-2xl drop-shadow-lg">
                                📤
                              </span>
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                          </div>
                          <div className="text-left hidden sm:block">
                            <div className="font-bold text-sm sm:text-lg leading-tight">
                              Upload Studio
                            </div>
                            <div className="text-xs sm:text-sm opacity-80 leading-tight">
                              Upload & manage files
                            </div>
                          </div>
                          <div className="text-left sm:hidden">
                            <div className="font-bold text-xs leading-tight">
                              Upload
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 rounded-b-xl sm:rounded-b-2xl lg:rounded-b-3xl shadow-2xl border border-white/20 backdrop-blur-md overflow-hidden">
                        {/* Decorative Elements - Mobile Optimized */}
                        <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl transform translate-x-8 sm:translate-x-12 lg:translate-x-16 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl transform -translate-x-6 sm:-translate-x-9 lg:-translate-x-12 translate-y-6 sm:translate-y-9 lg:translate-y-12"></div>

                        <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                          {/* Upload Configuration Card - Mobile Optimized */}
                          <div
                            className="opacity-0 animate-fade-in-up"
                            style={{
                              animationDelay: "300ms",
                              animationFillMode: "both",
                            }}
                          >
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                              <div className="flex items-center mb-4 sm:mb-6">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4">
                                  <span className="text-white text-base sm:text-lg lg:text-2xl">
                                    ⚙️
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                                    Upload Configuration
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Set your upload preferences
                                  </p>
                                </div>
                              </div>
                              <UploadModeToggle
                                uploadMode={uploadMode}
                                onModeChange={setUploadMode}
                                uploadPath={uploadPath}
                                onPathChange={setUploadPath}
                              />
                            </div>
                          </div>

                          {/* Upload Area Card - Mobile Optimized */}
                          <div
                            className="opacity-0 animate-fade-in-up"
                            style={{
                              animationDelay: "400ms",
                              animationFillMode: "both",
                            }}
                          >
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                              <div className="flex items-center mb-4 sm:mb-6">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4">
                                  <span className="text-white text-base sm:text-lg lg:text-2xl">
                                    📤
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                                    Upload Zone
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Drag & drop or click to upload
                                  </p>
                                </div>
                              </div>
                              <DropzoneArea
                                dragActive={dragActive}
                                uploadMode={uploadMode}
                                onFileSelect={handleFileSelect}
                                onDrag={handleDrag}
                                onDrop={handleDrop}
                              />
                            </div>
                          </div>

                          {/* Images Grid Card - Mobile Optimized */}
                          <div
                            className="opacity-0 animate-fade-in-up"
                            style={{
                              animationDelay: "500ms",
                              animationFillMode: "both",
                            }}
                          >
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                                <div className="flex items-center w-full sm:w-auto">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                                    <span className="text-white text-lg sm:text-2xl">
                                      🖼️
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                      Your Images
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {selectedImages.length > 0
                                        ? `${selectedImages.length} image${
                                            selectedImages.length > 1 ? "s" : ""
                                          } selected`
                                        : "No images selected yet"}
                                    </p>
                                  </div>
                                </div>
                                {selectedImages.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                                      {
                                        selectedImages.filter(
                                          (img) => img.status === "completed"
                                        ).length
                                      }{" "}
                                      completed
                                    </div>
                                    <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                                      {
                                        selectedImages.filter(
                                          (img) => img.status === "uploading"
                                        ).length
                                      }{" "}
                                      uploading
                                    </div>
                                  </div>
                                )}
                              </div>
                              {selectedImages.length > 0 ? (
                                <ImageGrid
                                  images={selectedImages}
                                  copiedUrl={copiedUrl}
                                  onRemoveImage={handleRemoveImage}
                                  onRetryUpload={handleRetryUpload}
                                  onPreviewImage={handleOpenImagePreview}
                                  onCopyUrl={handleCopyUrl}
                                  onClearAll={handleClearAllImages}
                                  onBulkDownload={() => {}}
                                  onBulkCopy={() => {}}
                                />
                              ) : (
                                <EmptyState
                                  onUploadClick={triggerFileInput}
                                  uploadMode={uploadMode}
                                />
                              )}
                            </div>
                          </div>

                          {/* Upload Stats Cards - Mobile Optimized */}
                          {selectedImages.length > 0 && (
                            <div
                              className="opacity-0 animate-fade-in-up"
                              style={{
                                animationDelay: "600ms",
                                animationFillMode: "both",
                              }}
                            >
                              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center mb-4 sm:mb-6">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                                    <span className="text-white text-lg sm:text-2xl">
                                      📊
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                      Upload Statistics
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      Real-time upload progress
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 group">
                                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 group-hover:scale-110 transition-transform duration-300"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-blue-600 text-xs sm:text-sm font-semibold mb-1">
                                          Total Files
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold text-blue-800">
                                          {selectedImages.length}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                          Files selected
                                        </p>
                                      </div>
                                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                        <span className="text-white text-lg sm:text-2xl">
                                          📁
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300 group">
                                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 group-hover:scale-110 transition-transform duration-300"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-emerald-600 text-xs sm:text-sm font-semibold mb-1">
                                          Completed
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold text-emerald-800">
                                          {
                                            selectedImages.filter(
                                              (img) =>
                                                img.status === "completed"
                                            ).length
                                          }
                                        </p>
                                        <p className="text-xs text-emerald-600 mt-1">
                                          Successfully uploaded
                                        </p>
                                      </div>
                                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                        <span className="text-white text-lg sm:text-2xl">
                                          ✅
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 group-hover:scale-110 transition-transform duration-300"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-purple-600 text-xs sm:text-sm font-semibold mb-1">
                                          In Progress
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold text-purple-800">
                                          {
                                            selectedImages.filter(
                                              (img) =>
                                                img.status === "uploading"
                                            ).length
                                          }
                                        </p>
                                        <p className="text-xs text-purple-600 mt-1">
                                          Currently uploading
                                        </p>
                                      </div>
                                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                        <span className="text-white text-lg sm:text-2xl">
                                          ⏳
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab>

                    <Tab
                      key="gallery"
                      title={
                        <div className="flex items-center space-x-2 sm:space-x-4 p-1 sm:p-2">
                          <div className="relative">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 via-pink-600 to-orange-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
                              <span className="text-white text-base sm:text-lg lg:text-2xl drop-shadow-lg">
                                🖼️
                              </span>
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                          </div>
                          <div className="text-left hidden sm:block">
                            <div className="font-bold text-sm sm:text-lg leading-tight">
                              Gallery
                            </div>
                            <div className="text-xs sm:text-sm opacity-80 leading-tight">
                              Browse & organize
                            </div>
                          </div>
                          <div className="text-left sm:hidden">
                            <div className="font-bold text-xs leading-tight">
                              Gallery
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <div className="relative bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 rounded-b-xl sm:rounded-b-2xl lg:rounded-b-3xl shadow-2xl border border-white/20 backdrop-blur-md overflow-hidden">
                        {/* Decorative Elements - Mobile Optimized */}
                        <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-600"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-pink-200/20 to-orange-200/20 rounded-full blur-3xl transform translate-x-8 sm:translate-x-12 lg:translate-x-16 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl transform -translate-x-6 sm:-translate-x-9 lg:-translate-x-12 translate-y-6 sm:translate-y-9 lg:translate-y-12"></div>

                        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                          {user ? (
                            <div
                              className="opacity-0 animate-fade-in-up"
                              style={{
                                animationDelay: "300ms",
                                animationFillMode: "both",
                              }}
                            >
                              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                                  <div className="flex items-center w-full sm:w-auto">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                                      <span className="text-white text-lg sm:text-2xl">
                                        🖼️
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                        Image Gallery
                                      </h3>
                                      <p className="text-xs sm:text-sm text-gray-600">
                                        Browse and manage your uploaded images
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                    <div className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                                      <span className="text-purple-700 text-xs sm:text-sm font-medium">
                                        🔍 Search & Filter
                                      </span>
                                    </div>
                                    <div className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                                      <span className="text-blue-700 text-xs sm:text-sm font-medium">
                                        🔄 Auto Refresh
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <ImageGallery onRefresh={() => {}} />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 sm:py-16">
                              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-6 sm:p-12 max-w-md mx-auto">
                                <div className="relative mb-6 sm:mb-8">
                                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 sm:w-24 sm:h-24 mx-auto blur-2xl opacity-50"></div>
                                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto relative z-10 shadow-xl">
                                    <span className="text-white text-2xl sm:text-3xl">
                                      🔐
                                    </span>
                                  </div>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                                  Gallery Access Required
                                </h3>
                                <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">
                                  Please log in to view and manage your image
                                  gallery.
                                </p>
                                <div className="space-y-4">
                                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 sm:mr-2"></span>
                                      <span>View Images</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 sm:mr-2"></span>
                                      <span>Download</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-1 sm:mr-2"></span>
                                      <span>Organize</span>
                                    </div>
                                  </div>
                                  <Button
                                    color="primary"
                                    variant="flat"
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 w-full sm:w-auto min-h-[44px] touch-manipulation"
                                    onClick={() => router.push("/signin")}
                                  >
                                    Sign In to Continue
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab>
                  </Tabs>
                </CardBody>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Help Section - Mobile Optimized */}
        <div
          className="mt-8 sm:mt-12 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "600ms", animationFillMode: "both" }}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Why Choose Our Image Upload Studio?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Experience the most advanced image upload solution with
              enterprise-grade features and stunning user interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
              <div className="relative z-10 p-6 sm:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <span className="text-white text-2xl sm:text-3xl">🚀</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  Lightning Fast Upload
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Experience blazing-fast uploads with real-time progress
                  tracking, intelligent error handling, and automatic retry
                  mechanisms.
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 sm:mr-2"></span>
                    <span>Multi-file support</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 sm:mr-2"></span>
                    <span>Progress tracking</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500"></div>
              <div className="relative z-10 p-6 sm:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <span className="text-white text-2xl sm:text-3xl">🔒</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                  Enterprise Security
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Your images are protected with enterprise-grade security on
                  AWS S3, featuring encryption, access controls, and audit logs.
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 sm:mr-2"></span>
                    <span>AWS S3 Storage</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-1 sm:mr-2"></span>
                    <span>Encrypted transfer</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
              <div className="relative z-10 p-6 sm:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <span className="text-white text-2xl sm:text-3xl">📊</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  Smart Management
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Organize, preview, and manage your images with powerful tools
                  including search, filters, bulk operations, and analytics.
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-1 sm:mr-2"></span>
                    <span>Advanced search</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-1 sm:mr-2"></span>
                    <span>Bulk operations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips Card - Mobile Optimized */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <span className="text-white text-lg sm:text-2xl">💡</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Quick Tips
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Get the most out of your image upload experience
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-2">
                  <span className="text-xl sm:text-2xl mr-2">📱</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    Drag & Drop
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Simply drag files from your computer directly into the upload
                  zone
                </p>
              </div>
              <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-2">
                  <span className="text-xl sm:text-2xl mr-2">🎯</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    Multiple Files
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Upload up to 5 images at once in multiple mode
                </p>
              </div>
              <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-2">
                  <span className="text-xl sm:text-2xl mr-2">🔗</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    Copy URLs
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  One-click to copy image URLs for easy sharing
                </p>
              </div>
              <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-2">
                  <span className="text-xl sm:text-2xl mr-2">🗂️</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    Organization
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Organize images by categories and upload paths
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

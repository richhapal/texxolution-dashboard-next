"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Chip,
  Input,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Spinner,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Image as ImageIcon,
  Copy,
  Check,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  HardDrive,
} from "lucide-react";
import {
  useListImagesQuery,
  useDeleteImageMutation,
  useDeleteMultipleImagesMutation,
  ImageFile,
  UploadPath,
} from "@/_lib/rtkQuery/uploadRTKQuery";
import { formatFileSize, copyToClipboard, processImageUrl } from "./utils";
import { useAppSelector } from "@/_lib/store/store";
import { canDeleteImages } from "@/_lib/utils/roleUtils";

interface ImageGalleryProps {
  onRefresh?: () => void;
}

interface ImagePreviewModalProps {
  image: ImageFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (imageUrl: string) => void;
  userCanDelete: boolean;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  isOpen,
  onClose,
  onDelete,
  userCanDelete,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteImage] = useDeleteImageMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyUrl = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (!image) return;

    setIsDeleting(true);
    try {
      await deleteImage({ imageUrl: image.url }).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!image) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>{image.fileName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Chip size="sm" variant="flat" color="primary">
                {formatFileSize(image.size)}
              </Chip>
              <Chip size="sm" variant="flat" color="secondary">
                {new Date(image.lastModified).toLocaleDateString()}
              </Chip>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex justify-center mb-4">
            <div className="relative max-w-full max-h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={processImageUrl(image.url)}
                alt={image.fileName}
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Image URL:</p>
              <div className="flex items-center space-x-2">
                <Input
                  value={processImageUrl(image.url)}
                  readOnly
                  size="sm"
                  className="flex-1"
                />
                <Tooltip
                  content={copiedUrl === image.url ? "Copied!" : "Copy URL"}
                >
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    onClick={() => handleCopyUrl(processImageUrl(image.url))}
                  >
                    {copiedUrl === image.url ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Full Path:</p>
              <Input value={image.fullPath} readOnly size="sm" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          <Button
            as="a"
            href={processImageUrl(image.url)}
            download={image.fileName}
            color="primary"
            variant="flat"
            startContent={<Download className="w-4 h-4" />}
          >
            Download
          </Button>
          {userCanDelete && (
            <Button
              color="danger"
              variant="flat"
              isLoading={isDeleting}
              onClick={() => handleDelete(image.url)}
              startContent={!isDeleting && <Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const ImageGallery: React.FC<ImageGalleryProps> = ({ onRefresh }) => {
  const [selectedTab, setSelectedTab] = useState<UploadPath>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get user role from Redux store
  const user = useAppSelector((state) => state.userSlice.user);
  const userCanDelete = canDeleteImages(user?.userType);

  // RTK Query hooks
  const { data: imagesData, error, isLoading, refetch } = useListImagesQuery();

  const [deleteMultipleImages] = useDeleteMultipleImagesMutation();

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const handleCopyUrl = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0 || !userCanDelete) return;

    try {
      // Convert selected file names to URLs by finding them in current images
      const currentImages = getCurrentImages();
      const selectedUrls = Array.from(selectedImages).map((fileName) => {
        const image = currentImages.find((img) => img.fileName === fileName);
        return image?.url || fileName; // fallback to fileName if not found
      });

      await deleteMultipleImages({
        imageUrls: selectedUrls,
      }).unwrap();
      setSelectedImages(new Set());
    } catch (error) {
      console.error("Failed to delete images:", error);
    }
  };

  const handleImageClick = (image: ImageFile) => {
    setSelectedImage(image);
    onOpen();
  };

  const toggleImageSelection = (fileName: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(fileName)) {
      newSelected.delete(fileName);
    } else {
      newSelected.add(fileName);
    }
    setSelectedImages(newSelected);
  };

  const getCurrentImages = () => {
    if (!imagesData?.data) return [];

    let currentImages = imagesData.data[selectedTab] || [];

    // Filter by search query
    if (searchQuery) {
      currentImages = currentImages.filter((img) =>
        img.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort images
    currentImages = [...currentImages].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.fileName.localeCompare(b.fileName);
        case "date":
          return (
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
          );
        case "size":
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return currentImages;
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading images...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load images</p>
          <Button
            onClick={handleRefresh}
            startContent={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  const currentImages = getCurrentImages();
  const summary = imagesData?.summary;
  const environment = imagesData?.environment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-2xl font-bold">Image Gallery</h2>
              <div className="flex items-center space-x-4 mt-2">
                <Badge color="primary" variant="flat">
                  Environment: {environment}
                </Badge>
                <Badge color="secondary" variant="flat">
                  Total: {summary?.total || 0} images
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {userCanDelete && selectedImages.size > 0 && (
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  onClick={handleDeleteSelected}
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  Delete Selected ({selectedImages.size})
                </Button>
              )}
              <Button
                variant="flat"
                size="sm"
                onClick={handleRefresh}
                startContent={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4" />}
              />
            </div>
            <Select
              placeholder="Sort by"
              selectedKeys={[sortBy]}
              onSelectionChange={(keys) =>
                setSortBy(Array.from(keys)[0] as any)
              }
              className="w-full md:w-48"
            >
              <SelectItem
                key="date"
                startContent={<Calendar className="w-4 h-4" />}
              >
                Last Modified
              </SelectItem>
              <SelectItem
                key="name"
                startContent={<Filter className="w-4 h-4" />}
              >
                Name
              </SelectItem>
              <SelectItem
                key="size"
                startContent={<HardDrive className="w-4 h-4" />}
              >
                File Size
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Tabs for different upload paths */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as UploadPath)}
            variant="underlined"
            fullWidth
          >
            <Tab
              key="products"
              title={
                <div className="flex items-center space-x-2">
                  <span>Products</span>
                  <Chip size="sm" variant="flat">
                    {summary?.products || 0}
                  </Chip>
                </div>
              }
            >
              <div className="p-6">
                {currentImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentImages.map((image) => (
                      <Card key={image.fileName} className="overflow-hidden">
                        <CardBody className="p-0">
                          <div className="relative aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={processImageUrl(image.url)}
                              alt={image.fileName}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => handleImageClick(image)}
                            />
                            {userCanDelete && (
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="flat"
                                  color={
                                    selectedImages.has(image.fileName)
                                      ? "primary"
                                      : "default"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleImageSelection(image.fileName);
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm truncate">
                                {image.fileName}
                              </h4>
                              <Chip size="sm" variant="flat">
                                {formatFileSize(image.size)}
                              </Chip>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                              {new Date(
                                image.lastModified
                              ).toLocaleDateString()}
                            </p>
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  isIconOnly
                                  onClick={() => handleImageClick(image)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Tooltip
                                  content={
                                    copiedUrl === image.url
                                      ? "Copied!"
                                      : "Copy URL"
                                  }
                                >
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    onClick={() => handleCopyUrl(image.url)}
                                  >
                                    {copiedUrl === image.url ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </Tooltip>
                              </div>
                              <Button
                                as="a"
                                href={image.url}
                                download={image.fileName}
                                size="sm"
                                variant="flat"
                                isIconOnly
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No images found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? "No images match your search criteria."
                        : "No images uploaded yet."}
                    </p>
                  </div>
                )}
              </div>
            </Tab>

            <Tab
              key="homepage"
              title={
                <div className="flex items-center space-x-2">
                  <span>Homepage</span>
                  <Chip size="sm" variant="flat">
                    {summary?.homepage || 0}
                  </Chip>
                </div>
              }
            >
              <div className="p-6">
                {/* Same layout as products tab but for homepage images */}
                {currentImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentImages.map((image) => (
                      <Card key={image.fileName} className="overflow-hidden">
                        <CardBody className="p-0">
                          <div className="relative aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={processImageUrl(image.url)}
                              alt={image.fileName}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => handleImageClick(image)}
                            />
                            {userCanDelete && (
                              <div className="absolute top-2 right-2">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="flat"
                                  color={
                                    selectedImages.has(image.fileName)
                                      ? "primary"
                                      : "default"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleImageSelection(image.fileName);
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm truncate">
                                {image.fileName}
                              </h4>
                              <Chip size="sm" variant="flat">
                                {formatFileSize(image.size)}
                              </Chip>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                              {new Date(
                                image.lastModified
                              ).toLocaleDateString()}
                            </p>
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  isIconOnly
                                  onClick={() => handleImageClick(image)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Tooltip
                                  content={
                                    copiedUrl === image.url
                                      ? "Copied!"
                                      : "Copy URL"
                                  }
                                >
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    onClick={() => handleCopyUrl(image.url)}
                                  >
                                    {copiedUrl === image.url ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </Tooltip>
                              </div>
                              <Button
                                as="a"
                                href={image.url}
                                download={image.fileName}
                                size="sm"
                                variant="flat"
                                isIconOnly
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No homepage images found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? "No images match your search criteria."
                        : "No homepage images uploaded yet."}
                    </p>
                  </div>
                )}
              </div>
            </Tab>

            <Tab
              key="utils"
              title={
                <div className="flex items-center space-x-2">
                  <span>Utils</span>
                  <Chip size="sm" variant="flat">
                    {summary?.utils || 0}
                  </Chip>
                </div>
              }
            >
              <div className="p-6">
                {/* Same layout as other tabs but for utils images */}
                {currentImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentImages.map((image) => (
                      <Card key={image.fileName} className="overflow-hidden">
                        <CardBody className="p-0">
                          <div className="relative aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={processImageUrl(image.url)}
                              alt={image.fileName}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => handleImageClick(image)}
                            />
                            {userCanDelete && (
                              <div className="absolute top-2 right-2">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="flat"
                                  color={
                                    selectedImages.has(image.fileName)
                                      ? "primary"
                                      : "default"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleImageSelection(image.fileName);
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm truncate">
                                {image.fileName}
                              </h4>
                              <Chip size="sm" variant="flat">
                                {formatFileSize(image.size)}
                              </Chip>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                              {new Date(
                                image.lastModified
                              ).toLocaleDateString()}
                            </p>
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  isIconOnly
                                  onClick={() => handleImageClick(image)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Tooltip
                                  content={
                                    copiedUrl === image.url
                                      ? "Copied!"
                                      : "Copy URL"
                                  }
                                >
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    onClick={() => handleCopyUrl(image.url)}
                                  >
                                    {copiedUrl === image.url ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </Tooltip>
                              </div>
                              <Button
                                as="a"
                                href={image.url}
                                download={image.fileName}
                                size="sm"
                                variant="flat"
                                isIconOnly
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No utility images found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? "No images match your search criteria."
                        : "No utility images uploaded yet."}
                    </p>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        image={selectedImage}
        isOpen={isOpen}
        onClose={onClose}
        onDelete={() => {}}
        userCanDelete={userCanDelete}
      />
    </div>
  );
};

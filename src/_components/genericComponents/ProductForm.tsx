"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Divider,
  CheckboxGroup,
  Checkbox,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SafeImage from "@/_components/genericComponents/SafeImage";
import PermissionDenied from "@/_components/genericComponents/PermissionDenied";
import { ArrowLeft, Plus, X, Save, AlertCircle } from "lucide-react";
import {
  useAddProductMutation,
  useEditProductMutation,
  type Product,
  type AddProductRequest,
  type EditProductRequest,
} from "@/_lib/rtkQuery/productDashboardRTKQuery";
import { productCategoryMapping } from "@/_lib/utils/utils";
import TinyMceTextEditor from "@/_components/genericComponents/tinyMceEditor";

// Available sizes
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free"];

// Available colors
const AVAILABLE_COLORS = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Black",
  "White",
  "Gray",
  "Brown",
  "Navy",
  "Maroon",
  "Teal",
  "Lime",
  "Indigo",
  "Cyan",
  "Magenta",
  "Silver",
  "Gold",
];

// Utility function to validate URL
const isValidUrl = (string: string) => {
  try {
    if (string.startsWith("www.")) {
      new URL(`https://${string}`);
      return true;
    }
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Helper function to format URL for use
const formatUrl = (url: string) => {
  if (url.startsWith("www.")) {
    return `https://${url}`;
  }
  return url;
};

interface PriceItem {
  size: string;
  price: string;
}

interface ProductFormProps {
  mode: "add" | "edit";
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({
  mode,
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const [addProduct, { isLoading: isAdding, error: addError }] =
    useAddProductMutation();
  const [editProduct, { isLoading: isEditing, error: editError }] =
    useEditProductMutation();

  const isLoading = isAdding || isEditing;
  const error = addError || editError;

  // Form state
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    thumbnail: "",
    description: "",
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        productName: product.productName,
        category: product.category,
        thumbnail: product.thumbnail,
        description: product.description || "",
      });

      setSelectedSizes(product.size);
      setSelectedColors(product.color);

      // Format image URLs
      const formattedImages = (product.images || []).map((img) =>
        formatUrl(img)
      );
      setImages(formattedImages);

      // Format thumbnail URL for preview
      if (product.thumbnail) {
        const formattedThumbnailUrl = formatUrl(product.thumbnail);
        setThumbnailPreview(formattedThumbnailUrl);
      }

      // Convert prices to the right format
      const priceItems = product.price.map((p) => ({
        size: p.size,
        price: p.price.toString(),
      }));
      setPrices(priceItems);
    } else if (mode === "add") {
      // Set defaults for add mode
      setSelectedSizes(["Free"]);
      setPrices([{ size: "Free", price: "" }]);
    }
  }, [mode, product]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle thumbnail URL change with preview
  const handleThumbnailChange = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbnail: url }));
    setThumbnailPreview("");

    // Clear any existing thumbnail errors
    if (errors.thumbnail) {
      setErrors((prev) => ({ ...prev, thumbnail: "" }));
    }

    // If URL is empty, just clear everything
    if (!url.trim()) {
      return;
    }

    if (isValidUrl(url)) {
      // Format URL and validate with preview
      const formattedUrl = formatUrl(url);
      const img = new window.Image();
      img.onload = () => {
        setThumbnailPreview(formattedUrl);
        // Clear error on successful load
        setErrors((prev) => ({ ...prev, thumbnail: "" }));
      };
      img.onerror = () => {
        setThumbnailPreview("");
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Invalid image URL or image failed to load",
        }));
      };
      img.src = formattedUrl;
    } else {
      setErrors((prev) => ({ ...prev, thumbnail: "Please enter a valid URL" }));
    }
  };

  // Handle size selection changes
  const handleSizeChange = (sizes: string[]) => {
    setSelectedSizes(sizes);

    // Update prices array to match selected sizes
    const newPrices = sizes.map((size) => {
      const existingPrice = prices.find((p) => p.size === size);
      return existingPrice || { size, price: "" };
    });
    setPrices(newPrices);
  };

  // Handle price changes
  const handlePriceChange = (size: string, price: string) => {
    setPrices((prev) =>
      prev.map((p) => (p.size === size ? { ...p, price } : p))
    );
  };

  // Add image URL
  const addImage = () => {
    const url = imageInput.trim();
    if (url && isValidUrl(url)) {
      const formattedUrl = formatUrl(url);
      if (!images.includes(formattedUrl)) {
        setImages((prev) => [...prev, formattedUrl]);
        setImageInput("");
      }
    } else if (url) {
      console.warn("Invalid image URL");
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.thumbnail.trim()) {
      newErrors.thumbnail = "Thumbnail URL is required";
    }

    if (selectedSizes.length === 0) {
      newErrors.sizes = "At least one size must be selected";
    }

    // Validate prices
    const invalidPrices = prices.filter(
      (p) => !p.price || isNaN(Number(p.price)) || Number(p.price) <= 0
    );
    if (invalidPrices.length > 0) {
      newErrors.prices = "All selected sizes must have valid prices";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        productName: formData.productName.trim(),
        category: formData.category,
        size: selectedSizes,
        thumbnail: formatUrl(formData.thumbnail.trim()),
        images: images,
        price: prices.map((p) => ({ size: p.size, price: p.price })),
        color: selectedColors,
        description: formData.description.trim() || undefined,
      };

      if (mode === "add") {
        await addProduct(payload as AddProductRequest).unwrap();
      } else if (mode === "edit" && product) {
        await editProduct({
          id: product._id,
          ...payload,
        } as EditProductRequest & { id: string }).unwrap();
      }

      // Success callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/productList");
      }
    } catch (err: any) {
      if (err?.status === 401) {
        alert(
          "You don't have permission to save product data. Please contact your super admin."
        );
      } else {
        console.error(`Failed to ${mode} product:`, err);
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="space-y-8">
      {/* Error State */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50/90 to-rose-50/90 rounded-2xl border border-red-200/50 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">
                Failed to {mode} product
              </h3>
              <div className="text-red-600 text-sm mt-1">
                {(error as any)?.data?.message ||
                  "Please check your input and try again"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-lg sm:rounded-xl lg:rounded-2xl border border-blue-100/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          Basic Information
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
          <div>
            <Input
              label="Product Name"
              placeholder="Enter product name"
              value={formData.productName}
              onChange={(e) => handleInputChange("productName", e.target.value)}
              isRequired
              errorMessage={errors.productName}
              isInvalid={!!errors.productName}
              className="bg-white/80 backdrop-blur-sm"
              classNames={{
                input: "text-sm sm:text-base",
                label: "text-sm sm:text-base",
                inputWrapper: "min-h-[44px] sm:min-h-[40px]",
              }}
              size="sm"
            />
          </div>

          <div>
            <Select
              label="Category"
              placeholder="Select a category"
              selectedKeys={formData.category ? [formData.category] : []}
              onSelectionChange={(keys) =>
                handleInputChange("category", Array.from(keys)[0] as string)
              }
              isRequired
              errorMessage={errors.category}
              isInvalid={!!errors.category}
              className="bg-white/80 backdrop-blur-sm"
              classNames={{
                trigger: "min-h-[44px] sm:min-h-[40px]",
                label: "text-sm sm:text-base",
                value: "text-sm sm:text-base",
              }}
              size="sm"
            >
              {Object.entries(productCategoryMapping).map(([key, label]) => (
                <SelectItem key={key}>{label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Thumbnail Image */}
      <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-lg sm:rounded-xl lg:rounded-2xl border border-purple-100/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
          Thumbnail Image
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
          <div>
            <Input
              label="Thumbnail URL"
              placeholder="https://example.com/image.jpg"
              value={formData.thumbnail}
              onChange={(e) => handleThumbnailChange(e.target.value)}
              isRequired
              errorMessage={errors.thumbnail}
              isInvalid={!!errors.thumbnail}
              description="Enter a direct link to the product thumbnail image"
              className="bg-white/80 backdrop-blur-sm"
              classNames={{
                input: "text-sm sm:text-base",
                label: "text-sm sm:text-base",
                inputWrapper: "min-h-[44px] sm:min-h-[40px]",
              }}
              size="sm"
            />
          </div>

          <div>
            {thumbnailPreview && (
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="relative w-full h-32 sm:h-40 lg:h-48 border-2 border-purple-200 rounded-lg sm:rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg">
                  <SafeImage
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={() => {
                      setThumbnailPreview("");
                      setErrors((prev) => ({
                        ...prev,
                        thumbnail: "Failed to load image preview",
                      }));
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sizes and Pricing */}
      <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-orange-50/80 to-amber-50/80 rounded-lg sm:rounded-xl lg:rounded-2xl border border-orange-100/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"></div>
          Sizes & Pricing
        </h3>

        {/* Size Selection */}
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            Available Sizes *
          </label>
          <CheckboxGroup
            value={selectedSizes}
            onValueChange={handleSizeChange}
            orientation="horizontal"
            classNames={{
              wrapper: "gap-2 sm:gap-4",
            }}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
              {AVAILABLE_SIZES.map((size) => (
                <div
                  key={size}
                  className="flex items-center gap-1 sm:gap-2 p-2 sm:p-2.5 bg-white/80 backdrop-blur-sm rounded-lg hover:shadow-md transition-all duration-300 touch-manipulation min-h-[44px] sm:min-h-[40px]"
                >
                  <Checkbox value={size} size="sm" />
                  <span className="font-medium text-gray-700 text-xs sm:text-sm leading-tight">
                    {size}
                  </span>
                </div>
              ))}
            </div>
          </CheckboxGroup>
          {errors.sizes && (
            <p className="text-red-600 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              {errors.sizes}
            </p>
          )}
        </div>

        {/* Price Input */}
        {selectedSizes.length > 0 && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              Prices for Selected Sizes *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              {prices.map((priceItem) => (
                <div
                  key={priceItem.size}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 hover:shadow-md transition-all duration-300"
                >
                  <Input
                    label={`${priceItem.size} Price`}
                    placeholder="0.00"
                    value={priceItem.price}
                    onChange={(e) =>
                      handlePriceChange(priceItem.size, e.target.value)
                    }
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">₹</span>
                      </div>
                    }
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-transparent"
                    classNames={{
                      input: "text-sm sm:text-base",
                      label: "text-xs sm:text-sm",
                      inputWrapper: "min-h-[44px] sm:min-h-[40px]",
                    }}
                    size="sm"
                  />
                </div>
              ))}
            </div>
            {errors.prices && (
              <p className="text-red-600 text-xs sm:text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                {errors.prices}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-pink-50/80 to-rose-50/80 rounded-lg sm:rounded-xl lg:rounded-2xl border border-pink-100/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"></div>
          Available Colors
        </h3>
        <CheckboxGroup
          value={selectedColors}
          onValueChange={setSelectedColors}
          orientation="horizontal"
          classNames={{
            wrapper: "gap-2 sm:gap-4",
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {AVAILABLE_COLORS.map((color) => (
              <div
                key={color}
                className="flex items-center gap-1 sm:gap-2 p-2 sm:p-2.5 bg-white/80 backdrop-blur-sm rounded-lg hover:shadow-md transition-all duration-300 touch-manipulation min-h-[44px] sm:min-h-[40px]"
              >
                <Checkbox value={color} size="sm">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span className="font-medium text-gray-700 text-xs sm:text-sm leading-tight truncate">
                      {color}
                    </span>
                  </div>
                </Checkbox>
              </div>
            ))}
          </div>
        </CheckboxGroup>
      </div>

      {/* Additional Images */}
      <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-lg sm:rounded-xl lg:rounded-2xl border border-emerald-100/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
          Additional Images
        </h3>

        {/* Add Image Input */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addImage()}
            className="flex-1 bg-white/80 backdrop-blur-sm"
            classNames={{
              input: "text-sm sm:text-base",
              inputWrapper: "min-h-[44px] sm:min-h-[40px]",
            }}
            size="sm"
          />
          <Button
            onClick={addImage}
            startContent={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation min-h-[44px] sm:min-h-[40px]"
            size="sm"
          >
            <span className="hidden sm:inline">Add Image</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-20 sm:h-24 lg:h-32 border-2 border-emerald-200 rounded-lg sm:rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <SafeImage
                    priority={true}
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    onError={() => {
                      console.log("Failed to load product image:", imageUrl);
                      removeImage(index);
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                    <Button
                      onClick={() => removeImage(index)}
                      color="danger"
                      variant="solid"
                      size="sm"
                      isIconOnly
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg min-w-8 h-8"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-cyan-50/80 to-blue-50/80 rounded-lg sm:rounded-xl lg:rounded-2xl border border-cyan-100/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          Product Description
        </h3>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
          <TinyMceTextEditor
            label="Description"
            initialValue={formData.description}
            onChange={(content) => handleInputChange("description", content)}
            error=""
            required={false}
          />
        </div>
      </div>

      {/* Submit Actions */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200/50">
        <Button
          onClick={handleCancel}
          variant="bordered"
          className="w-full sm:w-auto border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 touch-manipulation min-h-[44px] sm:min-h-[40px]"
          size="sm"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          isLoading={isLoading}
          startContent={!isLoading && <Save className="w-4 h-4" />}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation min-h-[44px] sm:min-h-[40px]"
          size="sm"
        >
          {isLoading
            ? mode === "add"
              ? "Creating..."
              : "Updating..."
            : mode === "add"
            ? "Create Product"
            : "Update Product"}
        </Button>
      </div>
    </div>
  );
}

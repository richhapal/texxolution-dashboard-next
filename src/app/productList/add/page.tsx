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
  Chip,
  Textarea,
  Divider,
  CheckboxGroup,
  Checkbox,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Eye,
  Save,
  AlertCircle,
} from "lucide-react";
import { useAddProductMutation } from "@/_lib/rtkQuery/productDashboardRTKQuery";
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
    // If the string starts with www., add https:// protocol
    if (string.startsWith("www.")) {
      new URL(`https://${string}`);
      return true;
    }
    // Otherwise, try to parse as is
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

export default function AddProductPage() {
  const router = useRouter();
  const [addProduct, { isLoading, error, isSuccess }] = useAddProductMutation();

  // Form state
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    thumbnail: "",
    description: "",
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>(["Free"]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [prices, setPrices] = useState<PriceItem[]>([
    { size: "Free", price: "" },
  ]);
  const [imageInput, setImageInput] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // Could add a toast notification here for invalid URL
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

      await addProduct(payload).unwrap();

      // Success - redirect to product list
      router.push("/productList");
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  // Success redirect
  useEffect(() => {
    if (isSuccess) {
      router.push("/productList");
    }
  }, [isSuccess, router]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/productList" className="hover:text-blue-600">
            Product Categories
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Add New Product</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Add New Product
            </h1>
            <p className="text-gray-600">
              Create a new product entry with all the required details
            </p>
          </div>

          <Button
            onClick={() => router.back()}
            variant="ghost"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">
                Failed to add product
              </h3>
              <div className="text-red-600 text-sm mt-1">
                {(error as any)?.data?.message ||
                  "Please check your input and try again"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Product Information</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Product Name"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={(e) =>
                  handleInputChange("productName", e.target.value)
                }
                isRequired
                errorMessage={errors.productName}
                isInvalid={!!errors.productName}
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
              >
                {Object.entries(productCategoryMapping).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <Divider />

          {/* Thumbnail */}
          <div>
            <Input
              label="Thumbnail URL"
              placeholder="Enter image URL"
              value={formData.thumbnail}
              onChange={(e) => handleThumbnailChange(e.target.value)}
              isRequired
              errorMessage={errors.thumbnail}
              isInvalid={!!errors.thumbnail}
              description="Enter a valid image URL for the product thumbnail"
            />

            {thumbnailPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Preview:
                </p>
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images (Optional)
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Enter image URL"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={addImage}
                startContent={<Plus className="w-4 h-4" />}
                disabled={!imageInput.trim()}
              >
                Add
              </Button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="w-full h-24 border rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Additional image ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      isIconOnly
                      color="danger"
                      variant="solid"
                      className="absolute -top-2 -right-2"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Sizes <span className="text-red-500">*</span>
            </label>
            <CheckboxGroup
              value={selectedSizes}
              onValueChange={handleSizeChange}
              orientation="horizontal"
              className="gap-4"
            >
              {AVAILABLE_SIZES.map((size) => (
                <Checkbox key={size} value={size}>
                  {size}
                </Checkbox>
              ))}
            </CheckboxGroup>
            {errors.sizes && (
              <p className="text-red-500 text-sm mt-1">{errors.sizes}</p>
            )}
          </div>

          {/* Prices */}
          {selectedSizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prices.map((priceItem) => (
                  <div key={priceItem.size} className="flex items-center gap-3">
                    <Chip color="primary" variant="flat" className="min-w-12">
                      {priceItem.size}
                    </Chip>
                    <Input
                      placeholder="Enter price"
                      value={priceItem.price}
                      onChange={(e) =>
                        handlePriceChange(priceItem.size, e.target.value)
                      }
                      type="number"
                      startContent="₹"
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              {errors.prices && (
                <p className="text-red-500 text-sm mt-1">{errors.prices}</p>
              )}
            </div>
          )}

          <Divider />

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Colors (Optional)
            </label>
            <CheckboxGroup
              value={selectedColors}
              onValueChange={setSelectedColors}
              className="gap-4"
            >
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {AVAILABLE_COLORS.map((color) => (
                  <Checkbox key={color} value={color}>
                    {color}
                  </Checkbox>
                ))}
              </div>
            </CheckboxGroup>
          </div>

          <Divider />

          {/* Description */}
          <div>
            <TinyMceTextEditor
              label="Product Description"
              initialValue={formData.description}
              onChange={(content) => handleInputChange("description", content)}
              error={errors.description || ""}
              required={false}
            />
          </div>

          <Divider />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="flat" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit}
              isLoading={isLoading}
              startContent={<Save className="w-4 h-4" />}
            >
              Add Product
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

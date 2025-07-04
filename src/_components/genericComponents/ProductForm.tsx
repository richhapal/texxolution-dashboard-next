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
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/productList" className="hover:text-blue-600">
            Product Categories
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === "add" ? "Add New Product" : "Edit Product"}
            </h1>
            <p className="text-gray-600">
              {mode === "add"
                ? "Create a new product entry with all the required details"
                : "Update product information and details"}
            </p>
          </div>

          <Button
            onClick={handleCancel}
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

          {/* Thumbnail Image */}
          <div>
            <h3 className="text-lg font-medium mb-4">Thumbnail Image</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Thumbnail URL"
                  placeholder="https://example.com/image.jpg or www.example.com/image.jpg"
                  value={formData.thumbnail}
                  onChange={(e) => handleThumbnailChange(e.target.value)}
                  isRequired
                  errorMessage={errors.thumbnail}
                  isInvalid={!!errors.thumbnail}
                  description="Enter a direct link to the product thumbnail image"
                />
              </div>

              <div>
                {thumbnailPreview && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <SafeImage
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
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

          <Divider />

          {/* Sizes and Pricing */}
          <div>
            <h3 className="text-lg font-medium mb-4">Sizes & Pricing</h3>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Sizes *
              </label>
              <CheckboxGroup
                value={selectedSizes}
                onValueChange={handleSizeChange}
                orientation="horizontal"
                classNames={{
                  wrapper: "gap-4",
                }}
              >
                {AVAILABLE_SIZES.map((size) => (
                  <Checkbox key={size} value={size}>
                    {size}
                  </Checkbox>
                ))}
              </CheckboxGroup>
              {errors.sizes && (
                <p className="text-red-600 text-sm mt-1">{errors.sizes}</p>
              )}
            </div>

            {/* Price Input */}
            {selectedSizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Prices for Selected Sizes *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prices.map((priceItem) => (
                    <Input
                      key={priceItem.size}
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
                    />
                  ))}
                </div>
                {errors.prices && (
                  <p className="text-red-600 text-sm mt-2">{errors.prices}</p>
                )}
              </div>
            )}
          </div>

          <Divider />

          {/* Colors */}
          <div>
            <h3 className="text-lg font-medium mb-4">Available Colors</h3>
            <CheckboxGroup
              value={selectedColors}
              onValueChange={setSelectedColors}
              orientation="horizontal"
              classNames={{
                wrapper: "gap-4",
              }}
            >
              {AVAILABLE_COLORS.map((color) => (
                <Checkbox key={color} value={color}>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span>{color}</span>
                  </div>
                </Checkbox>
              ))}
            </CheckboxGroup>
          </div>

          <Divider />

          {/* Additional Images */}
          <div>
            <h3 className="text-lg font-medium mb-4">Additional Images</h3>

            {/* Add Image Input */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="https://example.com/image.jpg or www.example.com/image.jpg"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addImage()}
                className="flex-1"
              />
              <Button
                onClick={addImage}
                color="primary"
                variant="flat"
                startContent={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <SafeImage
                        priority={true}
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        onError={() => {
                          console.log(
                            "Failed to load product image:",
                            imageUrl
                          );
                          // Remove the invalid image URL
                          removeImage(index);
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <Button
                          onClick={() => removeImage(index)}
                          color="danger"
                          variant="flat"
                          size="sm"
                          isIconOnly
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium mb-4">Product Description</h3>
            <TinyMceTextEditor
              label="Description"
              initialValue={formData.description}
              onChange={(content) => handleInputChange("description", content)}
              error=""
              required={false}
            />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button onClick={handleCancel} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="primary"
              isLoading={isLoading}
              startContent={!isLoading && <Save className="w-4 h-4" />}
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
        </CardBody>
      </Card>
    </div>
  );
}

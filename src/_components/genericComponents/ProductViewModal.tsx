import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Badge,
  Divider,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  Package,
  Calendar,
  Palette,
  Ruler,
  IndianRupee,
  X,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import {
  Product,
  useDeleteProductMutation,
} from "@/_lib/rtkQuery/productDashboardRTKQuery";
import SafeImage from "@/_components/genericComponents/SafeImage";

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

// Helper function to format image URLs - moved outside component to prevent re-renders
const formatImageUrl = (url: string) => {
  if (!url || url.trim() === "") {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23f3f4f6'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
  }

  // Clean the URL
  const cleanUrl = url.trim();

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith("www.")) {
    return `https://${cleanUrl}`;
  }

  // For relative paths or other formats, return as is
  return cleanUrl;
};

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const router = useRouter();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!product) return null;

  // Handle edit button click
  const handleEdit = () => {
    // Close modal
    onClose();

    // Navigate to edit page with category parameter
    router.push(
      `/productList/edit/${product._id}?category=${product.category}`
    );
  };

  // Handle delete button click
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm and execute delete
  const confirmDelete = async () => {
    try {
      await deleteProduct({ id: product._id }).unwrap();

      // Close modal and reset state
      setShowDeleteConfirm(false);
      onClose();

      // Optionally show success message or redirect
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to delete product:", error);
      // You could add error handling/toast here
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
        backdrop="opaque"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {product.productName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Category: {product.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.5</span>
              </div> */}
                <Badge color="success" variant="flat">
                  In Stock
                </Badge>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden">
                  <SafeImage
                    src={product.thumbnail}
                    alt={product.productName}
                    width={400}
                    height={320}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={true}
                    onError={() => {
                      console.log("Failed to load image:", product.thumbnail);
                    }}
                  />
                </div>

                {/* Additional Images */}
                {product.images && product.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.slice(0, 3).map((image, index) => (
                      <div
                        key={index}
                        className="h-24 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80"
                      >
                        <SafeImage
                          src={image}
                          alt={`${product.productName} - ${index + 1}`}
                          width={100}
                          height={96}
                          className="w-full h-full object-cover"
                          sizes="100px"
                          onError={() => {
                            console.log(
                              "Failed to load additional image:",
                              image
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Pricing */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5" />
                    Pricing (Exc. GST)
                  </h3>
                  <div className="space-y-2">
                    {product.price.map((priceItem, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-600">
                          Size: {priceItem.size}
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          ₹{priceItem?.price || priceItem?.basePrice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Sizes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    Available Sizes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size, index) => (
                      <Chip
                        key={index}
                        color="primary"
                        variant="flat"
                        size="sm"
                      >
                        {size}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                {product.color && product.color.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Available Colors
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.color.filter(Boolean).map((color, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-sm text-gray-600">
                              {color}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Divider />
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Description
                  </h3>
                  <div
                    className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description ||
                        "No description available for this product.",
                    }}
                  />
                </div>

                <Divider />

                {/* Timestamps */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Product Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-900">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product ID:</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {product._id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <div className="flex gap-2 w-full">
              <Button
                color="danger"
                variant="flat"
                startContent={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                color="warning"
                variant="flat"
                startContent={<Edit className="w-4 h-4" />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                color="default"
                variant="flat"
                onPress={onClose}
                className="ml-auto"
              >
                Close
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal isOpen={showDeleteConfirm} onClose={cancelDelete} size="md">
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold text-red-600">
                Confirm Delete
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="text-center py-4">
                <Trash2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Product
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete &quot;{product?.productName}
                  &quot;? This action cannot be undone.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex gap-2 w-full">
                <Button
                  color="default"
                  variant="flat"
                  onClick={cancelDelete}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onClick={confirmDelete}
                  isLoading={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ProductViewModal;

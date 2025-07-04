// Utility functions for image upload functionality

/**
 * Format file size from bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Generate unique ID for uploaded images
 */
export const generateImageId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Validate image file
 */
export const validateImageFile = (
  file: File,
  maxSizeBytes: number = 10 * 1024 * 1024, // 10MB default
  allowedTypes: string[] = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]
): { valid: boolean; error?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${
        file.type
      } is not supported. Please use: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${formatFileSize(
        file.size
      )}) exceeds the maximum allowed size (${formatFileSize(maxSizeBytes)})`,
    };
  }

  return { valid: true };
};

/**
 * Create preview URL for uploaded file
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Cleanup preview URLs to prevent memory leaks
 */
export const cleanupImagePreviews = (previewUrls: string[]): void => {
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
};

/**
 * Extract file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

/**
 * Generate a safe filename for S3 upload
 */
export const generateSafeFilename = (
  originalName: string,
  id: string
): string => {
  const extension = getFileExtension(originalName);
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_");
  return `${baseName}_${id}.${extension}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

/**
 * Copy multiple URLs to clipboard as a formatted list
 */
export const copyMultipleUrlsToClipboard = async (
  urls: string[]
): Promise<boolean> => {
  const urlList = urls.join("\n");
  return copyToClipboard(urlList);
};

/**
 * Download file from URL
 */
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Create a zip file download link for multiple images (placeholder)
 * In a real implementation, this would create a zip file on the server
 */
export const downloadMultipleImages = async (
  images: { url: string; name: string }[]
): Promise<void> => {
  // This is a placeholder implementation
  // In production, you would send the URLs to your backend to create a zip file
  console.log("Downloading multiple images:", images);

  // For now, download each image individually
  images.forEach((image, index) => {
    setTimeout(() => {
      downloadFile(image.url, image.name);
    }, index * 1000); // Stagger downloads to avoid overwhelming the browser
  });
};

/**
 * Check if the current device supports file drag and drop
 */
export const isDragAndDropSupported = (): boolean => {
  const div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
};

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

/**
 * Compress image if it's too large (basic implementation)
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Return original if compression fails
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Return original if loading fails
    };

    img.src = url;
  });
};

/**
 * Process image URL to ensure it's absolute and properly formatted
 * Handles cases where backend returns URLs without protocol
 */
export const processImageUrl = (url: string): string => {
  if (!url) return url;

  // If URL already has protocol, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If URL starts with //, add https protocol
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  // If URL starts with domain name without protocol, add https://
  if (url.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
    return `https://${url}`;
  }

  // If it's a relative URL starting with /, it might be an API endpoint
  // In this case, return as is and let the browser handle it
  return url;
};

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  onError?: () => void;
  onLoad?: () => void;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  sizes?: string;
}

// Helper function to format and validate image URLs
const formatImageUrl = (url: string): string => {
  if (!url || url.trim() === "") {
    return "";
  }

  const cleanUrl = url.trim();

  // If it already has protocol, return as is
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  // If it starts with www, add https protocol
  if (cleanUrl.startsWith("www.")) {
    return `https://${cleanUrl}`;
  }

  // For relative paths, return as is
  return cleanUrl;
};

// Generate a placeholder SVG
const generatePlaceholder = (
  width: number = 300,
  height: number = 200,
  text: string = "No Image"
): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' fill='%23f3f4f6'%3E%3Crect width='${width}' height='${height}' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='16'%3E${text}%3C/text%3E%3C/svg%3E`;
};

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width = 300,
  height = 200,
  className = "",
  fill = false,
  onError,
  onLoad,
  priority = false,
  placeholder = "empty",
  sizes,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processedSrc, setProcessedSrc] = useState("");

  // Process the source URL
  useEffect(() => {
    const formatted = formatImageUrl(src);
    setProcessedSrc(formatted);
    setImageError(!formatted); // Set error if no valid URL
    setIsLoading(!formatted ? false : true);
  }, [src]);

  const handleError = useCallback(() => {
    console.warn("SafeImage: Failed to load image:", processedSrc);
    setImageError(true);
    setIsLoading(false);
    onError?.();
  }, [processedSrc, onError]);

  const handleLoad = useCallback(() => {
    console.log("SafeImage: Image loaded successfully:", processedSrc);
    setIsLoading(false);
    onLoad?.();
  }, [processedSrc, onLoad]);

  // If there's an error or no valid src, show placeholder
  if (imageError || !processedSrc) {
    const placeholderSvg = generatePlaceholder(width, height, "No Image");

    return (
      <Image
        src={placeholderSvg}
        alt={`${alt} - Placeholder`}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={className}
        unoptimized={true}
        priority={priority}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={processedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      unoptimized={true}
      onError={handleError}
      onLoad={handleLoad}
      priority={priority}
      placeholder={placeholder}
      sizes={sizes}
      quality={85}
      style={{ objectFit: "cover" }}
    />
  );
};

export default SafeImage;

// Types for Image Upload functionality
export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  url?: string;
  status: "uploading" | "completed" | "error";
  progress: number;
  error?: string;
  size: string;
  name: string;
  fileName?: string;
  fullPath?: string;
  lastModified?: string;
}

export interface BackendImageFile {
  fileName: string;
  fullPath: string;
  url: string;
  size: number;
  lastModified: string;
}

export interface ImageListData {
  products: BackendImageFile[];
  homepage: BackendImageFile[];
  utils: BackendImageFile[];
}

export interface ImageListSummary {
  products: number;
  homepage: number;
  utils: number;
  total: number;
}

export interface ImageUploadConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  maxFiles?: number;
  uploadPath: "products" | "homepage" | "utils";
}

export interface UploadCallbacks {
  onProgress?: (imageId: string, progress: number) => void;
  onComplete?: (imageId: string, url: string) => void;
  onError?: (imageId: string, error: string) => void;
}

export type UploadPath = "products" | "homepage" | "utils";

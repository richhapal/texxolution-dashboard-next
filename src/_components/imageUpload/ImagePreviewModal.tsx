"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { Image as ImageIcon, Copy } from "lucide-react";
import { UploadedImage } from "./types";

interface ImagePreviewModalProps {
  image: UploadedImage | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyUrl?: (url: string) => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  isOpen,
  onClose,
  onCopyUrl,
}) => {
  if (!image) return null;

  const handleCopyUrl = () => {
    if (image.url && onCopyUrl) {
      onCopyUrl(image.url);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5" />
            <span className="truncate">{image.name}</span>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Image Display */}
          <div className="flex justify-center mb-4">
            <div className="relative max-w-full max-h-96 rounded-lg overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.preview}
                alt={image.name}
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          </div>

          {/* Image Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">File Name:</span>
                <p className="font-medium truncate">{image.name}</p>
              </div>
              <div>
                <span className="text-gray-500">File Size:</span>
                <p className="font-medium">{image.size}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium capitalize">{image.status}</p>
              </div>
              <div>
                <span className="text-gray-500">Format:</span>
                <p className="font-medium">{image.file.type}</p>
              </div>
            </div>

            {/* URL Section */}
            {image.status === "completed" && image.url && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-gray-700">
                  Image URL:
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    value={image.url}
                    readOnly
                    size="sm"
                    className="flex-1"
                    variant="bordered"
                  />
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={handleCopyUrl}
                    startContent={<Copy className="w-4 h-4" />}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          {image.status === "completed" && image.url && (
            <Button
              color="primary"
              onClick={handleCopyUrl}
              startContent={<Copy className="w-4 h-4" />}
            >
              Copy URL
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

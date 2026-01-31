"use client";

import { Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onUpload: (image: {
    url: string;
    publicId: string;
    alt: string;
    isPrimary: boolean;
  }) => void;
  disabled?: boolean;
  maxImages?: number;
  currentImageCount?: number;
}

export function ImageUpload({
  onUpload,
  disabled = false,
  maxImages = 10,
  currentImageCount = 0,
}: ImageUploadProps) {
  const isMaxReached = currentImageCount >= maxImages;

  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary-params"
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        maxFiles: maxImages - currentImageCount,
        multiple: true,
        sources: ["local", "camera", "url"],
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1",
          },
        },
      }}
      onSuccess={(result, { widget }) => {
        if (result?.info) {
          const info = result.info as {
            secure_url: string;
            public_id: string;
          };
          onUpload({
            url: info.secure_url,
            publicId: info.public_id,
            alt: "",
            isPrimary: false,
          });
        }
        widget.close();
      }}
      onQueuesEnd={(_result, { widget }) => {
        widget.close();
      }}
    >
      {({ open }) => (
        <Button
          type="button"
          variant="outline"
          onClick={() => open()}
          disabled={disabled || isMaxReached}
          className="w-full"
        >
          <Upload className="h-4 w-4 ml-2" />
          {isMaxReached ? `הגעת למקסימום (${maxImages} תמונות)` : "העלה תמונות"}
        </Button>
      )}
    </CldUploadWidget>
  );
}

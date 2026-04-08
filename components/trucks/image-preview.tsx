"use client";

import { Pencil, Star, Trash2, X } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_IMAGE_ALT_LENGTH } from "@/lib/validations/common";

interface TruckImage {
  id: string;
  url: string;
  publicId: string;
  alt: string | null;
  isPrimary: boolean;
  isNew?: boolean;
}

interface ImagePreviewProps {
  images: TruckImage[];
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateAlt: (id: string, alt: string) => void;
  disabled?: boolean;
}

export function ImagePreview({
  images,
  onSetPrimary,
  onDelete,
  onUpdateAlt,
  disabled = false,
}: ImagePreviewProps) {
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altText, setAltText] = useState("");

  const handleEditAlt = (image: TruckImage) => {
    setEditingAlt(image.id);
    setAltText(image.alt ?? "");
  };

  const handleSaveAlt = (imageId: string) => {
    onUpdateAlt(imageId, altText);
    setEditingAlt(null);
    setAltText("");
  };

  const handleCancelAlt = () => {
    setEditingAlt(null);
    setAltText("");
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        עדיין לא הועלו תמונות. לחץ על "העלה תמונות" כדי להתחיל.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className={`relative group border rounded-lg overflow-hidden ${
            image.isPrimary ? "ring-2 ring-primary" : ""
          }`}
        >
          {image.isPrimary && (
            <div className="absolute top-2 end-2 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              ראשית
            </div>
          )}

          <div className="relative aspect-square bg-muted">
            <CldImage
              width={300}
              height={300}
              src={image.publicId}
              alt={image.alt || "Truck image"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {!image.isPrimary && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => onSetPrimary(image.id)}
                disabled={disabled}
                title="קבע כראשית"
              >
                <Star className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => handleEditAlt(image)}
              disabled={disabled}
              title="ערוך טקסט"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => onDelete(image.id)}
              disabled={disabled}
              title="מחק"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {editingAlt === image.id && (
            <div className="absolute inset-0 bg-background/95 p-4 flex flex-col gap-2">
              <Label htmlFor={`alt-${image.id}`}>טקסט חלופי (Alt Text)</Label>
              <Input
                id={`alt-${image.id}`}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="תיאור קצר של התמונה..."
                maxLength={MAX_IMAGE_ALT_LENGTH}
                autoFocus
              />
              <div className="flex gap-2 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelAlt}
                >
                  <X className="h-4 w-4 ms-1" />
                  ביטול
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSaveAlt(image.id)}
                >
                  שמור
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

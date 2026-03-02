"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deleteImage,
  setPrimaryImage,
  updateImageAlt,
} from "@/app/actions/images";
import { createTruck, updateTruck } from "@/app/actions/trucks";
import { ImagePreview } from "@/components/trucks/image-preview";
import { ImageUpload } from "@/components/trucks/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITIES } from "@/lib/constants";
import type { CreateTruckInput, UpdateTruckInput } from "@/lib/validations";

interface TruckFormProps {
  truck?: {
    id: string;
    name: string;
    city: string;
    address: string;
  };
  images?: Array<{
    id: string;
    url: string;
    publicId: string;
    alt: string;
    isPrimary: boolean;
  }>;
}

interface FormData {
  name: string;
  city: string;
  address: string;
}

interface TruckImageData {
  id: string;
  url: string;
  publicId: string;
  alt: string | null;
  isPrimary: boolean;
  isNew?: boolean;
}

export function TruckForm({
  truck,
  images: initialImages = [],
}: TruckFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(
    truck || {
      name: "",
      city: "",
      address: "",
    },
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<TruckImageData[]>(initialImages);
  const [imageError, setImageError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "שם העגלה נדרש";
    } else if (formData.name.length > 100) {
      newErrors.name = "שם העגלה לא יכול לעלות על 100 תווים";
    }

    if (!formData.city.trim()) {
      newErrors.city = "עיר נדרשת";
    }

    if (!formData.address.trim()) {
      newErrors.address = "כתובת נדרשת";
    } else if (formData.address.length > 500) {
      newErrors.address = "הכתובת לא יכולה לעלות על 500 תווים";
    }

    setErrors(newErrors);

    if (images.length === 0) {
      setImageError("יש להעלות לפחות תמונה אחת");
    } else {
      setImageError(null);
    }

    return Object.keys(newErrors).length === 0 && images.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const imagesData = images.map((img) => ({
        id: img.isNew ? undefined : img.id,
        url: img.url,
        publicId: img.publicId,
        alt: img.alt,
        isPrimary: img.isPrimary,
      }));

      if (truck) {
        const input: UpdateTruckInput & { truckId: string } = {
          truckId: truck.id,
          name: formData.name,
          city: formData.city as UpdateTruckInput["city"],
          address: formData.address,
          images: imagesData,
        };
        const result = await updateTruck(input);

        if (!result.success) {
          setServerError(result.message || "שגיאה בשמירת העגלה");
          return;
        }
      } else {
        const input: CreateTruckInput = {
          name: formData.name,
          city: formData.city as CreateTruckInput["city"],
          address: formData.address,
          images: imagesData,
        };
        const result = await createTruck(input);

        if (!result.success) {
          setServerError(result.message || "שגיאה בשמירת העגלה");
          return;
        }
      }

      router.push("/trucks");
      router.refresh();
    } catch (error) {
      console.error("Error submitting truck:", error);
      setServerError("שגיאה בשמירת העגלה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageUpload = (image: Omit<TruckImageData, "id">) => {
    setImages((prev) => [
      ...prev,
      {
        ...image,
        id: `temp-${Date.now()}`,
        isNew: true,
      },
    ]);
    setImageError(null);
  };

  const handleSetPrimary = async (imageId: string) => {
    const truckId = truck?.id;
    if (!truckId) {
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        })),
      );
      return;
    }

    const result = await setPrimaryImage({ imageId, truckId });
    if (!result.success) {
      setServerError(result.message || "שגיאה בעדכון התמונה הראשית");
    } else {
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        })),
      );
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const truckId = truck?.id;
    if (!truckId) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      return;
    }

    const result = await deleteImage({ imageId, truckId });
    if (!result.success) {
      setServerError(result.message || "שגיאה במחיקת התמונה");
    } else {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  const handleUpdateAlt = async (imageId: string, alt: string) => {
    const result = await updateImageAlt({ imageId, alt });
    if (!result.success) {
      setServerError(result.message || "שגיאה בעדכון טקסט התמונה");
    } else {
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, alt } : img)),
      );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {truck ? "עריכת עגלת קפה" : "הוספת עגלת קפה חדשה"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">שם העגלה *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="לדוגמה: קפה המומחים"
              required
              maxLength={100}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">עיר *</Label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">בחר עיר</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">כתובת *</Label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="לדוגמה: רחוב דיזנגוף 1"
              required
              maxLength={500}
              rows={3}
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label>תמונות *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                העלה עד 10 תמונות. סמן אחת כראשית.
              </p>
            </div>

            <ImageUpload
              onUpload={handleImageUpload}
              disabled={isSubmitting}
              maxImages={10}
              currentImageCount={images.length}
            />

            {imageError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {imageError}
              </div>
            )}

            <ImagePreview
              images={images}
              onSetPrimary={handleSetPrimary}
              onDelete={handleDeleteImage}
              onUpdateAlt={handleUpdateAlt}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "שומר..." : truck ? "עדכון" : "שמירה"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

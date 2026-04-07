"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { safeAction, withAuth } from "@/lib/safe-action";
import { canModifyTruck } from "@/lib/truck-permissions";
import {
  type DeleteImageInput,
  deleteImageSchema,
  type SetPrimaryImageInput,
  setPrimaryImageSchema,
  type UpdateImageAltInput,
  updateImageAltSchema,
} from "@/lib/validations";

export async function deleteImage(input: DeleteImageInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = deleteImageSchema.parse(input);

      const image = await prisma.coffeeTruckImage.findUnique({
        where: { id: validated.imageId },
        include: { truck: { select: { ownerId: true } } },
      });
      if (!image) {
        return { success: false, message: "התמונה לא נמצאה" } as ActionResult;
      }

      if (!(await canModifyTruck(userId, image.truck.ownerId))) {
        return {
          success: false,
          message: "אינך מורשה לבצע פעולה זו",
        } as ActionResult;
      }

      const isPrimary = image.isPrimary;
      const truckImages = await prisma.coffeeTruckImage.findMany({
        where: { truckId: validated.truckId },
        orderBy: { createdAt: "asc" },
      });

      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
      }

      await prisma.coffeeTruckImage.delete({
        where: { id: validated.imageId },
      });

      if (isPrimary && truckImages.length > 1) {
        const nextImage = truckImages.find(
          (img) => img.id !== validated.imageId,
        );
        if (nextImage) {
          await prisma.coffeeTruckImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true },
          });
        }
      }

      revalidatePath("/trucks");
      revalidatePath(`/trucks/${validated.truckId}`);
      revalidatePath(`/trucks/${validated.truckId}/edit`);
      return { success: true as const };
    }, "שגיאה במחיקת התמונה");
  });
}

export async function setPrimaryImage(input: SetPrimaryImageInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = setPrimaryImageSchema.parse(input);

      const truck = await prisma.coffeeTruck.findUnique({
        where: { id: validated.truckId },
        select: { ownerId: true },
      });
      if (!truck) {
        return { success: false, message: "העגלה לא נמצאה" } as ActionResult;
      }

      if (!(await canModifyTruck(userId, truck.ownerId))) {
        return {
          success: false,
          message: "אינך מורשה לבצע פעולה זו",
        } as ActionResult;
      }

      const image = await prisma.coffeeTruckImage.findUnique({
        where: { id: validated.imageId },
        select: { truckId: true },
      });
      if (!image || image.truckId !== validated.truckId) {
        return {
          success: false,
          message: "התמונה לא שייכת לעגלה זו",
        } as ActionResult;
      }

      await prisma.$transaction([
        prisma.coffeeTruckImage.updateMany({
          where: { truckId: validated.truckId },
          data: { isPrimary: false },
        }),
        prisma.coffeeTruckImage.update({
          where: { id: validated.imageId },
          data: { isPrimary: true },
        }),
      ]);

      revalidatePath("/trucks");
      revalidatePath(`/trucks/${validated.truckId}`);
      revalidatePath(`/trucks/${validated.truckId}/edit`);
      return { success: true as const };
    }, "שגיאה בעדכון התמונה הראשית");
  });
}

export async function updateImageAlt(input: UpdateImageAltInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = updateImageAltSchema.parse(input);

      const image = await prisma.coffeeTruckImage.findUnique({
        where: { id: validated.imageId },
        include: { truck: { select: { ownerId: true } } },
      });
      if (!image) {
        return { success: false, message: "התמונה לא נמצאה" } as ActionResult;
      }

      if (!(await canModifyTruck(userId, image.truck.ownerId))) {
        return {
          success: false,
          message: "אינך מורשה לבצע פעולה זו",
        } as ActionResult;
      }

      await prisma.coffeeTruckImage.update({
        where: { id: validated.imageId },
        data: { alt: validated.alt },
      });

      revalidatePath("/trucks");
      revalidatePath(`/trucks/${image.truckId}`);
      return { success: true as const };
    }, "שגיאה בעדכון טקסט התמונה");
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ZodError } from "zod";
import type { ActionResult } from "@/lib/actions";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { canModifyTruck } from "@/lib/truck-permissions";
import {
  type DeleteImageInput,
  deleteImageSchema,
  type SetPrimaryImageInput,
  setPrimaryImageSchema,
  type UpdateImageAltInput,
  updateImageAltSchema,
} from "@/lib/validations";

export async function deleteImage(
  input: DeleteImageInput,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = deleteImageSchema.parse(input);

    const image = await prisma.coffeeTruckImage.findUnique({
      where: { id: validated.imageId },
      include: {
        truck: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!image) {
      return { success: false, message: "התמונה לא נמצאה" };
    }

    const canModify = await canModifyTruck(
      session.user.id,
      image.truck.ownerId,
    );
    if (!canModify) {
      return { success: false, message: "אינך מורשה לבצע פעולה זו" };
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
      const nextImage = truckImages.find((img) => img.id !== validated.imageId);
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

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error deleting image:", error);
    return { success: false, message: "שגיאה במחיקת התמונה" };
  }
}

export async function setPrimaryImage(
  input: SetPrimaryImageInput,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = setPrimaryImageSchema.parse(input);

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: validated.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    const canModify = await canModifyTruck(session.user.id, truck.ownerId);
    if (!canModify) {
      return { success: false, message: "אינך מורשה לבצע פעולה זו" };
    }

    const image = await prisma.coffeeTruckImage.findUnique({
      where: { id: validated.imageId },
      select: { truckId: true },
    });

    if (!image || image.truckId !== validated.truckId) {
      return { success: false, message: "התמונה לא שייכת לעגלה זו" };
    }

    await prisma.coffeeTruckImage.updateMany({
      where: { truckId: validated.truckId },
      data: { isPrimary: false },
    });

    await prisma.coffeeTruckImage.update({
      where: { id: validated.imageId },
      data: { isPrimary: true },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${validated.truckId}`);
    revalidatePath(`/trucks/${validated.truckId}/edit`);

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error setting primary image:", error);
    return { success: false, message: "שגיאה בעדכון התמונה הראשית" };
  }
}

export async function updateImageAlt(
  input: UpdateImageAltInput,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = updateImageAltSchema.parse(input);

    const image = await prisma.coffeeTruckImage.findUnique({
      where: { id: validated.imageId },
      include: {
        truck: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!image) {
      return { success: false, message: "התמונה לא נמצאה" };
    }

    const canModify = await canModifyTruck(
      session.user.id,
      image.truck.ownerId,
    );
    if (!canModify) {
      return { success: false, message: "אינך מורשה לבצע פעולה זו" };
    }

    await prisma.coffeeTruckImage.update({
      where: { id: validated.imageId },
      data: { alt: validated.alt },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${image.truckId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error updating image alt:", error);
    return { success: false, message: "שגיאה בעדכון טקסט התמונה" };
  }
}

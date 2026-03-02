"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocoding";
import {
  createTruckSchema,
  updateTruckSchema,
  deleteTruckSchema,
  type CreateTruckInput,
  type UpdateTruckInput,
  type DeleteTruckInput,
} from "@/lib/validations";
import { ZodError } from "zod";
import type { Role } from "@generated/prisma/client";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; message: string };

async function getUserRole(userId: string): Promise<Role | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

async function canModifyTruck(
  userId: string,
  truckOwnerId: string
): Promise<boolean> {
  if (userId === truckOwnerId) return true;
  const role = await getUserRole(userId);
  return role === "ADMIN";
}

export async function createTruck(
  input: CreateTruckInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const role = await getUserRole(session.user.id);

    if (role !== "TRUCK_OWNER" && role !== "ADMIN") {
      return { success: false, message: "רק בעלי עגלות יכולים ליצור עגלות" };
    }

    const validated = createTruckSchema.parse(input);

    const location = await geocodeAddress(validated.address, validated.city);

    const truck = await prisma.coffeeTruck.create({
      data: {
        name: validated.name,
        city: validated.city,
        address: validated.address,
        latitude: location?.latitude,
        longitude: location?.longitude,
        ownerId: session.user.id,
        images: {
          create: validated.images.map((img, index) => ({
            url: img.url,
            publicId: img.publicId,
            alt: img.alt ?? null,
            isPrimary: index === 0,
          })),
        },
      },
    });

    revalidatePath("/trucks");

    return { success: true, data: truck };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error creating truck:", error);
    return { success: false, message: "שגיאה ביצירת העגלה" };
  }
}

export async function updateTruck(
  input: UpdateTruckInput & { truckId: string },
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const { truckId, ...dataToValidate } = input;
    const validated = updateTruckSchema.parse(dataToValidate);

    const location = await geocodeAddress(validated.address, validated.city);

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: truckId },
      include: {
        images: {
          select: {
            id: true,
            publicId: true,
          },
        },
      },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    const canModify = await canModifyTruck(session.user.id, truck.ownerId);
    if (!canModify) {
      return { success: false, message: "אינך מורשה לערוך עגלה זו" };
    }

    const existingImageIds = new Set(truck.images.map((img) => img.publicId));
    const newImageIds = new Set(
      validated.images
        .filter((img) => !img.id?.startsWith("temp-"))
        .map((img) => img.publicId)
    );

    const imagesToDelete = truck.images.filter(
      (img) => !newImageIds.has(img.publicId)
    );
    for (const image of imagesToDelete) {
      try {
        await prisma.coffeeTruckImage.delete({
          where: { id: image.id },
        });
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    const imagesToCreate = validated.images.filter((img) =>
      img.id?.startsWith("temp-")
    );
    if (imagesToCreate.length > 0) {
      await prisma.coffeeTruckImage.createMany({
        data: imagesToCreate.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          alt: img.alt ?? null,
          isPrimary: img.isPrimary,
          truckId,
        })),
      });
    }

    const imagesToUpdate = validated.images.filter(
      (img) => !img.id?.startsWith("temp-")
    );
    for (const image of imagesToUpdate) {
      await prisma.coffeeTruckImage.updateMany({
        where: { publicId: image.publicId, truckId },
        data: {
          alt: image.alt ?? null,
          isPrimary: image.isPrimary,
        },
      });
    }

    const updatedTruck = await prisma.coffeeTruck.update({
      where: { id: truckId },
      data: {
        name: validated.name,
        city: validated.city,
        address: validated.address,
        latitude: location?.latitude,
        longitude: location?.longitude,
      },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${truckId}`);

    return { success: true, data: updatedTruck };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error updating truck:", error);
    return { success: false, message: "שגיאה בעדכון העגלה" };
  }
}

export async function deleteTruck(input: DeleteTruckInput): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = deleteTruckSchema.parse(input);

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: validated.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    const canModify = await canModifyTruck(session.user.id, truck.ownerId);
    if (!canModify) {
      return { success: false, message: "אינך מורשה למחוק עגלה זו" };
    }

    await prisma.coffeeTruck.delete({
      where: { id: validated.truckId },
    });

    revalidatePath("/trucks");

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error deleting truck:", error);
    return { success: false, message: "שגיאה במחיקת העגלה" };
  }
}

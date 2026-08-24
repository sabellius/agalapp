"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions";
import cloudinary from "@/lib/cloudinary";
import { geocodeAddress } from "@/lib/geocoding";
import { prisma } from "@/lib/prisma";
import { safeAction, withAuth } from "@/lib/safe-action";
import {
  canCreateTruck,
  canModifyTruck,
  getUserRole,
} from "@/lib/truck-permissions";
import {
  type CreateTruckInput,
  createTruckSchema,
  type DeleteTruckInput,
  deleteTruckSchema,
  type UpdateTruckInput,
  updateTruckSchema,
} from "@/lib/validations";

const CLOUDINARY_DESTROY_RETRY_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function destroyAssetWithRetry(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error(
      `Cloudinary destroy failed for ${publicId}, retrying:`,
      error,
    );
  }

  await sleep(CLOUDINARY_DESTROY_RETRY_DELAY_MS);

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error(`Cloudinary destroy failed for ${publicId}:`, error);
    return false;
  }
}

async function destroyAssets(publicIds: string[]) {
  const results = await Promise.all(
    publicIds.map((id) => destroyAssetWithRetry(id)),
  );
  const orphaned = publicIds.filter((_, index) => !results[index]);

  if (orphaned.length > 0) {
    console.error("Cloudinary orphaned assets (destroy failed):", orphaned);
  }
}

export async function createTruck(input: CreateTruckInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const role = await getUserRole(userId);
      if (!canCreateTruck(role)) {
        return {
          success: false,
          message: "רק בעלי עגלות יכולים ליצור עגלות",
        } as ActionResult<{ id: string }>;
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
          ownerId: userId,
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
      return { success: true as const, data: truck };
    }, "שגיאה ביצירת העגלה");
  });
}

export async function updateTruck(
  input: UpdateTruckInput & { truckId: string },
) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const { truckId, ...dataToValidate } = input;
      const validated = updateTruckSchema.parse(dataToValidate);

      const truck = await prisma.coffeeTruck.findUnique({
        where: { id: truckId },
        include: { images: { select: { id: true, publicId: true } } },
      });

      if (!truck) {
        return { success: false, message: "העגלה לא נמצאה" } as ActionResult<{
          id: string;
        }>;
      }

      if (!(await canModifyTruck(userId, truck.ownerId))) {
        return {
          success: false,
          message: "אינך מורשה לערוך עגלה זו",
        } as ActionResult<{ id: string }>;
      }

      const location = await geocodeAddress(validated.address, validated.city);

      const newImageIds = new Set(
        validated.images
          .filter((img) => !img.id?.startsWith("temp-"))
          .map((img) => img.publicId),
      );

      const imagesToDelete = truck.images.filter(
        (img) => !newImageIds.has(img.publicId),
      );
      const imagesToCreate = validated.images.filter((img) =>
        img.id?.startsWith("temp-"),
      );
      const imagesToUpdate = validated.images.filter(
        (img) => !img.id?.startsWith("temp-"),
      );

      const updatedTruck = await prisma.$transaction(async (tx) => {
        for (const image of imagesToDelete) {
          await tx.coffeeTruckImage.delete({ where: { id: image.id } });
        }

        if (imagesToCreate.length > 0) {
          await tx.coffeeTruckImage.createMany({
            data: imagesToCreate.map((img) => ({
              url: img.url,
              publicId: img.publicId,
              alt: img.alt ?? null,
              isPrimary: img.isPrimary,
              truckId,
            })),
          });
        }

        for (const image of imagesToUpdate) {
          await tx.coffeeTruckImage.updateMany({
            where: { publicId: image.publicId, truckId },
            data: { alt: image.alt ?? null, isPrimary: image.isPrimary },
          });
        }

        return tx.coffeeTruck.update({
          where: { id: truckId },
          data: {
            name: validated.name,
            city: validated.city,
            address: validated.address,
            latitude: location?.latitude,
            longitude: location?.longitude,
          },
        });
      });

      revalidatePath("/trucks");
      revalidatePath(`/trucks/${truckId}`);
      await destroyAssets(imagesToDelete.map((img) => img.publicId));
      return { success: true as const, data: updatedTruck };
    }, "שגיאה בעדכון העגלה");
  });
}

export async function deleteTruck(input: DeleteTruckInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = deleteTruckSchema.parse(input);

      const truck = await prisma.coffeeTruck.findUnique({
        where: { id: validated.truckId },
        select: { ownerId: true, images: { select: { publicId: true } } },
      });

      if (!truck) {
        return { success: false, message: "העגלה לא נמצאה" } as ActionResult;
      }

      if (!(await canModifyTruck(userId, truck.ownerId))) {
        return {
          success: false,
          message: "אינך מורשה למחוק עגלה זו",
        } as ActionResult;
      }

      await prisma.coffeeTruck.delete({ where: { id: validated.truckId } });
      revalidatePath("/trucks");
      await destroyAssets(truck.images.map((img) => img.publicId));
      return { success: true as const };
    }, "שגיאה במחיקת העגלה");
  });
}

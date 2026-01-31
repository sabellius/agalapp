"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createTruck(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (user.role !== "TRUCK_OWNER" && user.role !== "ADMIN") {
      return {
        success: false,
        message: "Only truck owners can create trucks",
      };
    }

    const name = formData.get("name") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const imagesJson = formData.get("images") as string;

    if (!name || !city || !address) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    let images: Array<{
      url: string;
      publicId: string;
      alt: string;
      isPrimary: boolean;
    }> = [];
    if (imagesJson) {
      try {
        images = JSON.parse(imagesJson);
      } catch (e) {
        console.error("Error parsing images JSON:", e);
      }
    }

    if (images.length === 0) {
      return {
        success: false,
        message: "יש להעלות לפחות תמונה אחת",
      };
    }

    const truck = await prisma.coffeeTruck.create({
      data: {
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        ownerId: session.user.id,
        images: {
          create: images.map((img, index) => ({
            url: img.url,
            publicId: img.publicId,
            alt: img.alt || null,
            isPrimary: index === 0, // First image is primary by default
          })),
        },
      },
    });

    revalidatePath("/trucks");

    return {
      success: true,
      truck,
    };
  } catch (error) {
    console.error("Error creating truck:", error);
    return {
      success: false,
      message: "Failed to create truck",
    };
  }
}

export async function updateTruck(truckId: string, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

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
      return {
        success: false,
        message: "Truck not found",
      };
    }

    if (truck.ownerId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || user.role !== "ADMIN") {
        return {
          success: false,
          message: "You can only edit your own trucks",
        };
      }
    }

    const name = formData.get("name") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const imagesJson = formData.get("images") as string;

    if (!name || !city || !address) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    let images: Array<{
      id?: string;
      url: string;
      publicId: string;
      alt: string;
      isPrimary: boolean;
    }> = [];
    if (imagesJson) {
      try {
        images = JSON.parse(imagesJson);
      } catch (e) {
        console.error("Error parsing images JSON:", e);
      }
    }

    if (truck.images && images.length > 0) {
      const _existingImageIds = new Set(
        truck.images.map((img) => img.publicId),
      );
      const newImageIds = new Set(
        images
          .filter((img) => !img.id?.startsWith("temp-"))
          .map((img) => img.publicId),
      );

      const imagesToDelete = truck.images.filter(
        (img) => !newImageIds.has(img.publicId),
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

      const imagesToCreate = images.filter((img) =>
        img.id?.startsWith("temp-"),
      );
      if (imagesToCreate.length > 0) {
        await prisma.coffeeTruckImage.createMany({
          data: imagesToCreate.map((img, _index) => ({
            url: img.url,
            publicId: img.publicId,
            alt: img.alt || null,
            isPrimary: img.isPrimary,
            truckId,
          })),
        });
      }

      const imagesToUpdate = images.filter(
        (img) => !img.id?.startsWith("temp-"),
      );
      for (const image of imagesToUpdate) {
        await prisma.coffeeTruckImage.updateMany({
          where: { publicId: image.publicId, truckId },
          data: {
            alt: image.alt || null,
            isPrimary: image.isPrimary,
          },
        });
      }
    }

    const updatedTruck = await prisma.coffeeTruck.update({
      where: { id: truckId },
      data: {
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
      },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${truckId}`);

    return {
      success: true,
      truck: updatedTruck,
    };
  } catch (error) {
    console.error("Error updating truck:", error);
    return {
      success: false,
      message: "Failed to update truck",
    };
  }
}

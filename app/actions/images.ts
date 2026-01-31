"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function deleteImage(imageId: string, truckId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "אינך מחובר",
      };
    }

    const image = await prisma.coffeeTruckImage.findUnique({
      where: { id: imageId },
      include: {
        truck: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!image) {
      return {
        success: false,
        message: "התמונה לא נמצאה",
      };
    }

    if (image.truck.ownerId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || user.role !== "ADMIN") {
        return {
          success: false,
          message: "אינך מורשה לבצע פעולה זו",
        };
      }
    }

    const isPrimary = image.isPrimary;
    const truckImages = await prisma.coffeeTruckImage.findMany({
      where: { truckId },
      orderBy: { createdAt: "asc" },
    });

    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError);
    }

    await prisma.coffeeTruckImage.delete({
      where: { id: imageId },
    });

    if (isPrimary && truckImages.length > 1) {
      const nextImage = truckImages.find((img) => img.id !== imageId);
      if (nextImage) {
        await prisma.coffeeTruckImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${truckId}`);
    revalidatePath(`/trucks/${truckId}/edit`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      message: "שגיאה במחיקת התמונה",
    };
  }
}

export async function setPrimaryImage(imageId: string, truckId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "אינך מחובר",
      };
    }

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return {
        success: false,
        message: "העגלה לא נמצאה",
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
          message: "אינך מורשה לבצע פעולה זו",
        };
      }
    }

    const image = await prisma.coffeeTruckImage.findUnique({
      where: { id: imageId },
      select: { truckId: true },
    });

    if (!image || image.truckId !== truckId) {
      return {
        success: false,
        message: "התמונה לא שייכת לעגלה זו",
      };
    }

    await prisma.coffeeTruckImage.updateMany({
      where: { truckId },
      data: { isPrimary: false },
    });

    await prisma.coffeeTruckImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${truckId}`);
    revalidatePath(`/trucks/${truckId}/edit`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error setting primary image:", error);
    return {
      success: false,
      message: "שגיאה בעדכון התמונה הראשית",
    };
  }
}

export async function updateImageAlt(imageId: string, alt: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "אינך מחובר",
      };
    }

    const image = await prisma.coffeeTruckImage.findUnique({
      where: { id: imageId },
      include: {
        truck: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!image) {
      return {
        success: false,
        message: "התמונה לא נמצאה",
      };
    }

    if (image.truck.ownerId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || user.role !== "ADMIN") {
        return {
          success: false,
          message: "אינך מורשה לבצע פעולה זו",
        };
      }
    }

    await prisma.coffeeTruckImage.update({
      where: { id: imageId },
      data: { alt: alt.trim() },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${image.truckId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating image alt:", error);
    return {
      success: false,
      message: "שגיאה בעדכון טקסט התמונה",
    };
  }
}

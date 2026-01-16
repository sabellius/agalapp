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

    if (!name || !city || !address) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const truck = await prisma.coffeeTruck.create({
      data: {
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        ownerId: session.user.id,
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
      select: { ownerId: true },
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

    if (!name || !city || !address) {
      return {
        success: false,
        message: "Missing required fields",
      };
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

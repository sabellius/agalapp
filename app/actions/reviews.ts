"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createReview(
  truckId: string,
  rating: number,
  content: string,
) {
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

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return {
        success: false,
        message: "דירוג חייב להיות בין 1 ל-5",
      };
    }

    // Validate content
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return {
        success: false,
        message: "יש לכתוב תוכן לביקורת",
      };
    }

    if (trimmedContent.length < 10) {
      return {
        success: false,
        message: "התוכן קצר מדי (מינימום 10 תווים)",
      };
    }

    if (trimmedContent.length > 1000) {
      return {
        success: false,
        message: "התוכן ארוך מדי (מקסימום 1000 תווים)",
      };
    }

    // Check if truck exists
    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: truckId },
    });

    if (!truck) {
      return {
        success: false,
        message: "העגלה לא נמצאה",
      };
    }

    // Check if user has already reviewed this truck
    const existingReview = await prisma.review.findUnique({
      where: {
        truckId_userId: {
          truckId,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return {
        success: false,
        message: "כבר כתבת ביקורת על עגלה זו",
      };
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        content: trimmedContent,
        truckId,
        userId: session.user.id,
      },
    });

    // Revalidate paths
    revalidatePath("/trucks");
    revalidatePath(`/trucks/${truckId}`);

    return {
      success: true,
      review,
    };
  } catch (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      message: "שגיאה ביצירת הביקורת",
    };
  }
}

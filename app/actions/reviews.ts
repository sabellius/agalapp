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

export async function updateReview(
  reviewId: string,
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

    // Get the review to check ownership and get truckId
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return {
        success: false,
        message: "הביקורת לא נמצאה",
      };
    }

    // Check if user owns this review
    if (review.userId !== session.user.id) {
      return {
        success: false,
        message: "אינך מורשה לבצע פעולה זו",
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

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        content: trimmedContent,
      },
    });

    // Revalidate paths
    revalidatePath("/trucks");
    revalidatePath(`/trucks/${review.truckId}`);

    return {
      success: true,
      review: updatedReview,
    };
  } catch (error) {
    console.error("Error updating review:", error);
    return {
      success: false,
      message: "שגיאה בעדכון הביקורת",
    };
  }
}

export async function deleteReview(reviewId: string) {
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

    // Get the review to check ownership and get truckId
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return {
        success: false,
        message: "הביקורת לא נמצאה",
      };
    }

    // Check if user owns this review
    if (review.userId !== session.user.id) {
      return {
        success: false,
        message: "אינך מורשה לבצע פעולה זו",
      };
    }

    const truckId = review.truckId;

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Revalidate paths
    revalidatePath("/trucks");
    revalidatePath(`/trucks/${truckId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      message: "שגיאה במחיקת הביקורת",
    };
  }
}

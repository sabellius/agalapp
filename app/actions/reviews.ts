"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  type CreateReviewInput,
  type UpdateReviewInput,
  type DeleteReviewInput,
} from "@/lib/validations";
import { ZodError } from "zod";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; message: string };

export async function createReview(input: CreateReviewInput): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = createReviewSchema.parse(input);

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: validated.truckId },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        truckId_userId: {
          truckId: validated.truckId,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return { success: false, message: "כבר כתבת ביקורת על עגלה זו" };
    }

    const review = await prisma.review.create({
      data: {
        rating: validated.rating,
        content: validated.content,
        truckId: validated.truckId,
        userId: session.user.id,
      },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${validated.truckId}`);

    return { success: true, data: review };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error creating review:", error);
    return { success: false, message: "שגיאה ביצירת הביקורת" };
  }
}

export async function updateReview(input: UpdateReviewInput): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = updateReviewSchema.parse(input);

    const review = await prisma.review.findUnique({
      where: { id: validated.reviewId },
    });

    if (!review) {
      return { success: false, message: "הביקורת לא נמצאה" };
    }

    if (review.userId !== session.user.id) {
      return { success: false, message: "אינך מורשה לבצע פעולה זו" };
    }

    const updatedReview = await prisma.review.update({
      where: { id: validated.reviewId },
      data: {
        rating: validated.rating,
        content: validated.content,
      },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${review.truckId}`);

    return { success: true, data: updatedReview };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error updating review:", error);
    return { success: false, message: "שגיאה בעדכון הביקורת" };
  }
}

export async function deleteReview(input: DeleteReviewInput): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = deleteReviewSchema.parse(input);

    const review = await prisma.review.findUnique({
      where: { id: validated.reviewId },
    });

    if (!review) {
      return { success: false, message: "הביקורת לא נמצאה" };
    }

    if (review.userId !== session.user.id) {
      return { success: false, message: "אינך מורשה לבצע פעולה זו" };
    }

    const truckId = review.truckId;

    await prisma.review.delete({
      where: { id: validated.reviewId },
    });

    revalidatePath("/trucks");
    revalidatePath(`/trucks/${truckId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error deleting review:", error);
    return { success: false, message: "שגיאה במחיקת הביקורת" };
  }
}

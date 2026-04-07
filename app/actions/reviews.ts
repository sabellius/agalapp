"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { safeAction, withAuth } from "@/lib/safe-action";
import {
  type CreateReviewInput,
  createReviewSchema,
  type DeleteReviewInput,
  deleteReviewSchema,
  type UpdateReviewInput,
  updateReviewSchema,
} from "@/lib/validations";

export function createReview(input: CreateReviewInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = createReviewSchema.parse(input);

      const truck = await prisma.coffeeTruck.findUnique({
        where: { id: validated.truckId },
      });
      if (!truck) {
        return { success: false, message: "העגלה לא נמצאה" } as ActionResult<{
          id: string;
        }>;
      }

      const existingReview = await prisma.review.findUnique({
        where: { truckId_userId: { truckId: validated.truckId, userId } },
      });
      if (existingReview) {
        return {
          success: false,
          message: "כבר כתבת ביקורת על עגלה זו",
        } as ActionResult<{ id: string }>;
      }

      const review = await prisma.review.create({
        data: {
          rating: validated.rating,
          content: validated.content,
          truckId: validated.truckId,
          userId,
        },
      });

      revalidatePath("/trucks");
      revalidatePath(`/trucks/${validated.truckId}`);
      return { success: true as const, data: review };
    }, "שגיאה ביצירת הביקורת");
  });
}

export function updateReview(input: UpdateReviewInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = updateReviewSchema.parse(input);

      const review = await prisma.review.findUnique({
        where: { id: validated.reviewId },
      });
      if (!review) {
        return { success: false, message: "הביקורת לא נמצאה" } as ActionResult<{
          id: string;
        }>;
      }
      if (review.userId !== userId) {
        return {
          success: false,
          message: "אינך מורשה לבצע פעולה זו",
        } as ActionResult<{ id: string }>;
      }

      const updatedReview = await prisma.review.update({
        where: { id: validated.reviewId },
        data: { rating: validated.rating, content: validated.content },
      });

      revalidatePath("/trucks");
      revalidatePath(`/trucks/${review.truckId}`);
      return { success: true as const, data: updatedReview };
    }, "שגיאה בעדכון הביקורת");
  });
}

export function deleteReview(input: DeleteReviewInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = deleteReviewSchema.parse(input);

      const review = await prisma.review.findUnique({
        where: { id: validated.reviewId },
      });
      if (!review) {
        return { success: false, message: "הביקורת לא נמצאה" } as ActionResult;
      }
      if (review.userId !== userId) {
        return {
          success: false,
          message: "אינך מורשה לבצע פעולה זו",
        } as ActionResult;
      }

      const truckId = review.truckId;
      await prisma.review.delete({ where: { id: validated.reviewId } });

      revalidatePath("/trucks");
      revalidatePath(`/trucks/${truckId}`);
      return { success: true as const };
    }, "שגיאה במחיקת הביקורת");
  });
}

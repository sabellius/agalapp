"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type ToggleVoteInput,
  toggleVoteSchema,
} from "@/lib/validations/vote-schema";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; message: string };

export async function toggleVote(
  input: ToggleVoteInput,
): Promise<ActionResult<{ voted: boolean; voteCount: number }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = toggleVoteSchema.parse(input);

    const review = await prisma.review.findUnique({
      where: { id: validated.reviewId },
      include: {
        votes: {
          where: { userId: session.user.id },
        },
        _count: { select: { votes: true } },
      },
    });

    if (!review) {
      return { success: false, message: "הביקורת לא נמצאה" };
    }

    if (review.userId === session.user.id) {
      return { success: false, message: "אינך יכול להצביע על הביקורת שלך" };
    }

    const existingVote = review.votes[0];

    if (existingVote) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      revalidatePath(`/trucks/${review.truckId}`);

      return {
        success: true,
        data: { voted: false, voteCount: review._count.votes - 1 },
      };
    }

    await prisma.vote.create({
      data: {
        reviewId: validated.reviewId,
        userId: session.user.id,
      },
    });

    revalidatePath(`/trucks/${review.truckId}`);

    return {
      success: true,
      data: { voted: true, voteCount: review._count.votes + 1 },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error toggling vote:", error);
    return { success: false, message: "שגיאה בהצבעה" };
  }
}

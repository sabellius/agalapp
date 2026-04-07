"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { safeAction, withAuth } from "@/lib/safe-action";
import {
  type ToggleVoteInput,
  toggleVoteSchema,
} from "@/lib/validations/vote-schema";

export function toggleVote(input: ToggleVoteInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = toggleVoteSchema.parse(input);

      const review = await prisma.review.findUnique({
        where: { id: validated.reviewId },
        include: {
          votes: { where: { userId } },
          _count: { select: { votes: true } },
        },
      });
      if (!review) {
        return { success: false, message: "הביקורת לא נמצאה" } as ActionResult<{
          voted: boolean;
          voteCount: number;
        }>;
      }
      if (review.userId === userId) {
        return {
          success: false,
          message: "אינך יכול להצביע על הביקורת שלך",
        } as ActionResult<{ voted: boolean; voteCount: number }>;
      }

      const existingVote = review.votes[0];

      if (existingVote) {
        await prisma.vote.delete({ where: { id: existingVote.id } });
        revalidatePath(`/trucks/${review.truckId}`);
        return {
          success: true as const,
          data: { voted: false, voteCount: review._count.votes - 1 },
        };
      }

      await prisma.vote.create({
        data: { reviewId: validated.reviewId, userId },
      });
      revalidatePath(`/trucks/${review.truckId}`);
      return {
        success: true as const,
        data: { voted: true, voteCount: review._count.votes + 1 },
      };
    }, "שגיאה בהצבעה");
  });
}

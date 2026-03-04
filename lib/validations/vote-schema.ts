import { z } from "zod";

export const toggleVoteSchema = z.object({
  reviewId: z.string().min(1, "מזהה ביקורת חסר"),
});

export type ToggleVoteInput = z.infer<typeof toggleVoteSchema>;

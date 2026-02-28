import { z } from "zod";

export const createReviewSchema = z.object({
  truckId: z.string().min(1, "מזהה עגלה חסר"),
  rating: z
    .number({ required_error: "דירוג נדרש" })
    .int("דירוג חייב להיות מספר שלם")
    .min(1, "דירוג מינימלי הוא 1")
    .max(5, "דירוג מקסימלי הוא 5"),
  content: z
    .string()
    .trim()
    .min(10, "התוכן קצר מדי (מינימום 10 תווים)")
    .max(1000, "התוכן ארוך מדי (מקסימום 1000 תווים)"),
});

export const updateReviewSchema = z.object({
  reviewId: z.string().min(1, "מזהה ביקורת חסר"),
  rating: z
    .number()
    .int("דירוג חייב להיות מספר שלם")
    .min(1, "דירוג מינימלי הוא 1")
    .max(5, "דירוג מקסימלי הוא 5"),
  content: z
    .string()
    .trim()
    .min(10, "התוכן קצר מדי (מינימום 10 תווים)")
    .max(1000, "התוכן ארוך מדי (מקסימום 1000 תווים)"),
});

export const deleteReviewSchema = z.object({
  reviewId: z.string().min(1, "מזהה ביקורת חסר"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;

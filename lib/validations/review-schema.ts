import { z } from "zod";

export const MIN_REVIEW_RATING = 1;
export const MAX_REVIEW_RATING = 5;
export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 1000;

export const createReviewSchema = z.object({
  truckId: z.string().min(1, "מזהה עגלה חסר"),
  rating: z
    .number({ message: "דירוג נדרש" })
    .int("דירוג חייב להיות מספר שלם")
    .min(MIN_REVIEW_RATING, "דירוג מינימלי הוא 1")
    .max(MAX_REVIEW_RATING, "דירוג מקסימלי הוא 5"),
  content: z
    .string()
    .trim()
    .min(MIN_REVIEW_LENGTH, "התוכן קצר מדי (מינימום 10 תווים)")
    .max(MAX_REVIEW_LENGTH, "התוכן ארוך מדי (מקסימום 1000 תווים)"),
});

export const updateReviewSchema = z.object({
  reviewId: z.string().min(1, "מזהה ביקורת חסר"),
  rating: z
    .number()
    .int("דירוג חייב להיות מספר שלם")
    .min(MIN_REVIEW_RATING, "דירוג מינימלי הוא 1")
    .max(MAX_REVIEW_RATING, "דירוג מקסימלי הוא 5"),
  content: z
    .string()
    .trim()
    .min(MIN_REVIEW_LENGTH, "התוכן קצר מדי (מינימום 10 תווים)")
    .max(MAX_REVIEW_LENGTH, "התוכן ארוך מדי (מקסימום 1000 תווים)"),
});

export const deleteReviewSchema = z.object({
  reviewId: z.string().min(1, "מזהה ביקורת חסר"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;

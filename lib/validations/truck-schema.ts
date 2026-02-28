import { z } from "zod";
import {
  hebrewTextSchema,
  citySchema,
  addressSchema,
  imageSchema,
  truckImageSchema,
} from "./common";

export const createTruckSchema = z.object({
  name: hebrewTextSchema
    .min(2, "שם העגלה חייב להכיל לפחות 2 תווים")
    .max(100, "שם העגלה לא יכול לעלות על 100 תווים"),
  city: citySchema,
  address: addressSchema,
  images: z
    .array(imageSchema)
    .min(1, "יש להעלות לפחות תמונה אחת")
    .max(10, "מקסימום 10 תמונות"),
});

export const updateTruckSchema = z.object({
  name: hebrewTextSchema.min(2).max(100),
  city: citySchema,
  address: addressSchema,
  images: z.array(truckImageSchema).max(10, "מקסימום 10 תמונות"),
});

export const truckFiltersSchema = z.object({
  city: z.string().optional(),
  minRating: z.coerce.number().int().min(0).max(5).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export const deleteTruckSchema = z.object({
  truckId: z.string().min(1, "מזהה עגלה חסר"),
});

export type CreateTruckInput = z.infer<typeof createTruckSchema>;
export type UpdateTruckInput = z.infer<typeof updateTruckSchema>;
export type TruckFilters = z.infer<typeof truckFiltersSchema>;
export type DeleteTruckInput = z.infer<typeof deleteTruckSchema>;

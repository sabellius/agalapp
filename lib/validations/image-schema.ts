import { z } from "zod";

import { MAX_IMAGE_ALT_LENGTH } from "./common";

export const deleteImageSchema = z.object({
  imageId: z.string().min(1, "מזהה תמונה חסר"),
  truckId: z.string().min(1, "מזהה עגלה חסר"),
});

export const setPrimaryImageSchema = z.object({
  imageId: z.string().min(1, "מזהה תמונה חסר"),
  truckId: z.string().min(1, "מזהה עגלה חסר"),
});

export const updateImageAltSchema = z.object({
  imageId: z.string().min(1, "מזהה תמונה חסר"),
  alt: z.string().max(MAX_IMAGE_ALT_LENGTH, "טקסט תמונה ארוך מדי").trim(),
});

export type DeleteImageInput = z.infer<typeof deleteImageSchema>;
export type SetPrimaryImageInput = z.infer<typeof setPrimaryImageSchema>;
export type UpdateImageAltInput = z.infer<typeof updateImageAltSchema>;

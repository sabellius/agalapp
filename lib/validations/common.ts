import { z } from "zod";

export const israeliCities = [
  "תל אביב",
  "ירושלים",
  "חיפה",
  "באר שבע",
  "ראשון לציון",
  "פתח תקווה",
  "אשדוד",
  "נתניה",
  "בני ברק",
  "חולון",
  "רמת גן",
  "רחובות",
  "באר יעקב",
  "הרצליה",
  "כפר סבא",
  "מודיעין",
  "לוד",
  "רעננה",
  "גבעתיים",
  "חדרה",
  "רעלות",
  "קריית גת",
  "קריית מוצקין",
  "אשקלון",
  "בת ים",
  "כפר קאסם",
  "טירה",
  "נצרת",
  "מגדל",
  "נהריה",
  "עפולה",
] as const;

export const hebrewTextSchema = z
  .string()
  .trim()
  .min(2, "מינימום 2 תווים")
  .max(500, "מקסימום 500 תווים");

export const truckNameSchema = z
  .string()
  .trim()
  .min(2, "שם העגלה חייב להכיל לפחות 2 תווים")
  .max(100, "שם העגלה לא יכול לעלות על 100 תווים");

export const citySchema = z.enum(israeliCities, {
  errorMap: () => ({ message: "יש לבחור עיר מהרשימה" }),
});

export const addressSchema = z
  .string()
  .trim()
  .min(5, "כתובת חייבת להכיל לפחות 5 תווים")
  .max(500, "הכתובת ארוכה מדי");

export const imageSchema = z.object({
  url: z.string().url("כתובת תמונה לא תקינה"),
  publicId: z.string().min(1, "מזהה תמונה חסר"),
  alt: z.string().max(200, "טקסט תמונה ארוך מדי").nullable(),
  isPrimary: z.boolean().default(false),
});

export const truckImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("כתובת תמונה לא תקינה"),
  publicId: z.string().min(1, "מזהה תמונה חסר"),
  alt: z.string().nullable(),
  isPrimary: z.boolean(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

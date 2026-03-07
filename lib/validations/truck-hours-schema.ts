import { z } from "zod";

export const dayHoursSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .nullable(),
    closeTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .nullable(),
    isClosed: z.boolean().default(false),
  })
  .refine(
    (data) =>
      data.isClosed ||
      (!data.openTime && !data.closeTime) ||
      (data.openTime && data.closeTime),
    {
      message: "Either set both times or mark as closed",
      path: ["openTime"],
    },
  )
  .refine(
    (data) => {
      if (data.isClosed || !data.openTime || !data.closeTime) return true;
      const [openHour] = data.openTime.split(":").map(Number);
      const [closeHour] = data.closeTime.split(":").map(Number);
      return openHour < closeHour;
    },
    {
      message: "Close time must be after open time",
      path: ["closeTime"],
    },
  );

export type DayHoursInput = z.infer<typeof dayHoursSchema>;

export const weeklyHoursSchema = z.object({
  truckId: z.string().cuid(),
  hours: z.array(dayHoursSchema).length(7),
});

export type WeeklyHoursInput = z.infer<typeof weeklyHoursSchema>;

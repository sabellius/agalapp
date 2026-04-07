import { z } from "zod";

export const setTruckAttributesSchema = z.object({
  truckId: z.string().min(1, "מזהה עגלה חסר"),
  attributeIds: z.array(z.string().min(1)).max(20, "יותר מדי מאפיינים"),
});

export const addTruckAttributeSchema = z.object({
  truckId: z.string().min(1, "מזהה עגלה חסר"),
  attributeId: z.string().min(1, "מזהה מאפיין חסר"),
});

export const removeTruckAttributeSchema = z.object({
  truckId: z.string().min(1, "מזהה עגלה חסר"),
  attributeId: z.string().min(1, "מזהה מאפיין חסר"),
});

export type SetTruckAttributesInput = z.infer<typeof setTruckAttributesSchema>;
export type AddTruckAttributeInput = z.infer<typeof addTruckAttributeSchema>;
export type RemoveTruckAttributeInput = z.infer<
  typeof removeTruckAttributeSchema
>;

import { describe, expect, it } from "vitest";
import {
  deleteImageSchema,
  setPrimaryImageSchema,
  updateImageAltSchema,
} from "./image-schema";

describe("deleteImageSchema", () => {
  it("accepts valid input", () => {
    const result = deleteImageSchema.safeParse({
      imageId: "img-123",
      truckId: "truck-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty imageId", () => {
    const result = deleteImageSchema.safeParse({
      imageId: "",
      truckId: "truck-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty truckId", () => {
    const result = deleteImageSchema.safeParse({
      imageId: "img-123",
      truckId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing imageId", () => {
    const result = deleteImageSchema.safeParse({
      truckId: "truck-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing truckId", () => {
    const result = deleteImageSchema.safeParse({
      imageId: "img-123",
    });
    expect(result.success).toBe(false);
  });
});

describe("setPrimaryImageSchema", () => {
  it("accepts valid input", () => {
    const result = setPrimaryImageSchema.safeParse({
      imageId: "img-123",
      truckId: "truck-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty imageId", () => {
    const result = setPrimaryImageSchema.safeParse({
      imageId: "",
      truckId: "truck-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty truckId", () => {
    const result = setPrimaryImageSchema.safeParse({
      imageId: "img-123",
      truckId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateImageAltSchema", () => {
  it("accepts valid alt text", () => {
    const result = updateImageAltSchema.safeParse({
      imageId: "img-123",
      alt: "תמונה של עגלת קפה",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty alt text", () => {
    const result = updateImageAltSchema.safeParse({
      imageId: "img-123",
      alt: "",
    });
    expect(result.success).toBe(true);
  });

  it("trims alt text", () => {
    const result = updateImageAltSchema.safeParse({
      imageId: "img-123",
      alt: "  תמונה  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.alt).toBe("תמונה");
    }
  });

  it("rejects alt longer than 200 characters", () => {
    const result = updateImageAltSchema.safeParse({
      imageId: "img-123",
      alt: "א".repeat(201),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("ארוך מדי");
    }
  });

  it("accepts exactly 200 characters", () => {
    const result = updateImageAltSchema.safeParse({
      imageId: "img-123",
      alt: "א".repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty imageId", () => {
    const result = updateImageAltSchema.safeParse({
      imageId: "",
      alt: "תמונה",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing imageId", () => {
    const result = updateImageAltSchema.safeParse({
      alt: "תמונה",
    });
    expect(result.success).toBe(false);
  });
});

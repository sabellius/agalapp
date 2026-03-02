import { describe, it, expect } from "vitest";
import {
  createTruckSchema,
  updateTruckSchema,
  truckFiltersSchema,
  deleteTruckSchema,
  type CreateTruckInput,
} from "./truck-schema";

describe("createTruckSchema", () => {
  const validTruck: CreateTruckInput = {
    name: "עגלת קפה מעולה",
    city: "תל אביב",
    address: "רוטשילד 1, תל אביב",
    images: [
      {
        url: "https://example.com/image.jpg",
        publicId: "img_123",
        alt: "תמונה",
        isPrimary: true,
      },
    ],
  };

  it("accepts valid truck data", () => {
    const result = createTruckSchema.safeParse(validTruck);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createTruckSchema.safeParse({ ...validTruck, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid city", () => {
    const result = createTruckSchema.safeParse({ ...validTruck, city: "ניו יורק" });
    expect(result.success).toBe(false);
  });

  it("rejects short address", () => {
    const result = createTruckSchema.safeParse({ ...validTruck, address: "רח 1" });
    expect(result.success).toBe(false);
  });

  it("rejects empty images array", () => {
    const result = createTruckSchema.safeParse({ ...validTruck, images: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("תמונה אחת");
    }
  });

  it("rejects more than 10 images", () => {
    const images = Array(11).fill({
      url: "https://example.com/image.jpg",
      publicId: "img_123",
      alt: null,
      isPrimary: false,
    });
    const result = createTruckSchema.safeParse({ ...validTruck, images });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("מקסימום 10");
    }
  });

  it("accepts exactly 10 images", () => {
    const images = Array(10).fill({
      url: "https://example.com/image.jpg",
      publicId: "img_123",
      alt: null,
      isPrimary: false,
    });
    const result = createTruckSchema.safeParse({ ...validTruck, images });
    expect(result.success).toBe(true);
  });

  it("rejects invalid image URL", () => {
    const result = createTruckSchema.safeParse({
      ...validTruck,
      images: [{ ...validTruck.images[0], url: "not-a-url" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTruckSchema", () => {
  const validUpdate = {
    name: "עגלת קפה מעולה",
    city: "תל אביב",
    address: "רוטשילד 1, תל אביב",
    images: [
      {
        id: "existing-img-1",
        url: "https://example.com/image.jpg",
        publicId: "img_123",
        alt: "תמונה",
        isPrimary: true,
      },
    ],
  };

  it("accepts valid update data", () => {
    const result = updateTruckSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("allows empty images array", () => {
    const result = updateTruckSchema.safeParse({ ...validUpdate, images: [] });
    expect(result.success).toBe(true);
  });

  it("requires image id when updating", () => {
    const imagesWithoutId = [{ ...validUpdate.images[0], id: undefined }];
    const result = updateTruckSchema.safeParse({
      ...validUpdate,
      images: imagesWithoutId,
    });
    expect(result.success).toBe(true);
  });
});

describe("truckFiltersSchema", () => {
  it("accepts empty filters", () => {
    const result = truckFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
    }
  });

  it("sets default values", () => {
    const result = truckFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
    }
  });

  it("accepts valid city filter", () => {
    const result = truckFiltersSchema.safeParse({ city: "תל אביב" });
    expect(result.success).toBe(true);
  });

  it("accepts valid minRating filter", () => {
    const result = truckFiltersSchema.safeParse({ minRating: 3 });
    expect(result.success).toBe(true);
  });

  it("accepts valid search filter", () => {
    const result = truckFiltersSchema.safeParse({ search: "קפה" });
    expect(result.success).toBe(true);
  });

  it("accepts valid page and limit", () => {
    const result = truckFiltersSchema.safeParse({ page: 2, limit: 24 });
    expect(result.success).toBe(true);
  });

  it("coerces string numbers to integers", () => {
    const result = truckFiltersSchema.safeParse({
      page: "2",
      limit: "24",
      minRating: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(24);
      expect(result.data.minRating).toBe(3);
    }
  });

  it("rejects negative page", () => {
    const result = truckFiltersSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = truckFiltersSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects minRating below 0", () => {
    const result = truckFiltersSchema.safeParse({ minRating: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects minRating above 5", () => {
    const result = truckFiltersSchema.safeParse({ minRating: 6 });
    expect(result.success).toBe(false);
  });

  it("trims search text", () => {
    const result = truckFiltersSchema.safeParse({ search: "  קפה  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("קפה");
    }
  });

  it("rejects search longer than 100 characters", () => {
    const result = truckFiltersSchema.safeParse({ search: "א".repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe("deleteTruckSchema", () => {
  it("accepts valid truckId", () => {
    const result = deleteTruckSchema.safeParse({ truckId: "truck-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty truckId", () => {
    const result = deleteTruckSchema.safeParse({ truckId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing truckId", () => {
    const result = deleteTruckSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

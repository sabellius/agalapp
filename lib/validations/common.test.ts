import { describe, expect, it } from "vitest";
import {
  addressSchema,
  citySchema,
  hebrewTextSchema,
  imageSchema,
  israeliCities,
  truckNameSchema,
} from "./common";

describe("truckNameSchema", () => {
  it("accepts valid truck names", () => {
    const result = truckNameSchema.safeParse("עגלת קפה מעולה");
    expect(result.success).toBe(true);
  });

  it("accepts minimal valid name (2 characters)", () => {
    const result = truckNameSchema.safeParse("קפה");
    expect(result.success).toBe(true);
  });

  it("accepts name at max length (100 characters)", () => {
    const name = "א".repeat(100);
    const result = truckNameSchema.safeParse(name);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = truckNameSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("לפחות 2 תווים");
    }
  });

  it("rejects name shorter than 2 characters", () => {
    const result = truckNameSchema.safeParse("א");
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 100 characters", () => {
    const name = "א".repeat(101);
    const result = truckNameSchema.safeParse(name);
    expect(result.success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = truckNameSchema.safeParse("  עגלת קפה  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("עגלת קפה");
    }
  });
});

describe("citySchema", () => {
  it("accepts valid Israeli cities", () => {
    const validCities = ["תל אביב", "ירושלים", "חיפה", "באר שבע"];

    validCities.forEach((city) => {
      const result = citySchema.safeParse(city);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid city", () => {
    const result = citySchema.safeParse("ניו יורק");
    expect(result.success).toBe(false);
  });

  it("contains all major Israeli cities", () => {
    expect(israeliCities).toContain("תל אביב");
    expect(israeliCities).toContain("ירושלים");
    expect(israeliCities).toContain("חיפה");
    expect(israeliCities).toContain("באר שבע");
  });
});

describe("addressSchema", () => {
  it("accepts valid address", () => {
    const result = addressSchema.safeParse("רחוב רוטשילד 1, תל אביב");
    expect(result.success).toBe(true);
  });

  it("accepts minimal address (5 characters)", () => {
    const result = addressSchema.safeParse("רוטשילד 1");
    expect(result.success).toBe(true);
  });

  it("rejects short address", () => {
    const result = addressSchema.safeParse("רח 1");
    expect(result.success).toBe(false);
  });

  it("rejects address longer than 500 characters", () => {
    const address = "א".repeat(501);
    const result = addressSchema.safeParse(address);
    expect(result.success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = addressSchema.safeParse("  רוטשילד 1  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("רוטשילד 1");
    }
  });
});

describe("imageSchema", () => {
  const validImage = {
    url: "https://example.com/image.jpg",
    publicId: "image_123",
    alt: "תמונה",
    isPrimary: false,
  };

  it("accepts valid image", () => {
    const result = imageSchema.safeParse(validImage);
    expect(result.success).toBe(true);
  });

  it("accepts image with null alt", () => {
    const result = imageSchema.safeParse({ ...validImage, alt: null });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = imageSchema.safeParse({ ...validImage, url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects empty publicId", () => {
    const result = imageSchema.safeParse({ ...validImage, publicId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects alt longer than 200 characters", () => {
    const result = imageSchema.safeParse({
      ...validImage,
      alt: "א".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("defaults isPrimary to false", () => {
    const { isPrimary, ...imageWithoutPrimary } = validImage;
    const result = imageSchema.safeParse(imageWithoutPrimary);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPrimary).toBe(false);
    }
  });
});

describe("hebrewTextSchema", () => {
  it("accepts valid Hebrew text", () => {
    const result = hebrewTextSchema.safeParse("זהו טקסט בעברית");
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = hebrewTextSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects text shorter than 2 characters", () => {
    const result = hebrewTextSchema.safeParse("א");
    expect(result.success).toBe(false);
  });

  it("rejects text longer than 500 characters", () => {
    const text = "א".repeat(501);
    const result = hebrewTextSchema.safeParse(text);
    expect(result.success).toBe(false);
  });
});

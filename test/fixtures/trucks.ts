import type { CoffeeTruck, CoffeeTruckImage } from "@/generated/prisma/client";

export const mockTruck: CoffeeTruck = {
  id: "truck-1",
  name: "עגלת הקפה",
  city: "תל אביב",
  address: "רוטשילד 1",
  description: "הקפה הכי טוב בעיר",
  ownerId: "user-1",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  images: [],
  reviews: [],
  owner: null,
};

export const mockTruckWithImage: CoffeeTruck = {
  ...mockTruck,
  id: "truck-2",
  images: [
    {
      id: "img-1",
      truckId: "truck-2",
      url: "https://example.com/image.jpg",
      isPrimary: true,
      alt: "תמונה",
      createdAt: new Date(),
    } as CoffeeTruckImage,
  ],
};

export function buildTruck(overrides: Partial<CoffeeTruck> = {}): CoffeeTruck {
  return {
    id: `truck-${Math.random().toString(36).slice(2, 9)}`,
    name: "עגלת קפה",
    city: "תל אביב",
    address: "רוטשילד 1",
    description: "קפה מעולה",
    ownerId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
    reviews: [],
    owner: null,
    ...overrides,
  };
}

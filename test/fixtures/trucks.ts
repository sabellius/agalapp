import type { CoffeeTruck, CoffeeTruckImage } from "@/generated/prisma/client";

export const mockTruck: CoffeeTruck = {
  id: "truck-1",
  name: "עגלת הקפה",
  city: "תל אביב",
  address: "רוטשילד 1",
  latitude: 32.0636,
  longitude: 34.7706,
  ownerId: "user-1",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const mockTruckImage: CoffeeTruckImage = {
  id: "img-1",
  truckId: "truck-2",
  url: "https://example.com/image.jpg",
  publicId: "test-public-id",
  isPrimary: true,
  alt: "תמונה",
  createdAt: new Date(),
};

export function buildTruck(overrides: Partial<CoffeeTruck> = {}): CoffeeTruck {
  return {
    id: `truck-${Math.random().toString(36).slice(2, 9)}`,
    name: "עגלת קפה",
    city: "תל אביב",
    address: "רוטשילד 1",
    latitude: 32.0636,
    longitude: 34.7706,
    ownerId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

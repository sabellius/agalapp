import type { User } from "@/generated/prisma/client";

export const mockUser: User = {
  id: "user-1",
  name: "ישראל ישראלי",
  email: "israel@example.com",
  emailVerified: true,
  image: null,
  role: "USER",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const mockTruckOwner: User = {
  ...mockUser,
  id: "owner-1",
  email: "owner@example.com",
  role: "TRUCK_OWNER",
};

export const mockAdmin: User = {
  ...mockUser,
  id: "admin-1",
  email: "admin@example.com",
  role: "ADMIN",
};

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: `user-${Math.random().toString(36).slice(2, 9)}`,
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

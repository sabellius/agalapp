import type { vi } from "vitest";
import type { User } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";

/**
 * Type-safe mock session for testing
 * Eliminates the need for `as any` when mocking auth
 */
export interface MockSession {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token?: string;
  };
}

/**
 * Creates a mock session object for a given user
 */
export function createMockSession(user: User): MockSession {
  return {
    user,
    session: {
      id: `session-${Math.random().toString(36).slice(2, 10)}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
    },
  };
}

/**
 * Sets up the auth mock with a given user or null (unauthenticated)
 *
 * @example
 * ```ts
 * // Authenticated user
 * mockAuthSession(mockTruckOwner);
 *
 * // Unauthenticated
 * mockAuthSession(null);
 * ```
 */
export function mockAuthSession(user: User | null) {
  const mockAuth = auth as typeof auth & {
    api: { getSession: ReturnType<typeof vi.fn> };
  };

  if (user) {
    mockAuth.api.getSession.mockResolvedValue(createMockSession(user));
  } else {
    mockAuth.api.getSession.mockResolvedValue(null);
  }

  return mockAuth;
}

/**
 * Type-safe mock for Prisma client
 */
export type MockPrismaClient = typeof import("@/lib/prisma").prisma &
  Record<string, unknown>;

/**
 * Gets a typed reference to the mocked Prisma client
 */
export function getMockPrisma(): MockPrismaClient {
  const { prisma } = require("@/lib/prisma");
  return prisma as MockPrismaClient;
}

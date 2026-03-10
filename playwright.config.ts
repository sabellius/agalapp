import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  // Global setup to generate auth state files
  // Run once before all tests to login and save session state
  globalSetup: require.resolve("./tests/global-auth.setup.ts"),

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    // Standard unauthenticated tests
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Authenticated projects - use pre-generated storage state
    // Tests can opt-in to these projects using test.describe.configure()
    {
      name: "chromium-authenticated-free",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "./tests/.auth/free-user.json",
      },
    },
    {
      name: "chromium-authenticated-premium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "./tests/.auth/premium-user.json",
      },
    },
    {
      name: "chromium-authenticated-owner",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "./tests/.auth/truck-owner.json",
      },
    },
  ],

  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

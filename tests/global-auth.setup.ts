import { chromium, type FullConfig } from "@playwright/test";

/**
 * Global setup for E2E tests
 * Generates auth state files for different user types
 *
 * Run with: pnpm exec playwright codegen tests/global-auth.setup.ts
 * Or manually: node tests/global-auth.setup.ts
 */

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects?.[0]?.use || {};
  if (!baseURL) {
    throw new Error("baseURL is required for auth setup");
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Helper to login and save state
  async function loginAndSaveState(
    email: string,
    password: string,
    outputPath: string,
  ) {
    const page = await context.newPage();

    // Navigate to sign-in page
    await page.goto(`${baseURL}/auth/sign-in`);

    // Fill in credentials
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to complete (should redirect to dashboard or home)
    await page.waitForURL(/\/(dashboard|trucks)?$/, { timeout: 10000 });

    // Save storage state
    await page.context().storageState({ path: outputPath });

    await page.close();
  }

  try {
    // Create .auth directory if it doesn't exist
    const fs = await import("node:fs/promises");
    await fs.mkdir("./tests/.auth", { recursive: true });

    // Login as free user (truck owner without premium)
    await loginAndSaveState(
      process.env.E2E_TEST_FREE_USER_EMAIL || "e2e-free@example.com",
      process.env.E2E_TEST_PASSWORD || "Test1234!",
      "./tests/.auth/free-user.json",
    );

    // Login as premium user
    await loginAndSaveState(
      process.env.E2E_TEST_PREMIUM_USER_EMAIL || "e2e-premium@example.com",
      process.env.E2E_TEST_PASSWORD || "Test1234!",
      "./tests/.auth/premium-user.json",
    );

    // Login as truck owner
    await loginAndSaveState(
      process.env.E2E_TEST_TRUCK_OWNER_EMAIL || "e2e-owner@example.com",
      process.env.E2E_TEST_PASSWORD || "Test1234!",
      "./tests/.auth/truck-owner.json",
    );

    console.log("✅ Auth state files generated successfully");
  } catch (error) {
    console.error("❌ Failed to generate auth state files:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;

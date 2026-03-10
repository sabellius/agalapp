import { expect, test } from "@playwright/test";

/**
 * E2E tests for Subscription page
 *
 * Authenticated tests require:
 * 1. Auth state files generated (run global-auth.setup.ts)
 * 2. E2E_TEST_PASSWORD environment variable set
 *
 * To generate auth state files:
 * 1. Set E2E_TEST_FREE_USER_EMAIL, E2E_TEST_PREMIUM_USER_EMAIL, E2E_TEST_PASSWORD
 * 2. Run: pnpm exec playwright test --config=playwright.config.ts
 */

test.describe("Subscription", () => {
  test("redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/subscription");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  // Authenticated tests - skipped until auth state files are generated
  test.describe("authenticated as free user", () => {
    test.use({ storageState: "./tests/.auth/free-user.json" });

    test.skip(
      !process.env.E2E_TEST_PASSWORD,
      "Set E2E_TEST_PASSWORD and generate auth state files to run",
    );

    test("displays upgrade prompt for free users", async ({ page }) => {
      await page.goto("/subscription");

      // Verify the upgrade prompt is displayed
      await expect(page.getByText("שדרג לפרימיום")).toBeVisible();
      await expect(page.getByText("שעות פעילות")).toBeVisible();
      await expect(page.getByText("תפריט מלא")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /שדרג עכשיו/ }),
      ).toBeVisible();
    });
  });

  test.describe("authenticated as premium user", () => {
    test.use({ storageState: "./tests/.auth/premium-user.json" });

    test.skip(
      !process.env.E2E_TEST_PASSWORD,
      "Set E2E_TEST_PASSWORD and generate auth state files to run",
    );

    test("displays current status and downgrade option", async ({ page }) => {
      await page.goto("/subscription");

      // Verify the premium status card is displayed
      await expect(page.getByText("סטטוס מנוי")).toBeVisible();
      await expect(page.getByText("ניהול מנוי")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "בטל מנוי פרימיום" }),
      ).toBeVisible();
    });
  });

  test.describe("upgrade flow", () => {
    test.use({ storageState: "./tests/.auth/free-user.json" });

    test.skip(
      !process.env.E2E_TEST_PASSWORD,
      "Set E2E_TEST_PASSWORD and generate auth state files to run",
    );

    test("allows user to upgrade to premium", async ({ page }) => {
      await page.goto("/subscription");

      // Click the upgrade button
      await page.getByRole("button", { name: /שדרג עכשיו/ }).click();

      // Verify success message is displayed
      await expect(page.getByText("המנוי שודרג!")).toBeVisible();
      await expect(
        page.getByText(/החשבון שלך כעת במנוי פרימיום/),
      ).toBeVisible();
    });
  });
});

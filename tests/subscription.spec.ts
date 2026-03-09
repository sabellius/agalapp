import { expect, test } from "@playwright/test";

test.describe("Subscription", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to subscription page - should redirect to sign-in if not authenticated
    await page.goto("/subscription");
  });

  test("redirects to sign-in when not authenticated", async ({ page }) => {
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  // TODO: Implement proper auth setup for E2E tests
  // These tests require authenticated sessions to work properly

  test.describe("authenticated as free user", () => {
    test.skip(true, "E2E auth setup not yet implemented");

    test("displays upgrade prompt for free users", async ({ page }) => {
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
    test.skip(true, "E2E auth setup not yet implemented");

    test("displays current status and downgrade option", async ({ page }) => {
      // Verify the premium status card is displayed
      await expect(page.getByText("סטטוס מנוי")).toBeVisible();
      await expect(page.getByText("ניהול מנוי")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "בטל מנוי פרימיום" }),
      ).toBeVisible();
    });
  });

  test.describe("upgrade flow", () => {
    test.skip(true, "E2E auth setup not yet implemented");

    test("allows user to upgrade to premium", async ({ page }) => {
      // Click the upgrade button
      await page.getByRole("button", { name: /שדרג עכשיו/ }).click();

      // Verify success message is displayed
      await expect(page.getByText("המנוי שודרג!")).toBeVisible();
      await expect(
        page.getByText(/החשבון שלך כעת במנוי פרימיום/),
      ).toBeVisible();
    });
  });

  test.describe("pricing information", () => {
    test.skip(true, "Requires authenticated user");

    test("displays pricing options", async ({ page }) => {
      // Verify pricing information is displayed
      await expect(page.getByText("מחירות")).toBeVisible();
      await expect(page.getByText("חודשי")).toBeVisible();
      await expect(page.getByText(/₪30\/חודש/)).toBeVisible();
      await expect(page.getByText("שנתי")).toBeVisible();
      await expect(page.getByText(/₪300\/שנה/)).toBeVisible();
    });
  });
});

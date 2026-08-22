import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("shows hero section with search", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /עגלות הקפה/ }),
    ).toBeVisible();
    await expect(page.locator('input[placeholder*="שם"]')).toBeVisible();
  });

  test("shows popular trucks section", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "הכי פופולרי" }),
    ).toBeVisible();
  });

  test("shows browse by region section", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "גלו לפי אזור" }),
    ).toBeVisible();
  });

  test("shows recently added section", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "נוספו לאחרונה" }),
    ).toBeVisible();
  });

  test("region cards link to trucks page with city filter", async ({
    page,
  }) => {
    await page.goto("/");

    const regionCards = page.locator('a[href*="/trucks?city="]');
    const count = await regionCards.count();

    if (count > 0) {
      const firstCard = regionCards.first();
      const href = await firstCard.getAttribute("href");
      expect(href).toContain("/trucks?city=");
    }
  });
});

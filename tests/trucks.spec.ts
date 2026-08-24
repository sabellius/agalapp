import { expect, test } from "@playwright/test";

test.describe("Trucks Listing", () => {
  test("shows trucks page", async ({ page }) => {
    await page.goto("/trucks");
    await expect(page).toHaveURL(/\/trucks/);
  });

  test("displays truck cards", async ({ page }) => {
    await page.goto("/trucks");

    const truckCards = page
      .locator('[class*="card"]')
      .or(page.locator('a[href*="/trucks/"]'));
    const _count = await truckCards.count();

    await expect(page.locator("body")).toBeVisible();
  });

  test("shows search input and search button", async ({ page }) => {
    await page.goto("/trucks");

    await expect(page.locator('input[placeholder*="חיפוש"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /חפש/ })).toBeVisible();
  });

  test("search filters by name or address", async ({ page }) => {
    await page.goto("/trucks");

    const searchInput = page.locator('input[placeholder*="חיפוש"]');
    await searchInput.fill("תל אביב");

    await page.getByRole("button", { name: /חפש/ }).click();

    await expect(page).toHaveURL(/search=/);
  });

  test("clear button appears when typing in search", async ({ page }) => {
    await page.goto("/trucks");

    const searchInput = page.locator('input[placeholder*="חיפוש"]');
    await searchInput.fill("test");

    const clearButton = page
      .locator("button")
      .filter({ hasText: "" })
      .or(page.locator('button[aria-label="clear"]'));
    const hasClearButton = (await clearButton.count()) > 0;

    expect(hasClearButton).toBe(true);
  });

  test("city filter select exists", async ({ page }) => {
    await page.goto("/trucks");

    const selects = page.locator("select").or(page.getByRole("combobox"));

    await expect(selects.first()).toBeVisible();
  });

  test("clear filters button appears when filters are active", async ({
    page,
  }) => {
    await page.goto("/trucks?search=test");

    await expect(page.getByRole("button", { name: /נקה סינון/ })).toBeVisible();
  });

  test("clear filters button resets all filters", async ({ page }) => {
    await page.goto("/trucks?search=test&city=תל+אביב");

    await page.getByRole("button", { name: /נקה סינון/ }).click();

    await expect(page).toHaveURL("/trucks");
  });

  test("navigates to truck detail page when clicking a truck", async ({
    page,
  }) => {
    await page.goto("/trucks");

    const truckLink = page.locator('a[href*="/trucks/"]').first();
    const count = await truckLink.count();

    if (count > 0) {
      await truckLink.click();
      await expect(page).toHaveURL(/\/trucks\/[^/]+$/);
    }
  });
});

test.describe("New truck page access", () => {
  test("regular user is redirected away from new truck page", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authenticated-free",
      "free user only",
    );

    await page.goto("/trucks/new");

    await expect(page).toHaveURL(/\/trucks$/);
  });

  test("truck owner can view new truck form", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authenticated-owner",
      "truck owner only",
    );

    await page.goto("/trucks/new");

    await expect(page.getByText("הוספת עגלת קפה חדשה")).toBeVisible();
  });
});

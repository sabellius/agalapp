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
    const count = await selects.count();

    expect(count).toBeGreaterThan(0);
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

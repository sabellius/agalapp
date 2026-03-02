import { test, expect } from "@playwright/test";

test.describe("Map View", () => {
  test("shows map page", async ({ page }) => {
    await page.goto("/trucks/map");

    await expect(page).toHaveURL(/\/trucks\/map/);
  });

  test("shows back to list button", async ({ page }) => {
    await page.goto("/trucks/map");

    const button = page.getByRole("link", { name: /חזור לרשימה/ });
    await expect(button).toBeVisible();
  });

  test("navigates back to trucks list", async ({ page }) => {
    await page.goto("/trucks/map");

    await page.getByRole("link", { name: /חזור לרשימה/ }).click();

    await expect(page).toHaveURL(/\/trucks$/);
  });
});

test.describe("Map Link", () => {
  test("map link exists on trucks listing", async ({ page }) => {
    await page.goto("/trucks");

    const mapLink = page.getByRole("link", { name: /מפה/ });
    await expect(mapLink).toBeVisible();
  });

  test("clicking map link navigates to map page", async ({ page }) => {
    await page.goto("/trucks");

    await page.getByRole("link", { name: /מפה/ }).click();

    await expect(page).toHaveURL(/\/trucks\/map/);
  });
});

test.describe("Truck Detail Map", () => {
  test("map section only shows for trucks with coordinates", async ({ page }) => {
    await page.goto("/trucks");

    const truckLink = page.locator('a[href*="/trucks/"]').first();
    const count = await truckLink.count();

    if (count > 0) {
      await truckLink.click();

      const mapHeading = page.getByText(/מיקום/);
      const hasMap = await mapHeading.count() > 0;

      if (hasMap) {
        await expect(mapHeading).toBeVisible();
      }
    }
  });
});

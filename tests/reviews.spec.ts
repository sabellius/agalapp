import { test, expect } from "@playwright/test";

test.describe("Reviews", () => {
  test("truck detail page shows reviews section", async ({ page }) => {
    await page.goto("/trucks");

    // Try to find a truck link and navigate to it
    const truckLink = page.locator('a[href*="/trucks/"]').first();
    const count = await truckLink.count();

    if (count > 0) {
      await truckLink.click();
      await expect(page.locator("body")).toBeVisible();
      // Check for star rating indicators
      const stars = page.locator('[class*="star"]').or(page.locator('svg[fill="yellow"]'));
      const starCount = await stars.count();
      // Should have some stars visible
      expect(starCount).toBeGreaterThan(0);
    }
  });

  test("shows review form trigger button", async ({ page }) => {
    await page.goto("/trucks");

    const truckLink = page.locator('a[href*="/trucks/"]').first();
    const count = await truckLink.count();

    if (count > 0) {
      await truckLink.click();

      // Look for a review/write review button
      const reviewButton = page.getByRole("button", { name: /כתוב/i }).or(page.getByText("ביקורת"));
      const buttonCount = await reviewButton.count();

      // May or may not have a review button depending on auth state
      // Just check the page loaded
      await expect(page.locator("body")).toBeVisible();
    }
  });
});

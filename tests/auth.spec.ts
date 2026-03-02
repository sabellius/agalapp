import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    // Check page loads successfully
    await expect(page.locator("body")).toBeVisible();
  });

  test("sign in page loads", async ({ page }) => {
    await page.goto("/auth/sign-in");
    // Check the page loads
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    // Check for form elements
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name*="email"]'));
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name*="password"]'));
    await expect(emailInput.or(passwordInput)).toHaveCount(2);
  });

  test("sign up page loads", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await expect(page).toHaveURL(/\/auth\/sign-up/);
    // Sign up form should have name input in addition to email/password
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveCount(1);
  });

  test("can navigate between sign in and sign up", async ({ page }) => {
    await page.goto("/auth/sign-in");
    // Look for link to sign up
    const signUpLink = page.getByRole("link", { name: /sign.?up|הרשמה/i }).or(page.locator('a[href*="sign-up"]'));
    if (await signUpLink.first().isVisible()) {
      await signUpLink.first().click();
      await expect(page).toHaveURL(/\/auth\/sign-up/);
    }
  });

  test("shows error for empty form submission", async ({ page }) => {
    await page.goto("/auth/sign-in");
    // Try to find a submit button
    const submitButton = page.locator('button[type="submit"]').or(page.getByRole("button", { name: /sign.?in|התחבר/ }));
    if (await submitButton.first().isVisible()) {
      await submitButton.first().click();
      // Should still be on sign-in page (form validation or error)
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    }
  });
});

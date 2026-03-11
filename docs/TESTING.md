# Testing Guide

Testing strategy and best practices for AgalApp.

## Testing Stack

| Tool | Purpose |
|------|---------|
| [Vitest](https://vitest.dev/) | Unit & integration tests |
| [Testing Library](https://testing-library.com/) | React component testing |
| [Playwright](https://playwright.dev/) | E2E browser testing |
| [@faker-js/faker](https://fakerjs.dev/) | Test data generation |

## Test Pyramid

```
      ┌─────────┐
     /    E2E    \       Few, slow, critical flows
    /─────────────\
   /  Integration  \     Some, Server Actions + mocked Prisma
  /─────────────────\
 /    Unit Tests     \   Many, fast, pure functions
└─────────────────────┘
```

## Running Tests

### Unit/Integration (Vitest)

```bash
pnpm run test              # Watch mode
pnpm run test:run          # Run all
pnpm run test:coverage     # With coverage
pnpm vitest run lib/tiers.test.ts  # Single file
```

### E2E (Playwright)

```bash
pnpm run test:e2e          # Run all
pnpm run test:e2e:ui       # With UI
```

---

## Unit Testing

Test validation schemas and utilities:

```typescript
// lib/tiers.test.ts
import { describe, it, expect } from "vitest";
import { canAccessPremiumFeatures } from "./tiers";

describe("canAccessPremiumFeatures", () => {
  it("returns true for PREMIUM user", () => {
    expect(canAccessPremiumFeatures({ tier: "PREMIUM" })).toBe(true);
  });

  it("returns true for ADMIN regardless of tier", () => {
    expect(canAccessPremiumFeatures({ tier: "FREE", role: "ADMIN" })).toBe(true);
  });
});
```

---

## Integration Testing

Test Server Actions with mocked Prisma:

```typescript
// app/actions/trucks.test.ts
import { describe, it, expect, vi } from "vitest";
import { createTruck } from "./trucks";
import { mockAuthSession } from "@/test/utils/test-helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: { coffeeTruck: { create: vi.fn() } },
}));

describe("createTruck", () => {
  it("creates truck with valid data", async () => {
    mockAuthSession({ id: "user1", role: "TRUCK_OWNER" });
    
    const result = await createTruck({
      name: "Test Truck",
      city: "תל אביב",
      address: "Test Address",
    });

    expect(result.success).toBe(true);
  });

  it("fails without auth", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    
    const result = await createTruck({ /* ... */ });
    
    expect(result.success).toBe(false);
    expect(result.message).toBe("אינך מחובר");
  });
});
```

### Type-Safe Test Helpers

```typescript
// test/utils/test-helpers.ts
export function mockAuthSession(user: {
  id: string;
  role: "USER" | "TRUCK_OWNER" | "ADMIN";
  tier?: "FREE" | "PREMIUM";
}) {
  vi.mocked(auth.api.getSession).mockResolvedValue({
    user: { ...user, tier: user.tier ?? "FREE" },
    session: { id: "test-session" },
  });
}
```

---

## E2E Testing

Test critical user flows:

```typescript
// tests/auth.spec.ts
import { test, expect } from "@playwright/test";

test("user can sign in", async ({ page }) => {
  await page.goto("/auth/sign-in");
  
  await page.fill('input[name="email"]', "user@test.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL("/dashboard");
});
```

```typescript
// tests/trucks.spec.ts
test("user can view trucks", async ({ page }) => {
  await page.goto("/trucks");
  
  await expect(page.locator('[data-testid="truck-card"]')).toHaveCount(10);
});

test("user can search trucks", async ({ page }) => {
  await page.goto("/trucks");
  
  await page.fill('input[name="search"]', "קפה");
  
  await expect(page.locator('[data-testid="truck-card"]')).toHaveCount(3);
});
```

### Authenticated E2E Tests

```typescript
// tests/reviews.spec.ts
test.use({ storageState: "tests/.auth/user.json" });

test("user can submit review", async ({ page }) => {
  await page.goto("/trucks/truck1");
  
  await page.click('button:has-text("הוסף ביקורת")');
  await page.click('[data-testid="star-5"]');
  await page.fill('textarea[name="content"]', "קפה מעולה!");
  await page.click('button[type="submit"]');
  
  await expect(page.locator("text=קפה מעולה!")).toBeVisible();
});
```

---

## Coverage Goals

| Type | Target |
|------|--------|
| Critical paths | 80%+ |
| UI components | 60%+ |
| Utilities | 90%+ |

Run coverage report:
```bash
pnpm run test:coverage
open coverage/index.html
```

---

## Best Practices

### Do's ✅

- **Co-locate tests:** `*.test.ts` next to source files
- **Test behavior:** Focus on what, not how
- **Use type-safe mocks:** Avoid `as any`
- **Test Hebrew messages:** Validate error messages
- **Descriptive names:** `it("returns error when user not authenticated")`

### Don'ts ❌

- **No implementation testing:** Don't test internal state
- **No `any` types:** Use proper types or test helpers
- **No test order dependencies:** Each test should be isolated
- **Don't test third-party libs:** Test your code, not Zod/Prisma

---

[← API Reference](API.md) | [Contributing →](CONTRIBUTING.md)

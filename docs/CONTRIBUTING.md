# Contributing

Thank you for your interest in contributing to AgalApp! This document outlines the process for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community

## Development Workflow

### 1. Fork and Clone

Fork the repository and clone your fork:

```bash
git clone https://github.com/yourusername/agalapp.git
cd agalapp
```

### 2. Create a Branch

Create a branch for your work:

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes

Follow the coding standards below and ensure all tests pass.

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[scope]: <description>
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `perf`, `revert`

**Examples**:

```
feat(trucks): add image upload
fix(auth): resolve session timeout
test(map): add marker clustering tests
refactor(reviews): extract rating component
```

### 5. Run Quality Checks

```bash
# Format and lint
pnpm run lint:fix

# Type check
pnpm run typecheck

# Run tests
pnpm run test:run
pnpm run test:e2e
```

### 6. Create a Pull Request

Push to your fork and create a PR:

```bash
git push origin feat/your-feature-name
```

Your PR should:
- Describe what changed and why
- Reference any related issues
- Include screenshots for UI changes
- Pass all CI checks

## Coding Standards

### TypeScript

- **No `any` types** - use proper TypeScript types
- Define all function parameters and return types
- Use Prisma generated types from `@/generated/prisma/client`

```typescript
// ✅ Good
async function createTruck(input: CreateTruckInput): Promise<ActionResult<Truck>> {
  // ...
}

// ❌ Bad
async function createTruck(input: any): Promise<any> {
  // ...
}
```

### Components

- Server Components by default
- Only use `"use client"` when interactivity is needed
- Use `interface Props` for component props

```typescript
// ✅ Server Component (default)
export function TruckList({ trucks }: TruckListProps) {
  return <div>{/* ... */}</div>;
}

// ✅ Client Component (when needed)
"use client";

export function StarRating({ value, onChange }: StarRatingProps) {
  return <button onClick={() => onChange(value + 1)}>{/* ... */}</button>;
}
```

### Server Actions

All mutations go in `app/actions/`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function actionName(input: InputType): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, message: "אינך מחובר" };
  }

  // ... business logic ...

  revalidatePath("/path");
  return { success: true, data: result };
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files/Folders | kebab-case | `truck-form.tsx` |
| Components | PascalCase | `TruckForm` |
| Functions/Variables | camelCase | `createTruck` |
| Constants | SCREAMING_CASE | `MAX_IMAGES` |
| Database Tables | snake_case | `coffee_trucks` |
| Database Columns | camelCase | `coffeeTruckId` |

### Validation

Use Zod schemas in `lib/validations/`:

```typescript
import { z } from "zod";

export const createTruckSchema = z.object({
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים"),
  city: z.string().min(1, "יש לבחור עיר"),
});

export type CreateTruckInput = z.infer<typeof createTruckSchema>;
```

## Testing

### Unit Tests

- Co-locate test files: `*.test.ts` next to source
- Mock Prisma with `vi.mock()`
- Use type-safe test helpers from `@/test/utils/test-helpers.ts`

```typescript
import { mockAuthSession } from "@/test/utils/test-helpers";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { coffeeTruck: { create: vi.fn() } },
}));

describe("createTruck", () => {
  it("creates truck with valid data", async () => {
    mockAuthSession(mockTruckOwner);
    mockPrisma.coffeeTruck.create.mockResolvedValue({ id: "1" });
    const result = await createTruck(validInput);
    expect(result.success).toBe(true);
  });
});
```

### E2E Tests

- Auth tests use `storageState` for pre-generated sessions
- Place in `tests/` directory

```typescript
import { test, expect } from "@playwright/test";

test("user can browse trucks", async ({ page }) => {
  await page.goto("/trucks");
  await expect(page.locator("h1")).toContainText("משאיות קפה");
});
```

## Linting and Formatting

We use [Biome](https://biomejs.dev/) for consistent code style:

```bash
# Check issues
pnpm run lint

# Auto-fix
pnpm run lint:fix
```

Pre-commit hooks run automatically via Lefthook.

## Questions?

Feel free to open an issue with the `question` label.

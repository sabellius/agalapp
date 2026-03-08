# AgalApp - AI Agent Guidelines

Hebrew (RTL) coffee cart review platform built with Next.js 16 App Router.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | MySQL/MariaDB via Prisma ORM |
| Authentication | better-auth |
| Validation | Zod 4.x |
| UI Components | shadcn/ui (Radix UI) |
| Formatting | Biome |
| Testing | Vitest, Playwright, Testing Library |

## Commands

### Development
```bash
pnpm run dev         # Start dev server
pnpm run build       # Build for production
pnpm run start       # Start production server
```

### Linting & Formatting
```bash
pnpm run lint        # Check code (format + lint)
pnpm run lint:fix    # Auto-fix all issues
pnpm run typecheck   # TypeScript check
```

### Testing
```bash
# Unit/Integration (Vitest)
pnpm run test                    # Watch mode
pnpm run test:run                # Run all tests
pnpm run test:coverage           # Coverage report
pnpm run test:ui                 # Vitest UI

# Single test file
pnpm vitest run lib/tiers.test.ts
pnpm vitest run app/actions/trucks.test.ts

# Single test by name pattern
pnpm vitest run -t "upgrades user to premium"
pnpm vitest run -t "validates truck name" lib/validations/truck-schema.test.ts

# E2E (Playwright)
pnpm run test:e2e                # Run all E2E
pnpm run test:e2e:ui             # E2E with UI
```

### Database
```bash
npx prisma generate              # Generate Prisma client
pnpm run seed                    # Seed database
```

## Project Structure

```
app/
  actions/           # Server Actions (mutations)
  api/               # API routes (auth, cloudinary)
  (protected)/       # Auth-required routes
  trucks/            # Public truck pages
lib/
  validations/       # Zod schemas
  auth.ts            # better-auth config
  prisma.ts          # Prisma client
components/
  ui/                # shadcn/ui components
  trucks/            # Truck components
  reviews/           # Review components
test/                # Test fixtures & mocks
tests/               # E2E tests (Playwright)
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files/Folders | kebab-case | `truck-form.tsx` |
| Components | PascalCase | `TruckForm` |
| Functions/Variables | camelCase | `createTruck` |
| Constants | SCREAMING_CASE | `MAX_IMAGES` |
| Database Tables | snake_case | `coffee_trucks` |
| Database Columns | camelCase | `coffeeTruckId` |

## Code Style

### Imports Order
1. React/Next.js imports
2. Third-party libraries (zod, lucide-react)
3. Internal aliases (`@/lib/...`, `@/components/...`)
4. Relative imports (`./utils`, `../types`)

### Server Actions Pattern
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; message: string };

export async function actionName(input: InputType): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = schema.parse(input);
    // ... business logic ...

    revalidatePath("/path");
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message ?? "נתונים לא תקינים" };
    }
    console.error("Error:", error);
    return { success: false, message: "שגיאה כללית" };
  }
}
```

### Components
- Server Components by default
- `"use client"` only when interactivity needed
- Use `interface Props` for component props
- Functional components only (no classes)

```typescript
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  // ...
}
```

### Validation (Zod)
- Schemas in `lib/validations/`
- Export types via `z.infer<typeof schema>`
- Hebrew error messages for user-facing

```typescript
import { z } from "zod";

export const createTruckSchema = z.object({
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים"),
  city: z.string().min(1, "יש לבחור עיר"),
});

export type CreateTruckInput = z.infer<typeof createTruckSchema>;
```

### TypeScript
- **Strict mode - no `any` types**
- Define all parameter and return types
- Use Prisma generated types from `@/generated/prisma/client`

### Error Handling
- Server Actions: Return `ActionResult` with Hebrew message
- Log errors with `console.error()`
- User messages in Hebrew, code/comments in English

### Testing
- Co-located: `*.test.ts` / `*.test.tsx` next to source
- Mock Prisma inline with `vi.mock()`
- Test behavior, not implementation

```typescript
vi.mock("@/lib/prisma", () => ({
  prisma: { coffeeTruck: { create: vi.fn() } },
}));

test("creates truck with valid data", async () => {
  mockPrisma.coffeeTruck.create.mockResolvedValue({ id: "1" });
  const result = await createTruck(validInput);
  expect(result.success).toBe(true);
});
```

## Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[scope]: <description>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `perf`, `revert`

Examples:
```
feat(trucks): add image upload
fix(auth): resolve session timeout
test(map): add marker clustering tests
```

## What NOT to Do

- Don't use npm or yarn - use **pnpm**
- Don't use client components unless interactive
- Don't skip TypeScript types
- Don't hardcode values - use env variables
- Don't add unnecessary comments
- Don't use Pages Router (we use App Router)
- Don't switch from better-auth or MySQL/MariaDB

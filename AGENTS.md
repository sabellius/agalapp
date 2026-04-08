# AgalApp - AI Agent Guidelines

Hebrew (RTL) coffee cart review platform built with Next.js 16 App Router.

## Tool Compatibility & Planning

This project works with OpenCode and Claude Code. Follow this source of truth hierarchy:

- `AGENTS.md` (this file) — single source of truth for agent rules
- `CLAUDE.md` — symlink to AGENTS.md, never edit directly
- `ROADMAP.md` — single source of truth for planning, read at session start
- `tasks/` — detailed per-feature plans, read before starting work
- `plans/` — historical archive only

**Rules:**
- Read `ROADMAP.md` before doing anything each session
- Never start a feature without an entry in `ROADMAP.md`
- After completing work, update `ROADMAP.md` (move to ✅ Done with date)
- Never create planning files outside `tasks/`

## Tech Stack

Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4, Prisma ORM (MySQL/MariaDB), better-auth, Zod 4.x, shadcn/ui, Biome, Lefthook, Vitest, Playwright.

## Commands

```bash
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run lint             # Check code (format + lint)
pnpm run lint:fix         # Auto-fix all issues
pnpm run typecheck        # TypeScript check

# Unit tests (Vitest)
pnpm run test             # Watch mode
pnpm run test:run         # Run all tests
pnpm vitest run lib/tiers.test.ts              # Single test file
pnpm vitest run -t "upgrades user to premium"  # Single test by name

# E2E tests (Playwright)
pnpm run test:e2e
pnpm run test:e2e:ui

# Database
pnpm exec prisma generate
pnpm run seed
```

> Do not manually run lint, format, or typecheck — handled automatically (formatter on write, lefthook on commit).

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
test/                # Test fixtures & mocks
tests/               # E2E tests (Playwright)
```

## Naming Conventions

| Type                | Convention     | Example          |
| ------------------- | -------------- | ---------------- |
| Files/Folders       | kebab-case     | `truck-form.tsx` |
| Components          | PascalCase     | `TruckForm`      |
| Functions/Variables | camelCase      | `createTruck`    |
| Constants           | SCREAMING_CASE | `MAX_IMAGES`     |
| Database Tables     | snake_case     | `coffee_trucks`  |

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
    if (!session?.user?.id) return { success: false, message: "אינך מחובר" };
    const validated = schema.parse(input);
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

- Server Components by default; `"use client"` only when interactivity needed
- Use `interface Props` for component props

### Validation (Zod)

- Schemas in `lib/validations/`
- Export types via `z.infer<typeof schema>`
- Hebrew error messages for user-facing

### TypeScript

- **Strict mode - no `any` types**
- Use Prisma generated types from `@/generated/prisma/client`

### Testing

- Co-located: `*.test.ts` / `*.test.tsx` next to source
- Mock Prisma inline with `vi.mock()`
- Use type-safe helpers from `@/test/utils/test-helpers.ts`

## Git Commits

Follow Conventional Commits: `<type>[scope]: <description>`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `perf`, `revert`

## Constants

All domain values are named constants. Import from:

- `lib/validations/common.ts`: `MAX_TRUCK_IMAGES`, `MAX_TRUCK_NAME_LENGTH`, `MAX_PAGE_SIZE`
- `lib/validations/review-schema.ts`: `MIN_REVIEW_RATING`, `MAX_REVIEW_RATING`
- `lib/tiers.ts`: `PREMIUM_DURATION_DAYS`, `FREE_TIER_MAX_ATTRIBUTES`

## What NOT to Do

- Don't use npm or yarn - use **pnpm**
- Don't use client components unless interactive
- Don't skip TypeScript types
- Don't hardcode values - use named constants
- Don't add unnecessary comments
- Don't use Pages Router (we use App Router)
- Don't use `npx` for local binaries - use `pnpm exec`

## Commits

- After completing a task, commit changes using the `git-commit` skill
- Segment changes into logical commits — one commit per concern

# AgalApp - AI Agent Guidelines

Hebrew (RTL) coffee cart review platform built with Next.js 16 App Router.

## Tool Compatibility & File Conventions

This project is primarily developed with OpenCode but must remain fully compatible
with Claude Code. Follow these conventions to ensure seamless switching between agents.

### Source of Truth Hierarchy

- `AGENTS.md` (this file) is the single source of truth for all agent rules
- `CLAUDE.md` exists solely as `@AGENTS.md` — never edit it directly
- `ROADMAP.md` is the single source of truth for all planning — read it at session start
- `opencode.json` loads any additional modular rule files via glob

### Planning Rules

- Read `ROADMAP.md` before doing anything each session
- `ROADMAP.md` is the only file that defines what is planned, in progress, or done
- `tasks/` contains detailed per-feature plans — read the relevant file before starting
  work, never start a feature without a corresponding entry in `ROADMAP.md` first
- `plans/` is a historical archive — never use it to determine what to build
- Never create new planning files outside of `tasks/` — update `ROADMAP.md` instead

### Updating ROADMAP.md

After completing any meaningful work, update `ROADMAP.md`:

- Move finished items to ✅ Done with date (YYYY-MM-DD)
- Move started items to 🔄 In Progress with a checkbox sub-step list
- Never delete entries — move them between sections

### Starting a Task

1. Read `ROADMAP.md`
2. Confirm the task exists and is in 📋 Planned or 🔄 In Progress
3. Read `tasks/<feature-name>.md` if it exists, otherwise ask before creating it
4. Move the item to 🔄 In Progress in `ROADMAP.md` before writing any code

### File Layout Reference

- `AGENTS.md` — universal agent rules (this file, all tools read this)
- `CLAUDE.md` — `@AGENTS.md` only, never edited directly
- `opencode.json` — loads `.claude/rules/*.md` via glob for modular extras
- `.claude/rules/` — modular rule files (auto-loaded by Claude Code, glob-loaded by OpenCode)
- `ROADMAP.md` — live project roadmap, always up to date
- `tasks/` — per-feature detailed plans
- `plans/` — archived historical planning docs, read-only context

## Tech Stack

| Category       | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| Language       | TypeScript (strict mode)            |
| Styling        | Tailwind CSS v4                     |
| Database       | MySQL/MariaDB via Prisma ORM        |
| Authentication | better-auth                         |
| Validation     | Zod 4.x                             |
| UI Components  | shadcn/ui (Radix UI)                |
| Formatting     | Biome                               |
| Git Hooks      | Lefthook                            |
| Testing        | Vitest, Playwright, Testing Library |

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

### Git Hooks (Lefthook)

Pre-commit hooks run automatically on commit:

- **lint-fix**: Biome format + lint on staged files
- **typecheck**: TypeScript check (when ts/tsx files changed)

```bash
pnpm exec lefthook run pre-commit   # Run hooks manually
LEFTHOOK=0 git commit               # Skip hooks (not recommended)
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
  utils/             # Test helper utilities (type-safe auth mocks)
tests/               # E2E tests (Playwright)
  .auth/             # Generated auth state files for E2E tests
```

## Naming Conventions

| Type                | Convention     | Example          |
| ------------------- | -------------- | ---------------- |
| Files/Folders       | kebab-case     | `truck-form.tsx` |
| Components          | PascalCase     | `TruckForm`      |
| Functions/Variables | camelCase      | `createTruck`    |
| Constants           | SCREAMING_CASE | `MAX_IMAGES`     |
| Database Tables     | snake_case     | `coffee_trucks`  |
| Database Columns    | camelCase      | `coffeeTruckId`  |

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
      return {
        success: false,
        message: error.issues[0]?.message ?? "נתונים לא תקינים",
      };
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

export function StarRating({
  value,
  onChange,
  readonly = false,
}: StarRatingProps) {
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
- Use type-safe test helpers from `@/test/utils/test-helpers.ts`
- Test behavior, not implementation

```typescript
vi.mock("@/lib/prisma", () => ({
  prisma: { coffeeTruck: { create: vi.fn() } },
}));

// ✅ Use type-safe helper instead of `as any`
import { mockAuthSession } from "@/test/utils/test-helpers";

test("creates truck with valid data", async () => {
  mockAuthSession(mockTruckOwner); // Type-safe!
  mockPrisma.coffeeTruck.create.mockResolvedValue({ id: "1" });
  const result = await createTruck(validInput);
  expect(result.success).toBe(true);
});
```

### E2E Testing (Playwright)

- Auth tests use `storageState` for pre-generated sessions
- Tests are skipped until auth state files exist
- Generate auth state via `tests/global-auth.setup.ts`

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

## Package Management Notes

- `pnpm.onlyBuiltDependencies` in package.json allows packages (like lefthook) to run postinstall scripts
- Always use `pnpm exec` instead of `npx` for running local binaries

## Known Issues

No known issues.

## Constants & Magic Numbers

All domain values are named constants — never use raw literals. Import from:

| Constant                                                                                                                        | Source                                  |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `MAX_TRUCK_IMAGES`, `MAX_TRUCK_NAME_LENGTH`, `MAX_ADDRESS_LENGTH`, `MAX_IMAGE_ALT_LENGTH`, `MAX_PAGE_SIZE`, `DEFAULT_PAGE_SIZE` | `lib/validations/common.ts`             |
| `MIN_REVIEW_RATING`, `MAX_REVIEW_RATING`, `MIN_REVIEW_LENGTH`, `MAX_REVIEW_LENGTH`                                              | `lib/validations/review-schema.ts`      |
| `DAYS_PER_WEEK`                                                                                                                 | `lib/validations/truck-hours-schema.ts` |
| `PREMIUM_DURATION_DAYS`, `FREE_TIER_MAX_ATTRIBUTES`, `EXPIRY_WARNING_DAYS`, `MS_PER_DAY`                                        | `lib/tiers.ts`                          |

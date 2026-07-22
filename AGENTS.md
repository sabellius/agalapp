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

## YouTrack Workflow

This project uses YouTrack (project key: `AGA`) for task tracking. Follow this workflow for every feature:

1. **Create ticket** — Before starting any work, create a ticket in YouTrack. For multi-part features, create a parent ticket with subtasks grouped by **logical concern** (not per-commit). Avoid over-splitting.
2. **Create branch** — Branch from `main` using the parent ticket ID: `feat/AGA-X-short-description` (e.g., `feat/AGA-1-theme-espresso`)
3. **Implement** — Work on the branch, committing logical changes. Reference ticket IDs in commit messages: `Closes AGA-X`
4. **Track progress** — Update ticket `Stage` field as work progresses: `Backlog` → `In Progress` → `Done`
5. **Merge** — Merge to `main` with `--no-ff`: `git merge feat/AGA-X-name --no-ff -m "Merge feat/AGA-X-name: description"`
6. **Cleanup** — Delete the local branch: `git branch -d feat/AGA-X-name`
7. **Update roadmap** — Add completed work to `ROADMAP.md` under ✅ Done with date

**Branch strategy:** One branch per parent ticket (not per subtask). Subtasks are individual commits within the branch. The branch maps to one PR/merge.

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

### Atomic Commits

Every commit must be **atomic** — one logical, self-contained change that can be reviewed, reverted, or cherry-picked independently.

- **One concern per commit** — never bundle unrelated fixes (e.g. a RTL fix and a performance fix in the same commit)
- **Each commit should leave the codebase in a working state** — no broken builds between commits
- **Prefer many small commits over one large commit** — if a ticket has 5 distinct fixes, create 5 commits
- **Commit message describes the specific change**, not the ticket — `"fix(ui): correct partial star fill direction in RTL"` not `"fix: AGA-12 changes"`
- After completing a task, commit changes using the `git-commit` skill

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

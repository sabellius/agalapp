# AgalApp - AI Agent Guidelines

This document provides context for AI agents (Cline, Claude, etc.) working on this codebase.

## Project Overview

**AgalApp** is an Israeli coffee cart review platform - a Hebrew (RTL) web application where users can discover, rate, and review coffee trucks/carts across Israel.

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | MySQL/MariaDB via Prisma ORM |
| Authentication | better-auth |
| Validation | Zod 4.x |
| UI Components | shadcn/ui (Radix UI primitives) |
| Maps | Leaflet + OpenStreetMap |
| Geocoding | Nominatim API |
| Image Hosting | Cloudinary |
| Formatting | Biome |
| Fonts | Noto Sans Hebrew (Google Fonts) |
| Testing | Vitest, Playwright, Testing Library |

## Project Structure

```
agalapp/
├── app/
│   ├── (protected)/          # Auth-protected routes
│   │   ├── dashboard/        # User dashboard
│   │   ├── subscription/     # Subscription management page
│   │   └── trucks/           # Truck management (new/edit)
│   ├── actions/              # Server Actions for mutations
│   │   ├── attributes.ts      # Truck attribute management
│   │   ├── subscription.ts   # Upgrade/downgrade account tier
│   │   └── ...
│   ├── api/                  # API routes (auth, cloudinary signatures)
│   ├── auth/                 # Auth pages (sign-in, sign-up)
│   ├── trucks/               # Public truck listing and details
│   ├── layout.tsx            # Root layout (RTL, Hebrew font)
│   ├── page.tsx              # Homepage
│   └── providers.tsx         # React providers
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── map/                  # Map-related components (Leaflet)
│   ├── reviews/              # Review-related components
│   └── trucks/               # Truck-related components
├── lib/
│   ├── auth.ts               # better-auth configuration
│   ├── auth-client.ts        # Client-side auth utilities
│   ├── cloudinary.ts         # Cloudinary setup
│   ├── geocoding.ts          # Nominatim geocoding utility
│   ├── prisma.ts             # Prisma client with MariaDB adapter
│   ├── tiers.ts              # User tier system (FREE/PREMIUM)
│   ├── truck-permissions.ts # Permission checking based on user tier
│   ├── utils.ts              # Utility functions
│   └── validations/          # Zod validation schemas
│       ├── common.ts         # Shared schemas (truckName, city, etc.)
│       ├── truck-schema.ts   # Truck validation
│       ├── review-schema.ts  # Review validation
│       ├── image-schema.ts   # Image validation
│       └── vote-schema.ts    # Vote validation
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding script
├── generated/prisma/         # Generated Prisma client
├── test/                     # Test infrastructure
│   ├── fixtures/             # Test data (trucks, users, reviews)
│   └── mocks/                # Shared mocks
├── tests/                    # E2E tests (Playwright)
│   └── auth.spec.ts
├── vitest.config.ts          # Vitest configuration
├── vitest.setup.ts           # Global test setup (mocks, cleanup)
└── playwright.config.ts      # Playwright configuration
```

## Architecture Decisions

### Next.js App Router
- Uses App Router (not Pages Router)
- Server Components by default
- Client Components only when interactivity is needed
- Route groups `(protected)` for auth-required pages

### Authentication
- **Library**: better-auth (not NextAuth)
- **Adapter**: Prisma with MySQL provider
- **Email/Password**: Enabled
- **Roles**: USER, TRUCK_OWNER, ADMIN

### Database
- **Tables**: snake_case naming (coffee_trucks, coffee_truck_images, reviews)
- **ORM**: Prisma with MariaDB adapter
- **Relations**: Proper cascade deletes configured

### Styling
- RTL support from day one (`dir="rtl"` on html)
- Noto Sans Hebrew font
- Mobile-first responsive design
- shadcn/ui component library

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files/Folders | kebab-case | `truck-form.tsx`, `image-upload.tsx` |
| Components | PascalCase | `TruckForm`, `StarRating` |
| Functions/Variables | camelCase | `createTruck`, `imageUrl` |
| Constants | SCREAMING_CASE | `MAX_IMAGES`, `API_URL` |
| Database Tables | snake_case | `coffee_trucks`, `coffee_truck_images` |
| Database Columns | camelCase | `coffeeTruckId`, `isPrimary` |

## Code Style Guidelines

### Server Action Pattern
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

export async function actionName(
  input: InputType,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = schema.parse(input);
    // ... do work with validated data ...

    revalidatePath("/path");
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Error:", error);
    return { success: false, message: "שגיאה כללית" };
  }
}
```

### TypeScript
- Strict mode enabled - **no `any` types**
- Define types for all function parameters and returns
- Use generated Prisma types from `@/generated/prisma/client`
- Hebrew error messages for user-facing errors, English for code/comments

### Components
- Functional components only (no class components)
- Use `"use client"` directive only when needed (forms, interactivity)
- Server components by default

### Server Actions
- Place in `app/actions/` directory
- Use `"use server"` directive
- Accept **typed plain objects** (not FormData) - infer types from Zod schemas
- Return `ActionResult<T>` type: `{ success: true; data?: T } | { success: false; message: string }`
- Check user roles before mutations
- Use `revalidatePath()` after mutations

### Validation
- Use **Zod 4.x** for input validation
- Schemas in `lib/validations/` with exported types via `z.infer<>`
- Validate with `.parse()` in Server Actions, catch `ZodError`

### Code Formatting
- **Biome** for formatting and linting (replaces ESLint/Prettier)
- Auto-format on save
- Run `pnpm run lint` to check, `pnpm run lint:fix` to auto-fix

### Testing
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests
- **Testing Library** for component tests
- Tests are **co-located** with source files (`*.test.ts` for unit/integration, `tests/` for E2E)

#### Test Structure
```
app/
  actions/
    subscription.ts
    subscription.test.ts    # Server action tests
    truck.ts
    truck.test.ts           # Server action tests
    reviews.test.ts
    images.test.ts
components/
  reviews/
    star-rating.tsx
    star-rating.test.tsx    # Component tests
  trucks/
    user-tier-badge.tsx
    user-tier-badge.test.tsx
    upgrade-prompt.tsx
    upgrade-prompt.test.tsx
lib/
  tiers.ts
  tiers.test.ts            # Tier utility tests
  truck-permissions.ts
  truck-permissions.test.ts # Permission tests
  validations/
    truck-schema.ts
    truck-schema.test.ts     # Validation tests
test/
  fixtures/                 # Test data (trucks, users, reviews)
  mocks/                    # Prisma and other mocks
tests/
  auth.spec.ts              # E2E tests (Playwright)
  subscription.spec.ts      # Subscription E2E tests
```

#### Running Tests
```bash
pnpm run test          # Vitest watch mode
pnpm run test:run      # Run all unit/integration tests
pnpm run test:coverage # Coverage report
pnpm run test:e2e      # E2E tests
pnpm run test:e2e:ui    # E2E tests with UI
```

#### Writing Tests

**Server Actions** - Mock dependencies inline:
```typescript
vi.mock("@/lib/prisma", () => ({
  prisma: {
    coffeeTruck: {
      create: vi.fn(),
      findUnique: vi.fn(),
      // ...
    },
  },
}));

const mockPrisma = prisma as typeof prisma & {
  coffeeTruck: { create: ReturnType<typeof vi.fn> };
};
```

**Components** - Test behavior, not implementation:
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("updates rating when star clicked", async () => {
  const handleChange = vi.fn();
  render(<StarRating value={0} onChange={handleChange} />);
  await userEvent.click(screen.getByRole("button", { name: "3 stars" }));
  expect(handleChange).toHaveBeenCalledWith(3);
});
```

**E2E** - Test critical user flows:
```typescript
test("signs in with valid credentials", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.fill('input[type="email"]', "user@example.com");
  await page.fill('input[type="password"]', "password");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
});
```

#### Current Test Coverage (259 tests)
| Category | Tests | Files |
|----------|-------|-------|
| Validation schemas | 91 | 5 files (common, truck, review, image, vote) |
| Server actions (trucks) | 16 | trucks.test.ts |
| Server actions (reviews) | 19 | reviews.test.ts |
| Server actions (images) | 23 | images.test.ts |
| Server actions (votes) | 6 | votes.test.ts |
| Server actions (subscription) | 5 | subscription.test.ts |
| Tier utilities | 11 | tiers.test.ts |
| Permission utilities | 19 | truck-permissions.test.ts |
| Component tests | 50 | star-rating, truck-preview, review-form, vote-button, trucks-search, map, user-tier-badge, upgrade-prompt |
| Geocoding utility | 5 | geocoding.test.ts |
| E2E tests | 22 | auth, trucks, reviews, map |
| E2E stubs | - | subscription.spec.ts |

### Environment Variables
- Use `env-config.ts` to load environment variables
- Never hardcode sensitive values
- Required env vars: `DB_*`, `CLOUDINARY_*`, `AUTH_SECRET`

## User Roles

| Role | Description |
|------|-------------|
| USER | Can browse trucks, create reviews |
| TRUCK_OWNER | Can create and edit their own coffee trucks |
| ADMIN | Full access, can edit any truck |

## Subscription / Tier System

### Overview
The platform uses an **account-level subscription system** (not per-truck). Users can upgrade to PREMIUM to access additional features.

### User Tiers

| Tier | Description | Expiry |
|------|-------------|--------|
| FREE | Basic access - can browse and review | No expiry |
| PREMIUM | Full access - working hours, menu display | 30 days (configurable) |

### Database Schema
```prisma
model User {
  // ...
  tier            UserTier     @default(FREE)
  tierExpiryAt    DateTime?
  // ...
}

enum UserTier {
  FREE
  PREMIUM
}
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/tiers.ts` | Tier types, constants, utility functions |
| `lib/truck-permissions.ts` | Permission checking based on user tier |
| `app/actions/subscription.ts` | Server actions for upgrade/downgrade |
| `app/actions/attributes.ts` | Server actions for attribute management |
| `app/(protected)/subscription/page.tsx` | Subscription management page |
| `components/trucks/user-tier-badge.tsx` | Badge component showing tier status |
| `components/trucks/upgrade-prompt.tsx` | Prompt for free users to upgrade |
| `components/trucks/feature-lock.tsx` | Lock indicator for premium features |
| `components/trucks/attributes-editor.tsx` | Attribute selection with tier limits |
| `components/trucks/attributes-grid.tsx` | Display attributes for a truck |
| `components/trucks/attribute-badge.tsx` | Single attribute badge with icon |

### Permission Utilities

```typescript
import { isCurrentlyPremium } from "@/lib/tiers";
import { canShowWorkingHours, canEditWorkingHours, isUserVerified, getMaxAttributes, canAddAttribute } from "@/lib/truck-permissions";

// Check if user has premium access (considers expiry)
isCurrentlyPremium(user.tier, user.tierExpiryAt) // boolean

// Permission checks for premium features
canShowWorkingHours(user)  // boolean - can view working hours
canEditWorkingHours(user)  // boolean - can edit working hours
isUserVerified(user)       // boolean - user is verified (premium)
getMaxAttributes(user)     // number - 3 for FREE, Infinity for PREMIUM
canAddAttribute(user, n)   // boolean - can add n more attributes
```

### Premium Features

| Feature | FREE | PREMIUM |
|---------|------|---------|
| Browse trucks | ✓ | ✓ |
| Create reviews | ✓ | ✓ |
| Working hours display | ✗ | ✓ |
| Menu display | ✗ | ✓ |
| Truck attributes | 3 max | Unlimited |
| Verified badge | ✗ | ✓ |

### Pricing

| Period | Price |
|--------|-------|
| Monthly | ₪30/חודש |
| Yearly | ₪300/שנה (25% savings) |

### Server Actions

```typescript
import { upgradeAccount, downgradeAccount } from "@/app/actions/subscription";

// Upgrade user to premium (30 days)
const result = await upgradeAccount();
// Returns: { success: true, data: { expiryDate: Date } }

// Downgrade to free tier
const result = await downgradeAccount();
// Returns: { success: true }
```

### Testing

All subscription/tier features are tested:
- `app/actions/subscription.test.ts` - Server action tests (5 tests)
- `lib/tiers.test.ts` - Utility function tests (11 tests)
- `lib/truck-permissions.test.ts` - Permission tests (19 tests)
- `components/trucks/user-tier-badge.test.tsx` - Component tests (6 tests)
- `components/trucks/upgrade-prompt.test.tsx` - Component tests (6 tests)

## Key Features Implemented

1. **Truck Management**: Create, edit, delete coffee trucks
2. **Image Upload**: Cloudinary integration with signed uploads
3. **Reviews**: Star ratings with text content
4. **Review Votes**: "Was this helpful?" voting on reviews with toggle functionality
5. **Authentication**: Email/password with role-based access
6. **User Tiers**: Account-level subscription system (FREE/PREMIUM) with expiry
7. **Premium Features**: Working hours, menu display, attributes (tier-gated)
8. **Subscription Management**: Upgrade/downgrade via `/subscription` page
9. **Truck Attributes**: Predefined attributes (accessibility, seating, amenities, payment, dietary, products, service, vibe)
10. **Seeding**: Faker-based seed script for development
11. **Navigation Header**: Responsive sticky header with mobile sheet drawer
12. **Search & Filtering**: Text search, city filter, rating filter with URL params
13. **Map Integration**: Leaflet + OpenStreetMap with automatic geocoding via Nominatim
14. **Testing**: 259 tests (Vitest + Playwright) covering validations, server actions, components, and E2E flows

### Pending Tests

| Feature | Status |
|---------|--------|
| Attributes (server actions) | Not tested |
| Attributes (components) | Not tested |
| Attributes (permissions) | Not tested |

### Navigation Structure

**Public (all users):**
- בית → `/`
- עגלות קפה → `/trucks`
- מפת עגלות → `/trucks/map`

**Authenticated:**
- לוח בקרה → `/dashboard`
- הגדרות מנוי → `/subscription`

**Truck Owner / Admin:**
- הוסף עגלה → `/trucks/new`

**Components:**
- `components/site-header.tsx` - Main responsive header
- `components/ui/dropdown-menu.tsx` - User menu dropdown
- `components/ui/sheet.tsx` - Mobile navigation drawer
- `components/ui/tooltip.tsx` - shadcn tooltip component
- `components/trucks/user-tier-badge.tsx` - Badge showing user's tier status
- `components/trucks/upgrade-prompt.tsx` - Upgrade prompt for premium features
- `components/trucks/feature-lock.tsx` - Lock indicator for premium features
- `components/trucks/attributes-editor.tsx` - Attribute selection with tier limits
- `components/trucks/attributes-grid.tsx` - Display attributes for a truck
- `components/trucks/attribute-badge.tsx` - Single attribute badge with icon
- `components/trucks/hours-display.tsx` - Display working hours
- `components/trucks/hours-editor.tsx` - Edit working hours
- `components/trucks/hours-locked.tsx` - Lock message for working hours
- `components/trucks/open-status-badge.tsx` - Show if truck is currently open

## Development Workflow

### Package Management
- **Always use `pnpm`** for all package operations (install, add, etc.)
- Never use npm or yarn

### Running the App
```bash
pnpm run dev         # Start dev server
pnpm run build       # Build for production
pnpm run start       # Start production server
```

### Testing
```bash
pnpm run test          # Vitest watch mode
pnpm run test:run      # Run all unit/integration tests
pnpm run test:coverage # Coverage report
pnpm run test:e2e      # E2E tests
pnpm run test:e2e:ui    # E2E tests with UI
```

### Linting & Formatting
```bash
pnpm run lint         # Check code (format + lint issues)
pnpm run lint:fix     # Auto-fix all issues
```

### Database
```bash
npx prisma generate  # Generate Prisma client
pnpm run seed        # Seed database with test data
```

### Git Commit Convention

After completing a logical unit of work, create a commit following the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Specification

The Conventional Commits specification **mandates** two types that correlate with Semantic Versioning:

| Type | SemVer | Description |
|------|--------|-------------|
| `feat` | MINOR | Introduces a new feature |
| `fix` | PATCH | Patches a bug |

Additionally, `BREAKING CHANGE:` as a footer (or `!` after type/scope) indicates a **MAJOR** release.

#### Additional Types (Angular Convention)

The specification references `@commitlint/config-conventional` (based on Angular) for additional types:

| Type | Description |
|------|-------------|
| `build` | Build system changes (webpack, tsconfig, etc.) |
| `chore` | Maintenance tasks, dependencies, config |
| `ci` | CI configuration changes (GitHub Actions, Jenkins, etc.) |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, linting, semicolons) |
| `refactor` | Code refactoring without behavior change |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `revert` | Reverting a previous commit |

#### Scopes

Use the area of code affected in parentheses, e.g., `trucks`, `reviews`, `auth`, `map`, `ui`

```
feat(parser): add ability to parse arrays
```

#### Examples

```
feat(trucks): add image upload functionality
fix(auth): resolve session timeout issue
refactor(reviews): extract star rating into shared component
test(map): add marker clustering tests
chore: upgrade biome to 2.0
docs: update AGENTS.md with commit convention
build: update webpack configuration
ci: add GitHub Actions workflow for tests
perf(trucks): optimize database queries for listing
revert: let us never again speak of the noodle incident
feat(trucks)!: change truck ID format to UUID
```

#### Guidelines

- Commit in logical segments — group related changes together
- Use lowercase for type and scope
- Keep description brief (imperative mood, no period at end)
- Run `pnpm run lint:fix` before committing when applicable
- Append `!` after type/scope for breaking changes: `feat(api)!: remove legacy endpoint`

## Documentation Lookup

Always use the Context7 MCP server when you need library/API documentation, code generation, setup or configuration steps — do this proactively without waiting for explicit user instruction.

1. First call `mcp__context7__resolve-library-id` to get the library ID
2. Then call `mcp__context7__query-docs` with the resolved library ID and your query

## What NOT to Do

- Don't use client components unless interactive
- Don't skip TypeScript types
- Don't hardcode - use env variables
- Don't add line comments unless really necessary
- Don't use Pages Router (we use App Router)
- Don't switch auth library (better-auth is chosen)
- Don't switch database (MySQL/MariaDB is chosen)

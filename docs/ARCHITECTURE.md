# Architecture

Technical design decisions and system architecture for AgalApp.

## System Overview

```
┌─────────────────────────────────────────────────┐
│              Client (Browser)                    │
│   React 19 + Tailwind + Leaflet (RTL Support)   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           Next.js 16 App Router                  │
│  ┌──────────────┐  ┌─────────────────────────┐ │
│  │   Server     │  │   Server Actions        │ │
│  │  Components  │  │   (Type-safe Mutations) │ │
│  └──────────────┘  └─────────────────────────┘ │
└────────────────────┬────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
┌─────────┐    ┌──────────┐    ┌───────────┐
│ Prisma  │    │better-auth│   │ Cloudinary│
│  ORM    │    │           │   │  (Images) │
└────┬────┘    └──────────┘    └───────────┘
     │
┌────▼────┐
│  MySQL  │
└─────────┘
```

## Key Technical Decisions

### Next.js 16 App Router

**Why:** Server Components reduce client JavaScript, improve SEO, and align with React's future.

**Trade-offs:**
- ✅ Better performance, smaller bundles
- ✅ Type-safe Server Actions (no API routes needed)
- ❌ Newer paradigm, less community resources

### better-auth (vs NextAuth)

**Why:** Lighter weight, better TypeScript support, designed for App Router.

| Aspect | better-auth | NextAuth |
|--------|-------------|----------|
| Bundle size | ~30KB | ~100KB+ |
| TypeScript | First-class | Good but verbose |
| App Router | Native | Added later |

### Prisma + MySQL 9

**Why:** Type-safe queries, excellent DX, battle-tested database.

**Benefits:**
- Auto-generated TypeScript types
- Intuitive schema definition
- Built-in migration tooling

### Biome (vs ESLint + Prettier)

**Why:** 10-100x faster, single tool for linting + formatting.

| Metric | Biome | ESLint + Prettier |
|--------|-------|-------------------|
| Speed | 10-100x faster | Baseline |
| Tools | 1 | 2+ |
| Dependencies | 1 package | 10+ packages |

## Data Model

### Core Entities

```
User (Role: USER | TRUCK_OWNER | ADMIN)
├── Sessions
├── CoffeeTrucks (if owner)
├── Reviews
└── Votes

CoffeeTruck
├── Images
├── Reviews
├── Hours (weekly schedule)
└── Attributes (tags: "Wi-Fi", "Seating", etc.)

Review
├── Rating (1-5 stars)
├── Content
└── Votes (helpfulness)
```

### Key Relationships

- User → CoffeeTrucks (1:N, owner)
- CoffeeTruck → Reviews (1:N)
- User → Reviews (1:N, one per truck)
- Review → Votes (1:N)

## Authentication & Authorization

### Roles

| Role | Capabilities |
|------|-------------|
| USER | Browse, review, vote |
| TRUCK_OWNER | Create/edit own trucks |
| ADMIN | Full access |

### Tiers

| Tier | Features |
|------|----------|
| FREE | Basic access |
| PREMIUM | Operating hours display, advanced features |

### Authorization Pattern

```typescript
// Every Server Action follows this pattern
const session = await auth.api.getSession({ headers: await headers() });

if (!session?.user?.id) {
  return { success: false, message: "אינך מחובר" };
}

if (session.user.role !== "ADMIN" && truck.ownerId !== session.user.id) {
  return { success: false, message: "אין לך הרשאה" };
}
```

## Server Actions Pattern

All mutations use a consistent pattern:

```typescript
"use server";

export async function actionName(input: Input): Promise<ActionResult> {
  try {
    // 1. Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, message: "אינך מחובר" };

    // 2. Validation
    const validated = schema.parse(input);

    // 3. Authorization
    if (!canPerformAction(session.user)) {
      return { success: false, message: "אין לך הרשאה" };
    }

    // 4. Business logic
    const result = await prisma.model.create({ data: validated });

    // 5. Cache invalidation
    revalidatePath("/path");

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: error.issues[0]?.message };
    }
    return { success: false, message: "שגיאה כללית" };
  }
}
```

## State Management

| State Type | Solution |
|------------|----------|
| Server data | React Server Components (fetch on request) |
| Form state | Native forms + Server Actions |
| Client state | React hooks (useState, useReducer) |
| Global UI | React Context (theme only) |

**No Redux/Zustand:** Server Components make global state largely unnecessary.

## RTL Implementation

1. **Root direction:** `<html lang="he" dir="rtl">`
2. **Logical properties:** Use `ms-` (margin-start) instead of `ml-` (margin-left)
3. **Text alignment:** Use `text-start` instead of `text-left`
4. **Flexbox/Grid:** RTL-aware by default

## Testing Strategy

### Test Pyramid

```
      ┌─────────┐
     /    E2E    \       Playwright (critical flows)
    /─────────────\
   /  Integration  \     Vitest (Server Actions)
  /─────────────────\
 /    Unit Tests     \   Vitest (utils, validation)
└─────────────────────┘
```

### Coverage Goals

- Critical paths: 80%+
- UI components: 60%+
- Utilities: 90%+

## Security

1. **Role-Based Access** - Verified in every Server Action
2. **SQL Injection** - Prevented by Prisma parameterized queries
3. **XSS** - React auto-escapes
4. **CSRF** - Built into Server Actions
5. **Image Uploads** - Validated via Cloudinary

## Performance

1. **Server Components** - Minimal client JavaScript
2. **Image Optimization** - Next.js Image + Cloudinary
3. **Database Indexing** - Foreign keys, search fields
4. **Streaming** - Suspense for progressive loading
5. **Bundle Size** - No heavy dependencies, tree-shaking

---

[← Back to README](README.md) | [API Reference →](API.md)

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
| Image Hosting | Cloudinary |
| Formatting | Biome |
| Fonts | Noto Sans Hebrew (Google Fonts) |

## Project Structure

```
agalapp/
├── app/
│   ├── (protected)/          # Auth-protected routes
│   │   ├── dashboard/        # User dashboard
│   │   └── trucks/           # Truck management (new/edit)
│   ├── actions/              # Server Actions for mutations
│   ├── api/                  # API routes (auth, cloudinary signatures)
│   ├── auth/                 # Auth pages (sign-in, sign-up)
│   ├── trucks/               # Public truck listing and details
│   ├── layout.tsx            # Root layout (RTL, Hebrew font)
│   ├── page.tsx              # Homepage
│   └── providers.tsx         # React providers
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── reviews/              # Review-related components
│   └── trucks/               # Truck-related components
├── lib/
│   ├── auth.ts               # better-auth configuration
│   ├── auth-client.ts        # Client-side auth utilities
│   ├── cloudinary.ts         # Cloudinary setup
│   ├── prisma.ts             # Prisma client with MariaDB adapter
│   ├── utils.ts              # Utility functions
│   └── validations/          # Zod validation schemas
│       ├── common.ts         # Shared schemas (truckName, city, etc.)
│       ├── truck-schema.ts   # Truck validation
│       ├── review-schema.ts  # Review validation
│       └── image-schema.ts   # Image validation
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding script
└── generated/prisma/         # Generated Prisma client
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
- Run `npx biome check --write .` to format all files

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

## Key Features Implemented

1. **Truck Management**: Create, edit, delete coffee trucks
2. **Image Upload**: Cloudinary integration with signed uploads
3. **Reviews**: Star ratings with text content
4. **Authentication**: Email/password with role-based access
5. **Seeding**: Faker-based seed script for development
6. **Navigation Header**: Responsive sticky header with mobile sheet drawer

### Navigation Structure

**Public (all users):**
- בית → `/`
- עגלות קפה → `/trucks`

**Authenticated:**
- לוח בקרה → `/dashboard`

**Truck Owner / Admin:**
- הוסף עגלה → `/trucks/new`

**Components:**
- `components/site-header.tsx` - Main responsive header
- `components/ui/dropdown-menu.tsx` - User menu dropdown
- `components/ui/sheet.tsx` - Mobile navigation drawer

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

### Database
```bash
npx prisma generate  # Generate Prisma client
pnpm run seed        # Seed database with test data
```

### Git Commit Pattern
- Commit after completing todos in a task
- Keep messages concise but descriptive

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

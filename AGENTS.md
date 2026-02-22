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
| UI Components | shadcn/ui (Radix UI primitives) |
| Image Hosting | Cloudinary |
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
│   └── utils.ts              # Utility functions
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

### TypeScript
- Strict mode enabled
- Define types for all function parameters and returns
- Use generated Prisma types from `@/generated/prisma/client`

### Components
- Functional components only (no class components)
- Use `"use client"` directive only when needed (forms, interactivity)
- Server components by default

### Server Actions
- Place in `app/actions/` directory
- Use `"use server"` directive
- Return `{ success: boolean, message?: string, data?: T }` pattern
- Check user roles before mutations
- Use `revalidatePath()` after mutations

### Validation
- Use Zod for input validation (TODO: not yet implemented)

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

## Development Workflow

### Running the App
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
```

### Database
```bash
npx prisma generate  # Generate Prisma client
npm run seed         # Seed database with test data
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

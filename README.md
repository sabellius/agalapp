# AgalApp

A modern Hebrew (RTL) coffee truck review platform for discovering, reviewing, and rating coffee carts across Israel. Built with Next.js 16, type-safe Server Actions, and full RTL support.

---

## Live Demo

The app is deployed and fully interactive. Try it with any of the demo accounts below - all use password `password123`.

**URL:** _https://agalapp.saveliyshiryaev.dev/_

| Role | Email | What you can do |
|------|-------|-----------------|
| User (Free) | `test-user-free@example.com` | Browse, review, vote |
| User (Premium) | `test-user-premium@example.com` | All user features + premium attributes |
| Owner (Free) | `test-owner-free@example.com` | Manage own trucks, basic features |
| Owner (Premium) | `test-owner-premium@example.com` | Full truck management + premium features |
| Admin | `test-admin@example.com` | Full system access, manage all trucks |

---

## Screenshots

_[Add screenshots here - homepage, truck detail, map, dashboard]_

---

## Features

### Discovery
- **Interactive Map** - Leaflet-based truck discovery with custom rating-colored markers
- **Search & Filtering** - Full-text search, city filter, rating filter
- **Open/Closed Status** - Real-time open hours badge based on Israel timezone

### Reviews
- **Star Ratings** - One review per user per truck, with partial-star display
- **Community Voting** - Upvote helpful reviews
- **Owner Responses** - _(planned)_

### Truck Management
- **Multi-Image Upload** - Cloudinary integration with primary image selection
- **Business Hours** - Day-by-day schedule with open/closed detection
- **Attributes** - Wifi, parking, accessibility, and more (premium-gated)
- **Premium Tier** - 30-day subscription unlocks advanced features

### Auth & Roles
- **Three Roles** - User, Truck Owner, Admin with granular permissions
- **Session Management** - better-auth with secure cookie-based sessions
- **Route Protection** - Server-side auth guards on all protected routes

### Design System
- **Espresso Theme** - Warm coffee-inspired palette using OKLCH color space
- **Semantic Tokens** - `--star`, `--success`, `--warning` tokens for consistent theming
- **Full RTL** - Hebrew-first layout with logical CSS properties throughout

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript (strict mode, zero `any`) |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Database** | MySQL via Prisma ORM 7 |
| **Auth** | better-auth |
| **Validation** | Zod 4.x |
| **Maps** | Leaflet + react-leaflet |
| **Images** | Cloudinary |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Tooling** | Biome, Lefthook, pnpm |
| **Deployment** | Docker, Caddy (TLS), Oracle Cloud |

---

## Architecture Highlights

**Type-safe Server Actions** - All mutations go through `withAuth()` + `safeAction()` wrappers with Zod validation. No unchecked API routes.

**Semantic Design Tokens** - Colors defined as OKLCH CSS variables in `:root`, bridged to Tailwind via `@theme inline`. Changing one value updates the entire app.

**Role-based Access Control** - Server-side permission checks on every action using a centralized `canModifyTruck()` helper.

**RTL-first** - All components use logical CSS properties (`ps-4` not `pl-4`, `end-3` not `right-3`). Direction provider at the root.

**Realistic Seed Data** - 9 trucks with Israeli names, cities, Hebrew reviews, and accurate geographic coordinates.

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for local MySQL)

### Setup

```bash
# Clone and install
git clone https://github.com/sabellius/agalapp.git
cd agalapp
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your Cloudinary credentials and auth secret

# Start database
docker compose up -d

# Initialize database with seed data
pnpm exec prisma generate && pnpm run seed

# Start dev server
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
  actions/           Server Actions (type-safe mutations)
  api/               API routes (auth, cloudinary upload)
  (protected)/       Auth-required routes (dashboard, subscription)
  trucks/            Public truck pages (list, detail, new, edit)
  map/               Interactive truck map
lib/
  validations/       Zod schemas (shared client/server)
  auth.ts            better-auth configuration
  prisma.ts          Prisma client singleton
  tiers.ts           Subscription tier logic
components/
  ui/                shadcn/ui primitives
  trucks/            Truck-specific components
  reviews/           Review components
  map/               Map components
test/                Test fixtures and mocks
tests/               E2E tests (Playwright)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/GETTING_STARTED.md) | Detailed setup & troubleshooting |
| [Architecture](docs/ARCHITECTURE.md) | Technical decisions & design patterns |
| [API Reference](docs/API.md) | Server Actions documentation |
| [Testing Guide](docs/TESTING.md) | Testing strategy & examples |
| [Contributing](docs/CONTRIBUTING.md) | Contribution guidelines |

---

## License

[MIT](LICENSE) &copy; 2026 Saveliy Shiryaev

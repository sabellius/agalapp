# AgalApp

> A modern Hebrew (RTL) coffee truck review platform built with Next.js 16

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Testing](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-green)

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#requirements">Requirements</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#documentation">Docs</a> ·
  <a href="#highlights">Highlights</a>
</p>

---

## Overview

AgalApp is a production-ready full-stack application for discovering and reviewing coffee trucks across Israel. Built with modern best practices including Server Components, type-safe Server Actions, and comprehensive testing.

### Key Features

- **Interactive Map** - Leaflet-based truck discovery
- **Review System** - Star ratings with community voting
- **Role-Based Access** - User, Truck Owner, Admin roles
- **Premium Subscriptions** - Tiered feature access
- **Image Management** - Cloudinary integration
- **RTL Support** - Full Hebrew localization

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Database** | MySQL/MariaDB via Prisma ORM |
| **Auth** | better-auth |
| **Validation** | Zod 4.x |
| **Testing** | Vitest, Playwright |
| **Tooling** | Biome, Lefthook |

---

## Requirements

- **Node.js** 18+
- **pnpm** 8+
- **Docker** (for local MariaDB)
- **Cloudinary account** (free tier works, for image uploads)

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/agalapp.git
cd agalapp
pnpm install

# Set up environment
cp .env.example .env

# Start database
docker-compose up -d

# Initialize database
npx prisma generate && pnpm run seed

# Start dev server
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| User | `user@test.com` | `password123` |
| Truck Owner | `owner@test.com` | `password123` |
| Admin | `admin@test.com` | `password123` |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/GETTING_STARTED.md) | Detailed setup & troubleshooting |
| [Architecture](docs/ARCHITECTURE.md) | Technical decisions & design |
| [API Reference](docs/API.md) | Server Actions documentation |
| [Testing Guide](docs/TESTING.md) | Testing strategy & examples |
| [Contributing](docs/CONTRIBUTING.md) | Contribution guidelines |

---

## Highlights

**Technical Depth**
- Modern React patterns (Server Components, Server Actions)
- End-to-end type safety (TypeScript + Prisma + Zod)
- Comprehensive testing (80%+ coverage)

**Real-World Features**
- Multi-role authentication & authorization
- Feature-gated premium system
- Geocoding integration (OpenStreetMap)
- Image management (Cloudinary)
- Full RTL support

**Code Quality**
- No `any` types (strict TypeScript)
- Consistent code style (Biome)
- Pre-commit hooks (Lefthook)
- Conventional commits

---

## License

MIT &copy; 2026 Saveliy Shiryaev

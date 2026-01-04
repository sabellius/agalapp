# Database Setup Guide

## Overview

This project uses MySQL 8.4 LTS with Prisma ORM, running in Docker containers for local development.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and pnpm installed

## Quick Start

### 1. Environment Setup

The `.env.local` file is already configured with default credentials for local development:

```bash
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=agalapp
DATABASE_USER=agalapp_user
DATABASE_PASSWORD=agalapp_dev_password_123
```

**For production**, set these environment variables in your hosting platform.

### 2. Start MySQL Container

```bash
pnpm db:start
```

This starts MySQL 8.4 in a Docker container with persistent data storage.

### 3. Run Database Migrations

```bash
pnpm db:migrate
```

This creates the database schema based on `prisma/schema.prisma`.

### 4. (Optional) Open Prisma Studio

```bash
pnpm db:studio
```

Visual database browser at http://localhost:5555

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm db:start` | Start MySQL container |
| `pnpm db:stop` | Stop MySQL container |
| `pnpm db:reset` | Reset database (deletes all data) |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Create and run migrations |
| `pnpm db:migrate:deploy` | Run migrations in production |
| `pnpm db:studio` | Open Prisma Studio GUI |

## Usage in Code

### Server Components

```typescript
import { prisma } from '@/lib/db'

export default async function UsersPage() {
  const users = await prisma.user.findMany()

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Server Actions

```typescript
'use server'

import { prisma } from '@/lib/db'

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  const user = await prisma.user.create({
    data: { email, name }
  })

  return user
}
```

### API Routes

```typescript
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}
```

## Database Schema

Edit `prisma/schema.prisma` to define your data models:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

After editing, run:

```bash
pnpm db:migrate
```

## Environment Variables

### Next.js Variable Types

**Server-side only** (default):
- `DATABASE_URL`, `DATABASE_PASSWORD`, etc.
- Never exposed to browser
- Safe for secrets

**Client-side** (requires `NEXT_PUBLIC_` prefix):
- `NEXT_PUBLIC_API_URL`
- Exposed to browser
- Never use for secrets

### Environment Files

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.local` | Local development credentials | Ignored |
| `.env.example` | Template for team | Committed |
| `.env.production` | Production settings | Platform-specific |

## Troubleshooting

### Container won't start

```bash
# Check if port 3306 is already in use
lsof -i :3306

# Reset everything
pnpm db:reset
```

### Connection refused

Ensure Docker container is running:

```bash
docker ps
```

### Prisma Client out of sync

```bash
pnpm db:generate
```

## Production Deployment

1. Set environment variables in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Railway: Variables tab
   - Other: Platform-specific settings

2. Run migrations on deploy:
   ```bash
   pnpm db:migrate:deploy
   ```

3. Prisma Client generates automatically via `postinstall` script

## Security Notes

- `.env.local` is gitignored - never commit it
- Database credentials are server-side only
- Use `NEXT_PUBLIC_` prefix only for non-sensitive data
- Change default passwords in production

# Getting Started

Complete guide to setting up AgalApp for local development.

## Prerequisites

Ensure you have the following installed:

- **Node.js** 20 or higher ([nvm](https://github.com/nvm-sh/nvm) recommended)
- **pnpm** 9 or higher (`npm install -g pnpm`)
- **Docker** and Docker Compose (for local MariaDB)

### Verify Installation

```bash
node --version   # v20.x.x or higher
pnpm --version   # 9.x.x or higher
docker --version # 20.x.x or higher
```

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/agalapp.git
cd agalapp
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all runtime and development dependencies defined in `package.json`.

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```bash
# Database
DATABASE_URL="mysql://root:password@localhost:3306/agalapp"

# Auth (better-auth)
BETTER_AUTH_SECRET="your-super-secret-key-change-this"
BETTER_AUTH_URL="http://localhost:3000"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_PRESET="agalapp"

# Geocoding (optional, for address lookup)
GOOGLE_MAPS_API_KEY="your-google-maps-key"
```

> **Note**: For local development without Cloudinary, image upload features will be disabled but the app will still function.

### 4. Start the Database

Using Docker Compose:

```bash
docker-compose up -d
```

This starts a MariaDB container on port 3306.

To verify the database is running:

```bash
docker-compose ps
```

### 5. Initialize the Database

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations to create the database schema:

```bash
npx prisma migrate deploy
```

Seed the database with initial data:

```bash
pnpm run seed
```

The seed script creates:
- Admin user
- Sample truck attributes (Wi-Fi, Seating, etc.)
- Sample cities

### 6. Start the Development Server

```bash
pnpm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Verification

To verify everything is working:

1. Visit [http://localhost:3000](http://localhost:3000) - you should see the home page
2. Visit [http://localhost:3000/trucks](http://localhost:3000/trucks) - browse truck listings
3. Visit [http://localhost:3000/trucks/map](http://localhost:3000/trucks/map) - view the map
4. Try signing up via the auth flow

## Troubleshooting

### Database Connection Issues

If you see `Can't reach database server`:

```bash
# Check if MariaDB container is running
docker-compose ps

# View database logs
docker-compose logs mariadb

# Restart the database
docker-compose restart mariadb
```

### Prisma Client Issues

If Prisma commands fail:

```bash
# Regenerate the client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Port Already in Use

If port 3000 is in use:

```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

### Cloudinary Issues

Image uploads will fail without valid Cloudinary credentials. To test without Cloudinary:
- Skip image upload functionality
- Use the app's other features (browsing, reviews, etc.)

## Next Steps

- Read [CONTRIBUTING.md](./CONTRIBUTING.md) to learn about the development workflow
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the technical design
- Explore the codebase starting with `app/` and `lib/` directories

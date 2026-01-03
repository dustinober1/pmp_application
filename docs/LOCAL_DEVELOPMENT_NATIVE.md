# Local Development Without Docker

This guide sets up PMP Study Pro for local development without any Docker containers.

## Prerequisites

- **Node.js 18+** - Download from https://nodejs.org
- **PostgreSQL 15** - Database for development
- **Git** - Version control

## Option 1: Local PostgreSQL (Recommended for Development)

### Install PostgreSQL

**macOS (Homebrew):**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**

```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download installer from https://www.postgresql.org/download/windows/

### Create Development Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql prompt:
CREATE USER pmp_user WITH PASSWORD 'dev_password';
CREATE DATABASE pmp_study_db OWNER pmp_user;
ALTER USER pmp_user CREATEDB;
\q
```

### Set Environment Variables

Create `.env` in the root directory:

```bash
# Database
DATABASE_URL="postgresql://pmp_user:dev_password@localhost:5432/pmp_study_db"

# API
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3000

# Stripe (Sandbox)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Initialize Database

From the root directory:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Start Development

```bash
# Terminal 1: Runs both API and Web with hot-reload
npm run dev

# Or run separately:
# Terminal 1:
npm run dev:api

# Terminal 2:
npm run dev:web
```

Access the app at:

- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs

## Option 2: Remote Render Database

Use your Render PostgreSQL database for local development:

### Get Connection String

1. Go to https://dashboard.render.com
2. Click on `pmp-postgres` service
3. Click "Connect" button
4. Copy the "External Database URL"

### Set Environment Variable

```bash
# In .env file
DATABASE_URL="postgresql://user:password@dpg-xxx.render.internal:5432/pmp_study_db"
```

### Run Migrations

```bash
npm run db:generate
npm run db:migrate
```

### Start Dev

```bash
npm run dev
```

**Pros:**

- Matches production database
- No local database setup

**Cons:**

- Slower (network latency)
- Requires internet connection
- Not ideal for rapid iteration

## Scripts Reference

```bash
# Development
npm run dev              # Run API + Web concurrently
npm run dev:api         # Run API only
npm run dev:web         # Run Web only

# Building
npm run build           # Build all packages
npm run build:api       # Build API only
npm run build:web       # Build Web only
npm run build:shared    # Build shared types

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run pending migrations
npm run db:push         # Push schema directly (dev only)
npm run db:seed         # Seed initial data
npm run db:studio       # Open Prisma Studio UI

# Testing
npm run test            # Run all tests
npm run test:api        # Run API tests
npm run test:web        # Run Web tests
npm run test:coverage   # Coverage report
npm run test:e2e        # End-to-end tests

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix lint errors
npm run format          # Format with Prettier
npm run format:check    # Check formatting
```

## Debugging

### API Debugging

```bash
# Run with Node debugger
node --inspect node_modules/.bin/ts-node-dev --respawn --transpile-only packages/api/src/index.ts

# Then open: chrome://inspect
```

### Web Debugging

```bash
# Next.js has built-in debugging
# Open DevTools in browser (F12)
# Go to Sources tab
```

### Database Debugging

```bash
# Open Prisma Studio
npm run db:studio

# Runs on http://localhost:5555
```

## Troubleshooting

### Database Connection Fails

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -U pmp_user

# Verify database exists
psql -U pmp_user -d pmp_study_db -c "SELECT 1"
```

### Port Already in Use

```bash
# Find process on port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Or use different port
PORT=3003 npm run dev:api
```

### Node Modules Issues

```bash
# Clean install
npm run clean
npm install

# Or rebuild
npm run build:shared
npm run build:api
npm run build:web
```

### API Can't Connect to Database

1. Check DATABASE_URL in `.env`
2. Verify PostgreSQL is running
3. Ensure database and user exist
4. Try connecting manually:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

## Hot Module Replacement (HMR)

Both API and Web support hot-reload:

- **API:** ts-node-dev watches `packages/api/src/` - restart on changes
- **Web:** Next.js HMR - page reloads automatically

Changes should reflect instantly without full restart.

## IDE Setup (VS Code)

### Recommended Extensions

```json
{
  "extensions": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.makefile-tools",
    "prisma.prisma"
  ]
}
```

### Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Performance Tips

1. **Use local PostgreSQL** - Much faster than remote
2. **Build shared once:** `npm run build:shared` speeds up dev
3. **Disable unnecessary middleware** - Set `LOG_LEVEL=warn` in `.env`
4. **Use Prisma Studio for quick checks** - Faster than manual SQL queries

## Next Steps

1. Complete `.env` setup with your Stripe keys
2. Run `npm install` to install all dependencies
3. Set up database with migration + seed scripts
4. Start development with `npm run dev`
5. Open http://localhost:3000 in browser

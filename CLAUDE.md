# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A comprehensive PMP (Project Management Professional) study platform for the 2026 exam with tiered subscriptions (free, mid-level, high-end, corporate). Built as a monorepo using npm workspaces.

**Tech Stack**: React 18 + Next.js, Node.js + Express, PostgreSQL + Prisma ORM, Redis (optional), Jest + fast-check

## Development Commands

### Workspace-level Commands

```bash
# Install all dependencies
npm install

# Start all development servers (API + Web)
npm run dev

# Build all packages
npm run build

# Run tests across all packages
npm run test

# Lint and format
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

### Package-specific Commands

```bash
# API server (packages/api)
npm run dev:api          # Start API dev server on port 3001
npm run build:api        # Build API
npm run test:api         # Run API tests
npm run test:watch -w @pmp/api    # Run tests in watch mode

# Web frontend (packages/web)
npm run dev:web          # Start Next.js dev server on port 3000
npm run build:web        # Build frontend

# Shared types (packages/shared)
npm run build:shared     # Build shared types
```

### Database Commands

```bash
# All database commands run in the API package
npm run db:generate      # Generate Prisma client (run after schema changes)
npm run db:migrate       # Create and apply new migration
npm run db:push          # Push schema changes without migration (dev only)
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio GUI (visual database browser)

# Start PostgreSQL + Redis with Docker
docker-compose up -d
docker-compose down
```

### Utility Commands

```bash
npm run clean            # Remove node_modules and dist folders across all packages
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests with coverage (API has 80% threshold)
npm run test:coverage -w @pmp/api

# Run a single test file
npx jest -w @pmp/api src/services/auth.service.test.ts

# Run tests matching a pattern
npx jest -w @pmp/api --testNamePattern "should validate email"
```

## Architecture

### Monorepo Structure

- `packages/api/` - Express backend with Prisma ORM
- `packages/web/` - Next.js frontend with TailwindCSS
- `packages/shared/` - Shared TypeScript types and constants used by both API and web

### API Architecture (packages/api/src)

**Layer Pattern**: Routes → Services → Database (via Prisma)

```
routes/          # Express route handlers, parameter validation with Zod
  ├── auth.routes.ts
  ├── subscription.routes.ts
  ├── domain.routes.ts      # Study content (domains/tasks)
  ├── flashcard.routes.ts
  ├── practice.routes.ts
  ├── formula.routes.ts
  ├── dashboard.routes.ts   # Analytics
  ├── team.routes.ts        # Corporate features
  └── search.routes.ts

services/        # Business logic, database queries, complex operations
  ├── auth.service.ts        # JWT, refresh tokens, password resets
  ├── subscription.service.ts # Tier management, PayPal integration
  ├── content.service.ts     # Domains, tasks, study guides
  ├── flashcard.service.ts   # SM-2 spaced repetition algorithm
  ├── practice.service.ts    # Questions, sessions, mock exams
  ├── formula.service.ts     # EVM formulas, calculator
  ├── dashboard.service.ts   # Progress analytics, weak areas
  └── team.service.ts        # Corporate team management

middleware/
  ├── auth.middleware.ts     # JWT verification, user extraction
  ├── tier.middleware.ts     # Subscription tier enforcement
  ├── error.middleware.ts    # Centralized error handling
  └── validation.middleware.ts

config/
  ├── env.ts                 # Environment validation with Zod
  └── database.ts            # Prisma client singleton

validators/                  # Zod schemas for request validation
```

**Key Patterns**:

- All routes use `/api` prefix (e.g., `/api/auth/login`)
- Routes call services for business logic; services use Prisma for database access
- Authentication: JWT access tokens (15m) + refresh tokens (7d)
- Subscription tiers enforced via `requireTier()` and `requireFeature()` middleware
- Error codes from `@pmp/shared` used consistently across API

### Database Schema (Prisma)

**Core Models**:

- `User` - Authentication, profile, relations to all user data
- `SubscriptionTier` - Tier definitions with `features` JSON field
- `UserSubscription` - User's current subscription, PayPal ID, status
- `Domain` - PMP domains (People, Process, Business Environment)
- `Task` - PMI tasks within domains (e.g., "1.1", "2.3")
- `StudyGuide` → `StudySection` - Markdown-based study content
- `Flashcard` + `FlashcardReview` - Spaced repetition (SM-2 algorithm)
- `PracticeQuestion` + `QuestionOption` + `QuestionAttempt` - Question bank
- `Formula` + `FormulaVariable` - EVM and other PMP formulas
- `Team` + `TeamMember` - Corporate features (admin/member roles)

**Important Relationships**:

- Study content hierarchy: `Domain` → `Task` → `StudyGuide` → `StudySection[]`
- Flashcard reviews use SM-2: `easeFactor`, `interval`, `repetitions`, `nextReviewDate`
- Questions can be linked to formulas via `QuestionFormula` join table
- Sessions track practice: `PracticeSession` → `PracticeSessionQuestion[]`
- Team alerts auto-generated for corporate admins based on member performance

### Shared Package (@pmp/shared)

Exports TypeScript types and constants used by both API and web:

- Types: `JwtPayload`, `TierFeatures`, `FlashcardRating`, etc.
- Error codes: `AUTH_ERRORS`, `SUBSCRIPTION_ERRORS`, etc.
- Constants: `TIER_HIERARCHY`, tier feature limits

Both API and web import from `@pmp/shared` - changes here affect both.

### Web Frontend Architecture (packages/web/src)

**Next.js App Router Pattern**: File-based routing in `app/` directory

```
app/
  ├── layout.tsx              # Root layout with Providers wrapper
  ├── page.tsx                # Home page
  ├── providers.tsx           # Context providers (Auth, etc.)
  └── globals.css             # Global styles with Tailwind

contexts/
  └── AuthContext.tsx         # Auth state, token management, refresh flow

lib/
  └── api.ts                  # Centralized API client with typed endpoints
```

**Key Patterns**:

- Next.js 14 App Router with `app/` directory (not Pages Router)
- Client components marked with `'use client'` directive
- JWT tokens stored in `localStorage`: `accessToken` (15min) + `refreshToken` (7d)
- API client (`lib/api.ts`) exports typed API functions organized by feature:
  - `authApi`, `subscriptionApi`, `contentApi`, `flashcardApi`, `practiceApi`, `dashboardApi`, `formulaApi`, `searchApi`
- Auth context (`contexts/AuthContext.tsx`) provides `useAuth()` hook with login/logout/register/refreshToken
- Root layout wraps app with `Providers` component containing `AuthProvider`
- API URL configurable via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001/api`)

### Authentication & Authorization

**JWT Flow**:

1. `/api/auth/login` returns access token (15m) + refresh token (7d)
2. Access token stored client-side, sent in `Authorization: Bearer <token>`
3. `authMiddleware` verifies JWT, checks user exists and not locked
4. Decoded user info available in `req.user` (userId, email)
5. `/api/auth/refresh` exchanges refresh token for new access token

**Subscription Enforcement**:

- `requireTier('mid-level')` - User must have at least mid-level tier
- `requireFeature('mockExams')` - User must have specific feature enabled
- Tiers: `free` < `mid-level` < `high-end` < `corporate` (see `TIER_HIERARCHY`)
- Free tier has limits on flashcards (50), questions/domain (25), no mock exams

### Spaced Repetition (SM-2 Algorithm)

Implemented in `flashcard.service.ts` for `FlashcardReview`:

- User rates cards: `know_it`, `learning`, `dont_know`
- Algorithm calculates: `easeFactor`, `interval` (days), `nextReviewDate`
- Cards due for review returned by `/api/flashcards/due`
- Session tracking in `FlashcardSession` + `FlashcardSessionCard`

### Environment Setup

Required environment variables (see `packages/api/src/config/env.ts`):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Min 32 chars for access tokens
- `JWT_REFRESH_SECRET` - Min 32 chars for refresh tokens
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` - Payment integration
- Optional: `REDIS_URL`, SMTP settings for email

Copy `packages/api/.env.example` to `packages/api/.env` before starting.

## Common Patterns

### Adding a New API Endpoint

1. Define types in `packages/shared/src/types/` if needed
2. Create Zod validation schema in `packages/api/src/validators/`
3. Add route handler in `packages/api/src/routes/*.routes.ts`
   - Use `authMiddleware` for protected routes
   - Use `requireTier()` or `requireFeature()` for subscription checks
   - Validate request with Zod schema
4. Implement business logic in `packages/api/src/services/*.service.ts`
5. Write tests using Jest + supertest in `*.test.ts` files

### Working with Prisma

```bash
# After modifying schema.prisma
npm run db:generate      # Update TypeScript types
npm run db:migrate       # Create migration (production-safe)
# OR
npm run db:push          # Quick push (dev only, no migration history)
```

Prisma client is a singleton exported from `packages/api/src/config/database.ts`.

### Property-Based Testing

API uses `fast-check` for property-based testing (see existing test files for examples). Use for testing algorithms like SM-2, validation logic, and business rules.

## Key Implementation Details

### Subscription Tiers

- Features stored as JSON in `SubscriptionTier.features` (type: `TierFeatures`)
- Free tier always exists, created by seed script
- Grace period: Users get limited time after subscription expires
- Corporate tier includes team management features

### Mock Exams

- 230-minute time limit enforced
- Track via `PracticeSession` with `isMockExam: true`
- Only available to high-end and corporate tiers

### Formula Calculator

- Formulas stored with variables: `Formula` → `FormulaVariable[]`
- Example field shows sample calculation (JSON)
- Categories: `earned_value`, `scheduling`, `cost`, etc.

### Team Management (Corporate)

- Teams have license count limiting member slots
- Admins can invite via email (token-based invitations)
- Team alerts auto-generated for: behind schedule, inactive, struggling members
- Dashboard shows team-wide progress and individual metrics

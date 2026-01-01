# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PMP Study Application - A comprehensive study platform for the 2026 PMP (Project Management Professional) certification exam. Features include study guides, flashcards with spaced repetition, practice questions, analytics dashboard, formula calculator, and corporate team management.

## Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 15 with Prisma ORM
- **Cache**: Redis 7
- **Testing**: Jest (API), Vitest (Web), Playwright (E2E), fast-check (property-based)
- **Payments**: PayPal

## Commands

### Development

```bash
npm run dev              # Start both API (3001) and web (3000) servers
npm run dev:api          # Start only API server
npm run dev:web          # Start only web server
docker-compose up -d     # Start PostgreSQL and Redis
```

### Database

```bash
npm run db:migrate       # Run Prisma migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio GUI
```

### Testing

```bash
npm run test             # Run all tests
npm run test:api         # Run API tests (Jest)
npm run test:web         # Run web tests (Vitest)

# Single test file (API)
cd packages/api && npx jest src/services/auth.service.test.ts

# Single test file (Web)
cd packages/web && npx vitest run src/components/Navbar.test.tsx

# E2E tests
cd packages/web && npx playwright test
```

### Build & Lint

```bash
npm run build            # Build all packages
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
```

## Architecture

### Monorepo Structure (npm workspaces)

- `packages/api` (@pmp/api) - Express REST API server
- `packages/web` (@pmp/web) - Next.js frontend (App Router)
- `packages/shared` (@pmp/shared) - Shared TypeScript types

### API Layer (`packages/api/src/`)

- `routes/` - Express route handlers with `.test.ts` co-located
- `services/` - Business logic layer with extensive tests
- `middleware/` - Auth, CSRF, rate limiting, tier access, validation
- `config/env.ts` - Environment configuration with Zod validation
- `utils/` - Logger, metrics (Prometheus)
- `validators/` - Zod request schemas

### Web Layer (`packages/web/src/`)

- `app/` - Next.js App Router pages (auth, dashboard, flashcards, practice, study, team, pricing)
- `components/` - Shared React components (Navbar, SearchDialog, ErrorBoundary, ToastProvider)
- `contexts/` - React contexts (Auth, Theme)
- `hooks/` - Custom React hooks
- `lib/` - API client, utilities

### Database Schema (`packages/api/prisma/schema.prisma`)

Core models: User, UserSubscription, SubscriptionTier, Team, TeamMember, Domain, Task, Flashcard, FlashcardReview, Question, QuestionAttempt, StudyProgress, StudyActivity

### Subscription Tiers

Four tiers with feature gating: free, mid-level, high-end, corporate. Access controlled via `tier.middleware.ts`.

## Code Patterns

### TypeScript

- Strict mode enabled
- Use type imports: `import type { Foo } from './types'`
- Prefix unused parameters with underscore: `_unused`
- Shared types go in `packages/shared/src/types/`

### ESLint Rules

- Max line length: 100 chars (strings, URLs, templates, comments ignored)
- `@typescript-eslint/consistent-type-imports` enforced
- `no-console` warns (allow `warn`, `error`)
- React JSX scope import not required

### Testing Patterns

- API: Jest with supertest, co-located `.test.ts` files
- Web: Vitest with React Testing Library, JSDOM environment
- Coverage thresholds: API 80%, Web 65-75%

### API Conventions

- All routes prefixed with `/api`
- Rate limited: 100 requests per 15 minutes
- CSRF protection via middleware
- Request IDs in `x-request-id` header
- Prometheus metrics at `/metrics`

## Environment Setup

1. Copy `.env.example` to `.env` in root and `packages/api/`
2. Configure `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
3. Run `docker-compose up -d` for local PostgreSQL/Redis
4. Run `npm run db:migrate` then `npm run db:generate`

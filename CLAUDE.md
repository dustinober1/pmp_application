# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PMP Study Pro - A comprehensive PMP (Project Management Professional) exam preparation platform with adaptive learning, spaced repetition, and tier-based subscriptions.

**Monorepo Structure:**

- `packages/api/` - Express.js backend (TypeScript) with PostgreSQL + Prisma ORM
- `packages/web/` - Next.js 14 frontend (TypeScript, React 18, TailwindCSS)
- `packages/shared/` - Shared TypeScript types and utilities

## Development Commands

### Starting Development

```bash
npm run dev              # Start both API (port 3001) and Web (port 3000) concurrently
npm run dev:api          # API only: runs on port 3001
npm run dev:web          # Web only: runs on port 3000
```

### Building

```bash
npm run build            # Build all packages
npm run build:api        # Build API only (compiles TypeScript to dist/)
npm run build:web        # Build Web only (Next.js production build)
npm run build:shared     # Build shared package
```

### Testing

```bash
npm run test             # Run all tests across workspaces
npm run test:api         # Run API tests (Jest + fast-check for property-based)
npm run test:web         # Run Web unit tests (Vitest)
npm run test:coverage    # Run API tests with coverage report
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:headed  # Run E2E tests in headed mode
npm run test:e2e:debug   # Debug E2E tests
npm run test:e2e:ui      # Run E2E tests with UI

# Single test file (API):
cd packages/api && npm test -- auth.service.test

# Single test file (Web):
cd packages/web && vitest run components/Navbar.test.tsx
```

### Database Operations

```bash
npm run db:generate      # Generate Prisma client from schema
npm run db:migrate       # Run pending migrations
npm run db:push          # Push schema changes directly to database (dev only)
npm run db:seed          # Seed database with initial data
npm run db:seed:ebook    # Seed ebook content (domains, tasks, study guides)
npm run db:studio        # Open Prisma Studio (database GUI)
```

### Linting & Formatting

```bash
npm run lint             # Run ESLint on all packages
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without modifying
```

### Docker

```bash
docker-compose up -d             # Start all containers
docker-compose down              # Stop all containers
docker-compose build --no-cache  # Force rebuild without cache
docker-compose build web && docker-compose up -d  # Rebuild just web container
```

## Architecture Overview

### Backend Architecture (packages/api/)

**Route-Service Pattern:**

```
routes/          - Express route definitions, validation (Zod), middleware
  └── *.routes.ts
services/        - Business logic, orchestration, transaction handling
  └── *.service.ts
middleware/      - Express middleware (auth, errors, CSRF, logging)
utils/           - Utilities (logger, metrics, email)
config/          - Configuration (env, OpenTelemetry, Swagger)
prisma/          - Database schema, migrations, seeds
```

**Key Design Patterns:**

- **Service layer handles all business logic** - routes are thin (validation → service → response)
- **Prisma used directly in services** - no repository abstraction layer
- **Transactions via Prisma `$transaction`** - for multi-table operations
- **Zod schemas for validation** - defined in routes, used before service calls
- **Express-async-errors** - async route handlers automatically catch errors
- **OpenTelemetry instrumentation** - distributed tracing + metrics (OTLP exporter)
- **Winston structured logging** - JSON logs

**Authentication & Authorization:**

- JWT in httpOnly cookies + refresh tokens in database
- `requireAuth` middleware - validates JWT, attaches `req.user`
- `requireFeature` middleware - tier-based access control
- Subscription checks in service layer

**Stripe Integration:**

- Checkout via Stripe Checkout Sessions (redirect-based)
- Webhooks at `/webhooks/stripe` - raw body parser required before JSON middleware
- Customer & subscription IDs stored in `UserSubscription` table

### Frontend Architecture (packages/web/)

**Next.js App Router Structure:**

```
src/app/
  ├── auth/              # Authentication pages (login, register, password reset)
  ├── dashboard/         # User dashboard with progress analytics
  ├── study/             # Study guides by PMI domain
  ├── flashcards/        # Spaced repetition flashcard system
  │   ├── session/[sessionId]/  # Active study session with swipe gestures
  │   └── create/        # Custom flashcard creation
  ├── practice/          # Practice questions with mock exams
  │   ├── session/[sessionId]/  # Question session
  │   └── mock/session/[sessionId]/  # 180-question mock exam
  ├── formulas/          # EVM calculator with step-by-step solutions
  ├── pricing/           # Subscription tier comparison
  └── page.tsx           # Public landing page

src/components/
  ├── Navbar.tsx         # Main navigation with theme/lang toggles
  ├── SearchDialog.tsx   # Global search (Cmd+K)
  ├── ToastProvider.tsx  # Toast notifications
  ├── ThemeProvider.tsx  # Dark/light theme management
  ├── I18nProvider.tsx   # English/Spanish i18n (i18next)
  ├── Footer.tsx         # Footer with Product, Company, Legal sections
  └── SanitizedMarkdown.tsx  # XSS-safe markdown rendering

src/contexts/
  └── AuthContext.tsx    # Authentication state, login/logout

src/lib/
  ├── api.ts             # API client with error handling, toast notifications
  └── sync.ts            # Service worker for offline support
```

**Key Frontend Patterns:**

- **App Router** - file-based routing, server components by default
- **Client-side API calls** - `apiRequest()` wrapper around fetch
- **Material You Design** - MD3 color tokens (`--md-primary`, `--md-surface`) via Tailwind
- **Protected routes** - `useRequireAuth()` hook redirects to login if unauthenticated
- **React hooks** - Use `useCallback` for event handlers to prevent re-renders

### Shared Package (packages/shared/)

**Purpose:** Type safety between frontend and backend

- Shared TypeScript interfaces (User, Domain, Task, Flashcard, etc.)
- Common validation schemas (Zod)
- Build step required: `npm run build:shared` generates dist/

## Database Schema

**Key Models:**

- **User** - authentication, subscription, privacy consent
- **UserSubscription** - tier, status, Stripe customer/subscription IDs
- **Domain** - PMI domains (People, Process, Business Environment)
- **Task** - individual tasks within domains
- **StudyProgress** - user progress tracking per task
- **Flashcard / FlashcardReview** - spaced repetition (SM-2 algorithm)
- **PracticeQuestion / QuestionAttempt** - practice sessions

**Subscription Tiers:**

- `free` - limited study guides, 50 flashcards, 25 questions/domain
- `mid-level` - full study guides, unlimited flashcards, 100 questions/domain
- `high-end` - everything + mock exams + formula calculator + custom flashcards
- `corporate` - everything + team management + advanced analytics

## Critical Implementation Notes

### Adding a New Feature Endpoint

1. **Define Zod schema in route** (`routes/*.routes.ts`):

```typescript
const createFlashcardSchema = z.object({
  domainId: z.string().uuid(),
  taskId: z.string().uuid(),
  front: z.string().min(1).max(1000),
  back: z.string().min(1).max(2000),
});

router.post('/', requireAuth, requireFeature('customFlashcards'), async (req, res, next) => {
  const data = createFlashcardSchema.parse(req.body);
  const result = await FlashcardService.createCustomFlashcard(req.user!.id, data);
  res.json({ success: true, data: result });
});
```

2. **Implement business logic** (`services/*.service.ts`):

```typescript
import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/AppError';

async function createCustomFlashcard(userId: string, data: CreateFlashcardDTO) {
  // Validate tier
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    include: { tier: true },
  });

  if (!subscription?.tier.features.customFlashcards) {
    throw AppError.forbidden('This feature requires a higher subscription tier');
  }

  return await prisma.$transaction(async tx => {
    return tx.flashcard.create({ data: { ...data, userId } });
  });
}
```

### Tier-Based Access Control

**Backend:**

```typescript
import { requireFeature } from '@/middleware/requireFeature';

router.post('/', requireAuth, requireFeature('customFlashcards'), async (req, res, next) => {
  // ...
});
```

**Frontend:**

```typescript
const canAccessFeature = user?.tier === 'high-end' || user?.tier === 'corporate';
{!canAccessFeature && (
  <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
    <p>This feature requires a Pro subscription.</p>
    <Link href="/pricing">Upgrade Now</Link>
  </div>
)}
```

### React State Best Practices

- **Use arrays instead of Set for React state** - Sets don't serialize well and can cause render issues
- **Use `useCallback` for event handlers** - Prevents unnecessary re-renders in child components
- **Add null safety with optional chaining** - `selectedDomainData.tasks?.length ?? 0`
- **Use empty array fallback for maps** - `(selectedDomainData.tasks || []).map()`

### Error Handling

**Backend (utils/AppError.ts):**

```typescript
throw AppError.badRequest('Invalid input');
throw AppError.unauthorized('Invalid credentials');
throw AppError.forbidden('Feature not available');
throw AppError.notFound('Resource not found');
```

Error middleware returns: `{ error: { code: 'VALIDATION_ERROR', message: '...', details: [...] } }`

**Frontend:**

```typescript
// apiRequest automatically shows toasts for errors
try {
  const response = await apiRequest('/endpoint', { method: 'POST', body: {...} });
} catch (error) {
  // Error toast shown automatically
}
```

### Property-Based Testing (fast-check)

Used for critical business logic (SM-2 algorithm, EVM calculations):

```typescript
import * as fc from 'fast-check';

test('SM-2 algorithm properties', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (ease, interval, reps) => {
      const result = calculateNextReview(ease, interval, reps);
      return result.nextInterval >= 0 && result.easeFactor >= 1.3;
    })
  );
});
```

## Environment Variables

**API requires (`packages/api/.env`):**

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API secret
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `CORS_ORIGIN` - Comma-separated list of allowed origins

## Testing Strategy

- **API Unit Tests:** Jest + fast-check, mocked Prisma, supertest for routes
- **Web Unit Tests:** Vitest + React Testing Library, mock API responses
- **E2E Tests:** Playwright for critical user flows

## SPARC Workflow (Optional)

The repo includes SPARC methodology tooling via `npx claude-flow`:

```bash
npx claude-flow sparc run <mode> "<task>"   # Execute specific SPARC mode
npx claude-flow sparc tdd "<feature>"       # Run TDD workflow
```

Standard development follows the route-service pattern described above.

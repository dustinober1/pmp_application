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
docker-compose up -d     # Start PostgreSQL + Redis in background
docker-compose down      # Stop containers
```

## Architecture Overview

### Backend Architecture (packages/api/)

**Route-Service-Repository Pattern:**

```
routes/          - Express route definitions, validation (Zod), middleware
  ├── *.routes.ts
services/        - Business logic, orchestration, transaction handling
  ├── *.service.ts
repositories/    - Database queries via Prisma (not abstracted)
  └── (inline in services)
middleware/      - Express middleware (auth, errors, CSRF, logging)
utils/           - Utilities (logger, metrics, email, SMS)
config/          - Configuration (env, OpenTelemetry, Swagger)
prisma/          - Database schema, migrations, seeds
```

**Key Design Patterns:**

- **Service layer handles all business logic** - routes are thin (validation → service → response)
- **Prisma used directly in services** - no repository abstraction layer
- **Transactions via Prisma`$transaction`** - for multi-table operations
- **Zod schemas for validation** - defined in routes, used before service calls
- **Express-async-errors** - async route handlers automatically catch errors
- **OpenTelemetry instrumentation** - distributed tracing + metrics (OTLP exporter)
- **Winston structured logging** - JSON logs with CloudWatch transport

**Authentication & Authorization:**

- JWT in httpOnly cookies + refresh tokens in database
- `requireAuth` middleware - validates JWT, attaches `req.user`
- `requireFeature` middleware - tier-based access control (free, mid-level, high-end, corporate)
- Subscription checks in service layer - `requireFeature('customFlashcards')`

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
  │   └── [taskId]/      # Individual study task pages
  ├── flashcards/        # Spaced repetition flashcard system
  │   ├── session/[sessionId]/  # Active study session
  │   └── create/        # Custom flashcard creation
  ├── practice/          # Practice questions with mock exams
  │   ├── session/[sessionId]/  # Question session
  │   └── mock/session/[sessionId]/  # 180-question mock exam
  ├── formulas/          # EVM calculator with step-by-step solutions
  ├── pricing/           # Subscription tier comparison
  ├── checkout/          # Stripe checkout redirect
  └── page.tsx           # Public landing page

src/components/
  ├── Navbar.tsx         # Main navigation with theme/lang toggles
  ├── SearchDialog.tsx   # Global search (Cmd+K)
  ├── ToastProvider.tsx  # Toast notifications
  ├── ThemeProvider.tsx  # Dark/light theme management
  └── I18nProvider.tsx   # English/Spanish i18n (i18next)

src/contexts/
  └── AuthContext.tsx    # Authentication state, login/logout

src/hooks/
  ├── useRequireAuth.ts  # Protected route hook
  └── useFocusTrap.ts    # Accessibility focus management

src/lib/
  ├── api.ts             # API client with error handling, toast notifications
  └── sync.ts            # Service worker for offline support
```

**Key Frontend Patterns:**

- **App Router** - file-based routing, server components by default
- **Client-side API calls** - `apiRequest()` wrapper around fetch, handles auth cookies automatically
- **Material You Design** - MD3 color tokens (`--md-primary`, `--md-surface`, etc.) via Tailwind
- **Protected routes** - `useRequireAuth()` hook redirects to login if unauthenticated
- **Progressive Web App** - service worker, offline support via next-pwa
- **Vitest for unit tests** - Testing Library components
- **Playwright for E2E** - cross-browser testing (Chromium, Firefox, WebKit)

### Shared Package (packages/shared/)

**Purpose:** Type safety between frontend and backend

- Shared TypeScript interfaces (User, Domain, Task, Flashcard, etc.)
- Common validation schemas (Zod)
- Shared enums (Tier, SubscriptionStatus, etc.)
- Build step required: `npm run build:shared` generates dist/

## Database Schema

**Key Models:**

- **User** - authentication, subscription, privacy consent
- **UserSubscription** - tier, status, Stripe customer/subscription IDs
- **Domain** - PMI domains (People, Process, Business Environment)
- **Task** - individual tasks within domains
- **StudyProgress** - user progress tracking per task
- **Flashcard / FlashcardReview** - spaced repetition (SM-2 algorithm)
- **PracticeQuestion / QuestionAttempt** - practice sessions with answer tracking
- **SubscriptionTier** - tier definitions with feature limits (JSON)
- **Team / TeamMember** - corporate team management

**Subscription Tiers:**

- `free` - limited study guides, 50 flashcards, 25 questions/domain
- `mid-level` - full study guides, unlimited flashcards, 100 questions/domain
- `high-end` - everything + mock exams + formula calculator + custom flashcards
- `corporate` - everything + team management + advanced analytics

## Critical Implementation Notes

### Adding a New Feature Endpoint

1. **Define Zod schema in route** (validation):

```typescript
const createFlashcardSchema = z.object({
  domainId: z.string().uuid(),
  taskId: z.string().uuid(),
  front: z.string().min(1).max(1000),
  back: z.string().min(1).max(2000),
});
```

2. **Create route handler** (`routes/*.routes.ts`):

```typescript
router.post('/', requireAuth, requireFeature('customFlashcards'), async (req, res, next) => {
  const data = createFlashcardSchema.parse(req.body);
  const result = await FlashcardService.createCustomFlashcard(req.user!.id, data);
  res.json({ success: true, data: result });
});
```

3. **Implement business logic** (`services/*.service.ts`):

```typescript
async function createCustomFlashcard(userId: string, data: CreateFlashcardDTO) {
  // Validate tier
  const subscription = await requireFeature(userId, 'customFlashcards');

  // Use transaction for multi-table operations
  return await prisma.$transaction(async (tx) => {
    const flashcard = await tx.flashcard.create({ ... });
    return flashcard;
  });
}
```

4. **Frontend API call** (`src/lib/api.ts` pattern):

```typescript
const response = await apiRequest<{ flashcard: Flashcard }>('/flashcards', {
  method: 'POST',
  body: { domainId, taskId, front, back },
});
```

### Tier-Based Access Control

**Backend (`middleware/requireFeature`):**

```typescript
export const requireFeature = (feature: TierFeature) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const subscription = await getUserSubscription(req.user!.id);
    if (!subscription.features[feature]) {
      throw AppError.forbidden('This feature requires a higher subscription tier');
    }
    next();
  };
};
```

**Frontend (`src/contexts/AuthContext.tsx`):**

```typescript
const canAccessFeature = user?.tier === 'high-end' || user?.tier === 'corporate';
{!canAccessFeature && (
  <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
    <p>This feature requires a Pro subscription.</p>
    <Link href="/pricing">Upgrade Now</Link>
  </div>
)}
```

### Property-Based Testing (fast-check)

Used for critical business logic (e.g., SM-2 algorithm, EVM calculations):

```typescript
test('SM-2 algorithm properties', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (easeFactor, interval, repetitions) => {
      const result = calculateNextReview(easeFactor, interval, repetitions);
      return result.nextInterval >= 0 && result.easeFactor >= 1.3;
    })
  );
});
```

## Common Patterns

### Error Handling

**Backend:**

```typescript
// Custom AppError class (utils/AppError.ts)
throw AppError.badRequest('Invalid input');
throw AppError.unauthorized('Invalid credentials');
throw AppError.forbidden('Feature not available on your tier');
throw AppError.notFound('Resource not found');

// Error middleware catches all, returns standardized JSON
{
  error: { code: 'VALIDATION_ERROR', message: '...', details: [...] }
}
```

**Frontend:**

```typescript
// apiRequest automatically shows toasts for errors
try {
  const response = await apiRequest('/endpoint', { method: 'POST', body: {...} });
  // Success - toast shown automatically if enabled
} catch (error) {
  // Error toast shown automatically via ToastProvider
}
```

### Transaction Pattern

```typescript
// Always use $transaction for multi-table writes
return await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: userId } });
  const subscription = await tx.subscription.create({ ... });
  return { user, subscription };
});
```

### Environment Variables

**API requires (`packages/api/.env`):**

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API secret
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `CORS_ORIGIN` - Comma-separated list of allowed origins
- `REDIS_URL` - Redis connection (optional, for caching)

## Testing Strategy

**Unit Tests (API):** Jest + fast-check for property-based testing

- Services tested in isolation with mocked Prisma client
- Route tests use supertest for integration testing
- Property-based tests for algorithms (SM-2, EVM calculations)

**Unit Tests (Web):** Vitest + Testing Library

- Component tests with React Testing Library
- Mock API responses via vi.mock('@/lib/api')
- No shallow rendering - full DOM queries

**E2E Tests:** Playwright

- Critical user flows (registration → dashboard → study → practice)
- Visual regression tests for UI consistency
- Cross-browser testing (Chromium, Firefox, WebKit)

## Known Issues & TODO

See `/docs/FRONTEND_FIX_REPORT.md` for comprehensive testing results and 43 detailed task cards for frontend improvements.

**Critical Issues:**

- Landing page missing Navbar component
- Feature cards not clickable
- Mock exam timer continues in review mode
- Flag button missing in practice sessions
- Some null safety bugs in dashboard

**Payment Integration:**

- Migrated from PayPal to Stripe (checkout and webhooks working)
- Old PayPal code still exists in comments but Stripe is active

## SPARC Workflow (Optional)

The repo includes SPARC methodology tooling via `npx claude-flow`. This is **optional** - standard development follows the route-service-repo pattern described above.

**If using SPARC:**

- `npx claude-flow sparc run <mode> "<task>"` - Execute specific SPARC mode
- `npx claude-flow sparc tdd "<feature>"` - Run TDD workflow

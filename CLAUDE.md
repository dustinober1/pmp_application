# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PMP Study Pro - A comprehensive PMP exam preparation platform with adaptive learning and tier-based subscriptions.

**Monorepo Structure:**
- `packages/api/` - Express.js backend (TypeScript) with PostgreSQL + Prisma ORM
- `packages/web/` - Next.js 14 frontend (TypeScript, React 18, TailwindCSS)
- `packages/shared/` - Shared TypeScript types and utilities

## Development Commands

### Startup
- `npm run dev` - Start both API (3001) and Web (3000) concurrently
- `npm run dev:api` - Start API only
- `npm run dev:web` - Start Web only

### Building
- `npm run build` - Build all packages
- `npm run build:api` - Build API only
- `npm run build:web` - Build Web only
- `npm run build:shared` - Build shared package

### Testing
- `npm run test` - Run all tests
- `npm run test:api` - Run API tests (Jest)
- `npm run test:web` - Run Web unit tests (Vitest)
- `npm run test:e2e` - Run E2E tests (Playwright)
- **Single API test**: `cd packages/api && npm test -- auth.service.test`
- **Single Web test**: `cd packages/web && vitest run components/Navbar.test.tsx`

### Database (Prisma)
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio GUI

### Linting & Formatting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting errors
- `npm run format` - Format with Prettier

## Architecture & Patterns

### Backend (packages/api)
- **Pattern**: Route-Service pattern. Routes handle validation/response; Services handle business logic/DB.
- **Database**: Prisma ORM used directly in services. Use `prisma.$transaction` for multi-table ops.
- **Validation**: Zod schemas defined in routes, middleware validates before controller.
- **Error Handling**: `AppError` class for standard errors. `express-async-errors` handles async exceptions.
- **Logging**: Winston structured logger with context (request ID, trace ID).
- **Auth**: JWT in httpOnly cookies + Refresh tokens in DB. `requireAuth` & `requireFeature` middleware.

### Frontend (packages/web)
- **Framework**: Next.js 14 App Router with Server Components by default.
- **State**: React hooks (`useCallback` important). avoid `Set` in state (use arrays).
- **Styling**: TailwindCSS with Material You tokens (`--md-primary`).
- **Data Fetching**: Client-side `apiRequest` wrapper for fetch with auto-toast handling.
- **Protected Routes**: `useRequireAuth` hook.

### Shared (packages/shared)
- Contains TypeScript interfaces/types and Zod schemas shared between FE and BE.
- Must run `npm run build:shared` after changes.

## Critical Implementation Notes
- **Flashcard Formatting**: Use `formatFlashcardText()` for content. `**text**` for bold.
- **Tier Access**: Check `user.subscription.tier` features. Handle restricted access gracefully.
- **React State**: Use `number[]` instead of `Set<number>` for ID lists to avoid serialization issues.
- **Null Safety**: Always use optional chaining for nested data (e.g. `data?.tasks?.length ?? 0`).
- **Security**: Never expose secrets. Use environment variables. Validate all inputs with Zod.

## Recent Lessons
1. **React State**: Avoid using `Set` in React state as it doesn't serialize well during SSR/hydration. Use arrays (`number[]`) instead.
2. **Null Safety**: Accessing `length` on potentially undefined arrays causes runtime errors. Always default: `(array || []).map(...)`.
3. **Serialization**: Complex objects in server components passed to client components must be serializable (no functions, Sets, Maps).

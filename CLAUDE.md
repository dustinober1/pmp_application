# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PMP Study Pro is a free, client-side PMP exam study application built with SvelteKit. It requires no backend, authentication, or payment—all study progress is stored locally in the user's browser via localStorage.

**Key Characteristics:**
- Static site export for GitHub Pages deployment
- Local-only data storage (no server-side user data)
- 2026 PMP Exam Content Outline (ECO) alignment
- Material Design 3 color system with glassmorphism UI
- Spaced repetition learning system (Leitner box) for flashcards

## Development Commands

```bash
# Initial setup
npm install

# Build shared package first (required before dev)
npm run build:shared

# Start development server (localhost:3000)
npm run dev

# Production build (static export)
npm run build

# Type checking (workspace-specific)
npm run check -w @pmp/web-svelte

# Linting
npm run lint
npm run lint:fix

# Testing (vitest)
npm run test:web-svelte              # Run tests once
npm run test -w @pmp/web-svelte      # Watch mode
npm run test:coverage -w @pmp/web-svelte  # Coverage report
npm run test:ui -w @pmp/web-svelte   # Vitest UI

# Workspace-specific commands
npm run dev -w @pmp/web-svelte       # Start SvelteKit dev server
npm run build -w @pmp/shared         # Build shared types package
npm run check -w @pmp/web-svelte     # Type check SvelteKit app
```

**Important:** Always run `npm run build:shared` after making changes to `packages/shared/src/`. The web-svelte package depends on these types.

## Workspace Structure

This is an npm workspace monorepo:

```
pmp_application/
├── packages/
│   ├── shared/           # TypeScript types & shared utilities
│   │   └── src/types/    # All type definitions (auth, content, flashcard, etc.)
│   └── web-svelte/       # Main SvelteKit application
│       └── src/
│           ├── routes/   # File-based routing (SvelteKit)
│           └── lib/
│               ├── components/  # Reusable UI components
│               ├── stores/      # Svelte stores (state management)
│               ├── utils/       # Utilities, data loading helpers
│               ├── constants/   # Storage keys, constants
│               └── actions/     # Svelte actions (directives)
```

## Architecture

### Static-First Design

The app has **no backend runtime**. All functionality works client-side:
- Content is loaded as static JSON from `static/data/` at build time
- Progress is stored in localStorage with automatic persistence
- Export/import feature (`dataPortability.ts`) allows users to backup/transfer progress

### State Management (Svelte Stores)

Located in `packages/web-svelte/src/lib/stores/`:

| Store | Purpose |
|-------|---------|
| `dashboard.ts` | Domain progress, recent activity, overall progress (derived) |
| `toast.ts` | Notification system |
| `auth.ts` | Authentication placeholder (for future use) |
| `i18n.ts` | Internationalization locale |

**Pattern:** Stores use custom functions with localStorage persistence. Each store:
1. Loads initial state from localStorage using `getStorageItem()`
2. Updates both in-memory state and localStorage via `setStorageItem()`
3. Provides domain-specific methods (e.g., `updateDomain()`, `addActivity()`)

**Important:** Some stores (like `dashboard.ts`) define their own `STORAGE_KEYS` constants rather than importing from the central constants file. This is legacy code—when modifying stores, prefer importing from `lib/constants/storageKeys.ts`.

### Data Layer

Static JSON content is loaded via utilities in `lib/utils/`:

**Data Loaders:**
- `flashcardsData.ts` - Flashcard loading and domain filtering
- `practiceData.ts` - Practice question loading (from `testbank.json`)
- `studyData.ts` - Study guide loading
- `formulasData.ts` - Formula reference data

**Progress Storage:**
- `flashcardStorage.ts` - Leitner box system for spaced repetition
- `cardProgressStorage.ts` - Per-card progress tracking (box level, last reviewed)
- `practiceSessionStorage.ts` - Practice quiz session management
- `mockExamStorage.ts` - Mock exam session tracking
- `studySession.ts` - Study session time tracking and streaks

**Utilities:**
- `dataPortability.ts` - Export/import all user progress as JSON
- `api.ts` - API wrapper utilities (for future backend integration)
- `load.ts` - SvelteKit load function helpers (error handling, pagination)

**Static Data Files** (in `packages/web-svelte/static/data/`):
- `flashcards.json` - 1,800+ flashcards organized by domain/task
- `testbank.json` - 1,200+ practice questions with explanations
- `formulas.json` - PMP formulas and calculations
- `faq.md` - FAQ content

### Storage Keys (CRITICAL)

All localStorage keys are centralized in `lib/constants/storageKeys.ts`. **Never** add hardcoded keys—always add to this constant object to avoid conflicts.

### Routing

SvelteKit file-based routing:
- `routes/+page.svelte` → Home/Landing
- `routes/dashboard/+page.svelte` → Dashboard with progress overview
- `routes/study/+page.svelte` → Study guides list
- `routes/study/[taskId]/+page.svelte` → Specific study guide content
- `routes/flashcards/+page.svelte` → Flashcard study with spaced repetition
- `routes/practice/+page.svelte` → Practice quizzes
- `routes/practice/[sessionId]/+page.svelte` → Active practice session
- `routes/formulas/+page.svelte` → Formula reference and calculator
- `routes/faq/+page.svelte` → FAQ page
- `routes/terms/+page.svelte` → Terms of service

### Type Safety

Shared types are defined in `packages/shared/src/types/` and imported via `@pmp/shared`. The workspace alias is configured in both `svelte.config.js` and `vite.config.ts`:

```typescript
import { DomainProgressStats } from '@pmp/shared';
```

## Deployment Configuration

**Base Path:** `/pmp_application` (configured for GitHub Pages project site)
- Defined in `svelte.config.js` (`paths.base`)
- Defined in `vite.config.ts` (`base`)
- Must update both if changing deployment URL

**Adapter:** `@sveltejs/adapter-static` with output to `build/` directory

## 2026 PMP Exam Content

The app is aligned to the July 2026 ECO update:

| Domain | Weighting |
|--------|-----------|
| People | 33% |
| Process | 41% |
| Business Environment | 26% |

Exam format: 185 questions over 240 minutes with a 60/40 Agile/predictive split.

## Code Conventions

- **TypeScript strict mode** enabled
- **Svelte 5** runes syntax (`$state`, `$derived`) preferred over legacy stores
- **Test files** co-located with source (e.g., `Component.test.ts`, `util.test.ts`)
- **Storage keys** always imported from `constants/storageKeys.ts`
- **Shared types** always imported from `@pmp/shared`
- **Vitest** for unit testing with `@testing-library/svelte`

### Testing Pattern

Tests are co-located with source files and use Vitest:
```typescript
import { describe, it, expect } from 'vitest';
// Test utilities from @testing-library/svelte for component testing
```

Run tests in watch mode during development: `npm run test -w @pmp/web-svelte`

## Spaced Repetition System

The flashcard system uses a **Leitner box** algorithm for spaced repetition:

**Box Levels & Review Intervals:**
- Box 0: New cards (review every session)
- Box 1: 1 day
- Box 2: 3 days
- Box 3: 7 days
- Box 4: 14 days
- Box 5: 30 days (mastered)

**Key Files:**
- `lib/utils/flashcardStorage.ts` - Leitner box logic
- `lib/utils/cardProgressStorage.ts` - Per-card progress (box level, next review date)
- `lib/constants/storageKeys.ts` - `FLASHCARDS_CARD_PROGRESS` key

When reviewing cards:
- Correct answer → Move up one box (max: Box 5)
- Incorrect answer → Reset to Box 0
- Track "last reviewed" timestamp to enforce intervals

## Content Updates

Study content (flashcards, questions, guides) is sourced from external JSON data files. When updating content:
1. Place new/updated JSON files in `packages/web-svelte/static/data/`
2. Update corresponding data loader in `lib/utils/` if structure changed
3. Run `npm run build` to verify static export includes new content
4. Test in development mode first: `npm run dev`

**Common data files:**
- Adding flashcards? Update `flashcards.json` and test with `flashcardsData.ts`
- Adding questions? Update `testbank.json` and test with `practiceData.ts`
- Adding formulas? Update `formulas.json` and test with `formulasData.ts`

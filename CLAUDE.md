# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PMP Study Pro is a free, client-side PMP exam study application built with SvelteKit. It requires no backend, authentication, or payment—all study progress is stored locally in the user's browser via localStorage.

**Key Characteristics:**
- Static site export for GitHub Pages deployment
- Local-only data storage (no server-side user data)
- 2026 PMP Exam Content Outline (ECO) alignment
- Material Design 3 color system with glassmorphism UI

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

# Type checking
npm run check -w @pmp/web-svelte

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test:web-svelte
npm run test:coverage -w @pmp/web-svelte
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

**Pattern:** Stores use custom functions with localStorage persistence. Example:
```typescript
function createDomainProgressStore() {
  const { subscribe, update, set } = writable(initialState);
  return {
    subscribe,
    updateDomain(id, updates) { update(...); setStorageItem(...); }
  };
}
```

### Data Layer

Static JSON content is loaded via `lib/load.ts` and accessed through utilities in `lib/utils/`:
- `flashcardsData.ts` - Flashcard loading and filtering
- `practiceData.ts` - Practice question loading
- `mockExamStorage.ts` - Mock exam session management
- `studySession.ts` - Study session tracking
- `dataPortability.ts` - Export/import all user progress

### Storage Keys (CRITICAL)

All localStorage keys are centralized in `lib/constants/storageKeys.ts`. **Never** add hardcoded keys—always add to this constant object to avoid conflicts.

### Routing

SvelteKit file-based routing:
- `routes/+page.svelte` → Home
- `routes/dashboard/+page.svelte` → Dashboard
- `routes/study/+page.svelte` → Study guides
- `routes/study/[taskId]/+page.svelte` → Specific study guide
- `routes/flashcards/+page.svelte` → Flashcard study
- `routes/practice/+page.svelte` → Practice quizzes
- `routes/faq/+page.svelte` → FAQ page

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
- **Test files** co-located with source (e.g., `Component.test.ts`)
- **Storage keys** always imported from `constants/storageKeys.ts`
- **Shared types** always imported from `@pmp/shared`

## Content Updates

Study content (flashcards, questions, guides) is sourced from external JSON data files not tracked in this repository. When updating content:
1. Place new JSON files in `packages/web-svelte/static/data/`
2. Update corresponding data loader in `lib/utils/`
3. Run `npm run build` to verify static export includes new content

# Ask Mode Rules (Non-Obvious Only)

This file provides guidance to agents when explaining or analyzing code in this repository.

## Documentation Context

- **Static-first architecture**: The app has no backend. All data is pre-built JSON and localStorage. Don't suggest server-side solutions.

- **2026 PMP ECO alignment**: Content follows the July 2026 exam format: People (33%), Process (41%), Business Environment (26%). Task IDs use ECO notation.

- **Spaced repetition**: Flashcards use Leitner box algorithm with 6 boxes (0-5) and review intervals from 1 day to 30 days.

- **Workspace structure**: `@pmp/shared` package contains all types. Web-svelte imports types via workspace alias, not relative paths.

## Key File Locations

- Types: `packages/shared/src/types/`
- Components: `packages/web-svelte/src/lib/components/`
- Stores: `packages/web-svelte/src/lib/stores/`
- Utilities: `packages/web-svelte/src/lib/utils/`
- Static data: `packages/web-svelte/static/data/`
- Storage keys: `packages/web-svelte/src/lib/constants/storageKeys.ts`

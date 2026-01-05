# Architect Mode Rules (Non-Obvious Only)

This file provides guidance to agents when designing or architecting changes in this repository.

## Architectural Constraints

- **Static-only deployment**: App uses `adapter-static` for GitHub Pages. No server-side code possible. All data must be pre-built or client-side only.

- **LocalStorage as database**: User progress is stored in browser localStorage. No user accounts, no cloud sync, no server persistence. Export/import feature allows data portability.

- **Workspace dependency**: `@pmp/shared` must be built before `@pmp/web-svelte`. Type changes require `npm run build:shared`.

- **GitHub Pages base path**: Base path `/pmp_application` is hardcoded in both `svelte.config.js` and `vite.config.ts`. Changing deployment URL requires updating both.

## Design Guidelines

- **Leitner box system**: Flashcards use spaced repetition with 6 boxes (0-5). Box 5 = mastered (30-day review). New cards start at Box 0.

- **Domain/task structure**: Domains: People, Process, Business Environment. Tasks use ECO notation (e.g., I-3, II-1, III-7). All identifiers normalized to lowercase with dashes.

- **Component pattern**: Svelte 5 runes (`$state`, `$derived`) preferred. Components use `$app/paths` for base path compatibility. Tests co-located with source files.

- **Storage pattern**: All localStorage keys centralized in `lib/constants/storageKeys.ts`. Stores implement get/set pattern with localStorage sync.

## Extension Points

- Add flashcards to `static/data/flashcards.json`
- Add questions to `static/data/testbank.json`
- Add formulas to `static/data/formulas.json`
- New routes follow SvelteKit file-based routing in `src/routes/`

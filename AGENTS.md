# Repository Guidelines

## Project Structure & Module Organization

- `packages/web-svelte/`: SvelteKit frontend. Core UI lives in `src/routes/` and shared UI/utilities in `src/lib/`.
- `packages/shared/`: Shared TypeScript types/utilities compiled to `dist/`.
- `packages/web-svelte/static/`: Static assets served by the app, including study data in `static/data/flashcards.json` and `static/data/testbank.json`.
- `data/`: Source JSON content (keep aligned with `packages/web-svelte/static/data/` when updating content).

## Build, Test, and Development Commands

- `npm install`: Install workspace dependencies (Node 18+).
- `npm run dev` or `npm run dev:web-svelte`: Start the SvelteKit dev server.
- `npm run build`: Build shared package and web app.
- `npm run lint` / `npm run format`: Run ESLint and Prettier.
- `npm run test`: Run workspace tests where present.
- `npm run test:web-svelte` or `npm run test:coverage -w @pmp/web-svelte`: Run Vitest (with coverage).
- `npm run preview -w @pmp/web-svelte`: Preview the production build locally.

## Coding Style & Naming Conventions

- TypeScript strict mode is enabled (see `tsconfig.json`); avoid `any` unless justified.
- Use Prettier formatting (2-space indentation by default) and ESLint for lint rules.
- Svelte components use PascalCase filenames, e.g., `Navbar.svelte`.
- Tests use `*.test.ts` naming and live alongside code (e.g., `src/lib/components/Navbar.test.ts`).

## Testing Guidelines

- Frameworks: Vitest + @testing-library/svelte.
- Place unit tests near the feature they cover; prefer realistic DOM rendering with `render(...)`.
- Coverage target: aim for 80%+ for new or changed logic.

## Commit & Pull Request Guidelines

- Commit messages are short and descriptive (recent history uses sentence-case, e.g., “Fix Svelte build issues”).
- Use feature branches such as `feature/flashcards` or `fix/nav-links`.
- PRs should include: problem statement, summary of changes, and verification steps.
- Merging to `main` requires a PR, at least 1 approval, and passing CI checks (lint, test, build, CodeQL).

## Deployment & Configuration Notes

- The app is configured for a GitHub Pages base path: `"/pmp_application"` in `packages/web-svelte/svelte.config.js` and `packages/web-svelte/vite.config.ts`. Update both if the base path changes.

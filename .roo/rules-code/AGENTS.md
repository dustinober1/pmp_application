# Code Mode Rules (Non-Obvious Only)

This file provides guidance to agents when working with code in this repository.

## Critical Coding Rules

- **Storage keys**: All localStorage keys MUST be imported from `lib/constants/storageKeys.ts`. Never add hardcoded strings—even for quick tests.

- **@pmp/shared imports**: Always import shared types via the workspace alias, not relative paths. This ensures type consistency across the monorepo.

- **Svelte base path**: When using `href` or `src` attributes in Svelte components, import `{ base }` from `$app/paths` and use `{base}/route` pattern for GitHub Pages compatibility.

- **Static data loading**: Load JSON from `static/data/` using `fetchFn('/data/filename.json')` pattern, not `import` statements—static JSON is bundled at build time.

## Testing Requirements

- Tests use `*.test.ts` naming and live alongside source files (e.g., `src/lib/components/Navbar.test.ts`).

- Run `npm run build:shared` after modifying `packages/shared/src/` before testing web-svelte changes.

- Use `npm run test -w @pmp/web-svelte -- --run` for single test pass in CI.

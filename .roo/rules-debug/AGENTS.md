# Debug Mode Rules (Non-Obvious Only)

This file provides guidance to agents when debugging code in this repository.

## Debugging Insights

- **Static data loading**: When debugging data issues, check `static/data/` JSON files. The app loads content at build time, not runtime—changes to JSON require rebuild.

- **LocalStorage persistence**: User progress is stored in localStorage. Use browser DevTools Application tab to inspect. Keys are in `lib/constants/storageKeys.ts`.

- **Spaced repetition state**: Flashcard progress uses Leitner box system. Check `box` property in card progress storage—values 0-5 indicate mastery level.

- **Domain/task normalization**: Domain IDs follow pattern `domain-people`, `domain-process`, `domain-business`. Task IDs use ECO format like `I-3`, `II-1`, `III-7`.

- **Static export**: App uses `adapter-static`. Debugging 404s on routes may indicate missing `prerender` configuration in `+layout.ts`.

## Debug Commands

- `npm run dev` - Start dev server with hot reload
- `npm run test:ui -w @pmp/web-svelte` - Vitest UI for interactive test debugging
- `npm run check -w @pmp/web-svelte` - Type check to catch TypeScript errors

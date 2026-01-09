# Development Guide

This guide provides detailed information for developers working on PMP Study Pro.

## Project Structure

```
pmp_application/
├── .github/
│   ├── workflows/              # GitHub Actions CI/CD
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   └── dependabot.yml          # Dependency updates
├── packages/
│   ├── shared/                 # Shared types & utilities
│   │   └── src/
│   │       ├── index.ts        # Main export
│   │       └── types/          # TypeScript type definitions
│   └── web-svelte/             # Main SvelteKit application
│       ├── src/
│       │   ├── lib/            # Reusable code
│       │   │   ├── components/ # Svelte components
│       │   │   ├── stores/     # Svelte reactive stores
│       │   │   ├── utils/      # Utility functions
│       │   │   ├── constants/  # Constants
│       │   │   ├── data/       # Static data (markdown)
│       │   │   └── i18n/       # Internationalization
│       │   ├── routes/         # SvelteKit file-based routes
│       │   ├── app.html        # Root HTML template
│       │   └── app.css         # Global styles
│       ├── static/             # Static assets
│       │   ├── data/           # JSON content files
│       │   ├── manifest.json   # PWA manifest
│       │   └── service-worker.js
│       ├── e2e/                # Playwright E2E tests
│       ├── svelte.config.js    # SvelteKit configuration
│       ├── vite.config.ts      # Vite configuration
│       └── playwright.config.ts # Playwright configuration
├── CONTRIBUTING.md             # Contribution guidelines
├── ARCHITECTURE.md             # System architecture
├── ACCESSIBILITY.md            # Accessibility guidelines
├── PERFORMANCE.md              # Performance guidelines
├── CODE_OF_CONDUCT.md         # Community code of conduct
├── SECURITY.md                # Security policy
└── CHANGELOG.md               # Version history
```

## Architecture Overview

### Frontend Architecture
- **Framework:** SvelteKit 5 (Svelte Reactive Components)
- **Build Tool:** Vite
- **Styling:** TailwindCSS + Custom CSS
- **State Management:** Svelte Stores
- **Storage:** localStorage + Service Worker Cache

### Data Flow
1. User loads app → SvelteKit hydrates
2. Static data files (JSON/Markdown) loaded
3. Data transformed and cached in Svelte stores
4. Components subscribe to store updates
5. User progress saved to localStorage
6. Service worker caches everything for offline access

## Key Directories Explained

### `/src/lib/components/`
Reusable Svelte components used throughout the app:
- `Navbar.svelte` - Navigation bar
- `FlashcardStudyCard.svelte` - Flashcard component
- `QuizComponent.svelte` - Quiz/practice questions
- `DashboardStatsGrid.svelte` - Progress statistics
- `ui/` - Basic UI components (Button, Card, Input)

### `/src/lib/stores/`
Svelte stores managing application state:
- `dashboard.ts` - Dashboard progress tracking
- `flashcard.ts` - Flashcard study session state
- `practice.ts` - Practice quiz session state
- `auth.ts` - User preferences/settings
- `i18n.ts` - Language selection

### `/src/lib/utils/`
Utility functions and helpers:
- `flashcardStorage.ts` - localStorage operations for flashcards
- `practiceSessionStorage.ts` - Quiz session persistence
- `spacedRepetition.ts` - SM-2 spaced repetition algorithm
- `moduleLoader.ts` - Load markdown content modules
- `dataPortability.ts` - Import/export data

### `/src/routes/`
SvelteKit file-based routing:
- `+page.svelte` - Home page
- `/dashboard/` - Progress dashboard
- `/study/` - Study guides
- `/flashcards/` - Flashcard practice
- `/practice/` - Quiz practice
- `/formulas/` - Formula reference

### `/static/data/`
Static content files:
- `flashcards/` - Flashcard JSON data
- `modules/` - Study guide markdown files
- `testbank.json` - Practice question database
- `manifest.json` - PWA manifest

## Common Tasks

### Adding a New Feature

1. **Create component** in `/src/lib/components/`:
   ```typescript
   // NewFeature.svelte
   <script lang="ts">
     let count = $state(0);
   </script>

   <button onclick={() => count++}>
     Count: {count}
   </button>
   ```

2. **Add store** if managing state in `/src/lib/stores/`:
   ```typescript
   // src/lib/stores/newFeature.ts
   import { writable } from 'svelte/store';

   export const myState = writable(initialValue);
   ```

3. **Create route** in `/src/routes/`:
   ```
   /src/routes/new-feature/
   ├── +page.svelte      # Route page
   ├── +page.ts          # Route loader
   └── +page.test.ts     # Tests
   ```

4. **Write tests** in `/e2e/` for new pages:
   ```typescript
   import { test, expect } from '@playwright/test';

   test('new feature works', async ({ page }) => {
     await page.goto('/pmp_application/new-feature');
     await expect(page).toHaveTitle(/New Feature/);
   });
   ```

5. **Update documentation** in relevant `.md` files

### Adding Study Content

Study content is loaded from JSON and Markdown files:

1. **For flashcards:** Add JSON in `/static/data/flashcards/`
2. **For study modules:** Add Markdown in `/static/data/modules/`
3. **For questions:** Update `/static/data/testbank.json`
4. **For formulas:** Update `/static/data/formulas.json`

### Modifying Styles

Styles use TailwindCSS utility classes:

```svelte
<div class="flex items-center justify-between p-4 rounded-lg bg-primary">
  <h2 class="text-lg font-bold">Title</h2>
</div>
```

For custom styles, add to `/src/app.css`:
```css
@layer components {
  .custom-button {
    @apply px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90;
  }
}
```

### Working with Storage

Reading from localStorage:
```typescript
const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
```

Writing to localStorage:
```typescript
localStorage.setItem('userProgress', JSON.stringify(updatedProgress));
```

Using Svelte stores for reactive storage:
```typescript
const progress = writable(() => {
  return JSON.parse(localStorage.getItem('progress') || '{}');
}());

progress.subscribe(value => {
  localStorage.setItem('progress', JSON.stringify(value));
});
```

### Debugging

**Chrome DevTools:**
1. Open DevTools (F12)
2. Check Console for errors
3. Use Sources tab to set breakpoints
4. Check Application tab for localStorage/cache

**VS Code:**
1. Install Svelte extension
2. Set breakpoints in code
3. Run with debug configuration

**Network Tab:**
- Verify service worker caches files
- Check for 404s in data loading
- Simulate offline mode to test PWA

## Performance Considerations

### Avoiding Performance Issues

1. **Avoid large bundles:** Code-split heavy features
2. **Lazy load images:** Implement with `loading="lazy"`
3. **Debounce search:** Prevent excessive function calls
4. **Batch storage updates:** Write to localStorage efficiently
5. **Use derived stores:** Prevent unnecessary reactivity

### Monitoring Performance

```bash
npm run build
npm run preview -w @pmp/web-svelte
# Open DevTools → Lighthouse
```

## Testing Workflow

### Unit Tests
```bash
# Watch mode (reruns on save)
npm run test:web-svelte

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

### E2E Tests
```bash
# Headed mode (see browser)
npx playwright test --headed

# UI mode (interactive)
npx playwright test --ui

# Debug specific test
npx playwright test flashcards.spec.ts --debug
```

### Manual Testing Checklist
- [ ] Load app in dev server
- [ ] Navigate all routes
- [ ] Test flashcard study flow
- [ ] Test practice quiz flow
- [ ] Test offline mode (DevTools Network: Offline)
- [ ] Check localStorage in DevTools
- [ ] Verify mobile responsive layout

## Deployment

### Build Process
```bash
npm run build:shared      # Build shared package
npm run build:web-svelte  # Build SvelteKit app
```

### GitHub Pages Deployment
- Automatic via GitHub Actions on `master` push
- Workflow: `.github/workflows/gh-pages.yml`
- Output deployed to: `gh-pages` branch

### Manual Deployment
```bash
npm run build
# Files in packages/web-svelte/build/ ready to deploy
```

## Troubleshooting

### "Cannot find module '@pmp/shared'"
```bash
npm run build:shared
```

### Service worker not updating
- Increment version in `static/service-worker.js`
- Hard refresh browser (Ctrl+Shift+R)

### Svelte component not reactive
- Use `$state` for reactive variables (Svelte 5)
- Use stores for shared state: `export const myStore = writable({})`

### Build failing
```bash
npm run clean           # Remove build artifacts
npm install            # Reinstall dependencies
npm run build:shared
npm run build:web-svelte
```

### Tests failing
```bash
npm run test:run       # Run all tests once
npm run test:coverage  # Check coverage
```

## Contributing Best Practices

1. **Keep components small:** Single responsibility principle
2. **Use TypeScript:** Type all component props and functions
3. **Document code:** Comments for complex logic
4. **Test thoroughly:** Unit + E2E tests for features
5. **Follow patterns:** Look at existing code for consistency
6. **Update docs:** Keep ARCHITECTURE.md, etc. up to date
7. **Clean commits:** Atomic, focused commits with good messages
8. **Request reviews:** Get feedback early and often

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Documentation](https://svelte.dev/docs/introduction)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Playwright Testing](https://playwright.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)

## Questions?

Feel free to:
1. Check existing issues on GitHub
2. Create a new GitHub Discussion
3. Open an issue for bugs
4. Reach out to maintainers

Happy coding! 🎉

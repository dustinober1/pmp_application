# Contributing to PMP Study Pro

Thank you for your interest in contributing to PMP Study Pro! We welcome contributions from everyone. This document outlines the guidelines and processes for contributing to the codebase.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Quality Standards](#code-quality-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Questions & Help](#questions--help)

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pmp_application.git
   cd pmp_application
   ```
3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/dustinober/pmp_application.git
   ```

## Development Setup

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the shared package:**
   ```bash
   npm run build:shared
   ```

3. **Start the development server:**
   ```bash
   npm run dev:web-svelte
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173/pmp_application/`

### Available Scripts

```bash
# Development
npm run dev:web-svelte          # Start dev server
npm run dev                     # Start dev server (alias)

# Building
npm run build                   # Build both shared and web-svelte
npm run build:shared           # Build shared package only
npm run build:web-svelte       # Build web-svelte only

# Testing
npm run test                   # Run all tests
npm run test:web-svelte        # Run web-svelte tests
npm run test:coverage          # Run tests with coverage report
npm run test:ui                # Run tests in UI mode
npm run test:e2e               # Run E2E tests (Playwright)
npm run test:e2e:ui            # Run E2E tests in UI mode

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix               # Fix linting issues
npm run format                 # Format code with Prettier
npm run format:check           # Check formatting without changes
npm run check                  # Type check SvelteKit app

# Preview
npm run preview -w @pmp/web-svelte  # Preview production build
```

## Code Quality Standards

### Linting

All code must pass ESLint checks:

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

**Enforced rules:**
- No `any` types unless absolutely necessary (document with comment)
- Consistent naming conventions (camelCase for variables, PascalCase for components)
- No console.log in production code (use proper logging)
- No debugger statements
- Proper error handling

### Formatting

We use Prettier for automatic formatting. The CI will check formatting on all PRs:

```bash
npm run format       # Format all files
npm run format:check # Check without changes
```

**IDE Setup (Recommended):**
- [VS Code Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [VS Code ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Configure VS Code to format on save in `.vscode/settings.json`:
```json
{
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }
}
```

### TypeScript

- TypeScript strict mode is enabled
- All components must be properly typed
- Use interfaces over types for object shapes
- Avoid implicit `any` types

Example:
```typescript
interface CardProps {
  card: StudyCard;
  isFlipped: boolean;
  onFlip: () => void;
}
```

## Testing Guidelines

### Unit Tests

- Write tests for all utility functions
- Write tests for components that have logic
- Aim for >80% code coverage

**Location:** Colocate test files with source:
- `src/lib/utils/myUtils.ts` → `src/lib/utils/myUtils.test.ts`
- `src/lib/components/MyButton.svelte` → `src/lib/components/MyButton.test.ts`

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myUtils';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### E2E Tests

E2E tests cover critical user workflows:
- Navigation between pages
- Flashcard practice flow
- Practice quiz flow
- Dashboard interactions
- Data persistence

**Location:** `packages/web-svelte/e2e/`

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('should complete flashcard study flow', async ({ page }) => {
  await page.goto('/pmp_application/flashcards');
  await page.click('button:has-text("Practice")');
  
  // Verify flashcard appears
  const flashcard = page.locator('[role="button"]');
  await expect(flashcard).toBeVisible();
});
```

**Run E2E tests:**
```bash
npm run test:e2e        # Headless mode
npm run test:e2e:ui     # Interactive UI
```

### Running Tests

```bash
# Watch mode (re-run on file changes)
npm run test:web-svelte

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui

# Single run (CI mode)
npm run test:run
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): subject

body

footer
```

### Types
- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation only changes
- **style:** Changes that don't affect code meaning (formatting, semicolons, etc.)
- **refactor:** Code changes that neither fix bugs nor add features
- **perf:** Code changes that improve performance
- **test:** Adding or updating tests
- **chore:** Changes to build process, dependencies, or tooling

### Examples

```
feat(flashcards): add keyboard shortcuts for ratings

- Added 1-4 number keys for quick rating
- Added Space to flip cards
- Added ? to show help modal

Closes #123
```

```
fix(dashboard): fix progress calculation for incomplete sessions
```

```
docs: update contributing guide
```

## Pull Request Process

### Before Creating a PR

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make your changes and commit:**
   ```bash
   git commit -m "feat(scope): description"
   ```

4. **Run checks locally:**
   ```bash
   npm run lint
   npm run format:check
   npm run test
   npm run build
   ```

### Creating a PR

1. **Push your branch:**
   ```bash
   git push origin feature/my-feature
   ```

2. **Create PR on GitHub** with:
   - Clear title following Conventional Commits
   - Description of changes (use the PR template)
   - Link to related issues (e.g., "Fixes #123")
   - Before/after screenshots if UI changes

3. **PR Template Checklist:**
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Code follows style guide
   - [ ] No breaking changes (or documented)

### Review & Merge

- At least 1 approval required from maintainers
- All CI checks must pass:
  - Linting
  - Type checking
  - Unit tests
  - Build verification
- No merge conflicts

## Documentation

### Code Comments

- Comment **why**, not **what**
- Use JSDoc for public functions:

```typescript
/**
 * Calculates spaced repetition interval using SM-2 algorithm
 * @param interval - Previous interval in days
 * @param quality - Rating (0-5)
 * @returns New interval in days
 */
export function calculateInterval(interval: number, quality: number): number {
  // Implementation
}
```

### Updating Docs

- Update `CONTRIBUTING.md` for process changes
- Update `ARCHITECTURE.md` for design changes
- Update `CHANGELOG.md` with new features
- Update README for new user-facing features

## Questions & Help

- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For general questions and discussions
- **Discord/Slack:** (If established) For real-time chat
- **Email:** Contact maintainers for security issues

See [SECURITY.md](SECURITY.md) for security vulnerability reporting.

---

## Additional Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design and architecture
- [ACCESSIBILITY.md](ACCESSIBILITY.md) - Accessibility guidelines
- [PERFORMANCE.md](PERFORMANCE.md) - Performance optimization
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Svelte 5 Docs](https://svelte.dev/)

Thank you for contributing! 🎉

# Contributing to PMP Study Application

Thank you for your interest in contributing to the PMP Study Application! This document outlines the standards and processes for contributing to the codebase.

## Code Quality & Testing

### Standards

- **Linting:** We use ESLint to enforce code quality. All code must pass linting checks.
- **Formatting:** Prettier is used for consistent code formatting.
- **Type Safety:** TypeScript strict mode is enabled. No `any` types allowed unless strictly necessary and documented.

### Testing

- **Unit Tests:** All new features and bug fixes must include unit tests (Jest).
- **E2E Tests:** Critical user flows must be covered by E2E tests (Playwright).
- **Coverage:** Aim for >80% code coverage.

## Pull Request Process

### Peer Review Policy

All changes to the `main` branch must go through a Pull Request (PR) and require peer review.

1. **Branching:** Create a new branch for your feature or fix (e.g., `feature/user-auth` or `fix/login-bug`).
2. **Commit Messages:** Use descriptive commit messages explaining _why_ a change was made.
3. **PR Description:** clearly describe the changes, the problem solved, and verification steps.
4. **Review Requirements:**

- **Approval:** At least **1** approval from a code owner or maintainer is required.
- **CI Checks:** All CI checks (Lint, Test, Build, CodeQL) must pass.
- **No Conflicts:** The branch must be up-to-date with `main` and have no merge conflicts.

### Branch Protection Rules (Enforced on `main`)

- Require a pull request before merging.
- Require status checks to pass before merging.
- Require review from Code Owners.
- Do not allow bypassing the above settings.

## Development Setup

1. **Install Dependencies:** `npm install`
2. **Run Dev Server:** `npm run dev`
3. **Run Tests:** `npm run test`
4. **Run E2E Tests:** `npx playwright test` (in `packages/web`)

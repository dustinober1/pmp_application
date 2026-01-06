# PMP Study Application

## Project Overview

This is a comprehensive, offline-first study platform for the 2026 PMP (Project Management Professional) certification exam. It is a monorepo containing a static web application and a shared library.

- **Architecture:** Monorepo using NPM Workspaces.
- **Frontend:** SvelteKit (Svelte 5) + Vite + TailwindCSS.
- **Deployment:** Static site export (`@sveltejs/adapter-static`) hosted on GitHub Pages.
- **Data Strategy:**
- **Content:** Static JSON/Markdown files located in `packages/web-svelte/static/data/`.
- **User Progress:** Stored entirely in the browser's `localStorage` (no backend database).

## Project Structure

```
pmp_application/
 packages/
 web-svelte/ # Main frontend application (SvelteKit)
 src/ # Svelte components, stores, and logic
 static/ # Static assets and data files (JSON/MD)
 ...
 shared/ # Shared TypeScript types and utilities
 scripts/ # Maintenance scripts (e.g., flashcard analysis)
 .github/ # GitHub Actions workflows (deployment)
 ...
```

## Key Technologies

- **Framework:** SvelteKit (Svelte 5)
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Testing:** Vitest
- **Linting/Formatting:** ESLint, Prettier

## Building and Running

### Prerequisites

- Node.js 18+

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Build the shared package (Required first):**

```bash
npm run build:shared
```

### Development

Start the SvelteKit development server:

```bash
npm run dev:web-svelte
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

### Production Build

Build the web application for production (static export):

```bash
npm run build:web-svelte
```

This will generate the static files in `packages/web-svelte/build/` (configured for GitHub Pages with base path `/pmp_application`).

### Testing

Run unit and component tests:

```bash
npm run test:web-svelte
```

## Development Conventions

- **Branching:** Use descriptive feature branches (e.g., `feature/new-card-type`, `fix/nav-bug`).
- **Commits:** Use descriptive commit messages explaining the _why_.
- **Formatting:** Run `npm run format` to ensure code consistency (Prettier).
- **Linting:** Run `npm run lint` to check for issues (ESLint).
- **Types:** Strict TypeScript usage is enforced. Avoid `any`.

## Recent Progress (January 2026)

- **Routing & Navigation:** Fixed 404 errors in practice/flashcard routing by ensuring consistent use of the `${base}` path and removing redundant route segments.
- **Practice Session Enhancements:**
- **Layout Optimization:** Widened the container and tightened vertical spacing to minimize scrolling.
- **Scenario Integration:** Added support for complex question scenarios, displayed in a dedicated context card.
- **Option Randomization:** Implemented shuffling for question answers to ensure the correct option is not predictable.
- **Data Portability:** Expanded export/import functionality to include detailed SRS progress (repetitions, intervals, mastery) for both flashcards and questions.
- **Code Quality:** Resolved numerous TypeScript linting errors in the `dashboard` store to improve type safety and maintainability.
- **MCP Exploration:** Analyzed the repository to identify MCP servers that will assist in shipping the application (Browser, Everything, Memory).
- **Bug Fixes:** Resolved an issue where dashboard tiles (Flashcards Learned) displayed "NaN" due to incorrect localStorage key usage.
- **Question Flagging & Review:** Implemented full support for flagging questions during practice sessions and a dedicated "Review Flagged" mode to revisit them. Added persistent storage for flags and updated the UI with toggle controls.
- **UI Improvements:** Updated the dashboard to display flashcards progress as a percentage instead of a raw count.
- **Dashboard Reliability:** Refactored dashboard store to dynamically load flashcard totals from manifest, resolving "NaN cards" issues and improving count accuracy. Added unit tests for dashboard logic.
- **Study Page Cleanup:** Removed "Domain Cards" section from the main Study page to simplify the interface, keeping the ECO Info Cards and Study Modules, as per user correction.
- **Module Content:** Added configuration for Module 2 (Strategic Business Management) and Module 3 (Team Leadership & Development) to the study page, enabling access to new study materials.
- **Professional Formatting:** Removed emojis from all study content (markdown), data (JSON) files, and UI components across the entire application to maintain a professional, state-of-the-art aesthetic. Improved table styling in SanitizedMarkdown component with theme-aware borders, backgrounds, and hover states for better visibility in both light and dark modes.
- **Advanced Markdown Features:**
    - **Custom Alerts:** Implemented support for `::: tip/info/warning/caution` syntax to render professionally styled callout blocks.
    - **Interactive Checkboxes:** Enhanced markdown rendering to make `[ ]` task lists interactive, persisting their state to `localStorage`.
    - **Dynamic Components:** Added capability to mount Svelte components (like `ProgressTable`) directly into markdown content using placeholder elements.
    - **Using Guide Updates:** Refined Module 1 "Using This Guide" with a proper Table of Contents, a responsive "Study Path" comparison table, and an interactive domain progress tracker.
- **Study Navigation:** Implemented "Previous" and "Next" navigation buttons at the bottom of study material sections, allowing users to seamlessly move through the curriculum across module boundaries.
- **Content Accuracy:** Corrected the Table of Contents in the "How to Use This Guide" section to accurately match the actual module list and descriptions used in the application.
- **Direct URL Navigation:** Fixed 404 errors when navigating directly to study module URLs (e.g., `/study/modules/01-introduction/using-guide`). Added prerendering with `entries()` function to generate static HTML pages for all module/section combinations, enabling proper deep linking on GitHub Pages.

## Current Status & Roadmap

- [x] Core SvelteKit Migration
- [x] Offline-first Storage (LocalStorage)
- [x] SRS Algorithm (SM-2) for Flashcards
- [x] Question Practice Sessions
- [x] Dashboard Progress Visualization
- [x] Data Export/Import (Full Persistence)
- [ ] Multi-device Sync (Cloud Optional)
- [ ] Performance Analytics & Insights
- [ ] Mock Exam Mode (Timed)

## Note on README

The root `README.md` references a Next.js architecture which has been migrated to SvelteKit. Refer to `packages/web-svelte/package.json` and this document for the current operational commands.

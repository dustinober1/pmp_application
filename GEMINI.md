# PMP Study Application

## Project Overview

This is a comprehensive, offline-first study platform for the 2026 PMP (Project Management Professional) certification exam. It is a monorepo containing a static web application and a shared library.

*   **Architecture:** Monorepo using NPM Workspaces.
*   **Frontend:** SvelteKit (Svelte 5) + Vite + TailwindCSS.
*   **Deployment:** Static site export (`@sveltejs/adapter-static`) hosted on GitHub Pages.
*   **Data Strategy:** 
    *   **Content:** Static JSON/Markdown files located in `packages/web-svelte/static/data/`.
    *   **User Progress:** Stored entirely in the browser's `localStorage` (no backend database).

## Project Structure

```
pmp_application/
├── packages/
│   ├── web-svelte/    # Main frontend application (SvelteKit)
│   │   ├── src/       # Svelte components, stores, and logic
│   │   ├── static/    # Static assets and data files (JSON/MD)
│   │   └── ...
│   └── shared/        # Shared TypeScript types and utilities
├── scripts/           # Maintenance scripts (e.g., flashcard analysis)
├── .github/           # GitHub Actions workflows (deployment)
└── ...
```

## Key Technologies

*   **Framework:** SvelteKit (Svelte 5)
*   **Build Tool:** Vite
*   **Styling:** TailwindCSS
*   **Testing:** Vitest
*   **Linting/Formatting:** ESLint, Prettier

## Building and Running

### Prerequisites
*   Node.js 18+

### Setup
1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Build the shared package (Required first):**
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

*   **Branching:** Use descriptive feature branches (e.g., `feature/new-card-type`, `fix/nav-bug`).
*   **Commits:** Use descriptive commit messages explaining the *why*.
*   **Formatting:** Run `npm run format` to ensure code consistency (Prettier).
*   **Linting:** Run `npm run lint` to check for issues (ESLint).
*   **Types:** Strict TypeScript usage is enforced. Avoid `any`.

## Note on README
The root `README.md` references a Next.js architecture which has been migrated to SvelteKit. Refer to `packages/web-svelte/package.json` and this document for the current operational commands.

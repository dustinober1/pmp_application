# PMP Study Pro

A **100% free and open-source** study platform for the 2026 PMP (Project Management Professional) certification exam. Consider supporting this project please.

## Features

- **Study Guides** - Comprehensive content organized by PMI domains and tasks
- **Flashcards** - Spaced repetition learning with Leitner box system (1,800+ cards)
- **Practice Questions** - Exam-style questions with detailed explanations (1,200+ questions)
- **Analytics Dashboard** - Track progress with local storage
- **Formula Calculator** - Practice EVM and other calculations
- **Works with Minimal Connectivity** - Once loaded, works with minimal connectivity using browser caching

## What Changed?

This is now a **static site** that requires **no backend, database, or API**. All features work entirely in the browser:

- No user accounts or authentication required
- No database or server-side processing
- No subscriptions or payments
- All study materials are 100% free
- Progress is stored locally in your browser (localStorage)
- Works with minimal connectivity once loaded (browser caching)

## Tech Stack

- **Frontend**: SvelteKit (Svelte 5) + Vite + TypeScript + TailwindCSS
- **Data**: Static JSON files loaded from `static/data/`
- **State Management**: localStorage for progress tracking
- **Deployment**: GitHub Pages (static export)

## Project Structure

```
pmp_application/
 packages/
 web-svelte/ # SvelteKit frontend (static export)
  src/ # Svelte components, stores, and logic
  static/ # Static assets and data files (JSON/MD)
 shared/ # Shared types and utilities
 .github/
  workflows/
   gh-pages.yml # GitHub Pages deployment workflow
```

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Build the shared package:

```bash
npm run build:shared
```

4. Start the development server:

```bash
npm run dev:web-svelte
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser (or the port shown in the terminal)

### Available Scripts

- `npm run dev:web-svelte` - Start SvelteKit dev server
- `npm run build:web-svelte` - Build for production (static export)
- `npm run build:shared` - Build the shared package
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test:web-svelte` - Run tests

## Building for GitHub Pages

The application is configured with a base path `/pmp_application` for GitHub Pages deployment. To build:

```bash
npm run build:shared && npm run build:web-svelte
```

The built static files will be in `packages/web-svelte/build/`.

## Deployment

### GitHub Pages

The project includes a GitHub Actions workflow (`.github/workflows/gh-pages.yml`) that automatically deploys to GitHub Pages when you push to the `master` branch.

**Setup steps:**

1. Go to your repository **Settings** → **Pages**
2. Set **Source** to **GitHub Actions**

The workflow will:

- Build the shared package
- Build the SvelteKit application with base path `/pmp_application`
- Deploy the `packages/web-svelte/build` directory to GitHub Pages

### Other Static Hosting

You can deploy the `packages/web-svelte/build` directory to any static hosting service:

- **Netlify**: Deploy the `build` directory
- **Vercel**: Import repository (auto-detects SvelteKit)
- **Cloudflare Pages**: Deploy the `build` directory

For custom domains or root deployment (not in a subdirectory), update the base path in `svelte.config.js` and `vite.config.ts` before building.

## Data Storage

All progress is stored locally in your browser using localStorage:

- **Flashcard progress**: Leitner box system with spaced repetition
- **Practice history**: Quiz attempts and scores
- **Streak tracking**: Daily activity streaks

**Note**: Clearing your browser data will reset your progress. There's no cloud sync.

## Content

- **1,800+ flashcards** covering all PMP domains
- **1,200+ practice questions** with detailed explanations
- **Study guides** aligned with the 2026 PMP ECO
- **Formula reference** and calculator

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

# PMP Study Pro

A **100% free and open-source** study platform for the 2026 PMP (Project Management Professional) certification exam. Consider supporting this project please.

## Features

- **Study Guides** - Comprehensive content organized by PMI domains and tasks
- **Flashcards** - Spaced repetition learning with Leitner box system (1,800+ cards)
- **Practice Questions** - Exam-style questions with detailed explanations (1,200+ questions)
- **Analytics Dashboard** - Track progress with local storage
- **Formula Calculator** - Practice EVM and other calculations
- **Offline-First** - Works offline after loading, data stored locally

## What Changed?

This is now a **static site** that requires **no backend, database, or API**. All features work entirely in the browser:

- ❌ No user accounts or authentication required
- ❌ No database or server-side processing
- ❌ No subscriptions or payments
- ✅ All study materials are 100% free
- ✅ Progress is stored locally in your browser (localStorage)
- ✅ Works offline once loaded

## Tech Stack

- **Frontend**: React 18 + Next.js 14 + TypeScript + TailwindCSS
- **Data**: Static JSON files loaded from `public/data/`
- **State Management**: localStorage for progress tracking
- **Deployment**: GitHub Pages (static export)

## Project Structure

```
pmp_application/
├── packages/
│   ├── web/           # Next.js frontend (static export)
│   └── shared/        # Shared types and utilities
├── public/
│   └── data/          # Static JSON data (flashcards, questions)
└── .github/
    └── workflows/
        └── gh-pages.yml  # GitHub Pages deployment workflow
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
   npm run dev:web
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev:web` - Start Next.js dev server
- `npm run build:web` - Build for production (static export)
- `npm run serve:static` - Serve the built static site locally
- `npm run build:shared` - Build the shared package
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Building for GitHub Pages

To build with a base path (for GitHub Pages project pages):

```bash
NEXT_PUBLIC_BASE_PATH=/pmp_application npm run build:web
```

The built static files will be in `packages/web/out/`.

## Deployment

### GitHub Pages

The project includes a GitHub Actions workflow (`.github/workflows/gh-pages.yml`) that automatically deploys to GitHub Pages when you push to the `master` branch.

**Setup steps:**

1. Go to your repository **Settings** → **Pages**
2. Set **Source** to **GitHub Actions**

The workflow will:
- Build the site with `NEXT_PUBLIC_BASE_PATH=/pmp_application`
- Deploy the `packages/web/out` directory to GitHub Pages

### Other Static Hosting

You can deploy the `packages/web/out` directory to any static hosting service:

- **Netlify**: Deploy the `out` directory
- **Vercel**: Import repository (auto-detects Next.js)
- **Cloudflare Pages**: Deploy the `out` directory

For custom domains or root deployment (not in a subdirectory), build without the base path:

```bash
npm run build:web
```

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

- Built with [Next.js](https://nextjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

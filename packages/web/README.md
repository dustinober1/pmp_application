# @pmp/web

Next.js 14 (App Router) frontend for the PMP study platform.

## Features

- **PWA Support**: Offline capability via service workers.
- **i18n**: Support for English and Spanish.
- **Material You**: Styling based on MD3 design tokens using TailwindCSS.
- **Adaptive Learning**: Flashcard and practice question systems.

## Development

- Install deps (from repo root): `npm install`
- Run web: `npm run dev:web`
- Run tests: `npm test:web` (from root)

## Environment

Copy `packages/web/.env.example` to `packages/web/.env.local` and adjust as needed.

Required variables:
- `NEXT_PUBLIC_API_URL`: The URL of the API server (e.g., `http://localhost:3001/api`).

## Build & Deployment

The web package is optimized for deployment on **Render**.

- Build command: `npm run build`
- Start command: `npm start`

# Architecture

This document describes the high-level architecture of the PMP Study Pro application.

## Overview

PMP Study Pro is a **100% free and open-source** offline-first study platform for the 2026 PMP certification exam. It's built as a static site using modern web technologies with no backend requirements.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Environment                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           SvelteKit Application (Frontend)            │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         Routes & Components (Svelte 5)         │  │  │
│  │  ├─ Study Guides                                  │  │  │
│  │  ├─ Flashcard Practice                            │  │  │
│  │  ├─ Practice Quizzes                              │  │  │
│  │  ├─ Dashboard                                     │  │  │
│  │  └─ Formulas & Calculator                         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         State Management (Svelte Stores)       │  │  │
│  │  ├─ Dashboard Store (progress, stats)              │  │  │
│  │  ├─ Flashcard Store (card state, ratings)         │  │  │
│  │  ├─ Practice Store (session management)            │  │  │
│  │  ├─ Auth Store (user preferences)                 │  │  │
│  │  └─ i18n Store (language preferences)             │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         Shared Library (@pmp/shared)           │  │  │
│  │  ├─ TypeScript Types                              │  │  │
│  │  ├─ Utilities (storage, validation)               │  │  │
│  │  └─ Constants                                     │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         Local Storage & Caching                │  │  │
│  │  ├─ Progress tracking (JSON)                       │  │  │
│  │  ├─ Study sessions                                 │  │  │
│  │  ├─ Flashcard ratings (SM-2 algorithm)            │  │  │
│  │  ├─ User preferences                              │  │  │
│  │  └─ Service Worker Cache                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Static Data Files (Static Assets)            │  │
│  ├─ Study Modules (Markdown)                            │  │
│  ├─ Flashcards (JSON)                                  │  │
│  ├─ Practice Questions (JSON)                          │  │
│  ├─ Formulas (JSON)                                    │  │
│  └─ Manifest & Icons (PWA)                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Service Worker                               │  │
│  ├─ Cache static assets                                │  │
│  ├─ Offline functionality                              │  │
│  └─ Background sync (future)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ HTTP(S)
         │ (Static content)
         ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Pages / Static Hosting                  │
│  - No backend server required                               │
│  - CDN-distributed static files                             │
│  - HTTPS by default (GitHub Pages)                          │
└─────────────────────────────────────────────────────────────┘
```

## Core Technologies

### Frontend Framework
- **SvelteKit 5**: Modern, lightweight web framework
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework

### State Management
- **Svelte Stores**: Reactive state management
- **localStorage**: Browser-based persistent storage

### Testing
- **Vitest**: Unit and component testing
- **Playwright**: End-to-end testing
- **Testing Library**: Component testing utilities

### Code Quality
- **ESLint**: Code linting and style
- **Prettier**: Code formatting
- **Husky & lint-staged**: Pre-commit hooks
- **TypeScript**: Type checking

### Deployment
- **GitHub Pages**: Static site hosting
- **GitHub Actions**: CI/CD automation
- **Static adapter**: SvelteKit static export

## Data Flow

### Study Data Loading
```
User Loads App
    ↓
SvelteKit Hydrates
    ↓
Load Static Data Files (JSON/Markdown)
    ↓
Parse & Transform Data
    ↓
Store in Memory & Cache
    ↓
Render UI with Data
    ↓
Service Worker Caches Resources
```

### Progress Tracking
```
User Completes Action
    ↓
Update Svelte Store
    ↓
Save to localStorage
    ↓
Service Worker Caches Update
    ↓
User Progress Persisted Locally
```

### Study Session Flow
```
User Starts Session
    ↓
Create Session Store
    ↓
Load Session Data from localStorage
    ↓
Display Content
    ↓
On User Interaction:
    ├─ Update Store
    ├─ Save to localStorage
    ├─ Update UI
    └─ Calculate Spaced Repetition
```

## Key Design Decisions

### 1. Offline-First Architecture
- All data is stored locally in the browser
- No network requests required after initial load
- Service worker provides caching layer
- Perfect for exam prep (can study anywhere)

### 2. Static Site Deployment
- No backend servers needed
- Hosted on GitHub Pages (free)
- Highly scalable and performant
- Easy to deploy updates

### 3. localStorage for State
- Persistent storage without backend database
- User data never leaves their device
- Simple to implement and maintain
- Privacy-respecting design

### 4. Spaced Repetition (SM-2 Algorithm)
- Evidence-based learning technique
- Improves long-term retention
- Implemented in Svelte stores
- Flashcard rating: 1-4 (again, hard, good, easy)

### 5. Modular Component Structure
- Reusable UI components
- Clear separation of concerns
- Type-safe with TypeScript
- Accessible by default (ARIA labels, keyboard navigation)

## File Structure

```
pmp_application/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Linting, testing, type checking
│   │   ├── codeql.yml             # Security analysis
│   │   └── gh-pages.yml           # Build & deploy
│   ├── ISSUE_TEMPLATE/            # Issue templates
│   └── dependabot.yml             # Dependency updates
├── packages/
│   ├── shared/                    # Shared types & utilities
│   │   └── src/
│   │       ├── index.ts           # Main export
│   │       └── types/             # Type definitions
│   └── web-svelte/                # Main application
│       ├── src/
│       │   ├── lib/               # Reusable components & utils
│       │   │   ├── components/    # Svelte components
│       │   │   ├── stores/        # Svelte stores
│       │   │   └── utils/         # Utility functions
│       │   └── routes/            # SvelteKit routes
│       ├── static/                # Static assets & data
│       │   ├── data/              # JSON/Markdown content
│       │   ├── manifest.json      # PWA manifest
│       │   └── service-worker.js  # Service worker
│       └── e2e/                   # E2E tests (Playwright)
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CONTRIBUTING.md
├── ARCHITECTURE.md                # This file
└── CHANGELOG.md
```

## Performance Considerations

### Optimization Strategies
1. **Code Splitting**: Routes are code-split automatically
2. **Tree Shaking**: Unused code is removed during build
3. **Service Worker Caching**: Static assets cached for instant loading
4. **Lazy Loading**: Components loaded on demand
5. **Minification**: All code is minified in production

### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## Accessibility Features

- **ARIA Labels**: All interactive elements labeled
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG AA compliance
- **Screen Reader Support**: Semantic HTML and ARIA
- **Focus Management**: Clear focus indicators
- **Skip Links**: Skip to main content

## Security Considerations

### Data Privacy
- All data stored locally (no server-side storage)
- No user tracking or analytics by default
- No third-party services required
- GDPR and privacy-compliant design

### Code Security
- Dependency scanning with Dependabot
- CodeQL analysis for code vulnerabilities
- No use of `eval()` or unsafe functions
- Content Security Policy ready

## Future Enhancements

### Phase 2 Features
- [ ] Mock exam mode (timed, full-length)
- [ ] Enhanced analytics dashboard
- [ ] Custom study sets
- [ ] Browser notifications for study reminders
- [ ] PDF export of progress

### Phase 3 Features
- [ ] Multi-device sync (optional cloud)
- [ ] Social sharing features
- [ ] Community annotations
- [ ] AI-powered study recommendations

## Deployment Architecture

```
GitHub Repository
    ↓
GitHub Actions (CI/CD)
    ├─ Run tests
    ├─ Check types
    ├─ Lint code
    └─ Build static site
    ↓
GitHub Pages
    ├─ Serves static files
    └─ HTTPS by default
    ↓
User Browser
    ├─ Downloads HTML/CSS/JS
    ├─ Caches with Service Worker
    └─ Renders offline-first app
```

## Development Workflow

1. **Local Development**: `npm run dev:web-svelte`
2. **Type Checking**: `npm run check -w @pmp/web-svelte`
3. **Linting**: `npm run lint`
4. **Unit Testing**: `npm run test:web-svelte`
5. **E2E Testing**: `npm run test:e2e`
6. **Build**: `npm run build`
7. **Preview**: `npm run preview -w @pmp/web-svelte`
8. **Deploy**: Push to `master` branch

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines and how to contribute to this project.

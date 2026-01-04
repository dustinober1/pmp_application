# Static Migration Plan (PMP Study Pro)

Goal: convert the app to a 100% static, donation-supported site that can run on GitHub Pages (or any static host) without the API or database. This is written so a junior developer can follow it step by step and validate progress at each stage.

---

## What “Done” Looks Like
- `packages/web` builds with `next build && next export`, producing `packages/web/out/`.
- The exported `out/` folder works when served from a subpath (GitHub Pages), including assets (CSS/JS/images) and client-side navigation.
- All core features run without any backend:
  - Study content is browsable.
  - Flashcards run locally and store progress locally.
  - Practice questions run locally and store history locally.
  - Dashboard shows stats from localStorage (not from API).
- Donation/support page exists and the app has no Stripe/auth/subscription flows.

## Non-Goals (Explicitly Removed)
- Login/registration/email verification, cookies, CSRF, refresh tokens.
- Paid tiers, checkout, subscription management, team management.
- Server-created sessions for flashcards/practice/mock exams.
- API-backed search (optional: add client-only search later).

---

## Upfront Decisions (Fill These In First)
1) Hosting target:
   - `user/organization pages` (repo is `<name>.github.io`) → basePath is empty (`""`).
   - `project pages` (repo is `pmp_application`) → basePath is `"/pmp_application"`.
2) Donation provider(s) and URLs (choose 1–3):
   - Buy Me a Coffee, GitHub Sponsors, PayPal link, Stripe Payment Link (not Stripe checkout integration).
3) Do we want PWA/offline caching on day 1?
   - Recommended: **No** (ship static first, add PWA later once basePath is stable).

---

## Target Architecture (Static)
- Next.js App Router, exported with `output: "export"`.
- All data is static JSON under `packages/web/public/data/*` and fetched at runtime.
- User state is local-only (localStorage), no accounts.
- Pages are public; no middleware/auth gating.

Data sources used:
- Domains/tasks: `packages/web/src/data/pmpExamContent.ts`
- Flashcards: `packages/web/public/data/flashcards.json` (copied from `data/flashcards-combined.json`)
- Practice questions: `packages/web/public/data/questions.json` (copied from `packages/api/prisma/seed-data/testbank.json`)

---

## Milestones (Recommended Execution Order)
M0) Remove auth/billing safely; app compiles in dev.
M1) Make Next export work (export build passes).
M2) Add static data loaders (flashcards/questions) + basePath-safe fetching.
M3) Rebuild Flashcards as `/flashcards/play` (local sessions).
M4) Rebuild Practice as `/practice/play` (local quizzes).
M5) Rebuild Dashboard (local stats).
M6) Clean dependencies + tests.
M7) Add GitHub Pages deploy workflow and verify live.

---

## Phase 0 — Branch, Inventory, and Guardrails (1–2 hours)

### 0.1 Create a working branch
- `git checkout -b static-site`

### 0.2 Confirm current web routes (for reference)
- List app routes: `ls packages/web/src/app`
- Note important existing routes you likely want to keep public:
  - `/` (landing), `/study`, `/flashcards`, `/practice`, `/study-guide`, `/blog`, `/faq`, `/contact`, `/privacy`, `/terms`, `/offline`

### 0.3 Inventory backend-coupled code via searches
Run these and save output to notes:
- `rg "useRequireAuth|AuthProvider|AuthContext" packages/web/src`
- `rg "apiRequest\\(|from \"@/lib/api\"" packages/web/src`
- `rg "\\b(practiceApi|flashcardApi|contentApi|dashboardApi|formulaApi|subscriptionApi|authApi)\\b" packages/web/src`
- `rg "stripe|checkout|subscriptions" packages/web/src`
- `rg "middleware" packages/web/src`

### 0.4 Confirm static data availability/shape
- Flashcards file: `data/flashcards-combined.json` is a list of 26 sections, each with `{ meta, flashcards[] }`.
- Questions file: `packages/api/prisma/seed-data/testbank.json` is an object with `questions: []`, where each question includes:
  - `questionText`, `answers[]` (with `{ text, isCorrect }`), `correctAnswerIndex`, `remediation` object.

### Phase 0 Exit Criteria
- You have a list of all files/routes that depend on auth/API/billing.
- You have chosen the GH Pages basePath strategy (project pages vs user pages).

---

## Phase 1 — Remove Auth, Middleware, Billing, and Team Features (2–4 hours)

Objective: remove the “server app” parts (auth/subscriptions/team) first, so the rest can be rebuilt as public pages.

### 1.1 Remove middleware (auth gating)
GitHub Pages does not run Next middleware; it will not work after export.
- Delete:
  - `packages/web/src/middleware.ts`
  - `packages/web/src/middleware.test.ts`
- Verify:
  - `rg "from \"\\./middleware\"|middleware\\.ts" packages/web/src` returns nothing.

### 1.2 Remove auth context + auth guard hook
- Delete:
  - `packages/web/src/contexts/AuthContext.tsx`
  - `packages/web/src/contexts/AuthContext.test.tsx`
  - `packages/web/src/hooks/useRequireAuth.ts`
  - `packages/web/src/hooks/useRequireAuth.test.tsx`
- Verify:
  - `rg "useRequireAuth|useAuth\\(" packages/web/src` returns nothing.

### 1.3 Remove auth pages
- Delete the entire directory:
  - `packages/web/src/app/auth/`
- Verify:
  - `ls packages/web/src/app/auth` should not exist.
  - `rg "/auth/" packages/web/src/app` should show only links you still need to update.

### 1.4 Remove billing/checkout
- Delete:
  - `packages/web/src/app/checkout/`
- Update:
  - Remove pricing/checkout CTAs in:
    - `packages/web/src/app/page.tsx`
    - `packages/web/src/components/Navbar.tsx` (and Footer if it links to pricing/checkout)
- Verify:
  - `rg "checkout|stripe|subscriptions" packages/web/src/app packages/web/src/components` returns no actionable hits.

### 1.5 Remove team/corporate features
- Delete:
  - `packages/web/src/app/team/`
- Verify:
  - `rg "/team" packages/web/src` returns nothing (except maybe static content in docs).

### 1.6 Simplify `Providers`
- Edit `packages/web/src/app/providers.tsx`:
  - Remove `AuthProvider` and email verification gate.
  - Ensure the remaining providers still wrap children correctly.

### 1.7 Stub/Remove API client entrypoints
At this point, many pages import from `@/lib/api` and will fail until rewritten.
- Option A (recommended): keep `packages/web/src/lib/api.ts` temporarily, but replace calls with `throw new Error("API removed")` so the app fails loudly where still used.
- Option B: delete `packages/web/src/lib/api.ts` now and fix imports as you touch pages.

### Phase 1 Exit Criteria
- Web app compiles in dev after removing auth/team/checkout OR it compiles except for known pages you haven’t rewritten yet (acceptable if you’re tackling them immediately next).
- There is no middleware/auth guard remaining.

---

## Phase 2 — Make Next Export Work (M1) (1–2 hours)

Objective: get `packages/web` exporting to static HTML so you can validate hosting constraints early.

### 2.1 Update Next config for export + basePath
Edit `packages/web/next.config.js`:
- Required changes:
  - `output: "export"` (replace `"standalone"`)
  - `images: { unoptimized: true }`
  - `trailingSlash: true`
  - Configure `basePath` and `assetPrefix` using env so local dev can stay at `/`:
    - Example strategy:
      - local dev/build: no basePath (empty)
      - GH Pages: `NEXT_PUBLIC_BASE_PATH="/pmp_application"`
- Remove these (GitHub Pages cannot apply them; Next export also doesn’t support them):
  - `async redirects()`
  - `async headers()`
- Disable `next-pwa` wrapper initially (re-add later if desired).

### 2.2 Update build scripts
Edit `packages/web/package.json`:
- Set `build` to: `next build && next export`
- Add:
  - `serve:static`: `npx serve out`

### 2.3 Validate export locally
Run inside `packages/web`:
- `npm run build`
- `npm run serve:static`
Open the served URL and click around.

### 2.4 Validate basePath locally (simulate GH Pages)
Temporarily run with basePath:
- `NEXT_PUBLIC_BASE_PATH="/pmp_application" npm run build`
- Serve `out/` and verify assets load and navigation works from `/pmp_application/`.

### Common Problems + Fixes
- **Images broken**: ensure `images.unoptimized = true`.
- **Routes missing**: dynamic segments like `[...]` cannot export unless statically generated. Plan to delete/replace them (Phase 5).

### Phase 2 Exit Criteria
- `packages/web/out/` exists and can be served successfully both with and without a basePath.

---

## Phase 3 — Move Data Into `public/` and Add Typed Loaders (M2) (2–4 hours)

Objective: make all content available statically and accessible in the browser via `fetch()`.

### 3.1 Copy the JSON into `packages/web/public/data/`
- Copy:
  - `data/flashcards-combined.json` → `packages/web/public/data/flashcards.json`
  - `packages/api/prisma/seed-data/testbank.json` → `packages/web/public/data/questions.json`
- Verify:
  - `ls packages/web/public/data` shows both files.

### 3.2 Create a basePath-aware fetch helper
Create `packages/web/src/lib/staticFetch.ts`:
- Reads `process.env.NEXT_PUBLIC_BASE_PATH || ""`
- Prepends basePath to the URL for `fetch()`
- Adds simple caching in-memory for repeated calls
- Throws a descriptive error on non-200 or invalid JSON

### 3.3 Create a flashcards loader
Create `packages/web/src/lib/flashcards.ts`:
- Define types:
  - `FlashcardsFile` = array of sections `{ meta, flashcards }`
  - Flattened card type:
    - `id: string` (stable string, e.g., `${ecoReference}-${flashcard.id}`)
    - `front`, `back`, `category`
    - `domain`, `task`, `ecoReference`
- Implement:
  - `loadFlashcards(): Promise<FlashcardCard[]>`
  - `filterFlashcards(cards, { domain?, task? }): FlashcardCard[]`
- Validate:
  - Non-empty front/back; strip trailing `\\n`.
  - Keep original markdown (`**bold**`) if current renderer expects it.

### 3.4 Create a questions loader
Create `packages/web/src/lib/questions.ts`:
- Map `questions.json` to a UI-friendly type:
  - `id`, `domain`, `task`, `questionText`
  - `answers: { text: string; isCorrect: boolean }[]`
  - `correctAnswerIndex: number`
  - `remediation: { coreLogic, pmiMindset, theTrap, sourceLink }`
- Implement:
  - `loadQuestions(): Promise<Question[]>`
  - `pickRandomQuestions(questions, count, filters): Question[]`

### 3.5 Confirm study content is fully local
Ensure study domain/task metadata uses:
- `packages/web/src/data/pmpExamContent.ts`
No API calls.

### Phase 3 Exit Criteria
- A minimal test page (or console) can `loadFlashcards()` and `loadQuestions()` in the browser without API.
- Loaders work under basePath.

---

## Phase 4 — Local Storage Data Model + Utilities (M2/M3 support) (2–4 hours)

Objective: replace database-backed progress with local-only progress.

### 4.1 Create storage wrapper
Create `packages/web/src/lib/storage.ts` with:
- `getJson<T>(key: string, fallback: T): T`
- `setJson<T>(key: string, value: T): void`
- `updateJson<T>(key: string, fallback: T, updater: (prev: T) => T): T`
- Use a prefix: `pmp_static_v1:` (versioned so future changes can migrate)

### 4.2 Define storage keys + shapes (versioned)
- `pmp_static_v1:flashcards:progress`
  - `{ [cardId: string]: { intervalDays: number; easiness: number; repetitions: number; dueDateISO: string; lastReviewedISO: string; lastRating: "again"|"hard"|"good"|"easy" } }`
- `pmp_static_v1:practice:history`
  - `{ attempts: Array<{ id: string; timestampISO: string; domain?: string; task?: string; questionCount: number; correctCount: number; scorePercent: number }> }`
- `pmp_static_v1:streak`
  - `{ current: number; longest: number; lastActiveISO: string | null }`

### 4.3 Add spaced repetition algorithm (simple + deterministic)
Pick one:
- Option A (simplest): Leitner boxes (3–5 boxes with fixed intervals).
- Option B (SM-2-ish): update easiness + interval based on rating.

Recommended for junior dev: Leitner first (fewer bugs).
- Box intervals example:
  - Box1: 1 day
  - Box2: 3 days
  - Box3: 7 days
  - Box4: 14 days
  - Box5: 30 days
- Rating rules:
  - again → box 1
  - hard/good → stay or +1
  - easy → +2 (cap at box5)

Create `packages/web/src/lib/spaced.ts`:
- `nextReview({ currentBox }, rating) -> { nextBox, dueDateISO }`

### 4.4 Create derived stats helpers (for dashboards)
Create `packages/web/src/lib/stats.ts`:
- `getFlashcardStats(progress)` → `{ totalSeen, dueTodayCount, masteredCount }`
- `getPracticeStats(history)` → `{ totalAttempts, avgScore, lastScore, bestScore }`
- `updateStreak(streak, nowISO)` → updated streak

### Phase 4 Exit Criteria
- You can write a tiny demo script (or component) that:
  - updates a card progress,
  - increments streak,
  - reads stats back after reload.

---

## Phase 5 — Rewrite Routes (M3–M5) (6–12 hours)

General rule: **delete server-session routes** and replace them with static “play” routes driven by query params + local state.

### 5.1 Update route map (delete these first so export stops failing)
Delete these dynamic/session routes (they cannot export cleanly and rely on API):
- `packages/web/src/app/flashcards/session/[sessionId]/`
- `packages/web/src/app/practice/session/[sessionId]/`
- `packages/web/src/app/practice/mock/session/[sessionId]/`
- `packages/web/src/app/practice/flagged/` (or rebuild as local “flagged” later)
- `packages/web/src/app/flashcards/create/` (custom creation needs backend; optional later as local-only)
- `packages/web/src/app/study/[taskId]/` (this uses API study guides; either delete or rebuild from static markdown later)

After deleting, run `npm run build` (Phase 2) to ensure export no longer fails on dynamic segments.

### 5.2 Landing page (`/`)
Edit `packages/web/src/app/page.tsx`:
- Replace auth CTAs:
  - “Start Free Trial” → “Start Studying” linking to `/study`
  - “Sign In” → remove or replace with “Support” linking to `/donate`
- Replace pricing cards with:
  - A “Free forever” section
  - A donation/support section with buttons
- Acceptance:
  - No `/auth/*` links remain.

### 5.3 Donate page (`/donate`)
Add `packages/web/src/app/donate/page.tsx`:
- Content:
  - Mission statement
  - Donation buttons with external links
  - Optional: “How funds are used” list
- Acceptance:
  - Works with basePath and external links open safely (`target="_blank" rel="noopener noreferrer"`).

### 5.4 Study page (`/study`)
Edit `packages/web/src/app/study/page.tsx`:
- Remove:
  - `useRequireAuth`
  - API calls (`/domains`, `/domains/:id`, `/flashcards/sessions`, `/practice/sessions`)
- Replace:
  - Domain list from `PMP_EXAM_CONTENT`
  - “Start Flashcards” → link to `/flashcards/play?domain=<id>&task=<id>`
  - “Start Practice” → link to `/practice/play?domain=<id>&task=<id>`
- Acceptance:
  - Works offline (no API), still shows tasks/enablers.

### 5.5 Flashcards overview (`/flashcards`)
Edit `packages/web/src/app/flashcards/page.tsx`:
- Remove auth + API stats fetch.
- Replace stats panel with derived stats from local progress (`getFlashcardStats()`).
- Replace “start session” buttons to links:
  - `/flashcards/play?mode=review`
  - `/flashcards/play?mode=all`
  - `/flashcards/play?mode=focused&domain=...&task=...`

### 5.6 Flashcards play (`/flashcards/play`)
Add `packages/web/src/app/flashcards/play/page.tsx`:
- Load cards:
  - `const cards = await loadFlashcards()`
  - Apply filters from query params
  - For `mode=review`, select due cards first (based on progress `dueDateISO`)
- Session logic:
  - Keep a local array `sessionCardIds` + `currentIndex`
  - Flip UI + rating buttons (again/hard/good/easy)
  - On rate:
    - update progress in storage (spaced repetition)
    - update streak
    - move to next card
- Completion:
  - show “session complete” screen with links back to `/flashcards` and `/dashboard`.
- Acceptance:
  - Works after page refresh (progress persists).

### 5.7 Practice overview (`/practice`)
Edit `packages/web/src/app/practice/page.tsx`:
- Remove auth + API usage.
- Convert to a static “start a quiz” UI that links to `/practice/play`.
- Optional: include a “continue last quiz” if you store last session state.

### 5.8 Practice play (`/practice/play`)
Add `packages/web/src/app/practice/play/page.tsx`:
- Load questions:
  - `const questions = await loadQuestions()`
  - Apply filters (domain/task)
  - Randomly select `N` questions
- Quiz UI:
  - Show question text + multiple choice answers
  - Track selected answer per question
  - At end: calculate correct count
  - Write attempt into `practice:history`
  - Update streak
- Review UI:
  - After submitting, show remediation details from `remediation` for each question
- Acceptance:
  - No API calls; works purely client-side.

### 5.9 Dashboard (`/dashboard`)
Edit `packages/web/src/app/dashboard/page.tsx`:
- Remove auth + API call.
- Replace:
  - Welcome header (no user name, or use “Welcome!”)
  - Stats grid using derived stats helpers
  - Recent activity can be built from practice history + flashcard reviews timestamps
- Acceptance:
  - Dashboard renders with empty storage (shows 0s) and updates after using flashcards/practice.

### 5.10 Formulas (`/formulas`)
Pick a static approach:
- Option A (fast): reference-only list (no calculator).
- Option B: build a client-only calculator with static formula definitions.
If Option A:
- Replace `packages/web/src/app/formulas/page.tsx` with a static list of formulas (hardcoded or JSON).

### Phase 5 Exit Criteria
- `next export` succeeds (no dynamic segments left).
- `/study`, `/flashcards`, `/flashcards/play`, `/practice`, `/practice/play`, `/dashboard`, `/donate` all work without API.

---

## Phase 6 — Remove Backend Package(s) and Unused Dependencies (2–4 hours)

Objective: delete dead code and shrink the dependency surface.

### 6.1 Remove API workspaces (optional but recommended)
- Update root `package.json`:
  - Remove `packages/api` from `workspaces` (or leave but stop referencing it).
  - Remove scripts: `dev:api`, `build:api`, `test:api`, `db:*` if no longer used.
- If deleting API:
  - Remove `packages/api/` and any infra configs (`render.yaml`, `infrastructure/`) that only support the API.

### 6.2 Remove web dependencies no longer used
Edit `packages/web/package.json` and remove:
- `next-pwa` (if not reintroduced)
- Stripe-related dependencies (if any are present)
- OTel web instrumentation if not used
Then run `npm install` at repo root to update lockfile.

### 6.3 Remove dead tests and E2E
- Delete tests that mock `useRequireAuth` or call API clients.
- Decide whether to keep Playwright; if kept, rewrite tests to navigate public flows (study → flashcards → practice).

### Phase 6 Exit Criteria
- `npm run build:web` works without API package.
- `npm run test:web` passes (or tests have been updated to match new behavior).

---

## Phase 7 — QA Checklist (Run Every Time Before Deploy)

### Build/Export
- From repo root:
  - `npm run build:web`
- From `packages/web`:
  - `npm run serve:static`

### Functional
- Landing loads and has no login/checkout links.
- `/study` loads domains/tasks immediately.
- `/flashcards/play` works with and without query params.
- `/practice/play` quiz works; results persist after refresh.
- `/dashboard` shows derived stats; empty state is sensible.
- `/donate` links open correctly.

### BasePath (GitHub Pages simulation)
- Build with basePath and re-test the above pages.

---

## Phase 8 — GitHub Pages Deployment (M7) (1–3 hours)

Objective: automated deploy on push to `main`.

### 8.1 Add workflow
Create `.github/workflows/gh-pages.yml` with:
- Checkout
- Node setup (18+)
- Install deps (`npm ci`)
- Build web with basePath env set (project pages only)
- Deploy `packages/web/out` to `gh-pages` branch

### 8.2 Configure repo settings
- Settings → Pages → Source = `gh-pages` branch, `/ (root)`.
- If using custom domain:
  - Add `CNAME` file to `public/` and configure DNS.

### 8.3 Live smoke test
- Verify the live URL loads and that all paths work with the subpath.

---

## Phase 9 — Post-Migration Documentation (1–2 hours)
- Update `README.md`:
  - What the site is (static, free)
  - How to build: `npm run build:web`
  - How to serve locally: `npm run serve:static -w @pmp/web`
  - How to set basePath for GH Pages
- Remove/replace any docs referencing subscriptions, DB, or API deployment.

---

## Appendix A — Route Map (Old → New)
- `/auth/*` → removed
- `/checkout` → removed (replaced by `/donate`)
- `/team/*` → removed
- `/flashcards/session/[sessionId]` → `/flashcards/play`
- `/practice/session/[sessionId]` → `/practice/play`
- `/practice/mock/session/[sessionId]` → (optional) `/practice/play?mode=mock`
- `/study/[taskId]` → either removed or later rebuilt as static markdown pages

## Appendix B — Data Mapping Notes
Flashcards (`public/data/flashcards.json`):
- File shape: array of `{ meta, flashcards }`
- `meta.domain` and `meta.task` are strings; use these for filtering labels.
Questions (`public/data/questions.json`):
- File shape: object with `{ questions: [] }`
- Use `answers[]` for options; identify correct via `isCorrect` or `correctAnswerIndex`.

## Deliverables Checklist
- [ ] Middleware/auth/team/checkout removed
- [ ] Export build passes with and without basePath
- [ ] `public/data/flashcards.json` + `public/data/questions.json` present
- [ ] Loaders (`staticFetch`, `flashcards`, `questions`) implemented and tested
- [ ] Storage + spaced repetition + stats helpers implemented
- [ ] New routes: `/donate`, `/flashcards/play`, `/practice/play`
- [ ] Dashboard uses local stats
- [ ] GH Pages workflow deployed and verified

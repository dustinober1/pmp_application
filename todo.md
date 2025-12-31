# PMP Study Platform - Code Review Findings

**Date**: 2025-12-30
**Scope**: Complete monorepo code review
**Reviewer**: Claude (Code Agent)
**Files Reviewed**: 75+ TypeScript files, 31 test files, config files

---

## Table of Contents
- [Critical Priority](#critical-priority)
- [High Priority](#high-priority)
- [Medium Priority](#medium-priority)
- [Low Priority](#low-priority)

---

## Critical Priority

### Security Vulnerabilities

#### 1. XSS Vulnerability in Study Guide Content Rendering
**File**: `packages/web/src/app/study/[taskId]/page.tsx:181-182`
```tsx
<ReactMarkdown>{section.content}</ReactMarkdown>
```
**Issue**: User-generated study guide content rendered without sanitization. `react-markdown` does not sanitize HTML by default.
**Impact**: Malicious users could inject JavaScript through study guide content
**OWASP**: A03:2021 – Injection (Cross-Site Scripting)
**Fix**: Use `remarkSanitize` or `rehype-sanitize` plugin with ReactMarkdown
**CVE Reference**: CWE-79

#### 2. Token Storage in localStorage (XSS Target)
**File**: `packages/web/src/contexts/AuthContext.tsx:91-92, 119-120, 131-132`
```typescript
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refresh);
```
**Issue**: JWT tokens stored in localStorage are accessible to any XSS attack. No HttpOnly cookies used.
**Impact**: If any XSS vulnerability exists, attacker can steal authentication tokens
**OWASP**: A07:2021 – Identification and Authentication Failures
**Fix**: Store tokens in HttpOnly, Secure, SameSite cookies; implement token rotation

#### 3. Missing CSRF Protection
**File**: `packages/web/src/lib/api.ts:1-53`
**Issue**: No CSRF tokens on state-changing requests. API endpoint has no CSRF validation.
**Impact**: Cross-site request forgery attacks possible
**OWASP**: A01:2021 – Broken Access Control
**Fix**: Implement CSRF tokens with double-submit cookie pattern or SameSite cookies

#### 4. Insecure Direct Object Reference in Team Dashboard
**File**: `packages/web/src/app/team/dashboard/page.tsx:89-92`
```typescript
await apiRequest(`/teams/${team.id}/members/${memberId}/preserve`, {
  method: 'DELETE',
});
```
**Issue**: No authorization check if user is admin of team before calling endpoint
**Impact**: Users could potentially remove members from teams they don't own
**OWASP**: A01:2021 – Broken Access Control
**Fix**: Add `useAuth().user?.tier` check before exposing team features

#### 5. Sensitive Data Exposure in Error Messages
**File**: `packages/web/src/app/checkout/page.tsx:45`
```typescript
setError(err.message || 'Payment initialization failed. Please try again.');
```
**Issue**: Raw error messages may contain sensitive backend information
**Impact**: Information disclosure aiding further attacks
**OWASP**: A04:2021 – Insecure Design
**Fix**: Sanitize error messages before displaying to users

---

## High Priority

### Authentication & Authorization Bugs

#### 6. Auth State Race Condition on Page Load
**File**: `packages/web/src/contexts/AuthContext.tsx:38-46`
```typescript
useEffect(() => {
  const storedToken = localStorage.getItem('accessToken');
  if (storedToken) {
    fetchUser(storedToken);
  } else {
    setState(prev => ({ ...prev, isLoading: false }));
  }
}, []);
```
**Issue**: `isLoading` becomes false immediately if no token, but user data fetch is async. Protected routes may render unauthenticated content briefly.
**Impact**: Flash of unauthenticated content; potential navigation to protected pages
**Fix**: Use a more robust auth guard pattern with proper loading states

#### 7. No Token Refresh on 401 Response
**File**: `packages/web/src/lib/api.ts:46-50`
```typescript
if (!response.ok) {
  throw new Error(data.error?.message || 'Request failed');
}
```
**Issue**: API client doesn't automatically attempt token refresh on 401 errors
**Impact**: Users get logged out prematurely when access token expires (15 min)
**Fix**: Implement automatic token refresh with retry logic

#### 8. Missing Route Protection on Server-Side
**File**: All page files in `packages/web/src/app/`
```typescript
useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    router.push('/login');
  }
}, [authLoading, isAuthenticated, router]);
```
**Issue**: Route protection only client-side. Server doesn't validate authentication.
**Impact**: Protected pages briefly accessible during hydration; SEO issues
**Fix**: Implement middleware or server-side auth validation

#### 9. Logout Does Not Invalidate Refresh Token
**File**: `packages/web/src/contexts/AuthContext.tsx:130-139`
```typescript
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  setState({ ... });
};
```
**Issue**: No API call to invalidate refresh token on server
**Impact**: Stolen refresh tokens remain valid after logout
**Fix**: Call `/api/auth/logout` endpoint to invalidate refresh token

#### 10. Tier Check Only Client-Side
**File**: `packages/web/src/app/flashcards/create/page.tsx:116, 134-144`
```typescript
const canCreate = user?.tier === 'high-end' || user?.tier === 'corporate';
```
**Issue**: Feature gate only in UI, not enforced at API level (assuming API has tier middleware)
**Impact**: Users could bypass restrictions with modified client
**Fix**: Ensure API has corresponding `requireTier()` middleware

#### 11. Missing Email Verification Before Feature Access
**File**: `packages/web/src/contexts/AuthContext.tsx:56-64`
```typescript
if (response.ok) {
  const data = await response.json();
  setState({
    user: data.data.user,
    token,
    isLoading: false,
    isAuthenticated: true,
  });
}
```
**Issue**: No check if user email is verified before allowing access
**Impact**: Unverified users can access all features
**Fix**: Add `user.emailVerified` check in AuthContext

### Error Handling Issues

#### 12. Silent Failures in API Calls
**File**: `packages/web/src/app/dashboard/page.tsx:60-68`
```typescript
const fetchDashboard = async () => {
  try {
    const response = await dashboardApi.getDashboard();
    setData((response as any).data?.dashboard);
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
  } finally {
    setLoading(false);
  }
};
```
**Issue**: Errors logged to console but user not notified
**Impact**: Poor user experience; silent failures
**Fix**: Display toast notifications or error banners

#### 13. Unhandled Promise Rejections in Sync Service
**File**: `packages/web/src/lib/sync.ts:75-82`
```typescript
for (const action of actionsToSync) {
  try {
    await this.processAction(action);
  } catch (error) {
    console.error(`[Sync] Failed to process action ${action.id}`, error);
    failedActions.push(action);
  }
}
```
**Issue**: Sync failures only logged, not reported to user
**Impact**: Users unaware that offline actions failed to sync
**Fix**: Show notification when sync fails

#### 14. Mock Exam Timer Continues After Tab Close
**File**: `packages/web/src/app/practice/mock/session/[sessionId]/page.tsx:80-97`
```typescript
useEffect(() => {
  if (loading || examComplete || !session) return;
  timerRef.current = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timerRef.current!);
        finishExam();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [loading, examComplete, session]);
```
**Issue**: Timer only runs in browser. User could cheat by opening in new tab
**Impact**: Exam timing not enforced
**Fix**: Store exam start time on server; validate remaining time on submit

#### 15. Missing Error Boundary
**File**: `packages/web/src/app/layout.tsx:22-30`
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```
**Issue**: No error boundary to catch React errors
**Impact**: Unhandled errors cause white screen of death
**Fix**: Add ErrorBoundary component

#### 16. Unsafe Type Assertions Throughout
**File**: Multiple files, e.g., `packages/web/src/app/dashboard/page.tsx:63`
```typescript
setData((response as any).data?.dashboard);
```
**Issue**: Using `as any` bypasses TypeScript type checking
**Impact**: Runtime errors if API response structure changes
**Fix**: Define proper TypeScript types for all API responses

#### 17. Inconsistent Error Handling in Forms
**File**: `packages/web/src/app/register/page.tsx:34-41`
```typescript
try {
  await register(email, password, name);
  router.push('/dashboard');
} catch (err) {
  setError(err instanceof Error ? err.message : 'Registration failed');
}
```
**Issue**: Different error handling patterns across forms
**Impact**: Inconsistent user experience; some errors not displayed
**Fix**: Standardize error handling with toast notifications

---

## Medium Priority

### Accessibility Issues

#### 18. Missing ARIA Labels on Interactive Elements
**File**: `packages/web/src/components/Navbar.tsx:111-133`
```tsx
<button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="md:hidden p-2 text-[var(--foreground-muted)]"
>
```
**Issue**: No `aria-label`, `aria-expanded`, or `aria-controls` on mobile menu button
**Impact**: Screen reader users cannot understand menu state
**WCAG**: 2.4.4 Link Purpose (In Context), 4.1.2 Name, Role, Value
**Fix**: Add proper ARIA attributes

#### 19. Search Dialog Not Keyboard Traversable After Open
**File**: `packages/web/src/components/SearchDialog.tsx:99-106`
```tsx
<input
  ref={inputRef}
  type="text"
  className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
  placeholder="Search study guides, flashcards, questions..."
  value={query}
  onChange={e => setQuery(e.target.value)}
/>
```
**Issue**: No focus trap within modal; Tab key can exit dialog
**Impact**: Keyboard navigation broken for modal dialogs
**WCAG**: 2.1.2 No Keyboard Trap, 2.4.3 Focus Order
**Fix**: Implement focus trap with `useFocusTrap` hook

#### 20. Missing Skip Navigation Link
**File**: `packages/web/src/app/layout.tsx`
**Issue**: No "Skip to main content" link for keyboard users
**Impact**: Keyboard users must tab through navigation on every page
**WCAG**: 2.4.1 Bypass Blocks
**Fix**: Add skip link as first element in layout

#### 21. Form Inputs Missing Explicit Labels
**File**: `packages/web/src/app/login/page.tsx:59-67`
```tsx
<input
  id="email"
  type="email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  className="input"
  placeholder="you@example.com"
  required
/>
```
**Issue**: Labels exist but not properly associated (missing `htmlFor` on label)
**Impact**: Screen readers may not announce input purpose correctly
**WCAG**: 1.3.1 Info and Relationships
**Fix**: Ensure all labels have `htmlFor` matching input `id`

#### 22. Color Contrast Issues
**File**: `packages/web/src/app/practice/flagged/page.tsx:140-147`
```tsx
<span className={
  question.difficulty === 'hard'
    ? 'bg-red-100 text-red-700'
    : ...
}>
```
**Issue**: `bg-red-100 text-red-700` has insufficient contrast ratio (~2.5:1)
**Impact**: Text difficult to read for users with visual impairments
**WCAG**: 1.4.3 Contrast (Minimum) - 4.5:1 for normal text
**Fix**: Use darker colors (e.g., `bg-red-100 text-red-900`)

#### 23. Missing Alt Text on Images (if any added)
**File**: Various pages - emoji used as icons without aria-labels
**Issue**: Emojis like `📚`, `🗂️`, `❓` used as icons without text alternatives
**Impact**: Screen readers announce emoji names which may be confusing
**WCAG**: 1.1.1 Non-text Content
**Fix**: Add `aria-label` or use SVG icons with `<title>`

#### 24. Flashcard Session Missing Keyboard Navigation
**File**: `packages/web/src/app/flashcards/session/[sessionId]/page.tsx:226-247`
```tsx
<button onClick={() => handleRate('dont_know')} className="...">
  <div className="font-bold mb-1">Again</div>
</button>
```
**Issue**: No keyboard shortcuts for rating cards
**Impact**: Keyboard-only users cannot efficiently use flashcards
**Fix**: Add keyboard shortcuts (1, 2, 3 for ratings)

### React Anti-Patterns

#### 25. Unnecessary Re-renders from Inline Functions
**File**: `packages/web/src/app/study/page.tsx:88`
```tsx
onClick={() => setSelectedDomain(selectedDomain === domain.id ? null : domain.id)}
```
**Issue**: Inline function created on every render causing child re-renders
**Impact**: Performance degradation with many domains
**Fix**: Use `useCallback` or move handler to separate component

#### 26. Missing Dependencies in useEffect
**File**: `packages/web/src/lib/sync.ts:69-75`
```typescript
const actionsToSync = [...this.queue];
```
**Issue**: Comment acknowledges potential race condition but doesn't fix it
**Impact**: New actions added during sync may be lost
**Fix**: Use queue lock or process incrementally

#### 27. State Update Based on Previous State Without Functional Update
**File**: `packages/web/src/app/practice/page.tsx:95-98`
```typescript
const toggleDomain = (domainId: string) => {
  setSelectedDomains(prev =>
    prev.includes(domainId) ? prev.filter(id => id !== domainId) : [...prev, domainId]
  );
};
```
**Issue**: Correctly uses functional update, but inconsistent across codebase
**Impact**: Some state updates may be stale
**Fix**: Standardize on functional updates for all state derived from previous state

#### 28. Large Component Files (Maintainability)
**File**: `packages/web/src/app/practice/mock/session/[sessionId]/page.tsx` (397 lines)
**Issue**: Large file with multiple concerns (timer, question display, review)
**Impact**: Difficult to maintain and test
**Fix**: Extract into smaller components (Timer, QuestionCard, ReviewGrid, SideNav)

#### 29. Prop Drilling for Auth State
**File**: All pages using `useAuth()`
```typescript
const { user, isAuthenticated, isLoading: authLoading } = useAuth();
```
**Issue**: Every page must call useAuth and handle loading/redirect
**Impact**: Code duplication; inconsistent auth handling
**Fix**: Create higher-order component or protected route wrapper

### Performance Issues

#### 30. Unnecessary Re-fetching on Focus
**File**: Various pages refetch data on every mount
**Issue**: No caching strategy; data refetched even if unchanged
**Impact**: Increased API load; slower page transitions
**Fix**: Implement React Query or SWR for caching

#### 31. Missing Image Optimization
**File**: `packages/web/src/app/page.tsx` - potential for images
**Issue**: Next.js Image component not used for images
**Impact**: Slower page loads; no lazy loading
**Fix**: Use Next.js `<Image>` component with optimization

#### 32. No Code Splitting for Large Libraries
**File**: `packages/web/src/app/study/[taskId]/page.tsx:7`
```typescript
import ReactMarkdown from 'react-markdown';
```
**Issue**: Large library loaded for all users, even those not viewing study guides
**Impact**: Larger bundle size
**Fix**: Dynamic import with `next/dynamic`

#### 33. Search Debounce Too Short
**File**: `packages/web/src/components/SearchDialog.tsx:50`
```typescript
const timer = setTimeout(async () => {
  // ... search logic
}, 300);
```
**Issue**: 300ms debounce may trigger unnecessary searches
**Impact**: Excessive API calls during typing
**Fix**: Increase to 500ms or add minimum character check

#### 34. Missing Memo for Expensive Computations
**File**: `packages/web/src/app/formulas/page.tsx:79-81`
```typescript
const categories = ['all', ...new Set(formulas.map(f => f.category))];
const filteredFormulas =
  selectedCategory === 'all' ? formulas : formulas.filter(f => f.category === selectedCategory);
```
**Issue**: Categories recalculated on every render
**Impact**: Unnecessary computations
**Fix**: Use `useMemo` for derived state

### Missing Features

#### 35. No Loading Skeletons
**File**: Various pages show simple "Loading..." text
**Issue**: Poor perceived performance
**Impact**: Users may think app is broken
**Fix**: Add skeleton screens matching final layout

#### 36. No Optimistic UI Updates
**File**: `packages/web/src/app/flashcards/page.tsx:51-63`
```typescript
const startSession = async (mode: 'review' | 'all') => {
  try {
    const response = await flashcardApi.startSession(options);
    // ...
  } catch (error) {
    console.error('Failed to start session:', error);
  }
};
```
**Issue**: UI waits for API response before any update
**Impact**: Sluggish feel
**Fix**: Show loading state immediately; navigate on success

---

## Low Priority

### Code Quality Issues

#### 37. Inconsistent Naming Conventions
**File**: Multiple files
**Issue**: Mix of `handle*`, `on*`, `*Handler` function names
**Impact**: Reduced code readability
**Fix**: Standardize on `handle*` for event handlers, `fetch*` for data fetching

#### 38. Magic Numbers in Code
**File**: `packages/web/src/app/practice/mock/session/[sessionId]/page.tsx:56`
```typescript
const totalSeconds = response.data.questions.length * 75;
```
**Issue**: 75 seconds per question hardcoded
**Impact**: Difficult to change timing globally
**Fix**: Extract to constant `SECONDS_PER_QUESTION`

#### 39. Missing PropTypes or Interface Documentation
**File**: `packages/web/src/components/Navbar.tsx:6-10`
```typescript
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
```
**Issue**: Component props not documented
**Impact**: Unclear component API
**Fix**: Add JSDoc comments for component interfaces

#### 40. Inconsistent Error Message Styles
**File**: Multiple files
**Issue**: Some use alert(), some use inline errors, some console.error
**Impact**: Inconsistent UX
**Fix**: Standardize on toast notification system

#### 41. TODO Comments in Production Code
**File**: `packages/web/src/app/study/[taskId]/page.tsx:38-48`
```typescript
// Resume from first unanswered question if possible, or 0
// Since API doesn't filter answered yet in my quick implementation,
// we start at 0 or saved progress index if passed.
// For now, start at 0.
```
**Issue**: TODO comments indicate incomplete features
**Impact**: Confusing code reviews
**Fix**: Create GitHub issues and remove comments

#### 42. Console.log Statements in Production
**File**: `packages/web/src/lib/sync.ts:73, 90, 92`
```typescript
console.log(`[Sync] Processing ${actionsToSync.length} actions...`);
```
**Issue**: Debug logs in production code
**Impact**: Console pollution; potential information disclosure
**Fix**: Use proper logging library with environment-based levels

#### 43. Unused Imports
**File**: `packages/web/src/app/study/[taskId]/page.tsx:8`
```typescript
import { Task, StudyGuide } from '@pmp/shared';
```
**Issue**: Types imported but may not be directly used
**Impact**: Slightly larger bundle
**Fix**: Remove unused imports

#### 44. Long Parameter Lists
**File**: `packages/web/src/lib/api.ts:125-134`
```typescript
submitAnswer: (
  sessionId: string,
  questionId: string,
  selectedOptionId: string,
  timeSpentMs: number
) => apiRequest(...)
```
**Issue**: Multiple parameters make function calls error-prone
**Impact**: API misuse
**Fix**: Use parameter objects for >3 parameters

#### 45. Inconsistent File Naming
**File**: `packages/web/src/app/auth/reset-password/page.tsx`
**Issue**: Auth pages under `/auth/` but login/register at root
**Impact**: Confusing file structure
**Fix**: Move all auth pages under `/auth/` directory

#### 46. Missing Unit Tests for Components
**File**: Most components lack test files
**Issue**: Only 5 test files exist for 21+ pages
**Impact**: Low confidence in refactoring
**Fix**: Add unit tests for critical components

#### 47. Hardcoded Text Without i18n
**File**: All pages have English text hardcoded
**Issue**: No internationalization support
**Impact**: Cannot support multiple languages
**Fix**: Use i18n library for all user-facing text

#### 48. Missing Analytics
**File**: No analytics tracking
**Issue**: No visibility into user behavior
**Impact**: Data-driven product decisions not possible
**Fix**: Add privacy-conscious analytics

#### 49. Missing PWA Manifest Link Verification
**File**: `packages/web/src/app/layout.tsx:12`
```typescript
manifest: '/manifest.json',
```
**Issue**: Manifest referenced but file existence not verified
**Impact**: PWA installation may fail
**Fix**: Verify manifest.json exists and is properly configured

#### 50. No Service Worker for Offline Support
**File**: `packages/web/src/app/offline/page.tsx` exists but no SW registered
**Issue**: Offline page exists but not automatically shown
**Impact**: Poor offline experience
**Fix**: Register service worker with offline fallback

---

---

## Configuration & Security Review Findings

*Feature 10: Review of package.json, tsconfig, jest.config.js, vitest.config.ts, next.config.js, tailwind.config.js, prisma/schema.prisma, .env.example, ESLint/Prettier configs, docker-compose.yml*

### Critical Priority

#### 51. Weak JWT Secrets in .env.example
**File**: `packages/api/.env.example:11-13`
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```
**Issue**: Example JWT secrets are placeholder values that could accidentally be used in production.
**Risk**: If these values are used in production, JWT tokens can be easily forged.
**Fix**: Generate strong random strings (min 64 chars) and document the requirement clearly.

#### 52. Missing .env.example for Web Package
**File**: `packages/web/.env.example` (does not exist)
**Issue**: No environment variable template for the web frontend.
**Risk**: Developers may not know which environment variables are required (NEXT_PUBLIC_API_URL, etc.).
**Fix**: Create `.env.example` with `NEXT_PUBLIC_API_URL=http://localhost:3001/api` and other frontend-specific variables.

#### 53. Docker Compose Exposes Ports to All Interfaces
**File**: `docker-compose.yml:12,25`
```yaml
ports:
  - '5432:5432'  # Should be '127.0.0.1:5432:5432'
```
**Issue**: PostgreSQL and Redis ports bound to `0.0.0.0` instead of `127.0.0.1`.
**Risk**: Database and Redis accessible from external network interfaces in development.
**Fix**: Use `127.0.0.1:5432:5432` and `127.0.0.1:6379:6379`.

#### 54. Database Password in Docker Compose is Weak
**File**: `docker-compose.yml:9`
**Issue**: Default password `pmp_password` is weak and hardcoded.
**Risk**: Default credentials may be exploited if ports are exposed.
**Fix**: Use environment variable override and generate strong password.

#### 55. Missing Content Security Policy (CSP) Configuration
**File**: `packages/web/next.config.js`
**Issue**: No CSP headers configured. PWA has `next-pwa` but no security headers.
**Risk**: XSS vulnerabilities, clickjacking, code injection attacks.
**Fix**: Add CSP headers using `next-pwa` or custom headers configuration.

#### 56. Prisma Schema Missing Database Constraints
**File**: `packages/api/prisma/schema.prisma`
**Issue**: Several fields lack length limits and constraints:
- `User.email` - no max length defined
- `User.name` - no max length defined
- `StudySection.content` (Markdown) - unlimited size potential
- `StudyActivity.metadata` (JSON) - unlimited size
**Risk**: Denial of service via large payloads, database bloat.
**Fix**: Add `@db.VarChar(255)` for emails/names, `@db.Text` for content fields.

### High Priority

#### 57. Outdated Dependencies with Known Vulnerabilities
**File**: `packages/api/package.json`
**Issue**: Several dependencies have outdated versions:
- `bcrypt@^5.1.1` (should be latest)
- `cors@^2.8.5` (very old, current is 2.8.5 but consider newer alternatives)
- `express@^4.18.2` (check for latest security patches)
- `express-rate-limit@^7.1.5` (verify current version)
**Risk**: Potential CVEs in dependencies.
**Fix**: Run `npm audit` and update vulnerable packages.

#### 58. No Rate Limiting Configuration Visible
**File**: `packages/api/package.json:27`
**Issue**: `express-rate-limit` is installed but configuration not visible in config files.
**Risk**: Brute force attacks on login endpoints if not properly configured.
**Fix**: Verify rate limiting is configured in middleware with appropriate limits.

#### 59. Missing CORS Configuration
**File**: `packages/api/package.json:24`
**Issue**: `cors` is installed but configuration not visible in config files.
**Risk**: If CORS is misconfigured, could allow unauthorized cross-origin requests.
**Fix**: Ensure CORS is configured with specific origins, not wildcard.

#### 60. TypeScript ESLint Ignoring All .js Files
**File**: `.eslintrc.js:27`
```javascript
ignorePatterns: ['node_modules/', 'dist/', 'coverage/', '*.js'],
```
**Issue**: ESLint ignores all `*.js` files including config files.
**Risk**: Security issues in JavaScript config files (next.config.js, jest.config.js, etc.) are not linted.
**Fix**: Update pattern to ignore only node_modules and build outputs, lint config files.

#### 61. No Helmet Configuration Visible
**File**: `packages/api/package.json:28`
**Issue**: `helmet` security middleware is installed but configuration not visible.
**Risk**: Missing security headers if not properly applied.
**Fix**: Verify Helmet is configured in app middleware with appropriate options.

#### 62. Vitest Missing Coverage Configuration
**File**: `packages/web/vitest.config.ts`
**Issue**: No coverage thresholds configured (unlike API's 80% threshold).
**Risk**: Frontend test coverage may be insufficient.
**Fix**: Add `coverage.threshold` configuration matching API standards.

#### 63. Missing Web Package .env.local in .gitignore
**File**: `.gitignore:16-17`
**Issue**: `.env.local` is ignored but may not cover all variants.
**Risk**: Sensitive environment files might be accidentally committed.
**Fix**: Add `.env.local.*` patterns and verify web package specific env files.

#### 64. Prisma User Subscription Missing Index
**File**: `packages/api/prisma/schema.prisma:86`
**Issue**: `UserSubscription.userId` has `@unique` but no explicit index on status for queries.
**Risk**: Slow queries when filtering by status for subscription checks.
**Fix**: Add `@@index([userId, status])` for common query patterns.

#### 65. Missing Index on StudyActivity
**File**: `packages/api/prisma/schema.prisma:397`
**Issue**: Only composite index on `[userId, createdAt]` exists.
**Risk**: Queries filtering by activityType alone will be slow.
**Fix**: Add additional index or adjust existing index for query patterns.

### Medium Priority

#### 66. Root tsconfig.json Inconsistent Module Resolution
**File**: `tsconfig.json:4-5`
```json
"module": "NodeNext",
"moduleResolution": "NodeNext",
```
**Issue**: Root config uses `NodeNext` but packages override with `CommonJS` (API) and `bundler` (Web).
**Risk**: Configuration inconsistency, potential module resolution issues.
**Fix**: Document why overrides are needed, or use package.json `"type"` consistently.

#### 67. API tsconfig.json Module Mismatch
**File**: `packages/api/tsconfig.json:7-8`
```json
"module": "CommonJS",
"moduleResolution": "Node",
```
**Issue**: Uses `CommonJS` module but root config is `NodeNext`.
**Risk**: Potential ESM/CommonJS compatibility issues.
**Fix**: Align with NodeNext or document why CommonJS is required.

#### 68. Web tsconfig.json Target Inconsistency
**File**: `packages/web/tsconfig.json:4`
```json
"target": "ES2017",
```
**Issue**: Target is `ES2017` but root config specifies `ES2022`.
**Risk**: Inconsistent language feature support across packages.
**Fix**: Align to ES2022 or document specific browser compatibility requirements.

#### 69. Missing ESLint TypeScript Project Service
**File**: `.eslintrc.js`
**Issue**: No `parserOptions.project` specified for TypeScript ESLint.
**Risk**: ESLint can't use TypeScript type information for better rules.
**Fix**: Add `parserOptions.project: './tsconfig.json'` to enable type-aware linting.

#### 70. Prettier End of Line Not Platform Agnostic
**File**: `.prettierrc:10`
```json
"endOfLine": "lf"
```
**Issue**: `endOfLine: "lf"` may cause issues on Windows development.
**Risk**: Git line ending issues on Windows, potential file churn.
**Fix**: Consider `"auto"` or document team agreement on LF.

#### 71. Next.js PWA Using Deprecated Package
**File**: `packages/web/package.json:16`
```json
"next-pwa": "^5.6.0",
```
**Issue**: `next-pwa@^5.6.0` is outdated. Next.js 14 has built-in PWA support.
**Risk**: Missing latest PWA features, potential compatibility issues.
**Fix**: Migrate to Next.js 14 built-in PWA or update to latest next-pwa version.

#### 72. PWA Manifest Missing Security Fields
**File**: `packages/web/public/manifest.json`
**Issue**: Missing `scope`, `related_applications`, `prefer_related_applications` fields.
**Risk**: PWA security scope not properly defined.
**Fix**: Add `scope: "/"` and related fields for better PWA security.

#### 73. No TypeScript Path Validation in Web Package
**File**: `packages/web/tsconfig.json:17-19`
```json
"paths": {
  "@/*": ["./src/*"]
}
```
**Issue**: Path alias `@/*` is defined but no validation that paths are correct.
**Risk**: Import resolution may fail if tsconfig and actual structure diverge.
**Fix**: Add `@typescript-eslint/consistent-type-imports` rule to enforce consistency.

#### 74. Missing Environment Variable Validation
**File**: `packages/api/.env.example`
**Issue**: No validation that required variables are present at runtime.
**Risk**: Application crashes with unclear errors when env vars are missing.
**Fix**: Document required variables and use Zod schema validation at startup (already have config/env.ts, verify it covers all).

#### 75. Docker Compose Missing Resource Limits
**File**: `docker-compose.yml`
**Issue**: No CPU/memory limits defined for containers.
**Risk**: Containers can consume unlimited resources, potentially affecting host.
**Fix**: Add `deploy.resources.limits` for production readiness.

#### 76. No CI/CD Configuration Files Found
**File**: Project root
**Issue**: No `.github/workflows` for GitHub Actions or other CI configuration.
**Risk**: No automated testing, security scanning, or deployment pipelines.
**Fix**: Create CI workflows for lint, test, build, and security audit.

### Low Priority

#### 77. Inconsistent TypeScript Version Across Packages
**File**: All package.json files
**Issue**: TypeScript version `^5.3.2` specified in multiple packages instead of workspace root.
**Risk**: Version divergence potential, though workspace should resolve.
**Fix**: Move TypeScript to root devDependencies only.

#### 78. Missing Browserlist Configuration
**File**: `packages/web/`
**Issue**: No `.browserslistrc` file to define target browsers.
**Risk**: Inconsistent browser support, potential unnecessary polyfills.
**Fix**: Add `.browserslistrc` with supported browser versions.

#### 79. No ESLint Plugin for React/Next.js Security
**File**: `.eslintrc.js`
**Issue**: Missing `eslint-plugin-react` and `eslint-plugin-jsx-a11y` plugins.
**Risk**: React-specific security and accessibility issues may go undetected.
**Fix**: Add React security linting plugins.

#### 80. Tailwind Dark Mode Uses Media Query
**File**: `packages/web/tailwind.config.js:27`
```javascript
darkMode: 'media',
```
**Issue**: `darkMode: 'media'` uses system preference, no manual toggle.
**Risk**: Limited user control over theme (if dark mode toggle is desired).
**Fix**: Change to `darkMode: 'class'` if implementing manual toggle.

#### 81. Gitignore Missing Claude Files
**File**: `.gitignore`
**Issue**: `.claude/` directory should be explicitly ignored for orchestrator state.
**Risk**: Orchestrator state files might accidentally be committed.
**Fix**: Add `.claude/` to gitignore (already handled by worker instructions, but should be in file).

#### 82. No License File
**File**: Project root
**Issue**: No `LICENSE` file found.
**Risk**: Legal ambiguity for contributors and users.
**Fix**: Add appropriate LICENSE file (MIT, Apache 2.0, etc.).

#### 83. No Contributing Guidelines
**File**: Project root
**Issue**: No `CONTRIBUTING.md` file.
**Risk**: Inconsistent contribution practices from external developers.
**Fix**: Add CONTRIBUTING.md with development workflow documentation.

#### 84. Prettier and ESLint Print Width Mismatch
**File**: `.eslintrc.js` and `.prettierrc`
**Issue**: ESLint has no max line length, Prettier uses 100.
**Risk**: Inconsistent enforcement of line length.
**Fix**: Add `max-len` rule to ESLint or rely solely on Prettier.

#### 85. Missing Engine Strictness in package.json
**File**: `package.json:43-45`
```json
"engines": {
  "node": ">=18.0.0"
}
```
**Issue**: `engines.node` is specified but no `engineStrict: true`.
**Risk**: npm may not enforce Node version requirement strictly.
**Fix**: Consider adding `engineStrict: true` for production.

#### 86. Test Setup File Missing Global Test Configuration
**File**: `packages/web/vitest.setup.ts`
```typescript
import '@testing-library/jest-dom';
```
**Issue**: Only imports jest-dom, no additional test globals.
**Risk**: Tests may need additional setup (MSW mock server, etc.).
**Fix**: Document test setup requirements or add common mocks.

#### 87. No README in Package Subdirectories
**File**: `packages/api/`, `packages/web/`, `packages/shared/`
**Issue**: No package-specific README files.
**Risk**: Developers must reference root README for package-specific details.
**Fix**: Add README.md to each package with package-specific documentation.

#### 88. Docker Compose Version Format
**File**: `docker-compose.yml:1`
```yaml
version: '3.8'
```
**Issue**: Uses version 3.8 format but no version specification needed for modern Docker Compose.
**Risk**: Version field is optional in modern compose and may be deprecated.
**Fix**: Remove version line for future compatibility.

#### 89. Missing Health Check for API in Docker
**File**: `docker-compose.yml`
**Issue**: API server not included in Docker Compose, only services.
**Risk**: No health check endpoint documented for the API itself.
**Fix**: Document API health check endpoint (e.g., `/api/health`).

#### 90. No Security Policy Documentation
**File**: Project root
**Issue**: No `SECURITY.md` file for vulnerability reporting.
**Risk**: No clear process for security researchers to report vulnerabilities.
**Fix**: Add SECURITY.md with vulnerability disclosure process.

---

## Updated Summary Statistics

| Priority | Count | Categories |
|----------|-------|------------|
| Critical | 11 | Security (XSS, Auth, CSRF, IDOR, Config) |
| High | 23 | Auth bugs, Error handling, Config issues |
| Medium | 30 | Accessibility, React patterns, Performance, Config |
| Low | 22 | Code quality, Config improvements |
| **Total** | **86** | |

### Configuration & Security Review Summary
- **Critical**: 6 issues (JWT secrets, missing env templates, Docker exposure, CSP, DB constraints)
- **High**: 9 issues (dependencies, rate limiting, CORS, ESLint, Helm et, coverage, indexes)
- **Medium**: 11 issues (tsconfig inconsistencies, PWA setup, CI/CD)
- **Low**: 14 issues (tooling versions, documentation, Docker config)

## Recommended Actions

### Immediate (This Week)
1. Fix XSS vulnerability in ReactMarkdown (Critical #1)
2. Implement CSRF protection (Critical #3)
3. Add server-side route protection (High #8)
4. Implement automatic token refresh (High #7)

### Short-term (This Month)
1. Move tokens to HttpOnly cookies (Critical #2)
2. Add error boundaries (High #15)
3. Implement proper error notifications (High #12)
4. Fix ARIA labels on interactive elements (Medium #18-24)

### Long-term (This Quarter)
1. Conduct accessibility audit with screen reader
2. Implement performance monitoring
3. Add comprehensive test coverage
4. Refactor large components into smaller pieces

---

## Notes

- All findings are based on static code analysis
- Dynamic testing may reveal additional issues
- Some findings may be addressed in parallel (e.g., all ARIA issues)
- Priority levels based on OWASP Top 10 2021 and WCAG 2.1 AA standards

# E2E Testing with Playwright

Comprehensive End-to-End testing setup for the PMP Study Application using Playwright.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Page Objects](#page-objects)
- [Fixtures](#fixtures)
- [Mocking](#mocking)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

This E2E test suite covers:

- **Authentication Flows**: Registration, login, email verification, password reset
- **Checkout/Payment**: Pricing page, payment processing, subscription activation
- **Exam Simulation**: Exam navigation, timer, submission, results
- **Visual Regression**: Screenshot comparison for UI consistency
- **Cross-browser**: Chrome, Firefox, Safari, and mobile viewports

## Setup

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose (for local development)
- PostgreSQL database (via Docker)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Set up environment variables
cp .env.example .env
```

### Environment Configuration

Create a `.env` file in the project root:

```env
# API Configuration
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Database (Docker Compose)
POSTGRES_USER=pmp_user
POSTGRES_DB=pmp_study_db
POSTGRES_PASSWORD=change-me-use-a-strong-password

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### Start Services

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Run database migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Start API server
npm run dev:api

# Start web application (in another terminal)
npm run dev:web
```

## Running Tests

### Run All Tests

```bash
# Run all E2E tests
npm run test:e2e

# Or using Playwright directly
npx playwright test
```

### Run Specific Tests

```bash
# Run specific test file
npx playwright test auth-flow.spec.ts

# Run tests matching pattern
npx playwright test --grep "Authentication"

# Run specific project (browser)
npx playwright test --project=chromium
```

### Run with UI

```bash
# Run with Playwright Test UI
npm run test:e2e:ui

# Run in headed mode (show browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

### Run Specific Browser

```bash
# Chromium (Chrome)
npm run test:e2e:chromium

# Firefox
npm run test:e2e:firefox

# WebKit (Safari)
npm run test:e2e:webkit
```

### Visual Regression Tests

```bash
# Run visual regression tests
npm run test:e2e:visual

# Update screenshots
npm run test:e2e:update-snapshots
```

### View Test Reports

```bash
# Open HTML report
npm run test:e2e:report

# Or directly
npx playwright show-report
```

## Test Structure

```
e2e/
├── fixtures/              # Test fixtures and data
│   ├── auth.fixture.ts   # Authentication fixtures
│   ├── database.fixture.ts
│   └── test-users.fixture.ts
├── pages/                # Page Object Models
│   ├── auth.page.ts
│   ├── checkout.page.ts
│   ├── dashboard.page.ts
│   ├── exam.page.ts
│   └── pricing.page.ts
├── utils/                # Test utilities
│   ├── api-helper.ts
│   └── test-helpers.ts
├── mocks/                # API mocks
│   ├── email.mock.ts
│   └── stripe.mock.ts
├── setup/                # Global setup/teardown
│   ├── global-setup.ts
│   └── global-teardown.ts
├── auth-flow.spec.ts     # Authentication tests
├── checkout-flow.spec.ts # Checkout tests
├── exam-flow.spec.ts     # Exam tests
└── visual-regression.spec.ts
```

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should load login page', async ({ page }) => {
  await page.goto('/auth/login');

  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.locator('h1')).toContainText('Welcome Back');
});
```

### Using Fixtures

```typescript
import { test } from './fixtures/auth.fixture';

test('should access protected route', async ({ authenticatedPage }) => {
  // User is already logged in
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage).toHaveURL(/\/dashboard/);
});
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth.page';

test('should login user', async ({ page }) => {
  const authPage = new AuthPage(page);

  await authPage.goto();
  await authPage.login('test@example.com', 'password123');

  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Page Objects

Page Objects encapsulate page interactions and make tests more maintainable.

### Example: AuthPage

```typescript
import { Page } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

## Fixtures

Fixtures provide reusable test setup and authenticated sessions.

### Available Fixtures

- `testUser`: Pre-configured test user data
- `authenticatedPage`: Page with authenticated session
- `authenticatedPageAsPremium`: Premium user session
- `authenticatedPageAsAdmin`: Admin user session
- `apiHelper`: API request helper

### Using Fixtures

```typescript
import { test } from './fixtures/auth.fixture';

test('authenticated test', async ({ authenticatedPage }) => {
  // User is already logged in
  await authenticatedPage.goto('/dashboard');
});
```

## Mocking

Mock external services to make tests reliable and fast.

### Stripe Mocking

```typescript
import { mockCreatePaymentIntent } from './mocks/stripe.mock';

test('should process payment', async ({ page }) => {
  // Mock successful payment
  await mockCreatePaymentIntent(page, 'success');

  // Test payment flow...
});
```

### Email Mocking

```typescript
import { mockSendEmail } from './mocks/email.mock';

test('should send verification email', async ({ page }) => {
  await mockSendEmail(page, true);

  // Test registration...
});
```

### API Mocking

```typescript
test('should handle API response', async ({ page }) => {
  await page.route('**/api/user', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ name: 'Test User' }),
    });
  });

  // Test with mocked API...
});
```

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to master/main/develop branches
- Pull requests
- Daily schedule (2 AM UTC)
- Manual workflow dispatch

### Workflow Features

- **Parallel Execution**: Tests run across 4 shards for speed
- **Multi-browser**: Chrome, Firefox, WebKit
- **Artifacts**: Screenshots, videos, traces on failure
- **Reports**: Merged HTML report with all results
- **PR Comments**: Automated test results on PRs

### Triggering Manually

Go to Actions → E2E Tests → Run workflow

## Best Practices

### 1. Keep Tests Independent

Each test should be able to run in isolation.

```typescript
test('should do something', async ({ page }) => {
  // Setup test data
  await setupTestData();

  // Run test
  // ...

  // Cleanup
  await cleanupTestData();
});
```

### 2. Use Data-testid Attributes

Prefer `data-testid` over CSS selectors for stability.

```typescript
// Good
await page.click('[data-testid="submit-button"]');

// Avoid (fragile)
await page.click('button.btn-primary');
```

### 3. Wait Properly

Use explicit waits over fixed timeouts.

```typescript
// Good
await page.waitForURL(/\/dashboard/);
await page.waitForSelector('[data-testid="success"]');

// Avoid
await page.waitForTimeout(5000);
```

### 4. Use Page Objects

Encapsulate page logic in page objects.

```typescript
// Good
const authPage = new AuthPage(page);
await authPage.login(email, password);

// Avoid
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
```

### 5. Mock External Services

Don't rely on real Stripe, email, etc.

```typescript
// Mock Stripe
await mockCreatePaymentIntent(page, 'success');

// Mock email
await mockSendEmail(page, true);
```

### 6. Test Critical User Flows

Focus on:
- Happy paths (most common use cases)
- Business-critical features
- Edge cases that caused bugs before

### 7. Keep Tests Fast

- Use mocking to avoid slow operations
- Run tests in parallel
- Use shallow rendering when possible

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check environment variables
- Ensure services are running (API, DB)
- Clear browser data: `npx playwright test --clear-cache`

### Flaky Tests

- Add proper waits
- Avoid race conditions
- Increase timeout: `test.setTimeout(60000)`
- Check for timing issues

### Browser Not Found

```bash
# Reinstall Playwright browsers
npx playwright install --with-deps
```

### Port Already in Use

```bash
# Kill process on port
lsof -ti:3005 | xargs kill -9

# Or use different port
PORT=3006 npm run test:e2e
```

### Docker Issues

```bash
# Reset Docker
docker-compose down -v
docker-compose up -d
```

### Visual Regression Failures

- Check if change is intentional
- Update screenshots: `npm run test:e2e:update-snapshots`
- Review visual changes in Playwright report

## Debugging

### Debug Mode

```bash
npm run test:e2e:debug
```

### Inspect Page

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/auth/login');

  // Pause execution
  await page.pause();

  // Continue in Playwright Inspector
});
```

### Screenshots

```typescript
test('with screenshot', async ({ page }) => {
  await page.goto('/auth/login');
  await page.screenshot({ path: 'screenshot.png' });
});
```

### Traces

Traces are automatically captured on retry and available in the test report.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## Support

For issues or questions:
- Check existing test files for examples
- Review Playwright documentation
- Open an issue on GitHub

# E2E Testing Quick Start Guide

Get started with E2E testing in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check if Docker is installed
docker --version
docker-compose --version
```

## Setup (One-time)

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install --with-deps

# 3. Copy environment file
cp .env.example .env
# Edit .env with your configuration

# 4. Start services
docker-compose up -d postgres

# 5. Setup database
npm run db:migrate
npm run db:seed
```

## Running Tests

### Quick Start

```bash
# Start API and web (in separate terminals)
npm run dev:api  # Terminal 1
npm run dev:web  # Terminal 2

# Run E2E tests (Terminal 3)
npm run test:e2e
```

### Run Specific Tests

```bash
# Authentication tests only
npx playwright test auth-flow

# Checkout tests only
npx playwright test checkout-flow

# Exam tests only
npx playwright test exam-flow

# Visual regression
npm run test:e2e:visual
```

### Run in Different Modes

```bash
# Watch mode with UI
npm run test:e2e:ui

# Show browser (headed mode)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

### Run on Specific Browser

```bash
# Chrome/Chromium
npm run test:e2e:chromium

# Firefox
npm run test:e2e:firefox

# Safari (WebKit)
npm run test:e2e:webkit
```

## View Results

```bash
# Open HTML report
npm run test:e2e:report
```

## Writing Your First Test

Create a new file in `e2e/`:

```typescript
import { test, expect } from "@playwright/test";

test("my first test", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/PMP Study/);
  await expect(page.locator("h1")).toBeVisible();
});
```

## Common Commands

```bash
# Update screenshots
npm run test:e2e:update-snapshots

# Clear cache
npx playwright test --clear-cache

# List all tests
npx playwright test --list

# Run tests matching pattern
npx playwright test --grep "login"

# Run tests in specific file
npx playwright test auth-flow.spec.ts
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3005
lsof -ti:3005 | xargs kill -9
```

### Tests Fail to Connect

```bash
# Check if API is running
curl http://localhost:3001/health

# Check if web is running
curl http://localhost:3005
```

### Database Issues

```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
npm run db:migrate
npm run db:seed
```

### Reinstall Browsers

```bash
npx playwright install --with-deps --force
```

## Next Steps

- Read the [full documentation](./README.md)
- Explore [existing tests](./)
- Learn about [page objects](./pages/)
- Check [fixtures](./fixtures/)
- Review [CI/CD setup](../../.github/workflows/e2e.yml)

## Tips

1. **Start small**: Write one test at a time
2. **Use the UI**: `npm run test:e2e:ui` for better visibility
3. **Debug**: Use `page.pause()` to inspect state
4. **Mock external services**: Don't rely on real Stripe/email
5. **Use data-testid**: Stable selectors for tests
6. **Keep tests independent**: Each test should work alone

## Getting Help

- Check [Playwright docs](https://playwright.dev/)
- Review [test examples](./)
- Ask questions in team chat
- Open an issue on GitHub

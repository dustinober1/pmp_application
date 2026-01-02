import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 *
 * Tests for visual consistency across the application
 * Uses Playwright's screenshot comparison functionality
 */

test.describe('Visual Regression Tests', () => {
  test.describe('Authentication Pages', () => {
    test('should match login page screenshot', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match register page screenshot', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('register-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match forgot password page screenshot', async ({ page }) => {
      await page.goto('/auth/forgot-password');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('forgot-password-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Dashboard', () => {
    test('should match dashboard page screenshot', async ({ page }) => {
      // Mock authentication
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Note: This test would require authenticated state
      test.skip(true, 'Requires authenticated session setup');

      await expect(page).toHaveScreenshot('dashboard-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Pricing Page', () => {
    test('should match pricing page with monthly billing', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('pricing-monthly.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match pricing page with annual billing', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');

      // Switch to annual
      await page.click('button:has-text("Annual")');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('pricing-annual.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match pricing card hover states', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');

      // Hover over high-end tier
      const highTierCard = page.locator('[data-testid="pricing-card-high"]');
      await highTierCard.hover();

      await expect(page).toHaveScreenshot('pricing-card-hover.png', {
        clip: await highTierCard.boundingBox(),
        animations: 'disabled',
      });
    });
  });

  test.describe('Study Pages', () => {
    test('should match study materials page screenshot', async ({ page }) => {
      await page.goto('/study');

      // Note: Requires authentication
      test.skip(true, 'Requires authenticated session setup');

      await expect(page).toHaveScreenshot('study-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match flashcards page screenshot', async ({ page }) => {
      await page.goto('/flashcards');

      test.skip(true, 'Requires authenticated session setup');

      await expect(page).toHaveScreenshot('flashcards-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match practice exam page screenshot', async ({ page }) => {
      await page.goto('/practice');

      test.skip(true, 'Requires authenticated session setup');

      await expect(page).toHaveScreenshot('practice-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Checkout Flow', () => {
    test('should match checkout page screenshot', async ({ page }) => {
      await page.goto('/checkout');

      test.skip(true, 'Requires authentication and cart setup');

      await expect(page).toHaveScreenshot('checkout-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match order confirmation screenshot', async ({ page }) => {
      await page.goto('/order-confirmation/test-order');

      test.skip(true, 'Requires completed order');

      await expect(page).toHaveScreenshot('order-confirmation.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Responsive Design', () => {
    test('should match mobile view for pricing page', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('pricing-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match tablet view for dashboard', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');

      test.skip(true, 'Requires authenticated session setup');

      await expect(page).toHaveScreenshot('dashboard-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should match desktop view (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('pricing-1920.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Components', () => {
    test('should match navigation bar appearance', async ({ page }) => {
      await page.goto('/');

      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();

      await expect(navbar).toHaveScreenshot('navbar.png', {
        animations: 'disabled',
      });
    });

    test('should match footer appearance', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      await expect(footer).toHaveScreenshot('footer.png', {
        animations: 'disabled',
      });
    });

    test('should match card component appearance', async ({ page }) => {
      await page.goto('/pricing');

      const card = page.locator('[data-testid="pricing-card-high"]').first();
      await expect(card).toBeVisible();

      await expect(card).toHaveScreenshot('pricing-card.png', {
        animations: 'disabled',
      });
    });
  });

  test.describe('Dark Mode (if applicable)', () => {
    test('should match dark mode appearance', async ({ page }) => {
      // Enable dark mode if application supports it
      await page.goto('/');

      // Toggle dark mode
      // await page.click('[data-testid="theme-toggle"]');

      test.skip(true, 'Dark mode not implemented yet');

      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
});

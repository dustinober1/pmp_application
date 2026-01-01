import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.describe('Pricing Page', () => {
    test('should display pricing page with all tiers', async ({ page }) => {
      await page.goto('/pricing');

      // Verify page title/header
      await expect(page.locator('h2')).toContainText('Pricing');
      await expect(page.locator('p').first()).toContainText('Invest in your PMP success');

      // Verify all three pricing tiers are displayed
      await expect(page.locator('text=Free Starter')).toBeVisible();
      await expect(page.locator('text=PMP Pro')).toBeVisible();
      await expect(page.locator('text=Corporate Team')).toBeVisible();

      // Verify "Most Popular" badge on Pro tier
      await expect(page.locator('text=Most Popular')).toBeVisible();
    });

    test('should display correct pricing for monthly billing', async ({ page }) => {
      await page.goto('/pricing');

      // Default is monthly billing
      await expect(page.locator('text=$0')).toBeVisible(); // Free tier
      await expect(page.locator('text=$29')).toBeVisible(); // Pro tier
      await expect(page.locator('text=$99')).toBeVisible(); // Corporate tier
    });

    test('should toggle to annual billing and update prices', async ({ page }) => {
      await page.goto('/pricing');

      // Click annual billing toggle
      await page.click('button:has-text("Annual")');

      // Verify annual prices
      await expect(page.locator('text=$0')).toBeVisible(); // Free tier stays $0
      await expect(page.locator('text=$290')).toBeVisible(); // Pro tier annual
      await expect(page.locator('text=$990')).toBeVisible(); // Corporate tier annual
    });

    test('should switch between monthly and annual billing', async ({ page }) => {
      await page.goto('/pricing');

      // Check prices are monthly
      await expect(page.locator('text=/mo')).toHaveCount(3); // 3 tiers with /mo

      // Click annual
      await page.click('button:has-text("Annual")');

      // Verify annual prices displayed
      await expect(page.locator('text=/yr')).toHaveCount(3); // 3 tiers with /yr

      // Click back to monthly
      await page.click('button:has-text("Monthly")');

      // Verify monthly prices are back
      await expect(page.locator('text=/mo')).toHaveCount(3);
    });
  });
});

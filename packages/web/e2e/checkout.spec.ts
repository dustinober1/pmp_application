import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.describe('Pricing Page', () => {
    test('should display pricing page with all tiers', async ({ page }) => {
      await page.goto('/pricing');

      // Verify page title/header
      await expect(page.locator('h2')).toContainText('Pricing');
      await expect(page.locator('p')).toContainText('Invest in your PMP success');

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

    test('should navigate to checkout when clicking Pro tier upgrade', async ({ page }) => {
      await page.goto('/pricing');

      // Click on Pro tier upgrade button
      await page.click('a:has-text("Upgrade to Pro")');

      // Verify navigation to checkout with correct tier
      await expect(page).toHaveURL(/\/checkout\?tier=high-end/);
    });

    test('should navigate to checkout when clicking Corporate tier button', async ({ page }) => {
      await page.goto('/pricing');

      // Click on Corporate tier button
      await page.click('a:has-text("Start Team Plan")');

      // Verify navigation to checkout with correct tier
      await expect(page).toHaveURL(/\/checkout\?tier=corporate/);
    });
  });

  test.describe('Checkout Page', () => {
    test('should display checkout page for Pro tier', async ({ page }) => {
      await page.goto('/checkout?tier=high-end');

      // Verify checkout form elements
      await expect(page.locator('h2')).toContainText('Complete your purchase');
      await expect(page.locator('text=Plan')).toBeVisible();
      await expect(page.locator('text=high end')).toBeVisible();
      await expect(page.locator('text=$29.00')).toBeVisible();
      await expect(page.locator('text=Total')).toBeVisible();
    });

    test('should display checkout page for Corporate tier', async ({ page }) => {
      await page.goto('/checkout?tier=corporate');

      // Verify checkout form with corporate pricing
      await expect(page.locator('h2')).toContainText('Complete your purchase');
      await expect(page.locator('text=corporate')).toBeVisible();
      await expect(page.locator('text=$99.00')).toBeVisible();
    });

    test('should display PayPal button', async ({ page }) => {
      await page.goto('/checkout?tier=high-end');

      // Verify PayPal button is present
      const paypalButton = page.locator('button:has-text("Pay")');
      await expect(paypalButton).toBeVisible();
      await expect(paypalButton).toBeEnabled();
    });

    test('should display terms of service notice', async ({ page }) => {
      await page.goto('/checkout?tier=high-end');

      // Verify legal text
      await expect(page.locator('text=Terms of Service')).toBeVisible();
    });

    test('should default to high-end tier when no tier specified', async ({ page }) => {
      await page.goto('/checkout');

      // Should default to high-end tier pricing
      await expect(page.locator('text=$29.00')).toBeVisible();
    });
  });

  test.describe('Payment Flow - Happy Path', () => {
    test('should complete full checkout flow from pricing to confirmation', async ({ page }) => {
      // Step 1: Navigate to pricing page
      await page.goto('/pricing');
      await expect(page.locator('h2')).toContainText('Pricing');

      // Step 2: Select Pro tier
      await page.click('a:has-text("Upgrade to Pro")');
      await expect(page).toHaveURL(/\/checkout\?tier=high-end/);

      // Step 3: Verify checkout page loaded
      await expect(page.locator('h2')).toContainText('Complete your purchase');
      await expect(page.locator('text=$29.00')).toBeVisible();

      // Step 4: Mock the API response for the upgrade
      await page.route('**/api/subscriptions/upgrade-tier', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, tier: 'high-end' }),
        });
      });

      // Step 5: Click PayPal button to complete checkout
      await page.click('button:has-text("Pay")');

      // Step 6: Verify redirect to dashboard with success param
      await expect(page).toHaveURL(/\/dashboard\?payment=success/);
    });

    test('should complete corporate tier checkout flow', async ({ page }) => {
      // Navigate directly to corporate checkout
      await page.goto('/checkout?tier=corporate');

      // Verify checkout page
      await expect(page.locator('text=corporate')).toBeVisible();
      await expect(page.locator('text=$99.00')).toBeVisible();

      // Mock the API response
      await page.route('**/api/subscriptions/upgrade-tier', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, tier: 'corporate' }),
        });
      });

      // Click PayPal button
      await page.click('button:has-text("Pay")');

      // Verify redirect
      await expect(page).toHaveURL(/\/dashboard\?payment=success/);
    });
  });

  test.describe('Payment Flow - Error Handling', () => {
    test('should display error message when payment fails', async ({ page }) => {
      await page.goto('/checkout?tier=high-end');

      // Mock API failure
      await page.route('**/api/subscriptions/upgrade-tier', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Payment failed' }),
        });
      });

      // Click PayPal button
      await page.click('button:has-text("Pay")');

      // Verify error message is displayed
      await expect(page.locator('text=Payment initialization failed')).toBeVisible();

      // Verify we're still on checkout page
      await expect(page).toHaveURL(/\/checkout/);
    });

    test('should show loading state during payment processing', async ({ page }) => {
      await page.goto('/checkout?tier=high-end');

      // Mock slow API response
      await page.route('**/api/subscriptions/upgrade-tier', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      // Click PayPal button
      await page.click('button:has-text("Pay")');

      // Button should be disabled during loading
      await expect(page.locator('button:has-text("Pay")')).toBeDisabled();

      // Wait for navigation to complete
      await expect(page).toHaveURL(/\/dashboard\?payment=success/, { timeout: 5000 });
    });
  });

  test.describe('Billing Period Toggle', () => {
    test('should switch between monthly and annual billing', async ({ page }) => {
      await page.goto('/pricing');

      // Verify monthly is selected by default - monthly button should have bg-primary-600
      const monthlyButton = page.locator('button:has-text("Monthly")');
      await expect(monthlyButton).toBeVisible();

      // Check prices are monthly
      await expect(page.locator('text=/mo')).toHaveCount(3); // 3 tiers with /mo

      // Click annual
      await page.click('button:has-text("Annual")');

      // Verify annual prices displayed
      await expect(page.locator('text=/yr')).toHaveCount(3); // 3 tiers with /yr
    });
  });
});

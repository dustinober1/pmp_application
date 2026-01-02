import { test, expect } from './fixtures/auth.fixture';
import { PricingPage } from './pages/pricing.page';
import { CheckoutPage } from './pages/checkout.page';
import { DashboardPage } from './pages/dashboard.page';
import { testUsers } from './fixtures/test-users.fixture';

/**
 * Checkout and Payment Flow Tests
 *
 * Tests the complete checkout process including:
 * - Pricing page navigation
 * - Tier selection
 * - Payment form submission
 * - Order confirmation
 * - Subscription activation
 */
test.describe('Checkout and Payment Flow', () => {
  let pricingPage: PricingPage;
  let checkoutPage: CheckoutPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    pricingPage = new PricingPage(page);
    checkoutPage = new CheckoutPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test.describe('Pricing Page', () => {
    test('should display all pricing tiers', async ({ page }) => {
      await pricingPage.goto();

      // Verify all tiers are visible
      expect(await pricingPage.isTierVisible('free')).toBeTruthy();
      expect(await pricingPage.isTierVisible('mid')).toBeTruthy();
      expect(await pricingPage.isTierVisible('high')).toBeTruthy();
      expect(await pricingPage.isTierVisible('corporate')).toBeTruthy();
    });

    test('should show monthly pricing by default', async ({ page }) => {
      await pricingPage.goto();

      const prices = await pricingPage.getAllPrices();

      // Verify monthly prices
      expect(prices.free).toContain('Free');
      expect(prices.mid).toContain('/mo');
      expect(prices.high).toContain('/mo');
      expect(prices.corporate).toContain('/mo');
    });

    test('should switch to annual pricing', async ({ page }) => {
      await pricingPage.goto();
      await pricingPage.selectAnnual();

      const prices = await pricingPage.getAllPrices();

      // Verify annual prices
      expect(prices.mid).toContain('/yr');
      expect(prices.high).toContain('/yr');
      expect(prices.corporate).toContain('/yr');
    });

    test('should toggle between monthly and annual', async ({ page }) => {
      await pricingPage.goto();

      // Get initial (monthly) prices
      const monthlyPrices = await pricingPage.getAllPrices();

      // Switch to annual
      await pricingPage.selectAnnual();
      const annualPrices = await pricingPage.getAllPrices();

      // Switch back to monthly
      await pricingPage.selectMonthly();
      const newMonthlyPrices = await pricingPage.getAllPrices();

      // Verify prices changed and then reverted
      expect(monthlyPrices.mid).not.toEqual(annualPrices.mid);
      expect(monthlyPrices.mid).toEqual(newMonthlyPrices.mid);
    });

    test('should show "Most Popular" badge on High-End tier', async ({ page }) => {
      await pricingPage.goto();

      const highTier = page.locator('[data-testid="pricing-card-high"]');
      await expect(highTier.locator('text=Most Popular')).toBeVisible();
    });
  });

  test.describe('Checkout Initiation', () => {
    test('should start checkout for tier', async ({ page }) => {
      await pricingPage.goto();
      await pricingPage.selectTier('high');

      // Should navigate to checkout
      await expect(page).toHaveURL(/\/checkout/);
    });

    test('should pass tier and billing to checkout', async ({ page }) => {
      await pricingPage.goto();
      await pricingPage.selectAnnual();
      await pricingPage.selectTier('mid');

      // Verify URL parameters or state
      await expect(page).toHaveURL(/\/checkout/);

      // Should show correct tier and billing in summary
      await expect(page.locator('text=Mid-Level')).toBeVisible();
      await expect(page.locator('text=Annual')).toBeVisible();
    });
  });

  test.describe('Payment Form', () => {
    test('should display payment form', async ({ page }) => {
      await checkoutPage.goto();

      // Verify form elements
      await expect(checkoutPage.cardNumberInput).toBeVisible();
      await expect(checkoutPage.cardExpiryInput).toBeVisible();
      await expect(checkoutPage.cardCvcInput).toBeVisible();
      await expect(checkoutPage.payButton).toBeVisible();
    });

    test('should validate card number', async ({ page }) => {
      await checkoutPage.goto();

      // Enter invalid card number
      await checkoutPage.fillPaymentDetails({
        cardNumber: '123',
        expiry: '12/25',
        cvc: '123',
      });

      await checkoutPage.payButton.click();

      // Should show validation error
      await expect(page.locator('text=/invalid card number/i')).toBeVisible();
    });

    test('should validate expiry date', async ({ page }) => {
      await checkoutPage.goto();

      // Enter past expiry
      await checkoutPage.fillPaymentDetails({
        cardNumber: '4242424242424242',
        expiry: '12/20', // Past date
        cvc: '123',
      });

      await checkoutPage.payButton.click();

      // Should show validation error
      await expect(page.locator('text=/invalid expiry/i')).toBeVisible();
    });

    test('should validate CVC', async ({ page }) => {
      await checkoutPage.goto();

      // Enter invalid CVC
      await checkoutPage.fillPaymentDetails({
        cardNumber: '4242424242424242',
        expiry: '12/25',
        cvc: '1',
      });

      await checkoutPage.payButton.click();

      // Should show validation error
      await expect(page.locator('text=/invalid cvc/i')).toBeVisible();
    });

    test('should show order summary', async ({ page }) => {
      await checkoutPage.goto();

      // Order summary should be visible
      await expect(checkoutPage.orderSummary).toBeVisible();
      await expect(checkoutPage.totalAmount).toBeVisible();
    });
  });

  test.describe('Payment Processing', () => {
    test('should process successful payment', async ({ authenticatedPage }) => {
      // Start checkout
      await authenticatedPage.goto('/pricing');
      await pricingPage.selectTier('high');

      // Mock Stripe success response
      await authenticatedPage.route('**/api/create-payment-intent', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            clientSecret: 'mock-client-secret',
          }),
        });
      });

      // Mock webhook
      await authenticatedPage.route('**/api/webhooks/stripe', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true }),
        });
      });

      // Fill payment form with Stripe test card
      await checkoutPage.fillPaymentDetails({
        cardNumber: '4242424242424242', // Stripe test card
        expiry: '12/25',
        cvc: '123',
      });

      await checkoutPage.submitPayment();
      await checkoutPage.waitForSuccess();

      // Should redirect to success page
      await expect(authenticatedPage).toHaveURL(/\/success|\/order-confirmation/);
      await expect(authenticatedPage.locator('text=/payment successful/i')).toBeVisible();
    });

    test('should handle payment failure', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/pricing');
      await pricingPage.selectTier('mid');

      // Mock Stripe failure
      await authenticatedPage.route('**/api/create-payment-intent', (route) => {
        route.fulfill({
          status: 402,
          body: JSON.stringify({
            error: { message: 'Your card was declined.' },
          }),
        });
      });

      await checkoutPage.fillPaymentDetails({
        cardNumber: '4000000000000002', // Stripe decline card
        expiry: '12/25',
        cvc: '123',
      });

      await checkoutPage.submitPayment();
      await checkoutPage.waitForError();

      // Should show error message
      await expect(authenticatedPage.locator('text=/card declined/i')).toBeVisible();
    });

    test('should retry payment after failure', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/pricing');
      await pricingPage.selectTier('high');

      // First attempt fails
      await authenticatedPage.route('**/api/create-payment-intent', (route) => {
        route.fulfill({
          status: 402,
          body: JSON.stringify({
            error: { message: 'Payment failed.' },
          }),
        });
      });

      await checkoutPage.fillPaymentDetails({
        cardNumber: '4000000000000002',
        expiry: '12/25',
        cvc: '123',
      });

      await checkoutPage.submitPayment();
      await checkoutPage.waitForError();

      // Retry with different card
      await authenticatedPage.route('**/api/create-payment-intent', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            clientSecret: 'mock-client-secret',
          }),
        });
      });

      await checkoutPage.fillPaymentDetails({
        cardNumber: '4242424242424242',
        expiry: '12/25',
        cvc: '123',
      });

      await checkoutPage.submitPayment();
      await checkoutPage.waitForSuccess();

      await expect(authenticatedPage).toHaveURL(/\/success/);
    });
  });

  test.describe('Order Confirmation', () => {
    test('should show order confirmation details', async ({ authenticatedPage }) => {
      // Assuming payment was successful
      await authenticatedPage.goto('/order-confirmation/123');

      await expect(authenticatedPage.locator('[data-testid="order-id"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="order-total"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="order-date"]')).toBeVisible();
    });

    test('should send confirmation email', async ({ authenticatedPage, apiHelper }) => {
      // This would verify email was sent
      test.skip(true, 'Requires email service verification');
    });
  });

  test.describe('Subscription Activation', () => {
    test('should activate subscription after successful payment', async ({ authenticatedPage }) => {
      // After successful payment
      await dashboardPage.goto();

      // Verify subscription tier is updated
      const tier = await dashboardPage.getSubscriptionTier();
      expect(tier.toLowerCase()).toContain('high-end');
    });

    test('should show subscription details in dashboard', async ({ authenticatedPage }) => {
      await dashboardPage.goto();

      await expect(authenticatedPage.locator('[data-testid="subscription-status"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="subscription-renewal"]')).toBeVisible();
    });
  });

  test.describe('Checkout Abandonment', () => {
    test('should allow cancellation of checkout', async ({ page }) => {
      await checkoutPage.goto();
      await checkoutPage.cancel();

      // Should redirect back to pricing or dashboard
      await expect(page).toHaveURL(/\/pricing|\/dashboard/);
    });

    test('should save checkout state for returning user', async ({ authenticatedPage }) => {
      // Start checkout
      await authenticatedPage.goto('/pricing');
      await pricingPage.selectTier('corporate');

      // Navigate away
      await authenticatedPage.goto('/dashboard');

      // Return to checkout
      await authenticatedPage.goto('/checkout');

      // Should have saved tier selection
      await expect(authenticatedPage.locator('text=Corporate Team')).toBeVisible();
    });
  });
});

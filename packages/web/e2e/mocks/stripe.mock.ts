/**
 * Stripe Payment Mock Utilities
 *
 * Provides mock responses for Stripe API calls in tests
 */

export const MOCK_STRIPE_RESPONSES = {
  // Payment Intent creation
  createPaymentIntent: {
    success: {
      id: 'pi_test_1234567890',
      status: 'requires_payment_method',
      client_secret: 'pi_test_secret_1234567890',
      amount: 1499,
      currency: 'usd',
    },
    error: {
      error: {
        message: 'Your card was declined.',
        type: 'card_error',
        code: 'card_declined',
      },
    },
  },

  // Payment Intent confirmation
  confirmPaymentIntent: {
    success: {
      id: 'pi_test_1234567890',
      status: 'succeeded',
      amount: 1499,
      currency: 'usd',
    },
  },

  // Webhook events
  webhookEvent: {
    payment_succeeded: {
      id: 'evt_test_1234567890',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_1234567890',
          status: 'succeeded',
          amount: 1499,
        },
      },
    },
    payment_failed: {
      id: 'evt_test_failed',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_test_failed',
          status: 'requires_payment_method',
          last_payment_error: {
            message: 'Your card was declined.',
          },
        },
      },
    },
  },

  // Customer
  customer: {
    id: 'cus_test_1234567890',
    email: 'test@example.com',
    name: 'Test User',
  },

  // Subscription
  subscription: {
    id: 'sub_test_1234567890',
    status: 'active',
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    items: {
      data: [
        {
          id: 'price_test_1234567890',
          price: {
            id: 'price_high_monthly',
            unit_amount: 1499,
            currency: 'usd',
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
    },
  },
};

/**
 * Mock Stripe payment intent creation
 */
export function mockCreatePaymentIntent(
  page: any,
  response: keyof typeof MOCK_STRIPE_RESPONSES.createPaymentIntent = 'success'
) {
  return page.route('**/api/create-payment-intent', (route: any) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(MOCK_STRIPE_RESPONSES.createPaymentIntent[response]),
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

/**
 * Mock Stripe webhook
 */
export function mockStripeWebhook(page: any, _eventType: 'payment_succeeded' | 'payment_failed') {
  return page.route('**/api/webhooks/stripe', (route: any) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ received: true }),
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

/**
 * Mock Stripe Elements iframe
 */
export function mockStripeElements(page: any) {
  // Mock Stripe.js script
  page.route('https://js.stripe.com/v3/**', (route: any) => {
    route.fulfill({
      status: 200,
      body: 'console.log("Stripe loaded");',
      contentType: 'text/javascript',
    });
  });
}

/**
 * Comprehensive tests for Stripe service
 * Target: 85%+ coverage with mocked Stripe API
 */

import { StripeService } from "./stripe.service";
import { env } from "../config/env";
import prisma from "../config/database";
import { subscriptionService } from "./subscription.service";

// Mock dependencies
jest.mock("../config/env");
jest.mock("../config/database");
jest.mock("./subscription.service");
jest.mock("../utils/logger");

// Mock Stripe
jest.mock("stripe", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
      invoices: {
        retrieve: jest.fn(),
      },
      subscriptions: {
        retrieve: jest.fn(),
        cancel: jest.fn(),
      },
      customers: {
        retrieve: jest.fn(),
      },
    })),
  };
});

describe("StripeService", () => {
  let stripeService: StripeService;
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    stripeService = new StripeService();

    // Get mock Stripe instance from the mock
    const StripeModule = jest.requireMock("stripe");
    const Stripe = StripeModule.default || StripeModule;
    mockStripe = new Stripe("");
  });

  describe("createCheckoutSession", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      subscription: null,
    };

    beforeEach(() => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (env.STRIPE_SECRET_KEY as string) = "sk_test_123";
      (env.CORS_ORIGIN as string[]) = ["https://example.com"];
    });

    it("should create a checkout session for monthly subscription", async () => {
      const mockSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/pay/c123",
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await stripeService.createCheckoutSession(
        "user-123",
        "tier-123",
        "Premium",
        29.99,
        "monthly",
      );

      expect(result).toEqual({
        sessionId: "cs_test_123",
        url: "https://checkout.stripe.com/pay/c123",
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ["card"],
          mode: "subscription",
          customer_email: "test@example.com",
          metadata: {
            userId: "user-123",
            tierId: "tier-123",
          },
        }),
      );
    });

    it("should create a checkout session for annual subscription", async () => {
      const mockSession = {
        id: "cs_test_456",
        url: "https://checkout.stripe.com/pay/c456",
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await stripeService.createCheckoutSession(
        "user-123",
        "tier-456",
        "Premium",
        299.99,
        "annual",
      );

      expect(result.sessionId).toBe("cs_test_456");

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            expect.objectContaining({
              price_data: expect.objectContaining({
                recurring: {
                  interval: "year",
                },
              }),
            }),
          ],
        }),
      );
    });

    it("should throw error when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        stripeService.createCheckoutSession(
          "nonexistent-user",
          "tier-123",
          "Premium",
          29.99,
          "monthly",
        ),
      ).rejects.toThrow("User not found");
    });

    it("should handle Stripe API errors", async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error("Stripe API error"),
      );

      await expect(
        stripeService.createCheckoutSession(
          "user-123",
          "tier-123",
          "Premium",
          29.99,
          "monthly",
        ),
      ).rejects.toThrow("Stripe API error");
    });

    it("should set correct success and cancel URLs", async () => {
      const mockSession = {
        id: "cs_test_789",
        url: "https://checkout.stripe.com/pay/c789",
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      await stripeService.createCheckoutSession(
        "user-123",
        "tier-123",
        "Premium",
        29.99,
        "monthly",
      );

      const callArgs = mockStripe.checkout.sessions.create.mock.calls[0][0];

      expect(callArgs.success_url).toContain("checkout/success");
      expect(callArgs.cancel_url).toContain("checkout/cancel");
    });
  });

  describe("handleWebhook", () => {
    beforeEach(() => {
      (env.STRIPE_WEBHOOK_SECRET as string) = "whsec_test_123";
    });

    it("should handle checkout.session.completed event", async () => {
      const mockSession = {
        id: "cs_test_123",
        customer: "cus_123",
        subscription: "sub_123",
        metadata: {
          userId: "user-123",
          tierId: "tier-123",
        },
      };

      const mockEvent = {
        type: "checkout.session.completed",
        data: { object: mockSession },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      (subscriptionService.createSubscription as jest.Mock).mockResolvedValue(
        undefined,
      );

      await stripeService.handleWebhook("body", "signature");

      expect(subscriptionService.createSubscription).toHaveBeenCalledWith(
        "user-123",
        "sub_123",
        "tier-123",
      );
    });

    it("should handle invoice.payment_succeeded event", async () => {
      const mockInvoice = {
        id: "in_123",
        subscription: "sub_123",
        customer: "cus_123",
      };

      const mockSubscription = {
        id: "sub_123",
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      const mockEvent = {
        type: "invoice.payment_succeeded",
        data: { object: mockInvoice },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      (subscriptionService.renewSubscription as jest.Mock).mockResolvedValue(
        undefined,
      );

      await stripeService.handleWebhook("body", "signature");

      expect(subscriptionService.renewSubscription).toHaveBeenCalled();
    });

    it("should handle customer.subscription.deleted event", async () => {
      const mockSubscription = {
        id: "sub_123",
        metadata: {
          userId: "user-123",
        },
      };

      const mockEvent = {
        type: "customer.subscription.deleted",
        data: { object: mockSubscription },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      (subscriptionService.cancelSubscription as jest.Mock).mockResolvedValue(
        undefined,
      );

      await stripeService.handleWebhook("body", "signature");

      expect(subscriptionService.cancelSubscription).toHaveBeenCalledWith(
        "user-123",
      );
    });

    it("should handle customer.subscription.updated event", async () => {
      const mockSubscription = {
        id: "sub_123",
        metadata: {
          userId: "user-123",
          tierId: "tier-456",
        },
        items: {
          data: [
            {
              price: {
                id: "price_123",
                recurring: { interval: "year" },
              },
            },
          ],
        },
      };

      const mockEvent = {
        type: "customer.subscription.updated",
        data: { object: mockSubscription },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      (subscriptionService.updateSubscription as jest.Mock).mockResolvedValue(
        undefined,
      );

      await stripeService.handleWebhook("body", "signature");

      expect(subscriptionService.updateSubscription).toHaveBeenCalled();
    });

    it("should throw error for invalid webhook signature", async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      await expect(
        stripeService.handleWebhook("body", "invalid-signature"),
      ).rejects.toThrow("Invalid signature");
    });

    it("should handle unknown event types gracefully", async () => {
      const mockEvent = {
        type: "unknown.event",
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      await expect(
        stripeService.handleWebhook("body", "signature"),
      ).resolves.not.toThrow();
    });
  });

  describe("error handling", () => {
    it("should handle Stripe API timeout errors", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });

      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error("ETIMEDOUT"),
      );

      await expect(
        stripeService.createCheckoutSession(
          "user-123",
          "tier-123",
          "Premium",
          29.99,
          "monthly",
        ),
      ).rejects.toThrow("ETIMEDOUT");
    });

    it("should handle webhook processing errors", async () => {
      const mockSession = {
        id: "cs_test_123",
        metadata: {
          userId: "user-123",
          tierId: "tier-123",
        },
      };

      const mockEvent = {
        type: "checkout.session.completed",
        data: { object: mockSession },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      (subscriptionService.createSubscription as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        stripeService.handleWebhook("body", "signature"),
      ).rejects.toThrow("Database error");
    });
  });
});

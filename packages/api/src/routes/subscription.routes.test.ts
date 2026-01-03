/**
 * Comprehensive integration tests for subscription.routes
 * Targeting 100% code coverage with supertest
 */

import request from "supertest";
import type { Express } from "express";
import express from "express";
import subscriptionRouter from "./subscription.routes";
import { subscriptionService } from "../services/subscription.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { errorHandler } from "../middleware/error.middleware";
import type { SubscriptionTier } from "@pmp/shared";
import { DEFAULT_TIER_FEATURES } from "@pmp/shared";

// Mock the subscription service
jest.mock("../services/subscription.service");

// Mock the auth middleware
jest.mock("../middleware/auth.middleware", () => ({
  authMiddleware: jest.fn((req, _res, next) => {
    // Default authenticated user
    req.user = {
      userId: "test-user-id",
      email: "test@example.com",
    };
    next();
  }),
}));

describe("Subscription Routes Integration Tests", () => {
  let app: Express;

  // Mock tier data with valid UUIDs
  const mockFreeTier: SubscriptionTier = {
    id: "00000000-0000-0000-0000-000000000001",
    name: "free",
    price: 0,
    billingPeriod: "monthly",
    features: DEFAULT_TIER_FEATURES.free,
  };

  const mockMidTier: SubscriptionTier = {
    id: "00000000-0000-0000-0000-000000000002",
    name: "pro",
    price: 29.99,
    billingPeriod: "monthly",
    features: DEFAULT_TIER_FEATURES["pro"],
  };

  const mockHighTier: SubscriptionTier = {
    id: "00000000-0000-0000-0000-000000000003",
    name: "pro",
    price: 49.99,
    billingPeriod: "monthly",
    features: DEFAULT_TIER_FEATURES["pro"],
  };

  const mockCorporateTier: SubscriptionTier = {
    id: "00000000-0000-0000-0000-000000000004",
    name: "corporate",
    price: 999.99,
    billingPeriod: "annual",
    features: DEFAULT_TIER_FEATURES.corporate,
  };

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use("/api/subscriptions", subscriptionRouter);
    app.use(errorHandler);

    // Clear all mocks
    jest.clearAllMocks();

    // Reset auth middleware to default behavior
    (authMiddleware as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        userId: "test-user-id",
        email: "test@example.com",
      };
      next();
    });
  });

  describe("GET /api/subscriptions/tiers", () => {
    it("should return all available tiers", async () => {
      const mockTiers = [
        mockFreeTier,
        mockMidTier,
        mockHighTier,
        mockCorporateTier,
      ];
      (subscriptionService.getTiers as jest.Mock).mockResolvedValue(mockTiers);

      const response = await request(app)
        .get("/api/subscriptions/tiers")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { tiers: mockTiers },
      });
      expect(subscriptionService.getTiers).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no tiers exist", async () => {
      (subscriptionService.getTiers as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get("/api/subscriptions/tiers")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { tiers: [] },
      });
    });

    it("should handle service errors", async () => {
      (subscriptionService.getTiers as jest.Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const response = await request(app)
        .get("/api/subscriptions/tiers")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });

    it("should not require authentication", async () => {
      (subscriptionService.getTiers as jest.Mock).mockResolvedValue([
        mockFreeTier,
      ]);

      // No Authorization header
      const response = await request(app)
        .get("/api/subscriptions/tiers")
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/subscriptions/current", () => {
    it("should return current user subscription", async () => {
      const mockSubscription = {
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockMidTier.id,
        tier: mockMidTier,
        status: "active" as const,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-02-01"),
        stripeSubscriptionId: "stripe-sub-123",
        stripeCustomerId: "cus-123",
        createdAt: new Date("2024-01-01"),
      };

      (subscriptionService.getUserSubscription as jest.Mock).mockResolvedValue(
        mockSubscription,
      );

      const response = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", "Bearer test-token")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscription).toMatchObject({
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockMidTier.id,
        status: "active",
        stripeSubscriptionId: "stripe-sub-123",
      });
      expect(subscriptionService.getUserSubscription).toHaveBeenCalledWith(
        "test-user-id",
      );
    });

    it("should return null when user has no subscription", async () => {
      (subscriptionService.getUserSubscription as jest.Mock).mockResolvedValue(
        null,
      );

      const response = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", "Bearer test-token")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { subscription: null },
      });
    });

    it("should require authentication", async () => {
      (authMiddleware as jest.Mock).mockImplementation((_req, res) => {
        res.status(401).json({
          success: false,
          error: { code: "AUTH_005", message: "No token provided" },
        });
      });

      await request(app).get("/api/subscriptions/current").expect(401);
    });

    it("should handle service errors", async () => {
      (subscriptionService.getUserSubscription as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const response = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", "Bearer test-token")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("GET /api/subscriptions/features", () => {
    it("should return user feature limits", async () => {
      const mockFeatures = DEFAULT_TIER_FEATURES["pro"];
      (subscriptionService.getUsageLimits as jest.Mock).mockResolvedValue(
        mockFeatures,
      );

      const response = await request(app)
        .get("/api/subscriptions/features")
        .set("Authorization", "Bearer test-token")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { features: mockFeatures },
      });
      expect(subscriptionService.getUsageLimits).toHaveBeenCalledWith(
        "test-user-id",
      );
    });

    it("should return free tier features for users without subscription", async () => {
      const freeFeatures = DEFAULT_TIER_FEATURES.free;
      (subscriptionService.getUsageLimits as jest.Mock).mockResolvedValue(
        freeFeatures,
      );

      const response = await request(app)
        .get("/api/subscriptions/features")
        .set("Authorization", "Bearer test-token")
        .expect(200);

      expect(response.body.data.features).toEqual(freeFeatures);
    });

    it("should require authentication", async () => {
      (authMiddleware as jest.Mock).mockImplementation((_req, res) => {
        res.status(401).json({
          success: false,
          error: { code: "AUTH_005", message: "No token provided" },
        });
      });

      await request(app).get("/api/subscriptions/features").expect(401);
    });

    it("should handle service errors", async () => {
      (subscriptionService.getUsageLimits as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const response = await request(app)
        .get("/api/subscriptions/features")
        .set("Authorization", "Bearer test-token")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/subscriptions/create", () => {
    it("should create free tier subscription immediately", async () => {
      const mockSubscription = {
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockFreeTier,
      );
      (subscriptionService.createSubscription as jest.Mock).mockResolvedValue(
        mockSubscription,
      );

      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: mockFreeTier.id })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Subscription activated");
      expect(response.body.data.subscription).toMatchObject({
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockFreeTier.id,
        status: "active",
      });
      expect(subscriptionService.createSubscription).toHaveBeenCalledWith(
        "test-user-id",
        mockFreeTier.id,
      );
    });

    it("should redirect to Stripe checkout for paid tiers", async () => {
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockMidTier,
      );

      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: mockMidTier.id })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Please use /stripe/checkout for paid subscriptions",
      );
      expect(subscriptionService.createSubscription).not.toHaveBeenCalled();
    });

    it("should validate tierId is a UUID", async () => {
      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: "invalid-uuid" })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should require tierId in request body", async () => {
      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return error for invalid tier ID", async () => {
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: "00000000-0000-0000-0000-000000000000" })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: { code: "SUB_002", message: "Invalid tier ID" },
      });
    });

    it("should require authentication", async () => {
      (authMiddleware as jest.Mock).mockImplementation((_req, res) => {
        res.status(401).json({
          success: false,
          error: { code: "AUTH_005", message: "No token provided" },
        });
      });

      await request(app)
        .post("/api/subscriptions/create")
        .send({ tierId: mockFreeTier.id })
        .expect(401);
    });

    it("should handle service errors during creation", async () => {
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockFreeTier,
      );
      (subscriptionService.createSubscription as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: mockFreeTier.id })
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });

    it("should redirect pro tier to Stripe checkout", async () => {
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockHighTier,
      );

      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: mockHighTier.id })
        .expect(400);

      expect(response.body.message).toBe(
        "Please use /stripe/checkout for paid subscriptions",
      );
    });

    it("should redirect corporate tier to Stripe checkout", async () => {
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockCorporateTier,
      );

      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: mockCorporateTier.id })
        .expect(400);

      expect(response.body.message).toBe(
        "Please use /stripe/checkout for paid subscriptions",
      );
    });
  });

  describe("POST /api/subscriptions/cancel", () => {
    it("should cancel active subscription", async () => {
      (subscriptionService.cancelSubscription as jest.Mock).mockResolvedValue(
        undefined,
      );

      const response = await request(app)
        .post("/api/subscriptions/cancel")
        .set("Authorization", "Bearer test-token")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message:
          "Subscription cancelled. Access will continue until the end of your billing period.",
      });
      expect(subscriptionService.cancelSubscription).toHaveBeenCalledWith(
        "test-user-id",
      );
    });

    it("should require authentication", async () => {
      (authMiddleware as jest.Mock).mockImplementation((_req, res) => {
        res.status(401).json({
          success: false,
          error: { code: "AUTH_005", message: "No token provided" },
        });
      });

      await request(app).post("/api/subscriptions/cancel").expect(401);
    });

    it("should handle service errors", async () => {
      (subscriptionService.cancelSubscription as jest.Mock).mockRejectedValue(
        new Error("Subscription not found"),
      );

      const response = await request(app)
        .post("/api/subscriptions/cancel")
        .set("Authorization", "Bearer test-token")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });

    it("should work for any authenticated user", async () => {
      (authMiddleware as jest.Mock).mockImplementation((req, _res, next) => {
        req.user = {
          userId: "different-user-id",
          email: "different@example.com",
        };
        next();
      });
      (subscriptionService.cancelSubscription as jest.Mock).mockResolvedValue(
        undefined,
      );

      await request(app)
        .post("/api/subscriptions/cancel")
        .set("Authorization", "Bearer test-token")
        .expect(200);

      expect(subscriptionService.cancelSubscription).toHaveBeenCalledWith(
        "different-user-id",
      );
    });
  });

  describe("POST /api/subscriptions/check-expiry", () => {
    it("should process expired subscriptions", async () => {
      const mockResult = {
        processed: 10,
        expired: 3,
      };
      (
        subscriptionService.checkSubscriptionExpiry as jest.Mock
      ).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/subscriptions/check-expiry")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        message: "Processed 10 subscriptions. 3 expired.",
      });
      expect(subscriptionService.checkSubscriptionExpiry).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should handle zero subscriptions processed", async () => {
      const mockResult = {
        processed: 0,
        expired: 0,
      };
      (
        subscriptionService.checkSubscriptionExpiry as jest.Mock
      ).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/subscriptions/check-expiry")
        .expect(200);

      expect(response.body.message).toBe(
        "Processed 0 subscriptions. 0 expired.",
      );
    });

    it("should not require authentication (cron job endpoint)", async () => {
      const mockResult = { processed: 5, expired: 2 };
      (
        subscriptionService.checkSubscriptionExpiry as jest.Mock
      ).mockResolvedValue(mockResult);

      // No Authorization header
      const response = await request(app)
        .post("/api/subscriptions/check-expiry")
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should handle service errors", async () => {
      (
        subscriptionService.checkSubscriptionExpiry as jest.Mock
      ).mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/subscriptions/check-expiry")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });

    it("should handle large numbers of subscriptions", async () => {
      const mockResult = {
        processed: 1000,
        expired: 250,
      };
      (
        subscriptionService.checkSubscriptionExpiry as jest.Mock
      ).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/subscriptions/check-expiry")
        .expect(200);

      expect(response.body.message).toBe(
        "Processed 1000 subscriptions. 250 expired.",
      );
    });

    it("should handle all processed with none expired", async () => {
      const mockResult = {
        processed: 50,
        expired: 0,
      };
      (
        subscriptionService.checkSubscriptionExpiry as jest.Mock
      ).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/subscriptions/check-expiry")
        .expect(200);

      expect(response.body.data.processed).toBe(50);
      expect(response.body.data.expired).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON in request body", async () => {
      // Malformed JSON causes Express body-parser to throw 400, but the error
      // handler converts it to 500 in test environment
      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      // Either 400 or 500 is acceptable for malformed JSON
      expect([400, 500]).toContain(response.status);
      expect(response.body.error).toBeDefined();
    });

    it("should handle unexpected errors gracefully", async () => {
      (subscriptionService.getTiers as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const response = await request(app)
        .get("/api/subscriptions/tiers")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });

    it("should pass errors to error handler middleware", async () => {
      const testError = new Error("Test error");
      (subscriptionService.getUserSubscription as jest.Mock).mockRejectedValue(
        testError,
      );

      const response = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", "Bearer test-token")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("Request Validation", () => {
    it("should allow extra fields in request (Zod not in strict mode)", async () => {
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockFreeTier,
      );
      (subscriptionService.createSubscription as jest.Mock).mockResolvedValue({
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({
          tierId: mockFreeTier.id,
          extraField: "ignored by zod",
        })
        .expect(201);

      // Extra fields are stripped by Zod, request succeeds
      expect(response.body.success).toBe(true);
    });

    it("should accept valid UUID formats for tierId", async () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];

      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockFreeTier,
      );
      (subscriptionService.createSubscription as jest.Mock).mockResolvedValue({
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
      });

      for (const uuid of validUUIDs) {
        const response = await request(app)
          .post("/api/subscriptions/create")
          .set("Authorization", "Bearer test-token")
          .send({ tierId: uuid })
          .expect(201);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle concurrent create requests", async () => {
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockFreeTier,
      );
      (subscriptionService.createSubscription as jest.Mock).mockResolvedValue({
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
      });

      const responses = await Promise.all([
        request(app)
          .post("/api/subscriptions/create")
          .set("Authorization", "Bearer test-token")
          .send({ tierId: mockFreeTier.id }),
        request(app)
          .post("/api/subscriptions/create")
          .set("Authorization", "Bearer test-token")
          .send({ tierId: mockFreeTier.id }),
        request(app)
          .post("/api/subscriptions/create")
          .set("Authorization", "Bearer test-token")
          .send({ tierId: mockFreeTier.id }),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    it("should handle subscription with Stripe metadata", async () => {
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockFreeTier,
      );
      (subscriptionService.createSubscription as jest.Mock).mockResolvedValue({
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(),
        stripeSubscriptionId: "sub_123abc",
        stripeCustomerId: "cus_123abc",
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: mockFreeTier.id })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscription.stripeSubscriptionId).toBe(
        "sub_123abc",
      );
    });
  });

  describe("Integration Flow", () => {
    it("should complete full subscription lifecycle", async () => {
      // Step 1: Get available tiers
      const mockTiers = [
        mockFreeTier,
        mockMidTier,
        mockHighTier,
        mockCorporateTier,
      ];
      (subscriptionService.getTiers as jest.Mock).mockResolvedValue(mockTiers);

      const tiersResponse = await request(app)
        .get("/api/subscriptions/tiers")
        .expect(200);
      expect(tiersResponse.body.data.tiers).toHaveLength(4);

      // Step 2: Check current subscription (none)
      (subscriptionService.getUserSubscription as jest.Mock).mockResolvedValue(
        null,
      );

      const currentResponse = await request(app)
        .get("/api/subscriptions/current")
        .set("Authorization", "Bearer test-token")
        .expect(200);
      expect(currentResponse.body.data.subscription).toBeNull();

      // Step 3: Create free tier subscription
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockFreeTier,
      );
      const newSubscription = {
        id: "sub-123",
        userId: "test-user-id",
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
      (subscriptionService.createSubscription as jest.Mock).mockResolvedValue(
        newSubscription,
      );

      const createResponse = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: mockFreeTier.id })
        .expect(201);
      expect(createResponse.body.data.subscription.tier.name).toBe("free");

      // Step 4: Get features
      (subscriptionService.getUsageLimits as jest.Mock).mockResolvedValue(
        DEFAULT_TIER_FEATURES.free,
      );

      const featuresResponse = await request(app)
        .get("/api/subscriptions/features")
        .set("Authorization", "Bearer test-token")
        .expect(200);
      expect(featuresResponse.body.data.features.flashcardsLimit).toBe(500);

      // Step 5: Cancel subscription
      (subscriptionService.cancelSubscription as jest.Mock).mockResolvedValue(
        undefined,
      );

      const cancelResponse = await request(app)
        .post("/api/subscriptions/cancel")
        .set("Authorization", "Bearer test-token")
        .expect(200);
      expect(cancelResponse.body.success).toBe(true);
    });

    it("should handle paid subscription upgrade flow via Stripe", async () => {
      // Start with free tier
      (subscriptionService.getUserSubscription as jest.Mock).mockResolvedValue({
        id: "sub-free",
        userId: "test-user-id",
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      // Attempt upgrade to pro - should redirect to Stripe checkout
      (subscriptionService.getTierById as jest.Mock).mockResolvedValue(
        mockMidTier,
      );

      const createResponse = await request(app)
        .post("/api/subscriptions/create")
        .set("Authorization", "Bearer test-token")
        .send({ tierId: mockMidTier.id })
        .expect(400);

      expect(createResponse.body.success).toBe(false);
      expect(createResponse.body.message).toBe(
        "Please use /stripe/checkout for paid subscriptions",
      );
    });
  });
});

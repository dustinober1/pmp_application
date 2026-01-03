/**
 * Tests for Stripe webhook routes
 * Target: 90%+ coverage
 */

import request from "supertest";
import type { Express } from "express";
import express from "express";
import stripeWebhookRoutes from "./stripe.webhook.routes";
import { stripeService } from "../services/stripe.service";

// Mock dependencies
jest.mock("../services/stripe.service");
jest.mock("../utils/logger");

describe("Stripe Webhook Routes", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.raw({ type: "application/json" }));
    app.use("/webhook/stripe", stripeWebhookRoutes);

    jest.clearAllMocks();
  });

  describe("POST /webhook/stripe", () => {
    it("should process valid webhook events", async () => {
      (stripeService.handleWebhook as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "valid-signature")
        .send(JSON.stringify({ test: "event" }))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
      expect(stripeService.handleWebhook).toHaveBeenCalledWith(
        expect.any(String),
        "valid-signature",
      );
    });

    it("should return 400 for invalid signature", async () => {
      (stripeService.handleWebhook as jest.Mock).mockRejectedValue(
        new Error("Invalid signature"),
      );

      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "invalid-signature")
        .send(JSON.stringify({ test: "event" }))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return 400 when signature is missing", async () => {
      const response = await request(app)
        .post("/webhook/stripe")
        .send(JSON.stringify({ test: "event" }))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should handle Stripe service errors gracefully", async () => {
      (stripeService.handleWebhook as jest.Mock).mockRejectedValue(
        new Error("Stripe API error"),
      );

      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "valid-signature")
        .send(JSON.stringify({ test: "event" }))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it("should handle invalid JSON body", async () => {
      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "valid-signature")
        .send("invalid json")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should process checkout.session.completed event", async () => {
      (stripeService.handleWebhook as jest.Mock).mockResolvedValue(undefined);

      const eventPayload = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            customer: "cus_123",
            subscription: "sub_123",
            metadata: {
              userId: "user-123",
              tierId: "tier-123",
            },
          },
        },
      };

      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "valid-signature")
        .send(JSON.stringify(eventPayload))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(stripeService.handleWebhook).toHaveBeenCalled();
    });

    it("should process invoice.payment_succeeded event", async () => {
      (stripeService.handleWebhook as jest.Mock).mockResolvedValue(undefined);

      const eventPayload = {
        type: "invoice.payment_succeeded",
        data: {
          object: {
            id: "in_123",
            subscription: "sub_123",
          },
        },
      };

      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "valid-signature")
        .send(JSON.stringify(eventPayload))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should process customer.subscription.deleted event", async () => {
      (stripeService.handleWebhook as jest.Mock).mockResolvedValue(undefined);

      const eventPayload = {
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_123",
            metadata: {
              userId: "user-123",
            },
          },
        },
      };

      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "valid-signature")
        .send(JSON.stringify(eventPayload))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should process customer.subscription.updated event", async () => {
      (stripeService.handleWebhook as jest.Mock).mockResolvedValue(undefined);

      const eventPayload = {
        type: "customer.subscription.updated",
        data: {
          object: {
            id: "sub_123",
            metadata: {
              userId: "user-123",
            },
          },
        },
      };

      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "valid-signature")
        .send(JSON.stringify(eventPayload))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should handle empty body", async () => {
      const response = await request(app)
        .post("/webhook/stripe")
        .set("stripe-signature", "valid-signature")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });
  });
});

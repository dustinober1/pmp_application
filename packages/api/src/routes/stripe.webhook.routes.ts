import type { Request, Response } from "express";
import { Router } from "express";
import { stripeService } from "../services/stripe.service";
import { logger } from "../utils/logger";
import express from "express";

const router = Router();

/**
 * POST /api/webhooks/stripe
 * Stripe webhook endpoint
 * NOTE: This endpoint needs the raw body for signature verification.
 */
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      res
        .status(400)
        .json({ success: false, message: "Missing stripe-signature header" });
      return;
    }

    try {
      // Use req.body (raw buffer due to express.raw)
      await stripeService.handleWebhook(req.body, signature);
      res.json({ received: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`Stripe Webhook Error: ${errorMessage}`);
      res.status(400).send(`Webhook Error: ${errorMessage}`);
    }
  },
);

export default router;

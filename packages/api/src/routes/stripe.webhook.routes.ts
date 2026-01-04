import type { FastifyInstance } from "fastify";
import { stripeService } from "../services/stripe.service";
import { logger } from "../utils/logger";

export async function stripeWebhookRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const signature = request.headers["stripe-signature"] as string;
    if (!signature) {
      reply
        .status(400)
        .send({ success: false, message: "Missing stripe-signature header" });
      return;
    }
    try {
      const body = request.body as unknown as string;
      await stripeService.handleWebhook(body, signature);
      reply.send({ received: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`Stripe Webhook Error: ${errorMessage}`);
      reply.status(400).send(`Webhook Error: ${errorMessage}`);
    }
  });
}

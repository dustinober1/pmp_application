import { FastifyInstance } from "fastify";
import { subscriptionService } from "../services/subscription.service";
import { stripeService } from "../services/stripe.service";
import { authMiddleware } from "../middleware/auth.middleware";

const createSubscriptionSchema = {
  type: "object",
  properties: {
    tierId: { type: "string", format: "uuid" },
    quantity: { type: "integer", minimum: 1 },
  },
  required: ["tierId"],
};

export async function subscriptionRoutes(app: FastifyInstance) {
  app.get("/tiers", async (_request, reply) => {
    const tiers = await subscriptionService.getTiers();
    reply.send({
      success: true,
      data: { tiers },
    });
  });

  app.get(
    "/current",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const subscription = await subscriptionService.getUserSubscription(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { subscription },
      });
    },
  );

  app.get(
    "/features",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const features = await subscriptionService.getUsageLimits(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { features },
      });
    },
  );

  app.post(
    "/create",
    {
      preHandler: [authMiddleware],
      schema: { body: createSubscriptionSchema },
    },
    async (request, reply) => {
      const tier = await subscriptionService.getTierById(
        (request.body as any).tierId,
      );

      if (!tier) {
        reply.status(400).send({
          success: false,
          error: { code: "SUB_002", message: "Invalid tier ID" },
        });
        return;
      }

      if (tier.price === 0) {
        const subscription = await subscriptionService.createSubscription(
          (request as any).user.userId,
          (request.body as any).tierId,
        );
        reply.status(201).send({
          success: true,
          data: { subscription },
          message: "Subscription activated",
        });
        return;
      }

      reply.status(400).send({
        success: false,
        message: "Please use /stripe/checkout for paid subscriptions",
      });
    },
  );

  app.post(
    "/stripe/checkout",
    {
      preHandler: [authMiddleware],
      schema: { body: createSubscriptionSchema },
    },
    async (request, reply) => {
      const tier = await subscriptionService.getTierById(
        (request.body as any).tierId,
      );

      if (!tier) {
        reply.status(400).send({
          success: false,
          error: { code: "SUB_002", message: "Invalid tier ID" },
        });
        return;
      }

      if (tier.price === 0) {
        reply.status(400).send({
          success: false,
          message: "Free tier does not require checkout",
        });
        return;
      }

      const { sessionId, url } = await stripeService.createCheckoutSession(
        (request as any).user.userId,
        tier.id,
        tier.name,
        tier.price,
        tier.billingPeriod,
        (request.body as any).quantity || 1,
      );

      reply.send({
        success: true,
        data: {
          sessionId,
          checkoutUrl: url,
        },
      });
    },
  );

  app.post(
    "/cancel",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      await subscriptionService.cancelSubscription(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        message:
          "Subscription cancelled. Access will continue until the end of your billing period.",
      });
    },
  );

  app.post("/check-expiry", async (_request, reply) => {
    const result = await subscriptionService.checkSubscriptionExpiry();
    reply.send({
      success: true,
      data: result,
      message: `Processed ${result.processed} subscriptions. ${result.expired} expired.`,
    });
  });

  app.post(
    "/stripe/portal",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { url } = await stripeService.createBillingPortalSession(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { url },
      });
    },
  );
}

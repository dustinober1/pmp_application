import dotenv from "dotenv";
import { randomUUID } from "crypto";
import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/error.middleware";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes } from "./routes/auth.routes";
import { subscriptionRoutes } from "./routes/subscription.routes";
import { domainRoutes } from "./routes/domain.routes";
import { flashcardRoutes } from "./routes/flashcard.routes";
import { practiceRoutes } from "./routes/practice.routes";
import { formulaRoutes } from "./routes/formula.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { teamRoutes } from "./routes/team.routes";
import { searchRoutes } from "./routes/search.routes";
import { ebookRoutes } from "./routes/ebook.routes";
import { stripeWebhookRoutes } from "./routes/stripe.webhook.routes";
import { privacyRoutes } from "./routes/privacy.routes";
import { adminPrivacyRoutes } from "./routes/admin-privacy.routes";
import { analyticsRoutes } from "./routes/analytics.routes";

dotenv.config();

export async function createServer() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL || "info",
    },
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  });

  await app.register(fastifyCors, {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGIN.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  });

  await app.register(fastifyCookie, {
    parseOptions: {},
  });

  if (env.NODE_ENV === "production") {
    await app.register(fastifyRateLimit as any, {
      global: true,
      timeWindow: "15 minute",
      max: 100,
      errorResponseBuilder: () => {
        return {
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests, please try again later",
          },
        };
      },
    });
  }

  app.addHook("onRequest" as any, async (request: any, reply: any) => {
    requestIdMiddleware(request, reply);
  });

  app.setErrorHandler(errorHandler as any);

  app.setNotFoundHandler(async (request: any, reply: any) => {
    const error = new Error(`Route ${request.method} ${request.url} not found`);
    reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: error.message,
      },
    });
  });

  await app.register(healthRoutes, { prefix: "/api/health" });
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(subscriptionRoutes, { prefix: "/api/subscriptions" });
  await app.register(domainRoutes, { prefix: "/api/domains" });
  await app.register(flashcardRoutes, { prefix: "/api/flashcards" });
  await app.register(practiceRoutes, { prefix: "/api/practice" });
  await app.register(formulaRoutes, { prefix: "/api/formulas" });
  await app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  await app.register(teamRoutes, { prefix: "/api/teams" });
  await app.register(searchRoutes, { prefix: "/api/search" });
  await app.register(ebookRoutes, { prefix: "/api/ebook" });
  await app.register(privacyRoutes, { prefix: "/api/privacy" });
  await app.register(adminPrivacyRoutes, { prefix: "/api/admin/privacy" });
  await app.register(analyticsRoutes, { prefix: "/api/analytics" });
  await app.register(stripeWebhookRoutes, { prefix: "/webhooks/stripe" });

  app.setNotFoundHandler(async (request: any, reply: any) => {
    const error = new Error(`Route ${request.method} ${request.url} not found`);
    reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: error.message,
      },
    });
  });

  app.get("/api/health", async (_request: any, reply: any) => {
    reply.send({ status: "ok" });
  });

  return app;
}

export async function startServer(
  app: Awaited<ReturnType<typeof createServer>>,
) {
  const server = app;
  const PORT = env.PORT;

  await server.listen({ port: PORT, host: "0.0.0.0" });

  logger.info(`PMP Study API running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Fastify server initialized`);

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    await server.close();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
}

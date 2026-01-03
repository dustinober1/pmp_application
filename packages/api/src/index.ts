import dotenv from "dotenv";
import express from "express";

// Load environment variables before anything else
dotenv.config();

// Initialize OpenTelemetry before importing anything else
import "./config/opentelemetry";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";

import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { env } from "./config/env";
import { csrfMiddleware } from "./middleware/csrf.middleware";
import { logger } from "./utils/logger";
import {
  register,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
} from "./utils/metrics";
import {
  initializeLogger,
  loggingMiddleware,
  contextCleanupMiddleware,
} from "./logging";
import {
  serveSwaggerDocs,
  serveOpenAPISpec,
} from "./middleware/swagger.middleware";

// Import routes
import healthRouter from "./routes/health.routes";
import authRouter from "./routes/auth.routes";
import subscriptionRouter from "./routes/subscription.routes";
import domainRouter from "./routes/domain.routes";
import flashcardRouter from "./routes/flashcard.routes";
import practiceRouter from "./routes/practice.routes";
import formulaRouter from "./routes/formula.routes";
import dashboardRouter from "./routes/dashboard.routes";
import teamRouter from "./routes/team.routes";
import searchRouter from "./routes/search.routes";
import ebookRouter from "./routes/ebook.routes";
import stripeWebhookRouter from "./routes/stripe.webhook.routes";
import privacyRouter from "./routes/privacy.routes";
import adminPrivacyRouter from "./routes/admin-privacy.routes";
import { createLoggerConfig } from "./logging/config";
// Initialize structured logger
initializeLogger(createLoggerConfig());

const app = express();

// Security middleware
app.use(
  helmet({
    // API does not serve HTML; CSP is handled by the frontend.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients with no Origin header (e.g., curl, server-to-server)
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGIN.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Rate limiting - disabled in development for hot reload
if (env.NODE_ENV === "production") {
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests, please try again later",
        },
      },
    }),
  );
}

// Webhook Routes (Must be before JSON parser for raw body)
app.use(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookRouter,
);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", csrfMiddleware);

// Request ID and logging
app.use(requestIdMiddleware);
app.use(...loggingMiddleware());
app.use(contextCleanupMiddleware);

// Metrics Middleware
app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;

    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration / 1000);

    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  next();
});

app.use(
  morgan(":method :url :status :response-time ms - :req[x-request-id]", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }),
);

// Metrics Endpoint
app.get("/metrics", async (_req: any, res: any) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// API Documentation (Development/Staging only)
if (env.NODE_ENV !== "production") {
  logger.info("Setting up API documentation endpoints");
  app.use("/api-docs", ...serveSwaggerDocs());
  app.get("/openapi.json", serveOpenAPISpec);
  logger.info("Swagger UI available at http://localhost:%s/api-docs", env.PORT);
}

// API Routes
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/domains", domainRouter);
app.use("/api/flashcards", flashcardRouter);
app.use("/api/practice", practiceRouter);
app.use("/api/formulas", formulaRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/teams", teamRouter);
app.use("/api/search", searchRouter);
app.use("/api/ebook", ebookRouter);
app.use("/api/privacy", privacyRouter);
app.use("/api/admin/privacy", adminPrivacyRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`PMP Study API running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`OpenTelemetry tracing enabled`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Shutdown OpenTelemetry
  const { shutdownOpenTelemetry } = await import("./config/opentelemetry");
  await shutdownOpenTelemetry();

  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;

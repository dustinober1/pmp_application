/**
 * Sentry Instrumentation
 *
 * This file must be imported BEFORE any other modules are imported.
 * It sets up Sentry error tracking and performance monitoring for the backend.
 *
 * Requirements: Story 3 - Implement Error Tracking and Monitoring
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import Logger from "./utils/logger";

const isProd = process.env.NODE_ENV === "production";

// Initialize Sentry with DSN from environment
// Only enable in production or if explicitly configured
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Enable Sentry in all environments if DSN is set
    enabled: true,

    // Environment tag for filtering in Sentry dashboard
    environment: process.env.NODE_ENV || "development",

    // Release version for tracking deployments
    release: process.env.npm_package_version || "1.0.0",

    // Integrations for enhanced functionality
    integrations: [
      // Performance profiling
      nodeProfilingIntegration(),
    ],

    // Performance monitoring - sample rate for transactions
    // Lower in production to reduce costs, higher in development for debugging
    tracesSampleRate: isProd ? 0.1 : 1.0,

    // Profile 100% of sampled transactions
    profilesSampleRate: isProd ? 0.1 : 1.0,

    // Error sampling - capture all errors
    sampleRate: 1.0,

    // Don't send PII by default
    sendDefaultPii: false,

    // Ignore common non-actionable errors
    ignoreErrors: [
      "AxiosError: Network Error",
      "ResizeObserver loop limit exceeded",
      /^ECONNRESET$/,
      /^ENOTFOUND$/,
    ],

    // Add additional context to events
    beforeSend(event, _hint) {
      // Don't send events in test environment
      if (process.env.NODE_ENV === "test") {
        return null;
      }

      // Scrub sensitive data from request body
      if (event.request?.data) {
        const data = event.request.data;
        if (typeof data === "object" && data !== null) {
          if ("password" in data) {
            data.password = "[REDACTED]";
          }
          if ("token" in data) {
            data.token = "[REDACTED]";
          }
          if ("secret" in data) {
            data.secret = "[REDACTED]";
          }
        }
      }

      return event;
    },

    // Tag events with server metadata
    initialScope: {
      tags: {
        component: "backend",
        service: "pmp-api",
      },
    },
  });

  Logger.info(
    `[Sentry] Initialized for environment: ${process.env.NODE_ENV || "development"}`,
  );
} else {
  Logger.warn("[Sentry] DSN not configured, error tracking disabled");
}

export { Sentry };

/**
 * Utility function to set user context in Sentry
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Utility function to clear user context
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Utility function to add breadcrumb for debugging
 */
export function addSentryBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = "info",
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Utility function to capture custom errors with context
 */
export function captureErrorWithContext(
  error: Error,
  context: Record<string, unknown>,
) {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
}

/**
 * Logger configuration factory
 */

import type { LoggerConfig } from "./types";
import { env } from "../config/env";

/**
 * Create logger configuration based on environment
 */
export function createLoggerConfig(): LoggerConfig {
  const isProduction = env.NODE_ENV === "production";

  return {
    level: env.NODE_ENV === "test" ? "error" : (env.LOG_LEVEL as any),
    environment: env.NODE_ENV,
    serviceName: "pmp-api",
    enableCloudWatch: isProduction && !!process.env.AWS_ACCESS_KEY_ID,
    cloudWatchLogGroup: "/pmp-app/api",
    cloudWatchLogStream: `${env.NODE_ENV}-${process.env.HOSTNAME || "local"}`,
    sanitizeFields: [
      "password",
      "secret",
      "token",
      "apiKey",
      "accessToken",
      "refreshToken",
      "authorization",
    ],
  };
}

/**
 * Create logger configuration for web client
 */
export function createWebLoggerConfig(): LoggerConfig {
  const isProduction = env.NODE_ENV === "production";

  return {
    level: env.LOG_LEVEL as any,
    environment: env.NODE_ENV,
    serviceName: "pmp-web",
    enableCloudWatch: isProduction && !!process.env.AWS_ACCESS_KEY_ID,
    cloudWatchLogGroup: "/pmp-app/web",
    cloudWatchLogStream: `${env.NODE_ENV}-${process.env.HOSTNAME || "local"}`,
    sanitizeFields: [
      "password",
      "secret",
      "token",
      "apiKey",
      "accessToken",
      "refreshToken",
      "authorization",
    ],
  };
}

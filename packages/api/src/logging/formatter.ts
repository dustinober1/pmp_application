/**
 * Custom log formatters for Winston
 */

import type { TransformableInfo } from "logform";
import { format } from "winston";
import util from "util";

/**
 * Format log entry for development (pretty-print with colors)
 */
export const devFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, context, ...meta } = info as any;

    let output = `${timestamp} [${level}]: ${message}`;

    // Add context if available
    if (context) {
      const contextParts: string[] = [];
      if (context.trace_id) contextParts.push(`trace_id=${context.trace_id}`);
      if (context.user_id) contextParts.push(`user_id=${context.user_id}`);
      if (contextParts.length > 0) {
        output += ` (${contextParts.join(", ")})`;
      }
    }

    // Add metadata
    if (Object.keys(meta).length > 0) {
      const sanitizedMeta = util.inspect(meta, {
        colors: true,
        depth: 3,
        compact: true,
      });
      output += `\n  ${sanitizedMeta}`;
    }

    // Add error stack if available
    if (meta.error instanceof Error) {
      output += `\n  ${meta.error.stack}`;
    }

    return output;
  }),
);

/**
 * Format log entry for production (structured JSON)
 */
export const prodFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
  format.errors({ stack: true }),
  format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  format.json(),
);

/**
 * Format for CloudWatch (optimized JSON)
 */
export const cloudWatchFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.metadata(),
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, metadata, ...rest } = info as any;

    return JSON.stringify({
      timestamp,
      level,
      message,
      ...metadata,
      ...rest,
    });
  }),
);

/**
 * Simplified format for HTTP logging
 */
export const httpFormat = format.combine(
  format.timestamp(),
  format.metadata(),
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, metadata } = info as any;

    const logData: any = {
      timestamp,
      level,
      message,
    };

    if (metadata) {
      if (metadata.method) logData.method = metadata.method;
      if (metadata.path) logData.path = metadata.path;
      if (metadata.status) logData.status = metadata.status;
      if (metadata.response_time)
        logData.response_time = metadata.response_time;
      if (metadata.ip) logData.ip = metadata.ip;
      if (metadata.user_agent) logData.user_agent = metadata.user_agent;
      if (metadata.trace_id) logData.trace_id = metadata.trace_id;
      if (metadata.user_id) logData.user_id = metadata.user_id;
    }

    return JSON.stringify(logData);
  }),
);

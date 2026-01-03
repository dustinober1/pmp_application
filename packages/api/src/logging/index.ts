/**
 * Logging module exports
 */

export {
  Logger,
  getLogger,
  initializeLogger,
  createLogger,
  generateTraceId,
  childLogger,
} from './logger';
export {
  traceIdMiddleware,
  userIdMiddleware,
  requestLoggingMiddleware,
  errorLoggingMiddleware,
  loggingMiddleware,
  contextCleanupMiddleware,
} from './middleware';
export { sanitize, createSanitizationRules, isSensitiveField, redact } from './sanitizer';
export { createLoggerConfig, createWebLoggerConfig } from './config';

// Re-export types
export type {
  LogLevel,
  LogContext,
  RequestMetadata,
  LogEntry,
  SanitizationRule,
  LoggerConfig,
} from './types';

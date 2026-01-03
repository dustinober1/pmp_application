/**
 * Production-grade structured logger with Winston
 */

import winston from "winston";
import { v4 as uuidv4 } from "uuid";
import type { LogLevel, LogContext } from "./types";
import { sanitize } from "./sanitizer";
import { createTransports } from "./transports";
import type { LoggerConfig } from "./types";

/**
 * Async local storage for request context
 */
const asyncLocalStorage = new Map<string, any>();

/**
 * Logger class with context management
 */
export class Logger {
  private winston: winston.Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.winston = winston.createLogger({
      level: config.level,
      transports: createTransports(config),
      exitOnError: false,
    });
  }

  /**
   * Build log context with trace ID and additional metadata
   */
  private buildContext(additionalContext?: Partial<LogContext>): LogContext {
    const context: LogContext = {
      environment: this.config.environment,
      service_name: this.config.serviceName,
      timestamp: new Date().toISOString(),
      ...additionalContext,
    };

    // Add trace_id from async storage if available
    const traceId = asyncLocalStorage.get("trace_id");
    if (traceId) {
      context.trace_id = traceId;
    }

    // Add user_id from async storage if available
    const userId = asyncLocalStorage.get("user_id");
    if (userId) {
      context.user_id = userId;
    }

    return context;
  }

  /**
   * Sanitize metadata before logging
   */
  private sanitizeMetadata(metadata: any): any {
    return sanitize(metadata, []);
  }

  /**
   * Log at debug level
   */
  debug(message: string, metadata?: any): void {
    this.winston.debug(message, {
      context: this.buildContext(),
      ...this.sanitizeMetadata(metadata),
    });
  }

  /**
   * Log at info level
   */
  info(message: string, metadata?: any): void {
    this.winston.info(message, {
      context: this.buildContext(),
      ...this.sanitizeMetadata(metadata),
    });
  }

  /**
   * Log at warn level
   */
  warn(message: string, metadata?: any): void {
    this.winston.warn(message, {
      context: this.buildContext(),
      ...this.sanitizeMetadata(metadata),
    });
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error | any, metadata?: any): void {
    const errorMeta =
      error instanceof Error
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
              code: (error as any).code,
            },
            ...metadata,
          }
        : { ...error, ...metadata };

    this.winston.error(message, {
      context: this.buildContext(),
      ...this.sanitizeMetadata(errorMeta),
    });
  }

  /**
   * Log HTTP request
   */
  http(message: string, metadata?: any): void {
    this.winston.http(message, {
      context: this.buildContext(),
      ...this.sanitizeMetadata(metadata),
    });
  }

  /**
   * Set trace ID for current context
   */
  static setTraceId(traceId: string): void {
    asyncLocalStorage.set("trace_id", traceId);
  }

  /**
   * Get trace ID from current context
   */
  static getTraceId(): string | undefined {
    return asyncLocalStorage.get("trace_id");
  }

  /**
   * Set user ID for current context
   */
  static setUserId(userId: string | number): void {
    asyncLocalStorage.set("user_id", userId);
  }

  /**
   * Get user ID from current context
   */
  static getUserId(): string | number | undefined {
    return asyncLocalStorage.get("user_id");
  }

  /**
   * Clear current context
   */
  static clearContext(): void {
    asyncLocalStorage.clear();
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: Partial<LogContext>): Logger {
    const childLogger = Object.create(this);
    childLogger.winston = this.winston.child({
      context: { ...this.buildContext(), ...additionalContext },
    });
    return childLogger;
  }

  /**
   * Get the underlying Winston logger
   */
  getWinstonLogger(): winston.Logger {
    return this.winston;
  }

  /**
   * Update log level at runtime
   */
  setLevel(level: LogLevel): void {
    this.winston.level = level;
    this.config.level = level;
  }

  /**
   * Flush any pending logs (useful before shutdown)
   */
  async flush(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.winston.on("finish", resolve);
      this.winston.on("error", reject);
      this.winston.end();
    });
  }
}

/**
 * Default logger instance (will be configured at runtime)
 */
let defaultLogger: Logger | null = null;

/**
 * Initialize the default logger
 */
export function initializeLogger(config: LoggerConfig): Logger {
  defaultLogger = new Logger(config);
  return defaultLogger;
}

/**
 * Get the default logger instance
 */
export function getLogger(): Logger {
  if (!defaultLogger) {
    throw new Error("Logger not initialized. Call initializeLogger() first.");
  }
  return defaultLogger;
}

/**
 * Create a new logger instance with custom configuration
 */
export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}

/**
 * Generate or extract trace ID from request headers
 */
export function generateTraceId(header?: string): string {
  if (header && header.length > 0) {
    return header;
  }
  return uuidv4();
}

/**
 * Create child logger with additional context
 */
export function childLogger(additionalContext: Partial<LogContext>): Logger {
  return getLogger().child(additionalContext);
}

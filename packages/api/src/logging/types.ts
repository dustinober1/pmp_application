/**
 * Log level definitions aligned with Winston standards
 */
export type LogLevel = "error" | "warn" | "info" | "http" | "debug";

/**
 * Structured log context that will be included in every log entry
 */
export interface LogContext {
  trace_id?: string;
  user_id?: string | number;
  environment: string;
  service_name: string;
  timestamp: string;
  [key: string]: any;
}

/**
 * Request metadata for HTTP logging
 */
export interface RequestMetadata {
  method: string;
  path: string;
  ip?: string;
  user_agent?: string;
  query?: any;
  params?: any;
  body?: any;
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Sanitization configuration for sensitive data
 */
export interface SanitizationRule {
  field: string;
  pattern: RegExp;
  replacement: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  environment: string;
  serviceName: string;
  enableCloudWatch: boolean;
  cloudWatchLogGroup: string;
  cloudWatchLogStream: string;
  sanitizeFields: string[];
}

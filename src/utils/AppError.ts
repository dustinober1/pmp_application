/**
 * Custom Application Error class for standardized error handling
 * Use this class to throw application-specific errors with consistent formatting
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Format error for API response
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        status: this.statusCode,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// Common error factory functions for consistency
export const ErrorFactory = {
  // Authentication errors
  unauthorized: (message = "Authentication required") =>
    new AppError(message, 401, "UNAUTHORIZED"),

  forbidden: (message = "Access denied") =>
    new AppError(message, 403, "FORBIDDEN"),

  invalidToken: (message = "Invalid or expired token") =>
    new AppError(message, 403, "INVALID_TOKEN"),

  // Resource errors
  notFound: (resource = "Resource") =>
    new AppError(`${resource} not found`, 404, "NOT_FOUND"),

  conflict: (message: string) => new AppError(message, 409, "CONFLICT"),

  // Validation errors
  validation: (message: string, details?: Record<string, unknown>) =>
    new AppError(message, 400, "VALIDATION_ERROR", true, details),

  badRequest: (message: string) => new AppError(message, 400, "BAD_REQUEST"),

  // Server errors
  internal: (message = "An unexpected error occurred") =>
    new AppError(message, 500, "INTERNAL_ERROR", false),

  database: (message = "Database operation failed") =>
    new AppError(message, 500, "DATABASE_ERROR", false),

  // Rate limiting
  tooManyRequests: (message = "Too many requests, please try again later") =>
    new AppError(message, 429, "TOO_MANY_REQUESTS"),
};

export default AppError;

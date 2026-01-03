/**
 * Error response types
 */

export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    suggestion?: string;
  };
  timestamp: string;
  requestId: string;
}

// Authentication Errors
export const AUTH_ERRORS = {
  AUTH_001: { code: "AUTH_001", message: "Invalid email format" },
  AUTH_002: { code: "AUTH_002", message: "Email already registered" },
  AUTH_003: { code: "AUTH_003", message: "Invalid credentials" },
  AUTH_004: { code: "AUTH_004", message: "Account locked" },
  AUTH_005: { code: "AUTH_005", message: "Invalid or expired token" },
  AUTH_006: { code: "AUTH_006", message: "Email not verified" },
} as const;

// Subscription Errors
export const SUBSCRIPTION_ERRORS = {
  SUB_001: { code: "SUB_001", message: "Payment failed" },
  SUB_002: { code: "SUB_002", message: "Invalid tier selection" },
  SUB_003: { code: "SUB_003", message: "Feature not available in your tier" },
  SUB_004: { code: "SUB_004", message: "Subscription expired" },
  SUB_005: { code: "SUB_005", message: "Webhook validation failed" },
} as const;

// Content Errors
export const CONTENT_ERRORS = {
  CONTENT_001: { code: "CONTENT_001", message: "Domain not found" },
  CONTENT_002: { code: "CONTENT_002", message: "Task not found" },
  CONTENT_003: { code: "CONTENT_003", message: "Study guide not found" },
  CONTENT_004: { code: "CONTENT_004", message: "Flashcard limit reached" },
  CONTENT_005: { code: "CONTENT_005", message: "Question limit reached" },
} as const;

// Session Errors
export const SESSION_ERRORS = {
  SESSION_001: { code: "SESSION_001", message: "Session not found" },
  SESSION_002: { code: "SESSION_002", message: "Session already completed" },
  SESSION_003: { code: "SESSION_003", message: "Invalid answer submission" },
  SESSION_004: { code: "SESSION_004", message: "Mock exam time expired" },
} as const;

// Team Management Errors
export const TEAM_ERRORS = {
  TEAM_001: { code: "TEAM_001", message: "Not authorized" },
  TEAM_002: { code: "TEAM_002", message: "License limit reached" },
  TEAM_003: { code: "TEAM_003", message: "Invalid invitation token" },
  TEAM_004: { code: "TEAM_004", message: "Member not found" },
  TEAM_005: { code: "TEAM_005", message: "Cannot remove self as admin" },
} as const;

// Generic Errors
export const GENERIC_ERRORS = {
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  },
  VALIDATION_ERROR: { code: "VALIDATION_ERROR", message: "Validation failed" },
  NOT_FOUND: { code: "NOT_FOUND", message: "Resource not found" },
  UNAUTHORIZED: { code: "UNAUTHORIZED", message: "Authentication required" },
  FORBIDDEN: { code: "FORBIDDEN", message: "Access denied" },
  RATE_LIMITED: { code: "RATE_LIMITED", message: "Too many requests" },
} as const;

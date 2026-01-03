/**
 * Sanitization utilities for sensitive data redaction
 */

import type { SanitizationRule } from "./types";

/**
 * Default sensitive fields to redact
 */
const DEFAULT_SANITIZE_FIELDS = [
  "password",
  "passwd",
  "secret",
  "token",
  "apiKey",
  "api_key",
  "apikey",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "privateKey",
  "private_key",
  "ssn",
  "socialSecurityNumber",
  "creditCard",
  "cvv",
  "pin",
];

/**
 * Default sanitization rules
 */
const DEFAULT_RULES: SanitizationRule[] = [
  { field: "password", pattern: /./g, replacement: "*" },
  { field: "passwd", pattern: /./g, replacement: "*" },
  { field: "secret", pattern: /./g, replacement: "*" },
  { field: "token", pattern: /./g, replacement: "*" },
  { field: "apiKey", pattern: /./g, replacement: "*" },
  { field: "api_key", pattern: /./g, replacement: "*" },
  { field: "apikey", pattern: /./g, replacement: "*" },
  { field: "accessToken", pattern: /./g, replacement: "*" },
  { field: "access_token", pattern: /./g, replacement: "*" },
  { field: "refreshToken", pattern: /./g, replacement: "*" },
  { field: "refresh_token", pattern: /./g, replacement: "*" },
  { field: "privateKey", pattern: /./g, replacement: "*" },
  { field: "private_key", pattern: /./g, replacement: "*" },
  {
    field: "authorization",
    pattern: /Bearer .+/g,
    replacement: "Bearer [REDACTED]",
  },
  { field: "ssn", pattern: /\d{3}-\d{2}-\d{4}/g, replacement: "***-**-****" },
  {
    field: "creditCard",
    pattern: /\d{4} \d{4} \d{4} \d{4}/g,
    replacement: "**** **** **** ****",
  },
];

/**
 * Sanitize an object by redacting sensitive fields
 */
export function sanitize(
  obj: any,
  rules: SanitizationRule[] = DEFAULT_RULES,
): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitive types
  if (typeof obj !== "object") {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, rules));
  }

  // Handle objects
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const rule = rules.find((r) => lowerKey.includes(r.field.toLowerCase()));

    if (rule && typeof value === "string") {
      // Apply sanitization rule
      sanitized[key] = rule.pattern.test(value)
        ? value.replace(rule.pattern, rule.replacement)
        : value;
    } else if (typeof value === "object") {
      // Recursively sanitize nested objects
      sanitized[key] = sanitize(value, rules);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Create custom sanitization rules
 */
export function createSanitizationRules(
  fields: string[],
  replacement: string = "[REDACTED]",
): SanitizationRule[] {
  return fields.map((field) => ({
    field,
    pattern: /./g,
    replacement,
  }));
}

/**
 * Check if a field should be sanitized
 */
export function isSensitiveField(
  fieldName: string,
  fields: string[] = DEFAULT_SANITIZE_FIELDS,
): boolean {
  const lowerFieldName = fieldName.toLowerCase();
  return fields.some((field) => lowerFieldName.includes(field.toLowerCase()));
}

/**
 * Redact a value if it belongs to a sensitive field
 */
export function redact(
  fieldName: string,
  value: any,
  fields: string[] = DEFAULT_SANITIZE_FIELDS,
): any {
  if (!isSensitiveField(fieldName, fields)) {
    return value;
  }

  if (typeof value === "string") {
    return "*".repeat(Math.min(value.length, 10));
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return "[REDACTED]";
  }

  return value;
}

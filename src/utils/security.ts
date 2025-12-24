/**
 * Security utilities for input sanitization and validation
 * Addresses Issue #29: No Input Sanitization
 */

/**
 * HTML entities to escape for XSS prevention
 */
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param input - String to sanitize
 * @returns Sanitized string with HTML entities escaped
 */
export function escapeHtml(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }
    return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove HTML tags from string
 * @param input - String containing potential HTML
 * @returns String with HTML tags removed
 */
export function stripHtmlTags(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }
    return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for safe database storage and display
 * - Trims whitespace
 * - Removes null bytes
 * - Escapes HTML entities
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }
    return escapeHtml(
        input
            .trim()
            .replace(/\0/g, '') // Remove null bytes
            .replace(/\r\n/g, '\n') // Normalize line endings
    );
}

/**
 * Sanitize object values recursively
 * @param obj - Object to sanitize
 * @returns Object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized = { ...obj };

    for (const key in sanitized) {
        if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
            const value = sanitized[key];
            if (typeof value === 'string') {
                (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
            }
        }
    }

    return sanitized;
}

/**
 * Validate and sanitize UUID
 * @param uuid - String to validate as UUID
 * @returns Valid UUID or null
 */
export function sanitizeUuid(uuid: string): string | null {
    if (typeof uuid !== 'string') {
        return null;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const trimmed = uuid.trim().toLowerCase();

    return uuidRegex.test(trimmed) ? trimmed : null;
}

/**
 * Sanitize email address
 * @param email - Email to sanitize
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
    if (typeof email !== 'string') {
        return null;
    }

    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Sanitize integer input
 * @param value - Value to parse as integer
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param defaultValue - Default if parsing fails
 * @returns Sanitized integer within bounds
 */
export function sanitizeInteger(
    value: unknown,
    min: number = Number.MIN_SAFE_INTEGER,
    max: number = Number.MAX_SAFE_INTEGER,
    defaultValue: number = 0
): number {
    const parsed = parseInt(String(value), 10);

    if (isNaN(parsed)) {
        return defaultValue;
    }

    return Math.min(Math.max(parsed, min), max);
}

/**
 * Validate URL is safe (no javascript:, data:, etc.)
 * @param url - URL to validate
 * @returns Boolean indicating if URL is safe
 */
export function isUrlSafe(url: string): boolean {
    if (typeof url !== 'string') {
        return false;
    }

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

    for (const protocol of dangerousProtocols) {
        if (trimmed.startsWith(protocol)) {
            return false;
        }
    }

    // Only allow http, https, or relative URLs
    const safeProtocols = ['http://', 'https://', '/', '#'];

    return safeProtocols.some(protocol => trimmed.startsWith(protocol)) || !trimmed.includes(':');
}

/**
 * Generate a secure random string
 * @param length - Length of the string
 * @returns Random string
 */
export function generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }

    return result;
}

/**
 * Password strength calculation
 * @param password - Password to evaluate
 * @returns Score from 0-100
 */
export function calculatePasswordStrength(password: string): number {
    if (typeof password !== 'string' || password.length === 0) {
        return 0;
    }

    let score = 0;

    // Length scoring
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    // Entropy bonus for mixed characters
    const uniqueChars = new Set(password).size;
    if (uniqueChars > 8) score += 10;

    // Penalty for common patterns
    const commonPatterns = ['123', 'abc', 'qwerty', 'password', 'letmein'];
    const lowerPassword = password.toLowerCase();

    for (const pattern of commonPatterns) {
        if (lowerPassword.includes(pattern)) {
            score -= 20;
        }
    }

    return Math.max(0, Math.min(100, score));
}

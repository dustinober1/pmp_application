/**
 * Validation utilities for form inputs
 * Addresses HIGH-002: Email format validation
 */

/**
 * Validates email format using RFC 5322 compliant regex
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
	if (!email || typeof email !== 'string') {
		return false;
	}

	// RFC 5322 compliant email regex
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email.trim());
};

/**
 * Validates password strength against PMP Study Pro requirements
 * @param password - Password to validate
 * @returns Array of error messages (empty if password is valid)
 */
export const getPasswordErrors = (password: string): string[] => {
	const errors: string[] = [];

	if (!password || typeof password !== 'string') {
		errors.push('Password is required');
		return errors;
	}

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters');
	}

	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}

	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}

	if (!/\d/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	return errors;
};

/**
 * Checks if password meets all requirements
 * @param password - Password to validate
 * @returns true if password is valid, false otherwise
 */
export const isPasswordValid = (password: string): boolean => {
	return getPasswordErrors(password).length === 0;
};

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'strong';

/**
 * Calculates password strength score
 * @param password - Password to evaluate
 * @returns Strength level and score (0-6)
 */
export const calculatePasswordStrength = (
	password: string
): { strength: PasswordStrength; score: number } => {
	if (!password) return { strength: 'weak', score: 0 };

	let score = 0;

	// Length checks
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;

	// Complexity checks
	if (/[a-z]/.test(password)) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[^a-zA-Z0-9]/.test(password)) score++;

	if (score <= 2) return { strength: 'weak', score };
	if (score <= 4) return { strength: 'fair', score };
	return { strength: 'strong', score };
};

/**
 * Validates that a string is not empty after trimming
 * @param value - String to validate
 * @returns true if string is not empty, false otherwise
 */
export const isNotEmpty = (value: string): boolean => {
	return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Common error messages
 */
export const VALIDATION_ERRORS = {
	EMAIL_INVALID: 'Please enter a valid email address',
	EMAIL_REQUIRED: 'Email address is required',
	PASSWORD_REQUIRED: 'Password is required',
	PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
	PASSWORD_NO_UPPERCASE: 'Password must contain at least one uppercase letter',
	PASSWORD_NO_LOWERCASE: 'Password must contain at least one lowercase letter',
	PASSWORD_NO_NUMBER: 'Password must contain at least one number',
	FIELD_REQUIRED: 'This field is required'
} as const;

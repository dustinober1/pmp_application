import { z } from "zod";

/**
 * Password complexity requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter",
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter",
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number",
  )
  .refine(
    (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
  );

/**
 * Email validation with additional checks
 */
const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must not exceed 255 characters")
  .transform((email) => email.toLowerCase().trim());

/**
 * Name validation - sanitizes input
 */
const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must not exceed 100 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes",
  )
  .transform((name) => name.trim());

/**
 * Registration schema with strong password requirements
 */
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: nameSchema,
    lastName: nameSchema,
  }),
});

/**
 * Login schema - less strict password validation for login
 * (we don't want to reveal password policy during login)
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .transform((e) => e.toLowerCase().trim()),
    password: z.string().min(1, "Password is required"),
  }),
});

/**
 * Profile update schema
 */
export const updateProfileSchema = z.object({
  body: z
    .object({
      firstName: nameSchema.optional(),
      lastName: nameSchema.optional(),
    })
    .refine(
      (data) => data.firstName !== undefined || data.lastName !== undefined,
      "At least one field must be provided",
    ),
});

/**
 * Change password schema - requires current password and strong new password
 */
export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: passwordSchema,
    })
    .refine(
      (data) => data.currentPassword !== data.newPassword,
      "New password must be different from current password",
    ),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordSchema,
  }),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

/**
 * Logout schema
 */
export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
    logoutAll: z.boolean().optional(),
  }),
});

// Export individual schemas for reuse
export { passwordSchema, emailSchema, nameSchema };

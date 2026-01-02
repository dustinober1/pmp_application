import { z } from 'zod';

/**
 * Privacy Consent Validators
 */
export const consentUpdateSchema = z.object({
  cookieConsent: z.boolean(),
  privacyPolicyAccepted: z.boolean(),
  termsAccepted: z.boolean(),
});

export const consentWithdrawSchema = z.object({
  reason: z.string().optional(),
});

/**
 * Data Export Validators
 */
export const dataExportRequestSchema = z.object({
  includePaymentHistory: z.boolean().default(true),
  includeActivityLogs: z.boolean().default(true),
  emailMe: z.boolean().default(false),
});

/**
 * Account Deletion Validators
 */
export const accountDeletionRequestSchema = z.object({
  reason: z.string().max(500, 'Reason must not exceed 500 characters').optional(),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
});

export const cancelDeletionSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
});

/**
 * Admin Validators
 */
export const adminExportQuerySchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  userId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminDeletionQuerySchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional(),
  userId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminProcessExportSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
});

export const adminProcessDeletionSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  force: z.boolean().default(false), // bypass grace period
});

/**
 * Audit Log Validators
 */
export const auditLogQuerySchema = z.object({
  actionType: z
    .enum([
      'data_export',
      'account_deletion',
      'consent_given',
      'consent_withdrawn',
      'data_accessed',
      'account_soft_deleted',
      'account_hard_deleted',
    ])
    .optional(),
  entityType: z.enum(['user', 'consent', 'export_request', 'deletion_request']).optional(),
  userId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Type exports
export type ConsentUpdateDto = z.infer<typeof consentUpdateSchema>;
export type ConsentWithdrawDto = z.infer<typeof consentWithdrawSchema>;
export type DataExportRequestDto = z.infer<typeof dataExportRequestSchema>;
export type AccountDeletionRequestDto = z.infer<typeof accountDeletionRequestSchema>;
export type CancelDeletionDto = z.infer<typeof cancelDeletionSchema>;
export type AdminExportQueryDto = z.infer<typeof adminExportQuerySchema>;
export type AdminDeletionQueryDto = z.infer<typeof adminDeletionQuerySchema>;
export type AdminProcessExportDto = z.infer<typeof adminProcessExportSchema>;
export type AdminProcessDeletionDto = z.infer<typeof adminProcessDeletionSchema>;
export type AuditLogQueryDto = z.infer<typeof auditLogQuerySchema>;

/**
 * Privacy & Compliance Types for GDPR/CCPA
 */

// Consent Management
export interface PrivacyConsent {
  id: string;
  userId: string;
  cookieConsent: boolean;
  privacyPolicyAccepted: boolean;
  termsAccepted: boolean;
  consentVersion: string;
  consentIpAddress?: string;
  consentUserAgent?: string;
  consentedAt: Date;
  updatedAt: Date;
  withdrawnAt?: Date;
  withdrawnReason?: string;
}

export interface ConsentUpdateInput {
  cookieConsent: boolean;
  privacyPolicyAccepted: boolean;
  termsAccepted: boolean;
}

// Data Export
export interface DataExportRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestId: string;
  requestedAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  downloadUrl?: string;
  fileSize?: number;
  errorMessage?: string;
  processedBy?: string;
}

export interface UserDataExport {
  // User profile
  profile: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  // Subscription & billing
  subscription?: {
    tier: string;
    status: string;
    startDate: Date;
    endDate: Date;
  };
  paymentHistory: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: Date;
  }>;

  // Study progress
  studyProgress: {
    completedSections: string[];
    lastChapter?: string;
    lastSection?: string;
  };
  flashcardReviews: number;
  questionAttempts: number;

  // Practice sessions
  practiceSessions: Array<{
    id: string;
    totalQuestions: number;
    correctAnswers: number;
    completedAt?: Date;
  }>;

  // Activity logs
  recentActivity: Array<{
    type: string;
    targetId: string;
    createdAt: Date;
  }>;

  // Team memberships (if any)
  teamMemberships: Array<{
    teamName: string;
    role: string;
    joinedAt: Date;
  }>;

  // Metadata
  exportGeneratedAt: Date;
  exportVersion: string;
}

// Account Deletion
export interface AccountDeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  requestedAt: Date;
  gracePeriodEnds: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  deletionReason?: string;
  ipAddress?: string;
  userAgent?: string;
  softDeletedAt?: Date;
  hardDeleteScheduledFor?: Date;
  processedBy?: string;
}

export interface DeletionRequestInput {
  reason?: string;
  confirmPassword: string;
}

// Audit Logs
export interface PrivacyAuditLog {
  id: string;
  actionType:
    | 'data_export'
    | 'account_deletion'
    | 'consent_given'
    | 'consent_withdrawn'
    | 'data_accessed'
    | 'account_soft_deleted'
    | 'account_hard_deleted';
  entityType: 'user' | 'consent' | 'export_request' | 'deletion_request';
  entityId: string;
  userId?: string;
  performedBy?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  details?: Record<string, unknown>;
  status: 'success' | 'failed' | 'cancelled';
  createdAt: Date;
}

// Admin Dashboard
export interface AdminExportStats {
  totalRequests: number;
  pendingRequests: number;
  completedExports: number;
  failedExports: number;
  averageProcessingTime: number; // in minutes
}

export interface AdminDeletionStats {
  totalRequests: number;
  pendingRequests: number;
  inGracePeriod: number;
  completedDeletions: number;
  cancelledDeletions: number;
}

export interface AdminComplianceDashboard {
  exportStats: AdminExportStats;
  deletionStats: AdminDeletionStats;
  recentActivity: PrivacyAuditLog[];
  pendingExports: DataExportRequest[];
  pendingDeletions: AccountDeletionRequest[];
}

// Error Codes
export const PRIVACY_ERRORS = {
  PRIVACY_001: {
    code: 'PRIVACY_001',
    message: 'Export request already exists. Please wait for current request to complete.',
  },
  PRIVACY_002: {
    code: 'PRIVACY_002',
    message: 'Export not found or has expired.',
  },
  PRIVACY_003: {
    code: 'PRIVACY_003',
    message: 'Deletion request already exists.',
  },
  PRIVACY_004: {
    code: 'PRIVACY_004',
    message: 'Invalid deletion request.',
  },
  PRIVACY_005: {
    code: 'PRIVACY_005',
    message: 'Grace period has expired. Cannot cancel deletion.',
  },
  PRIVACY_006: {
    code: 'PRIVACY_006',
    message: 'Admin access required.',
  },
} as const;

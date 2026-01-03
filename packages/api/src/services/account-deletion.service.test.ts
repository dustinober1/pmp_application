import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { accountDeletionService } from './account-deletion.service';
import prisma from '../config/database';

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    accountDeletionRequest: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userSubscription: {
      updateMany: vi.fn(),
    },
    paymentTransaction: {
      updateMany: vi.fn(),
    },
    privacyAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('bcrypt');

describe('AccountDeletionService', () => {
  const mockUserId = 'user-123';
  const mockRequestId = 'deletion-123';
  const mockDeletionRequest = {
    id: 'deletion-123',
    userId: mockUserId,
    status: 'pending',
    requestedAt: new Date(),
    gracePeriodEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    completedAt: null,
    cancelledAt: null,
    deletionReason: 'No longer needed',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    softDeletedAt: null,
    hardDeleteScheduledFor: null,
    processedBy: null,
  };

  const mockUser = {
    id: mockUserId,
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
  });

  describe('requestDeletion', () => {
    it('should create deletion request successfully', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.accountDeletionRequest.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.accountDeletionRequest.create).mockResolvedValue(mockDeletionRequest);
      vi.mocked(prisma.privacyAuditLog.create).mockResolvedValue({} as any);

      const result = await accountDeletionService.requestDeletion(mockUserId, {
        confirmPassword: 'password123',
        reason: 'No longer needed',
      });

      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUserId);
      expect(result.status).toBe('pending');
      expect(prisma.accountDeletionRequest.create).toHaveBeenCalled();
      expect(prisma.privacyAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actionType: 'account_deletion',
          entityType: 'deletion_request',
        }),
      });
    });

    it('should verify password before creating request', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false);
      vi.mocked(prisma.accountDeletionRequest.findFirst).mockResolvedValue(null);

      await expect(
        accountDeletionService.requestDeletion(mockUserId, {
          confirmPassword: 'wrong-password',
        })
      ).rejects.toThrow('Invalid password');
    });

    it('should throw error when pending deletion exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.accountDeletionRequest.findFirst).mockResolvedValue({
        status: 'pending',
      });

      await expect(
        accountDeletionService.requestDeletion(mockUserId, {
          confirmPassword: 'password123',
        })
      ).rejects.toThrow('Deletion request already exists');
    });
  });

  describe('cancelDeletion', () => {
    it('should cancel pending deletion', async () => {
      vi.mocked(prisma.accountDeletionRequest.findUnique).mockResolvedValue(mockDeletionRequest);
      vi.mocked(prisma.accountDeletionRequest.update).mockResolvedValue({
        ...mockDeletionRequest,
        status: 'cancelled',
        cancelledAt: new Date(),
      });
      vi.mocked(prisma.privacyAuditLog.create).mockResolvedValue({} as any);

      await accountDeletionService.cancelDeletion(mockUserId, mockRequestId);

      expect(prisma.accountDeletionRequest.update).toHaveBeenCalledWith({
        where: { id: mockRequestId },
        data: expect.objectContaining({
          status: 'cancelled',
          cancelledAt: expect.any(Date),
        }),
      });
    });

    it('should throw error when grace period has ended', async () => {
      const expiredRequest = {
        ...mockDeletionRequest,
        gracePeriodEnds: new Date(Date.now() - 1000),
      };

      vi.mocked(prisma.accountDeletionRequest.findUnique).mockResolvedValue(expiredRequest);

      await expect(
        accountDeletionService.cancelDeletion(mockUserId, mockRequestId)
      ).rejects.toThrow('Grace period has expired');
    });

    it('should throw error for deletion in progress', async () => {
      const processingRequest = {
        ...mockDeletionRequest,
        status: 'processing',
      };

      vi.mocked(prisma.accountDeletionRequest.findUnique).mockResolvedValue(processingRequest);

      await expect(
        accountDeletionService.cancelDeletion(mockUserId, mockRequestId)
      ).rejects.toThrow('Cannot cancel deletion that is already in progress');
    });
  });

  describe('getDeletionStatus', () => {
    it('should return deletion status', async () => {
      vi.mocked(prisma.accountDeletionRequest.findFirst).mockResolvedValue(mockDeletionRequest);

      const result = await accountDeletionService.getDeletionStatus(mockUserId);

      expect(result).toBeDefined();
      expect(result?.status).toBe('pending');
      expect(result?.gracePeriodEnds).toBeDefined();
    });

    it('should return null when no deletion exists', async () => {
      vi.mocked(prisma.accountDeletionRequest.findFirst).mockResolvedValue(null);

      const result = await accountDeletionService.getDeletionStatus(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getAllDeletions', () => {
    it('should return all deletions with filters', async () => {
      const mockDeletions = [mockDeletionRequest];
      vi.mocked(prisma.accountDeletionRequest.findMany).mockResolvedValue(mockDeletions);
      vi.mocked(prisma.accountDeletionRequest.count).mockResolvedValue(1);

      const result = await accountDeletionService.getAllDeletions({
        status: 'pending',
        limit: 10,
      });

      expect(result.deletions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.accountDeletionRequest.findMany).toHaveBeenCalledWith({
        where: { status: 'pending' },
        orderBy: { requestedAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('adminProcessDeletion', () => {
    it('should process deletion with grace period ended', async () => {
      const expiredRequest = {
        ...mockDeletionRequest,
        gracePeriodEnds: new Date(Date.now() - 1000),
      };

      vi.mocked(prisma.accountDeletionRequest.findUnique).mockResolvedValue(expiredRequest);
      vi.spyOn(accountDeletionService as any, 'softDelete').mockResolvedValue(undefined);
      vi.mocked(prisma.accountDeletionRequest.update).mockResolvedValue(expiredRequest);

      await accountDeletionService.adminProcessDeletion(mockRequestId, 'admin-user', false);

      expect(accountDeletionService['softDelete']).toHaveBeenCalled();
    });

    it('should require force flag for active grace period', async () => {
      vi.mocked(prisma.accountDeletionRequest.findUnique).mockResolvedValue(mockDeletionRequest);

      await expect(
        accountDeletionService.adminProcessDeletion(mockRequestId, 'admin-user', false)
      ).rejects.toThrow('Grace period has not ended');
    });

    it('should allow bypass with force flag', async () => {
      vi.mocked(prisma.accountDeletionRequest.findUnique).mockResolvedValue(mockDeletionRequest);
      vi.spyOn(accountDeletionService as any, 'softDelete').mockResolvedValue(undefined);
      vi.mocked(prisma.accountDeletionRequest.update).mockResolvedValue(mockDeletionRequest);

      await accountDeletionService.adminProcessDeletion(mockRequestId, 'admin-user', true);

      expect(accountDeletionService['softDelete']).toHaveBeenCalled();
    });
  });

  describe('processPendingDeletions', () => {
    it('should process all pending deletions past grace period', async () => {
      const expiredDeletions = [
        { ...mockDeletionRequest, id: 'del-1', gracePeriodEnds: new Date(Date.now() - 1000) },
        { ...mockDeletionRequest, id: 'del-2', gracePeriodEnds: new Date(Date.now() - 2000) },
      ];

      vi.mocked(prisma.accountDeletionRequest.findMany).mockResolvedValue(expiredDeletions);
      vi.spyOn(accountDeletionService as any, 'softDelete').mockResolvedValue(undefined);
      vi.mocked(prisma.accountDeletionRequest.update).mockResolvedValue({});

      const result = await accountDeletionService.processPendingDeletions();

      expect(result.processed).toBe(2);
      expect(accountDeletionService['softDelete']).toHaveBeenCalledTimes(2);
    });

    it('should handle processing failures gracefully', async () => {
      const expiredDeletions = [
        { ...mockDeletionRequest, gracePeriodEnds: new Date(Date.now() - 1000) },
      ];

      vi.mocked(prisma.accountDeletionRequest.findMany).mockResolvedValue(expiredDeletions);
      vi.spyOn(accountDeletionService as any, 'softDelete').mockRejectedValue(
        new Error('Database error')
      );
      vi.mocked(prisma.accountDeletionRequest.update).mockResolvedValue({});

      const result = await accountDeletionService.processPendingDeletions();

      expect(result.processed).toBe(0);
    });
  });
});

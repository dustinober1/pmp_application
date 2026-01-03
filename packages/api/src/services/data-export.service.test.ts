import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataExportService } from './data-export.service';
import prisma from '../config/database';

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    dataExportRequest: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    userSubscription: {
      findFirst: vi.fn(),
    },
    paymentTransaction: {
      findMany: vi.fn(),
    },
    flashcardReview: {
      count: vi.fn(),
    },
    questionAttempt: {
      count: vi.fn(),
    },
    practiceSession: {
      findMany: vi.fn(),
    },
    studyActivity: {
      findMany: vi.fn(),
    },
    teamMember: {
      findMany: vi.fn(),
    },
    ebookProgress: {
      findUnique: vi.fn(),
    },
    privacyAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe('DataExportService', () => {
  const mockUserId = 'user-123';
  const mockRequestId = 'request-123';
  const mockExportRequest = {
    id: 'export-123',
    userId: mockUserId,
    status: 'completed',
    requestId: mockRequestId,
    requestedAt: new Date(),
    completedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    downloadUrl: `/api/user/data-export/${mockRequestId}/download`,
    fileSize: 1024,
    errorMessage: null,
    processedBy: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(dataExportService as any, 'processExport').mockResolvedValue(undefined);
  });

  describe('requestExport', () => {
    it('should create export request successfully', async () => {
      vi.mocked(prisma.dataExportRequest.findFirst)
        .mockResolvedValueOnce(null) // no pending export
        .mockResolvedValueOnce(null); // no recent export
      vi.mocked(prisma.dataExportRequest.create).mockResolvedValue(mockExportRequest);
      vi.mocked(prisma.privacyAuditLog.create).mockResolvedValue({} as any);

      const result = await dataExportService.requestExport(mockUserId, {});

      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUserId);
      expect(result.requestId).toBe(mockRequestId);
      expect(prisma.dataExportRequest.create).toHaveBeenCalled();
      expect(prisma.privacyAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actionType: 'data_export',
          entityType: 'export_request',
          userId: mockUserId,
        }),
      });
    });

    it('should throw error when pending export exists', async () => {
      vi.mocked(prisma.dataExportRequest.findFirst).mockResolvedValue({
        status: 'pending',
      });

      await expect(dataExportService.requestExport(mockUserId, {})).rejects.toThrow(
        'Export request already exists'
      );
    });

    it('should enforce rate limiting', async () => {
      vi.mocked(prisma.dataExportRequest.findFirst)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          status: 'completed',
          requestedAt: new Date(), // recent export
        });

      await expect(dataExportService.requestExport(mockUserId, {})).rejects.toThrow(
        'You can request an export once every 24 hours'
      );
    });
  });

  describe('getExportStatus', () => {
    it('should return export status', async () => {
      vi.mocked(prisma.dataExportRequest.findUnique).mockResolvedValue(mockExportRequest);

      const result = await dataExportService.getExportStatus(mockUserId, mockRequestId);

      expect(result).toBeDefined();
      expect(result.requestId).toBe(mockRequestId);
      expect(result.status).toBe('completed');
    });

    it('should throw error for non-existent export', async () => {
      vi.mocked(prisma.dataExportRequest.findUnique).mockResolvedValue(null);

      await expect(dataExportService.getExportStatus(mockUserId, 'non-existent')).rejects.toThrow(
        'Export not found or has expired'
      );
    });

    it('should deny access to exports from other users', async () => {
      const otherUserExport = { ...mockExportRequest, userId: 'other-user' };
      vi.mocked(prisma.dataExportRequest.findUnique).mockResolvedValue(otherUserExport);

      await expect(dataExportService.getExportStatus(mockUserId, mockRequestId)).rejects.toThrow(
        'Export not found or has expired'
      );
    });
  });

  describe('getExportHistory', () => {
    it('should return user export history', async () => {
      const mockExports = [mockExportRequest];
      vi.mocked(prisma.dataExportRequest.findMany).mockResolvedValue(mockExports);

      const result = await dataExportService.getExportHistory(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].requestId).toBe(mockRequestId);
      expect(prisma.dataExportRequest.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { requestedAt: 'desc' },
        take: 10,
      });
    });
  });

  describe('downloadExport', () => {
    it('should download completed export', async () => {
      vi.mocked(prisma.dataExportRequest.findUnique).mockResolvedValue(mockExportRequest);
      vi.spyOn(dataExportService as any, 'generateUserDataExport').mockResolvedValue({
        profile: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
        exportGeneratedAt: new Date(),
        exportVersion: '1.0',
      });
      vi.mocked(prisma.privacyAuditLog.create).mockResolvedValue({} as any);

      const result = await dataExportService.downloadExport(mockUserId, mockRequestId);

      expect(result).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(prisma.privacyAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actionType: 'data_accessed',
        }),
      });
    });

    it('should throw error for non-ready export', async () => {
      const pendingExport = { ...mockExportRequest, status: 'pending' };
      vi.mocked(prisma.dataExportRequest.findUnique).mockResolvedValue(pendingExport);

      await expect(dataExportService.downloadExport(mockUserId, mockRequestId)).rejects.toThrow(
        'Export is not ready'
      );
    });

    it('should throw error for expired export', async () => {
      const expiredExport = {
        ...mockExportRequest,
        status: 'completed',
        expiresAt: new Date(Date.now() - 1000),
      };
      vi.mocked(prisma.dataExportRequest.findUnique).mockResolvedValue(expiredExport);

      await expect(dataExportService.downloadExport(mockUserId, mockRequestId)).rejects.toThrow(
        'Export has expired'
      );
    });
  });

  describe('getAllExports', () => {
    it('should return all exports with filters', async () => {
      const mockExports = [mockExportRequest];
      vi.mocked(prisma.dataExportRequest.findMany).mockResolvedValue(mockExports);
      vi.mocked(prisma.dataExportRequest.count).mockResolvedValue(1);

      const result = await dataExportService.getAllExports({
        status: 'completed',
        limit: 10,
      });

      expect(result.exports).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.dataExportRequest.findMany).toHaveBeenCalledWith({
        where: { status: 'completed' },
        orderBy: { requestedAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('adminProcessExport', () => {
    it('should process pending export', async () => {
      vi.mocked(prisma.dataExportRequest.findUnique).mockResolvedValue({
        ...mockExportRequest,
        status: 'pending',
      });
      vi.mocked(prisma.dataExportRequest.update).mockResolvedValue(mockExportRequest);

      await dataExportService.adminProcessExport('export-123', 'admin-user');

      expect(dataExportService['processExport']).toHaveBeenCalled();
    });

    it('should throw error for completed export', async () => {
      vi.mocked(prisma.dataExportRequest.findUnique).mockResolvedValue(mockExportRequest);

      await expect(
        dataExportService.adminProcessExport('export-123', 'admin-user')
      ).rejects.toThrow('Export already completed');
    });
  });
});

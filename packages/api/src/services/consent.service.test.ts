import { describe, it, expect, beforeEach, vi } from 'vitest';
import { consentService } from './consent.service';
import prisma from '../config/database';

// Mock Prisma
vi.mock('../config/database', () => ({
  default: {
    privacyConsent: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    privacyAuditLog: {
      create: vi.fn(),
    },
  },
}));

describe('ConsentService', () => {
  const mockUserId = 'user-123';
  const mockConsent = {
    id: 'consent-123',
    userId: mockUserId,
    cookieConsent: true,
    privacyPolicyAccepted: true,
    termsAccepted: true,
    consentVersion: '1.0',
    consentIpAddress: '127.0.0.1',
    consentUserAgent: 'Mozilla/5.0',
    consentedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    withdrawnAt: null,
    withdrawnReason: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserConsent', () => {
    it('should return user consent when it exists', async () => {
      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(mockConsent);

      const result = await consentService.getUserConsent(mockUserId);

      expect(result).toEqual({
        id: mockConsent.id,
        userId: mockConsent.userId,
        cookieConsent: true,
        privacyPolicyAccepted: true,
        termsAccepted: true,
        consentVersion: '1.0',
        consentIpAddress: '127.0.0.1',
        consentUserAgent: 'Mozilla/5.0',
        consentedAt: mockConsent.consentedAt,
        updatedAt: mockConsent.updatedAt,
        withdrawnAt: null,
        withdrawnReason: null,
      });
      expect(prisma.privacyConsent.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });

    it('should return null when consent does not exist', async () => {
      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(null);

      const result = await consentService.getUserConsent(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('updateConsent', () => {
    it('should create new consent when it does not exist', async () => {
      const consentData = {
        cookieConsent: true,
        privacyPolicyAccepted: true,
        termsAccepted: true,
      };
      const metadata = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.privacyConsent.create).mockResolvedValue(mockConsent);
      vi.mocked(prisma.privacyAuditLog.create).mockResolvedValue({} as any);

      const result = await consentService.updateConsent(mockUserId, consentData, metadata);

      expect(prisma.privacyConsent.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          ...consentData,
          ...metadata,
        },
      });
      expect(prisma.privacyAuditLog.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should update existing consent', async () => {
      const consentData = {
        cookieConsent: false,
        privacyPolicyAccepted: false,
        termsAccepted: false,
      };

      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(mockConsent);
      vi.mocked(prisma.privacyConsent.update).mockResolvedValue({
        ...mockConsent,
        ...consentData,
      });
      vi.mocked(prisma.privacyAuditLog.create).mockResolvedValue({} as any);

      const result = await consentService.updateConsent(mockUserId, consentData);

      expect(prisma.privacyConsent.update).toHaveBeenCalled();
      expect(prisma.privacyAuditLog.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should clear withdrawal when consent is given again', async () => {
      const consentData = {
        cookieConsent: true,
        privacyPolicyAccepted: true,
        termsAccepted: true,
      };
      const existingConsent = {
        ...mockConsent,
        cookieConsent: false,
        withdrawnAt: new Date(),
        withdrawnReason: 'User requested',
      };

      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(existingConsent);
      vi.mocked(prisma.privacyConsent.update).mockResolvedValue(mockConsent);
      vi.mocked(prisma.privacyAuditLog.create).mockResolvedValue({} as any);

      await consentService.updateConsent(mockUserId, consentData);

      const updateCall = vi.mocked(prisma.privacyConsent.update).mock.calls[0];
      expect(updateCall[0].data.withdrawnAt).toBeNull();
      expect(updateCall[0].data.withdrawnReason).toBeNull();
    });
  });

  describe('withdrawConsent', () => {
    it('should withdraw existing consent', async () => {
      const reason = 'No longer want to be tracked';
      const metadata = {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(mockConsent);
      vi.mocked(prisma.privacyConsent.update).mockResolvedValue({
        ...mockConsent,
        cookieConsent: false,
        privacyPolicyAccepted: false,
        termsAccepted: false,
        withdrawnAt: new Date(),
        withdrawnReason: reason,
      });
      vi.mocked(prisma.privacyAuditLog.create).mockResolvedValue({} as any);

      await consentService.withdrawConsent(mockUserId, reason, metadata);

      expect(prisma.privacyConsent.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          cookieConsent: false,
          privacyPolicyAccepted: false,
          termsAccepted: false,
          withdrawnAt: expect.any(Date),
          withdrawnReason: reason,
        },
      });
      expect(prisma.privacyAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actionType: 'consent_withdrawn',
          entityType: 'consent',
          entityId: mockConsent.id,
          userId: mockUserId,
        }),
      });
    });

    it('should do nothing when consent does not exist', async () => {
      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(null);

      await consentService.withdrawConsent(mockUserId, 'Some reason');

      expect(prisma.privacyConsent.update).not.toHaveBeenCalled();
    });
  });

  describe('hasConsent', () => {
    it('should return true when user has given consent', async () => {
      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(mockConsent);

      const result = await consentService.hasConsent(mockUserId, 'cookies');

      expect(result).toBe(true);
    });

    it('should return false when consent has been withdrawn', async () => {
      const withdrawnConsent = {
        ...mockConsent,
        withdrawnAt: new Date(),
      };

      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(withdrawnConsent);

      const result = await consentService.hasConsent(mockUserId, 'cookies');

      expect(result).toBe(false);
    });

    it('should return false when consent does not exist', async () => {
      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(null);

      const result = await consentService.hasConsent(mockUserId, 'cookies');

      expect(result).toBe(false);
    });

    it('should check specific consent types', async () => {
      vi.mocked(prisma.privacyConsent.findUnique).mockResolvedValue(mockConsent);

      const cookieConsent = await consentService.hasConsent(mockUserId, 'cookies');
      const privacyConsent = await consentService.hasConsent(mockUserId, 'privacy');
      const termsConsent = await consentService.hasConsent(mockUserId, 'terms');

      expect(cookieConsent).toBe(true);
      expect(privacyConsent).toBe(true);
      expect(termsConsent).toBe(true);
    });
  });
});

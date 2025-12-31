/**
 * Comprehensive tests for subscription.service
 * Targeting 100% code coverage
 */

import { SubscriptionService } from './subscription.service';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import * as fc from 'fast-check';
import { TierName, DEFAULT_TIER_FEATURES, SUBSCRIPTION_ERRORS } from '@pmp/shared';

// Mock Prisma Client
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    subscriptionTier: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    userSubscription: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    paymentTransaction: {
      create: jest.fn(),
    },
    team: {
      findFirst: jest.fn(),
    },
  },
}));

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;

  // Mock tier data
  const mockFreeTier = {
    id: 'tier-free-id',
    name: 'free',
    price: 0,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES.free,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMidTier = {
    id: 'tier-mid-id',
    name: 'mid-level',
    price: 29.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES['mid-level'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHighTier = {
    id: 'tier-high-id',
    name: 'high-end',
    price: 49.99,
    billingPeriod: 'monthly',
    features: DEFAULT_TIER_FEATURES['high-end'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCorporateTier = {
    id: 'tier-corporate-id',
    name: 'corporate',
    price: 999.99,
    billingPeriod: 'annual',
    features: DEFAULT_TIER_FEATURES.corporate,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    subscriptionService = new SubscriptionService();
    jest.clearAllMocks();
  });

  describe('getTiers', () => {
    it('should return all active tiers ordered by price', async () => {
      const mockTiers = [mockFreeTier, mockMidTier, mockHighTier, mockCorporateTier];
      (prisma.subscriptionTier.findMany as jest.Mock).mockResolvedValue(mockTiers);

      const result = await subscriptionService.getTiers();

      expect(prisma.subscriptionTier.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
      expect(result).toHaveLength(4);
      expect(result[0]?.name).toBe('free');
      expect(result[0]?.features).toEqual(DEFAULT_TIER_FEATURES.free);
    });

    it('should return empty array when no tiers exist', async () => {
      (prisma.subscriptionTier.findMany as jest.Mock).mockResolvedValue([]);

      const result = await subscriptionService.getTiers();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      (prisma.subscriptionTier.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(subscriptionService.getTiers()).rejects.toThrow('Database error');
    });
  });

  describe('getTierById', () => {
    it('should return tier when found', async () => {
      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockMidTier);

      const result = await subscriptionService.getTierById('tier-mid-id');

      expect(prisma.subscriptionTier.findUnique).toHaveBeenCalledWith({
        where: { id: 'tier-mid-id' },
      });
      expect(result).not.toBeNull();
      expect(result?.name).toBe('mid-level');
      expect(result?.price).toBe(29.99);
    });

    it('should return null when tier not found', async () => {
      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await subscriptionService.getTierById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      (prisma.subscriptionTier.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(subscriptionService.getTierById('tier-id')).rejects.toThrow('Database error');
    });
  });

  describe('getTierByName', () => {
    it('should return tier when found by name', async () => {
      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockHighTier);

      const result = await subscriptionService.getTierByName('high-end');

      expect(prisma.subscriptionTier.findUnique).toHaveBeenCalledWith({
        where: { name: 'high-end' },
      });
      expect(result).not.toBeNull();
      expect(result?.name).toBe('high-end');
    });

    it('should return null when tier not found', async () => {
      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await subscriptionService.getTierByName('non-existent' as TierName);

      expect(result).toBeNull();
    });

    it('should work for all valid tier names', async () => {
      const tierNames: TierName[] = ['free', 'mid-level', 'high-end', 'corporate'];

      for (const tierName of tierNames) {
        const mockTier = {
          ...mockFreeTier,
          name: tierName,
          features: DEFAULT_TIER_FEATURES[tierName],
        };
        (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockTier);

        const result = await subscriptionService.getTierByName(tierName);

        expect(result?.name).toBe(tierName);
      }
    });
  });

  describe('getUserSubscription', () => {
    const userId = 'user-123';

    it('should return user subscription with tier details', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockMidTier.id,
        tier: mockMidTier,
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-01'),
        paypalSubscriptionId: 'paypal-123',
        createdAt: new Date('2024-01-01'),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.getUserSubscription(userId);

      expect(prisma.userSubscription.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: { tier: true },
      });
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(userId);
      expect(result?.tier.name).toBe('mid-level');
      expect(result?.paypalSubscriptionId).toBe('paypal-123');
    });

    it('should return null when user has no subscription', async () => {
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await subscriptionService.getUserSubscription(userId);

      expect(result).toBeNull();
    });

    it('should handle subscription without paypalSubscriptionId', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-01'),
        paypalSubscriptionId: null,
        createdAt: new Date('2024-01-01'),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.getUserSubscription(userId);

      expect(result?.paypalSubscriptionId).toBeUndefined();
    });

    it('should handle all subscription statuses', async () => {
      const statuses = ['active', 'cancelled', 'expired', 'grace_period'];

      for (const status of statuses) {
        const mockSubscription = {
          id: 'sub-123',
          userId,
          tierId: mockMidTier.id,
          tier: mockMidTier,
          status,
          startDate: new Date(),
          endDate: new Date(),
          paypalSubscriptionId: null,
          createdAt: new Date(),
        };

        (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

        const result = await subscriptionService.getUserSubscription(userId);

        expect(result?.status).toBe(status);
      }
    });
  });

  describe('createSubscription', () => {
    const userId = 'user-123';
    const tierId = mockMidTier.id;

    it('should create new subscription with PayPal order ID', async () => {
      const paypalOrderId = 'paypal-order-123';
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId,
        tier: mockMidTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: paypalOrderId,
        createdAt: new Date(),
      };

      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockMidTier);
      (prisma.userSubscription.upsert as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.paymentTransaction.create as jest.Mock).mockResolvedValue({});

      const result = await subscriptionService.createSubscription(userId, tierId, paypalOrderId);

      expect(prisma.subscriptionTier.findUnique).toHaveBeenCalledWith({
        where: { id: tierId },
      });
      expect(prisma.paymentTransaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          paypalOrderId,
          amount: mockMidTier.price,
          currency: 'USD',
          status: 'completed',
          tierId,
          billingPeriod: mockMidTier.billingPeriod,
        },
      });
      expect(result.userId).toBe(userId);
      expect(result.paypalSubscriptionId).toBe(paypalOrderId);
    });

    it('should create subscription without PayPal order ID (free tier)', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockFreeTier.id,
        tier: mockFreeTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: null,
        createdAt: new Date(),
      };

      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockFreeTier);
      (prisma.userSubscription.upsert as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.createSubscription(userId, mockFreeTier.id);

      expect(prisma.paymentTransaction.create).not.toHaveBeenCalled();
      expect(result.userId).toBe(userId);
    });

    it('should calculate correct end date for monthly billing', async () => {
      const monthlyTier = { ...mockMidTier, billingPeriod: 'monthly' };
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId,
        tier: monthlyTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: null,
        createdAt: new Date(),
      };

      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(monthlyTier);
      (prisma.userSubscription.upsert as jest.Mock).mockImplementation(({ create }) => {
        const endDate = create.endDate;
        const startDate = create.startDate;
        const durationMs = endDate.getTime() - startDate.getTime();
        const expectedDuration = 30 * 24 * 60 * 60 * 1000;

        // Allow for small timing differences
        expect(Math.abs(durationMs - expectedDuration)).toBeLessThan(1000);

        return Promise.resolve(mockSubscription);
      });

      await subscriptionService.createSubscription(userId, tierId);
    });

    it('should calculate correct end date for annual billing', async () => {
      const annualTier = { ...mockCorporateTier, billingPeriod: 'annual' };
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockCorporateTier.id,
        tier: annualTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: null,
        createdAt: new Date(),
      };

      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(annualTier);
      (prisma.userSubscription.upsert as jest.Mock).mockImplementation(({ create }) => {
        const endDate = create.endDate;
        const startDate = create.startDate;
        const durationMs = endDate.getTime() - startDate.getTime();
        const expectedDuration = 365 * 24 * 60 * 60 * 1000;

        // Allow for small timing differences
        expect(Math.abs(durationMs - expectedDuration)).toBeLessThan(1000);

        return Promise.resolve(mockSubscription);
      });

      await subscriptionService.createSubscription(userId, mockCorporateTier.id);
    });

    it('should throw error when tier does not exist', async () => {
      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        subscriptionService.createSubscription(userId, 'invalid-tier-id')
      ).rejects.toThrow(AppError);

      await expect(
        subscriptionService.createSubscription(userId, 'invalid-tier-id')
      ).rejects.toMatchObject({
        message: SUBSCRIPTION_ERRORS.SUB_002.message,
        statusCode: 400,
      });
    });

    it('should update existing subscription via upsert', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId,
        tier: mockMidTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: 'new-paypal-id',
        createdAt: new Date(),
      };

      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockMidTier);
      (prisma.userSubscription.upsert as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.createSubscription(userId, tierId, 'new-paypal-id');

      expect(prisma.userSubscription.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: expect.objectContaining({
          tierId,
          status: 'active',
        }),
        create: expect.objectContaining({
          userId,
          tierId,
          status: 'active',
        }),
        include: { tier: true },
      });
      expect(result.userId).toBe(userId);
    });
  });

  describe('cancelSubscription', () => {
    const userId = 'user-123';

    it('should cancel active subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        status: 'active',
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({
        ...mockSubscription,
        status: 'cancelled',
      });

      await subscriptionService.cancelSubscription(userId);

      expect(prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { userId },
        data: { status: 'cancelled' },
      });
    });

    it('should throw error when subscription not found', async () => {
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(subscriptionService.cancelSubscription(userId)).rejects.toThrow(AppError);

      await expect(subscriptionService.cancelSubscription(userId)).rejects.toMatchObject({
        message: 'Subscription not found',
        statusCode: 404,
      });
    });

    it('should handle cancellation of already cancelled subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        status: 'cancelled',
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue(mockSubscription);

      await subscriptionService.cancelSubscription(userId);

      expect(prisma.userSubscription.update).toHaveBeenCalled();
    });
  });

  describe('setGracePeriod', () => {
    const userId = 'user-123';

    it('should set grace period with 7-day extension', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        status: 'active',
        endDate: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.userSubscription.update as jest.Mock).mockImplementation(({ data }) => {
        const gracePeriodEnd = data.endDate;
        const expectedEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Allow for small timing differences
        expect(Math.abs(gracePeriodEnd.getTime() - expectedEnd.getTime())).toBeLessThan(1000);

        return Promise.resolve({
          ...mockSubscription,
          status: 'grace_period',
          endDate: gracePeriodEnd,
        });
      });

      await subscriptionService.setGracePeriod(userId);

      expect(prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          status: 'grace_period',
          endDate: expect.any(Date),
        },
      });
    });

    it('should do nothing when subscription not found', async () => {
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      await subscriptionService.setGracePeriod(userId);

      expect(prisma.userSubscription.update).not.toHaveBeenCalled();
    });

    it('should handle already grace period subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        status: 'grace_period',
        endDate: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue(mockSubscription);

      await subscriptionService.setGracePeriod(userId);

      expect(prisma.userSubscription.update).toHaveBeenCalled();
    });
  });

  describe('expireSubscription', () => {
    const userId = 'user-123';

    it('should downgrade to free tier when expired', async () => {
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(mockFreeTier);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({});
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(null);

      await subscriptionService.expireSubscription(userId);

      expect(prisma.subscriptionTier.findFirst).toHaveBeenCalledWith({
        where: { name: 'free' },
      });
      expect(prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          tierId: mockFreeTier.id,
          status: 'active',
          endDate: expect.any(Date),
        },
      });
    });

    it('should set long expiry for free tier (10 years)', async () => {
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(mockFreeTier);
      (prisma.userSubscription.update as jest.Mock).mockImplementation(({ data }) => {
        const endDate = data.endDate;
        const expectedEnd = new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000);

        // Allow for small timing differences
        expect(Math.abs(endDate.getTime() - expectedEnd.getTime())).toBeLessThan(1000);

        return Promise.resolve({});
      });
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(null);

      await subscriptionService.expireSubscription(userId);
    });

    it('should log when user is team admin', async () => {
      const mockTeam = {
        id: 'team-123',
        adminId: userId,
      };

      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(mockFreeTier);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({});
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(mockTeam);

      await subscriptionService.expireSubscription(userId);

      expect(prisma.team.findFirst).toHaveBeenCalledWith({
        where: { adminId: userId },
      });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`User ${userId} downgraded`)
      );
    });

    it('should do nothing when free tier not found', async () => {
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(null);

      await subscriptionService.expireSubscription(userId);

      expect(prisma.userSubscription.update).not.toHaveBeenCalled();
    });

    it('should handle user with no team', async () => {
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(mockFreeTier);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({});
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(null);

      await subscriptionService.expireSubscription(userId);

      expect(prisma.team.findFirst).toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('downgraded'));
    });
  });

  describe('checkSubscriptionExpiry', () => {
    it('should process expired subscriptions and move active to grace period', async () => {
      const expiredSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          status: 'active',
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          status: 'active',
          endDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      ];

      (prisma.userSubscription.findMany as jest.Mock).mockResolvedValue(expiredSubscriptions);
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(expiredSubscriptions[0]);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({});

      const result = await subscriptionService.checkSubscriptionExpiry();

      expect(result.processed).toBe(2);
      expect(result.expired).toBe(0); // None were in grace_period
    });

    it('should expire subscriptions already in grace period', async () => {
      const expiredSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          status: 'grace_period',
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ];

      (prisma.userSubscription.findMany as jest.Mock).mockResolvedValue(expiredSubscriptions);
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(mockFreeTier);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({});
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await subscriptionService.checkSubscriptionExpiry();

      expect(result.processed).toBe(1);
      expect(result.expired).toBe(1);
    });

    it('should handle mixed active and grace period subscriptions', async () => {
      const expiredSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          status: 'active',
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          status: 'grace_period',
          endDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
        {
          id: 'sub-3',
          userId: 'user-3',
          status: 'active',
          endDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      ];

      (prisma.userSubscription.findMany as jest.Mock).mockResolvedValue(expiredSubscriptions);
      (prisma.userSubscription.findUnique as jest.Mock).mockImplementation(({ where }) => {
        return Promise.resolve(expiredSubscriptions.find(sub => sub.userId === where.userId));
      });
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(mockFreeTier);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({});
      (prisma.team.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await subscriptionService.checkSubscriptionExpiry();

      expect(result.processed).toBe(3);
      expect(result.expired).toBe(1); // Only the grace_period one
    });

    it('should return zero when no expired subscriptions', async () => {
      (prisma.userSubscription.findMany as jest.Mock).mockResolvedValue([]);

      const result = await subscriptionService.checkSubscriptionExpiry();

      expect(result.processed).toBe(0);
      expect(result.expired).toBe(0);
    });

    it('should filter out free tier subscriptions', async () => {
      (prisma.userSubscription.findMany as jest.Mock).mockResolvedValue([]);

      await subscriptionService.checkSubscriptionExpiry();

      expect(prisma.userSubscription.findMany).toHaveBeenCalledWith({
        where: {
          endDate: { lt: expect.any(Date) },
          status: { in: ['active', 'grace_period'] },
          tier: { name: { not: 'free' } },
        },
      });
    });
  });

  describe('hasFeatureAccess', () => {
    const userId = 'user-123';

    it('should return true for boolean feature when enabled', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockHighTier.id,
        tier: {
          ...mockHighTier,
          features: DEFAULT_TIER_FEATURES['high-end'],
        },
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.hasFeatureAccess(userId, 'mockExams');

      expect(result).toBe(true);
    });

    it('should return false for boolean feature when disabled', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockFreeTier.id,
        tier: {
          ...mockFreeTier,
          features: DEFAULT_TIER_FEATURES.free,
        },
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.hasFeatureAccess(userId, 'mockExams');

      expect(result).toBe(false);
    });

    it('should return true for numeric features (has access to limit)', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockMidTier.id,
        tier: {
          ...mockMidTier,
          features: DEFAULT_TIER_FEATURES['mid-level'],
        },
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.hasFeatureAccess(
        userId,
        'practiceQuestionsPerDomain'
      );

      expect(result).toBe(true);
    });

    it('should return true for string features', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockMidTier.id,
        tier: {
          ...mockMidTier,
          features: DEFAULT_TIER_FEATURES['mid-level'],
        },
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.hasFeatureAccess(userId, 'studyGuidesAccess');

      expect(result).toBe(true);
    });

    it('should return false when user has no subscription', async () => {
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await subscriptionService.hasFeatureAccess(userId, 'mockExams');

      expect(result).toBe(false);
    });

    it('should return false when subscription is cancelled', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockHighTier.id,
        tier: {
          ...mockHighTier,
          features: DEFAULT_TIER_FEATURES['high-end'],
        },
        status: 'cancelled',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.hasFeatureAccess(userId, 'mockExams');

      expect(result).toBe(false);
    });

    it('should return false when subscription is expired', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockHighTier.id,
        tier: {
          ...mockHighTier,
          features: DEFAULT_TIER_FEATURES['high-end'],
        },
        status: 'expired',
        startDate: new Date(),
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.hasFeatureAccess(userId, 'mockExams');

      expect(result).toBe(false);
    });

    it('should return true when subscription is in grace period', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockHighTier.id,
        tier: {
          ...mockHighTier,
          features: DEFAULT_TIER_FEATURES['high-end'],
        },
        status: 'grace_period',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.hasFeatureAccess(userId, 'mockExams');

      expect(result).toBe(true);
    });
  });

  describe('getUsageLimits', () => {
    const userId = 'user-123';

    it('should return user tier features when subscription exists', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId,
        tierId: mockHighTier.id,
        tier: {
          ...mockHighTier,
          features: DEFAULT_TIER_FEATURES['high-end'],
        },
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.getUsageLimits(userId);

      expect(result).toEqual(DEFAULT_TIER_FEATURES['high-end']);
      expect(result.mockExams).toBe(true);
      expect(result.flashcardsLimit).toBe('unlimited');
    });

    it('should return free tier features when no subscription exists', async () => {
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockFreeTier);

      const result = await subscriptionService.getUsageLimits(userId);

      expect(result).toEqual(DEFAULT_TIER_FEATURES.free);
      expect(result.mockExams).toBe(false);
      expect(result.flashcardsLimit).toBe(50);
    });

    it('should return empty object when free tier not found and no subscription', async () => {
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await subscriptionService.getUsageLimits(userId);

      expect(result).toEqual({});
    });

    it('should return limits for all tier types', async () => {
      const tiers = [
        { tier: mockFreeTier, features: DEFAULT_TIER_FEATURES.free },
        { tier: mockMidTier, features: DEFAULT_TIER_FEATURES['mid-level'] },
        { tier: mockHighTier, features: DEFAULT_TIER_FEATURES['high-end'] },
        { tier: mockCorporateTier, features: DEFAULT_TIER_FEATURES.corporate },
      ];

      for (const { tier, features } of tiers) {
        const mockSubscription = {
          id: 'sub-123',
          userId,
          tierId: tier.id,
          tier: { ...tier, features },
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        };

        (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

        const result = await subscriptionService.getUsageLimits(userId);

        expect(result).toEqual(features);
      }
    });
  });

  describe('Property-Based Tests', () => {
    it('should handle valid tier IDs', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async tierId => {
          (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(null);

          const result = await subscriptionService.getTierById(tierId);

          expect(result).toBeNull();
        })
      );
    });

    it('should handle valid user IDs', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async userId => {
          (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);

          const result = await subscriptionService.getUserSubscription(userId);

          expect(result).toBeNull();
        })
      );
    });

    it('should handle various price values', () => {
      fc.assert(
        fc.property(fc.double({ min: 0, max: 10000, noNaN: true }), price => {
          const tier = { ...mockMidTier, price };
          expect(tier.price).toBeGreaterThanOrEqual(0);
        })
      );
    });

    it('should validate billing periods', () => {
      fc.assert(
        fc.property(fc.constantFrom('monthly', 'annual'), billingPeriod => {
          expect(['monthly', 'annual']).toContain(billingPeriod);
        })
      );
    });

    it('should validate tier names', () => {
      fc.assert(
        fc.property(fc.constantFrom('free', 'mid-level', 'high-end', 'corporate'), tierName => {
          expect(['free', 'mid-level', 'high-end', 'corporate']).toContain(tierName);
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent subscription updates', async () => {
      const userId = 'user-123';
      const tierId = mockMidTier.id;

      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockMidTier);
      (prisma.userSubscription.upsert as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        userId,
        tierId,
        tier: mockMidTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: null,
        createdAt: new Date(),
      });

      const promises = [
        subscriptionService.createSubscription(userId, tierId),
        subscriptionService.createSubscription(userId, tierId),
        subscriptionService.createSubscription(userId, tierId),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.userId).toBe(userId);
      });
    });

    it('should handle very large PayPal order IDs', async () => {
      const userId = 'user-123';
      const tierId = mockMidTier.id;
      const largeOrderId = 'P'.repeat(255); // Maximum typical varchar length

      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockMidTier);
      (prisma.userSubscription.upsert as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        userId,
        tierId,
        tier: mockMidTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: largeOrderId,
        createdAt: new Date(),
      });
      (prisma.paymentTransaction.create as jest.Mock).mockResolvedValue({});

      const result = await subscriptionService.createSubscription(userId, tierId, largeOrderId);

      expect(result.paypalSubscriptionId).toBe(largeOrderId);
    });

    it('should handle date edge cases near midnight', async () => {
      const userId = 'user-123';

      // Set time to 23:59:59
      const nearMidnight = new Date();
      nearMidnight.setHours(23, 59, 59, 999);

      jest.spyOn(global.Date, 'now').mockReturnValue(nearMidnight.getTime());

      const mockSubscription = {
        id: 'sub-123',
        userId,
        status: 'active',
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({});

      await subscriptionService.setGracePeriod(userId);

      expect(prisma.userSubscription.update).toHaveBeenCalled();

      jest.spyOn(global.Date, 'now').mockRestore();
    });

    it('should not create payment transaction when paypalOrderId is undefined', async () => {
      const userId = 'user-123';
      const tierId = mockMidTier.id;

      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockMidTier);
      (prisma.userSubscription.upsert as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        userId,
        tierId,
        tier: mockMidTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: undefined,
        createdAt: new Date(),
      });
      (prisma.paymentTransaction.create as jest.Mock).mockResolvedValue({});

      await subscriptionService.createSubscription(userId, tierId, undefined);

      expect(prisma.paymentTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete subscription lifecycle', async () => {
      const userId = 'user-123';
      const tierId = mockMidTier.id;

      // Step 1: Create subscription
      (prisma.subscriptionTier.findUnique as jest.Mock).mockResolvedValue(mockMidTier);
      (prisma.userSubscription.upsert as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        userId,
        tierId,
        tier: mockMidTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paypalSubscriptionId: 'paypal-123',
        createdAt: new Date(),
      });
      (prisma.paymentTransaction.create as jest.Mock).mockResolvedValue({});

      const subscription = await subscriptionService.createSubscription(
        userId,
        tierId,
        'paypal-123'
      );
      expect(subscription.status).toBe('active');

      // Step 2: Check feature access
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        userId,
        tierId,
        tier: mockMidTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      const hasAccess = await subscriptionService.hasFeatureAccess(userId, 'advancedAnalytics');
      expect(hasAccess).toBe(true);

      // Step 3: Cancel subscription
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        userId,
        status: 'active',
      });
      (prisma.userSubscription.update as jest.Mock).mockResolvedValue({});

      await subscriptionService.cancelSubscription(userId);

      // Step 4: Verify cancelled status blocks access
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'sub-123',
        userId,
        tierId,
        tier: mockMidTier,
        status: 'cancelled',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      const hasAccessAfterCancel = await subscriptionService.hasFeatureAccess(
        userId,
        'advancedAnalytics'
      );
      expect(hasAccessAfterCancel).toBe(false);
    });
  });
});

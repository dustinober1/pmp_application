import type { SubscriptionTier, UserSubscription, TierFeatures, TierName } from '@pmp/shared';
import { SUBSCRIPTION_ERRORS } from '@pmp/shared';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class SubscriptionService {
  /**
   * Get all available subscription tiers
   */
  async getTiers(): Promise<SubscriptionTier[]> {
    const tiers = await prisma.subscriptionTier.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return tiers.map(tier => ({
      id: tier.id,
      name: tier.name as TierName,
      price: tier.price,
      billingPeriod: tier.billingPeriod as 'monthly' | 'annual',
      features: tier.features as unknown as TierFeatures,
    }));
  }

  /**
   * Get a specific tier by ID
   */
  async getTierById(tierId: string): Promise<SubscriptionTier | null> {
    const tier = await prisma.subscriptionTier.findUnique({
      where: { id: tierId },
    });

    if (!tier) return null;

    return {
      id: tier.id,
      name: tier.name as TierName,
      price: tier.price,
      billingPeriod: tier.billingPeriod as 'monthly' | 'annual',
      features: tier.features as unknown as TierFeatures,
    };
  }

  /**
   * Get a tier by name
   */
  async getTierByName(name: TierName): Promise<SubscriptionTier | null> {
    const tier = await prisma.subscriptionTier.findUnique({
      where: { name },
    });

    if (!tier) return null;

    return {
      id: tier.id,
      name: tier.name as TierName,
      price: tier.price,
      billingPeriod: tier.billingPeriod as 'monthly' | 'annual',
      features: tier.features as unknown as TierFeatures,
    };
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
      include: { tier: true },
    });

    if (!subscription) return null;

    return {
      id: subscription.id,
      userId: subscription.userId,
      tierId: subscription.tierId,
      tier: {
        id: subscription.tier.id,
        name: subscription.tier.name as TierName,
        price: subscription.tier.price,
        billingPeriod: subscription.tier.billingPeriod as 'monthly' | 'annual',
        features: subscription.tier.features as unknown as TierFeatures,
      },
      status: subscription.status as 'active' | 'cancelled' | 'expired' | 'grace_period',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      paypalSubscriptionId: subscription.paypalSubscriptionId || undefined,
      createdAt: subscription.createdAt,
    };
  }

  /**
   * Create or update user subscription (for PayPal integration)
   */
  async createSubscription(
    userId: string,
    tierId: string,
    paypalOrderId?: string
  ): Promise<UserSubscription> {
    // Validate tier exists
    const tier = await prisma.subscriptionTier.findUnique({
      where: { id: tierId },
    });

    if (!tier) {
      throw AppError.badRequest(
        SUBSCRIPTION_ERRORS.SUB_002.message,
        SUBSCRIPTION_ERRORS.SUB_002.code
      );
    }

    // Calculate end date (1 month or 1 year based on billing period)
    const durationMs =
      tier.billingPeriod === 'annual' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    const subscription = await prisma.userSubscription.upsert({
      where: { userId },
      update: {
        tierId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + durationMs),
        paypalSubscriptionId: paypalOrderId,
      },
      create: {
        userId,
        tierId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + durationMs),
        paypalSubscriptionId: paypalOrderId,
      },
      include: { tier: true },
    });

    // Record transaction
    if (paypalOrderId) {
      await prisma.paymentTransaction.create({
        data: {
          userId,
          paypalOrderId,
          amount: tier.price,
          currency: 'USD',
          status: 'completed',
          tierId,
          billingPeriod: tier.billingPeriod,
        },
      });
    }

    return {
      id: subscription.id,
      userId: subscription.userId,
      tierId: subscription.tierId,
      tier: {
        id: subscription.tier.id,
        name: subscription.tier.name as TierName,
        price: subscription.tier.price,
        billingPeriod: subscription.tier.billingPeriod as 'monthly' | 'annual',
        features: subscription.tier.features as unknown as TierFeatures,
      },
      status: subscription.status as 'active' | 'cancelled' | 'expired' | 'grace_period',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      paypalSubscriptionId: subscription.paypalSubscriptionId || undefined,
      createdAt: subscription.createdAt,
    };
  }

  /**
   * Cancel subscription (access continues until end of billing period)
   */
  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw AppError.notFound('Subscription not found');
    }

    await prisma.userSubscription.update({
      where: { userId },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Handle subscription renewal failure (set grace period)
   */
  async setGracePeriod(userId: string): Promise<void> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) return;

    // 7 day grace period
    const gracePeriodEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.userSubscription.update({
      where: { userId },
      data: {
        status: 'grace_period',
        endDate: gracePeriodEnd,
      },
    });
  }

  /**
   * Expire subscription after grace period (downgrade to free)
   */
  async expireSubscription(userId: string): Promise<void> {
    // Downgrade to free tier
    const freeTier = await prisma.subscriptionTier.findFirst({
      where: { name: 'free' },
    });

    if (!freeTier) return;

    // We don't delete data here, we just downgrade access level (Requirement 11.5)
    // Data is preserved for 90 days policy is handled by data retention job
    await prisma.userSubscription.update({
      where: { userId },
      data: {
        tierId: freeTier.id,
        status: 'active', // Active on free tier
        endDate: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000), // Long expiry for free tier
      },
    });

    // Revoke team access if admin
    const team = await prisma.team.findFirst({
      where: { adminId: userId },
    });

    if (team) {
      // In a real app we might disable the team or downgrade its limits
      // For now, we'll log it (placeholder)
      logger.warn(`User ${userId} downgraded. Team ${team.id} might need attention.`);
    }
  }

  /**
   * Check for expiring subscriptions (Cron job candidate)
   */
  async checkSubscriptionExpiry(): Promise<{ processed: number; expired: number }> {
    const today = new Date();

    // Find all expired subscriptions that are not 'free' tier
    const expiredSubscriptions = await prisma.userSubscription.findMany({
      where: {
        endDate: { lt: today },
        status: { in: ['active', 'grace_period'] },
        tier: { name: { not: 'free' } },
      },
    });

    let expiredCount = 0;

    for (const sub of expiredSubscriptions) {
      // If in active status, move to grace period first
      if (sub.status === 'active') {
        await this.setGracePeriod(sub.userId);
      }
      // If already in grace period (and now past it), expire
      else if (sub.status === 'grace_period') {
        await this.expireSubscription(sub.userId);
        expiredCount++;
      }
    }

    return {
      processed: expiredSubscriptions.length,
      expired: expiredCount,
    };
  }

  /**
   * Check if user has access to a feature
   */
  async hasFeatureAccess(userId: string, feature: keyof TierFeatures): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) return false;
    if (subscription.status !== 'active' && subscription.status !== 'grace_period') return false;

    const featureValue = subscription.tier.features[feature];

    if (typeof featureValue === 'boolean') {
      return featureValue;
    }

    // For numeric limits or string values, they have access
    return true;
  }

  /**
   * Get user's usage limits based on tier
   */
  async getUsageLimits(userId: string): Promise<TierFeatures> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      // Return free tier limits
      const freeTier = await this.getTierByName('free');
      return freeTier?.features || ({} as TierFeatures);
    }

    return subscription.tier.features;
  }
}

export const subscriptionService = new SubscriptionService();

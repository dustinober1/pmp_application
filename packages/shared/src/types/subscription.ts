/**
 * Subscription and pricing related types
 */

export type TierName = "free" | "basic" | "premium" | "enterprise";

export interface SubscriptionTier {
  id: string;
  name: TierName;
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  features: string[];
  maxUsers?: number;
  maxProjects?: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: TierName;
  status: "active" | "canceled" | "past_due" | "unpaid";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionInput {
  tierId: string;
  paymentMethodId: string;
}

export interface SubscriptionUpdateInput {
  tierId: string;
}

export interface SubscriptionCancelInput {
  reason?: string;
  feedback?: string;
}

export interface UsageMetrics {
  userId: string;
  tier: TierName;
  periodStart: Date;
  periodEnd: Date;
  apiCalls: number;
  storageUsed: number;
  activeUsers: number;
}

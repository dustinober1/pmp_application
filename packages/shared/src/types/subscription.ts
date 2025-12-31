/**
 * Subscription and tier related types
 */

export type TierName = 'free' | 'mid-level' | 'high-end' | 'corporate';
export type BillingPeriod = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'grace_period';

export interface TierFeatures {
  studyGuidesAccess: 'limited' | 'full';
  flashcardsLimit: number | 'unlimited';
  practiceQuestionsPerDomain: number;
  customFlashcards: boolean;
  mockExams: boolean;
  formulaCalculator: boolean;
  advancedAnalytics: boolean;
  personalizedStudyPlan: boolean;
  teamManagement: boolean;
  dedicatedSupport: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: TierName;
  price: number;
  billingPeriod: BillingPeriod;
  features: TierFeatures;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tierId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  paypalSubscriptionId?: string;
  createdAt: Date;
}

export interface PayPalOrder {
  orderId: string;
  approvalUrl: string;
  status: string;
}

export interface PayPalWebhookEvent {
  event_type: string;
  resource: {
    id: string;
    status: string;
    [key: string]: unknown;
  };
}

// Tier hierarchy for comparison
export const TIER_HIERARCHY: Record<TierName, number> = {
  free: 0,
  'mid-level': 1,
  'high-end': 2,
  corporate: 3,
};

// Default tier configurations
export const DEFAULT_TIER_FEATURES: Record<TierName, TierFeatures> = {
  free: {
    studyGuidesAccess: 'limited',
    flashcardsLimit: 50,
    practiceQuestionsPerDomain: 25,
    customFlashcards: false,
    mockExams: false,
    formulaCalculator: false,
    advancedAnalytics: false,
    personalizedStudyPlan: false,
    teamManagement: false,
    dedicatedSupport: false,
  },
  'mid-level': {
    studyGuidesAccess: 'full',
    flashcardsLimit: 'unlimited',
    practiceQuestionsPerDomain: 100,
    customFlashcards: false,
    mockExams: false,
    formulaCalculator: false,
    advancedAnalytics: true,
    personalizedStudyPlan: false,
    teamManagement: false,
    dedicatedSupport: false,
  },
  'high-end': {
    studyGuidesAccess: 'full',
    flashcardsLimit: 'unlimited',
    practiceQuestionsPerDomain: 200,
    customFlashcards: true,
    mockExams: true,
    formulaCalculator: true,
    advancedAnalytics: true,
    personalizedStudyPlan: true,
    teamManagement: false,
    dedicatedSupport: false,
  },
  corporate: {
    studyGuidesAccess: 'full',
    flashcardsLimit: 'unlimited',
    practiceQuestionsPerDomain: 200,
    customFlashcards: true,
    mockExams: true,
    formulaCalculator: true,
    advancedAnalytics: true,
    personalizedStudyPlan: true,
    teamManagement: true,
    dedicatedSupport: true,
  },
};

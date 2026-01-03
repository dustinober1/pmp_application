/**
 * Test Data Factories
 * Provides consistent test data generation across all test suites
 */

import type {
  User,
  UserSubscription,
  EbookChapter,
  EbookSection,
  PracticeSession,
  PracticeQuestion,
  Flashcard,
  SubscriptionTier,
} from "@prisma/client";

/**
 * User Factory
 */
export function createUserFactory(overrides: Partial<User> = {}): User {
  return {
    id: overrides.id || "123e4567-e89b-12d3-a456-426614174000",
    email: overrides.email || "test@example.com",
    passwordHash: overrides.passwordHash || "$2b$10$hashedpassword",
    name: overrides.name || "Test User",
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    updatedAt: overrides.updatedAt || new Date("2024-01-01"),
    emailVerified: overrides.emailVerified ?? true,
    emailVerifyToken: overrides.emailVerifyToken ?? null,
    failedLoginAttempts: overrides.failedLoginAttempts ?? 0,
    lockedUntil: overrides.lockedUntil ?? null,
    ...overrides,
  };
}

/**
 * User Subscription Factory
 */
export function createSubscriptionFactory(
  overrides: Partial<UserSubscription> = {},
): UserSubscription {
  return {
    id: overrides.id || "sub-123",
    userId: overrides.userId || "user-123",
    tierId: overrides.tierId || "tier-free",
    status: overrides.status || "active",
    startDate: overrides.startDate || new Date("2024-01-01"),
    endDate: overrides.endDate || new Date("2024-02-01"),
    paypalSubscriptionId: overrides.paypalSubscriptionId ?? null,
    stripeCustomerId: overrides.stripeCustomerId ?? null,
    stripeSubscriptionId: overrides.stripeSubscriptionId ?? null,
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    updatedAt: overrides.updatedAt || new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Tier Factory (SubscriptionTier)
 */
export function createTierFactory(
  overrides: Partial<SubscriptionTier> = {},
): SubscriptionTier {
  return {
    id: overrides.id || "tier-free",
    name: overrides.name || "free",
    displayName: overrides.displayName || "Free Tier",
    price: overrides.price ?? 0,
    billingPeriod: overrides.billingPeriod || "monthly",
    features: overrides.features || { flashcards: 500, questions: 25 },
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Ebook Chapter Factory
 */
export function createChapterFactory(
  overrides: Partial<EbookChapter> = {},
): EbookChapter {
  return {
    id: overrides.id || "chapter-123",
    slug: overrides.slug || "01-introduction",
    title: overrides.title || "Chapter 1: Introduction",
    description: overrides.description || "Introduction to PMP",
    orderIndex: overrides.orderIndex || 1,
    isPremium: overrides.isPremium || false,
    minTier: overrides.minTier || "free",
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    updatedAt: overrides.updatedAt || new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Ebook Section Factory
 */
export function createSectionFactory(
  overrides: Partial<EbookSection> = {},
): EbookSection {
  return {
    id: overrides.id || "section-123",
    chapterId: overrides.chapterId || "chapter-123",
    slug: overrides.slug || "section-intro",
    title: overrides.title || "Section 1: Overview",
    content: overrides.content || "# Content\n\nThis is the content.",
    orderIndex: overrides.orderIndex || 1,
    prevSection: overrides.prevSection ?? null,
    nextSection: overrides.nextSection ?? null,
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    updatedAt: overrides.updatedAt || new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Practice Session Factory
 */
export function createPracticeSessionFactory(
  overrides: Partial<PracticeSession> = {},
): PracticeSession {
  return {
    id: overrides.id || "session-123",
    userId: overrides.userId || "user-123",
    startedAt: overrides.startedAt || new Date("2024-01-01"),
    completedAt: overrides.completedAt ?? null,
    totalQuestions: overrides.totalQuestions ?? 50,
    correctAnswers: overrides.correctAnswers ?? 0,
    totalTimeMs: overrides.totalTimeMs ?? 0,
    isMockExam: overrides.isMockExam ?? false,
    timeLimit: overrides.timeLimit ?? null,
    ...overrides,
  };
}

/**
 * Practice Question Factory
 */
export function createQuestionFactory(
  overrides: Partial<PracticeQuestion> = {},
): PracticeQuestion {
  return {
    id: overrides.id || "question-123",
    domainId: overrides.domainId || "domain-123",
    taskId: overrides.taskId || "task-123",
    questionText: overrides.questionText || "What is the best approach?",
    explanation: overrides.explanation || "This is the explanation.",
    difficulty: overrides.difficulty || "easy",
    methodology: overrides.methodology ?? null,
    tags: overrides.tags || [],
    externalId: overrides.externalId ?? null,
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Flashcard Factory
 */
export function createFlashcardFactory(
  overrides: Partial<Flashcard> = {},
): Flashcard {
  return {
    id: overrides.id || "card-123",
    domainId: overrides.domainId || "domain-123",
    taskId: overrides.taskId || "task-123",
    front: overrides.front || "Front text",
    back: overrides.back || "Back text",
    isCustom: overrides.isCustom ?? false,
    createdBy: overrides.createdBy ?? null,
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Auth Response Factory
 */
export function createAuthResponseFactory(overrides: any = {}) {
  return {
    success: true,
    data: {
      user: {
        id: overrides.userId || "user-123",
        email: overrides.email || "test@example.com",
        name: overrides.name || "Test User",
      },
      subscription: {
        tier: overrides.tier || "free",
        status: overrides.status || "ACTIVE",
      },
    },
    ...overrides,
  };
}

/**
 * API Error Response Factory
 */
export function createApiErrorFactory(overrides: any = {}) {
  return {
    success: false,
    error: {
      code: overrides.code || "INTERNAL_ERROR",
      message: overrides.message || "An error occurred",
    },
    ...overrides,
  };
}

/**
 * Pagination Metadata Factory
 */
export function createPaginationMetaFactory(overrides: any = {}) {
  return {
    page: overrides.page || 1,
    limit: overrides.limit || 10,
    total: overrides.total || 100,
    totalPages: overrides.totalPages || 10,
    ...overrides,
  };
}

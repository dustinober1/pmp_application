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
  FlashcardDeck,
  Flashcard,
  Tier,
} from '@prisma/client';

/**
 * User Factory
 */
export function createUserFactory(overrides: Partial<User> = {}): User {
  return {
    id: overrides.id || '123e4567-e89b-12d3-a456-426614174000',
    email: overrides.email || 'test@example.com',
    passwordHash: overrides.passwordHash || '$2b$10$hashedpassword',
    name: overrides.name || 'Test User',
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
    emailVerified: overrides.emailVerified || true,
    ...overrides,
  };
}

/**
 * User Subscription Factory
 */
export function createSubscriptionFactory(
  overrides: Partial<UserSubscription> = {}
): UserSubscription {
  return {
    id: overrides.id || 'sub-123',
    userId: overrides.userId || 'user-123',
    tierId: overrides.tierId || 'tier-free',
    status: overrides.status || 'ACTIVE',
    currentPeriodStart: overrides.currentPeriodStart || new Date('2024-01-01'),
    currentPeriodEnd: overrides.currentPeriodEnd || new Date('2024-02-01'),
    cancelAtPeriodEnd: overrides.cancelAtPeriodEnd || false,
    stripeSubscriptionId: overrides.stripeSubscriptionId || 'sub_stripe_123',
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Tier Factory
 */
export function createTierFactory(overrides: Partial<Tier> = {}): Tier {
  return {
    id: overrides.id || 'tier-free',
    name: overrides.name || 'free',
    displayName: overrides.displayName || 'Free Tier',
    description: overrides.description || 'Basic access',
    price: overrides.price || 0,
    features: overrides.features || ['basic features'],
    order: overrides.order || 1,
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Ebook Chapter Factory
 */
export function createChapterFactory(overrides: Partial<EbookChapter> = {}): EbookChapter {
  return {
    id: overrides.id || 'chapter-123',
    slug: overrides.slug || '01-introduction',
    title: overrides.title || 'Chapter 1: Introduction',
    description: overrides.description || 'Introduction to PMP',
    orderIndex: overrides.orderIndex || 1,
    isPremium: overrides.isPremium || false,
    minTier: overrides.minTier || 'free',
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Ebook Section Factory
 */
export function createSectionFactory(overrides: Partial<EbookSection> = {}): EbookSection {
  return {
    id: overrides.id || 'section-123',
    chapterId: overrides.chapterId || 'chapter-123',
    slug: overrides.slug || 'section-intro',
    title: overrides.title || 'Section 1: Overview',
    content: overrides.content || '# Content\n\nThis is the content.',
    orderIndex: overrides.orderIndex || 1,
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Practice Session Factory
 */
export function createPracticeSessionFactory(
  overrides: Partial<PracticeSession> = {}
): PracticeSession {
  return {
    id: overrides.id || 'session-123',
    userId: overrides.userId || 'user-123',
    questionCount: overrides.questionCount || 50,
    mode: overrides.mode || 'PRACTICE',
    timerEnabled: overrides.timerEnabled !== undefined ? overrides.timerEnabled : true,
    timeLimitSeconds: overrides.timeLimitSeconds || 3600,
    status: overrides.status || 'IN_PROGRESS',
    currentQuestionIndex: overrides.currentQuestionIndex || 0,
    correctAnswers: overrides.correctAnswers || 0,
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
    completedAt: overrides.completedAt || null,
    domainFilter: overrides.domainFilter || null,
    ...overrides,
  };
}

/**
 * Practice Question Factory
 */
export function createQuestionFactory(
  overrides: Partial<PracticeQuestion> = {}
): PracticeQuestion {
  return {
    id: overrides.id || 'question-123',
    domain: overrides.domain || 'PEOPLE',
    taskId: overrides.taskId || '1',
    questionText: overrides.questionText || 'What is the best approach?',
    optionA: overrides.optionA || 'Option A',
    optionB: overrides.optionB || 'Option B',
    optionC: overrides.optionC || 'Option C',
    optionD: overrides.optionD || 'Option D',
    correctOption: overrides.correctOption || 'A',
    explanation: overrides.explanation || 'This is the explanation.',
    difficulty: overrides.difficulty || 'EASY',
    references: overrides.references || [],
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Flashcard Deck Factory
 */
export function createFlashcardDeckFactory(
  overrides: Partial<FlashcardDeck> = {}
): FlashcardDeck {
  return {
    id: overrides.id || 'deck-123',
    userId: overrides.userId || 'user-123',
    name: overrides.name || 'My Deck',
    description: overrides.description || 'Flashcard deck description',
    isPublic: overrides.isPublic || false,
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Flashcard Factory
 */
export function createFlashcardFactory(overrides: Partial<Flashcard> = {}): Flashcard {
  return {
    id: overrides.id || 'card-123',
    deckId: overrides.deckId || 'deck-123',
    front: overrides.front || 'Front text',
    back: overrides.back || 'Back text',
    order: overrides.order || 1,
    createdAt: overrides.createdAt || new Date('2024-01-01'),
    updatedAt: overrides.updatedAt || new Date('2024-01-01'),
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
        id: overrides.userId || 'user-123',
        email: overrides.email || 'test@example.com',
        name: overrides.name || 'Test User',
      },
      subscription: {
        tier: overrides.tier || 'free',
        status: overrides.status || 'ACTIVE',
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
      code: overrides.code || 'INTERNAL_ERROR',
      message: overrides.message || 'An error occurred',
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

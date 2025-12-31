import {
  Flashcard,
  SessionStats,
  FlashcardRating,
  FlashcardSessionOptions,
  CreateFlashcardInput,
  SM2_DEFAULTS,
} from '@pmp/shared';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class FlashcardService {
  /**
   * Get flashcards with filters
   */
  async getFlashcards(options: {
    domainId?: string;
    taskId?: string;
    userId?: string;
    limit?: number;
  }): Promise<Flashcard[]> {
    const where: Record<string, unknown> = {};

    if (options.domainId) where.domainId = options.domainId;
    if (options.taskId) where.taskId = options.taskId;

    const flashcards = await prisma.flashcard.findMany({
      where,
      take: options.limit || 50,
      orderBy: { createdAt: 'asc' },
    });

    return flashcards.map(card => ({
      id: card.id,
      domainId: card.domainId,
      taskId: card.taskId,
      front: card.front,
      back: card.back,
      isCustom: card.isCustom,
      createdBy: card.createdBy || undefined,
      createdAt: card.createdAt,
    }));
  }

  /**
   * Get flashcards due for review (spaced repetition)
   */
  async getDueForReview(userId: string, limit: number = 20): Promise<Flashcard[]> {
    const now = new Date();

    // Get cards due for review
    const dueReviews = await prisma.flashcardReview.findMany({
      where: {
        userId,
        nextReviewDate: { lte: now },
      },
      include: { card: true },
      take: limit,
      orderBy: { nextReviewDate: 'asc' },
    });

    return dueReviews.map(review => ({
      id: review.card.id,
      domainId: review.card.domainId,
      taskId: review.card.taskId,
      front: review.card.front,
      back: review.card.back,
      isCustom: review.card.isCustom,
      createdBy: review.card.createdBy || undefined,
      createdAt: review.card.createdAt,
    }));
  }

  /**
   * Start a new flashcard session
   */
  async startSession(
    userId: string,
    options: FlashcardSessionOptions
  ): Promise<{ sessionId: string; cards: Flashcard[] }> {
    const where: Record<string, unknown> = {};

    if (options.domainIds?.length) where.domainId = { in: options.domainIds };
    if (options.taskIds?.length) where.taskId = { in: options.taskIds };
    if (!options.includeCustom) where.isCustom = false;

    let cards;

    if (options.prioritizeReview) {
      // Get cards due for review first
      const dueCards = await this.getDueForReview(userId, options.cardCount || 20);
      if (dueCards.length >= (options.cardCount || 20)) {
        cards = dueCards;
      } else {
        // Fill with new cards
        const additionalCards = await prisma.flashcard.findMany({
          where: {
            ...where,
            NOT: {
              id: { in: dueCards.map(c => c.id) },
            },
          },
          take: (options.cardCount || 20) - dueCards.length,
        });
        cards = [
          ...dueCards,
          ...additionalCards.map(c => ({
            id: c.id,
            domainId: c.domainId,
            taskId: c.taskId,
            front: c.front,
            back: c.back,
            isCustom: c.isCustom,
            createdBy: c.createdBy || undefined,
            createdAt: c.createdAt,
          })),
        ];
      }
    } else {
      const rawCards = await prisma.flashcard.findMany({
        where,
        take: options.cardCount || 20,
        orderBy: { createdAt: 'asc' },
      });
      cards = rawCards.map(c => ({
        id: c.id,
        domainId: c.domainId,
        taskId: c.taskId,
        front: c.front,
        back: c.back,
        isCustom: c.isCustom,
        createdBy: c.createdBy || undefined,
        createdAt: c.createdAt,
      }));
    }

    // Create session
    const session = await prisma.flashcardSession.create({
      data: {
        userId,
        totalCards: cards.length,
      },
    });

    // Add cards to session
    await prisma.flashcardSessionCard.createMany({
      data: cards.map(card => ({
        sessionId: session.id,
        cardId: card.id,
      })),
    });

    return {
      sessionId: session.id,
      cards,
    };
  }

  /**
   * Get an existing session with cards
   */
  async getSession(
    sessionId: string,
    userId: string
  ): Promise<{
    sessionId: string;
    cards: Flashcard[];
    progress: { total: number; answered: number };
  } | null> {
    const session = await prisma.flashcardSession.findUnique({
      where: { id: sessionId },
      include: {
        cards: {
          include: { card: true },
          orderBy: { cardId: 'asc' }, // Consistent order
        },
      },
    });

    if (!session || session.userId !== userId) return null;

    // Check progress
    const answeredCount = session.cards.filter(c => c.rating !== null).length;

    return {
      sessionId: session.id,
      cards: session.cards.map(sc => ({
        id: sc.card.id,
        domainId: sc.card.domainId,
        taskId: sc.card.taskId,
        front: sc.card.front,
        back: sc.card.back,
        isCustom: sc.card.isCustom,
        createdBy: sc.card.createdBy || undefined,
        createdAt: sc.card.createdAt,
        // Include session-specific status in a real app, but for now just returning the card
        // We might want to clear cards that are already answered from the frontend view
        // or return them all and let frontend decide
      })),
      progress: {
        total: session.cards.length,
        answered: answeredCount,
      },
    };
  }

  /**
   * Record a flashcard response and update spaced repetition data
   */
  async recordResponse(
    sessionId: string,
    cardId: string,
    userId: string,
    rating: FlashcardRating,
    timeSpentMs: number
  ): Promise<void> {
    // Update session card
    await prisma.flashcardSessionCard.updateMany({
      where: { sessionId, cardId },
      data: {
        rating,
        timeSpentMs,
        answeredAt: new Date(),
      },
    });

    // Update or create spaced repetition data
    const existingReview = await prisma.flashcardReview.findUnique({
      where: { userId_cardId: { userId, cardId } },
    });

    const { easeFactor, interval, repetitions, nextReviewDate } = this.calculateSM2(
      existingReview,
      rating
    );

    await prisma.flashcardReview.upsert({
      where: { userId_cardId: { userId, cardId } },
      update: {
        easeFactor,
        interval,
        repetitions,
        nextReviewDate,
        lastReviewDate: new Date(),
      },
      create: {
        userId,
        cardId,
        easeFactor,
        interval,
        repetitions,
        nextReviewDate,
        lastReviewDate: new Date(),
      },
    });
  }

  /**
   * Complete a flashcard session
   */
  async completeSession(sessionId: string): Promise<SessionStats> {
    const session = await prisma.flashcardSession.findUnique({
      where: { id: sessionId },
      include: { cards: true },
    });

    if (!session) {
      throw AppError.notFound('Session not found');
    }

    // Calculate stats
    let knowIt = 0;
    let learning = 0;
    let dontKnow = 0;
    let totalTimeMs = 0;

    session.cards.forEach(card => {
      if (card.rating === 'know_it') knowIt++;
      else if (card.rating === 'learning') learning++;
      else if (card.rating === 'dont_know') dontKnow++;
      totalTimeMs += card.timeSpentMs || 0;
    });

    // Update session
    await prisma.flashcardSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        knowIt,
        learning,
        dontKnow,
        totalTimeMs,
      },
    });

    return {
      totalCards: session.cards.length,
      knowIt,
      learning,
      dontKnow,
      totalTimeMs,
      averageTimePerCard:
        session.cards.length > 0 ? Math.round(totalTimeMs / session.cards.length) : 0,
    };
  }

  /**
   * Create a custom flashcard (High-End/Corporate tier)
   */
  async createCustomFlashcard(userId: string, data: CreateFlashcardInput): Promise<Flashcard> {
    // Verify domain and task exist
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
    });

    if (!task || task.domainId !== data.domainId) {
      throw AppError.badRequest('Invalid domain or task');
    }

    const card = await prisma.flashcard.create({
      data: {
        domainId: data.domainId,
        taskId: data.taskId,
        front: data.front,
        back: data.back,
        isCustom: true,
        createdBy: userId,
      },
    });

    return {
      id: card.id,
      domainId: card.domainId,
      taskId: card.taskId,
      front: card.front,
      back: card.back,
      isCustom: card.isCustom,
      createdBy: card.createdBy || undefined,
      createdAt: card.createdAt,
    };
  }

  /**
   * SM-2 Spaced Repetition Algorithm
   * Updates ease factor, interval, and repetitions based on rating
   */
  private calculateSM2(
    existingReview: { easeFactor: number; interval: number; repetitions: number } | null,
    rating: FlashcardRating
  ): { easeFactor: number; interval: number; repetitions: number; nextReviewDate: Date } {
    let easeFactor = existingReview?.easeFactor || SM2_DEFAULTS.INITIAL_EASE_FACTOR;
    let interval = existingReview?.interval || SM2_DEFAULTS.INITIAL_INTERVAL;
    let repetitions = existingReview?.repetitions || 0;

    // Convert rating to a quality score (0-5)
    let quality: number;
    switch (rating) {
      case 'know_it':
        quality = 5; // Perfect response
        break;
      case 'learning':
        quality = 3; // Correct with difficulty
        break;
      case 'dont_know':
        quality = 0; // Complete blackout
        break;
      default:
        quality = 3;
    }

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
    } else {
      // Incorrect response - reset
      repetitions = 0;
      interval = 1;
    }

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ensure ease factor doesn't go below minimum
    if (easeFactor < SM2_DEFAULTS.MINIMUM_EASE_FACTOR) {
      easeFactor = SM2_DEFAULTS.MINIMUM_EASE_FACTOR;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return { easeFactor, interval, repetitions, nextReviewDate };
  }

  /**
   * Get user's flashcard review stats
   */
  async getReviewStats(userId: string): Promise<{
    totalCards: number;
    mastered: number;
    learning: number;
    dueForReview: number;
  }> {
    const now = new Date();

    const reviews = await prisma.flashcardReview.findMany({
      where: { userId },
    });

    let mastered = 0;
    let learning = 0;
    let dueForReview = 0;

    reviews.forEach(review => {
      if (review.repetitions >= 3 && review.easeFactor >= 2.5) {
        mastered++;
      } else {
        learning++;
      }
      if (review.nextReviewDate <= now) {
        dueForReview++;
      }
    });

    return {
      totalCards: reviews.length,
      mastered,
      learning,
      dueForReview,
    };
  }
}

export const flashcardService = new FlashcardService();

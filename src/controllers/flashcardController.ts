import { Request, Response } from 'express';
import { prisma } from '../services/database';
import { cache } from '../services/cache';
import Logger from '../utils/logger';

export const getFlashcards = async (req: Request, res: Response) => {
  try {
    const { domain, difficulty, category, limit = 20, offset = 0 } = req.query;

    // Create cache key based on query parameters
    const cacheKey = `flashcards:${domain || 'all'}:${difficulty || 'all'}:${category || 'all'}:${limit}:${offset}`;

    // Check cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const where: any = { isActive: true };

    if (domain && domain !== 'all') {
      where.domainId = domain;
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const flashcards = await prisma.flashCard.findMany({
      where,
      include: {
        domain: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.flashCard.count({ where });

    const result = {
      flashcards,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        pages: Math.ceil(total / Number(limit)),
      },
    };

    // Cache result for 5 minutes
    await cache.set(cacheKey, result, 300);

    return res.json(result);
  } catch (error) {
    Logger.error('Error fetching flashcards:', error);
    return res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
};

export const getFlashcardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check cache first
    const cacheKey = `flashcard:${id}`;
    const cachedFlashcard = await cache.get(cacheKey);
    if (cachedFlashcard) {
      return res.json(cachedFlashcard);
    }

    const flashcard = await prisma.flashCard.findUnique({
      where: { id },
      include: {
        domain: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Cache single flashcard for 1 hour
    await cache.set(cacheKey, flashcard, 3600);

    return res.json(flashcard);
  } catch (error) {
    Logger.error('Error fetching flashcard:', error);
    return res.status(500).json({ error: 'Failed to fetch flashcard' });
  }
};

export const getFlashcardCategories = async (req: Request, res: Response) => {
  try {
    // Check cache first
    const cacheKey = 'flashcard:categories';
    const cachedCategories = await cache.get(cacheKey);
    if (cachedCategories) {
      return res.json(cachedCategories);
    }

    const categories = await prisma.flashCard.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    const result = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category,
    }));

    // Cache categories for 1 hour
    await cache.set(cacheKey, result, 3600);

    return res.json(result);
  } catch (error) {
    Logger.error('Error fetching flashcard categories:', error);
    return res.status(500).json({ error: 'Failed to fetch flashcard categories' });
  }
};

/**
 * Get cards due for review using spaced repetition
 * GET /api/flashcards/due
 */
export const getDueCards = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const { limit = 20, domain } = req.query;
    const now = new Date();

    // Get cards that are due for review
    const reviews = await prisma.flashCardReview.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
        flashCard: domain && domain !== 'all' ? { domainId: domain as string } : undefined,
      },
      include: {
        flashCard: {
          include: { domain: true },
        },
      },
      orderBy: { nextReviewAt: 'asc' },
      take: Number(limit),
    });

    // Get new cards (never reviewed)
    const reviewedCardIds = await prisma.flashCardReview.findMany({
      where: { userId },
      select: { flashCardId: true },
    });

    const reviewedIds = reviewedCardIds.map(r => r.flashCardId);

    const newCards = await prisma.flashCard.findMany({
      where: {
        isActive: true,
        id: { notIn: reviewedIds },
        ...(domain && domain !== 'all' ? { domainId: domain as string } : {}),
      },
      include: { domain: true },
      take: Math.max(0, Number(limit) - reviews.length),
      orderBy: { createdAt: 'asc' },
    });

    // Combine due cards and new cards
    const dueCards = reviews.map(r => ({
      ...r.flashCard,
      reviewInfo: {
        easeFactor: r.easeFactor,
        interval: r.interval,
        lapses: r.lapses,
        reviewCount: r.reviewCount,
        lastReviewedAt: r.reviewedAt,
      },
    }));

    const newCardsFormatted = newCards.map(card => ({
      ...card,
      reviewInfo: null, // New card, never reviewed
    }));

    return res.json({
      cards: [...dueCards, ...newCardsFormatted],
      dueCount: reviews.length,
      newCount: newCards.length,
    });
  } catch (error) {
    console.error('Error fetching due cards:', error);
    return res.status(500).json({ error: 'Failed to fetch due cards' });
  }
};

/**
 * SM-2 Algorithm Implementation
 */
function calculateSM2(
  quality: number, // 0-3 (Again=0, Hard=1, Good=2, Easy=3)
  easeFactor: number,
  interval: number,
  lapses: number
): { newEaseFactor: number; newInterval: number; newLapses: number } {
  // Quality: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newLapses = lapses;

  if (quality === 0) {
    // Again - reset interval, increase lapses
    newInterval = 1;
    newLapses = lapses + 1;
    // Reduce ease factor
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (quality === 1) {
    // Hard - slightly increase interval
    newInterval = Math.max(1, Math.round(interval * 1.2));
    newEaseFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (quality === 2) {
    // Good - standard interval increase
    if (interval === 1) {
      newInterval = 3;
    } else if (interval < 7) {
      newInterval = 7;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
  } else if (quality === 3) {
    // Easy - larger interval increase, boost ease factor
    if (interval === 1) {
      newInterval = 4;
    } else if (interval < 7) {
      newInterval = 10;
    } else {
      newInterval = Math.round(interval * easeFactor * 1.3);
    }
    newEaseFactor = easeFactor + 0.15;
  }

  // Ensure ease factor stays in reasonable bounds
  newEaseFactor = Math.max(1.3, Math.min(3.0, newEaseFactor));

  // Cap interval at 365 days
  newInterval = Math.min(365, newInterval);

  return { newEaseFactor, newInterval, newLapses };
}

/**
 * Review a flashcard with spaced repetition
 * POST /api/flashcards/:id/review
 */
export const reviewCard = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const { id: flashCardId } = req.params;
    const { difficulty } = req.body; // AGAIN, HARD, GOOD, EASY

    // Map difficulty to quality (0-3)
    const qualityMap: Record<string, number> = {
      'AGAIN': 0,
      'HARD': 1,
      'GOOD': 2,
      'EASY': 3,
    };

    const quality = qualityMap[difficulty];
    if (quality === undefined) {
      return res.status(400).json({ error: 'Invalid difficulty. Use: AGAIN, HARD, GOOD, EASY' });
    }

    // Get existing review or create defaults
    const existingReview = await prisma.flashCardReview.findUnique({
      where: {
        userId_flashCardId: {
          userId,
          flashCardId,
        },
      },
    });

    const currentEaseFactor = existingReview?.easeFactor || 2.5;
    const currentInterval = existingReview?.interval || 1;
    const currentLapses = existingReview?.lapses || 0;
    const currentReviewCount = existingReview?.reviewCount || 0;

    // Calculate new values using SM-2
    const { newEaseFactor, newInterval, newLapses } = calculateSM2(
      quality,
      currentEaseFactor,
      currentInterval,
      currentLapses
    );

    // Calculate next review date
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

    // Upsert the review
    const review = await prisma.flashCardReview.upsert({
      where: {
        userId_flashCardId: {
          userId,
          flashCardId,
        },
      },
      update: {
        difficulty,
        easeFactor: newEaseFactor,
        interval: newInterval,
        lapses: newLapses,
        nextReviewAt,
        reviewedAt: new Date(),
        reviewCount: currentReviewCount + 1,
      },
      create: {
        userId,
        flashCardId,
        difficulty,
        easeFactor: newEaseFactor,
        interval: newInterval,
        lapses: newLapses,
        nextReviewAt,
        reviewCount: 1,
      },
      include: {
        flashCard: {
          include: { domain: true },
        },
      },
    });

    // Update daily goal progress
    await updateDailyProgress(userId, 'flashcard');

    return res.json({
      message: 'Card reviewed successfully',
      review: {
        easeFactor: review.easeFactor,
        interval: review.interval,
        nextReviewAt: review.nextReviewAt,
        reviewCount: review.reviewCount,
      },
    });
  } catch (error) {
    console.error('Error reviewing card:', error);
    return res.status(500).json({ error: 'Failed to review card' });
  }
};

/**
 * Update daily progress
 */
async function updateDailyProgress(userId: string, type: 'flashcard' | 'question') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const goal = await prisma.dailyGoal.findUnique({
      where: { userId },
    });

    if (!goal) {
      // Create new daily goal
      await prisma.dailyGoal.create({
        data: {
          userId,
          cardsReviewedToday: type === 'flashcard' ? 1 : 0,
          questionsAnsweredToday: type === 'question' ? 1 : 0,
          lastResetDate: today,
        },
      });
    } else {
      // Check if we need to reset (new day)
      const lastReset = new Date(goal.lastResetDate);
      lastReset.setHours(0, 0, 0, 0);

      if (today.getTime() > lastReset.getTime()) {
        // New day - reset counters
        await prisma.dailyGoal.update({
          where: { userId },
          data: {
            cardsReviewedToday: type === 'flashcard' ? 1 : 0,
            questionsAnsweredToday: type === 'question' ? 1 : 0,
            lastResetDate: today,
          },
        });
      } else {
        // Same day - increment counter
        await prisma.dailyGoal.update({
          where: { userId },
          data: type === 'flashcard'
            ? { cardsReviewedToday: { increment: 1 } }
            : { questionsAnsweredToday: { increment: 1 } },
        });
      }
    }
  } catch (e) {
    console.log('Could not update daily progress:', e);
  }
}

/**
 * Get study statistics
 * GET /api/flashcards/stats
 */
export const getStudyStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const now = new Date();

    // Get total cards
    const totalCards = await prisma.flashCard.count({
      where: { isActive: true },
    });

    // Get cards reviewed by user
    const reviewedCards = await prisma.flashCardReview.count({
      where: { userId },
    });

    // Get cards due today
    const dueToday = await prisma.flashCardReview.count({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
    });

    // Get new cards (not yet reviewed)
    const newCards = totalCards - reviewedCards;

    // Get today's reviews
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const reviewedToday = await prisma.flashCardReview.count({
      where: {
        userId,
        reviewedAt: { gte: todayStart },
      },
    });

    // Get daily goal
    const dailyGoal = await prisma.dailyGoal.findUnique({
      where: { userId },
    });

    // Check if goal needs resetting
    let goalProgress = {
      flashcardGoal: dailyGoal?.flashcardGoal || 20,
      cardsReviewedToday: 0,
      questionsGoal: dailyGoal?.questionsGoal || 25,
      questionsAnsweredToday: 0,
    };

    if (dailyGoal) {
      const lastReset = new Date(dailyGoal.lastResetDate);
      lastReset.setHours(0, 0, 0, 0);

      if (todayStart.getTime() > lastReset.getTime()) {
        // Need to reset for new day
        goalProgress.cardsReviewedToday = 0;
        goalProgress.questionsAnsweredToday = 0;
      } else {
        goalProgress.cardsReviewedToday = dailyGoal.cardsReviewedToday;
        goalProgress.questionsAnsweredToday = dailyGoal.questionsAnsweredToday;
      }
    }

    // Get mastery breakdown
    const masteryBreakdown = await prisma.flashCardReview.groupBy({
      by: ['interval'],
      where: { userId },
      _count: true,
    });

    // Categorize by mastery level
    let learning = 0; // interval < 7
    let reviewing = 0; // 7 <= interval < 30
    let mastered = 0; // interval >= 30

    for (const group of masteryBreakdown) {
      if (group.interval < 7) {
        learning += group._count;
      } else if (group.interval < 30) {
        reviewing += group._count;
      } else {
        mastered += group._count;
      }
    }

    return res.json({
      overview: {
        totalCards,
        reviewedCards,
        newCards,
        dueToday,
        reviewedToday,
      },
      mastery: {
        learning,
        reviewing,
        mastered,
      },
      dailyGoal: goalProgress,
    });
  } catch (error) {
    console.error('Error getting study stats:', error);
    return res.status(500).json({ error: 'Failed to get study stats' });
  }
};

/**
 * Update daily goals
 * PUT /api/flashcards/goals
 */
export const updateDailyGoals = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const { flashcardGoal, questionsGoal } = req.body;

    const goal = await prisma.dailyGoal.upsert({
      where: { userId },
      update: {
        flashcardGoal: flashcardGoal !== undefined ? flashcardGoal : undefined,
        questionsGoal: questionsGoal !== undefined ? questionsGoal : undefined,
      },
      create: {
        userId,
        flashcardGoal: flashcardGoal || 20,
        questionsGoal: questionsGoal || 25,
      },
    });

    return res.json({
      message: 'Goals updated',
      goals: {
        flashcardGoal: goal.flashcardGoal,
        questionsGoal: goal.questionsGoal,
      },
    });
  } catch (error) {
    console.error('Error updating goals:', error);
    return res.status(500).json({ error: 'Failed to update goals' });
  }
};
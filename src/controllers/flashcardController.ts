import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/database";
import { cache } from "../services/cache";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";

// Type definitions for better type safety
interface FlashcardWhereClause {
  isActive: boolean;
  domainId?: string;
  difficulty?: string;
  category?: string;
}

// Difficulty quality mapping - using const assertion for type safety
const DIFFICULTY_QUALITY_MAP = {
  AGAIN: 0,
  HARD: 1,
  GOOD: 2,
  EASY: 3,
} as const;

type DifficultyLevel = keyof typeof DIFFICULTY_QUALITY_MAP;

// SM-2 Algorithm constants
const SM2_CONSTANTS = {
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 3.0,
  MAX_INTERVAL_DAYS: 365,
  INITIAL_EASE_FACTOR: 2.5,
  INITIAL_INTERVAL: 1,
  LEARNING_THRESHOLD: 7, // Days - cards with interval < 7 are "learning"
  MASTERED_THRESHOLD: 30, // Days - cards with interval >= 30 are "mastered"
} as const;

/**
 * Get flashcards with pagination and filtering
 * GET /api/flashcards
 */
export const getFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { domain, difficulty, category, limit = 20, offset = 0 } = req.query;

    // Create cache key based on query parameters
    const cacheKey = `flashcards:${domain || "all"}:${difficulty || "all"}:${category || "all"}:${limit}:${offset}`;

    // Check cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    const where: FlashcardWhereClause = { isActive: true };

    if (domain && domain !== "all") {
      where.domainId = domain as string;
    }

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty as string;
    }

    if (category && category !== "all") {
      where.category = category as string;
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
      orderBy: { createdAt: "desc" },
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

    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching flashcards:", error);
    next(ErrorFactory.internal("Failed to fetch flashcards"));
  }
};

/**
 * Get a single flashcard by ID
 * GET /api/flashcards/:id
 */
export const getFlashcardById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check cache first
    const cacheKey = `flashcard:${id}`;
    const cachedFlashcard = await cache.get(cacheKey);
    if (cachedFlashcard) {
      res.json(cachedFlashcard);
      return;
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
      throw ErrorFactory.notFound("Flashcard");
    }

    // Cache single flashcard for 1 hour
    await cache.set(cacheKey, flashcard, 3600);

    res.json(flashcard);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching flashcard:", error);
    next(ErrorFactory.internal("Failed to fetch flashcard"));
  }
};

/**
 * Get all flashcard categories
 * GET /api/flashcards/categories
 */
export const getFlashcardCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Check cache first
    const cacheKey = "flashcard:categories";
    const cachedCategories = await cache.get(cacheKey);
    if (cachedCategories) {
      res.json(cachedCategories);
      return;
    }

    const categories = await prisma.flashCard.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: {
        category: true,
      },
      orderBy: {
        category: "asc",
      },
    });

    const result = categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
    }));

    // Cache categories for 1 hour
    await cache.set(cacheKey, result, 3600);

    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching flashcard categories:", error);
    next(ErrorFactory.internal("Failed to fetch flashcard categories"));
  }
};

/**
 * Get cards due for review using spaced repetition
 * GET /api/flashcards/due
 */
export const getDueCards = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;
    const { limit = 20, domain } = req.query;
    const now = new Date();

    // Get cards that are due for review
    const reviews = await prisma.flashCardReview.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
        flashCard:
          domain && domain !== "all"
            ? { domainId: domain as string }
            : undefined,
      },
      include: {
        flashCard: {
          include: { domain: true },
        },
      },
      orderBy: { nextReviewAt: "asc" },
      take: Number(limit),
    });

    // Get new cards (never reviewed)
    const reviewedCardIds = await prisma.flashCardReview.findMany({
      where: { userId },
      select: { flashCardId: true },
    });

    const reviewedIds = reviewedCardIds.map((r) => r.flashCardId);

    const newCards = await prisma.flashCard.findMany({
      where: {
        isActive: true,
        id: { notIn: reviewedIds },
        ...(domain && domain !== "all" ? { domainId: domain as string } : {}),
      },
      include: { domain: true },
      take: Math.max(0, Number(limit) - reviews.length),
      orderBy: { createdAt: "asc" },
    });

    // Combine due cards and new cards
    const dueCards = reviews.map((r) => ({
      ...r.flashCard,
      reviewInfo: {
        easeFactor: r.easeFactor,
        interval: r.interval,
        lapses: r.lapses,
        reviewCount: r.reviewCount,
        lastReviewedAt: r.reviewedAt,
      },
    }));

    const newCardsFormatted = newCards.map((card) => ({
      ...card,
      reviewInfo: null, // New card, never reviewed
    }));

    res.json({
      cards: [...dueCards, ...newCardsFormatted],
      dueCount: reviews.length,
      newCount: newCards.length,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching due cards:", error);
    next(ErrorFactory.internal("Failed to fetch due cards"));
  }
};

/**
 * SM-2 Algorithm Implementation
 * Calculates new ease factor, interval, and lapses based on review quality
 *
 * @param quality - 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
 * @param easeFactor - Current ease factor (multiplier for interval)
 * @param interval - Current interval in days
 * @param lapses - Number of times card was forgotten
 * @returns New values for ease factor, interval, and lapses
 */
function calculateSM2(
  quality: number,
  easeFactor: number,
  interval: number,
  lapses: number,
): { newEaseFactor: number; newInterval: number; newLapses: number } {
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newLapses = lapses;

  if (quality === 0) {
    // Again - reset interval, increase lapses
    newInterval = 1;
    newLapses = lapses + 1;
    // Reduce ease factor
    newEaseFactor = Math.max(SM2_CONSTANTS.MIN_EASE_FACTOR, easeFactor - 0.2);
  } else if (quality === 1) {
    // Hard - slightly increase interval
    newInterval = Math.max(1, Math.round(interval * 1.2));
    newEaseFactor = Math.max(SM2_CONSTANTS.MIN_EASE_FACTOR, easeFactor - 0.15);
  } else if (quality === 2) {
    // Good - standard interval increase
    if (interval === 1) {
      newInterval = 3;
    } else if (interval < SM2_CONSTANTS.LEARNING_THRESHOLD) {
      newInterval = SM2_CONSTANTS.LEARNING_THRESHOLD;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
  } else if (quality === 3) {
    // Easy - larger interval increase, boost ease factor
    if (interval === 1) {
      newInterval = 4;
    } else if (interval < SM2_CONSTANTS.LEARNING_THRESHOLD) {
      newInterval = 10;
    } else {
      newInterval = Math.round(interval * easeFactor * 1.3);
    }
    newEaseFactor = easeFactor + 0.15;
  }

  // Ensure ease factor stays in reasonable bounds
  newEaseFactor = Math.max(
    SM2_CONSTANTS.MIN_EASE_FACTOR,
    Math.min(SM2_CONSTANTS.MAX_EASE_FACTOR, newEaseFactor),
  );

  // Cap interval at maximum days
  newInterval = Math.min(SM2_CONSTANTS.MAX_INTERVAL_DAYS, newInterval);

  return { newEaseFactor, newInterval, newLapses };
}

/**
 * Validate difficulty level
 */
function isValidDifficulty(difficulty: unknown): difficulty is DifficultyLevel {
  return typeof difficulty === "string" && difficulty in DIFFICULTY_QUALITY_MAP;
}

/**
 * Review a flashcard with spaced repetition
 * POST /api/flashcards/:id/review
 */
export const reviewCard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;
    const { id: flashCardId } = req.params;
    const { difficulty } = req.body;

    // Validate difficulty level
    if (!isValidDifficulty(difficulty)) {
      throw ErrorFactory.validation("Invalid difficulty level", {
        validValues: Object.keys(DIFFICULTY_QUALITY_MAP),
      });
    }

    const quality = DIFFICULTY_QUALITY_MAP[difficulty];

    // Verify flashcard exists
    const flashcard = await prisma.flashCard.findUnique({
      where: { id: flashCardId },
    });

    if (!flashcard) {
      throw ErrorFactory.notFound("Flashcard");
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

    const currentEaseFactor =
      existingReview?.easeFactor || SM2_CONSTANTS.INITIAL_EASE_FACTOR;
    const currentInterval =
      existingReview?.interval || SM2_CONSTANTS.INITIAL_INTERVAL;
    const currentLapses = existingReview?.lapses || 0;
    const currentReviewCount = existingReview?.reviewCount || 0;

    // Calculate new values using SM-2
    const { newEaseFactor, newInterval, newLapses } = calculateSM2(
      quality,
      currentEaseFactor,
      currentInterval,
      currentLapses,
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
    await updateDailyProgress(userId, "flashcard");

    res.json({
      message: "Card reviewed successfully",
      review: {
        easeFactor: review.easeFactor,
        interval: review.interval,
        nextReviewAt: review.nextReviewAt,
        reviewCount: review.reviewCount,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error reviewing card:", error);
    next(ErrorFactory.internal("Failed to review card"));
  }
};

/**
 * Update daily progress for user
 * @param userId - User ID
 * @param type - Type of activity (flashcard or question)
 */
async function updateDailyProgress(
  userId: string,
  type: "flashcard" | "question",
): Promise<void> {
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
          cardsReviewedToday: type === "flashcard" ? 1 : 0,
          questionsAnsweredToday: type === "question" ? 1 : 0,
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
            cardsReviewedToday: type === "flashcard" ? 1 : 0,
            questionsAnsweredToday: type === "question" ? 1 : 0,
            lastResetDate: today,
          },
        });
      } else {
        // Same day - increment counter
        await prisma.dailyGoal.update({
          where: { userId },
          data:
            type === "flashcard"
              ? { cardsReviewedToday: { increment: 1 } }
              : { questionsAnsweredToday: { increment: 1 } },
        });
      }
    }
  } catch (error) {
    // Log but don't fail the main operation
    Logger.warn("Could not update daily progress:", error);
  }
}

/**
 * Get study statistics
 * GET /api/flashcards/stats
 */
export const getStudyStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
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
    const goalProgress = {
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
      by: ["interval"],
      where: { userId },
      _count: true,
    });

    // Categorize by mastery level
    let learning = 0; // interval < 7
    let reviewing = 0; // 7 <= interval < 30
    let mastered = 0; // interval >= 30

    for (const group of masteryBreakdown) {
      if (group.interval < SM2_CONSTANTS.LEARNING_THRESHOLD) {
        learning += group._count;
      } else if (group.interval < SM2_CONSTANTS.MASTERED_THRESHOLD) {
        reviewing += group._count;
      } else {
        mastered += group._count;
      }
    }

    res.json({
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
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error getting study stats:", error);
    next(ErrorFactory.internal("Failed to get study stats"));
  }
};

/**
 * Update daily goals
 * PUT /api/flashcards/goals
 */
export const updateDailyGoals = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;
    const { flashcardGoal, questionsGoal } = req.body;

    // Validate goal values
    if (
      flashcardGoal !== undefined &&
      (typeof flashcardGoal !== "number" || flashcardGoal < 1)
    ) {
      throw ErrorFactory.validation("Flashcard goal must be a positive number");
    }

    if (
      questionsGoal !== undefined &&
      (typeof questionsGoal !== "number" || questionsGoal < 1)
    ) {
      throw ErrorFactory.validation("Questions goal must be a positive number");
    }

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

    res.json({
      message: "Goals updated",
      goals: {
        flashcardGoal: goal.flashcardGoal,
        questionsGoal: goal.questionsGoal,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error updating goals:", error);
    next(ErrorFactory.internal("Failed to update goals"));
  }
};

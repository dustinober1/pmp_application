import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/database";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";
import { masteryCalculator } from "../services/adaptive/MasteryCalculator";
import { knowledgeGapIdentifier } from "../services/adaptive/KnowledgeGapIdentifier";
import { questionSelector } from "../services/adaptive/QuestionSelector";
import { insightGenerator } from "../services/adaptive/InsightGenerator";
import type { SelectionParams } from "../services/adaptive/QuestionSelector";

/**
 * Get user's complete learning profile
 * GET /api/adaptive/profile
 *
 * Requirements: 6.1, 6.5
 */
export const getLearningProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;

    // Get or create learning profile
    let profile = await prisma.learningProfile.findUnique({
      where: { userId },
      include: {
        domainMasteries: {
          include: {
            domain: true,
          },
        },
        insights: {
          orderBy: { createdAt: "desc" },
          take: 10, // Latest 10 insights
        },
      },
    });

    // Create default profile if not exists (Requirement 6.5)
    if (!profile) {
      Logger.info(`Creating default learning profile for user ${userId}`);

      // Get all domains to create default mastery levels
      const domains = await prisma.domain.findMany();

      profile = await prisma.learningProfile.create({
        data: {
          userId,
          domainMasteries: {
            create: domains.map((domain) => ({
              domainId: domain.id,
              score: 50, // Default neutral mastery (50%)
              trend: "stable",
              accuracyRate: 0,
              consistencyScore: 50,
              difficultyScore: 50,
              questionCount: 0,
              peakScore: 50,
            })),
          },
        },
        include: {
          domainMasteries: {
            include: {
              domain: true,
            },
          },
          insights: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
    }

    // Get current mastery levels (recalculated)
    const masteryLevels = await masteryCalculator.getAllMasteryLevels(userId);

    // Get knowledge gaps
    const knowledgeGaps = await knowledgeGapIdentifier.getPrioritizedGaps(
      userId,
      5,
    );

    // Format response
    const learningProfile = {
      id: profile.id,
      userId: profile.userId,
      lastCalculatedAt: profile.lastCalculatedAt,
      domainMasteries: masteryLevels.map((mastery) => {
        const domainMastery = profile!.domainMasteries.find(
          (dm) => dm.domainId === mastery.domainId,
        );
        return {
          domainId: mastery.domainId,
          domainName: mastery.domainName,
          score: mastery.score,
          trend: mastery.trend,
          accuracyRate: mastery.accuracyRate,
          consistencyScore: mastery.consistencyScore,
          difficultyScore: mastery.difficultyScore,
          questionCount: mastery.questionCount,
          lastActivityAt: mastery.lastActivityAt,
          domain: domainMastery?.domain || null,
        };
      }),
      knowledgeGaps: knowledgeGaps.map((gap) => ({
        domainId: gap.domainId,
        domainName: gap.domainName,
        currentMastery: gap.currentMastery,
        targetThreshold: gap.targetThreshold,
        severity: gap.severity,
        gapType: gap.gapType,
        recommendation: gap.recommendation,
        priorityScore: gap.priorityScore,
      })),
      recentInsights: profile.insights.map((insight) => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        message: insight.message,
        priority: insight.priority,
        actionUrl: insight.actionUrl,
        isRead: insight.isRead,
        createdAt: insight.createdAt,
      })),
    };

    res.json(learningProfile);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error getting learning profile:", error);
    next(ErrorFactory.internal("Failed to get learning profile"));
  }
};

/**
 * Get recommended questions for adaptive practice session
 * GET /api/adaptive/questions
 *
 * Requirements: 6.2
 */
export const getRecommendedQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;
    const {
      count = 10,
      domainFilter,
      difficultyMin,
      difficultyMax,
      excludeRecentDays = 7,
    } = req.query;

    // Build selection parameters
    const params: SelectionParams = {
      userId,
      count: parseInt(count as string, 10),
      excludeRecentDays: parseInt(excludeRecentDays as string, 10),
    };

    if (domainFilter) {
      params.domainFilter = domainFilter as string;
    }

    if (difficultyMin && difficultyMax) {
      params.difficultyRange = {
        min: difficultyMin as "EASY" | "MEDIUM" | "HARD",
        max: difficultyMax as "EASY" | "MEDIUM" | "HARD",
      };
    }

    // Get recommended questions
    const questions = await questionSelector.selectQuestions(params);

    // Parse choices for each question
    const formattedQuestions = questions.map((question) => ({
      ...question,
      choices: JSON.parse(question.choices),
    }));

    res.json({
      questions: formattedQuestions,
      metadata: {
        totalSelected: formattedQuestions.length,
        requestedCount: params.count,
        selectionCriteria: {
          domainFilter: params.domainFilter,
          difficultyRange: params.difficultyRange,
          excludeRecentDays: params.excludeRecentDays,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error getting recommended questions:", error);
    next(ErrorFactory.internal("Failed to get recommended questions"));
  }
};

/**
 * Get prioritized knowledge gaps
 * GET /api/adaptive/gaps
 *
 * Requirements: 6.3
 */
export const getKnowledgeGaps = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get prioritized knowledge gaps
    const gaps = await knowledgeGapIdentifier.getPrioritizedGaps(
      userId,
      parseInt(limit as string, 10),
    );

    res.json({
      knowledgeGaps: gaps.map((gap) => ({
        domainId: gap.domainId,
        domainName: gap.domainName,
        currentMastery: gap.currentMastery,
        targetThreshold: gap.targetThreshold,
        severity: gap.severity,
        gapType: gap.gapType,
        examWeight: gap.examWeight,
        recommendation: gap.recommendation,
        priorityScore: gap.priorityScore,
      })),
      metadata: {
        totalGaps: gaps.length,
        requestedLimit: parseInt(limit as string, 10),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error getting knowledge gaps:", error);
    next(ErrorFactory.internal("Failed to get knowledge gaps"));
  }
};

/**
 * Get recent insights for user
 * GET /api/adaptive/insights
 *
 * Requirements: 6.4
 */
export const getRecentInsights = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;
    const { limit = 20 } = req.query;

    // Get recent insights
    const insights = await insightGenerator.getRecentInsights(
      userId,
      parseInt(limit as string, 10),
    );

    res.json({
      insights: insights.map((insight) => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        message: insight.message,
        priority: insight.priority,
        actionUrl: insight.actionUrl,
        isRead: insight.isRead,
        createdAt: insight.createdAt,
      })),
      metadata: {
        totalInsights: insights.length,
        requestedLimit: parseInt(limit as string, 10),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error getting recent insights:", error);
    next(ErrorFactory.internal("Failed to get recent insights"));
  }
};

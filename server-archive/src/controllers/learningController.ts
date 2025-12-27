import { Request, Response, NextFunction } from "express";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";
import { masteryCalculator } from "../services/adaptive/MasteryCalculator";
import { knowledgeGapIdentifier } from "../services/adaptive/KnowledgeGapIdentifier";
import { questionSelector } from "../services/adaptive/QuestionSelector";

export const getDomainMastery = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;
    const { domainId } = req.params;

    const mastery = await masteryCalculator.calculateDomainMastery(
      userId,
      domainId,
    );

    res.json({ mastery });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error getting domain mastery:", error);
    next(ErrorFactory.internal("Failed to get domain mastery"));
  }
};

export const getLearningRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const userId = req.user.id;

    const gaps = await knowledgeGapIdentifier.getPrioritizedGaps(userId, 5);

    const recommendedQuestions = await questionSelector.selectQuestions({
      userId,
      count: 10,
      excludeRecentDays: 7,
    });

    const formattedQuestions = recommendedQuestions.map((question) => ({
      ...question,
      choices: JSON.parse(question.choices),
    }));

    res.json({
      recommendations: {
        knowledgeGaps: gaps,
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error getting learning recommendations:", error);
    next(ErrorFactory.internal("Failed to get learning recommendations"));
  }
};

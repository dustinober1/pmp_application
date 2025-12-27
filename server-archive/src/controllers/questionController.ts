import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/database";
import { cache } from "../services/cache";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";

// Type-safe where clause for questions
interface QuestionWhereClause {
  isActive: boolean;
  domainId?: string;
  difficulty?: string;
}

/**
 * Get questions with pagination and filtering
 * GET /api/questions
 */
export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { domain, difficulty, limit = 10, offset = 0 } = req.query;

    // Create a cache key based on query parameters
    const cacheKey = `questions:${domain || "all"}:${difficulty || "all"}:${limit}:${offset}`;

    // Check cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    const where: QuestionWhereClause = { isActive: true };

    if (domain && domain !== "all") {
      where.domainId = domain as string;
    }

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty as string;
    }

    const questions = await prisma.question.findMany({
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

    const total = await prisma.question.count({ where });

    const result = {
      questions,
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
    Logger.error("Error fetching questions:", error);
    next(ErrorFactory.internal("Failed to fetch questions"));
  }
};

/**
 * Get a single question by ID
 * GET /api/questions/:id
 */
export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const cacheKey = `question:${id}`;

    const cachedQuestion = await cache.get(cacheKey);
    if (cachedQuestion) {
      res.json(cachedQuestion);
      return;
    }

    const question = await prisma.question.findUnique({
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

    if (!question) {
      throw ErrorFactory.notFound("Question");
    }

    // Cache single question for longer (1 hour) as they don't change often
    await cache.set(cacheKey, question, 3600);

    res.json(question);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching question:", error);
    next(ErrorFactory.internal("Failed to fetch question"));
  }
};

/**
 * Get all domains
 * GET /api/questions/domains
 */
export const getDomains = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cacheKey = "domains:all";
    const cachedDomains = await cache.get(cacheKey);

    if (cachedDomains) {
      res.json(cachedDomains);
      return;
    }

    const domains = await prisma.domain.findMany({
      include: {
        _count: {
          select: {
            questions: {
              where: { isActive: true },
            },
            flashCards: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Cache domains for 1 hour
    await cache.set(cacheKey, domains, 3600);

    res.json(domains);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching domains:", error);
    next(ErrorFactory.internal("Failed to fetch domains"));
  }
};

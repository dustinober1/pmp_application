import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/database";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";
import {
  validateDomainTestRequirements,
  validateDomainCoverage,
  getRecommendedQuestionCount,
} from "../services/testGenerator";

// Type definitions for admin queries
interface QuestionWhereClause {
  domainId?: string;
  questionText?: { contains: string };
}

interface FlashcardWhereClause {
  domainId?: string;
}

interface QuestionUpdateData {
  domainId?: string;
  questionText?: string;
  scenario?: string | null;
  choices?: string;
  correctAnswerIndex?: number;
  explanation?: string;
  difficulty?: string;
  methodology?: string;
  isActive?: boolean;
}

interface TestUpdateData {
  name?: string;
  description?: string;
  timeLimitMinutes?: number;
  isActive?: boolean;
}

interface FlashcardUpdateData {
  domainId?: string;
  frontText?: string;
  backText?: string;
  category?: string;
  difficulty?: string;
  isActive?: boolean;
}

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalFlashcards,
      totalTests,
      totalSessions,
      recentUsers,
      recentSessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.flashCard.count(),
      prisma.practiceTest.count(),
      prisma.userTestSession.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.userTestSession.findMany({
        take: 10,
        orderBy: { startedAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          test: {
            select: { name: true },
          },
        },
      }),
    ]);

    // Get question counts by domain
    const questionsByDomain = await prisma.question.groupBy({
      by: ["domainId"],
      _count: true,
    });

    const domains = await prisma.domain.findMany();
    const domainStats = domains.map((domain) => ({
      ...domain,
      questionCount:
        questionsByDomain.find((q) => q.domainId === domain.id)?._count || 0,
    }));

    // Get completion stats
    const completedSessions = await prisma.userTestSession.count({
      where: { status: "COMPLETED" },
    });

    const avgScore = await prisma.userTestSession.aggregate({
      where: { status: "COMPLETED", score: { not: null } },
      _avg: { score: true },
    });

    res.json({
      overview: {
        totalUsers,
        totalQuestions,
        totalFlashcards,
        totalTests,
        totalSessions,
        completedSessions,
        avgScore: avgScore._avg.score || 0,
      },
      domainStats,
      recentUsers,
      recentSessions,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching admin dashboard:", error);
    next(ErrorFactory.internal("Failed to fetch dashboard stats"));
  }
};

/**
 * Get all users with pagination
 * GET /api/admin/users
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { email: { contains: String(search) } },
            { firstName: { contains: String(search) } },
            { lastName: { contains: String(search) } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              testSessions: true,
              flashCardReviews: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching users:", error);
    next(ErrorFactory.internal("Failed to fetch users"));
  }
};

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["USER", "ADMIN"].includes(role)) {
      throw ErrorFactory.badRequest("Invalid role. Use USER or ADMIN");
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error updating user role:", error);
    next(ErrorFactory.internal("Failed to update user role"));
  }
};

/**
 * Delete a user
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user && req.user.id === id) {
      throw ErrorFactory.badRequest("Cannot delete your own account");
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error deleting user:", error);
    next(ErrorFactory.internal("Failed to delete user"));
  }
};

/**
 * Get all questions with pagination
 * GET /api/admin/questions
 */
export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page = 1, limit = 20, domain = "", search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: QuestionWhereClause = {};
    if (domain) {
      where.domainId = String(domain);
    }
    if (search) {
      where.questionText = { contains: String(search) };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          domain: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    // Parse choices for each question
    const formattedQuestions = questions.map((q) => ({
      ...q,
      choices: JSON.parse(q.choices),
    }));

    res.json({
      questions: formattedQuestions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching questions:", error);
    next(ErrorFactory.internal("Failed to fetch questions"));
  }
};

/**
 * Create a new question
 * POST /api/admin/questions
 */
export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const {
      domainId,
      questionText,
      scenario,
      choices,
      correctAnswerIndex,
      explanation,
      difficulty,
      methodology,
    } = req.body;

    // Validate required fields
    if (
      !domainId ||
      !questionText ||
      !choices ||
      correctAnswerIndex === undefined ||
      !explanation
    ) {
      throw ErrorFactory.badRequest("Missing required fields");
    }

    const question = await prisma.question.create({
      data: {
        domainId,
        questionText,
        scenario: scenario || null,
        choices: JSON.stringify(choices),
        correctAnswerIndex,
        explanation,
        difficulty: difficulty || "MEDIUM",
        methodology: methodology || "Hybrid",
        createdBy: req.user.id,
      },
      include: {
        domain: { select: { id: true, name: true, color: true } },
      },
    });

    res.status(201).json({
      message: "Question created successfully",
      question: {
        ...question,
        choices: JSON.parse(question.choices),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error creating question:", error);
    next(ErrorFactory.internal("Failed to create question"));
  }
};

/**
 * Update a question
 * PUT /api/admin/questions/:id
 */
export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      domainId,
      questionText,
      scenario,
      choices,
      correctAnswerIndex,
      explanation,
      difficulty,
      methodology,
      isActive,
    } = req.body;

    const updateData: QuestionUpdateData = {};
    if (domainId !== undefined) {
      updateData.domainId = domainId;
    }
    if (questionText !== undefined) {
      updateData.questionText = questionText;
    }
    if (scenario !== undefined) {
      updateData.scenario = scenario;
    }
    if (choices !== undefined) {
      updateData.choices = JSON.stringify(choices);
    }
    if (correctAnswerIndex !== undefined) {
      updateData.correctAnswerIndex = correctAnswerIndex;
    }
    if (explanation !== undefined) {
      updateData.explanation = explanation;
    }
    if (difficulty !== undefined) {
      updateData.difficulty = difficulty;
    }
    if (methodology !== undefined) {
      updateData.methodology = methodology;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
      include: {
        domain: { select: { id: true, name: true, color: true } },
      },
    });

    res.json({
      message: "Question updated successfully",
      question: {
        ...question,
        choices: JSON.parse(question.choices),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error updating question:", error);
    next(ErrorFactory.internal("Failed to update question"));
  }
};

/**
 * Delete a question
 * DELETE /api/admin/questions/:id
 */
export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.question.delete({ where: { id } });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error deleting question:", error);
    next(ErrorFactory.internal("Failed to delete question"));
  }
};

/**
 * Get all practice tests
 * GET /api/admin/tests
 */
export const getTests = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tests = await prisma.practiceTest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            testQuestions: true,
            sessions: true,
          },
        },
      },
    });

    res.json(tests);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching tests:", error);
    next(ErrorFactory.internal("Failed to fetch tests"));
  }
};

/**
 * Create a practice test
 * POST /api/admin/tests
 *
 * Request body:
 * - name: string (required)
 * - description: string (required)
 * - timeLimitMinutes: number (optional, defaults to 230)
 * - questionIds: string[] (optional) - specific question IDs to include
 * - domainIds: string[] (optional) - domain IDs to associate with this test
 *   If provided and non-empty, creates TestDomain records linking the test to those domains.
 *   If empty or not provided, test is considered full-spectrum (all domains).
 * - validateCoverage: boolean (optional, defaults to true) - whether to validate domain coverage
 * - strictValidation: boolean (optional, defaults to false) - if true, fail on warnings too
 */
export const createTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      name,
      description,
      timeLimitMinutes,
      questionIds,
      domainIds,
      validateCoverage = true,
      strictValidation = false,
    } = req.body;

    if (!name || !description) {
      throw ErrorFactory.badRequest("Name and description are required");
    }

    // Validate domainIds if provided and non-empty
    if (domainIds && Array.isArray(domainIds) && domainIds.length > 0) {
      // Check that all provided domain IDs exist
      const existingDomains = await prisma.domain.findMany({
        where: { id: { in: domainIds } },
        select: { id: true },
      });

      const existingDomainIds = new Set(existingDomains.map((d) => d.id));
      const invalidDomainIds = domainIds.filter(
        (id: string) => !existingDomainIds.has(id),
      );

      if (invalidDomainIds.length > 0) {
        throw ErrorFactory.badRequest(
          `Invalid domain IDs: ${invalidDomainIds.join(", ")}`,
        );
      }
    }

    // Perform domain coverage validation if enabled and domain-specific test
    let validationWarnings: string[] = [];
    if (
      validateCoverage &&
      domainIds &&
      Array.isArray(domainIds) &&
      domainIds.length > 0 &&
      questionIds &&
      questionIds.length > 0
    ) {
      const validation = await validateDomainTestRequirements(
        domainIds,
        questionIds.length,
      );

      // Collect error messages
      const errorMessages = validation.messages
        .filter((m) => m.severity === "error")
        .map((m) => m.message);

      // Collect warning messages
      const warningMessages = validation.messages
        .filter((m) => m.severity === "warning")
        .map((m) => m.message);

      // If validation failed (has errors), throw an error
      if (!validation.isValid) {
        throw ErrorFactory.badRequest(
          `Domain coverage validation failed: ${errorMessages.join("; ")}`,
        );
      }

      // If strict validation is enabled and there are warnings, throw an error
      if (strictValidation && validation.hasWarnings) {
        throw ErrorFactory.badRequest(
          `Domain coverage validation warnings (strict mode): ${warningMessages.join("; ")}`,
        );
      }

      // Store warnings to include in response
      validationWarnings = warningMessages;
    }

    const test = await prisma.practiceTest.create({
      data: {
        name,
        description,
        timeLimitMinutes: timeLimitMinutes || 230,
        totalQuestions: questionIds?.length || 0,
      },
    });

    // Add questions if provided
    if (questionIds && questionIds.length > 0) {
      await prisma.testQuestion.createMany({
        data: questionIds.map((qId: string, index: number) => ({
          testId: test.id,
          questionId: qId,
          orderIndex: index,
        })),
      });
    }

    // Create TestDomain records if domainIds provided and non-empty
    if (domainIds && Array.isArray(domainIds) && domainIds.length > 0) {
      await prisma.testDomain.createMany({
        data: domainIds.map((domainId: string) => ({
          testId: test.id,
          domainId,
        })),
      });
    }

    // Fetch the test with its domain associations for the response
    const testWithDomains = await prisma.practiceTest.findUnique({
      where: { id: test.id },
      include: {
        domains: {
          include: {
            domain: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        _count: {
          select: { testQuestions: true },
        },
      },
    });

    res.status(201).json({
      message: "Practice test created successfully",
      test: testWithDomains,
      ...(validationWarnings.length > 0 && { warnings: validationWarnings }),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error creating test:", error);
    next(ErrorFactory.internal("Failed to create test"));
  }
};

/**
 * Validate domain coverage for a proposed test
 * POST /api/admin/tests/validate-coverage
 *
 * Request body:
 * - domainIds: string[] (required) - domain IDs to validate
 * - questionCount: number (required) - proposed number of questions
 *
 * Returns validation result with:
 * - isValid: boolean
 * - messages: array of validation messages with severity and suggestions
 * - stats: availability and distribution statistics
 * - recommendation: recommended question count based on available questions
 */
export const validateTestCoverage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { domainIds, questionCount } = req.body;

    if (!Array.isArray(domainIds)) {
      throw ErrorFactory.badRequest("domainIds must be an array");
    }

    if (typeof questionCount !== "number" || questionCount <= 0) {
      throw ErrorFactory.badRequest("questionCount must be a positive number");
    }

    const validation = await validateDomainCoverage(domainIds, questionCount);

    res.json({
      isValid: validation.overallValid,
      hasWarnings: validation.requirements.hasWarnings,
      messages: validation.overallMessages,
      requirements: validation.requirements,
      distribution: validation.distribution,
      recommendation: validation.recommendation,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error validating test coverage:", error);
    next(ErrorFactory.internal("Failed to validate test coverage"));
  }
};

/**
 * Get recommended question count for a domain-specific test
 * GET /api/admin/tests/recommended-count
 *
 * Query params:
 * - domainIds: string (comma-separated domain IDs, optional - if not provided, considers all domains)
 *
 * Returns recommendation with:
 * - recommended: suggested question count
 * - minimum: minimum viable count
 * - maximum: maximum possible count
 * - explanation: human-readable explanation
 * - domainBreakdown: per-domain recommendations
 */
export const getTestRecommendedCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { domainIds: domainIdsParam } = req.query;

    let domainIds: string[] = [];
    if (domainIdsParam && typeof domainIdsParam === "string") {
      domainIds = domainIdsParam.split(",").filter((id) => id.trim());
    }

    const recommendation = await getRecommendedQuestionCount(domainIds);

    res.json(recommendation);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error getting recommended count:", error);
    next(ErrorFactory.internal("Failed to get recommended count"));
  }
};

/**
 * Update a practice test
 * PUT /api/admin/tests/:id
 */
export const updateTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, timeLimitMinutes, isActive } = req.body;

    const updateData: TestUpdateData = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (timeLimitMinutes !== undefined) {
      updateData.timeLimitMinutes = timeLimitMinutes;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const test = await prisma.practiceTest.update({
      where: { id },
      data: updateData,
    });

    res.json({ message: "Test updated successfully", test });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error updating test:", error);
    next(ErrorFactory.internal("Failed to update test"));
  }
};

/**
 * Delete a practice test
 * DELETE /api/admin/tests/:id
 */
export const deleteTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.practiceTest.delete({ where: { id } });

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error deleting test:", error);
    next(ErrorFactory.internal("Failed to delete test"));
  }
};

/**
 * Get all flashcards with pagination
 * GET /api/admin/flashcards
 */
export const getFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page = 1, limit = 20, domain = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: FlashcardWhereClause = {};
    if (domain) {
      where.domainId = String(domain);
    }

    const [flashcards, total] = await Promise.all([
      prisma.flashCard.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          domain: { select: { id: true, name: true, color: true } },
        },
      }),
      prisma.flashCard.count({ where }),
    ]);

    res.json({
      flashcards,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching flashcards:", error);
    next(ErrorFactory.internal("Failed to fetch flashcards"));
  }
};

/**
 * Create a flashcard
 * POST /api/admin/flashcards
 */
export const createFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const { domainId, frontText, backText, category, difficulty } = req.body;

    if (!domainId || !frontText || !backText || !category) {
      throw ErrorFactory.badRequest("Missing required fields");
    }

    const flashcard = await prisma.flashCard.create({
      data: {
        domainId,
        frontText,
        backText,
        category,
        difficulty: difficulty || "MEDIUM",
        createdBy: req.user.id,
      },
      include: {
        domain: { select: { id: true, name: true, color: true } },
      },
    });

    res.status(201).json({
      message: "Flashcard created successfully",
      flashcard,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error creating flashcard:", error);
    next(ErrorFactory.internal("Failed to create flashcard"));
  }
};

/**
 * Update a flashcard
 * PUT /api/admin/flashcards/:id
 */
export const updateFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { domainId, frontText, backText, category, difficulty, isActive } =
      req.body;

    const updateData: FlashcardUpdateData = {};
    if (domainId !== undefined) {
      updateData.domainId = domainId;
    }
    if (frontText !== undefined) {
      updateData.frontText = frontText;
    }
    if (backText !== undefined) {
      updateData.backText = backText;
    }
    if (category !== undefined) {
      updateData.category = category;
    }
    if (difficulty !== undefined) {
      updateData.difficulty = difficulty;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const flashcard = await prisma.flashCard.update({
      where: { id },
      data: updateData,
      include: {
        domain: { select: { id: true, name: true, color: true } },
      },
    });

    res.json({ message: "Flashcard updated successfully", flashcard });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error updating flashcard:", error);
    next(ErrorFactory.internal("Failed to update flashcard"));
  }
};

/**
 * Delete a flashcard
 * DELETE /api/admin/flashcards/:id
 */
export const deleteFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.flashCard.delete({ where: { id } });

    res.json({ message: "Flashcard deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error deleting flashcard:", error);
    next(ErrorFactory.internal("Failed to delete flashcard"));
  }
};

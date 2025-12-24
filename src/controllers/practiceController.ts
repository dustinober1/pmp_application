import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import Logger from '../utils/logger';
import { AppError, ErrorFactory } from '../utils/AppError';

// Type definitions for Prisma includes
interface TestQuestion {
  question: {
    id: string;
    choices: string;
    correctAnswerIndex: number;
    domainId: string;
    questionText: string;
    scenario?: string | null;
    explanation?: string | null;
    domain?: {
      id: string;
      name: string;
      color: string;
    };
  };
  orderIndex: number;
}

interface AnswerWithQuestion {
  id: string;
  questionId: string;
  selectedAnswerIndex: number;
  isCorrect: boolean;
  isFlagged: boolean;
  timeSpentSeconds: number;
  answeredAt: Date;
  question: {
    id: string;
    domainId: string;
    questionText: string;
    scenario?: string | null;
    choices: string;
    correctAnswerIndex: number;
    explanation?: string | null;
    domain: {
      id: string;
      name: string;
      color: string;
    };
  };
}

/**
 * Parse JSON choices from question
 */
function parseChoices(choicesJson: string): string[] {
  try {
    return JSON.parse(choicesJson);
  } catch {
    Logger.warn('Failed to parse question choices JSON');
    return [];
  }
}

/**
 * Format test questions with parsed choices
 */
function formatTestQuestions(testQuestions: TestQuestion[]) {
  return testQuestions.map((tq) => ({
    ...tq,
    question: {
      ...tq.question,
      choices: parseChoices(tq.question.choices),
    },
  }));
}

/**
 * Get all practice tests
 * GET /api/practice/tests
 */
export const getPracticeTests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tests = await prisma.practiceTest.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            testQuestions: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tests);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error fetching practice tests:', error);
    next(ErrorFactory.internal('Failed to fetch practice tests'));
  }
};

/**
 * Get a practice test by ID
 * GET /api/practice/tests/:id
 */
export const getPracticeTestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const test = await prisma.practiceTest.findUnique({
      where: { id },
      include: {
        testQuestions: {
          include: {
            question: {
              include: {
                domain: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    if (!test) {
      throw ErrorFactory.notFound('Practice test');
    }

    // Parse choices for each question
    const formattedTest = {
      ...test,
      testQuestions: formatTestQuestions(test.testQuestions as unknown as TestQuestion[]),
    };

    res.json(formattedTest);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error fetching practice test:', error);
    next(ErrorFactory.internal('Failed to fetch practice test'));
  }
};

/**
 * Get a test session by ID
 * GET /api/practice/sessions/:sessionId
 */
export const getTestSessionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.userTestSession.findUnique({
      where: { id: sessionId },
      include: {
        test: {
          include: {
            testQuestions: {
              include: {
                question: {
                  include: {
                    domain: true,
                  },
                },
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!session) {
      throw ErrorFactory.notFound('Session');
    }

    // Parse choices for each question
    const formattedSession = {
      ...session,
      test: {
        ...session.test,
        testQuestions: formatTestQuestions(session.test.testQuestions as unknown as TestQuestion[]),
      },
    };

    res.json(formattedSession);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error fetching test session:', error);
    next(ErrorFactory.internal('Failed to fetch test session'));
  }
};

/**
 * Start a new test session
 * POST /api/practice/sessions
 */
export const startTestSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { testId, userId } = req.body;

    // Validate testId
    if (!testId) {
      throw ErrorFactory.badRequest('testId is required');
    }

    // If no userId provided or invalid (guest mode for development), use the first available user
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        userId = undefined;
      }
    }

    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        throw ErrorFactory.badRequest('No user found in database to start session');
      }
      userId = firstUser.id;
    }

    // Get test details
    const test = await prisma.practiceTest.findUnique({
      where: { id: testId },
      include: {
        testQuestions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!test) {
      throw ErrorFactory.notFound('Test');
    }

    // Create test session
    const session = await prisma.userTestSession.create({
      data: {
        userId,
        testId,
        timeLimitMinutes: test.timeLimitMinutes,
        totalQuestions: test.testQuestions.length,
        status: 'IN_PROGRESS',
      },
      include: {
        test: {
          include: {
            testQuestions: {
              include: {
                question: {
                  include: {
                    domain: true,
                  },
                },
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    });

    // Parse choices for each question
    const formattedSession = {
      ...session,
      test: {
        ...session.test,
        testQuestions: formatTestQuestions(session.test.testQuestions as unknown as TestQuestion[]),
      },
    };

    res.json(formattedSession);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error starting test session:', error);
    next(ErrorFactory.internal('Failed to start test session'));
  }
};

/**
 * Submit an answer
 * POST /api/practice/sessions/:sessionId/answer
 */
export const submitAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, questionId, selectedAnswerIndex, timeSpentSeconds, isFlagged } = req.body;

    // Validate required fields
    if (!sessionId || !questionId || selectedAnswerIndex === undefined) {
      throw ErrorFactory.badRequest('sessionId, questionId, and selectedAnswerIndex are required');
    }

    // Get the question to check correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw ErrorFactory.notFound('Question');
    }

    const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;

    // Create or update user answer
    const answer = await prisma.userAnswer.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      update: {
        selectedAnswerIndex,
        isCorrect,
        timeSpentSeconds: timeSpentSeconds || 0,
        isFlagged: isFlagged ?? false,
        answeredAt: new Date(),
      },
      create: {
        sessionId,
        questionId,
        selectedAnswerIndex,
        isCorrect,
        timeSpentSeconds: timeSpentSeconds || 0,
        isFlagged: isFlagged ?? false,
      },
    });

    res.json(answer);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error submitting answer:', error);
    next(ErrorFactory.internal('Failed to submit answer'));
  }
};

/**
 * Toggle flag on a question
 * POST /api/practice/sessions/:sessionId/flag
 */
export const toggleFlag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, questionId } = req.body;

    if (!sessionId || !questionId) {
      throw ErrorFactory.badRequest('sessionId and questionId are required');
    }

    // Get current answer
    const existingAnswer = await prisma.userAnswer.findUnique({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
    });

    if (existingAnswer) {
      // Toggle flag
      const updated = await prisma.userAnswer.update({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId,
          },
        },
        data: {
          isFlagged: !existingAnswer.isFlagged,
        },
      });
      res.json(updated);
    } else {
      // Create new answer with flag only (no selected answer yet)
      const newAnswer = await prisma.userAnswer.create({
        data: {
          sessionId,
          questionId,
          selectedAnswerIndex: -1, // Not answered yet
          isCorrect: false,
          isFlagged: true,
          timeSpentSeconds: 0,
        },
      });
      res.json(newAnswer);
    }
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error toggling flag:', error);
    next(ErrorFactory.internal('Failed to toggle flag'));
  }
};

/**
 * Update user progress for a domain
 */
async function updateDomainProgress(
  userId: string,
  domainId: string,
  total: number,
  correct: number,
  totalTime: number
): Promise<void> {
  try {
    await prisma.userProgress.upsert({
      where: {
        userId_domainId: {
          userId,
          domainId,
        },
      },
      update: {
        questionsAnswered: {
          increment: total,
        },
        correctAnswers: {
          increment: correct,
        },
        averageTimePerQuestion: totalTime / total,
        lastActivityAt: new Date(),
      },
      create: {
        userId,
        domainId,
        questionsAnswered: total,
        correctAnswers: correct,
        averageTimePerQuestion: totalTime / total,
      },
    });
  } catch (e) {
    Logger.warn(`Could not update progress for domain ${domainId}:`, e);
  }
}

/**
 * Update study streak for user
 */
async function updateStudyStreak(userId: string): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.studyStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      await prisma.studyStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastStudyDate: today,
          totalStudyDays: 1,
        },
      });
    } else {
      const lastStudy = new Date(streak.lastStudyDate);
      lastStudy.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = streak.currentStreak + 1;
        await prisma.studyStreak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastStudyDate: today,
            totalStudyDays: streak.totalStudyDays + 1,
          },
        });
      } else if (diffDays > 1) {
        await prisma.studyStreak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastStudyDate: today,
            totalStudyDays: streak.totalStudyDays + 1,
          },
        });
      } else if (diffDays === 0) {
        // Same day, just update lastStudyDate
        await prisma.studyStreak.update({
          where: { userId },
          data: { lastStudyDate: today },
        });
      }
    }
  } catch (e) {
    Logger.warn('Could not update study streak:', e);
  }
}

/**
 * Complete a test session
 * PUT /api/practice/sessions/:sessionId/complete
 */
export const completeTestSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.params;

    // Get session with answers and questions (with domain info)
    const session = await prisma.userTestSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                domainId: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw ErrorFactory.notFound('Session');
    }

    // Only count answers with selectedAnswerIndex >= 0 (actually answered)
    const validAnswers = session.answers.filter(a => a.selectedAnswerIndex >= 0);
    const correctAnswers = validAnswers.filter(a => a.isCorrect).length;
    const score = session.totalQuestions > 0
      ? Math.round((correctAnswers / session.totalQuestions) * 100)
      : 0;

    // Calculate time analytics
    const totalTimeSpent = validAnswers.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
    const avgTimePerQuestion = validAnswers.length > 0
      ? Math.round(totalTimeSpent / validAnswers.length)
      : 0;

    // Update session
    const updatedSession = await prisma.userTestSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        score,
        correctAnswers,
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                domain: true,
              },
            },
          },
        },
        test: true,
      },
    });

    // Update user progress for each domain
    const domainProgress: Record<string, { total: number; correct: number; totalTime: number }> = {};

    for (const answer of validAnswers) {
      const domainId = answer.question.domainId;
      if (!domainProgress[domainId]) {
        domainProgress[domainId] = {
          total: 0,
          correct: 0,
          totalTime: 0,
        };
      }
      domainProgress[domainId].total += 1;
      if (answer.isCorrect) domainProgress[domainId].correct += 1;
      domainProgress[domainId].totalTime += answer.timeSpentSeconds;
    }

    // Update each domain's progress
    for (const [domainId, progress] of Object.entries(domainProgress)) {
      await updateDomainProgress(
        session.userId,
        domainId,
        progress.total,
        progress.correct,
        progress.totalTime
      );
    }

    // Update study streak
    await updateStudyStreak(session.userId);

    res.json({
      ...updatedSession,
      analytics: {
        totalTimeSpent,
        avgTimePerQuestion,
        flaggedCount: session.answers.filter(a => a.isFlagged).length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error completing test session:', error);
    next(ErrorFactory.internal('Failed to complete test session'));
  }
};

/**
 * Get session review data
 * GET /api/practice/sessions/:sessionId/review
 */
export const getSessionReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.userTestSession.findUnique({
      where: { id: sessionId },
      include: {
        test: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                domain: true,
              },
            },
          },
          orderBy: {
            answeredAt: 'asc',
          },
        },
      },
    });

    if (!session) {
      throw ErrorFactory.notFound('Session');
    }

    if (session.status !== 'COMPLETED') {
      throw ErrorFactory.badRequest('Session not completed yet');
    }

    // Calculate domain breakdown
    const domainBreakdown: Record<string, { name: string; color: string; total: number; correct: number }> = {};

    for (const answer of session.answers as unknown as AnswerWithQuestion[]) {
      if (answer.selectedAnswerIndex < 0) continue;

      const domain = answer.question.domain;
      if (!domainBreakdown[domain.id]) {
        domainBreakdown[domain.id] = {
          name: domain.name,
          color: domain.color,
          total: 0,
          correct: 0,
        };
      }
      domainBreakdown[domain.id].total++;
      if (answer.isCorrect) domainBreakdown[domain.id].correct++;
    }

    // Format questions for review
    const reviewQuestions = (session.answers as unknown as AnswerWithQuestion[]).map(answer => ({
      id: answer.question.id,
      questionText: answer.question.questionText,
      scenario: answer.question.scenario,
      choices: parseChoices(answer.question.choices),
      correctAnswerIndex: answer.question.correctAnswerIndex,
      selectedAnswerIndex: answer.selectedAnswerIndex,
      isCorrect: answer.isCorrect,
      isFlagged: answer.isFlagged,
      explanation: answer.question.explanation,
      timeSpentSeconds: answer.timeSpentSeconds,
      domain: {
        name: answer.question.domain.name,
        color: answer.question.domain.color,
      },
    }));

    // Separate flagged and incorrect for quick access
    const flaggedQuestions = reviewQuestions.filter(q => q.isFlagged);
    const incorrectQuestions = reviewQuestions.filter(q => !q.isCorrect && q.selectedAnswerIndex >= 0);

    // Calculate time analytics
    const validAnswers = session.answers.filter(a => a.selectedAnswerIndex >= 0);
    const totalTimeSpent = validAnswers.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
    const avgTimePerQuestion = validAnswers.length > 0
      ? Math.round(totalTimeSpent / validAnswers.length)
      : 0;

    // Find slowest questions
    const sortedByTime = [...validAnswers].sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds);
    const slowestQuestions = sortedByTime.slice(0, 3).map(a => ({
      questionId: a.questionId,
      time: a.timeSpentSeconds,
    }));

    res.json({
      session: {
        id: session.id,
        testName: session.test.name,
        completedAt: session.completedAt,
        score: session.score,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
      },
      analytics: {
        totalTimeSpent,
        avgTimePerQuestion,
        slowestQuestions,
        domainBreakdown: Object.values(domainBreakdown),
      },
      questions: reviewQuestions,
      flaggedQuestions,
      incorrectQuestions,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error getting session review:', error);
    next(ErrorFactory.internal('Failed to get session review'));
  }
};

/**
 * Get user's sessions
 * GET /api/practice/users/:userId/sessions
 */
export const getUserSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    const sessions = await prisma.userTestSession.findMany({
      where: { userId },
      include: {
        test: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    res.json(sessions);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error('Error fetching user sessions:', error);
    next(ErrorFactory.internal('Failed to fetch user sessions'));
  }
};
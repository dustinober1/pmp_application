import { Request, Response } from 'express';
import { prisma } from '../services/database';

export const getPracticeTests = async (req: Request, res: Response) => {
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

    return res.json(tests);
  } catch (error) {
    console.error('Error fetching practice tests:', error);
    return res.status(500).json({ error: 'Failed to fetch practice tests' });
  }
};

export const getPracticeTestById = async (req: Request, res: Response) => {
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
      return res.status(404).json({ error: 'Practice test not found' });
    }

    return res.json(test);
  } catch (error) {
    console.error('Error fetching practice test:', error);
    return res.status(500).json({ error: 'Failed to fetch practice test' });
  }
};

export const startTestSession = async (req: Request, res: Response) => {
  try {
    const { testId, userId } = req.body;

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
      return res.status(404).json({ error: 'Test not found' });
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

    return res.json(session);
  } catch (error) {
    console.error('Error starting test session:', error);
    return res.status(500).json({ error: 'Failed to start test session' });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId, selectedAnswerIndex, timeSpentSeconds } = req.body;

    // Get the question to check correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
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
        timeSpentSeconds,
        answeredAt: new Date(),
      },
      create: {
        sessionId,
        questionId,
        selectedAnswerIndex,
        isCorrect,
        timeSpentSeconds,
      },
    });

    return res.json(answer);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
};

export const completeTestSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Get session and calculate results
    const session = await prisma.userTestSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const correctAnswers = session.answers.filter(answer => answer.isCorrect).length;
    const score = Math.round((correctAnswers / session.totalQuestions) * 100);

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
    const domainProgress = session.answers.reduce((acc, answer) => {
      const domainId = answer.questionId; // Use questionId for now - in real implementation, you'd fetch the question to get domainId
      if (!acc[domainId]) {
        acc[domainId] = {
          total: 0,
          correct: 0,
          totalTime: 0,
        };
      }
      acc[domainId].total += 1;
      if (answer.isCorrect) acc[domainId].correct += 1;
      acc[domainId].totalTime += answer.timeSpentSeconds;
      return acc;
    }, {} as Record<string, { total: number; correct: number; totalTime: number }>);

    for (const [domainId, progress] of Object.entries(domainProgress)) {
      await prisma.userProgress.upsert({
        where: {
          userId_domainId: {
            userId: session.userId,
            domainId,
          },
        },
        update: {
          questionsAnswered: {
            increment: progress.total,
          },
          correctAnswers: {
            increment: progress.correct,
          },
          averageTimePerQuestion: progress.totalTime / progress.total,
          lastActivityAt: new Date(),
        },
        create: {
          userId: session.userId,
          domainId,
          questionsAnswered: progress.total,
          correctAnswers: progress.correct,
          averageTimePerQuestion: progress.totalTime / progress.total,
        },
      });
    }

    return res.json(updatedSession);
  } catch (error) {
    console.error('Error completing test session:', error);
    return res.status(500).json({ error: 'Failed to complete test session' });
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
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

    return res.json(sessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch user sessions' });
  }
};
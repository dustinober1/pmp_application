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

    // Parse choices for each question
    const formattedTest = {
      ...test,
      testQuestions: test.testQuestions.map((tq: any) => ({
        ...tq,
        question: {
          ...tq.question,
          choices: JSON.parse(tq.question.choices),
        },
      })),
    };

    return res.json(formattedTest);
  } catch (error) {
    console.error('Error fetching practice test:', error);
    return res.status(500).json({ error: 'Failed to fetch practice test' });
  }
};

export const getTestSessionById = async (req: Request, res: Response) => {
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
      return res.status(404).json({ error: 'Session not found' });
    }

    // Parse choices for each question
    const formattedSession = {
      ...session,
      test: {
        ...session.test,
        testQuestions: session.test.testQuestions.map((tq: any) => ({
          ...tq,
          question: {
            ...tq.question,
            choices: JSON.parse(tq.question.choices),
          },
        })),
      },
    };

    return res.json(formattedSession);
  } catch (error) {
    console.error('Error fetching test session:', error);
    return res.status(500).json({ error: 'Failed to fetch test session' });
  }
};

export const startTestSession = async (req: Request, res: Response) => {
  try {
    let { testId, userId } = req.body;

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
        return res.status(400).json({ error: 'No user found in database to start session' });
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

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Parse choices for each question
    const formattedSession = {
      ...session,
      test: {
        ...session.test,
        testQuestions: session.test.testQuestions.map((tq: any) => ({
          ...tq,
          question: {
            ...tq.question,
            choices: JSON.parse(tq.question.choices),
          },
        })),
      },
    };

    return res.json(formattedSession);
  } catch (error) {
    console.error('Error starting test session:', error);
    return res.status(500).json({ error: 'Failed to start test session' });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId, selectedAnswerIndex, timeSpentSeconds, isFlagged } = req.body;

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
        isFlagged: isFlagged ?? false,
        answeredAt: new Date(),
      },
      create: {
        sessionId,
        questionId,
        selectedAnswerIndex,
        isCorrect,
        timeSpentSeconds,
        isFlagged: isFlagged ?? false,
      },
    });

    return res.json(answer);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
};

export const toggleFlag = async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId } = req.body;

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
      return res.json(updated);
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
      return res.json(newAnswer);
    }
  } catch (error) {
    console.error('Error toggling flag:', error);
    return res.status(500).json({ error: 'Failed to toggle flag' });
  }
};

export const completeTestSession = async (req: Request, res: Response) => {
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
      return res.status(404).json({ error: 'Session not found' });
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

    for (const [domainId, progress] of Object.entries(domainProgress)) {
      try {
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
      } catch (e) {
        console.log(`Could not update progress for domain ${domainId}:`, e);
      }
    }

    // Update study streak
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const streak = await prisma.studyStreak.findUnique({
        where: { userId: session.userId },
      });

      if (!streak) {
        await prisma.studyStreak.create({
          data: {
            userId: session.userId,
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
            where: { userId: session.userId },
            data: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, streak.longestStreak),
              lastStudyDate: today,
              totalStudyDays: streak.totalStudyDays + 1,
            },
          });
        } else if (diffDays > 1) {
          await prisma.studyStreak.update({
            where: { userId: session.userId },
            data: {
              currentStreak: 1,
              lastStudyDate: today,
              totalStudyDays: streak.totalStudyDays + 1,
            },
          });
        } else if (diffDays === 0) {
          // Same day, just update lastStudyDate
          await prisma.studyStreak.update({
            where: { userId: session.userId },
            data: { lastStudyDate: today },
          });
        }
      }
    } catch (e) {
      console.log('Could not update study streak:', e);
    }

    return res.json({
      ...updatedSession,
      analytics: {
        totalTimeSpent,
        avgTimePerQuestion,
        flaggedCount: session.answers.filter(a => a.isFlagged).length,
      },
    });
  } catch (error) {
    console.error('Error completing test session:', error);
    return res.status(500).json({ error: 'Failed to complete test session' });
  }
};

export const getSessionReview = async (req: Request, res: Response) => {
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
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Session not completed yet' });
    }

    // Calculate domain breakdown
    const domainBreakdown: Record<string, { name: string; color: string; total: number; correct: number }> = {};

    for (const answer of session.answers) {
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
    const reviewQuestions = session.answers.map(answer => ({
      id: answer.question.id,
      questionText: answer.question.questionText,
      scenario: answer.question.scenario,
      choices: JSON.parse(answer.question.choices),
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

    // Find slowest and fastest questions
    const sortedByTime = [...validAnswers].sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds);
    const slowestQuestions = sortedByTime.slice(0, 3).map(a => ({
      questionId: a.questionId,
      time: a.timeSpentSeconds,
    }));

    return res.json({
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
    console.error('Error getting session review:', error);
    return res.status(500).json({ error: 'Failed to get session review' });
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
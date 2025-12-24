import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import Logger from '../utils/logger';
import { AppError, ErrorFactory } from '../utils/AppError';

/**
 * Get user's complete progress dashboard data
 * GET /api/progress
 */
export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw ErrorFactory.unauthorized();
        }

        const userId = req.user.id;

        // Get progress by domain
        const domainProgress = await prisma.userProgress.findMany({
            where: { userId },
            include: {
                domain: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        weightPercentage: true,
                    },
                },
            },
        });

        // Get study streak
        const studyStreak = await prisma.studyStreak.findUnique({
            where: { userId },
        });

        // Get recent test sessions (last 10)
        const recentSessions = await prisma.userTestSession.findMany({
            where: {
                userId,
                status: 'COMPLETED',
            },
            orderBy: { completedAt: 'desc' },
            take: 10,
            include: {
                test: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Calculate overall stats
        const totalAnswers = await prisma.userAnswer.count({
            where: {
                session: { userId },
            },
        });

        const correctAnswers = await prisma.userAnswer.count({
            where: {
                session: { userId },
                isCorrect: true,
            },
        });

        // Get domain breakdown for chart
        const domains = await prisma.domain.findMany({
            select: {
                id: true,
                name: true,
                color: true,
                weightPercentage: true,
            },
        });

        // Calculate accuracy per domain from actual answers
        const domainStats = await Promise.all(
            domains.map(async (domain) => {
                const domainAnswers = await prisma.userAnswer.findMany({
                    where: {
                        session: { userId },
                        question: { domainId: domain.id },
                    },
                    select: { isCorrect: true },
                });

                const total = domainAnswers.length;
                const correct = domainAnswers.filter((a) => a.isCorrect).length;
                const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

                return {
                    domain: domain.name,
                    domainId: domain.id,
                    color: domain.color,
                    weight: domain.weightPercentage,
                    questionsAnswered: total,
                    correctAnswers: correct,
                    accuracy,
                };
            })
        );

        // Get weekly performance (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyAnswers = await prisma.userAnswer.findMany({
            where: {
                session: { userId },
                answeredAt: { gte: sevenDaysAgo },
            },
            select: {
                answeredAt: true,
                isCorrect: true,
            },
        });

        // Group by day
        const dailyPerformance: Record<string, { date: string; total: number; correct: number }> = {};

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyPerformance[dateStr] = { date: dateStr, total: 0, correct: 0 };
        }

        for (const answer of weeklyAnswers) {
            const dateStr = answer.answeredAt.toISOString().split('T')[0];
            if (dailyPerformance[dateStr]) {
                dailyPerformance[dateStr].total++;
                if (answer.isCorrect) {
                    dailyPerformance[dateStr].correct++;
                }
            }
        }

        const weeklyData = Object.values(dailyPerformance).map((day) => ({
            ...day,
            accuracy: day.total > 0 ? Math.round((day.correct / day.total) * 100) : null,
        }));

        res.json({
            overview: {
                totalQuestionsAnswered: totalAnswers,
                correctAnswers,
                overallAccuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
                testsCompleted: recentSessions.length,
            },
            streak: studyStreak || {
                currentStreak: 0,
                longestStreak: 0,
                totalStudyDays: 0,
            },
            domainStats,
            weeklyPerformance: weeklyData,
            recentTests: recentSessions.map((session) => ({
                id: session.id,
                testName: session.test.name,
                score: session.score,
                totalQuestions: session.totalQuestions,
                correctAnswers: session.correctAnswers,
                completedAt: session.completedAt,
                accuracy: session.totalQuestions > 0
                    ? Math.round(((session.correctAnswers || 0) / session.totalQuestions) * 100)
                    : 0,
            })),
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Get dashboard error:', error);
        next(ErrorFactory.internal('Failed to get dashboard data'));
    }
};

/**
 * Get detailed domain-specific progress
 * GET /api/progress/domain/:domainId
 */
export const getDomainProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw ErrorFactory.unauthorized();
        }

        const { domainId } = req.params;
        const userId = req.user.id;

        // Get domain info
        const domain = await prisma.domain.findUnique({
            where: { id: domainId },
        });

        if (!domain) {
            throw ErrorFactory.notFound('Domain');
        }

        // Get all answers for this domain
        const answers = await prisma.userAnswer.findMany({
            where: {
                session: { userId },
                question: { domainId },
            },
            include: {
                question: {
                    select: {
                        id: true,
                        questionText: true,
                        difficulty: true,
                    },
                },
            },
            orderBy: { answeredAt: 'desc' },
        });

        const totalAnswered = answers.length;
        const correctCount = answers.filter((a) => a.isCorrect).length;

        // Get frequently missed questions
        const incorrectAnswers = answers.filter((a) => !a.isCorrect);
        const questionMissCount: Record<string, number> = {};

        for (const answer of incorrectAnswers) {
            questionMissCount[answer.questionId] = (questionMissCount[answer.questionId] || 0) + 1;
        }

        const frequentlyMissed = Object.entries(questionMissCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([questionId, missCount]) => {
                const answer = answers.find((a) => a.questionId === questionId);
                return {
                    questionId,
                    questionText: answer?.question.questionText.substring(0, 100) + '...',
                    missCount,
                };
            });

        res.json({
            domain: {
                id: domain.id,
                name: domain.name,
                color: domain.color,
                weight: domain.weightPercentage,
            },
            stats: {
                totalAnswered,
                correctAnswers: correctCount,
                accuracy: totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0,
                averageTime: answers.length > 0
                    ? Math.round(answers.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / answers.length)
                    : 0,
            },
            frequentlyMissed,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Get domain progress error:', error);
        next(ErrorFactory.internal('Failed to get domain progress'));
    }
};

/**
 * Record study activity (updates streak)
 * POST /api/progress/activity
 */
export const recordActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw ErrorFactory.unauthorized();
        }

        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get or create streak record
        let streak = await prisma.studyStreak.findUnique({
            where: { userId },
        });

        if (!streak) {
            // Create new streak
            streak = await prisma.studyStreak.create({
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

            if (diffDays === 0) {
                // Already studied today, no update needed
            } else if (diffDays === 1) {
                // Consecutive day - increment streak
                const newStreak = streak.currentStreak + 1;
                streak = await prisma.studyStreak.update({
                    where: { userId },
                    data: {
                        currentStreak: newStreak,
                        longestStreak: Math.max(newStreak, streak.longestStreak),
                        lastStudyDate: today,
                        totalStudyDays: streak.totalStudyDays + 1,
                    },
                });
            } else {
                // Streak broken - reset to 1
                streak = await prisma.studyStreak.update({
                    where: { userId },
                    data: {
                        currentStreak: 1,
                        lastStudyDate: today,
                        totalStudyDays: streak.totalStudyDays + 1,
                    },
                });
            }
        }

        res.json({
            message: 'Activity recorded',
            streak: {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                totalStudyDays: streak.totalStudyDays,
            },
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Record activity error:', error);
        next(ErrorFactory.internal('Failed to record activity'));
    }
};

/**
 * Get historical performance data for charts
 * GET /api/progress/history
 */
export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw ErrorFactory.unauthorized();
        }

        const userId = req.user.id;
        const days = parseInt(req.query.days as string) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get completed test sessions
        const sessions = await prisma.userTestSession.findMany({
            where: {
                userId,
                status: 'COMPLETED',
                completedAt: { gte: startDate },
            },
            orderBy: { completedAt: 'asc' },
            select: {
                id: true,
                completedAt: true,
                score: true,
                totalQuestions: true,
                correctAnswers: true,
            },
        });

        const history = sessions.map((session) => ({
            date: session.completedAt?.toISOString().split('T')[0],
            score: session.score,
            accuracy: session.totalQuestions > 0
                ? Math.round(((session.correctAnswers || 0) / session.totalQuestions) * 100)
                : 0,
        }));

        res.json({ history, days });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Get history error:', error);
        next(ErrorFactory.internal('Failed to get history'));
    }
};

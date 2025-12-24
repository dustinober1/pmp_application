import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

// Get user progress by domain
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const progress = await prisma.userProgress.findMany({
            where: { userId },
            include: {
                domain: {
                    select: { id: true, name: true, color: true, weightPercentage: true },
                },
            },
        });

        res.json(progress);
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Get dashboard data
router.get('/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [
            progress,
            recentSessions,
            streak,
            dailyGoal,
            domainStats,
        ] = await Promise.all([
            prisma.userProgress.findMany({
                where: { userId },
                include: { domain: true },
            }),
            prisma.userTestSession.findMany({
                where: { userId, status: 'COMPLETED' },
                orderBy: { completedAt: 'desc' },
                take: 5,
                include: {
                    test: { select: { name: true } },
                },
            }),
            prisma.studyStreak.findUnique({
                where: { userId },
            }),
            prisma.dailyGoal.findUnique({
                where: { userId },
            }),
            prisma.userProgress.groupBy({
                by: ['domainId'],
                where: { userId },
                _sum: { questionsAnswered: true, correctAnswers: true },
            }),
        ]);

        // Calculate overall stats
        const totalQuestions = progress.reduce((sum, p) => sum + p.questionsAnswered, 0);
        const totalCorrect = progress.reduce((sum, p) => sum + p.correctAnswers, 0);
        const overallAccuracy = totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

        res.json({
            progress,
            recentSessions,
            streak: streak || { currentStreak: 0, longestStreak: 0 },
            dailyGoal: dailyGoal || { flashcardGoal: 20, questionsGoal: 25 },
            stats: {
                totalQuestions,
                totalCorrect,
                overallAccuracy,
                testsCompleted: recentSessions.length,
            },
            domainStats,
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Update study streak
router.post('/streak/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const today = new Date().toDateString();

        let streak = await prisma.studyStreak.findUnique({
            where: { userId },
        });

        if (!streak) {
            streak = await prisma.studyStreak.create({
                data: {
                    userId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastStudyDate: new Date(),
                    totalStudyDays: 1,
                },
            });
        } else {
            const lastStudyDate = new Date(streak.lastStudyDate).toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            if (lastStudyDate === today) {
                // Already studied today
                return res.json(streak);
            }

            let newStreak = streak.currentStreak;
            if (lastStudyDate === yesterday) {
                newStreak += 1;
            } else {
                newStreak = 1; // Reset streak
            }

            streak = await prisma.studyStreak.update({
                where: { userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak: Math.max(streak.longestStreak, newStreak),
                    lastStudyDate: new Date(),
                    totalStudyDays: streak.totalStudyDays + 1,
                },
            });
        }

        res.json(streak);
    } catch (error) {
        console.error('Update streak error:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

// Update progress for a domain
router.post('/domain', async (req, res) => {
    try {
        const { userId, domainId, questionsAnswered, correctAnswers, timeSpent } = req.body;

        const progress = await prisma.userProgress.upsert({
            where: {
                userId_domainId: { userId, domainId },
            },
            create: {
                userId,
                domainId,
                questionsAnswered,
                correctAnswers,
                averageTimePerQuestion: timeSpent / questionsAnswered,
            },
            update: {
                questionsAnswered: { increment: questionsAnswered },
                correctAnswers: { increment: correctAnswers },
                lastActivityAt: new Date(),
            },
            include: { domain: true },
        });

        res.json(progress);
    } catch (error) {
        console.error('Update domain progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Get study history
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = '30' } = req.query;
        const daysNum = parseInt(days as string);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysNum);

        const sessions = await prisma.userTestSession.findMany({
            where: {
                userId,
                completedAt: { gte: startDate },
            },
            orderBy: { completedAt: 'asc' },
            select: {
                completedAt: true,
                score: true,
                correctAnswers: true,
                totalQuestions: true,
            },
        });

        // Group by date
        const history: Record<string, { sessions: number; avgScore: number }> = {};

        sessions.forEach((session) => {
            if (session.completedAt) {
                const date = session.completedAt.toISOString().split('T')[0];
                if (!history[date]) {
                    history[date] = { sessions: 0, avgScore: 0 };
                }
                history[date].sessions += 1;
                history[date].avgScore =
                    (history[date].avgScore * (history[date].sessions - 1) + (session.score || 0)) /
                    history[date].sessions;
            }
        });

        res.json(history);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;

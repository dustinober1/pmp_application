import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

// Get practice tests
router.get('/tests', async (req, res) => {
    try {
        const tests = await prisma.practiceTest.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: { testQuestions: true },
                },
            },
        });

        res.json(tests);
    } catch (error) {
        console.error('Get practice tests error:', error);
        res.status(500).json({ error: 'Failed to fetch practice tests' });
    }
});

// Start a test session
router.post('/sessions', async (req, res) => {
    try {
        const { testId, userId } = req.body;

        if (!testId || !userId) {
            return res.status(400).json({ error: 'testId and userId are required' });
        }

        const test = await prisma.practiceTest.findUnique({
            where: { id: testId },
            include: {
                testQuestions: {
                    include: { question: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });

        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        const session = await prisma.userTestSession.create({
            data: {
                userId,
                testId,
                timeLimitMinutes: test.timeLimitMinutes,
                totalQuestions: test.testQuestions.length,
                status: 'IN_PROGRESS',
            },
        });

        res.status(201).json({
            session,
            questions: test.testQuestions.map((tq) => tq.question),
        });
    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({ error: 'Failed to start test session' });
    }
});

// Submit answer
router.post('/sessions/:sessionId/answer', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { questionId, selectedAnswerIndex, timeSpentSeconds } = req.body;

        const session = await prisma.userTestSession.findUnique({
            where: { id: sessionId },
        });

        if (!session || session.status !== 'IN_PROGRESS') {
            return res.status(400).json({ error: 'Invalid or completed session' });
        }

        const question = await prisma.question.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;

        const answer = await prisma.userAnswer.upsert({
            where: {
                sessionId_questionId: { sessionId, questionId },
            },
            create: {
                sessionId,
                questionId,
                selectedAnswerIndex,
                isCorrect,
                timeSpentSeconds: timeSpentSeconds || 0,
            },
            update: {
                selectedAnswerIndex,
                isCorrect,
                timeSpentSeconds: timeSpentSeconds || 0,
            },
        });

        res.json(answer);
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

// Complete session
router.post('/sessions/:sessionId/complete', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const answers = await prisma.userAnswer.findMany({
            where: { sessionId },
        });

        const correctAnswers = answers.filter((a) => a.isCorrect).length;
        const score = Math.round((correctAnswers / answers.length) * 100);

        const session = await prisma.userTestSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                score,
                correctAnswers,
            },
        });

        res.json({
            session,
            result: {
                score,
                correctAnswers,
                totalQuestions: answers.length,
            },
        });
    } catch (error) {
        console.error('Complete session error:', error);
        res.status(500).json({ error: 'Failed to complete session' });
    }
});

export default router;

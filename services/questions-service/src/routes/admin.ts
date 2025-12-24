import { Router } from 'express';
import { prisma } from '../services/database';

const router = Router();

// Admin: Get all questions (including inactive)
router.get('/questions', async (req, res) => {
    try {
        const { page = '1', limit = '50' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(200, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                skip,
                take: limitNum,
                include: {
                    domain: { select: { id: true, name: true } },
                    creator: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.question.count(),
        ]);

        res.json({
            questions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Admin get questions error:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Admin: Create question
router.post('/questions', async (req, res) => {
    try {
        const { domainId, questionText, scenario, choices, correctAnswerIndex, explanation, difficulty, createdBy } = req.body;

        const question = await prisma.question.create({
            data: {
                domainId,
                questionText,
                scenario,
                choices: typeof choices === 'string' ? choices : JSON.stringify(choices),
                correctAnswerIndex,
                explanation,
                difficulty: difficulty || 'MEDIUM',
                createdBy,
            },
            include: { domain: true },
        });

        res.status(201).json(question);
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
});

// Admin: Update question
router.put('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.choices && typeof data.choices !== 'string') {
            data.choices = JSON.stringify(data.choices);
        }

        const question = await prisma.question.update({
            where: { id },
            data,
            include: { domain: true },
        });

        res.json(question);
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

// Admin: Toggle question active status
router.patch('/questions/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        const question = await prisma.question.findUnique({ where: { id } });
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const updated = await prisma.question.update({
            where: { id },
            data: { isActive: !question.isActive },
        });

        res.json(updated);
    } catch (error) {
        console.error('Toggle question error:', error);
        res.status(500).json({ error: 'Failed to toggle question' });
    }
});

export default router;

import { Router } from 'express';
import { prisma } from '../services/database';
import { cache } from '../services/cache';

const router = Router();

// Get questions with optional filtering
router.get('/', async (req, res) => {
    try {
        const { domain, difficulty, page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        // Try cache first
        const cacheKey = `questions:${domain || 'all'}:${difficulty || 'all'}:${pageNum}:${limitNum}`;
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const where: any = { isActive: true };
        if (domain) where.domainId = domain;
        if (difficulty) where.difficulty = difficulty;

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    domain: {
                        select: { id: true, name: true, color: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.question.count({ where }),
        ]);

        const result = {
            questions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        };

        await cache.set(cacheKey, result, 300); // Cache for 5 minutes

        res.json(result);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get question by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cacheKey = `question:${id}`;
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const question = await prisma.question.findUnique({
            where: { id, isActive: true },
            include: {
                domain: {
                    select: { id: true, name: true, color: true },
                },
            },
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        await cache.set(cacheKey, question, 3600); // Cache for 1 hour

        res.json(question);
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// Get domains
router.get('/domains/list', async (req, res) => {
    try {
        const cacheKey = 'domains:all';
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const domains = await prisma.domain.findMany({
            include: {
                _count: {
                    select: { questions: true },
                },
            },
        });

        await cache.set(cacheKey, domains, 3600);

        res.json(domains);
    } catch (error) {
        console.error('Get domains error:', error);
        res.status(500).json({ error: 'Failed to fetch domains' });
    }
});

export default router;

import { Router } from 'express';
import { prisma } from '../services/database';
import { cache } from '../services/cache';

const router = Router();

// Get flashcards
router.get('/', async (req, res) => {
    try {
        const { domain, category, difficulty, page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const cacheKey = `flashcards:${domain || 'all'}:${category || 'all'}:${difficulty || 'all'}:${pageNum}:${limitNum}`;
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const where: any = { isActive: true };
        if (domain) where.domainId = domain;
        if (category) where.category = category;
        if (difficulty) where.difficulty = difficulty;

        const [flashcards, total] = await Promise.all([
            prisma.flashCard.findMany({
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
            prisma.flashCard.count({ where }),
        ]);

        const result = {
            flashcards,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        };

        await cache.set(cacheKey, result, 300);

        res.json(result);
    } catch (error) {
        console.error('Get flashcards error:', error);
        res.status(500).json({ error: 'Failed to fetch flashcards' });
    }
});

// Get flashcard by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cacheKey = `flashcard:${id}`;
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const flashcard = await prisma.flashCard.findUnique({
            where: { id, isActive: true },
            include: {
                domain: {
                    select: { id: true, name: true, color: true },
                },
            },
        });

        if (!flashcard) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }

        await cache.set(cacheKey, flashcard, 3600);

        res.json(flashcard);
    } catch (error) {
        console.error('Get flashcard error:', error);
        res.status(500).json({ error: 'Failed to fetch flashcard' });
    }
});

// Get categories
router.get('/categories/list', async (req, res) => {
    try {
        const cacheKey = 'flashcard:categories';
        const cached = await cache.get<any>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const categories = await prisma.flashCard.groupBy({
            by: ['category'],
            where: { isActive: true },
            _count: { category: true },
        });

        const result = categories.map((c) => ({
            name: c.category,
            count: c._count.category,
        }));

        await cache.set(cacheKey, result, 3600);

        res.json(result);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;

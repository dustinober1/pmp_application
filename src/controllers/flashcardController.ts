import { Request, Response } from 'express';
import { prisma } from '../services/database';

export const getFlashcards = async (req: Request, res: Response) => {
  try {
    const { domain, difficulty, category, limit = 20, offset = 0 } = req.query;

    const where: any = { isActive: true };

    if (domain && domain !== 'all') {
      where.domainId = domain;
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const flashcards = await prisma.flashCard.findMany({
      where,
      include: {
        domain: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.flashCard.count({ where });

    return res.json({
      flashcards,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
};

export const getFlashcardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const flashcard = await prisma.flashCard.findUnique({
      where: { id },
      include: {
        domain: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    return res.json(flashcard);
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    return res.status(500).json({ error: 'Failed to fetch flashcard' });
  }
};

export const getFlashcardCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.flashCard.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return res.json(categories.map(cat => ({
      name: cat.category,
      count: cat._count.category,
    })));
  } catch (error) {
    console.error('Error fetching flashcard categories:', error);
    return res.status(500).json({ error: 'Failed to fetch flashcard categories' });
  }
};
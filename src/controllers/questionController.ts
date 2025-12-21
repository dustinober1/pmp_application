import { Request, Response } from 'express';
import { prisma } from '../services/database';

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { domain, difficulty, limit = 10, offset = 0 } = req.query;

    const where: any = { isActive: true };

    if (domain && domain !== 'all') {
      where.domainId = domain;
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    const questions = await prisma.question.findMany({
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

    const total = await prisma.question.count({ where });

    return res.json({
      questions,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
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

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    return res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return res.status(500).json({ error: 'Failed to fetch question' });
  }
};

export const getDomains = async (req: Request, res: Response) => {
  try {
    const domains = await prisma.domain.findMany({
      include: {
        _count: {
          select: {
            questions: {
              where: { isActive: true }
            },
            flashCards: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return res.status(500).json({ error: 'Failed to fetch domains' });
  }
};
import { Request, Response } from 'express';
import { prisma } from '../services/database';
import { cache } from '../services/cache';
import Logger from '../utils/logger';

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { domain, difficulty, limit = 10, offset = 0 } = req.query;

    // Create a cache key based on query parameters
    const cacheKey = `questions:${domain || 'all'}:${difficulty || 'all'}:${limit}:${offset}`;

    // Check cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

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

    const result = {
      questions,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        pages: Math.ceil(total / Number(limit)),
      },
    };

    // Cache result for 5 minutes
    await cache.set(cacheKey, result, 300);

    return res.json(result);
  } catch (error) {
    Logger.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `question:${id}`;

    const cachedQuestion = await cache.get(cacheKey);
    if (cachedQuestion) {
      return res.json(cachedQuestion);
    }

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

    // Cache single question for longer (1 hour) as they don't change often
    await cache.set(cacheKey, question, 3600);

    return res.json(question);
  } catch (error) {
    Logger.error('Error fetching question:', error);
    return res.status(500).json({ error: 'Failed to fetch question' });
  }
};

export const getDomains = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'domains:all';
    const cachedDomains = await cache.get(cacheKey);

    if (cachedDomains) {
      return res.json(cachedDomains);
    }

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

    // Cache domains for 1 hour
    await cache.set(cacheKey, domains, 3600);

    return res.json(domains);
  } catch (error) {
    Logger.error('Error fetching domains:', error);
    return res.status(500).json({ error: 'Failed to fetch domains' });
  }
};
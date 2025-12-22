import { Request, Response } from 'express';

// Mock Prisma before imports
jest.mock('../../src/services/database', () => ({
    prisma: {
        flashCard: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        flashCardReview: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
            upsert: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        domain: {
            findMany: jest.fn(),
        },
        dailyGoal: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
        },
    },
}));

import { prisma } from '../../src/services/database';
import {
    getFlashcards,
    getFlashcardById,
    getFlashcardCategories,
} from '../../src/controllers/flashcardController';

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Flashcard Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFlashcards', () => {
        it('should return flashcards with pagination', async () => {
            const mockFlashcards = [
                {
                    id: 'fc1',
                    frontText: 'What is WBS?',
                    backText: 'Work Breakdown Structure',
                    domain: { id: 'd1', name: 'Planning', color: '#3B82F6' },
                },
                {
                    id: 'fc2',
                    frontText: 'What is EVM?',
                    backText: 'Earned Value Management',
                    domain: { id: 'd1', name: 'Planning', color: '#3B82F6' },
                },
            ];

            (prisma.flashCard.findMany as jest.Mock).mockResolvedValue(mockFlashcards);
            (prisma.flashCard.count as jest.Mock).mockResolvedValue(2);

            const req = {
                query: { page: '1', limit: '10' },
            } as unknown as Request;
            const res = mockResponse() as Response;

            await getFlashcards(req, res);

            expect(res.json).toHaveBeenCalled();
            const response = (res.json as jest.Mock).mock.calls[0][0];
            expect(response.flashcards).toHaveLength(2);
            expect(response.pagination.total).toBe(2);
        });

        it('should filter by domain', async () => {
            (prisma.flashCard.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.flashCard.count as jest.Mock).mockResolvedValue(0);

            const req = {
                query: { domain: 'domain-123' },
            } as unknown as Request;
            const res = mockResponse() as Response;

            await getFlashcards(req, res);

            expect(prisma.flashCard.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        domainId: 'domain-123',
                    }),
                })
            );
        });

        it('should filter by difficulty', async () => {
            (prisma.flashCard.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.flashCard.count as jest.Mock).mockResolvedValue(0);

            const req = {
                query: { difficulty: 'HARD' },
            } as unknown as Request;
            const res = mockResponse() as Response;

            await getFlashcards(req, res);

            expect(prisma.flashCard.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        difficulty: 'HARD',
                    }),
                })
            );
        });

        it('should filter by category', async () => {
            (prisma.flashCard.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.flashCard.count as jest.Mock).mockResolvedValue(0);

            const req = {
                query: { category: 'Planning' },
            } as unknown as Request;
            const res = mockResponse() as Response;

            await getFlashcards(req, res);

            expect(prisma.flashCard.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        category: 'Planning',
                    }),
                })
            );
        });

        it('should handle errors gracefully', async () => {
            (prisma.flashCard.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const req = { query: {} } as unknown as Request;
            const res = mockResponse() as Response;

            await getFlashcards(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getFlashcardById', () => {
        it('should return a flashcard by ID', async () => {
            const mockFlashcard = {
                id: 'fc1',
                frontText: 'What is PMP?',
                backText: 'Project Management Professional',
                domain: { id: 'd1', name: 'General', color: '#000' },
            };

            (prisma.flashCard.findUnique as jest.Mock).mockResolvedValue(mockFlashcard);

            const req = { params: { id: 'fc1' } } as unknown as Request;
            const res = mockResponse() as Response;

            await getFlashcardById(req, res);

            expect(res.json).toHaveBeenCalledWith(mockFlashcard);
        });

        it('should return 404 for non-existent flashcard', async () => {
            (prisma.flashCard.findUnique as jest.Mock).mockResolvedValue(null);

            const req = { params: { id: 'non-existent' } } as unknown as Request;
            const res = mockResponse() as Response;

            await getFlashcardById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Flashcard not found' });
        });
    });

    describe('getFlashcardCategories', () => {
        it('should return grouped categories with counts', async () => {
            const mockGroups = [
                { category: 'Planning', _count: { _all: 10 } },
                { category: 'Execution', _count: { _all: 15 } },
                { category: 'Monitoring', _count: { _all: 8 } },
            ];

            (prisma.flashCard.groupBy as jest.Mock).mockResolvedValue(mockGroups);

            const req = {} as Request;
            const res = mockResponse() as Response;

            await getFlashcardCategories(req, res);

            expect(res.json).toHaveBeenCalled();
            const response = (res.json as jest.Mock).mock.calls[0][0];
            expect(response).toHaveLength(3);
            expect(response[0]).toHaveProperty('name');
            expect(response[0]).toHaveProperty('count');
        });

        it('should handle errors gracefully', async () => {
            (prisma.flashCard.groupBy as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const req = {} as Request;
            const res = mockResponse() as Response;

            await getFlashcardCategories(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});

describe('SM-2 Algorithm', () => {
    // Test the spaced repetition logic
    describe('calculateSM2', () => {
        const calculateSM2 = (
            difficulty: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY',
            currentEaseFactor: number,
            currentInterval: number
        ) => {
            let newEaseFactor = currentEaseFactor;
            let newInterval = currentInterval;
            let newLapses = 0;

            switch (difficulty) {
                case 'AGAIN':
                    newInterval = 1;
                    newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
                    newLapses = 1;
                    break;
                case 'HARD':
                    newInterval = Math.max(1, Math.round(currentInterval * 1.2));
                    newEaseFactor = Math.max(1.3, currentEaseFactor - 0.15);
                    break;
                case 'GOOD':
                    if (currentInterval <= 1) {
                        newInterval = 3;
                    } else if (currentInterval <= 3) {
                        newInterval = 7;
                    } else {
                        newInterval = Math.round(currentInterval * currentEaseFactor);
                    }
                    break;
                case 'EASY':
                    if (currentInterval <= 1) {
                        newInterval = 4;
                    } else {
                        newInterval = Math.round(currentInterval * currentEaseFactor * 1.3);
                    }
                    newEaseFactor = currentEaseFactor + 0.15;
                    break;
            }

            return { newEaseFactor, newInterval, newLapses };
        };

        it('should reset interval to 1 for AGAIN', () => {
            const result = calculateSM2('AGAIN', 2.5, 10);
            expect(result.newInterval).toBe(1);
            expect(result.newLapses).toBe(1);
        });

        it('should slightly increase interval for HARD', () => {
            const result = calculateSM2('HARD', 2.5, 5);
            expect(result.newInterval).toBe(6); // 5 * 1.2 = 6
            expect(result.newEaseFactor).toBe(2.35); // 2.5 - 0.15
        });

        it('should use proper graduation for GOOD', () => {
            // First review: 1 -> 3
            let result = calculateSM2('GOOD', 2.5, 1);
            expect(result.newInterval).toBe(3);

            // Second review: 3 -> 7
            result = calculateSM2('GOOD', 2.5, 3);
            expect(result.newInterval).toBe(7);

            // Later: interval * easeFactor
            result = calculateSM2('GOOD', 2.5, 10);
            expect(result.newInterval).toBe(25); // 10 * 2.5
        });

        it('should give larger bonus for EASY', () => {
            const result = calculateSM2('EASY', 2.5, 5);
            expect(result.newInterval).toBe(16); // 5 * 2.5 * 1.3 ≈ 16
            expect(result.newEaseFactor).toBe(2.65); // 2.5 + 0.15
        });

        it('should not let ease factor go below 1.3', () => {
            // Multiple AGAIN presses
            let easeFactor = 1.5;
            for (let i = 0; i < 5; i++) {
                const result = calculateSM2('AGAIN', easeFactor, 1);
                easeFactor = result.newEaseFactor;
            }
            expect(easeFactor).toBeGreaterThanOrEqual(1.3);
        });
    });
});

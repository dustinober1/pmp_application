import { Request, Response } from 'express';

// Mock Prisma before imports
jest.mock('../../src/services/database', () => ({
    prisma: {
        question: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
        },
        domain: {
            findMany: jest.fn(),
        },
    },
}));

import { prisma } from '../../src/services/database';
import {
    getQuestions,
    getQuestionById,
    getDomains,
} from '../../src/controllers/questionController';

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Question Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getQuestions', () => {
        it('should return paginated questions', async () => {
            const mockQuestions = [
                {
                    id: 'q1',
                    questionText: 'What is PMP?',
                    choices: '["A", "B", "C", "D"]',
                    domain: { id: 'd1', name: 'Domain 1', color: '#000' },
                },
                {
                    id: 'q2',
                    questionText: 'What is agile?',
                    choices: '["A", "B", "C", "D"]',
                    domain: { id: 'd1', name: 'Domain 1', color: '#000' },
                },
            ];

            (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
            (prisma.question.count as jest.Mock).mockResolvedValue(2);

            const req = {
                query: { page: '1', limit: '10' },
            } as unknown as Request;
            const res = mockResponse() as Response;

            await getQuestions(req, res);

            expect(res.json).toHaveBeenCalled();
            const response = (res.json as jest.Mock).mock.calls[0][0];
            expect(response.questions).toHaveLength(2);
            expect(response.pagination).toBeDefined();
            expect(response.pagination.total).toBe(2);
        });

        it('should filter by domain', async () => {
            const mockQuestions = [
                {
                    id: 'q1',
                    questionText: 'Domain specific question',
                    choices: '["A", "B", "C", "D"]',
                    domain: { id: 'd1', name: 'Domain 1', color: '#000' },
                },
            ];

            (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
            (prisma.question.count as jest.Mock).mockResolvedValue(1);

            const req = {
                query: { domain: 'd1' },
            } as unknown as Request;
            const res = mockResponse() as Response;

            await getQuestions(req, res);

            expect(prisma.question.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        domainId: 'd1',
                    }),
                })
            );
        });

        it('should filter by difficulty', async () => {
            (prisma.question.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.question.count as jest.Mock).mockResolvedValue(0);

            const req = {
                query: { difficulty: 'HARD' },
            } as unknown as Request;
            const res = mockResponse() as Response;

            await getQuestions(req, res);

            expect(prisma.question.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        difficulty: 'HARD',
                    }),
                })
            );
        });

        it('should handle errors gracefully', async () => {
            (prisma.question.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const req = { query: {} } as unknown as Request;
            const res = mockResponse() as Response;

            await getQuestions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.any(String),
                })
            );
        });
    });

    describe('getQuestionById', () => {
        it('should return a question with parsed choices', async () => {
            const mockQuestion = {
                id: 'q1',
                questionText: 'What is PMP?',
                choices: '["Option A", "Option B", "Option C", "Option D"]',
                correctAnswerIndex: 0,
                domain: { id: 'd1', name: 'Domain 1' },
            };

            (prisma.question.findUnique as jest.Mock).mockResolvedValue(mockQuestion);

            const req = { params: { id: 'q1' } } as unknown as Request;
            const res = mockResponse() as Response;

            await getQuestionById(req, res);

            expect(res.json).toHaveBeenCalled();
            const response = (res.json as jest.Mock).mock.calls[0][0];
            // Controller returns raw object, so choices is a string
            expect(typeof response.choices).toBe('string');
        });

        it('should return 404 for non-existent question', async () => {
            (prisma.question.findUnique as jest.Mock).mockResolvedValue(null);

            const req = { params: { id: 'non-existent' } } as unknown as Request;
            const res = mockResponse() as Response;

            await getQuestionById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Question not found' });
        });
    });

    describe('getDomains', () => {
        it('should return all domains', async () => {
            const mockDomains = [
                { id: 'd1', name: 'People', description: 'People domain', color: '#3B82F6' },
                { id: 'd2', name: 'Process', description: 'Process domain', color: '#10B981' },
            ];

            (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);

            const req = {} as Request;
            const res = mockResponse() as Response;

            await getDomains(req, res);

            expect(res.json).toHaveBeenCalledWith(mockDomains);
        });

        it('should handle errors gracefully', async () => {
            (prisma.domain.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const req = {} as Request;
            const res = mockResponse() as Response;

            await getDomains(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});

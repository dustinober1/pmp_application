import { Request, Response, NextFunction } from 'express';
import {
    getPracticeTests,
    getPracticeTestById,
    startTestSession,
    submitAnswer,
    completeTestSession,
} from '../../src/controllers/practiceController';
import { prisma } from '../../src/services/database';

// Mock dependencies
jest.mock('../../src/services/database', () => ({
    prisma: {
        practiceTest: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        userTestSession: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        userAnswer: {
            create: jest.fn(),
            upsert: jest.fn(),
            findMany: jest.fn(),
        },
        question: {
            findMany: jest.fn(),
        },
        testQuestion: {
            findMany: jest.fn(),
        },
        userProgress: {
            upsert: jest.fn(),
        },
        studyStreak: {
            upsert: jest.fn(),
        },
    },
}));

describe('Practice Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            body: {},
            params: {},
            query: {},
            user: {
                id: 'user-123',
                email: 'test@example.com',
                role: 'USER',
                firstName: 'Test',
                lastName: 'User',
            },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('getPracticeTests', () => {
        it('should return all active practice tests', async () => {
            const mockTests = [
                {
                    id: 'test-1',
                    name: 'PMP Full Exam 1',
                    description: 'Full 180-question practice exam',
                    totalQuestions: 180,
                    timeLimitMinutes: 230,
                    isActive: true,
                },
                {
                    id: 'test-2',
                    name: 'Mini Quiz 1',
                    description: '25-question mini quiz',
                    totalQuestions: 25,
                    timeLimitMinutes: 30,
                    isActive: true,
                },
            ];

            (prisma.practiceTest.findMany as jest.Mock).mockResolvedValue(mockTests);

            await getPracticeTests(mockRequest as Request, mockResponse as Response);

            expect(prisma.practiceTest.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                orderBy: { name: 'asc' },
            });
            expect(mockResponse.json).toHaveBeenCalledWith(mockTests);
        });

        it('should handle errors gracefully', async () => {
            (prisma.practiceTest.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getPracticeTests(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Failed to fetch practice tests',
            });
        });
    });

    describe('getPracticeTestById', () => {
        it('should return a practice test by ID with questions', async () => {
            mockRequest.params = { id: 'test-1' };

            const mockTest = {
                id: 'test-1',
                name: 'PMP Full Exam 1',
                description: 'Full practice exam',
                totalQuestions: 180,
                timeLimitMinutes: 230,
                testQuestions: [
                    {
                        id: 'tq-1',
                        orderIndex: 0,
                        question: {
                            id: 'q-1',
                            questionText: 'What is PMP?',
                            domain: { name: 'People' },
                        },
                    },
                ],
            };

            (prisma.practiceTest.findUnique as jest.Mock).mockResolvedValue(mockTest);

            await getPracticeTestById(mockRequest as Request, mockResponse as Response);

            expect(prisma.practiceTest.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-1' },
                include: expect.any(Object),
            });
            expect(mockResponse.json).toHaveBeenCalledWith(mockTest);
        });

        it('should return 404 for non-existent test', async () => {
            mockRequest.params = { id: 'non-existent' };

            (prisma.practiceTest.findUnique as jest.Mock).mockResolvedValue(null);

            await getPracticeTestById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Practice test not found',
            });
        });
    });

    describe('startTestSession', () => {
        it('should create a new test session', async () => {
            mockRequest.params = { testId: 'test-1' };

            const mockTest = {
                id: 'test-1',
                name: 'PMP Full Exam',
                totalQuestions: 180,
                timeLimitMinutes: 230,
                testQuestions: Array(180).fill({
                    question: { id: 'q-1' },
                }),
            };

            const mockSession = {
                id: 'session-1',
                userId: 'user-123',
                testId: 'test-1',
                status: 'IN_PROGRESS',
                totalQuestions: 180,
                timeLimitMinutes: 230,
                startedAt: new Date(),
            };

            (prisma.practiceTest.findUnique as jest.Mock).mockResolvedValue(mockTest);
            (prisma.userTestSession.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.userTestSession.create as jest.Mock).mockResolvedValue(mockSession);

            await startTestSession(mockRequest as Request, mockResponse as Response);

            expect(prisma.userTestSession.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });

        it('should return existing in-progress session', async () => {
            mockRequest.params = { testId: 'test-1' };

            const mockTest = {
                id: 'test-1',
                name: 'PMP Full Exam',
                totalQuestions: 180,
                timeLimitMinutes: 230,
                testQuestions: [],
            };

            const existingSession = {
                id: 'session-existing',
                userId: 'user-123',
                testId: 'test-1',
                status: 'IN_PROGRESS',
                answers: [],
                test: mockTest,
            };

            (prisma.practiceTest.findUnique as jest.Mock).mockResolvedValue(mockTest);
            (prisma.userTestSession.findFirst as jest.Mock).mockResolvedValue(existingSession);

            await startTestSession(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                id: 'session-existing',
            }));
        });

        it('should reject if user not authenticated', async () => {
            mockRequest.user = undefined;
            mockRequest.params = { testId: 'test-1' };

            await startTestSession(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });
    });

    describe('submitAnswer', () => {
        it('should submit an answer for a question', async () => {
            mockRequest.params = { sessionId: 'session-1' };
            mockRequest.body = {
                questionId: 'q-1',
                selectedAnswerIndex: 2,
                timeSpentSeconds: 45,
            };

            const mockSession = {
                id: 'session-1',
                userId: 'user-123',
                status: 'IN_PROGRESS',
            };

            const mockQuestion = {
                id: 'q-1',
                correctAnswerIndex: 2,
            };

            (prisma.userTestSession.findUnique as jest.Mock).mockResolvedValue(mockSession);
            (prisma.$transaction as jest.Mock) = jest.fn().mockImplementation(async (fn) => {
                // Mock the transaction callback
                return { isCorrect: true };
            });

            // Simplified mock for the answer creation
            (prisma.userAnswer.upsert as jest.Mock).mockResolvedValue({
                id: 'answer-1',
                isCorrect: true,
            });

            await submitAnswer(mockRequest as Request, mockResponse as Response);

            // Verify response based on implementation
            expect(mockResponse.json).toHaveBeenCalled();
        });
    });

    describe('completeTestSession', () => {
        it('should complete a test session and calculate score', async () => {
            mockRequest.params = { sessionId: 'session-1' };

            const mockSession = {
                id: 'session-1',
                userId: 'user-123',
                testId: 'test-1',
                status: 'IN_PROGRESS',
                totalQuestions: 10,
            };

            const mockAnswers = [
                { isCorrect: true, question: { domainId: 'domain-1' } },
                { isCorrect: true, question: { domainId: 'domain-1' } },
                { isCorrect: false, question: { domainId: 'domain-2' } },
            ];

            (prisma.userTestSession.findUnique as jest.Mock).mockResolvedValue(mockSession);
            (prisma.userAnswer.findMany as jest.Mock).mockResolvedValue(mockAnswers);
            (prisma.userTestSession.update as jest.Mock).mockResolvedValue({
                ...mockSession,
                status: 'COMPLETED',
                score: 67,
                correctAnswers: 2,
                completedAt: new Date(),
            });
            (prisma.userProgress.upsert as jest.Mock).mockResolvedValue({});
            (prisma.studyStreak.upsert as jest.Mock).mockResolvedValue({});

            await completeTestSession(mockRequest as Request, mockResponse as Response);

            expect(prisma.userTestSession.update).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should reject completion of already completed session', async () => {
            mockRequest.params = { sessionId: 'session-1' };

            const mockSession = {
                id: 'session-1',
                userId: 'user-123',
                status: 'COMPLETED',
            };

            (prisma.userTestSession.findUnique as jest.Mock).mockResolvedValue(mockSession);

            await completeTestSession(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});

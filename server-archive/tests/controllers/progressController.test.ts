import { Request, Response, NextFunction } from 'express';
import { getDashboard, getDomainProgress, recordActivity, getHistory } from '../../src/controllers/progress';
import { prisma } from '../../src/services/database';

// Mock dependencies
jest.mock('../../src/services/database', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        userProgress: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            upsert: jest.fn(),
        },
        userTestSession: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
        userAnswer: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
        flashCardReview: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        studyStreak: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
        },
        dailyGoal: {
            findUnique: jest.fn(),
        },
        domain: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        question: {
            count: jest.fn(),
        },
    },
}));

describe('Progress Controller', () => {
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

    describe('getDashboard', () => {
        it('should return comprehensive dashboard data', async () => {
            const mockUser = {
                id: 'user-123',
                firstName: 'Test',
                lastName: 'User',
            };

            const mockProgress = [
                {
                    domainId: 'domain-1',
                    questionsAnswered: 50,
                    correctAnswers: 40,
                    domain: { name: 'People', color: '#3B82F6' },
                },
                {
                    domainId: 'domain-2',
                    questionsAnswered: 30,
                    correctAnswers: 20,
                    domain: { name: 'Process', color: '#10B981' },
                },
            ];

            const mockStreak = {
                currentStreak: 5,
                longestStreak: 10,
                totalStudyDays: 25,
            };

            const mockDailyGoal = {
                flashcardGoal: 20,
                questionsGoal: 25,
                cardsReviewedToday: 15,
                questionsAnsweredToday: 20,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (prisma.userProgress.findMany as jest.Mock).mockResolvedValue(mockProgress);
            (prisma.studyStreak.findUnique as jest.Mock).mockResolvedValue(mockStreak);
            (prisma.dailyGoal.findUnique as jest.Mock).mockResolvedValue(mockDailyGoal);
            (prisma.userTestSession.count as jest.Mock).mockResolvedValue(10);
            (prisma.flashCardReview.count as jest.Mock).mockResolvedValue(200);
            (prisma.userAnswer.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);

            await getDashboard(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalled();
            const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];

            expect(responseData).toHaveProperty('progress');
            expect(responseData).toHaveProperty('streak');
            expect(responseData).toHaveProperty('dailyGoal');
        });

        it('should return 401 if user not authenticated', async () => {
            mockRequest.user = undefined;

            await getDashboard(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Authentication required',
            });
        });
    });

    describe('getDomainProgress', () => {
        it('should return detailed progress for a specific domain', async () => {
            mockRequest.params = { domainId: 'domain-1' };

            const mockDomain = {
                id: 'domain-1',
                name: 'People',
                description: 'People domain',
                color: '#3B82F6',
            };

            const mockProgress = {
                questionsAnswered: 100,
                correctAnswers: 75,
                averageTimePerQuestion: 45.5,
            };

            (prisma.domain.findUnique as jest.Mock).mockResolvedValue(mockDomain);
            (prisma.userProgress.findFirst as jest.Mock).mockResolvedValue(mockProgress);
            (prisma.question.count as jest.Mock).mockResolvedValue(200);
            (prisma.userAnswer.findMany as jest.Mock).mockResolvedValue([]);

            await getDomainProgress(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalled();
            const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];

            expect(responseData).toHaveProperty('domain');
            expect(responseData.domain).toHaveProperty('name', 'People');
        });

        it('should return 404 for non-existent domain', async () => {
            mockRequest.params = { domainId: 'non-existent' };

            (prisma.domain.findUnique as jest.Mock).mockResolvedValue(null);

            await getDomainProgress(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Domain not found',
            });
        });
    });

    describe('recordActivity', () => {
        it('should record study activity and update streak', async () => {
            mockRequest.body = {
                type: 'question',
                count: 5,
            };

            const existingStreak = {
                id: 'streak-1',
                userId: 'user-123',
                currentStreak: 3,
                longestStreak: 5,
                lastStudyDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                totalStudyDays: 10,
            };

            (prisma.studyStreak.findUnique as jest.Mock).mockResolvedValue(existingStreak);
            (prisma.studyStreak.upsert as jest.Mock).mockResolvedValue({
                ...existingStreak,
                currentStreak: 4,
                totalStudyDays: 11,
            });

            await recordActivity(mockRequest as Request, mockResponse as Response);

            expect(prisma.studyStreak.upsert).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should reset streak if day was missed', async () => {
            mockRequest.body = {
                type: 'flashcard',
                count: 10,
            };

            const oldStreak = {
                id: 'streak-1',
                userId: 'user-123',
                currentStreak: 10,
                longestStreak: 15,
                lastStudyDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                totalStudyDays: 20,
            };

            (prisma.studyStreak.findUnique as jest.Mock).mockResolvedValue(oldStreak);
            (prisma.studyStreak.upsert as jest.Mock).mockResolvedValue({
                ...oldStreak,
                currentStreak: 1, // Reset to 1
            });

            await recordActivity(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalled();
        });
    });

    describe('getHistory', () => {
        it('should return historical study data', async () => {
            mockRequest.query = { days: '30' };

            const mockAnswers = [
                { answeredAt: new Date(), isCorrect: true },
                { answeredAt: new Date(), isCorrect: false },
                { answeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000), isCorrect: true },
            ];

            const mockReviews = [
                { reviewedAt: new Date() },
                { reviewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            ];

            (prisma.userAnswer.findMany as jest.Mock).mockResolvedValue(mockAnswers);
            (prisma.flashCardReview.findMany as jest.Mock).mockResolvedValue(mockReviews);

            await getHistory(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalled();
            const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];

            expect(responseData).toHaveProperty('history');
            expect(Array.isArray(responseData.history)).toBe(true);
        });

        it('should use default 30 days if not specified', async () => {
            mockRequest.query = {};

            (prisma.userAnswer.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.flashCardReview.findMany as jest.Mock).mockResolvedValue([]);

            await getHistory(mockRequest as Request, mockResponse as Response);

            expect(prisma.userAnswer.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        answeredAt: expect.any(Object),
                    }),
                })
            );
        });
    });
});

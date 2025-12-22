import { PrismaClient } from '@prisma/client';

// Mock Prisma client for testing
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        question: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        flashCard: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        flashCardReview: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        practiceTest: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        userTestSession: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
        },
        userAnswer: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
        },
        userProgress: {
            findMany: jest.fn(),
            upsert: jest.fn(),
        },
        domain: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        studyStreak: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
        },
        dailyGoal: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
        },
        testQuestion: {
            createMany: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    })),
}));

// Global test setup
beforeAll(() => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    process.env.NODE_ENV = 'test';
});

afterAll(() => {
    // Cleanup
    jest.clearAllMocks();
});

// Reset mocks between tests
afterEach(() => {
    jest.clearAllMocks();
});

// Extend Jest matchers
expect.extend({
    toBeWithinRange(received: number, floor: number, ceiling: number) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () =>
                    `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${received} to be within range ${floor} - ${ceiling}`,
                pass: false,
            };
        }
    },
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeWithinRange(floor: number, ceiling: number): R;
        }
    }
}

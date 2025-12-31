// eslint-disable-next-line @typescript-eslint/no-unused-vars

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars';
process.env.DATABASE_URL = 'postgresql://pmp_user:pmp_password@localhost:5432/pmp_study_test';

// Mock Prisma Client for unit tests
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $queryRaw: jest.fn(),
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        userSubscription: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        // Add more models as needed
    })),
}));

// Global test timeout
jest.setTimeout(30000);

// Cleanup after all tests
afterAll(async () => {
    // Add any cleanup logic here
});

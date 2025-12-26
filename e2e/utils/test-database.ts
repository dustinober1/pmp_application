import { PrismaClient } from '@prisma/client';

/**
 * Test database utility for E2E tests
 * Handles connection, seeding, and cleanup of test data
 */
export class TestDatabase {
    private prisma: PrismaClient;
    private connected: boolean = false;

    constructor() {
        // Use test database URL if available, fallback to main database
        const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
        this.prisma = new PrismaClient({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
        });
    }

    /**
     * Connect to the database
     */
    async connect(): Promise<void> {
        if (!this.connected) {
            await this.prisma.$connect();
            this.connected = true;
        }
    }

    /**
     * Disconnect from the database
     */
    async disconnect(): Promise<void> {
        if (this.connected) {
            await this.prisma.$disconnect();
            this.connected = false;
        }
    }

    /**
     * Get the Prisma client instance
     */
    get client(): PrismaClient {
        return this.prisma;
    }

    /**
     * Clean all test data from the database
     * Order matters due to foreign key constraints
     */
    async clean(): Promise<void> {
        // Use transaction for atomic cleanup
        await this.prisma.$transaction([
            // Clean user-related data first
            this.prisma.userTestSession.deleteMany({}),
            this.prisma.userAnswer.deleteMany({}),
            this.prisma.userProgress.deleteMany({}),
            this.prisma.flashcardReview.deleteMany({}),

            // Then clean quiz-related data
            this.prisma.question.deleteMany({
                where: {
                    // Only delete test-created questions (marked with specific pattern)
                    id: { contains: 'test_' },
                },
            }),

            // Clean test users (keep system users)
            this.prisma.user.deleteMany({
                where: {
                    email: { contains: '@example.com' },
                },
            }),
        ]);
    }

    /**
     * Seed basic data needed for tests
     */
    async seedBasicData(): Promise<void> {
        // Ensure domains exist
        const domains = [
            { id: 'people', name: 'People', description: 'People Domain' },
            { id: 'process', name: 'Process', description: 'Process Domain' },
            { id: 'business', name: 'Business Environment', description: 'Business Environment Domain' },
        ];

        for (const domain of domains) {
            await this.prisma.domain.upsert({
                where: { id: domain.id },
                update: {},
                create: domain,
            });
        }
    }

    /**
     * Create sample questions for tests
     */
    async seedQuestions(count: number = 10): Promise<void> {
        const domains = ['people', 'process', 'business'];
        const questions = [];

        for (let i = 0; i < count; i++) {
            questions.push({
                id: `test_question_${Date.now()}_${i}`,
                domainId: domains[i % 3],
                text: `Test question ${i + 1}`,
                choices: JSON.stringify({
                    A: 'Option A',
                    B: 'Option B',
                    C: 'Option C',
                    D: 'Option D',
                }),
                correctAnswer: ['A', 'B', 'C', 'D'][i % 4],
                explanation: `This is the explanation for question ${i + 1}`,
                difficulty: ['easy', 'medium', 'hard'][i % 3],
            });
        }

        await this.prisma.question.createMany({
            data: questions,
            skipDuplicates: true,
        });
    }
}

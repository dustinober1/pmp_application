import { TestDatabase } from './test-database';
import bcrypt from 'bcryptjs';

// Define TestUser interface locally to avoid circular imports
export interface TestUser {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'USER' | 'ADMIN';
    token?: string;
}

/**
 * Factory for creating test users with various configurations
 */
export class UserFactory {
    private db: TestDatabase;

    constructor(db: TestDatabase) {
        this.db = db;
    }

    /**
     * Create a test user with the given options
     */
    async createUser(options: Partial<TestUser> = {}): Promise<TestUser> {
        const defaultPassword = 'TestPassword123!';
        const email = options.email || `user_${Date.now()}@example.com`;
        const password = options.password || defaultPassword;
        const name = options.name || 'Test User';
        const role = options.role || 'USER';

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database
        const user = await this.db.client.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
            },
        });

        return {
            id: user.id,
            email: user.email,
            password, // Return plain password for login tests
            name: user.name || name,
            role: user.role as 'USER' | 'ADMIN',
        };
    }

    /**
     * Create multiple test users
     */
    async createUsers(count: number, baseOptions: Partial<TestUser> = {}): Promise<TestUser[]> {
        const users: TestUser[] = [];
        for (let i = 0; i < count; i++) {
            const user = await this.createUser({
                ...baseOptions,
                email: `user_${Date.now()}_${i}@example.com`,
                name: `Test User ${i + 1}`,
            });
            users.push(user);
        }
        return users;
    }

    /**
     * Create an admin user
     */
    async createAdmin(options: Partial<TestUser> = {}): Promise<TestUser> {
        return this.createUser({
            ...options,
            email: options.email || `admin_${Date.now()}@example.com`,
            name: options.name || 'Admin User',
            role: 'ADMIN',
        });
    }

    /**
     * Create a user with test progress data
     */
    async createUserWithProgress(options: Partial<TestUser> = {}): Promise<TestUser> {
        const user = await this.createUser(options);

        // Add some progress data
        const domains = ['people', 'process', 'business'];
        for (const domainId of domains) {
            await this.db.client.userProgress.create({
                data: {
                    userId: user.id,
                    domainId,
                    totalQuestions: 20,
                    correctAnswers: Math.floor(Math.random() * 20),
                    lastAttemptedAt: new Date(),
                },
            });
        }

        return user;
    }

    /**
     * Create a user with completed test sessions
     */
    async createUserWithTestSessions(
        options: Partial<TestUser> = {},
        sessionCount: number = 3
    ): Promise<TestUser> {
        const user = await this.createUser(options);

        for (let i = 0; i < sessionCount; i++) {
            await this.db.client.userTestSession.create({
                data: {
                    userId: user.id,
                    status: 'COMPLETED',
                    totalQuestions: 50,
                    correctAnswers: Math.floor(Math.random() * 50),
                    startedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                    completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
                    timeSpent: 1800, // 30 minutes
                },
            });
        }

        return user;
    }
}

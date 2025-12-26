import { test as base, expect } from '@playwright/test';
import { TestDatabase } from '../utils/test-database';
import { UserFactory, TestUser } from '../utils/user-factory';
import type { Page } from '@playwright/test';

// Re-export TestUser for convenience
export type { TestUser };

// Define custom fixtures
export interface TestFixtures {
    testDb: TestDatabase;
    userFactory: UserFactory;
    authenticatedPage: Page;
    testUser: TestUser;
    adminUser: TestUser;
}

// Extend base test with custom fixtures
export const test = base.extend<TestFixtures>({
    // Test database fixture for seeding and cleanup
    testDb: async ({ }, use) => {
        const db = new TestDatabase();
        await db.connect();
        await db.clean();
        await use(db);
        await db.clean();
        await db.disconnect();
    },

    // User factory for creating test users
    userFactory: async ({ testDb }, use) => {
        const factory = new UserFactory(testDb);
        await use(factory);
    },

    // Pre-authenticated page fixture
    authenticatedPage: async ({ page, testUser }, use) => {
        // Login and store auth state
        await page.goto('/login');
        await page.getByLabel('Email').fill(testUser.email);
        await page.getByLabel('Password').fill(testUser.password);
        await page.getByRole('button', { name: /sign in|log in/i }).click();

        // Wait for successful login redirect
        await page.waitForURL(/\/(dashboard|home)/);

        await use(page);
    },

    // Test user fixture
    testUser: async ({ userFactory }, use) => {
        const user = await userFactory.createUser({
            email: `testuser_${Date.now()}@example.com`,
            password: 'TestPassword123!',
            name: 'Test User',
            role: 'USER',
        });
        await use(user);
    },

    // Admin user fixture
    adminUser: async ({ userFactory }, use) => {
        const user = await userFactory.createUser({
            email: `admin_${Date.now()}@example.com`,
            password: 'AdminPassword123!',
            name: 'Admin User',
            role: 'ADMIN',
        });
        await use(user);
    },
});

// Re-export expect for convenience
export { expect };

// Common page object helpers
export const PageHelpers = {
    async waitForToast(page: Page, message: string | RegExp) {
        await expect(page.getByRole('alert').filter({ hasText: message })).toBeVisible();
    },

    async dismissToast(page: Page) {
        await page.getByRole('alert').getByRole('button', { name: /close|dismiss/i }).click();
    },

    async expectNoErrors(page: Page) {
        // Check for common error indicators
        await expect(page.locator('.error, .error-message, [role="alert"][class*="error"]')).not.toBeVisible();
    },

    async waitForSpinnerToDisappear(page: Page) {
        await expect(page.locator('.spinner, [aria-busy="true"], [class*="loading"]').first()).not.toBeVisible({ timeout: 10000 });
    },
};

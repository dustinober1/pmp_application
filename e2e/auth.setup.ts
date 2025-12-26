import { test as setup, expect } from '@playwright/test';
import { TestDatabase } from './utils/test-database';
import bcrypt from 'bcryptjs';

const AUTH_FILE = 'playwright/.auth/user.json';
const ADMIN_AUTH_FILE = 'playwright/.auth/admin.json';

/**
 * Setup script to create and authenticate test users
 * This runs before tests that depend on the 'setup' project
 */

// Create test user accounts before running tests
setup('create test accounts', async () => {
    const db = new TestDatabase();
    await db.connect();

    // Ensure basic data exists
    await db.seedBasicData();

    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    await db.client.user.upsert({
        where: { email: 'e2e-testuser@example.com' },
        update: {},
        create: {
            email: 'e2e-testuser@example.com',
            password: hashedPassword,
            name: 'E2E Test User',
            role: 'USER',
        },
    });

    // Create admin user
    const adminHashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    await db.client.user.upsert({
        where: { email: 'e2e-admin@example.com' },
        update: {},
        create: {
            email: 'e2e-admin@example.com',
            password: adminHashedPassword,
            name: 'E2E Admin User',
            role: 'ADMIN',
        },
    });

    await db.disconnect();
});

// Authenticate as regular user and save state
setup('authenticate as user', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('e2e-testuser@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Wait for successful login
    await expect(page).toHaveURL(/\/(dashboard|home|practice)/);

    // Save authentication state
    await page.context().storageState({ path: AUTH_FILE });
});

// Authenticate as admin and save state
setup('authenticate as admin', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('e2e-admin@example.com');
    await page.getByLabel(/password/i).fill('AdminPassword123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Wait for successful login
    await expect(page).toHaveURL(/\/(dashboard|home|admin|practice)/);

    // Save authentication state
    await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

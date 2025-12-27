import { test, expect } from '../fixtures/base';

test.describe('User Registration', () => {
    test('should successfully register a new user with valid data', async ({ page }) => {
        const uniqueEmail = `newuser_${Date.now()}@example.com`;

        await page.goto('/register');

        // Fill registration form
        await page.getByLabel(/name/i).fill('New Test User');
        await page.getByLabel(/email/i).fill(uniqueEmail);
        await page.getByLabel(/^password$/i).fill('ValidPassword123!');
        await page.getByLabel(/confirm password/i).fill('ValidPassword123!');

        // Submit form
        await page.getByRole('button', { name: /sign up|register|create account/i }).click();

        // Should redirect to login or dashboard
        await expect(page).toHaveURL(/\/(login|dashboard)/);
    });

    test('should show validation errors for invalid inputs', async ({ page }) => {
        await page.goto('/register');

        // Try to submit empty form
        await page.getByRole('button', { name: /sign up|register|create account/i }).click();

        // Should show validation errors
        await expect(page.getByText(/required|email|password/i).first()).toBeVisible();
    });

    test('should show error for duplicate email', async ({ page, userFactory }) => {
        // Create existing user
        const existingUser = await userFactory.createUser({
            email: `existing_${Date.now()}@example.com`,
        });

        await page.goto('/register');

        // Fill with existing email
        await page.getByLabel(/name/i).fill('Duplicate User');
        await page.getByLabel(/email/i).fill(existingUser.email);
        await page.getByLabel(/^password$/i).fill('ValidPassword123!');
        await page.getByLabel(/confirm password/i).fill('ValidPassword123!');

        // Submit form
        await page.getByRole('button', { name: /sign up|register|create account/i }).click();

        // Should show error about existing email
        await expect(page.getByText(/already exists|already registered|email.*taken/i)).toBeVisible();
    });

    test('should require matching passwords', async ({ page }) => {
        await page.goto('/register');

        // Fill with mismatched passwords
        await page.getByLabel(/name/i).fill('Test User');
        await page.getByLabel(/email/i).fill(`test_${Date.now()}@example.com`);
        await page.getByLabel(/^password$/i).fill('Password123!');
        await page.getByLabel(/confirm password/i).fill('DifferentPassword123!');

        // Submit form
        await page.getByRole('button', { name: /sign up|register|create account/i }).click();

        // Should show password mismatch error
        await expect(page.getByText(/match|don.*match|same/i)).toBeVisible();
    });

    test('should enforce password requirements', async ({ page }) => {
        await page.goto('/register');

        // Fill with weak password
        await page.getByLabel(/name/i).fill('Test User');
        await page.getByLabel(/email/i).fill(`test_${Date.now()}@example.com`);
        await page.getByLabel(/^password$/i).fill('weak');
        await page.getByLabel(/confirm password/i).fill('weak');

        // Submit form
        await page.getByRole('button', { name: /sign up|register|create account/i }).click();

        // Should show password strength error
        await expect(page.getByText(/password|character|strong|weak|length/i).first()).toBeVisible();
    });
});

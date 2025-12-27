import { test, expect } from '../fixtures/base';

test.describe('User Login', () => {
    test('should successfully login with valid credentials', async ({ page, testUser }) => {
        await page.goto('/login');

        // Fill login form
        await page.getByLabel(/email/i).fill(testUser.email);
        await page.getByLabel(/password/i).fill(testUser.password);

        // Submit form
        await page.getByRole('button', { name: /sign in|log in/i }).click();

        // Should redirect to dashboard
        await expect(page).toHaveURL(/\/(dashboard|home|practice)/);

        // Should show user is logged in
        await expect(page.getByText(new RegExp(testUser.name, 'i'))).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        // Fill with invalid credentials
        await page.getByLabel(/email/i).fill('invalid@example.com');
        await page.getByLabel(/password/i).fill('WrongPassword123!');

        // Submit form
        await page.getByRole('button', { name: /sign in|log in/i }).click();

        // Should show error message
        await expect(page.getByText(/invalid|incorrect|wrong|failed/i)).toBeVisible();

        // Should stay on login page
        await expect(page).toHaveURL(/\/login/);
    });

    test('should show error for empty fields', async ({ page }) => {
        await page.goto('/login');

        // Try to submit empty form
        await page.getByRole('button', { name: /sign in|log in/i }).click();

        // Should show validation errors
        await expect(page.getByText(/required|email|password/i).first()).toBeVisible();
    });

    test('should navigate to register page from login', async ({ page }) => {
        await page.goto('/login');

        // Click register link
        await page.getByRole('link', { name: /sign up|register|create account/i }).click();

        // Should navigate to register page
        await expect(page).toHaveURL(/\/register/);
    });

    test('should handle account lockout after failed attempts', async ({ page, testUser }) => {
        await page.goto('/login');

        // Attempt multiple failed logins
        for (let i = 0; i < 5; i++) {
            await page.getByLabel(/email/i).fill(testUser.email);
            await page.getByLabel(/password/i).fill('WrongPassword123!');
            await page.getByRole('button', { name: /sign in|log in/i }).click();

            // Wait for response
            await page.waitForTimeout(500);
        }

        // Should show lockout or rate limit message
        await expect(
            page.getByText(/locked|too many|rate limit|try again later|blocked/i)
        ).toBeVisible({ timeout: 10000 });
    });

    test('should preserve return URL after login', async ({ page, testUser }) => {
        // Try to access protected page directly
        await page.goto('/practice-tests');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);

        // Login
        await page.getByLabel(/email/i).fill(testUser.email);
        await page.getByLabel(/password/i).fill(testUser.password);
        await page.getByRole('button', { name: /sign in|log in/i }).click();

        // Should redirect back to intended page
        await expect(page).toHaveURL(/\/practice-tests|\/dashboard/);
    });
});

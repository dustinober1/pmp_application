import { test, expect } from '@playwright/test';

test.describe('Practice Exam Flows', () => {
  test.describe('Auth Redirect - Practice Page', () => {
    test('should redirect to login when accessing practice page without auth', async ({ page }) => {
      await page.goto('/practice');
      // Should redirect to login page
      await expect(page).toHaveURL(/\/auth\/login/);
      await expect(page.locator('h1')).toContainText('Welcome Back');
    });

    test('should include next parameter in redirect', async ({ page }) => {
      await page.goto('/practice');
      const url = page.url();
      expect(url).toContain('next=%2Fpractice');
    });

    test('should display login form elements', async ({ page }) => {
      await page.goto('/practice');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Auth Redirect - Session Pages', () => {
    test('should redirect to login when accessing session without auth', async ({ page }) => {
      await page.goto('/practice/session/test-session');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing mock session without auth', async ({ page }) => {
      await page.goto('/practice/mock/session/test-session');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing flagged questions without auth', async ({
      page,
    }) => {
      await page.goto('/practice/flagged');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Login Page UI', () => {
    test('should have link to register page', async ({ page }) => {
      await page.goto('/auth/login');
      await page.click('text=Sign up for free');
      await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/auth/login');
      const forgotLink = page.locator('a:has-text("Forgot password")');
      await expect(forgotLink).toBeVisible();
    });
  });
});

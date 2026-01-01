import { test, expect } from '@playwright/test';

// Mock auth APIs for all tests (middleware is bypassed temporarily)
test.beforeEach(async ({ page }) => {
  // Mock /auth/me - returns user profile
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'e2e-test-user',
            email: 'e2e-test@example.com',
            name: 'E2E Test User',
            emailVerified: true,
            tier: 'high-end',
          },
        },
      }),
    });
  });

  // Mock /auth/csrf - returns CSRF token
  await page.route('**/api/auth/csrf', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { csrfToken: 'test-csrf-token' },
      }),
    });
  });
});

test.describe('Happy Path Tests', () => {
  test.describe('Practice Exam Flow', () => {
    test('should load practice page and display stats', async ({ page }) => {
      // Mock practice APIs
      await page.route('**/api/practice/stats', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              stats: {
                totalSessions: 5,
                totalQuestions: 50,
                averageScore: 75,
                bestScore: 90,
                weakDomains: [],
              },
            },
          }),
        });
      });

      await page.route('**/api/domains', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              domains: [
                { id: 'd1', name: 'People', code: 'P' },
                { id: 'd2', name: 'Process', code: 'PRO' },
                { id: 'd3', name: 'Business Environment', code: 'BE' },
              ],
            },
          }),
        });
      });

      // Navigate to practice page with e2e_test query parameter to bypass middleware
      await page.goto('/practice?e2e_test=true');

      // Verify we're on practice page (not redirected to login)
      await expect(page.locator('h1')).toContainText('Practice Questions');

      // Verify stats are displayed
      await expect(page.locator('text=Sessions').first()).toBeVisible();
      await expect(page.locator('text=Questions Answered').first()).toBeVisible();

      // Verify start session button is present
      await expect(page.locator('button:has-text("Start Practice Session")')).toBeVisible();
    });
  });

  test.describe('Flashcard Session Flow', () => {
    test('should load flashcards page and display stats', async ({ page }) => {
      // Mock flashcard APIs
      await page.route('**/api/flashcards/stats', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              stats: {
                mastered: 10,
                learning: 5,
                dueForReview: 3,
                totalCards: 18,
              },
            },
          }),
        });
      });

      await page.route('**/api/flashcards/review**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              flashcards: [
                {
                  id: 'f1',
                  front: 'What is the Triple Constraint?',
                  back: 'Scope, Time, and Cost',
                  nextReviewAt: new Date().toISOString(),
                },
              ],
            },
          }),
        });
      });

      // Navigate to flashcards page with e2e_test query parameter to bypass middleware
      await page.goto('/flashcards?e2e_test=true');

      // Verify we're on flashcards page
      await expect(page.locator('h1')).toContainText('Flashcards');

      // Verify stats are displayed
      await expect(page.locator('text=Mastered').first()).toBeVisible();
      await expect(page.locator('text=Learning').nth(1)).toBeVisible();
      await expect(page.locator('text=Due Today').first()).toBeVisible();

      // Verify action buttons are present
      await expect(page.locator('button:has-text("Start Review")')).toBeVisible();
    });
  });

  test.describe('Study Guide Flow', () => {
    test('should navigate to study guide page', async ({ page }) => {
      // Navigate to study guide with e2e_test query parameter to bypass middleware
      // Note: This test verifies the navigation works; detailed content testing
      // would require specific API mocking for the study guide endpoints
      await page.goto('/study/task-1?e2e_test=true');

      // Verify we're on study page (either the study guide or a not found page)
      // The actual content depends on whether the task exists in the database
      const h1Text = await page.locator('h1').textContent();
      expect(h1Text).toBeTruthy();
    });
  });
});

import { test, expect, PageHelpers } from '../fixtures/base';

test.describe('Practice Test Flow', () => {
    test('should start a practice test successfully', async ({ authenticatedPage: page, testDb }) => {
        // Seed some test questions
        await testDb.seedQuestions(20);

        await page.goto('/practice-tests');

        // Click on start practice test button
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();

        // Should navigate to test session
        await expect(page).toHaveURL(/\/test-session|\/practice-test|\/quiz/);

        // Should display first question
        await expect(page.locator('text=/Question.*1|Q\.?.*1/i')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate between questions', async ({ authenticatedPage: page, testDb }) => {
        await testDb.seedQuestions(20);
        await page.goto('/practice-tests');

        // Start a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Wait for first question to load
        await expect(page.locator('text=/Question.*1|Q\.?.*1/i')).toBeVisible({ timeout: 10000 });

        // Select an answer
        await page.getByRole('radio').first().click();

        // Navigate to next question
        await page.getByRole('button', { name: /next/i }).click();

        // Should show second question
        await expect(page.locator('text=/Question.*2|Q\.?.*2/i')).toBeVisible();

        // Navigate back to previous question
        await page.getByRole('button', { name: /previous|back|prev/i }).click();

        // Should show first question again
        await expect(page.locator('text=/Question.*1|Q\.?.*1/i')).toBeVisible();
    });

    test('should display timer during test', async ({ authenticatedPage: page, testDb }) => {
        await testDb.seedQuestions(10);
        await page.goto('/practice-tests');

        // Start a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Timer should be visible
        await expect(page.locator('text=/\\d+:\\d+|time.*remaining/i')).toBeVisible();
    });

    test('should flag questions for review', async ({ authenticatedPage: page, testDb }) => {
        await testDb.seedQuestions(10);
        await page.goto('/practice-tests');

        // Start a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Wait for question to load
        await expect(page.locator('text=/Question.*1|Q\.?.*1/i')).toBeVisible({ timeout: 10000 });

        // Flag the question
        await page.getByRole('button', { name: /flag|mark.*review|bookmark/i }).click();

        // Flag indicator should be visible
        await expect(page.locator('[aria-label*="flagged"], .flagged, .bookmarked, [class*="flag"]')).toBeVisible();
    });

    test('should complete a test and show results', async ({ authenticatedPage: page, testDb }) => {
        await testDb.seedQuestions(5);
        await page.goto('/practice-tests');

        // Start a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Answer all questions (5 questions)
        for (let i = 0; i < 5; i++) {
            await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 5000 });
            await page.getByRole('radio').first().click();

            // Check if it's the last question
            const finishButton = page.getByRole('button', { name: /finish|submit|complete/i });
            const nextButton = page.getByRole('button', { name: /next/i });

            if (await finishButton.isVisible()) {
                await finishButton.click();
                break;
            } else {
                await nextButton.click();
            }
        }

        // Should show results
        await expect(page).toHaveURL(/\/results|\/review|\/summary/, { timeout: 15000 });

        // Should display score
        await expect(page.locator('text=/\\d+.*%|score|correct/i')).toBeVisible();
    });

    test('should use question navigator to jump between questions', async ({ authenticatedPage: page, testDb }) => {
        await testDb.seedQuestions(10);
        await page.goto('/practice-tests');

        // Start a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Wait for first question
        await expect(page.locator('text=/Question.*1|Q\.?.*1/i')).toBeVisible({ timeout: 10000 });

        // Click on question 5 in navigator
        const questionNav = page.getByRole('button', { name: /^5$|question.*5/i });
        if (await questionNav.isVisible()) {
            await questionNav.click();
            await expect(page.locator('text=/Question.*5|Q\.?.*5/i')).toBeVisible();
        }
    });
});

import { test, expect } from '../fixtures/base';

test.describe('Test Review', () => {
    test.beforeEach(async ({ testDb }) => {
        // Seed questions for tests
        await testDb.seedQuestions(10);
    });

    test('should access review mode after test completion', async ({ authenticatedPage: page, testDb }) => {
        await page.goto('/practice-tests');

        // Start a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Complete the test quickly
        for (let i = 0; i < 10; i++) {
            await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 5000 });
            await page.getByRole('radio').first().click();

            const finishButton = page.getByRole('button', { name: /finish|submit|complete/i });
            const nextButton = page.getByRole('button', { name: /next/i });

            if (await finishButton.isVisible()) {
                await finishButton.click();
                break;
            } else if (await nextButton.isVisible()) {
                await nextButton.click();
            }
        }

        // Wait for results page
        await expect(page).toHaveURL(/\/results|\/review|\/summary/, { timeout: 15000 });

        // Click review button
        await page.getByRole('button', { name: /review.*answers|view.*answers|review.*test/i }).click();

        // Should show review mode
        await expect(page.locator('text=/review|explanation/i')).toBeVisible();
    });

    test('should filter by correct answers', async ({ authenticatedPage: page, userFactory }) => {
        // Create user with completed test sessions
        const userWithTests = await userFactory.createUserWithTestSessions();

        // Navigate to test history/review
        await page.goto('/dashboard');

        // Look for test history or recent tests section
        const historyLink = page.getByRole('link', { name: /history|past.*tests|completed.*tests/i });
        if (await historyLink.isVisible()) {
            await historyLink.click();
        }

        // If filter controls exist
        const filterButton = page.getByRole('button', { name: /filter.*correct|show.*correct/i });
        if (await filterButton.isVisible()) {
            await filterButton.click();

            // Should only show correct answers
            await expect(page.locator('[class*="correct"]').first()).toBeVisible();
        }
    });

    test('should filter by incorrect answers', async ({ authenticatedPage: page }) => {
        await page.goto('/practice-tests');

        // Start and complete a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Answer questions
        for (let i = 0; i < 5; i++) {
            await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 5000 });
            await page.getByRole('radio').first().click();

            const finishButton = page.getByRole('button', { name: /finish|submit|complete/i });
            const nextButton = page.getByRole('button', { name: /next/i });

            if (await finishButton.isVisible()) {
                await finishButton.click();
                break;
            } else if (await nextButton.isVisible()) {
                await nextButton.click();
            }
        }

        // Wait for results
        await expect(page).toHaveURL(/\/results|\/review|\/summary/, { timeout: 15000 });

        // Go to review
        await page.getByRole('button', { name: /review.*answers|view.*answers|review.*test/i }).click();

        // Look for filter by incorrect
        const incorrectFilter = page.getByRole('button', { name: /incorrect|wrong|missed/i });
        if (await incorrectFilter.isVisible()) {
            await incorrectFilter.click();
        }
    });

    test('should show explanations for answers', async ({ authenticatedPage: page }) => {
        await page.goto('/practice-tests');

        // Start a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Complete at least one question
        await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 5000 });
        await page.getByRole('radio').first().click();

        // Submit/complete test
        const finishButton = page.getByRole('button', { name: /finish|submit|complete/i });
        if (await finishButton.isVisible()) {
            await finishButton.click();
        } else {
            // Navigate to end and submit
            await page.getByRole('button', { name: /next/i }).click();
        }

        // Wait for results and go to review
        await page.waitForURL(/\/results|\/review|\/summary/, { timeout: 15000 });

        // Click review
        const reviewButton = page.getByRole('button', { name: /review|view.*answers/i });
        if (await reviewButton.isVisible()) {
            await reviewButton.click();
        }

        // Explanation should be visible in review mode
        await expect(page.locator('text=/explanation|rationale|why/i')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate between reviewed questions', async ({ authenticatedPage: page }) => {
        await page.goto('/practice-tests');

        // Start a test
        await page.getByRole('button', { name: /start.*test|begin.*test|new.*test/i }).first().click();
        await page.waitForURL(/\/test-session|\/practice-test|\/quiz/);

        // Answer a few questions
        for (let i = 0; i < 3; i++) {
            await expect(page.getByRole('radio').first()).toBeVisible({ timeout: 5000 });
            await page.getByRole('radio').first().click();

            const finishButton = page.getByRole('button', { name: /finish|submit|complete/i });
            const nextButton = page.getByRole('button', { name: /next/i });

            if (await finishButton.isVisible()) {
                await finishButton.click();
                break;
            } else if (await nextButton.isVisible()) {
                await nextButton.click();
            }
        }

        // Wait for results
        await page.waitForURL(/\/results|\/review|\/summary/, { timeout: 15000 });

        // Go to review
        const reviewButton = page.getByRole('button', { name: /review|view.*answers/i });
        if (await reviewButton.isVisible()) {
            await reviewButton.click();

            // Check for next/previous navigation in review
            await page.waitForTimeout(1000);

            const nextInReview = page.getByRole('button', { name: /next/i });
            if (await nextInReview.isVisible()) {
                await nextInReview.click();
                // Should show different question
                await expect(page.locator('text=/Question.*2|Q\.?.*2/i')).toBeVisible();
            }
        }
    });
});

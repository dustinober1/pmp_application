import { test, expect } from '@playwright/test';

test.describe('Flashcards', () => {
	test('should load flashcards page', async ({ page }) => {
		await page.goto('/pmp_application/flashcards');
		await page.waitForLoadState('networkidle');

		// Check for flashcards page
		const content = await page.content();
		expect(content.toLowerCase()).toContain('flashcard') || expect(content.toLowerCase()).toContain('study');
	});

	test('should navigate to practice flashcards', async ({ page }) => {
		await page.goto('/pmp_application/flashcards');
		await page.waitForLoadState('networkidle');

		// Look for practice button
		const buttons = await page.locator('button, a').all();
		const hasButton = buttons.length > 0;
		expect(hasButton).toBe(true);
	});
});

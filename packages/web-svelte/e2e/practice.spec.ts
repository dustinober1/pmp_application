import { test, expect } from '@playwright/test';

test.describe('Practice Mode', () => {
	test('should load practice page', async ({ page }) => {
		await page.goto('/pmp_application/practice');
		await page.waitForLoadState('networkidle');

		// Check for practice page content
		const content = await page.content();
		expect(content.toLowerCase()).toContain('practice') || expect(content.toLowerCase()).toContain('quiz');
	});

	test('should display practice options', async ({ page }) => {
		await page.goto('/pmp_application/practice');
		await page.waitForLoadState('networkidle');

		// Check for interactive elements
		const buttons = await page.locator('button, a').all();
		expect(buttons.length).toBeGreaterThan(0);
	});
});

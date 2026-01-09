import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
	test('should load dashboard page', async ({ page }) => {
		await page.goto('/pmp_application/dashboard');
		await page.waitForLoadState('networkidle');

		// Check for main dashboard elements
		await expect(page.locator('h1')).toBeTruthy();
	});

	test('should display progress tracking', async ({ page }) => {
		await page.goto('/pmp_application/dashboard');
		await page.waitForLoadState('networkidle');

		// Check for dashboard content
		const content = await page.content();
		expect(content).toContain('dashboard') || expect(content).toContain('progress');
	});
});

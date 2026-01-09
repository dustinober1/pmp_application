import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('should navigate to home page', async ({ page }) => {
		await page.goto('/pmp_application/');
		await expect(page).toHaveTitle(/PMP Study Pro/);
	});

	test('should navigate to dashboard', async ({ page }) => {
		await page.goto('/pmp_application/');
		await page.click('a:has-text("Start Studying")');
		await expect(page).toHaveURL(/dashboard/);
	});

	test('should navigate to study guide', async ({ page }) => {
		await page.goto('/pmp_application/');
		await page.click('a:has-text("View Guide")');
		await expect(page).toHaveURL(/study/);
	});
});

import type { Page } from '@playwright/test';

/**
 * Test helper utilities for common operations
 */
export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp) {
    return this.page.waitForResponse(
      response =>
        response.status() === 200 &&
        (typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url()))
    );
  }

  /**
   * Fill form with data
   */
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[name="${field}"]`, value);
    }
  }

  /**
   * Take screenshot with custom name
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(message: string) {
    return this.page.waitForSelector(`text=${message}`, { timeout: 5000 });
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page
      .locator(selector)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get text content
   */
  async getText(selector: string): Promise<string> {
    return (await this.page.locator(selector).textContent()) || '';
  }

  /**
   * Click element and wait for navigation
   */
  async clickAndWait(selector: string, urlPattern?: string) {
    if (urlPattern) {
      await Promise.all([this.page.waitForURL(urlPattern), this.page.click(selector)]);
    } else {
      await Promise.all([this.page.waitForLoadState('networkidle'), this.page.click(selector)]);
    }
  }

  /**
   * Mock network response
   */
  async mockRoute(url: string, response: Record<string, unknown>) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify(response),
        headers: { 'Content-Type': 'application/json' },
      });
    });
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading() {
    await this.page.waitForSelector('[data-testid="loading"]', { state: 'hidden' }).catch(() => {}); // Ignore if not found
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string) {
    await this.page.click(selector);
    await this.page.click(`[data-value="${value}"]`);
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string) {
    const fileInput = this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Refresh page
   */
  async refresh() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear browser storage
   */
  async clearStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Set item in localStorage
   */
  async setLocalStorage(key: string, value: string) {
    await this.page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
  }

  /**
   * Get item from localStorage
   */
  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate(k => localStorage.getItem(k), key);
  }

  /**
   * Check accessibility (basic check)
   */
  async checkAccessibility(selector?: string) {
    const element = selector ? this.page.locator(selector) : this.page.locator('body');

    // Basic checks
    const images = await element.locator('img').count();
    const imagesWithoutAlt = await element.locator('img:not([alt])').count();

    const buttons = await element.locator('button').count();
    const buttonsWithoutText = await element.locator('button:not([aria-label]):empty').count();

    return {
      imagesWithoutAlt,
      buttonsWithoutText,
      totalImages: images,
      totalButtons: buttons,
    };
  }
}

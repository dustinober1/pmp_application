import type { Page, Locator } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Dashboard Page Object Model
 *
 * Handles dashboard interactions
 */
export class DashboardPage {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Locators
  readonly welcomeMessage: Locator;
  readonly progressCard: Locator;
  readonly recentActivity: Locator;
  readonly studyStreak: Locator;
  readonly subscriptionTier: Locator;
  readonly quickActions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.progressCard = page.locator('[data-testid="progress-card"]');
    this.recentActivity = page.locator('[data-testid="recent-activity"]');
    this.studyStreak = page.locator('[data-testid="study-streak"]');
    this.subscriptionTier = page.locator('[data-testid="subscription-tier"]');
    this.quickActions = page.locator('[data-testid="quick-actions"]');
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    return (await this.welcomeMessage.textContent()) || '';
  }

  /**
   * Get subscription tier
   */
  async getSubscriptionTier(): Promise<string> {
    return (await this.subscriptionTier.textContent()) || '';
  }

  /**
   * Get study streak
   */
  async getStudyStreak(): Promise<number> {
    const text = (await this.studyStreak.textContent()) || '0';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Click on quick action
   */
  async clickQuickAction(action: string) {
    await this.quickActions.locator(`button:has-text("${action}")`).click();
  }

  /**
   * Get progress percentage
   */
  async getProgress(): Promise<number> {
    const progressText = (await this.progressCard.textContent()) || '0%';
    const match = progressText.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

import type { Page, Locator } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

/**
 * Pricing Page Object Model
 *
 * Handles pricing and checkout interactions
 */
export class PricingPage {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Locators
  readonly monthlyButton: Locator;
  readonly annualButton: Locator;
  readonly tierCards: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    this.monthlyButton = page.locator('button:has-text("Monthly")');
    this.annualButton = page.locator('button:has-text("Annual")');
    this.tierCards = page.locator('[data-testid="pricing-card"]');
    this.checkoutButton = page.locator(
      'button:has-text("Get Started"), button:has-text("Subscribe")',
    );
  }

  /**
   * Navigate to pricing page
   */
  async goto() {
    await this.page.goto("/pricing");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Select monthly billing
   */
  async selectMonthly() {
    await this.monthlyButton.click();
    await this.page.waitForTimeout(500); // Wait for price animation
  }

  /**
   * Select annual billing
   */
  async selectAnnual() {
    await this.annualButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get price for tier
   */
  async getTierPrice(tierName: string): Promise<string> {
    const tierCard = this.page.locator(
      `[data-testid="pricing-card-${tierName}"]`,
    );
    const priceElement = tierCard.locator('[data-testid="price"]');
    return (await priceElement.textContent()) || "";
  }

  /**
   * Click checkout for tier
   */
  async selectTier(tierName: string) {
    const tierCard = this.page.locator(
      `[data-testid="pricing-card-${tierName}"]`,
    );
    await tierCard
      .locator('button:has-text("Get Started"), button:has-text("Subscribe")')
      .click();
  }

  /**
   * Verify tier is displayed
   */
  async isTierVisible(tierName: string): Promise<boolean> {
    const tierCard = this.page.locator(
      `[data-testid="pricing-card-${tierName}"]`,
    );
    return await tierCard.isVisible().catch(() => false);
  }

  /**
   * Get all tier prices
   */
  async getAllPrices(): Promise<Record<string, string>> {
    const prices: Record<string, string> = {};

    const tiers = ["free", "mid", "high", "corporate"];
    for (const tier of tiers) {
      prices[tier] = await this.getTierPrice(tier);
    }

    return prices;
  }
}

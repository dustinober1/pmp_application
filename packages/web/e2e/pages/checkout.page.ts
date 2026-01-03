import type { Page, Locator } from "@playwright/test";
import { TestHelpers } from "../utils/test-helpers";

/**
 * Checkout Page Object Model
 *
 * Handles checkout and payment interactions
 */
export class CheckoutPage {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Locators
  readonly emailInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvcInput: Locator;
  readonly payButton: Locator;
  readonly cancelButton: Locator;
  readonly orderSummary: Locator;
  readonly totalAmount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    this.emailInput = page.locator('input[name="email"]');
    this.cardNumberInput = page.locator(
      'input[name="cardNumber"], input[placeholder*="card"]',
    );
    this.cardExpiryInput = page.locator(
      'input[name="expiry"], input[placeholder*="MM"]',
    );
    this.cardCvcInput = page.locator(
      'input[name="cvc"], input[placeholder*="CVC"]',
    );
    this.payButton = page.locator(
      'button:has-text("Pay"), button:has-text("Subscribe")',
    );
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.orderSummary = page.locator('[data-testid="order-summary"]');
    this.totalAmount = page.locator('[data-testid="total-amount"]');
  }

  /**
   * Navigate to checkout page
   */
  async goto() {
    await this.page.goto("/checkout");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fill payment details (using test card)
   */
  async fillPaymentDetails(details: {
    email?: string;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
  }) {
    if (details.email) {
      await this.emailInput.fill(details.email);
    }

    if (details.cardNumber) {
      await this.cardNumberInput.fill(details.cardNumber);
    }

    if (details.expiry) {
      await this.cardExpiryInput.fill(details.expiry);
    }

    if (details.cvc) {
      await this.cardCvcInput.fill(details.cvc);
    }
  }

  /**
   * Submit payment
   */
  async submitPayment() {
    await this.payButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Cancel checkout
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Get total amount
   */
  async getTotalAmount(): Promise<string> {
    return (await this.totalAmount.textContent()) || "";
  }

  /**
   * Wait for success page
   */
  async waitForSuccess() {
    await this.page.waitForURL(/\/success|\/order-confirmation/);
  }

  /**
   * Wait for error message
   */
  async waitForError() {
    await this.page.waitForSelector('[data-testid="error"], .error', {
      timeout: 5000,
    });
  }
}

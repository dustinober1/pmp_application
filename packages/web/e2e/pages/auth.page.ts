import { Page, Locator } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Authentication Page Object Model
 *
 * Encapsulates authentication-related page interactions
 */
export class AuthPage {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    // Initialize locators
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.registerLink = page.locator('a:has-text("Sign up")');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot")');
    this.errorMessage = page.locator('[data-testid="error"], .error, [role="alert"]');
    this.successMessage = page.locator('[data-testid="success"], .success');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to register page
   */
  async gotoRegister() {
    await this.page.goto('/auth/register');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to forgot password page
   */
  async gotoForgotPassword() {
    await this.page.goto('/auth/forgot-password');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Register new user
   */
  async register(name: string, email: string, password: string) {
    await this.gotoRegister();

    await this.page.fill('input[name="name"]', name);
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="confirmPassword"]', password);

    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    await this.gotoForgotPassword();
    await this.emailInput.fill(email);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    await this.page.goto(`/auth/reset-password?token=${token}`);
    await this.page.fill('input[name="password"]', newPassword);
    await this.page.fill('input[name="confirmPassword"]', newPassword);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Logout
   */
  async logout() {
    await this.page.click('[data-testid="logout"], button:has-text("Logout")');
    await this.page.waitForURL('/auth/login');
  }

  /**
   * Click register link
   */
  async clickRegister() {
    await this.registerLink.click();
  }

  /**
   * Verify error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Verify success message is displayed
   */
  async hasSuccessMessage(): Promise<boolean> {
    return await this.successMessage.isVisible().catch(() => false);
  }
}

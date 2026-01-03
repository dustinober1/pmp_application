import type { Page, Locator } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Exam Page Object Model
 *
 * Handles exam simulation interactions
 */
export class ExamPage {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Locators
  readonly startButton: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly submitButton: Locator;
  readonly questionText: Locator;
  readonly optionButtons: Locator;
  readonly progressBar: Locator;
  readonly timer: Locator;
  readonly flagButton: Locator;
  readonly questionNumber: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    this.startButton = page.locator('button:has-text("Start"), button:has-text("Begin")');
    this.nextButton = page.locator('button:has-text("Next")');
    this.previousButton = page.locator('button:has-text("Previous")');
    this.submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish")');
    this.questionText = page.locator('[data-testid="question-text"]');
    this.optionButtons = page.locator('[data-testid="answer-option"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.timer = page.locator('[data-testid="timer"]');
    this.flagButton = page.locator('button:has-text("Flag")');
    this.questionNumber = page.locator('[data-testid="question-number"]');
  }

  /**
   * Navigate to exam page
   */
  async goto(examId?: string) {
    const url = examId ? `/exam/${examId}` : '/exam';
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Start exam
   */
  async start() {
    await this.startButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select answer option
   */
  async selectOption(optionIndex: number) {
    const option = this.optionButtons.nth(optionIndex);
    await option.click();
  }

  /**
   * Go to next question
   */
  async next() {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Go to previous question
   */
  async previous() {
    await this.previousButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Flag current question
   */
  async flag() {
    await this.flagButton.click();
  }

  /**
   * Submit exam
   */
  async submit() {
    await this.submitButton.click();
    // Handle confirmation dialog if present
    const confirmButton = this.page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get current question text
   */
  async getQuestionText(): Promise<string> {
    return (await this.questionText.textContent()) || '';
  }

  /**
   * Get current question number
   */
  async getQuestionNumber(): Promise<string> {
    return (await this.questionNumber.textContent()) || '';
  }

  /**
   * Get timer text
   */
  async getTimer(): Promise<string> {
    return (await this.timer.textContent()) || '';
  }

  /**
   * Get progress percentage
   */
  async getProgress(): Promise<number> {
    const progressText = await this.progressBar.getAttribute('aria-valuenow');
    return progressText ? parseInt(progressText, 10) : 0;
  }

  /**
   * Wait for results page
   */
  async waitForResults() {
    await this.page.waitForURL(/\/results|\/score/);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get exam score
   */
  async getScore(): Promise<string> {
    const scoreElement = this.page.locator('[data-testid="score"], [data-testid="exam-score"]');
    return (await scoreElement.textContent()) || '';
  }
}

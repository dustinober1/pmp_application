import { test, expect } from './fixtures/auth.fixture';
import { ExamPage } from './pages/exam.page';
import { DashboardPage } from './pages/dashboard.page';

/**
 * Exam Simulation Flow Tests
 *
 * Tests the complete exam experience including:
 * - Exam start and initialization
 * - Question navigation
 * - Answer selection and flagging
 * - Timer functionality
 * - Exam submission
 * - Results and scoring
 */
test.describe('Exam Simulation Flow', () => {
  let examPage: ExamPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    examPage = new ExamPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test.describe('Exam Access', () => {
    test('should require authentication to access exam', async ({ page }) => {
      await page.goto('/exam');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should display exam start page', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');

      // Should show exam instructions
      await expect(authenticatedPage.locator('h1')).toContainText('Exam');
      await expect(authenticatedPage.locator('text=/instructions/i')).toBeVisible();
      await expect(examPage.startButton).toBeVisible();
    });

    test('should show exam duration and question count', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');

      await expect(authenticatedPage.locator('[data-testid="exam-duration"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="question-count"]')).toBeVisible();
    });
  });

  test.describe('Exam Initialization', () => {
    test('should start exam on button click', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();

      // Should load first question
      await expect(examPage.questionText).toBeVisible();
      await expect(examPage.optionButtons).toHaveCount(expect.any(Number));
      await expect(examPage.nextButton).toBeVisible();
    });

    test('should initialize timer on start', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();

      // Timer should be visible and running
      await expect(examPage.timer).toBeVisible();
      const timerText = await examPage.getTimer();
      expect(timerText).toMatch(/\d+:\d+:\d+/);
    });

    test('should show initial progress', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();

      const progress = await examPage.getProgress();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  test.describe('Question Navigation', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      // Setup: Start exam
      await authenticatedPage.goto('/exam');
      await examPage.start();
    });

    test('should display question and options', async () => {
      const questionText = await examPage.getQuestionText();
      expect(questionText).toBeTruthy();
      expect(questionText.length).toBeGreaterThan(0);

      // Should have multiple choice options
      const optionCount = await examPage.optionButtons.count();
      expect(optionCount).toBeGreaterThan(1);
    });

    test('should select answer option', async ({ _page }) => {
      // Select first option
      await examPage.selectOption(0);

      // Option should be selected
      const selectedOption = examPage.optionButtons.nth(0);
      await expect(selectedOption).toHaveAttribute('data-selected', 'true');
    });

    test('should change selected answer', async () => {
      // Select first option
      await examPage.selectOption(0);

      // Select different option
      await examPage.selectOption(1);

      // New option should be selected
      const selectedOption = examPage.optionButtons.nth(1);
      await expect(selectedOption).toHaveAttribute('data-selected', 'true');
    });

    test('should navigate to next question', async () => {
      const initialQuestionNum = await examPage.getQuestionNumber();

      await examPage.next();

      // Question number should increment
      const newQuestionNum = await examPage.getQuestionNumber();
      expect(parseInt(newQuestionNum, 10)).toBeGreaterThan(parseInt(initialQuestionNum, 10));
    });

    test('should navigate to previous question', async () => {
      // Go to next question first
      await examPage.next();

      const initialQuestionNum = await examPage.getQuestionNumber();

      // Go back
      await examPage.previous();

      // Question number should decrement
      const newQuestionNum = await examPage.getQuestionNumber();
      expect(parseInt(newQuestionNum, 10)).toBeLessThan(parseInt(initialQuestionNum, 10));
    });

    test('should disable previous button on first question', async () => {
      await expect(examPage.previousButton).toBeDisabled();
    });

    test('should enable next button after selecting answer', async () => {
      // Initially next might be disabled
      await expect(examPage.nextButton).toBeEnabled();

      // Select answer
      await examPage.selectOption(0);

      // Next should still be enabled
      await expect(examPage.nextButton).toBeEnabled();
    });
  });

  test.describe('Question Flagging', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();
    });

    test('should flag current question', async () => {
      await examPage.flag();

      // Flag button should show active state
      await expect(examPage.flagButton).toHaveAttribute('data-flagged', 'true');
    });

    test('should unflag question', async () => {
      await examPage.flag();
      await examPage.flag();

      // Flag button should not be active
      await expect(examPage.flagButton).not.toHaveAttribute('data-flagged', 'true');
    });

    test('should show flagged questions indicator', async () => {
      await examPage.flag();
      await examPage.next();

      // Should show flagged question indicator
      const flagIndicator = examPage.page.locator('[data-testid="flagged-questions"]');
      await expect(flagIndicator).toContainText('1');
    });
  });

  test.describe('Timer Functionality', () => {
    test('should countdown timer', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();

      const initialTimer = await examPage.getTimer();

      // Wait a moment
      await examPage.page.waitForTimeout(2000);

      const newTimer = await examPage.getTimer();
      expect(newTimer).not.toBe(initialTimer);
    });

    test('should show warning when time is low', async ({ authenticatedPage }) => {
      // Mock exam with short time remaining
      await authenticatedPage.goto('/exam?mock-time=low');
      await examPage.start();

      // Should show time warning
      await expect(examPage.page.locator('[data-testid="time-warning"]')).toBeVisible();
    });

    test('should auto-submit when time expires', async ({ authenticatedPage }) => {
      // Mock exam that expires quickly
      await authenticatedPage.goto('/exam?mock-time=expire');
      await examPage.start();

      // Wait for auto-submit
      await examPage.page.waitForTimeout(60000);

      // Should auto-submit and show results
      await expect(examPage.page).toHaveURL(/\/results/);
    });
  });

  test.describe('Progress Tracking', () => {
    test('should update progress as questions answered', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();

      const initialProgress = await examPage.getProgress();

      // Answer question
      await examPage.selectOption(0);
      await examPage.next();

      const newProgress = await examPage.getProgress();
      expect(newProgress).toBeGreaterThan(initialProgress);
    });

    test('should show question number indicator', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();

      const questionNum = await examPage.getQuestionNumber();
      expect(questionNum).toMatch(/\d+ of \d+/);
    });

    test('should show answered questions indicator', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();

      // Answer some questions
      await examPage.selectOption(0);
      await examPage.next();

      // Should show answered count
      const answeredIndicator = examPage.page.locator('[data-testid="answered-count"]');
      await expect(answeredIndicator).toContainText('1');
    });
  });

  test.describe('Exam Submission', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam');
      await examPage.start();
    });

    test('should show confirmation before submit', async () => {
      // Navigate to last question or click submit early
      await examPage.page.locator('button:has-text("Submit")').click();

      // Should show confirmation dialog
      await expect(examPage.page.locator('[data-testid="submit-confirmation"]')).toBeVisible();
      await expect(examPage.page.locator('text=/are you sure/i')).toBeVisible();
    });

    test('should cancel submission on dialog cancel', async () => {
      await examPage.page.locator('button:has-text("Submit")').click();
      await examPage.page.locator('button:has-text("Cancel")').click();

      // Should remain on exam
      await expect(examPage.questionText).toBeVisible();
    });

    test('should submit exam and show results', async () => {
      // Answer a few questions
      await examPage.selectOption(0);
      await examPage.next();
      await examPage.selectOption(0);
      await examPage.next();

      // Submit
      await examPage.submit();
      await examPage.waitForResults();

      // Should show results
      await expect(examPage.page.locator('[data-testid="exam-results"]')).toBeVisible();
    });

    test('should show score after submission', async () => {
      await examPage.selectOption(0);
      await examPage.next();
      await examPage.selectOption(0);
      await examPage.next();

      await examPage.submit();
      await examPage.waitForResults();

      const score = await examPage.getScore();
      expect(score).toBeTruthy();
      expect(score).toMatch(/\d+%/);
    });

    test('should show question breakdown', async () => {
      await examPage.selectOption(0);
      await examPage.next();
      await examPage.selectOption(0);
      await examPage.next();

      await examPage.submit();
      await examPage.waitForResults();

      await expect(examPage.page.locator('[data-testid="correct-count"]')).toBeVisible();
      await expect(examPage.page.locator('[data-testid="incorrect-count"]')).toBeVisible();
      await expect(examPage.page.locator('[data-testid="flagged-count"]')).toBeVisible();
    });
  });

  test.describe('Results Review', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      // Setup: Complete exam
      await authenticatedPage.goto('/exam');
      await examPage.start();

      // Answer questions
      for (let i = 0; i < 5; i++) {
        await examPage.selectOption(0);
        await examPage.next();
      }

      await examPage.submit();
      await examPage.waitForResults();
    });

    test('should show exam summary', async () => {
      await expect(examPage.page.locator('[data-testid="exam-summary"]')).toBeVisible();
      await expect(examPage.page.locator('[data-testid="time-taken"]')).toBeVisible();
      await expect(examPage.page.locator('[data-testid="score"]')).toBeVisible();
    });

    test('should allow reviewing answers', async () => {
      await examPage.page.click('button:has-text("Review Answers")');

      await expect(examPage.page.locator('[data-testid="answer-review"]')).toBeVisible();
    });

    test('should show correct and incorrect answers', async () => {
      await examPage.page.click('button:has-text("Review Answers")');

      await expect(examPage.page.locator('[data-correct="true"]')).toBeVisible();
      await expect(examPage.page.locator('[data-correct="false"]')).toBeVisible();
    });

    test('should allow retaking exam', async () => {
      await examPage.page.click('button:has-text("Retake Exam")');

      // Should start new exam
      await expect(examPage.questionText).toBeVisible();
    });
  });

  test.describe('Exam History', () => {
    test('should save exam to history', async ({ authenticatedPage }) => {
      // Complete exam
      await authenticatedPage.goto('/exam');
      await examPage.start();

      for (let i = 0; i < 3; i++) {
        await examPage.selectOption(0);
        await examPage.next();
      }

      await examPage.submit();
      await examPage.waitForResults();

      // Go to dashboard
      await dashboardPage.goto();

      // Should show exam in history
      await expect(authenticatedPage.locator('[data-testid="exam-history"]')).toBeVisible();
    });

    test('should show previous exam results', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/exam-history');

      await expect(authenticatedPage.locator('[data-testid="exam-list"]')).toBeVisible();
    });
  });
});

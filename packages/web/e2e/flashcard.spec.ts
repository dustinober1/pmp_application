import { test, expect } from "@playwright/test";

test.describe("Flashcard Session Flows", () => {
  test.describe("Auth Redirect - Flashcards Page", () => {
    test("should redirect to login when accessing flashcards page without auth", async ({
      page,
    }) => {
      await page.goto("/flashcards");
      await expect(page).toHaveURL(/\/auth\/login/);
      await expect(page.locator("h1")).toContainText("Welcome Back");
    });

    test("should include next parameter in redirect", async ({ page }) => {
      await page.goto("/flashcards");
      const url = page.url();
      expect(url).toContain("next=%2Fflashcards");
    });

    test("should display login form elements", async ({ page }) => {
      await page.goto("/flashcards");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe("Auth Redirect - Flashcard Session", () => {
    test("should redirect to login when accessing flashcard session without auth", async ({
      page,
    }) => {
      await page.goto("/flashcards/session/test-session");
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("Auth Redirect - Create Card", () => {
    test("should redirect to login when accessing create card page without auth", async ({
      page,
    }) => {
      await page.goto("/flashcards/create");
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});

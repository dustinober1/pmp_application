import { test, expect } from "./fixtures/auth.fixture";
import { AuthPage } from "./pages/auth.page";
import { testUsers } from "./fixtures/test-users.fixture";

/**
 * Comprehensive Authentication Flow Tests
 *
 * Tests user registration, login, email verification,
 * password reset, and logout functionality
 */
test.describe("Authentication Flow", () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test.describe("User Registration", () => {
    test("should register a new user successfully", async ({ page }) => {
      const timestamp = Date.now();
      const user = {
        name: "New User",
        email: `new-user-${timestamp}@example.com`,
        password: "SecurePass123!",
      };

      await authPage.goto();
      await authPage.clickRegister();

      // Verify registration page is loaded
      await expect(page).toHaveURL(/\/auth\/register/);
      await expect(page.locator("h1")).toContainText("Sign Up");

      // Fill registration form
      await page.fill('input[name="name"]', user.name);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.fill('input[name="confirmPassword"]', user.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to email verification page or dashboard
      await expect(page).toHaveURL(/\/(dashboard|verify-email)/);
    });

    test("should validate email format", async ({ page }) => {
      await authPage.gotoRegister();

      // Enter invalid email
      await page.fill('input[name="email"]', "invalid-email");
      await page.fill('input[name="password"]', "password123");
      await page.fill('input[name="confirmPassword"]', "password123");

      // Submit form
      await page.click('button[type="submit"]');

      // Should show validation error
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });

    test("should validate password matching", async ({ page }) => {
      await authPage.gotoRegister();

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "password123");
      await page.fill('input[name="confirmPassword"]', "different-password");

      await page.click('button[type="submit"]');

      // Should show password mismatch error
      await expect(page.locator("text=passwords must match")).toBeVisible();
    });

    test("should enforce password strength requirements", async ({ page }) => {
      await authPage.gotoRegister();

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "weak"); // Too short
      await page.fill('input[name="confirmPassword"]', "weak");

      await page.click('button[type="submit"]');

      // Should show password strength error
      await expect(page.locator("text=/at least 8 characters/i")).toBeVisible();
    });
  });

  test.describe("User Login", () => {
    test("should login with valid credentials", async ({ page }) => {
      await authPage.goto();
      await authPage.login(
        testUsers.standard.email,
        testUsers.standard.password,
      );

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator("h1")).toContainText("Dashboard");
    });

    test("should show error with invalid credentials", async ({ page }) => {
      await authPage.goto();
      await authPage.login("invalid@example.com", "wrongpassword");

      // Should stay on login page and show error
      await expect(page).toHaveURL(/\/auth\/login/);
      await expect(authPage.errorMessage).toBeVisible();
    });

    test("should show error for non-existent user", async ({ _page }) => {
      await authPage.goto();
      await authPage.login("nonexistent@example.com", "password123");

      await expect(authPage.errorMessage).toBeVisible();
      await expect(authPage.errorMessage).toContainText("Invalid credentials");
    });

    test("should persist session after page refresh", async ({ page }) => {
      await authPage.goto();
      await authPage.login(
        testUsers.standard.email,
        testUsers.standard.password,
      );

      // Refresh page
      await page.reload();

      // Should still be logged in
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe("Email Verification", () => {
    test("should send verification email on registration", async ({
      page,
      _apiHelper,
    }) => {
      const timestamp = Date.now();
      const email = `verify-test-${timestamp}@example.com`;

      // Register user
      await authPage.gotoRegister();
      await page.fill('input[name="name"]', "Verify Test");
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', "VerifyPass123!");
      await page.fill('input[name="confirmPassword"]', "VerifyPass123!");
      await page.click('button[type="submit"]');

      // Should show verification message
      await expect(page.locator("text=/check your email/i")).toBeVisible();
    });

    test("should verify email with valid token", async ({
      _page,
      _apiHelper,
    }) => {
      // This would require mocking the email service
      // or having a test endpoint that returns the verification token
      test.skip(true, "Requires email service mock implementation");
    });
  });

  test.describe("Password Reset", () => {
    test("should request password reset", async ({ page }) => {
      await authPage.gotoForgotPassword();

      await page.fill('input[type="email"]', testUsers.standard.email);
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator("text=/check your email/i")).toBeVisible();
    });

    test("should reset password with valid token", async ({
      page,
      _apiHelper,
    }) => {
      // Mock password reset token
      const resetToken = "mock-reset-token";

      await authPage.resetPassword(resetToken, "NewSecurePass123!");

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);

      // Should be able to login with new password
      await authPage.login(testUsers.standard.email, "NewSecurePass123!");
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("should show error with invalid token", async ({ _page }) => {
      await authPage.resetPassword("invalid-token", "NewPassword123!");

      // Should show error
      await expect(authPage.errorMessage).toBeVisible();
    });
  });

  test.describe("Logout", () => {
    test("should logout successfully", async ({ _authenticatedPage }) => {
      // User is already logged in from fixture
      await authPage.logout();

      // Should redirect to login page
      await expect(authPage.page).toHaveURL(/\/auth\/login/);

      // Should not be able to access protected routes
      await authPage.page.goto("/dashboard");
      await expect(authPage.page).toHaveURL(/\/auth\/login/);
    });

    test("should clear session data on logout", async ({
      _authenticatedPage,
    }) => {
      await authPage.logout();

      // Check localStorage is cleared
      const token = await authPage.page.evaluate(() =>
        localStorage.getItem("token"),
      );
      expect(token).toBeNull();

      const refreshToken = await authPage.page.evaluate(() =>
        localStorage.getItem("refreshToken"),
      );
      expect(refreshToken).toBeNull();
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
      const protectedRoutes = [
        "/dashboard",
        "/practice",
        "/study",
        "/flashcards",
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/auth\/login/);
        await expect(page.locator("h1")).toContainText("Welcome Back");
      }
    });

    test("should include return URL in redirect", async ({ page }) => {
      await page.goto("/practice/session/test-session");

      const url = page.url();
      expect(url).toContain("next=%2Fpractice");
    });

    test("should redirect to original URL after login", async ({ page }) => {
      // Try to access protected route
      await page.goto("/study");
      await expect(page).toHaveURL(/\/auth\/login/);

      // Login
      await authPage.login(
        testUsers.standard.email,
        testUsers.standard.password,
      );

      // Should redirect to original URL
      await expect(page).toHaveURL(/\/study/);
    });
  });

  test.describe("Remember Me", () => {
    test("should remember user across sessions", async ({ page, context }) => {
      await authPage.goto();

      // Check "Remember Me" checkbox if present
      const rememberCheckbox = page.locator(
        'input[name="remember"], input[type="checkbox"]',
      );
      if (await rememberCheckbox.isVisible().catch(() => false)) {
        await rememberCheckbox.check();
      }

      await authPage.login(
        testUsers.standard.email,
        testUsers.standard.password,
      );

      // Get cookies
      const cookies = await context.cookies();
      const hasRememberCookie = cookies.some(
        (c) => c.name === "remember" || c.name === "refreshToken",
      );

      expect(hasRememberCookie).toBeTruthy();
    });
  });
});

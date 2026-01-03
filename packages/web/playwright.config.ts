import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Playwright E2E Test Configuration for PMP Study Application
 *
 * Features:
 * - Cross-browser testing (Chrome, Firefox, Safari)
 * - Visual regression testing
 * - API mocking for external services (Stripe, Email)
 * - Test fixtures for database seeding
 * - CI/CD integration with GitHub Actions
 * - Parallel test execution
 * - Detailed reporting with traces and screenshots
 */
export default defineConfig<{
  /* eslint-disable @typescript-eslint/no-explicit-any */
  testUser: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}>({
  // Test directory
  testDir: "./e2e",

  // Fully parallel test execution
  fullyParallel: true,

  // Fail on test.only in CI
  forbidOnly: !!process.env.CI,

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Worker configuration
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
    ["list"],
  ],

  // Global timeout
  timeout: 60 * 1000,

  // Expect timeout
  expect: {
    timeout: 10 * 1000,
  },

  // Test configuration
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || "http://localhost:3005",

    // Custom headers for E2E tests
    extraHTTPHeaders: {
      "x-e2e-test": "true",
    },

    // Trace configuration (on failure, or on first retry)
    trace: "retain-on-failure",

    // Screenshot configuration
    screenshot: "only-on-failure",

    // Video configuration
    video: "retain-on-failure",

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,

    // Action timeout
    actionTimeout: 10 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Test projects for different browsers and devices
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: {
          // Accept downloads in tests
          acceptDownloads: true,
        },
      },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile viewport tests
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    // Visual regression tests
    {
      name: "visual-regression",
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "only-on-failure",
      },
    },
  ],

  // Web server configuration for local development
  webServer: {
    command: "PORT=3005 npm run dev",
    url: "http://localhost:3005",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      ...process.env,
      E2E_TEST: "true",
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    },
  },

  // Output directories
  outputDir: "test-results/artifacts",

  // Global setup and teardown
  globalSetup: path.join(__dirname, "e2e/setup/global-setup.ts"),
  globalTeardown: path.join(__dirname, "e2e/setup/global-teardown.ts"),
});

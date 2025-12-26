import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for PMP Application E2E Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Test directory
    testDir: './e2e',

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI for stability
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
        ...(process.env.CI ? [['github'] as const] : []),
    ],

    // Shared settings for all the projects below
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'on-first-retry',
    },

    // Configure projects for major browsers
    projects: [
        // Setup project for authentication state
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },

        // Desktop browsers
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
            dependencies: ['setup'],
        },

        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
            },
            dependencies: ['setup'],
        },

        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
            },
            dependencies: ['setup'],
        },

        // Mobile viewports
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
            },
            dependencies: ['setup'],
        },

        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 12'],
            },
            dependencies: ['setup'],
        },
    ],

    // Run local dev server before starting the tests
    webServer: [
        {
            command: 'npm run dev',
            cwd: './client/client',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
        {
            command: 'npm run dev',
            cwd: '.',
            url: 'http://localhost:3000',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
    ],

    // Global timeout for each test
    timeout: 30 * 1000,

    // Expect timeout
    expect: {
        timeout: 5000,
    },
});

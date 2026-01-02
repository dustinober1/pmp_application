/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixtures use 'use' callback, not React hooks */
import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { testUsers } from './test-users.fixture';
import { AuthPage } from '../pages/auth.page';
import { APIHelper } from '../utils/api-helper';

/**
 * Authentication fixture
 *
 * Provides authenticated page instances for tests
 */

type AuthFixtures = {
  authenticatedPage: Page;
  authenticatedPageAsPremium: Page;
  authenticatedPageAsAdmin: Page;
  apiHelper: APIHelper;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    const user = testUsers.standard;

    // Login with standard user
    await authPage.goto();
    await authPage.login(user.email, user.password);

    // Verify successful login
    await page.waitForURL('/dashboard');

    await use(page);

    // Cleanup - logout after test
    await authPage.logout();
  },

  authenticatedPageAsPremium: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    const user = testUsers.premium;

    await authPage.goto();
    await authPage.login(user.email, user.password);
    await page.waitForURL('/dashboard');

    await use(page);

    await authPage.logout();
  },

  authenticatedPageAsAdmin: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    const user = testUsers.admin;

    await authPage.goto();
    await authPage.login(user.email, user.password);
    await page.waitForURL('/dashboard');

    await use(page);

    await authPage.logout();
  },

  apiHelper: async ({ request }, use) => {
    const helper = new APIHelper(request);
    await use(helper);
  },
});

export { expect } from '@playwright/test';

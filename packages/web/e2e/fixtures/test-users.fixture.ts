import { test as base } from '@playwright/test';

/**
 * Test user fixture for authentication tests
 *
 * Provides pre-configured test users for different scenarios:
 * - Standard user
 * - Premium user (with paid subscription)
 * - Admin user
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
  tier: 'free' | 'mid' | 'high' | 'corporate';
  isAdmin?: boolean;
}

export const testUsers = {
  standard: {
    email: 'test-user@example.com',
    password: 'TestPass123!',
    name: 'Test User',
    tier: 'free' as const,
  },
  premium: {
    email: 'premium-user@example.com',
    password: 'PremiumPass123!',
    name: 'Premium User',
    tier: 'high' as const,
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    name: 'Admin User',
    tier: 'corporate' as const,
    isAdmin: true,
  },
  newUser: {
    email: `new-user-${Date.now()}@example.com`,
    password: 'NewUserPass123!',
    name: 'New User',
    tier: 'free' as const,
  },
};

type TestFixtures = {
  testUser: TestUser;
};

/* eslint-disable no-empty-pattern */
/* eslint-disable react-hooks/rules-of-hooks */
export const test = base.extend<TestFixtures & { page?: unknown }>({
  testUser: async ({}, use) => {
    // Default to standard user
    await use(testUsers.standard);
  },
});
/* eslint-enable react-hooks/rules-of-hooks */
/* eslint-enable no-empty-pattern */

export { expect } from '@playwright/test';

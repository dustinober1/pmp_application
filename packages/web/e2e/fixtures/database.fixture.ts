/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixtures use 'use' callback, not React hooks */
import { test as base } from "@playwright/test";

/**
 * Database fixture for test data management
 *
 * Provides utilities for:
 * - Seeding test data
 * - Cleaning up after tests
 * - Resetting database state
 */

type DatabaseFixtures = {
  seedDatabase: () => Promise<void>;
  cleanupDatabase: () => Promise<void>;
  resetDatabase: () => Promise<void>;
};

export const test = base.extend<DatabaseFixtures>({
  seedDatabase: async ({ request }, use) => {
    const seedFn = async () => {
      // Call API endpoint to seed database
      await request.post(
        `${process.env.API_URL || "http://localhost:3001"}/test/seed`,
        {
          headers: {
            "x-e2e-test": "true",
          },
        },
      );
    };

    await use(seedFn);
  },

  cleanupDatabase: async ({ request }, use) => {
    const cleanupFn = async () => {
      await request.post(
        `${process.env.API_URL || "http://localhost:3001"}/test/cleanup`,
        {
          headers: {
            "x-e2e-test": "true",
          },
        },
      );
    };

    await use(cleanupFn);
  },

  resetDatabase: async ({ seedDatabase, cleanupDatabase }, use) => {
    const resetFn = async () => {
      await cleanupDatabase();
      await seedDatabase();
    };

    await use(resetFn);
  },
});

export { expect } from "@playwright/test";

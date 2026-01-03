import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * API Helper for E2E tests
 *
 * Provides convenience methods for common API operations
 */
export class APIHelper {
  constructor(private request: APIRequestContext) {
    this.request = request;
  }

  private get baseURL(): string {
    return process.env.API_URL || 'http://localhost:3001';
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'x-e2e-test': 'true',
    };
  }

  /**
   * Register a new user
   */
  async registerUser(email: string, password: string, name: string): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}/auth/register`, {
      headers: this.headers,
      data: { email, password, name },
    });
  }

  /**
   * Login user and get token
   */
  async loginUser(
    email: string,
    password: string
  ): Promise<{ token: string; refreshToken: string }> {
    const response = await this.request.post(`${this.baseURL}/auth/login`, {
      headers: this.headers,
      data: { email, password },
    });

    const data = await response.json();
    return {
      token: data.token,
      refreshToken: data.refreshToken,
    };
  }

  /**
   * Create authenticated request context
   */
  async authenticatedRequest(token: string) {
    return {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  /**
   * Get current user profile
   */
  async getUserProfile(token: string): Promise<APIResponse> {
    const authHeaders = await this.authenticatedRequest(token);
    return this.request.get(`${this.baseURL}/user/profile`, {
      headers: authHeaders.headers,
    });
  }

  /**
   * Create a test order
   */
  async createTestOrder(
    token: string,
    tier: 'mid' | 'high' | 'corporate',
    billing: 'monthly' | 'annual'
  ): Promise<APIResponse> {
    const authHeaders = await this.authenticatedRequest(token);
    return this.request.post(`${this.baseURL}/orders/test`, {
      headers: authHeaders.headers,
      data: { tier, billing },
    });
  }

  /**
   * Mock Stripe webhook
   */
  async mockStripeWebhook(eventType: string, data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}/webhooks/stripe/test`, {
      headers: this.headers,
      data: { eventType, data },
    });
  }

  /**
   * Seed test questions
   */
  async seedQuestions(count: number = 10): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}/test/seed-questions`, {
      headers: this.headers,
      data: { count },
    });
  }

  /**
   * Cleanup test data
   */
  async cleanupTestData(): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}/test/cleanup`, {
      headers: this.headers,
    });
  }
}

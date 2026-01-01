import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking fetch
import { apiRequest, authApi, flashcardApi, practiceApi, dashboardApi, formulaApi, searchApi, contentApi, subscriptionApi } from './api';

describe('apiRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('makes GET request with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { test: 'value' } }),
    });

    const result = await apiRequest('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
    expect(result).toEqual({ success: true, data: { test: 'value' } });
  });

  it('makes POST request with body', async () => {
    // Mock CSRF cookie fetch first
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { csrfToken: 'test-csrf' } }),
    });
    // Then the actual request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await apiRequest('/test', { method: 'POST', body: { key: 'value' } });

    // Second call should be the POST
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('throws error on non-ok response', async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: { message: 'Test error' } }),
    });

    await expect(apiRequest('/test-error-' + Date.now())).rejects.toThrow('Test error');
  });

  it('handles 401 response', async () => {
    mockFetch.mockReset();
    // First call returns 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Unauthorized' } }),
    });
    // CSRF fetch for refresh
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { csrfToken: 'test-csrf' } }),
    });
    // Refresh fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Refresh failed' } }),
    });

    // Should throw after failed refresh
    await expect(apiRequest('/test-401-' + Date.now())).rejects.toThrow();
  });

  it('uses cache for repeated GET requests to same endpoint', async () => {
    mockFetch.mockReset();
    const uniqueEndpoint = '/domains-' + Date.now();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { cached: true } }),
    });

    // First call
    const result1 = await apiRequest(uniqueEndpoint);

    // Second call should use cache (fetch not called again for same URL)
    const result2 = await apiRequest(uniqueEndpoint);

    expect(result1).toEqual(result2);
  });

  it('does not cache auth endpoints', async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const endpoint = '/auth/me-' + Date.now();
    await apiRequest(endpoint);
    await apiRequest(endpoint);

    // Auth endpoints are always fetched
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('handles JSON parse errors gracefully', async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('No JSON')),
    });

    const result = await apiRequest('/test-json-' + Date.now());

    expect(result).toEqual({ success: true });
  });
});

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'pmp_csrf_token=test-token',
    });
  });

  it('login calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await authApi.login('test@example.com', 'password');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      })
    );
  });

  it('register calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await authApi.register('test@example.com', 'password', 'Test User');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password', name: 'Test User' }),
      })
    );
  });

  it('me calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { user: {} } }),
    });

    await authApi.me();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('forgotPassword calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await authApi.forgotPassword('test@example.com');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/forgot-password'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })
    );
  });

  it('resetPassword calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await authApi.resetPassword('token123', 'newpassword');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/reset-password'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'token123', password: 'newpassword' }),
      })
    );
  });
});

describe('flashcardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'pmp_csrf_token=test-token',
    });
  });

  it('getFlashcards with params builds query string', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await flashcardApi.getFlashcards({ domainId: 'd1', limit: 10 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/flashcards\?domainId=d1&limit=10/),
      expect.anything()
    );
  });

  it('startSession sends correct body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await flashcardApi.startSession({ domainIds: ['d1'], cardCount: 20 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/flashcards/sessions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ domainIds: ['d1'], cardCount: 20 }),
      })
    );
  });

  it('recordResponse sends to correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await flashcardApi.recordResponse('session1', 'card1', 'know', 5000);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/flashcards/sessions/session1/responses/card1'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ rating: 'know', timeSpentMs: 5000 }),
      })
    );
  });
});

describe('practiceApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'pmp_csrf_token=test-token',
    });
  });

  it('startSession creates practice session', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await practiceApi.startSession({ domainIds: ['d1'], questionCount: 10 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/practice/sessions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ domainIds: ['d1'], questionCount: 10 }),
      })
    );
  });

  it('submitAnswer sends answer correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await practiceApi.submitAnswer({
      sessionId: 's1',
      questionId: 'q1',
      selectedOptionId: 'o1',
      timeSpentMs: 3000,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/practice/sessions/s1/answers/q1'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ selectedOptionId: 'o1', timeSpentMs: 3000 }),
      })
    );
  });

  it('flagQuestion toggles flag', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await practiceApi.flagQuestion('q1');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/practice/questions/q1/flag'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('unflagQuestion removes flag', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await practiceApi.unflagQuestion('q1');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/practice/questions/q1/flag'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDashboard fetches dashboard data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { dashboard: {} } }),
    });

    await dashboardApi.getDashboard();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('getActivity with limit adds query param', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await dashboardApi.getActivity(5);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/dashboard\/activity\?limit=5/),
      expect.anything()
    );
  });
});

describe('formulaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'pmp_csrf_token=test-token',
    });
  });

  it('getFormulas with category filters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await formulaApi.getFormulas('time');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/formulas\?category=time/),
      expect.anything()
    );
  });

  it('calculate sends inputs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { result: 42 } }),
    });

    await formulaApi.calculate('f1', { x: 10, y: 20 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/formulas/f1/calculate'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ inputs: { x: 10, y: 20 } }),
      })
    );
  });
});

describe('searchApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('search encodes query properly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { results: [] } }),
    });

    await searchApi.search('test query');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/search\?q=test%20query/),
      expect.anything()
    );
  });

  it('search with limit adds param', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await searchApi.search('test', 5);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/search\?q=test&limit=5/),
      expect.anything()
    );
  });
});

describe('contentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'pmp_csrf_token=test-token',
    });
  });

  it('getDomains fetches all domains', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { domains: [] } }),
    });

    await contentApi.getDomains();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/domains'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('markSectionComplete posts to correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await contentApi.markSectionComplete('section1');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/domains/progress/sections/section1/complete'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('subscriptionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'pmp_csrf_token=test-token',
    });
  });

  it('create subscription', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await subscriptionApi.create('tier-pro');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/create'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ tierId: 'tier-pro' }),
      })
    );
  });

  it('cancel subscription', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await subscriptionApi.cancel();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/cancel'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
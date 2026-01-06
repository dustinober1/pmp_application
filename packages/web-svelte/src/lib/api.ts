/**
 * API Client Utilities
 *
 * This module provides a type-safe API client for making HTTP requests.
 * Currently this is a placeholder for future backend integration.
 * The app is currently static-only with no backend.
 */

/**
 * Custom API Error class with status code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * API Request options
 */
export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Make a type-safe API request
 * Currently this is a stub for future backend integration
 *
 * @example
 * ```ts
 * const user = await apiRequest<User>('/api/user', {}, fetch);
 * ```
 */
export async function apiRequest<T>(
  _path: string,
  _options: ApiRequestOptions = {},
  _fetch: typeof fetch = fetch,
): Promise<T> {
  // Placeholder for future API integration
  // The app is currently static-only with no backend
  throw new ApiError("API not implemented - this is a static-only app", 501);
}

/**
 * GET request helper
 */
export async function get<T>(
  path: string,
  options?: Omit<ApiRequestOptions, "method" | "body">,
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export async function post<T>(
  path: string,
  body: unknown,
  options?: Omit<ApiRequestOptions, "method">,
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "POST", body });
}

/**
 * PUT request helper
 */
export async function put<T>(
  path: string,
  body: unknown,
  options?: Omit<ApiRequestOptions, "method">,
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "PUT", body });
}

/**
 * PATCH request helper
 */
export async function patch<T>(
  path: string,
  body: unknown,
  options?: Omit<ApiRequestOptions, "method">,
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "PATCH", body });
}

/**
 * DELETE request helper
 */
export async function del<T>(
  path: string,
  options?: Omit<ApiRequestOptions, "method" | "body">,
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "DELETE" });
}

import type { NumericRange } from "@sveltejs/kit";
import { redirect, error as kitError } from "@sveltejs/kit";
import { ApiError, apiRequest } from "./api";

/**
 * Standard load data interface
 */
export interface LoadData<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Wrapper for API requests in SvelteKit load functions
 * Handles errors and returns standardized LoadData structure
 *
 * @example
 * ```ts
 * export const load = async ({ fetch }) => {
 *   const user = await loadApi(() => authApi.me(fetch));
 *   const dashboard = await loadApi(() => dashboardApi.getDashboard(fetch));
 *
 *   return {
 *     user: user.data,
 *     dashboard: dashboard.data,
 *   };
 * };
 * ```
 */
export async function loadApi<T>(
  apiCall: () => Promise<T>,
): Promise<LoadData<T>> {
  try {
    const data = await apiCall();
    return { data, error: null, status: 200 };
  } catch (error) {
    if (error instanceof ApiError) {
      return { data: null, error: error.message, status: error.status };
    }
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}

/**
 * Throws an SvelteKit redirect error
 */
export function throwRedirect(
  status: NumericRange<300, 399>,
  location: string,
): never {
  throw redirect(status, location);
}

/**
 * Throws an SvelteKit HTTP error
 */
export function throwLoadError(
  status: NumericRange<400, 599>,
  message: string,
): never {
  throw kitError(status, message);
}

/**
 * Helper to require authentication in load functions
 * Redirects to login if user is not authenticated
 *
 * @example
 * ```ts
 * export const load = async ({ fetch }) => {
 *   const user = await requireAuth(fetch);
 *   return { user };
 * };
 * ```
 */
export async function requireAuth(fetch: typeof fetch) {
  const { data, error, status } = await loadApi(() =>
    apiRequest("/auth/me", {}, fetch),
  );

  if (status === 401 || error) {
    throw throwRedirect(303, "/auth/login");
  }

  return data;
}

/**
 * Helper to load multiple API calls in parallel
 *
 * @example
 * ```ts
 * export const load = async ({ fetch }) => {
 *   const [user, dashboard, streak] = await loadParallel(
 *     () => authApi.me(fetch),
 *     () => dashboardApi.getDashboard(fetch),
 *     () => dashboardApi.getStreak(fetch),
 *   );
 *
 *   return {
 *     user: user.data,
 *     dashboard: dashboard.data,
 *     streak: streak.data,
 *   };
 * };
 * ```
 */
export async function loadParallel<T extends unknown[]>(
  ...apiCalls: Array<() => Promise<T[number]>>
): Promise<Array<LoadData<T[number]>>> {
  return Promise.all(apiCalls.map((call) => loadApi(call)));
}

/**
 * Type-safe helper for paginated data loading
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export async function loadPaginated<T>(
  fetchPaginated: (
    offset: number,
    limit: number,
  ) => Promise<{
    data?: { items?: T[]; total?: number; offset?: number; limit?: number };
  }>,
  offset: number = 0,
  limit: number = 20,
): Promise<LoadData<PaginatedData<T>>> {
  try {
    const response = await fetchPaginated(offset, limit);

    if (!response.data) {
      return {
        data: {
          items: [],
          total: 0,
          offset,
          limit,
          hasMore: false,
        },
        error: null,
        status: 200,
      };
    }

    const {
      items = [],
      total = 0,
      offset: respOffset = offset,
      limit: respLimit = limit,
    } = response.data;

    return {
      data: {
        items,
        total,
        offset: respOffset,
        limit: respLimit,
        hasMore: respOffset + items.length < total,
      },
      error: null,
      status: 200,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { data: null, error: error.message, status: error.status };
    }
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}

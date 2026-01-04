/**
 * Static data fetch helper for GitHub Pages deployment.
 *
 * This module provides a basePath-aware fetch wrapper for loading static JSON data
 * from the public/ directory. It automatically prepends the basePath when deployed
 * to GitHub Pages or any subpath hosting.
 */

const cache = new Map<string, unknown>();

/**
 * Gets the base path for the current deployment.
 * - Empty string for local development
 * - "/pmp_application" for GitHub Pages project pages
 */
function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || "";
}

/**
 * Builds a full URL including the basePath for static assets.
 */
export function buildStaticPath(path: string): string {
  const basePath = getBasePath();
  // Remove leading slash from path if present, then join with basePath
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
}

/**
 * Fetches and parses JSON data from a static path.
 * Uses in-memory caching to avoid redundant network requests.
 *
 * @param path - The path to the JSON file (e.g., "/data/flashcards.json")
 * @returns Promise that resolves to the parsed JSON data
 * @throws Error if the request fails or returns non-200 status
 */
export async function fetchStaticData<T>(path: string): Promise<T> {
  const url = buildStaticPath(path);

  // Check cache first
  if (cache.has(url)) {
    return cache.get(url) as T;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch static data from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const text = await response.text();

  try {
    const data = JSON.parse(text) as T;
    // Cache the result
    cache.set(url, data);
    return data;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from ${url}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Clears the in-memory cache.
 * Useful for testing or when data needs to be refreshed.
 */
export function clearStaticCache(): void {
  cache.clear();
}

/**
 * Prefetches data into the cache without returning it.
 * Useful for warming up the cache during app initialization.
 */
export async function prefetchStaticData(path: string): Promise<void> {
  const url = buildStaticPath(path);
  if (cache.has(url)) {
    return;
  }
  await fetchStaticData(path);
}

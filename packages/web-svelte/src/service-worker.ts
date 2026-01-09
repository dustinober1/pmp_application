/// <reference lib="webworker" />

/**
 * PMP Study Pro Service Worker
 * 
 * SECURITY CONSIDERATIONS:
 * - Cache versioning ensures users get updated code after security fixes
 * - Only same-origin requests are cached
 * - Cache expiration prevents serving stale vulnerable code indefinitely
 * - Proper cleanup of old caches on activation
 */

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

// Version should be incremented on each deployment with security-relevant changes
// Format: pmp-study-pro-v{major}.{minor}.{patch}-{buildDate}
const CACHE_VERSION = '2';
const BUILD_DATE = '2026-01-09'; // Update on each build
const CACHE_NAME = `pmp-study-pro-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `pmp-study-pro-runtime-v${CACHE_VERSION}`;

// Maximum age for runtime cached items (7 days in milliseconds)
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Assets to cache on install (critical for offline functionality)
const STATIC_ASSETS = [
	'/pmp_application/',
	'/pmp_application/dashboard',
	'/pmp_application/study',
	'/pmp_application/flashcards',
	'/pmp_application/practice',
	'/pmp_application/formulas',
];

// Data files to cache
const DATA_FILES = [
	'/pmp_application/data/flashcards.json',
	'/pmp_application/data/testbank.json',
	'/pmp_application/data/formulas.json',
	'/pmp_application/data/study.json',
];

// =============================================================================
// SECURITY HELPERS
// =============================================================================

/**
 * Check if a request should be cached
 * SECURITY: Only cache same-origin, GET requests with successful responses
 */
function shouldCache(request: Request, response: Response): boolean {
	// Only cache GET requests
	if (request.method !== 'GET') {
		return false;
	}

	// Only cache same-origin requests
	if (!request.url.startsWith(self.location.origin)) {
		return false;
	}

	// Only cache successful responses
	if (!response || response.status !== 200) {
		return false;
	}

	// Only cache basic responses (same-origin)
	if (response.type !== 'basic') {
		return false;
	}

	return true;
}

/**
 * Clean up expired entries from runtime cache
 * SECURITY: Prevents serving stale/vulnerable cached content
 */
async function cleanExpiredCacheEntries(): Promise<void> {
	try {
		const cache = await caches.open(RUNTIME_CACHE);
		const requests = await cache.keys();
		const now = Date.now();

		for (const request of requests) {
			const response = await cache.match(request);
			if (response) {
				const dateHeader = response.headers.get('date');
				if (dateHeader) {
					const cacheTime = new Date(dateHeader).getTime();
					if (now - cacheTime > CACHE_MAX_AGE_MS) {
						await cache.delete(request);
					}
				}
			}
		}
	} catch (error) {
		console.error('Failed to clean expired cache entries:', error);
	}
}

// =============================================================================
// SERVICE WORKER LIFECYCLE EVENTS
// =============================================================================

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log(`[SW] Installing cache version: ${CACHE_VERSION}`);
				return cache.addAll([...STATIC_ASSETS, ...DATA_FILES]);
			})
			.then(() => {
				// Skip waiting to activate immediately
				// SECURITY: Ensures security updates are applied quickly
				return self.skipWaiting();
			})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				// SECURITY: Delete ALL old cache versions to prevent serving vulnerable code
				return Promise.all(
					cacheNames
						.filter((name) => {
							// Keep only current version caches
							return name.startsWith('pmp-study-pro-') && 
								name !== CACHE_NAME && 
								name !== RUNTIME_CACHE;
						})
						.map((name) => {
							console.log(`[SW] Deleting old cache: ${name}`);
							return caches.delete(name);
						})
				);
			})
			.then(() => {
				// Clean expired runtime cache entries
				return cleanExpiredCacheEntries();
			})
			.then(() => {
				// Take control of all pages immediately
				// SECURITY: Ensures all pages get the latest SW with security fixes
				return self.clients.claim();
			})
	);
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event: FetchEvent) => {
	// Skip non-GET requests
	if (event.request.method !== 'GET') {
		return;
	}

	// SECURITY: Skip cross-origin requests - never cache third-party content
	if (!event.request.url.startsWith(self.location.origin)) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			// Return cached version if available
			if (cachedResponse) {
				// For navigation requests, use stale-while-revalidate strategy
				// This ensures users eventually get updates even when offline
				if (event.request.mode === 'navigate') {
					// Trigger background update
					fetch(event.request).then((response) => {
						if (shouldCache(event.request, response)) {
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(event.request, response.clone());
							});
						}
					}).catch(() => {
						// Network failed, cached version will be used
					});
				}
				return cachedResponse;
			}

			// Otherwise fetch from network
			return fetch(event.request)
				.then((response) => {
					// SECURITY: Only cache safe responses
					if (!shouldCache(event.request, response)) {
						return response;
					}

					// Clone the response
					const responseToCache = response.clone();

					// Cache the response
					caches.open(RUNTIME_CACHE).then((cache) => {
						cache.put(event.request, responseToCache);
					});

					return response;
				})
				.catch(() => {
					// If network fails and it's a navigation request, return offline page
					if (event.request.mode === 'navigate') {
						return caches.match('/pmp_application/') as Promise<Response>;
					}
					// Return undefined for non-navigation requests that fail
					return undefined as unknown as Response;
				});
		})
	);
});

// Message event - handle commands from the main thread
self.addEventListener('message', (event: MessageEvent) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	
	if (event.data && event.data.type === 'GET_VERSION') {
		event.ports[0]?.postMessage({
			version: CACHE_VERSION,
			buildDate: BUILD_DATE,
		});
	}
	
	// SECURITY: Allow forcing cache clear from main thread
	if (event.data && event.data.type === 'CLEAR_CACHE') {
		caches.keys().then((names) => {
			Promise.all(names.map((name) => caches.delete(name))).then(() => {
				event.ports[0]?.postMessage({ success: true });
			});
		});
	}
});

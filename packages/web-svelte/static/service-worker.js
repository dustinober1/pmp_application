const CACHE_NAME = 'pmp-study-pro-v1';
const RUNTIME_CACHE = 'pmp-study-pro-runtime-v1';

// Assets to cache on install
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

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				return cache.addAll([...STATIC_ASSETS, ...DATA_FILES]);
			})
			.then(() => {
				// Skip waiting to activate immediately
				return self.skipWaiting();
			})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
						.map((name) => caches.delete(name))
				);
			})
			.then(() => {
				// Take control of all pages immediately
				return self.clients.claim();
			})
	);
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
	// Skip non-GET requests
	if (event.request.method !== 'GET') {
		return;
	}

	// Skip cross-origin requests
	if (!event.request.url.startsWith(self.location.origin)) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			// Return cached version if available
			if (cachedResponse) {
				return cachedResponse;
			}

			// Otherwise fetch from network
			return fetch(event.request)
				.then((response) => {
					// Don't cache non-successful responses
					if (!response || response.status !== 200 || response.type !== 'basic') {
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
						return caches.match('/pmp_application/');
					}
				})
		})
	);
});

const CACHE = 'infinite-canvas-v1';
const ASSETS = [
	'./',
	'./index.html',
	'./manifest.json',
	'./icon-192.png',
	'./icon-512.png',
];

// Install: cache all assets
self.addEventListener('install', e => {
	e.waitUntil(
		caches.open(CACHE).then(cache => cache.addAll(ASSETS.filter(a => !a.endsWith('.png'))))
	);
	self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
	e.waitUntil(
		caches.keys().then(keys =>
			Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
		)
	);
	self.clients.claim();
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', e => {
	e.respondWith(
		caches.match(e.request).then(cached => {
			if (cached) return cached;
			return fetch(e.request).then(response => {
				// Cache successful GET requests
				if (e.request.method === 'GET' && response.status === 200) {
					const clone = response.clone();
					caches.open(CACHE).then(cache => cache.put(e.request, clone));
				}
				return response;
			}).catch(() => caches.match('./index.html'));
		})
	);
});

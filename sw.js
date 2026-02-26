const CACHE = 'royman-draw-v2';
const ASSETS = [
	'./',
	'./index.html',
	'./manifest.json',
	'./icon-192.png',
	'./icon-512.png',
];

// Install: cache all assets
// Do NOT call skipWaiting() here — wait for user to confirm the reload
self.addEventListener('install', e => {
	e.waitUntil(
		caches.open(CACHE).then(cache => cache.addAll(ASSETS))
	);
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
				if (e.request.method === 'GET' && response.status === 200) {
					const clone = response.clone();
					caches.open(CACHE).then(cache => cache.put(e.request, clone));
				}
				return response;
			}).catch(() => caches.match('./index.html'));
		})
	);
});

// User clicked "Reload" in the update banner → activate the waiting SW
self.addEventListener('message', e => {
	if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener("activate", function(e) {
	e.waitFor(
		caches.keys().then(keys => Promise.all(
			keys.map(key => caches.delete(key)
		)))
	)
});

async function networkWithCacheFallback(fetchEvent) {
	let cache = await caches.open('DynamicCache');

	try {
		let response = await fetch(fetchEvent.request);
		cache.put(fetchEvent.request, response.clone());
		return response;
	}
	catch(_) {
		return await caches.match(fetchEvent.request);
	}
}

self.addEventListener('fetch', function(event) {
	event.respondWith(networkWithCacheFallback(event));
});

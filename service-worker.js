// Increment this to force an update when you change cached files.
const CACHE_NAME = "hello-pwa-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Cache-first strategy for this tiny demo.
self.addEventListener("fetch", (event) => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    const resp = await fetch(event.request);
    const url = new URL(event.request.url);

    // Only cache same-origin GETs.
    if (event.request.method === "GET" && url.origin === self.location.origin) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, resp.clone());
    }
    return resp;
  })());
});

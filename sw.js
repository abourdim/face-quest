const CACHE_NAME = "face-verify-microbit-multisample-v2";
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./logo.svg",
  "./app.js",
  "./ble_microbit.js",
  "./manifest.webmanifest",
  "./sw.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);

    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (req.method === "GET" && url.origin === location.origin && res.ok) {
        // Avoid caching huge model weight files.
        const isModel = url.pathname.includes("/models/") || url.pathname.endsWith(".bin");
        if (!isModel) cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      if (req.mode === "navigate") {
        const fallback = await cache.match("./index.html");
        if (fallback) return fallback;
      }
      throw e;
    }
  })());
});

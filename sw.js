/* FireWatch service worker — offline app shell caching.
   Bump CACHE when you deploy a new index.html so users get the update. */
const CACHE = "firewatch-v5";

// Files that make up the offline app shell.
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

// Install: pre-cache the shell so the app opens with no network.
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {}))
  );
});

// Activate: drop old caches.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Live data hosts that must always hit the network (never cached/offline-served).
function isLiveData(url) {
  return url.includes("firms.modaps")     // NASA fire data
      || url.includes("open-meteo")        // weather
      || url.includes("api.telegram")      // telegram
      || url.includes("workers.dev")       // registration worker
      || url.includes("googleapis")        // google fonts (let browser handle)
      || url.includes("gstatic");
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = req.url;

  if (isLiveData(url)) return; // don't intercept; goes straight to network

  // Navigation (opening the app): network-first, fall back to cached shell.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(req, copy).catch(() => {}));
          return r;
        })
        .catch(() =>
          caches.match(req).then((m) => m || caches.match("./index.html") || caches.match("./"))
        )
    );
    return;
  }

  // Other same-origin assets: cache-first, then network (and cache what we fetch).
  e.respondWith(
    caches.match(req).then(
      (m) =>
        m ||
        fetch(req)
          .then((r) => {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put(req, copy).catch(() => {}));
            return r;
          })
          .catch(() => m)
    )
  );
});

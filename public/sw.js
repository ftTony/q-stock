/* Minimal offline shell for installed PWA.
 * Never precache HTML navigations — locale/URL changes (e.g. /en → /) would
 * serve stale markup against new JS and trigger React hydration #418.
 * Do NOT cache-first /_next/* — chunk URLs must always hit network.
 */
const CACHE = "q-stock-shell-v5";
const PRECACHE = [
  "/manifest.webmanifest",
  "/logo.png",
  "/logo-cn.png",
  "/logo-en.png",
  "/favicon-16.png",
  "/favicon-32.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // App Router / Turbopack / webpack — always hit network.
  if (url.pathname.startsWith("/_next/")) return;

  // Navigations: network-only (no HTML cache) so locale routing stays consistent.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/manifest.webmanifest").then(() =>
        new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
      )),
    );
    return;
  }

  // Cache-first only for static brand assets (not JS/CSS bundles).
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|webmanifest)$/i)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
  }
});

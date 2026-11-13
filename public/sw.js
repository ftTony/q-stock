/* Minimal offline shell for installed PWA.
 * Never precache HTML navigations — locale/URL changes (e.g. /en → /) would
 * serve stale markup against new JS and trigger React hydration #418.
 * JS under /_next/* stays network-only. CSS under /_next/static/ is
 * network-first + cache so the last visit's styles survive offline.
 */
const CACHE = "q-stock-shell-v8";
const STYLE_CACHE = "q-stock-styles-v1";
const STYLE_CACHE_MAX = 24;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [
  OFFLINE_URL,
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
  const keep = new Set([CACHE, STYLE_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

function offlineResponse() {
  return caches.match(OFFLINE_URL).then(
    (hit) =>
      hit ||
      new Response(
        "<!DOCTYPE html><html><head><meta charset=utf-8><title>Offline</title></head><body><p>Offline</p><p><a href='/'>Home</a></p></body></html>",
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      ),
  );
}

async function putStyle(req, res) {
  if (!res || !res.ok) return;
  const cache = await caches.open(STYLE_CACHE);
  await cache.put(req, res.clone());
  const keys = await cache.keys();
  if (keys.length <= STYLE_CACHE_MAX) return;
  const drop = keys.length - STYLE_CACHE_MAX;
  for (let i = 0; i < drop; i++) await cache.delete(keys[i]);
}

async function cacheStyleUrls(urls) {
  const list = (urls || [])
    .filter((u) => typeof u === "string")
    .map((u) => {
      try {
        return new URL(u, self.location.origin);
      } catch {
        return null;
      }
    })
    .filter((u) => u && u.origin === self.location.origin)
    .filter((u) => u.pathname.startsWith("/_next/static/") && /\.css$/i.test(u.pathname));

  await Promise.all(
    list.map(async (u) => {
      try {
        const res = await fetch(u.href, { credentials: "same-origin" });
        await putStyle(u.href, res);
      } catch {
        /* ignore */
      }
    }),
  );
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_STYLES") return;
  event.waitUntil(cacheStyleUrls(data.urls));
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Last-visit CSS: network-first, fall back to cache when offline.
  if (url.pathname.startsWith("/_next/static/") && /\.css$/i.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          void putStyle(req, res);
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || Response.error())),
    );
    return;
  }

  // Other App Router / Turbopack / webpack assets — always hit network.
  if (url.pathname.startsWith("/_next/")) return;

  // Navigations: network-only (no HTML cache) so locale routing stays consistent.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => offlineResponse()));
    return;
  }

  // Cache-first only for static brand assets (not JS/CSS bundles).
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|webmanifest|html)$/i)) {
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

self.addEventListener("push", (event) => {
  let data = { title: "Qianli Gu", body: "", url: "/watchlist" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = {
        title: typeof parsed.title === "string" ? parsed.title : data.title,
        body: typeof parsed.body === "string" ? parsed.body : "",
        url: typeof parsed.url === "string" ? parsed.url : "/watchlist",
      };
    }
  } catch {
    try {
      const text = event.data?.text();
      if (text) data.body = text;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data && event.notification.data.url;
  const path = typeof raw === "string" && raw.startsWith("/") ? raw : "/watchlist";
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          if (typeof client.navigate === "function") {
            return client.navigate(target).then((c) => (c && c.focus ? c.focus() : client.focus()));
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    }),
  );
});

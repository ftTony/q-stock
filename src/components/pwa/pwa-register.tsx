"use client";

import { useEffect } from "react";

function collectStylesheetUrls(): string[] {
  return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((el) => (el as HTMLLinkElement).href)
    .filter((href) => {
      try {
        const u = new URL(href);
        return (
          u.origin === window.location.origin &&
          u.pathname.startsWith("/_next/static/") &&
          u.pathname.endsWith(".css")
        );
      } catch {
        return false;
      }
    });
}

/** Ask the SW to remember stylesheets from this visit (offline CSS fallback). */
function cacheVisitStyles(reg: ServiceWorkerRegistration) {
  const urls = collectStylesheetUrls();
  if (!urls.length) return;
  const worker = reg.active ?? navigator.serviceWorker.controller;
  worker?.postMessage({ type: "CACHE_STYLES", urls });
}

async function unregisterAll() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
}

/** Registers the service worker once on the client (PWA). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Dev + Turbopack: update() often throws
    // "Failed to update a ServiceWorker … script ('Unknown'): Not found".
    // Keep SW for production only; clear leftover local registrations in dev.
    if (process.env.NODE_ENV !== "production") {
      void unregisterAll().catch(() => {
        /* ignore */
      });
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          void reg.update().catch((err) => {
            console.warn("[pwa] sw update failed:", err);
          });
          cacheVisitStyles(reg);
        })
        .catch((err) => {
          console.warn("[pwa] sw register failed:", err);
        });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}

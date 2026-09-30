"use client";

import { useEffect } from "react";

/** Registers the service worker once on the client (PWA). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => {
      // Force update so cache-name bumps (e.g. v3 → v4) take effect immediately.
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          void reg.update();
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

"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function sendPageview(measurementId: string, url: string) {
  if (typeof window.gtag !== "function") return;
  window.gtag("config", measurementId, { page_path: url });
}

/** SPA route changes → GA4 page_view (gtag config with page_path). */
function GaRouteListener({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    sendPageview(measurementId, url);
  }, [measurementId, pathname, searchParams]);

  return null;
}

/**
 * Google Analytics 4 (gtag). Renders nothing when `measurementId` is empty.
 * Wrap in `<Suspense>` at the call site if required by the parent tree.
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <GaRouteListener measurementId={measurementId} />
    </>
  );
}

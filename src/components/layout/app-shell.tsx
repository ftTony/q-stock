"use client";

import { usePathname } from "@/i18n/routing";
import { ConsoleWelcome } from "@/components/brand/console-welcome";
import { MainAppShell } from "@/components/layout/main-app-shell";
import { MarketingAppShell } from "@/components/layout/marketing-app-shell";

function isMarketingPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/disclaimer") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/tools") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/advanced-quotes") ||
    pathname.startsWith("/lab")
  );
}

function isAuthPath(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth/")
  );
}

/** Product chrome routes (sidebar + quote ticker). */
function isAppPath(pathname: string) {
  const prefixes = [
    "/markets",
    "/watchlist",
    "/portfolio",
    "/alerts",
    "/review",
    "/analysis",
    "/symbol",
    "/multi-chart",
    "/strategies",
    "/settings",
    "/mine",
  ];
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Route shell by path. MainAppShell is a static import — Turbopack `next/dynamic`
 * entry chunks for the shell have been flaky after HMR (Failed to load chunk).
 * Marketing/auth still do not *render* the product chrome.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  let body: React.ReactNode;
  if (isAuthPath(pathname)) {
    body = (
      <div className="min-h-dvh">
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
          {children}
        </div>
      </div>
    );
  } else if (isMarketingPath(pathname) || !isAppPath(pathname)) {
    body = <MarketingAppShell>{children}</MarketingAppShell>;
  } else {
    body = <MainAppShell>{children}</MainAppShell>;
  }

  return (
    <>
      <ConsoleWelcome />
      {body}
    </>
  );
}

"use client";

import dynamic from "next/dynamic";
import { usePathname } from "@/i18n/routing";
import { ConsoleWelcome } from "@/components/brand/console-welcome";
import { MarketingAppShell } from "@/components/layout/marketing-app-shell";

const MainAppShell = dynamic(
  () =>
    import("@/components/layout/main-app-shell").then((m) => ({
      default: m.MainAppShell,
    })),
  { ssr: true },
);

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
    pathname.startsWith("/advanced-quotes")
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
  ];
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Route shell by path so marketing/auth never pull sidebar + quote socket
 * into the initial JS graph. Unknown paths (404) use the same marketing
 * header as the homepage.
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

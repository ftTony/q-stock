"use client";

import dynamic from "next/dynamic";
import { usePathname } from "@/i18n/routing";
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
    pathname.startsWith("/disclaimer") ||
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

/**
 * Route shell by path so marketing/auth never pull sidebar + quote socket
 * into the initial JS graph.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isAuthPath(pathname)) {
    return (
      <div className="min-h-dvh">
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
          {children}
        </div>
      </div>
    );
  }

  if (isMarketingPath(pathname)) {
    return <MarketingAppShell>{children}</MarketingAppShell>;
  }

  return <MainAppShell>{children}</MainAppShell>;
}

"use client";

import dynamic from "next/dynamic";
import { usePathname } from "@/i18n/routing";
import { ConsoleWelcome } from "@/components/brand/console-welcome";

/**
 * 营销 / 产品壳按路由动态加载，避免官网首屏把 MainAppShell
 * （侧栏、行情条、设置弹窗等）打进同一客户端图。
 *
 * 若 Turbopack HMR 偶发 chunk 失败：硬刷新即可；生产构建无此问题。
 */
const MarketingAppShell = dynamic(
  () =>
    import("@/components/layout/marketing-app-shell").then((m) => ({
      default: m.MarketingAppShell,
    })),
  { ssr: true },
);

/**
 * No `loading:` UI here — next/dynamic’s loading slot replaces the whole
 * component (and its `{children}`). That briefly unmounted ScopedMessages’
 * NextIntlClientProvider and caused recoverable
 * “No intl context found” on SymbolPageClient during marketing → app soft-nav.
 */
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

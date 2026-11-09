"use client";

import dynamic from "next/dynamic";
import { usePathname } from "@/i18n/routing";
import { ConsoleWelcome } from "@/components/brand/console-welcome";
import { InlineLoading } from "@/components/ui/panel-skeleton";

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

const skel =
  "animate-pulse rounded-sm border border-[var(--border)] bg-[var(--panel)]";

const MainAppShell = dynamic(
  () =>
    import("@/components/layout/main-app-shell").then((m) => ({
      default: m.MainAppShell,
    })),
  {
    ssr: true,
    // Marketing → app chunk gap (pathname already flipped; old marketing UI gone).
    loading: () => (
      <div className="flex min-h-dvh flex-col bg-[var(--symbol-shell-bg,var(--background))]">
        <div className="h-10 shrink-0 border-b border-[var(--border)]" />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--border)] px-3">
            <div className={`${skel} h-4 w-16`} />
            <div className={`${skel} h-5 w-24`} />
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[var(--panel)]">
            <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 shadow-sm">
              <InlineLoading />
            </div>
          </div>
        </div>
      </div>
    ),
  },
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

import { PanelSkeleton } from "@/components/ui/panel-skeleton";

/** Keep in sync with `SIDEBAR_WIDTH_COLLAPSED` in app-sidebar (avoid importing that module). */
const SIDEBAR_W = 56;

const skel =
  "animate-pulse rounded-sm border border-[var(--wb-hairline,var(--border))] bg-[var(--wb-canvas,var(--panel))]";

/**
 * Chunk bridge while `MainAppShell` dynamic-imports.
 * Prefer parchment skeleton over a centered spinner — markets/route `loading.tsx`
 * already uses the same language; a spinner made the shell gap feel like a blank wait.
 */
export function MainAppShellFallback() {
  return (
    <div
      className="wb-shell min-h-dvh bg-[var(--background)] lg:flex"
      style={{ ["--sidebar-w" as string]: `${SIDEBAR_W}px` }}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        className="hidden shrink-0 border-r border-[var(--border)] bg-[var(--background)] lg:flex lg:h-dvh lg:flex-col lg:items-center lg:gap-3 lg:py-3"
        style={{ width: SIDEBAR_W }}
        aria-hidden
      >
        <div className={`${skel} h-7 w-7`} />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${skel} h-6 w-6`} />
        ))}
      </div>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 box-border flex h-[var(--wb-topbar-h,40px)] shrink-0 items-center border-b border-[var(--border)] bg-[var(--background)] px-3 sm:px-5 lg:px-6">
          <div className={`${skel} h-4 w-28`} />
          <div className={`${skel} ml-3 hidden h-4 w-20 sm:block`} />
          <div className={`${skel} ml-auto h-6 w-6`} />
        </header>

        <main className="w-full flex-1 px-0 py-4 lg:px-4 lg:py-5 xl:px-6">
          <div className="space-y-5 px-3 lg:px-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-2">
                <div className={`${skel} h-7 w-40`} />
                <div className={`${skel} h-3 w-56`} />
              </div>
              <div className={`${skel} h-9 w-64`} />
            </div>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <PanelSkeleton key={i} rows={2} />
              ))}
            </div>
            <div className="grid gap-3 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <PanelSkeleton key={i} rows={5} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

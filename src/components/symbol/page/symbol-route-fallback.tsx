import { ChartLoadingOverlay } from "@/components/ui/panel-skeleton";

/** Visible on parchment — `--surface-2` equals shell bg in light mode, so unused. */
const skel =
  "animate-pulse rounded-sm border border-[var(--wb-hairline,var(--border))] bg-[var(--wb-canvas,var(--panel))]";

/**
 * Soft-nav bridge while `/symbol/...` RSC resolves.
 *
 * Why this exists: homepage uses MarketingAppShell; symbol uses MainAppShell.
 * Pathname flips immediately, so the marketing page unmounts before quote/candles
 * RSC arrives — without this, users only see empty parchment + white panel.
 */
export function SymbolRouteFallback() {
  return (
    <div
      className="aw flex h-full min-h-[70dvh] w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--symbol-shell-bg,var(--background))]"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--symbol-shell-bg,var(--background))] px-3">
        <div className={`${skel} h-4 w-16`} />
        <div className={`${skel} h-5 w-24`} />
        <div className={`${skel} h-4 w-14`} />
        <div className={`${skel} ml-auto hidden h-4 w-28 sm:block`} />
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col border-r border-[var(--aw-hairline,var(--border))] bg-[var(--panel,var(--surface))]">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] px-2">
            <div className={`${skel} h-5 w-10`} />
            <div className={`${skel} h-5 w-10`} />
            <div className={`${skel} h-5 w-10`} />
          </div>
          <div className="relative min-h-0 flex-1">
            <ChartLoadingOverlay placement="center" />
          </div>
        </div>

        <aside className="hidden w-[min(360px,32vw)] shrink-0 bg-[var(--symbol-shell-bg,var(--background))] lg:block">
          <div className="space-y-3 p-3">
            <div className={`${skel} h-4 w-24`} />
            <div className={`${skel} h-24 w-full`} />
            <div className={`${skel} h-24 w-full`} />
            <div className={`${skel} h-40 w-full`} />
          </div>
        </aside>
      </div>
    </div>
  );
}

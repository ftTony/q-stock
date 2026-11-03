"use client";

import { TopBarActions } from "@/components/layout/topbar-actions";
import { TopbarIndexTicker } from "@/components/layout/topbar-index-ticker";
import { MarketCredentialsPrompt } from "@/components/settings/market-credentials-prompt";

/**
 * Desktop-only chrome above the quote bar.
 * Sits beside the watchlist head so Logo | 自选 | indices share one hairline.
 */
export function SymbolWorkbenchTopbar() {
  return (
    <div className="aw-workbench-topbar box-border hidden h-[var(--wb-topbar-h,40px)] shrink-0 items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas)] px-2 lg:flex">
      <div className="min-w-0 flex-1">
        <TopbarIndexTicker />
      </div>
      <MarketCredentialsPrompt inline />
      <div className="relative z-10 ml-auto flex shrink-0 items-center bg-[var(--aw-canvas)] pl-1.5">
        <TopBarActions showMarketStatus={false} showTheme showLanguage />
      </div>
    </div>
  );
}

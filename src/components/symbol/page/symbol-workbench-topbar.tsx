"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TopBarActions } from "@/components/layout/topbar-actions";
import { TopbarIndexTicker } from "@/components/layout/topbar-index-ticker";
import { MarketCredentialsPrompt } from "@/components/settings/market-credentials-prompt";
import { SymbolLayoutSettingsModal } from "@/components/symbol/page/symbol-layout-settings-modal";
import type {
  LayoutMode,
  LayoutModuleKey,
  SymbolLayoutPrefs,
} from "@/components/symbol/hooks/use-symbol-layout-prefs";

type Props = {
  layoutPrefs: SymbolLayoutPrefs;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onModuleChange: (key: LayoutModuleKey, value: boolean) => void;
  onResetLayout: () => void;
};

/**
 * Desktop-only chrome above the quote bar.
 * Sits beside the watchlist head so Logo | 自选 | indices share one hairline.
 */
export function SymbolWorkbenchTopbar({
  layoutPrefs,
  onLayoutModeChange,
  onModuleChange,
  onResetLayout,
}: Props) {
  const t = useTranslations("symbolLayout");
  const [layoutOpen, setLayoutOpen] = useState(false);

  return (
    <>
      <div className="aw-workbench-topbar box-border hidden h-[var(--wb-topbar-h,40px)] shrink-0 items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas)] px-2 lg:flex">
        <div className="min-w-0 flex-1">
          <TopbarIndexTicker />
        </div>
        <MarketCredentialsPrompt inline />
        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-0.5 bg-[var(--aw-canvas)] pl-1.5">
          <button
            type="button"
            title={t("open")}
            aria-label={t("open")}
            aria-haspopup="dialog"
            aria-expanded={layoutOpen}
            onClick={() => setLayoutOpen(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none text-[var(--aw-ink-muted-80)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3.5" y="4.5" width="7" height="15" rx="0.5" />
              <rect x="13.5" y="4.5" width="7" height="9" rx="0.5" />
              <rect x="13.5" y="15.5" width="7" height="4" rx="0.5" />
            </svg>
          </button>
          <TopBarActions showMarketStatus={false} showTheme showLanguage />
        </div>
      </div>
      <SymbolLayoutSettingsModal
        open={layoutOpen}
        onClose={() => setLayoutOpen(false)}
        prefs={layoutPrefs}
        onLayoutModeChange={onLayoutModeChange}
        onModuleChange={onModuleChange}
        onReset={onResetLayout}
      />
    </>
  );
}

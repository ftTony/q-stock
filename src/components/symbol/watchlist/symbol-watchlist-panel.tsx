"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import {
  IconWatchlistCollapse,
  IconSettingsGear,
} from "@/components/symbol/watchlist/watchlist-toggle-icons";
import { SymbolWatchlistSettingsModal } from "@/components/symbol/watchlist/symbol-watchlist-settings-modal";
import { SymbolWatchlistVirtualList } from "@/components/symbol/watchlist/symbol-watchlist-virtual-list";
import { EmptyStateBlock } from "@/components/symbol/shared/symbol-empty-art";
import { SymbolWatchlistPaneSkeleton } from "@/components/symbol/watchlist/symbol-watchlist-pane-skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { useWatchlist } from "@/hooks/query/use-watchlist";
import { queryKeys } from "@/lib/query/keys";
import type { AssetType } from "@/lib/types";

type Props = {
  currentSymbol: string;
  currentAssetType: AssetType;
  onCollapse?: () => void;
  /** False on H5 (pane is CSS-hidden) so we skip quote polling on small hosts. */
  quotesEnabled?: boolean;
};

/** Futu-style left watchlist column (名称代码 / 最新价 / 涨跌幅). */
export function SymbolWatchlistPanel({
  currentSymbol,
  currentAssetType,
  onCollapse,
  quotesEnabled = true,
}: Props) {
  const t = useTranslations("symbol");
  const tMarket = useTranslations("market");
  const tCommon = useTranslations("common");
  const tWatch = useTranslations("watchlist");
  const mounted = useMounted();
  const { status } = useSession();
  const qc = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const authenticated = mounted && status === "authenticated";
  const watchlist = useWatchlist({
    quotes: true,
    enabled: authenticated && quotesEnabled,
    refetchInterval: authenticated && quotesEnabled ? 45_000 : false,
  });

  const rows = watchlist.data?.items ?? [];
  const loading = watchlist.isLoading;
  const error =
    watchlist.error instanceof Error
      ? watchlist.error.message
      : watchlist.error
        ? tCommon("error")
        : null;

  const onChanged = useCallback(() => {
    void qc.invalidateQueries({ queryKey: queryKeys.watchlist.all });
  }, [qc]);

  return (
    <aside className="aw-watchlist-pane flex min-h-0 flex-col overflow-hidden bg-[var(--aw-canvas)]">
      <div className="aw-watchlist-head flex shrink-0 items-center justify-between gap-1 border-b border-[var(--aw-hairline,var(--border))] px-2.5">
        <span className="text-[13px] font-semibold tracking-tight text-[var(--foreground)]">
          {t("watchlistDock")}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="aw-watchlist-collapse-btn"
            title={t("watchlistSettings")}
            aria-label={t("watchlistSettings")}
            onClick={() => setSettingsOpen(true)}
          >
            <IconSettingsGear className="h-4 w-4" />
          </button>
          {onCollapse ? (
            <button
              type="button"
              className="aw-watchlist-collapse-btn"
              aria-label={t("watchlistCollapse")}
              title={t("watchlistCollapse")}
              onClick={onCollapse}
            >
              <IconWatchlistCollapse className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <SymbolWatchlistSettingsModal
        open={settingsOpen}
        onClose={closeSettings}
        onChanged={onChanged}
      />

      <div
        className="aw-watchlist-cols grid shrink-0 items-center border-b border-[var(--aw-hairline,var(--border))] px-2 text-[var(--muted)]"
        aria-hidden
      >
        <span>{t("watchlistColName")}</span>
        <span className="text-right">{t("watchlistColPrice")}</span>
        <span className="text-right">{t("watchlistColChg")}</span>
      </div>

      {!mounted || status === "loading" ? (
        <SymbolWatchlistPaneSkeleton label={tCommon("loading")} />
      ) : status === "unauthenticated" ? (
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-6">
          <AuthLoginGate
            compact
            title={tWatch("loginTitle")}
            body={tWatch("loginBody")}
            hint={tWatch("loginHint")}
          />
        </div>
      ) : !quotesEnabled || (loading && rows.length === 0) ? (
        // quotesEnabled waits on useMinWidth after hydration — keep row skels, not empty.
        <SymbolWatchlistPaneSkeleton label={tCommon("loading")} />
      ) : error ? (
        <p className="aw-caption flex flex-1 items-center justify-center px-3 py-8 text-center text-[var(--down)]">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <EmptyStateBlock art="watchlist" label={tMarket("watchlistEmpty")}>
          <Link
            href="/markets"
            className="aw-text-link text-[12px]"
          >
            {tMarket("viewAll")}
          </Link>
        </EmptyStateBlock>
      ) : (
        <SymbolWatchlistVirtualList
          rows={rows}
          currentSymbol={currentSymbol}
          currentAssetType={currentAssetType}
        />
      )}
    </aside>
  );
}

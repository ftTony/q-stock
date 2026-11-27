"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import {
  IconWatchlistCollapse,
  IconSettingsGear,
} from "@/components/symbol/watchlist/watchlist-toggle-icons";
import { SymbolWatchlistSettingsModal } from "@/components/symbol/watchlist/symbol-watchlist-settings-modal";
import { SymbolWatchlistSortCols } from "@/components/symbol/watchlist/symbol-watchlist-sort-cols";
import { SymbolWatchlistVirtualList } from "@/components/symbol/watchlist/symbol-watchlist-virtual-list";
import {
  sortWatchlistRows,
  type WatchlistSortState,
} from "@/components/symbol/watchlist/sort-watchlist-rows";
import { useWatchlistWithLiveQuotes } from "@/components/symbol/watchlist/use-watchlist-live-quotes";
import { EmptyStateBlock } from "@/components/symbol/shared/symbol-empty-art";
import { SymbolWatchlistPaneSkeleton } from "@/components/symbol/watchlist/symbol-watchlist-pane-skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { queryKeys } from "@/lib/query/keys";
import type { AssetType } from "@/lib/types";

type Props = {
  currentSymbol: string;
  currentAssetType: AssetType;
  onCollapse?: () => void;
  /** False on H5 (pane is CSS-hidden) so we skip quote polling on small hosts. */
  quotesEnabled?: boolean;
};

/** Futu-style left watchlist column (ƴ / ¼ / ǵ). */
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
  const [sort, setSort] = useState<WatchlistSortState>(null);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const authenticated = mounted && status === "authenticated";
  const live = authenticated && quotesEnabled;
  const watchlist = useWatchlistWithLiveQuotes(live);

  const rows = watchlist.data?.items ?? [];
  const sortedRows = useMemo(
    () => sortWatchlistRows(rows, sort),
    [rows, sort],
  );
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
        {/* Plain dock title — not a chip/button shell. */}
        <h2 className="aw-watchlist-title">{t("watchlistDock")}</h2>
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

      <SymbolWatchlistSortCols
        sort={sort}
        onSortChange={setSort}
        cols={[
          { key: "name", label: t("watchlistColName"), align: "left" },
          { key: "price", label: t("watchlistColPrice"), align: "right" },
          { key: "chg", label: t("watchlistColChg"), align: "right" },
        ]}
      />

      {sortedRows.length > 0 ? (
        // Prefer cached rows over auth/skeleton — ClientFetchError can briefly
        // flip session to null during soft-nav and used to flash the login gate.
        <SymbolWatchlistVirtualList
          rows={sortedRows}
          currentSymbol={currentSymbol}
          currentAssetType={currentAssetType}
        />
      ) : status === "unauthenticated" ? (
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-6">
          <AuthLoginGate
            compact
            title={tWatch("loginTitle")}
            body={tWatch("loginBody")}
            hint={tWatch("loginHint")}
          />
        </div>
      ) : !mounted || status === "loading" || loading || !quotesEnabled ? (
        // First paint / session / desktop gate with empty cache only.
        <SymbolWatchlistPaneSkeleton label={tCommon("loading")} />
      ) : error ? (
        <p className="aw-caption flex flex-1 items-center justify-center px-3 py-8 text-center text-[var(--down)]">
          {error}
        </p>
      ) : (
        <EmptyStateBlock art="watchlist" label={tMarket("watchlistEmpty")}>
          <Link
            href="/markets"
            className="aw-text-link text-[12px]"
          >
            {tMarket("viewAll")}
          </Link>
        </EmptyStateBlock>
      )}
    </aside>
  );
}

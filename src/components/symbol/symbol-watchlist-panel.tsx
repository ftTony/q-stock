"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { ChangePct, PriceText } from "@/components/market/price";
import {
  IconWatchlistCollapse,
  IconSettingsGear,
} from "@/components/symbol/watchlist-toggle-icons";
import { SymbolWatchlistSettingsModal } from "@/components/symbol/symbol-watchlist-settings-modal";
import { EmptyStateBlock } from "@/components/symbol/symbol-empty-art";
import { useWatchlist } from "@/hooks/query/use-watchlist";
import { queryKeys } from "@/lib/query/keys";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";

type Props = {
  currentSymbol: string;
  currentAssetType: AssetType;
  onCollapse?: () => void;
};

/** Futu-style left watchlist column (名称代码 / 最新价 / 涨跌幅). */
export function SymbolWatchlistPanel({
  currentSymbol,
  currentAssetType,
  onCollapse,
}: Props) {
  const t = useTranslations("symbol");
  const tMarket = useTranslations("market");
  const tCommon = useTranslations("common");
  const { status } = useSession();
  const qc = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const authenticated = status === "authenticated";
  const watchlist = useWatchlist({
    quotes: true,
    enabled: authenticated,
    refetchInterval: authenticated ? 45_000 : false,
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
      <div className="aw-watchlist-head flex h-10 min-h-10 shrink-0 items-center justify-between gap-1 border-b border-[var(--aw-hairline,var(--border))] px-2.5">
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
        className="aw-watchlist-cols grid h-8 shrink-0 items-center border-b border-[var(--aw-hairline,var(--border))] px-2 text-[11px] text-[var(--muted)]"
        aria-hidden
      >
        <span>{t("watchlistColName")}</span>
        <span className="text-right">{t("watchlistColPrice")}</span>
        <span className="text-right">{t("watchlistColChg")}</span>
      </div>

      <div className="qt-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        {status === "loading" ? (
          <p className="aw-caption flex flex-1 items-center justify-center px-3 py-8 text-center">
            {tCommon("loading")}
          </p>
        ) : status === "unauthenticated" ? (
          <div className="flex flex-1 flex-col items-center justify-center px-3 py-6">
            <AuthLoginGate compact />
          </div>
        ) : loading && rows.length === 0 ? (
          <p className="aw-caption flex flex-1 items-center justify-center px-3 py-8 text-center">
            {tCommon("loading")}
          </p>
        ) : error ? (
          <p className="aw-caption flex flex-1 items-center justify-center px-3 py-8 text-center text-[var(--down)]">
            {error}
          </p>
        ) : rows.length === 0 ? (
          <EmptyStateBlock art="watchlist" label={tMarket("watchlistEmpty")} />
        ) : (
          <ul>
            {rows.map((row) => {
              const active =
                row.symbol === currentSymbol &&
                row.assetType === currentAssetType;
              const ch = row.quote?.percentChange ?? null;
              const name = displayName(
                row.symbol,
                row.assetType,
                row.quote?.name,
              );
              return (
                <li key={row.id}>
                  <Link
                    href={`/symbol/${row.assetType}/${encodeURIComponent(row.symbol)}`}
                    data-active={active}
                    className="aw-watchlist-row grid items-center gap-x-1 px-2 py-1.5 transition hover:bg-[var(--aw-parchment,var(--surface-2))]"
                    style={
                      active
                        ? {
                            background:
                              "color-mix(in srgb, var(--aw-primary) 8%, transparent)",
                          }
                        : undefined
                    }
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-semibold leading-tight text-[var(--foreground)]">
                        {name}
                      </div>
                      <div className="truncate text-[10px] leading-tight text-[var(--muted)]">
                        {row.symbol}
                      </div>
                    </div>
                    <div className="text-right text-[12px] font-medium tabular-nums leading-tight">
                      {row.quote?.price != null ? (
                        <PriceText
                          value={row.quote.price}
                          change={ch ?? undefined}
                        />
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </div>
                    <div className="text-right text-[11px] tabular-nums leading-tight">
                      {ch != null ? (
                        <ChangePct value={ch} />
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

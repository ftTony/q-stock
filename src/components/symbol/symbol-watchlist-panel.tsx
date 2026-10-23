"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { ChangePct, PriceText } from "@/components/market/price";
import {
  IconWatchlistCollapse,
  IconWatchlistManage,
} from "@/components/symbol/watchlist-toggle-icons";
import { SymbolWatchlistSettingsModal } from "@/components/symbol/symbol-watchlist-settings-modal";
import { displayName } from "@/lib/market-names";
import type { AssetType, Quote } from "@/lib/types";

type Row = {
  id: string;
  symbol: string;
  assetType: AssetType;
  quote: Quote | null;
};

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
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/watchlist?quotes=1");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || tCommon("error"));
      setRows(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("error"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    if (status !== "authenticated") return;
    void load();
    const timer = setInterval(() => void load(), 45000);
    return () => clearInterval(timer);
  }, [status, load]);

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
            <IconWatchlistManage className="h-[18px] w-[18px]" />
          </button>
          {onCollapse ? (
            <button
              type="button"
              className="aw-watchlist-collapse-btn"
              aria-label={t("watchlistCollapse")}
              title={t("watchlistCollapse")}
              onClick={onCollapse}
            >
              <IconWatchlistCollapse className="h-[18px] w-[18px]" />
            </button>
          ) : null}
        </div>
      </div>

      <SymbolWatchlistSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onChanged={() => void load()}
      />

      <div
        className="aw-watchlist-cols grid h-8 shrink-0 items-center border-b border-[var(--aw-hairline,var(--border))] px-2 text-[11px] text-[var(--muted)]"
        aria-hidden
      >
        <span>{t("watchlistColName")}</span>
        <span className="text-right">{t("watchlistColPrice")}</span>
        <span className="text-right">{t("watchlistColChg")}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain qt-scroll">
        {status === "loading" ? (
          <p className="aw-caption px-3 py-8 text-center">{tCommon("loading")}</p>
        ) : status === "unauthenticated" ? (
          <div className="px-3 py-8">
            <AuthLoginGate />
          </div>
        ) : loading && rows.length === 0 ? (
          <p className="aw-caption px-3 py-8 text-center">{tCommon("loading")}</p>
        ) : error ? (
          <p className="aw-caption px-3 py-8 text-center text-[var(--down)]">
            {error}
          </p>
        ) : rows.length === 0 ? (
          <p className="aw-caption px-3 py-8 text-center">
            {tMarket("watchlistEmpty")}
          </p>
        ) : (
          <ul>
            {rows.map((row) => {
              const active =
                row.symbol === currentSymbol &&
                row.assetType === currentAssetType;
              const ch = row.quote?.percentChange ?? null;
              const name = displayName(row.symbol, row.assetType);
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

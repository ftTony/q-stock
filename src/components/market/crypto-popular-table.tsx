"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";
import type { RankQuote } from "@/components/market/markets-types";

export function CryptoPopularTable({
  items,
  loading,
  watched,
  onToggleWatch,
  t,
}: {
  items: RankQuote[];
  loading: boolean;
  watched: Set<string>;
  onToggleWatch: (symbol: string, assetType: AssetType) => void;
  t: ReturnType<typeof useTranslations<"market">>;
}) {
  return (
    <div className="qt-panel overflow-hidden">
      <div className="overflow-x-auto qt-scroll">
        <table className="min-w-[860px] w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs tracking-wider text-[var(--muted)] uppercase">
              <th className="px-4 py-3.5 font-semibold">{t("symbol")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("price")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("change")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("volume")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("last24h")}</th>
              <th className="px-4 py-3.5 text-right font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              items.length === 0 &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-b border-[var(--border)]/70 last:border-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 animate-pulse rounded-lg bg-[var(--surface-2)]" />
                      <span className="space-y-2">
                        <span className="block h-4 w-14 animate-pulse rounded bg-[var(--surface-2)]" />
                        <span className="block h-3 w-24 animate-pulse rounded bg-[var(--surface-2)]" />
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block h-4 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block h-4 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block h-4 w-28 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block h-8 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-block h-4 w-28 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                </tr>
              ))}
            {items.map((item) => {
              const up = item.percentChange >= 0;
              const watchKey = `${item.assetType}:${item.symbol}`;
              const isWatched = watched.has(watchKey);
              const range =
                item.high && item.low
                  ? `${item.low.toFixed(2)} – ${item.high.toFixed(2)}`
                  : "-";
              return (
                <tr
                  key={item.symbol}
                  className={`border-b border-[var(--border)]/70 last:border-0 hover:bg-[var(--sidebar-hover)]/60 ${
                    loading ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-xs font-bold text-[var(--brand-text)]">
                        {item.symbol.slice(0, 2)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold tracking-wide">
                          {item.symbol}
                        </span>
                        <span className="block text-xs text-[var(--muted)]">
                          {item.name || displayName(item.symbol, item.assetType)}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[15px] font-medium tabular-nums">
                    <Link href={`/symbol/${item.assetType}/${item.symbol}`}>
                      $
                      <PriceText value={item.price} change={item.percentChange} />
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[15px]">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="inline-flex items-center gap-1 font-medium"
                    >
                      <span aria-hidden>{up ? "▲" : "▼"}</span>
                      <ChangePct value={item.percentChange} />
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[var(--muted)] tabular-nums">
                    <Link href={`/symbol/${item.assetType}/${item.symbol}`}>
                      {range}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/symbol/${item.assetType}/${item.symbol}`}>
                      <Sparkline
                        open={item.open}
                        high={item.high}
                        low={item.low}
                        close={item.price}
                        up={up}
                      />
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className={`text-base ${
                          isWatched
                            ? "text-[var(--brand-text)]"
                            : "text-[var(--muted)] hover:text-[var(--brand-text)]"
                        }`}
                        title={isWatched ? t("remove") : t("addWatch")}
                        onClick={() =>
                          void onToggleWatch(item.symbol, item.assetType)
                        }
                      >
                        {isWatched ? "★" : "☆"}
                      </button>
                      <Link
                        href={`/symbol/${item.assetType}/${item.symbol}`}
                        className="qt-link-up text-sm font-bold tracking-wide hover:opacity-80"
                      >
                        {t("buy")}
                      </Link>
                      <Link
                        href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                        className="qt-link-down text-sm font-bold tracking-wide hover:opacity-80"
                      >
                        {t("sell")}
                      </Link>
                      <Link
                        href={`/symbol/${item.assetType}/${item.symbol}`}
                        className="text-[var(--muted)] hover:text-[var(--foreground)]"
                        aria-label="More"
                      >
                        ⋮
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[var(--muted)]"
                >
                  {t("unavailable")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { IconHeart } from "@/components/ui/icon-heart";
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
        <table className="min-w-[720px] w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-wider text-[var(--muted)] uppercase">
              <th className="px-4 py-3 font-medium">{t("symbol")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("price")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("change")}</th>
              <th className="px-4 py-3 font-medium">{t("volume")}</th>
              <th className="px-4 py-3 font-medium">{t("last24h")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("actions")}</th>
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
                  <td className="px-4 py-3.5">
                    <span className="space-y-1.5">
                      <span className="block h-3.5 w-14 animate-pulse rounded bg-[var(--surface-2)]" />
                      <span className="block h-3 w-24 animate-pulse rounded bg-[var(--surface-2)]" />
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-block h-3.5 w-14 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-block h-3.5 w-24 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-block h-7 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
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
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="min-w-0"
                    >
                      <span className="block text-[14px] font-semibold tracking-wide">
                        {item.symbol}
                      </span>
                      <span className="block text-xs text-[var(--muted)]">
                        {item.name ||
                          displayName(item.symbol, item.assetType)}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-[14px] font-medium tabular-nums">
                    <Link href={`/symbol/${item.assetType}/${item.symbol}`}>
                      <PriceText
                        value={item.price}
                        change={item.percentChange}
                      />
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-[14px] tabular-nums">
                    <Link href={`/symbol/${item.assetType}/${item.symbol}`}>
                      <ChangePct value={item.percentChange} />
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[var(--muted)] tabular-nums">
                    <Link href={`/symbol/${item.assetType}/${item.symbol}`}>
                      {range}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
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
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          isWatched
                            ? "text-[var(--brand-text)]"
                            : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                        }`}
                        title={isWatched ? t("remove") : t("addWatch")}
                        aria-label={isWatched ? t("remove") : t("addWatch")}
                        onClick={() =>
                          void onToggleWatch(item.symbol, item.assetType)
                        }
                      >
                        <IconHeart filled={isWatched} className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                        className="qt-btn qt-btn-ghost inline-flex h-7 items-center px-2.5 text-[12px] font-medium leading-none"
                      >
                        {t("alert")}
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

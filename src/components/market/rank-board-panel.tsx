"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";
import type { RankQuote } from "@/components/market/markets-types";

export function RankBoardPanel({
  title,
  items,
  loading,
  watched,
  onToggleWatch,
  t,
}: {
  title: string;
  items: RankQuote[];
  loading: boolean;
  watched: Set<string>;
  onToggleWatch: (symbol: string, assetType: AssetType) => void;
  t: ReturnType<typeof useTranslations<"market">>;
}) {
  return (
    <div className="qt-panel overflow-hidden">
      {title ? (
        <div className="border-b border-[var(--border)] px-3 py-2.5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
        </div>
      ) : null}
      <div className="overflow-x-auto qt-scroll">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[10px] tracking-wider text-[var(--muted)] uppercase">
              <th className="px-3 py-2 font-semibold">{t("symbol")}</th>
              <th className="px-2 py-2 font-semibold">{t("price")}</th>
              <th className="px-2 py-2 font-semibold">{t("change")}</th>
              <th className="px-3 py-2 text-right font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 &&
              Array.from({ length: 7 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-b border-[var(--border)]/70 last:border-0"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 animate-pulse rounded-md bg-[var(--surface-2)]" />
                      <span className="space-y-1">
                        <span className="block h-3 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
                        <span className="block h-2.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="inline-block h-3.5 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="inline-block h-3.5 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                </tr>
              ))}
            {items.map((item) => {
              const up = item.percentChange >= 0;
              const watchKey = `${item.assetType}:${item.symbol}`;
              const isWatched = watched.has(watchKey);
              return (
                <tr
                  key={`${title}-${item.symbol}`}
                  className={`border-b border-[var(--border)]/70 last:border-0 hover:bg-[var(--sidebar-hover)]/60 ${
                    loading ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="flex min-w-0 items-center gap-2"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[10px] font-bold text-[var(--brand-text)]">
                        {item.symbol.slice(0, 2)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold tracking-wide">
                          {item.symbol}
                        </span>
                        <span className="block truncate text-[11px] text-[var(--muted)]">
                          {item.name || displayName(item.symbol, item.assetType)}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 font-medium tabular-nums text-[13px]">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="block"
                    >
                      {item.assetType === "hk" ? "HK$" : "$"}
                      <PriceText value={item.price} change={item.percentChange} />
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-[13px]">
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="inline-flex items-center gap-0.5 font-medium"
                    >
                      <span aria-hidden className="text-[10px]">
                        {up ? "▲" : "▼"}
                      </span>
                      <ChangePct value={item.percentChange} />
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        className={`text-sm ${
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
                        className="qt-link-up text-[11px] font-bold tracking-wide hover:opacity-80"
                      >
                        {t("buy")}
                      </Link>
                      <Link
                        href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                        className="qt-link-down text-[11px] font-bold tracking-wide hover:opacity-80"
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
                  colSpan={4}
                  className="px-3 py-8 text-center text-[var(--muted)]"
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

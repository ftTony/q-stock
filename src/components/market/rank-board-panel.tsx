"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { IconHeart } from "@/components/ui/icon-heart";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";
import type { RankQuote } from "@/components/market/markets-types";

function pricePrefix(assetType: AssetType): string {
  if (assetType === "hk") return "HK$";
  if (assetType === "cn") return "¥";
  if (assetType === "crypto") return "";
  return "$";
}

export function RankBoardPanel({
  title,
  items,
  loading,
  watched,
  onToggleWatch,
  t,
  framed = true,
}: {
  title: string;
  items: RankQuote[];
  loading: boolean;
  watched: Set<string>;
  onToggleWatch: (symbol: string, assetType: AssetType) => void;
  t: ReturnType<typeof useTranslations<"market">>;
  /** When false, parent provides the panel chrome (e.g. 3-up strip). */
  framed?: boolean;
}) {
  const body = (
    <>
      {title ? (
        <div className="border-b border-[var(--border)] px-3 py-2.5">
          <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
            {title}
          </h3>
        </div>
      ) : null}
      <div className="overflow-x-auto qt-scroll">
        <table className="w-full min-w-[280px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[10px] tracking-wider text-[var(--muted)] uppercase">
              <th className="px-3 py-2 font-medium">{t("symbol")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("price")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("change")}</th>
              <th className="px-3 py-2 text-right font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              items.length === 0 &&
              Array.from({ length: 7 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-b border-[var(--border)]/70 last:border-0"
                >
                  <td className="px-3 py-2.5">
                    <span className="space-y-1">
                      <span className="block h-3 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
                      <span className="block h-2.5 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <span className="inline-block h-3.5 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <span className="inline-block h-3.5 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-block h-3.5 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
                  </td>
                </tr>
              ))}
            {items.map((item) => {
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
                      className="min-w-0"
                    >
                      <span className="block truncate text-[13px] font-semibold tracking-wide">
                        {item.symbol}
                      </span>
                      <span className="block truncate text-[11px] text-[var(--muted)]">
                        {item.name ||
                          displayName(item.symbol, item.assetType)}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-right text-[13px] font-medium tabular-nums">
                    <Link href={`/symbol/${item.assetType}/${item.symbol}`}>
                      {pricePrefix(item.assetType)}
                      <PriceText
                        value={item.price}
                        change={item.percentChange}
                      />
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-right text-[13px] tabular-nums">
                    <Link href={`/symbol/${item.assetType}/${item.symbol}`}>
                      <ChangePct value={item.percentChange} />
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
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
                        <IconHeart filled={isWatched} className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                        className="qt-btn qt-btn-ghost inline-flex h-7 items-center px-2 text-[11px] font-medium leading-none"
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
    </>
  );

  if (!framed) return <div className="min-w-0">{body}</div>;
  return <div className="qt-panel overflow-hidden">{body}</div>;
}

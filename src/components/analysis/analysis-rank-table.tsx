"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { IconHeart } from "@/components/ui/icon-heart";
import { displayName } from "@/lib/market-names";
import type { Quote } from "@/lib/types";
import {
  ANALYSIS_BASKET_MAX,
  basketKey,
  quoteToBasketItem,
  type AnalysisBasketItem,
} from "@/components/analysis/types";

type Props = {
  items: Quote[];
  loading: boolean;
  /** Industry members often lack OHLC — hide sparkline column. */
  showRange?: boolean;
  basketKeys: Set<string>;
  basketCount: number;
  watched: Set<string>;
  canWatch: boolean;
  onToggleBasket: (item: AnalysisBasketItem) => boolean;
  onToggleWatch: (symbol: string, assetType: Quote["assetType"]) => void;
};

export function AnalysisRankTable({
  items,
  loading,
  showRange = true,
  basketKeys,
  basketCount,
  watched,
  canWatch,
  onToggleBasket,
  onToggleWatch,
}: Props) {
  const t = useTranslations("analysis");
  const tMarket = useTranslations("market");
  const tCommon = useTranslations("common");

  return (
    <div className="overflow-x-auto qt-scroll">
      <table className="w-full min-w-[600px] text-[14px] leading-5">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[14px] leading-5 text-[var(--muted)]">
              <th className="w-9 px-2.5 py-2.5 font-semibold" />
              <th className="px-2 py-2.5 font-semibold">{tMarket("symbol")}</th>
              {showRange && (
                <th className="hidden px-2 py-2.5 font-semibold sm:table-cell">
                  {t("range")}
                </th>
              )}
              <th className="px-2 py-2.5 text-right font-semibold">
                {tMarket("price")}
              </th>
              <th className="px-2 py-2.5 text-right font-semibold">
                {t("change")}
              </th>
              <th className="px-2.5 py-2.5 text-right font-semibold">
                {tMarket("actions")}
              </th>
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
                <td className="px-2.5 py-2" colSpan={showRange ? 6 : 5}>
                  <span className="block h-3.5 w-full animate-pulse rounded bg-[var(--surface-2)]" />
                </td>
              </tr>
            ))}
          {items.map((item) => {
            const key = basketKey(item);
            const selected = basketKeys.has(key);
            const watchKey = `${item.assetType}:${item.symbol}`;
            const isWatched = watched.has(watchKey);
            const currency =
              item.assetType === "hk"
                ? "HK$"
                : item.assetType === "cn"
                  ? "¥"
                  : "$";
            const disableSelect =
              !selected && basketCount >= ANALYSIS_BASKET_MAX;
            const basketItem = quoteToBasketItem(item);

            return (
              <tr
                key={key}
                className={`border-b border-[var(--border)]/70 last:border-0 ${
                  selected
                    ? "bg-[var(--brand-soft)]/30"
                    : "hover:bg-[var(--sidebar-hover)]/50"
                } ${loading ? "opacity-60" : ""} ${
                  disableSelect ? "" : "cursor-pointer"
                }`}
                onClick={() => {
                  if (disableSelect && !selected) return;
                  onToggleBasket(basketItem);
                }}
              >
                <td className="px-2.5 py-2">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-[var(--brand)]"
                    checked={selected}
                    disabled={disableSelect}
                    title={
                      disableSelect ? t("basketFull") : t("addToCompare")
                    }
                    aria-label={t("addToCompare")}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleBasket(basketItem)}
                  />
                </td>
                <td className="px-2 py-2">
                  <Link
                    href={`/symbol/${item.assetType}/${item.symbol}`}
                    className="flex min-w-0 items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--surface-2)] text-[9px] font-bold text-[var(--brand-text)]">
                      {item.symbol.slice(0, 2)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold leading-5 tracking-wide">
                        {item.symbol}
                      </span>
                      <span className="block truncate text-[12px] leading-4 text-[var(--muted)]">
                        {item.name ||
                          displayName(item.symbol, item.assetType)}
                      </span>
                    </span>
                  </Link>
                </td>
                {showRange && (
                  <td className="hidden px-2 py-2 sm:table-cell">
                    {item.high != null &&
                    item.low != null &&
                    item.high !== item.low ? (
                      <Sparkline
                        open={item.open || item.previousClose || item.low}
                        high={item.high}
                        low={item.low}
                        close={item.price}
                        up={item.percentChange >= 0}
                      />
                    ) : (
                      <span className="text-[var(--muted)]">—</span>
                    )}
                  </td>
                )}
                <td className="whitespace-nowrap px-2 py-2 text-right text-[14px] font-medium leading-5 tabular-nums">
                  {currency}
                  <PriceText value={item.price} change={item.percentChange} />
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right text-[14px] leading-5">
                  <ChangePct value={item.percentChange} />
                </td>
                <td className="px-2.5 py-2">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={`rounded p-1 ${
                        isWatched
                          ? "text-[var(--down)]"
                          : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--down)]"
                      }`}
                      title={
                        canWatch
                          ? isWatched
                            ? tMarket("remove")
                            : tMarket("addWatch")
                          : t("loginForWatch")
                      }
                      aria-label={
                        canWatch
                          ? isWatched
                            ? tMarket("remove")
                            : tMarket("addWatch")
                          : t("loginForWatch")
                      }
                      disabled={!canWatch}
                      onClick={() =>
                        void onToggleWatch(item.symbol, item.assetType)
                      }
                    >
                      <IconHeart filled={isWatched} className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                      className="rounded px-1.5 py-1 text-[14px] leading-5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                      title={t("alert")}
                    >
                      {t("alert")}
                    </Link>
                    <Link
                      href={`/symbol/${item.assetType}/${item.symbol}`}
                      className="rounded px-1.5 py-1 text-[14px] font-semibold leading-5 text-[var(--brand-text)] hover:bg-[var(--brand-soft)]/40"
                    >
                      {tMarket("view")}
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
          {!loading && items.length === 0 && (
            <tr>
                <td
                  colSpan={showRange ? 6 : 5}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  {t("emptyBoard")}
                </td>
            </tr>
          )}
        </tbody>
      </table>
      {loading && items.length > 0 && (
        <div className="border-t border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)]">
          {tCommon("loading")}
        </div>
      )}
    </div>
  );
}

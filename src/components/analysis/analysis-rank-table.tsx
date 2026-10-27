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
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-wider text-[var(--muted)] uppercase">
            <th className="w-9 px-2.5 py-2.5 font-medium" />
            <th className="px-2 py-2.5 font-medium">{tMarket("symbol")}</th>
            {showRange && (
              <th className="hidden px-2 py-2.5 font-medium sm:table-cell">
                {t("range")}
              </th>
            )}
            <th className="px-2 py-2.5 text-right font-medium">
              {tMarket("price")}
            </th>
            <th className="px-2 py-2.5 text-right font-medium">{t("change")}</th>
            <th className="px-2.5 py-2.5 text-right font-medium">
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
                <td className="px-2.5 py-2.5" colSpan={showRange ? 6 : 5}>
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
                <td className="px-2.5 py-2.5">
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
                <td className="px-2 py-2.5">
                  <Link
                    href={`/symbol/${item.assetType}/${item.symbol}`}
                    className="min-w-0"
                    onClick={(e) => e.stopPropagation()}
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
                {showRange && (
                  <td className="hidden px-2 py-2.5 sm:table-cell">
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
                <td className="whitespace-nowrap px-2 py-2.5 text-right text-[13px] font-medium tabular-nums">
                  {currency}
                  <PriceText value={item.price} change={item.percentChange} />
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 text-right text-[13px] tabular-nums">
                  <ChangePct value={item.percentChange} />
                </td>
                <td className="px-2.5 py-2.5">
                  <div
                    className="flex items-center justify-end gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                        isWatched
                          ? "text-[var(--brand-text)]"
                          : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                      } disabled:opacity-40`}
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
                      className="qt-btn qt-btn-ghost inline-flex h-7 items-center px-2 text-[11px] font-medium leading-none"
                      title={t("alert")}
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

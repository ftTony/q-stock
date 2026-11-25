"use client";

import { memo, type Ref } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { IconHeart } from "@/components/ui/icon-heart";
import { AnalysisRankCellValue } from "@/components/analysis/analysis-rank-cells";
import type { AnalysisColId } from "@/components/analysis/analysis-rank-columns";
import {
  ANALYSIS_BASKET_MAX,
  basketKey,
  quoteToBasketItem,
  type AnalysisBasketItem,
  type AnalysisTableRow,
} from "@/components/analysis/types";
import { displayName } from "@/lib/market-names";

/** Locked row height for 3-pane sync (virtual list + skeleton). */
export const ANALYSIS_RANK_ROW_H = 41;

export type RankPinWidths = {
  check: number;
  symbol: number;
  name: number;
  actions: number;
};

type Shared = {
  item: AnalysisTableRow;
  selected: boolean;
  /** Cross-pane hover — CSS group-hover cannot span three tables. */
  hovered: boolean;
  loading: boolean;
  basketCount: number;
  onToggleBasket: (item: AnalysisBasketItem) => boolean;
  onHoverChange: (key: string | null) => void;
};

const tdBase =
  "box-border h-[41px] max-h-[41px] overflow-hidden border-b border-[var(--border)]/70 px-2 align-middle";

/** Same selected / hover fill on left, mid, and right panes. */
function cellBg(selected: boolean, hovered: boolean) {
  if (selected) {
    return "bg-[color-mix(in_srgb,var(--brand-soft)_55%,var(--panel))]";
  }
  if (hovered) {
    return "bg-[color-mix(in_srgb,var(--sidebar-hover)_50%,var(--panel))]";
  }
  return "bg-[var(--panel)]";
}

function rowClass(loading: boolean, disableSelect: boolean) {
  return `h-[41px] max-h-[41px] ${loading ? "opacity-60" : ""} ${
    disableSelect ? "" : "cursor-pointer"
  }`;
}

export const AnalysisRankLeftRow = memo(function AnalysisRankLeftRow({
  item,
  pin,
  selected,
  hovered,
  loading,
  basketCount,
  measureRef,
  onToggleBasket,
  onHoverChange,
}: Shared & {
  pin: RankPinWidths;
  measureRef?: Ref<HTMLTableRowElement>;
}) {
  const t = useTranslations("analysis");
  const disableSelect = !selected && basketCount >= ANALYSIS_BASKET_MAX;
  const basketItem = quoteToBasketItem(item);
  const name = item.name || displayName(item.symbol, item.assetType);
  const { check, symbol: symW, name: nameW } = pin;
  const key = basketKey(item);
  const bg = cellBg(selected, hovered);

  return (
    <tr
      ref={measureRef}
      className={rowClass(loading, disableSelect)}
      style={{ height: ANALYSIS_RANK_ROW_H }}
      onMouseEnter={() => onHoverChange(key)}
      onMouseLeave={() => onHoverChange(null)}
      onClick={() => {
        if (disableSelect && !selected) return;
        onToggleBasket(basketItem);
      }}
    >
      <td
        data-pin-col="check"
        className={`${tdBase} ${bg}`}
        style={{ width: check, minWidth: check, height: ANALYSIS_RANK_ROW_H }}
      >
        <input
          type="checkbox"
          className="h-3.5 w-3.5 accent-[var(--brand)]"
          checked={selected}
          disabled={disableSelect}
          title={disableSelect ? t("basketFull") : t("addToCompare")}
          aria-label={t("addToCompare")}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggleBasket(basketItem)}
        />
      </td>
      <td
        data-pin-col="symbol"
        data-resize-col="symbol"
        className={`${tdBase} ${bg}`}
        style={{ width: symW, minWidth: symW, height: ANALYSIS_RANK_ROW_H }}
      >
        <Link
          href={`/symbol/${item.assetType}/${item.symbol}`}
          className="block truncate text-[13px] font-semibold leading-none tabular-nums tracking-wide text-[var(--aw-primary,var(--brand-text))] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {item.symbol}
        </Link>
      </td>
      <td
        data-pin-col="name"
        data-resize-col="name"
        className={`${tdBase} ${bg}`}
        style={{ width: nameW, minWidth: nameW, height: ANALYSIS_RANK_ROW_H }}
      >
        <span
          className="block truncate text-[13px] leading-none text-[var(--foreground)]"
          title={name}
        >
          {name}
        </span>
      </td>
    </tr>
  );
});

export const AnalysisRankMidRow = memo(function AnalysisRankMidRow({
  item,
  locale,
  order,
  selected,
  hovered,
  loading,
  basketCount,
  onToggleBasket,
  onHoverChange,
}: Shared & { locale: string; order: AnalysisColId[] }) {
  const disableSelect = !selected && basketCount >= ANALYSIS_BASKET_MAX;
  const basketItem = quoteToBasketItem(item);
  const key = basketKey(item);
  const bg = cellBg(selected, hovered);

  return (
    <tr
      className={rowClass(loading, disableSelect)}
      style={{ height: ANALYSIS_RANK_ROW_H }}
      onMouseEnter={() => onHoverChange(key)}
      onMouseLeave={() => onHoverChange(null)}
      onClick={() => {
        if (disableSelect && !selected) return;
        onToggleBasket(basketItem);
      }}
    >
      {order.map((id) => (
        <td
          key={id}
          data-resize-col={id}
          className={`${tdBase} whitespace-nowrap text-right text-[13px] leading-none tabular-nums ${bg}`}
          style={{
            width: `var(--cw-${id})`,
            height: ANALYSIS_RANK_ROW_H,
          }}
        >
          <AnalysisRankCellValue id={id} row={item} locale={locale} />
        </td>
      ))}
    </tr>
  );
});

export const AnalysisRankRightRow = memo(function AnalysisRankRightRow({
  item,
  pin,
  selected,
  hovered,
  isWatched,
  canWatch,
  loading,
  basketCount,
  onToggleBasket,
  onToggleWatch,
  onHoverChange,
}: Shared & {
  pin: RankPinWidths;
  isWatched: boolean;
  canWatch: boolean;
  onToggleWatch: (
    symbol: string,
    assetType: AnalysisTableRow["assetType"],
  ) => void;
}) {
  const t = useTranslations("analysis");
  const tMarket = useTranslations("market");
  const disableSelect = !selected && basketCount >= ANALYSIS_BASKET_MAX;
  const basketItem = quoteToBasketItem(item);
  const actW = pin.actions;
  const key = basketKey(item);
  const bg = cellBg(selected, hovered);

  return (
    <tr
      className={rowClass(loading, disableSelect)}
      style={{ height: ANALYSIS_RANK_ROW_H }}
      onMouseEnter={() => onHoverChange(key)}
      onMouseLeave={() => onHoverChange(null)}
      onClick={() => {
        if (disableSelect && !selected) return;
        onToggleBasket(basketItem);
      }}
    >
      <td
        data-pin-col="actions"
        data-resize-col="actions"
        className={`${tdBase} ${bg}`}
        style={{ width: actW, minWidth: actW, height: ANALYSIS_RANK_ROW_H }}
      >
        <div
          className="flex h-full items-center justify-end gap-1 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-none ${
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
            onClick={() => void onToggleWatch(item.symbol, item.assetType)}
          >
            <IconHeart filled={isWatched} className="h-3.5 w-3.5" />
          </button>
          <Link
            href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
            className="inline-flex h-6 shrink-0 items-center rounded-none border border-[var(--border)] bg-[var(--panel)] px-1.5 text-[11px] font-medium leading-none text-[var(--foreground)] whitespace-nowrap hover:bg-[var(--surface-2)]"
            title={t("alert")}
          >
            {t("alert")}
          </Link>
        </div>
      </td>
    </tr>
  );
});

export function analysisRankRowKey(item: AnalysisTableRow) {
  return basketKey(item);
}

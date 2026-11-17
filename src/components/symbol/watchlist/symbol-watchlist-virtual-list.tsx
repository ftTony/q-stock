"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import {
  isSymbolNavActive,
  useSymbolNavPending,
} from "@/components/symbol/page/symbol-nav-pending";
import type { WatchlistItem } from "@/hooks/query/use-watchlist";
import {
  regularQuoteDisplay,
  watchlistExtendedQuote,
} from "@/lib/market/extended-hours";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";

/** Fixed row height — keep in sync with `.aw-watchlist-row` min-height. */
export const WATCHLIST_ROW_H = 44;
const OVERSCAN = 8;
/** Below this count, render a plain list (no virtual window). */
const VIRTUAL_THRESHOLD = 40;

type Props = {
  rows: WatchlistItem[];
  currentSymbol: string;
  currentAssetType: AssetType;
};

type RowProps = {
  row: WatchlistItem;
  active: boolean;
  style?: CSSProperties;
  onNavigate: (symbol: string, assetType: AssetType) => void;
};

function WatchlistRow({ row, active, style, onNavigate }: RowProps) {
  const t = useTranslations("symbol");
  const quote = row.quote;
  const isUs = row.assetType === "stock";
  /** Keep 最新价 as regular/last close; put 盘前/盘后 on the second line. */
  const regular = quote
    ? isUs
      ? regularQuoteDisplay(quote)
      : {
          price: quote.price,
          change: quote.change,
          percentChange: quote.percentChange,
        }
    : null;
  const extended = isUs && quote ? watchlistExtendedQuote(quote) : null;
  const ch = regular?.percentChange ?? null;
  const name = displayName(row.symbol, row.assetType, quote?.name);
  const extLabel =
    extended?.session === "pre"
      ? t("quoteSessionPre")
      : extended?.session === "post"
        ? t("quoteSessionPost")
        : extended
          ? t("quoteSessionOvernight")
          : null;

  return (
    <Link
      href={`/symbol/${row.assetType}/${encodeURIComponent(row.symbol)}`}
      data-active={active || undefined}
      onClick={() => onNavigate(row.symbol, row.assetType)}
      className="aw-watchlist-row grid h-full items-center gap-x-1 px-2 transition hover:bg-[var(--aw-parchment,var(--surface-2))]"
      style={{
        ...style,
        ...(active
          ? {
              background:
                "color-mix(in srgb, var(--aw-primary) 8%, transparent)",
            }
          : null),
      }}
    >
      <div className="min-w-0">
        <div className="h-[14px] truncate text-[12px] font-semibold leading-[14px] text-[var(--foreground)]">
          {name}
        </div>
        <div className="mt-px flex h-[12px] min-w-0 items-center gap-1 text-[10px] leading-[12px] text-[var(--muted)]">
          <span className="truncate">{row.symbol}</span>
          {extLabel ? (
            <span className="shrink-0 text-[var(--muted)]">{extLabel}</span>
          ) : null}
        </div>
      </div>
      <div className="min-w-0 text-right tabular-nums">
        <div className="h-[14px] truncate text-[12px] font-medium leading-[14px]">
          {regular ? (
            <PriceText value={regular.price} change={ch ?? undefined} />
          ) : (
            <span className="text-[var(--muted)]">—</span>
          )}
        </div>
        {extended ? (
          <div className="mt-px h-[12px] truncate text-[10px] font-medium leading-[12px]">
            <PriceText
              value={extended.quote.price}
              change={extended.quote.percentChange}
            />
          </div>
        ) : null}
      </div>
      <div className="min-w-0 text-right tabular-nums">
        <div className="h-[14px] truncate text-[11px] leading-[14px]">
          {ch != null ? (
            <ChangePct value={ch} />
          ) : (
            <span className="text-[var(--muted)]">—</span>
          )}
        </div>
        {extended ? (
          <div className="mt-px h-[12px] truncate text-[10px] leading-[12px]">
            <ChangePct value={extended.quote.percentChange} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

/** Virtualized (or plain) watchlist body for large lists. */
export function SymbolWatchlistVirtualList({
  rows,
  currentSymbol,
  currentAssetType,
}: Props) {
  const { pending, setPending } = useSymbolNavPending();
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(0);

  const onNavigate = useCallback(
    (symbol: string, assetType: AssetType) => {
      if (symbol === currentSymbol && assetType === currentAssetType) return;
      setPending({ symbol, assetType });
    },
    [currentSymbol, currentAssetType, setPending],
  );

  const useVirtual = rows.length >= VIRTUAL_THRESHOLD;

  useEffect(() => {
    if (!useVirtual) return;
    const el = parentRef.current;
    if (!el) return;
    const measure = () => setViewportH(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [useVirtual]);

  const activeIndex = useMemo(() => {
    return rows.findIndex((row) =>
      isSymbolNavActive(
        row.symbol,
        row.assetType,
        currentSymbol,
        currentAssetType,
        pending,
      ),
    );
  }, [rows, currentSymbol, currentAssetType, pending]);

  useEffect(() => {
    if (!useVirtual || activeIndex < 0) return;
    const el = parentRef.current;
    if (!el) return;
    const top = activeIndex * WATCHLIST_ROW_H;
    const bottom = top + WATCHLIST_ROW_H;
    if (top < el.scrollTop) {
      el.scrollTop = top;
    } else if (bottom > el.scrollTop + el.clientHeight) {
      el.scrollTop = bottom - el.clientHeight;
    }
  }, [useVirtual, activeIndex, currentSymbol, currentAssetType]);

  const { start, end } = useMemo(() => {
    if (!useVirtual || viewportH <= 0) {
      return { start: 0, end: rows.length };
    }
    const first = Math.max(
      0,
      Math.floor(scrollTop / WATCHLIST_ROW_H) - OVERSCAN,
    );
    const visible = Math.ceil(viewportH / WATCHLIST_ROW_H) + OVERSCAN * 2;
    return {
      start: first,
      end: Math.min(rows.length, first + visible),
    };
  }, [useVirtual, viewportH, scrollTop, rows.length]);

  if (!useVirtual) {
    return (
      <div className="qt-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <ul>
          {rows.map((row) => {
            const active = isSymbolNavActive(
              row.symbol,
              row.assetType,
              currentSymbol,
              currentAssetType,
              pending,
            );
            return (
              <li key={row.id} className="h-[44px]">
                <WatchlistRow
                  row={row}
                  active={active}
                  onNavigate={onNavigate}
                />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="qt-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <ul
        className="relative m-0 list-none p-0"
        style={{ height: rows.length * WATCHLIST_ROW_H }}
      >
        {rows.slice(start, end).map((row, i) => {
          const index = start + i;
          const active = isSymbolNavActive(
            row.symbol,
            row.assetType,
            currentSymbol,
            currentAssetType,
            pending,
          );
          return (
            <li
              key={row.id}
              className="absolute right-0 left-0"
              style={{
                top: index * WATCHLIST_ROW_H,
                height: WATCHLIST_ROW_H,
              }}
            >
              <WatchlistRow
                row={row}
                active={active}
                onNavigate={onNavigate}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

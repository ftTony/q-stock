"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import {
  isSymbolNavActive,
  useSymbolNavPending,
} from "@/components/symbol/page/symbol-nav-pending";
import type { WatchlistItem } from "@/hooks/query/use-watchlist";
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
  const ch = row.quote?.percentChange ?? null;
  const name = displayName(row.symbol, row.assetType, row.quote?.name);

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
        <div className="truncate text-[12px] font-semibold leading-tight text-[var(--foreground)]">
          {name}
        </div>
        <div className="truncate text-[10px] leading-tight text-[var(--muted)]">
          {row.symbol}
        </div>
      </div>
      <div className="text-right text-[12px] font-medium tabular-nums leading-tight">
        {row.quote?.price != null ? (
          <PriceText value={row.quote.price} change={ch ?? undefined} />
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

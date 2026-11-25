"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { flushSync } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/submit-button";
import { sortAnalysisRows } from "@/components/analysis/analysis-rank-columns";
import { AnalysisRankHeader } from "@/components/analysis/analysis-rank-header";
import {
  ANALYSIS_RANK_ROW_H,
  AnalysisRankLeftRow,
  AnalysisRankMidRow,
  AnalysisRankRightRow,
  analysisRankRowKey,
} from "@/components/analysis/analysis-rank-row";
import { AnalysisRankHScroll } from "@/components/analysis/analysis-rank-h-scroll";
import {
  AnalysisRankSkeletonLeft,
  AnalysisRankSkeletonMid,
  AnalysisRankSkeletonRight,
  analysisRankSkeletonCount,
} from "@/components/analysis/analysis-rank-skeleton";
import { useAnalysisRankColumns } from "@/components/analysis/use-analysis-rank-columns";
import type {
  AnalysisBasketItem,
  AnalysisTableRow,
} from "@/components/analysis/types";

const ROW_OVERSCAN = 10;
const VIRTUAL_THRESHOLD = 40;

type Props = {
  items: AnalysisTableRow[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  basketKeys: Set<string>;
  basketCount: number;
  watched: Set<string>;
  canWatch: boolean;
  onToggleBasket: (item: AnalysisBasketItem) => boolean;
  onToggleWatch: (
    symbol: string,
    assetType: AnalysisTableRow["assetType"],
  ) => void;
};

function Spacer({ height, cols }: { height: number; cols: number }) {
  if (height <= 0) return null;
  return (
    <tr aria-hidden="true" className="pointer-events-none">
      <td colSpan={cols} style={{ height, padding: 0, border: 0 }} />
    </tr>
  );
}

/**
 * Mid head/body: can scrollLeft for sync, but never paint an h-bar
 * (`.qt-scroll` omitted — its thin bar was showing under the header).
 * Visible h-scroll lives only on the foot strip.
 */
const midClipX =
  "min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent";

export function AnalysisRankTable({
  items,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  basketKeys,
  basketCount,
  watched,
  canWatch,
  onToggleBasket,
  onToggleWatch,
}: Props) {
  const t = useTranslations("analysis");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const cols = useAnalysisRankColumns();
  const { check, symbol: symW, name: nameW, actions: actW } = cols.pinWidths;
  const leftW = check + symW + nameW;

  const sorted = useMemo(
    () => sortAnalysisRows(items, cols.sortKey, cols.sortDir),
    [items, cols.sortKey, cols.sortDir],
  );

  const useVirtual = sorted.length >= VIRTUAL_THRESHOLD;
  const midColCount = Math.max(1, cols.order.length);
  const rowHeight = ANALYSIS_RANK_ROW_H;
  const showSkeleton = loading && items.length === 0;
  const showHBar = !showSkeleton && items.length > 0;

  const vScrollRef = useRef<HTMLDivElement>(null);
  const midHeadRef = useRef<HTMLDivElement>(null);
  const midBodyRef = useRef<HTMLDivElement>(null);
  const midFootRef = useRef<HTMLDivElement>(null);
  const hSyncLock = useRef(false);

  const [viewportH, setViewportH] = useState(480);
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const startIndexRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);
  const loadMoreGuard = useRef(false);

  useEffect(() => {
    const el = vScrollRef.current;
    if (!el) return;
    const measure = () => setViewportH(el.clientHeight || 480);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (scrollRafRef.current != null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    startIndexRef.current = 0;
    setStartIndex(0);
    if (vScrollRef.current) vScrollRef.current.scrollTop = 0;
  }, [cols.sortKey, cols.sortDir, items.length > 0 ? items[0]?.symbol : ""]);

  const skCount = analysisRankSkeletonCount(viewportH);
  const visibleCount = Math.ceil(viewportH / rowHeight) + ROW_OVERSCAN * 2;
  const safeStart = useVirtual
    ? Math.min(startIndex, Math.max(0, sorted.length - 1))
    : 0;
  const endIndex = useVirtual
    ? Math.min(sorted.length, safeStart + visibleCount)
    : sorted.length;
  const visibleRows = sorted.slice(safeStart, endIndex);
  const topPad = useVirtual ? safeStart * rowHeight : 0;
  const bottomPad = useVirtual
    ? Math.max(0, (sorted.length - endIndex) * rowHeight)
    : 0;

  const midWidth = cols.order.reduce((s, id) => s + cols.widthOf(id), 0);
  const midStyle = {
    width: midWidth,
    minWidth: midWidth,
    ...Object.fromEntries(
      cols.order.map((id) => [`--cw-${id}`, `${cols.widthOf(id)}px`]),
    ),
  } as CSSProperties;

  function syncH(from: "head" | "body" | "foot") {
    if (hSyncLock.current) return;
    const head = midHeadRef.current;
    const body = midBodyRef.current;
    const foot = midFootRef.current;
    if (!head || !body) return;
    const src = from === "head" ? head : from === "foot" ? foot : body;
    if (!src) return;
    const left = src.scrollLeft;
    hSyncLock.current = true;
    if (head !== src) head.scrollLeft = left;
    if (body !== src) body.scrollLeft = left;
    if (foot && foot !== src) foot.scrollLeft = left;
    hSyncLock.current = false;
  }

  function onVScroll() {
    const el = vScrollRef.current;
    if (!el) return;

    if (useVirtual) {
      const next = Math.max(
        0,
        Math.floor(el.scrollTop / rowHeight) - ROW_OVERSCAN,
      );
      if (next !== startIndexRef.current) {
        startIndexRef.current = next;
        if (scrollRafRef.current == null) {
          scrollRafRef.current = requestAnimationFrame(() => {
            scrollRafRef.current = null;
            const node = vScrollRef.current;
            if (!node) return;
            const target = Math.max(
              0,
              Math.floor(node.scrollTop / rowHeight) - ROW_OVERSCAN,
            );
            startIndexRef.current = target;
            flushSync(() => setStartIndex(target));
          });
        }
      }
    }

    if (!hasMore || loadingMore || !onLoadMore || loadMoreGuard.current) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 280) {
      loadMoreGuard.current = true;
      onLoadMore();
      queueMicrotask(() => {
        loadMoreGuard.current = false;
      });
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <AnalysisRankHeader
        cols={cols}
        leftW={leftW}
        midStyle={midStyle}
        midHeadRef={midHeadRef}
        syncH={syncH}
      />

      {/* Body: left | mid (no h-scrollbar gutter) | right */}
      <div
        ref={vScrollRef}
        className="qt-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
        onScroll={onVScroll}
      >
        <div className="flex min-w-0 items-start">
          <div
            ref={cols.leftBodyWrapRef}
            className="shrink-0 bg-[var(--panel)]"
            style={{ width: leftW }}
          >
            <table
              ref={cols.leftBodyTableRef}
              className="table-fixed border-separate border-spacing-0 text-sm"
              style={{ width: leftW }}
            >
              <colgroup>
                <col data-pin-col="check" style={{ width: check }} />
                <col data-pin-col="symbol" style={{ width: symW }} />
                <col data-pin-col="name" style={{ width: nameW }} />
              </colgroup>
              <tbody>
                {showSkeleton ? (
                  <AnalysisRankSkeletonLeft
                    count={skCount}
                    check={check}
                    symW={symW}
                    nameW={nameW}
                  />
                ) : null}
                <Spacer height={topPad} cols={3} />
                {visibleRows.map((item) => {
                  const key = analysisRankRowKey(item);
                  return (
                    <AnalysisRankLeftRow
                      key={key}
                      item={item}
                      pin={cols.pinWidths}
                      selected={basketKeys.has(key)}
                      hovered={hoveredKey === key}
                      loading={loading}
                      basketCount={basketCount}
                      onToggleBasket={onToggleBasket}
                      onHoverChange={setHoveredKey}
                    />
                  );
                })}
                <Spacer height={bottomPad} cols={3} />
              </tbody>
            </table>
          </div>

          <div
            ref={midBodyRef}
            className={midClipX}
            onScroll={() => syncH("body")}
            onWheel={(e) => {
              if (e.deltaX === 0) return;
              const foot = midFootRef.current;
              if (!foot) return;
              foot.scrollLeft += e.deltaX;
            }}
          >
            <table
              ref={cols.tableRef}
              className="table-fixed border-separate border-spacing-0 text-sm"
              style={midStyle}
            >
              <colgroup>
                {cols.order.map((id) => (
                  <col key={id} style={{ width: `var(--cw-${id})` }} />
                ))}
              </colgroup>
              <tbody>
                {showSkeleton ? (
                  <AnalysisRankSkeletonMid
                    count={skCount}
                    colCount={midColCount}
                  />
                ) : null}
                <Spacer height={topPad} cols={midColCount} />
                {visibleRows.map((item) => {
                  const key = analysisRankRowKey(item);
                  return (
                    <AnalysisRankMidRow
                      key={key}
                      item={item}
                      locale={locale}
                      order={cols.order}
                      selected={basketKeys.has(key)}
                      hovered={hoveredKey === key}
                      loading={loading}
                      basketCount={basketCount}
                      onToggleBasket={onToggleBasket}
                      onHoverChange={setHoveredKey}
                    />
                  );
                })}
                <Spacer height={bottomPad} cols={midColCount} />
                {!loading && items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={midColCount}
                      className="px-3 py-8 text-center text-[var(--muted)]"
                    >
                      {t("emptyBoard")}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div
            ref={cols.rightBodyWrapRef}
            className="shrink-0 bg-[var(--panel)]"
            style={{ width: actW }}
          >
            <table
              ref={cols.rightBodyTableRef}
              className="table-fixed border-separate border-spacing-0 text-sm"
              style={{ width: actW }}
            >
              <colgroup>
                <col data-pin-col="actions" style={{ width: actW }} />
              </colgroup>
              <tbody>
                {showSkeleton ? (
                  <AnalysisRankSkeletonRight count={skCount} actW={actW} />
                ) : null}
                <Spacer height={topPad} cols={1} />
                {visibleRows.map((item) => {
                  const key = analysisRankRowKey(item);
                  return (
                    <AnalysisRankRightRow
                      key={key}
                      item={item}
                      pin={cols.pinWidths}
                      selected={basketKeys.has(key)}
                      hovered={hoveredKey === key}
                      isWatched={watched.has(
                        `${item.assetType}:${item.symbol}`,
                      )}
                      canWatch={canWatch}
                      loading={loading}
                      basketCount={basketCount}
                      onToggleBasket={onToggleBasket}
                      onToggleWatch={onToggleWatch}
                      onHoverChange={setHoveredKey}
                    />
                  );
                })}
                <Spacer height={bottomPad} cols={1} />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showHBar ? (
        <AnalysisRankHScroll
          scrollRef={midFootRef}
          contentWidth={midWidth}
          leftGutter={leftW}
          rightGutter={actW}
          onScroll={() => syncH("foot")}
        />
      ) : null}

      <div
        ref={cols.ghostRef}
        className="qt-col-drag-ghost pointer-events-none fixed z-[100] hidden border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-[12px] font-medium text-[var(--foreground)] shadow-lg"
      />
      {loadingMore || (hasMore && items.length > 0) ? (
        <div className="flex min-h-9 shrink-0 items-center justify-center gap-2 border-t border-[var(--border)]/60 px-3 py-1.5 text-[11px] text-[var(--muted)]">
          {loadingMore ? (
            <>
              <Spinner className="h-3.5 w-3.5 shrink-0" />
              <span>{t("loadingMore")}</span>
            </>
          ) : (
            <span>{t("scrollForMore")}</span>
          )}
        </div>
      ) : null}
      {loading && items.length > 0 && !loadingMore ? (
        <div className="shrink-0 border-t border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)]">
          {tCommon("loading")}
        </div>
      ) : null}
    </div>
  );
}

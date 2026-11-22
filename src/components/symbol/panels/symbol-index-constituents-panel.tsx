"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  ChangeAbs,
  ChangePct,
  PriceText,
} from "@/components/market/price";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { Spinner } from "@/components/ui/submit-button";
import { formatNumber } from "@/lib/format-number";
import type {
  IndexConstituent,
  IndexConstituentsPage,
} from "@/lib/market/providers/longbridge-constituents";
import { fetchJson } from "@/lib/query/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { AssetType } from "@/lib/types";

type SortKey =
  | "symbol"
  | "name"
  | "price"
  | "percentChange"
  | "change"
  | "changeSpeed"
  | "volume"
  | "turnover"
  | "turnoverRate"
  | "amplitude"
  | "volumeRatio"
  | "peTtm"
  | "pb"
  | "dividendYieldTtm"
  | "dividendTtm"
  | "payoutRatio"
  | "marketCap"
  | "circulatingMarketCap"
  | "open"
  | "prevClose"
  | "high"
  | "low"
  | "bid"
  | "ask"
  | "bidVol"
  | "askVol";

type SortDir = "asc" | "desc";

const TEXT_SORT_KEYS = new Set<SortKey>(["symbol", "name"]);
const STORAGE_KEY = "q-stock:index-constituents-layout";

const DEFAULT_WIDTHS: Record<string, number> = {
  symbol: 86,
  name: 144,
  price: 84,
  percentChange: 88,
  change: 78,
  changeSpeed: 84,
  volume: 88,
  turnover: 92,
  turnoverRate: 84,
  amplitude: 80,
  volumeRatio: 78,
  peTtm: 88,
  pb: 72,
  dividendYieldTtm: 96,
  dividendTtm: 84,
  payoutRatio: 88,
  marketCap: 96,
  circulatingMarketCap: 108,
  open: 80,
  prevClose: 84,
  high: 80,
  low: 80,
  bid: 80,
  ask: 80,
  bidVol: 84,
  askVol: 84,
};

const DEFAULT_ORDER = Object.keys(DEFAULT_WIDTHS);

type Layout = { order: string[]; widths: Record<string, number> };

function loadLayout(): Layout {
  const fallback: Layout = { order: DEFAULT_ORDER, widths: DEFAULT_WIDTHS };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Layout>;
    const savedOrder = Array.isArray(parsed.order) ? parsed.order : [];
    const order = [
      ...savedOrder.filter((id) => DEFAULT_ORDER.includes(id)),
      ...DEFAULT_ORDER.filter((id) => !savedOrder.includes(id)),
    ];
    const widths: Record<string, number> = { ...DEFAULT_WIDTHS };
    if (parsed.widths && typeof parsed.widths === "object") {
      for (const [id, value] of Object.entries(parsed.widths)) {
        if (
          id in widths &&
          typeof value === "number" &&
          Number.isFinite(value) &&
          value >= 48 &&
          value <= 420
        ) {
          widths[id] = value;
        }
      }
    }
    return { order, widths };
  } catch {
    return fallback;
  }
}

/** Stable SVG sort indicator — text glyphs like ↕ render inconsistently. */
function SortIcon({ dir }: { dir: SortDir | null }) {
  return (
    <svg
      width="7"
      height="9"
      viewBox="0 0 7 9"
      fill="currentColor"
      className="ml-0.5 inline-block shrink-0 align-middle"
      aria-hidden="true"
    >
      <path d="M3.5 0 7 3.4 0 3.4Z" opacity={dir === "desc" ? 0.25 : 1} />
      <path d="M3.5 9 0 5.6 7 5.6Z" opacity={dir === "asc" ? 0.25 : 1} />
    </svg>
  );
}

type HeaderCellProps = {
  col: Column;
  index: number;
  firstColId: string;
  sticky: boolean;
  active: boolean;
  sortDir: SortDir;
  onToggleSort: (key: SortKey) => void;
  onStartResize: (event: ReactPointerEvent<HTMLSpanElement>, id: string) => void;
  onResizeHover: (id: string | null) => void;
  onStartDrag: (
    event: ReactPointerEvent<HTMLTableCellElement>,
    col: Column,
  ) => void;
  hint: string;
};

/**
 * Table header cell. Column reordering uses Pointer Events (see onStartDrag)
 * instead of native HTML5 DnD, so buttons/text never swallow the gesture and
 * no third-party drag library is needed.
 */
function HeaderCell({
  col,
  index,
  firstColId,
  sticky,
  active,
  sortDir,
  onToggleSort,
  onStartResize,
  onResizeHover,
  onStartDrag,
  hint,
}: HeaderCellProps) {
  return (
    <th
      data-col-id={col.id}
      data-resize-col={col.id}
      onPointerDown={(event) => onStartDrag(event, col)}
      aria-sort={
        active
          ? sortDir === "desc"
            ? "descending"
            : "ascending"
          : "none"
      }
      className={`relative sticky top-0 cursor-grab touch-none whitespace-nowrap border-b border-[var(--border)]/70 bg-[var(--panel)] px-2 py-2 font-medium ${sticky ? "z-30" : "z-20"}`}
      style={{
        width: `var(--cw-${col.id})`,
        left:
          index === 0
            ? 0
            : index === 1
              ? `var(--cw-${firstColId})`
              : undefined,
      }}
    >
      {col.key ? (
        <button
          type="button"
          className={`inline-flex max-w-full select-none items-center font-medium ${
            active ? "text-[var(--foreground)]" : ""
          }`}
          onClick={() => onToggleSort(col.key!)}
        >
          <span className="truncate">{col.label}</span>
          <SortIcon dir={active ? sortDir : null} />
        </button>
      ) : (
        <span className="block select-none truncate">{col.label}</span>
      )}
      <span
        role="separator"
        aria-orientation="vertical"
        title={hint}
        onPointerDown={(event) => onStartResize(event, col.id)}
        onPointerEnter={() => onResizeHover(col.id)}
        onPointerLeave={() => onResizeHover(null)}
        onClick={(event) => event.stopPropagation()}
        className="group/resize absolute right-0 top-0 z-10 h-full w-2 cursor-col-resize touch-none"
      >
        <span className="absolute right-0 top-0 h-full w-px bg-transparent group-hover/resize:bg-[var(--aw-primary,var(--brand-text))]" />
      </span>
    </th>
  );
}

/** Futu-style compact volume/turnover: 万/亿 in zh, K/M/B otherwise. */
function fmtCompact(n: number | undefined, locale: string): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  const abs = Math.abs(n);
  if (locale.startsWith("zh")) {
    if (abs >= 1e8) return `${(n / 1e8).toFixed(2)}亿`;
    if (abs >= 1e4) return `${(n / 1e4).toFixed(2)}万`;
    return formatNumber(n, { maximumFractionDigits: 0 });
  }
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return formatNumber(n, { maximumFractionDigits: 0 });
}

function fmtNum(n: number | undefined, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNumber(n, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtPct(n: number | undefined): string {
  return n == null || !Number.isFinite(n) ? "—" : `${n.toFixed(2)}%`;
}

/**
 * Virtual list tuning.
 * `ROW_HEIGHT_FALLBACK` is used until the first row is measured. `ROW_OVERSCAN`
 * is deliberately generous: a fast fling can cross dozens of rows in a single
 * frame, and the extra rendered rows keep the viewport filled until the next
 * synchronized commit lands. Keeping these module-level (instead of inside the
 * render body) avoids re-creating them on every high-frequency scroll render.
 */
const ROW_HEIGHT_FALLBACK = 38;
const ROW_OVERSCAN = 16;

type Column = {
  id: string;
  key: SortKey | null;
  label: string;
  render: (row: IndexConstituent) => ReactNode;
};

export function SymbolIndexConstituentsPanel({
  symbol,
  assetType,
}: {
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("symbol");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("percentChange");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [layout, setLayout] = useState<Layout>(loadLayout);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  /** Column currently showing the resize guide line (DOM-driven, no re-render). */
  const hoverLineColRef = useRef<string | null>(null);
  const applyResizeHover = (colId: string | null) => {
    const table = tableRef.current;
    if (!table) return;
    if (hoverLineColRef.current) {
      table
        .querySelectorAll(`[data-resize-col="${hoverLineColRef.current}"]`)
        .forEach((el) => el.classList.remove("qt-resize-hover-line"));
    }
    hoverLineColRef.current = colId;
    if (colId) {
      table
        .querySelectorAll(`[data-resize-col="${colId}"]`)
        .forEach((el) => el.classList.add("qt-resize-hover-line"));
    }
  };
  const resizeRef = useRef<{
    id: string;
    startX: number;
    startWidth: number;
    startTotal: number;
  } | null>(null);
  const pendingWidthRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const hThumbRef = useRef<HTMLDivElement | null>(null);
  const hDragRef = useRef<{
    startX: number;
    startScroll: number;
    trackWidth: number;
    thumbWidth: number;
  } | null>(null);
  const [hDragging, setHDragging] = useState(false);
  /** Kept in a ref so scroll/resize handlers can call the latest closure. */
  const updateHScrollbarRef = useRef<() => void>(() => {});

  const { order, widths } = layout;
  // Stable so the memoized column definitions (and their derived widths) do
  // not get invalidated on every high-frequency scroll render.
  const widthOf = useCallback(
    (id: string) => widths[id] ?? DEFAULT_WIDTHS[id] ?? 96,
    [widths],
  );

  // Column order / widths survive tab switches and reloads.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // Storage can be disabled; layout still works for this session.
    }
  }, [layout]);

  useEffect(() => {
    if (!resizingId) return;

    // Keep the ↔ resize cursor and suppress text selection for the whole drag,
    // even when the pointer leaves the 6px handle or crosses sticky cells.
    const cursorStyle = document.createElement("style");
    cursorStyle.dataset.qstockColResize = "true";
    cursorStyle.textContent =
      ".qstock-col-resizing, .qstock-col-resizing * { cursor: col-resize !important; user-select: none !important; }";
    document.head.appendChild(cursorStyle);
    document.body.classList.add("qstock-col-resizing");
    const clearCursor = () => {
      document.body.classList.remove("qstock-col-resizing");
      cursorStyle.remove();
    };

    // While dragging, update only the table's CSS variables. Committing the
    // width to React state on every pointermove re-renders every cell and
    // makes resizing visibly laggy on wide tables.
    const paint = (width: number) => {
      const table = tableRef.current;
      const drag = resizeRef.current;
      if (!table || !drag) return;
      table.style.setProperty(`--cw-${drag.id}`, `${width}px`);
      table.style.width = `${drag.startTotal + width - drag.startWidth}px`;
      updateHScrollbarRef.current();
    };

    const onMove = (event: PointerEvent) => {
      const drag = resizeRef.current;
      if (!drag) return;
      pendingWidthRef.current = Math.max(
        48,
        Math.min(420, Math.round(drag.startWidth + event.clientX - drag.startX)),
      );
      if (frameRef.current != null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        if (pendingWidthRef.current != null) paint(pendingWidthRef.current);
      });
    };

    const onEnd = () => {
      const drag = resizeRef.current;
      const width = pendingWidthRef.current;
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (drag && width != null && width !== drag.startWidth) {
        setLayout((prev) => ({
          ...prev,
          widths: { ...prev.widths, [drag.id]: width },
        }));
        paint(width);
      }
      resizeRef.current = null;
      pendingWidthRef.current = null;
      clearCursor();
      setResizingId(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      clearCursor();
    };
  }, [resizingId]);

  useEffect(() => {
    if (!hDragging) return;
    const onMove = (event: PointerEvent) => {
      const drag = hDragRef.current;
      const el = scrollRef.current;
      if (!drag || !el) return;
      const maxThumbLeft = Math.max(0, drag.trackWidth - drag.thumbWidth);
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const delta =
        maxThumbLeft > 0
          ? ((event.clientX - drag.startX) / maxThumbLeft) * maxScroll
          : 0;
      el.scrollLeft = drag.startScroll + delta;
    };
    const onEnd = () => {
      hDragRef.current = null;
      setHDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, [hDragging]);

  const query = useInfiniteQuery({
    queryKey: queryKeys.symbol.constituents(assetType, symbol),
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      fetchJson<IndexConstituentsPage>(
        `/api/indices/constituents?symbol=${encodeURIComponent(symbol)}&assetType=${encodeURIComponent(assetType)}&nextKey=${encodeURIComponent(pageParam)}`,
      ),
    getNextPageParam: (last) =>
      last.hasMore && last.nextKey ? last.nextKey : undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isPending,
    isError,
  } = query;
  // Cursor pages can overlap when quotes move between requests. Deduplicate
  // by symbol so a scrolled list never shows the same stock twice.
  const rows = useMemo(() => {
    const seen = new Set<string>();
    return (query.data?.pages ?? [])
      .flatMap((p) => p.constituents)
      .filter((row) => {
        const key = `${assetType}:${row.symbol}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [query.data, assetType]);
  const total = query.data?.pages[0]?.total ?? rows.length;

  const sorted = useMemo(() => {
    const sign = sortDir === "desc" ? -1 : 1;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" || typeof bv === "string") {
        return (
          sign *
          String(av ?? "").localeCompare(String(bv ?? ""), locale, {
            numeric: true,
            sensitivity: "base",
          })
        );
      }
      return sign * ((av ?? -Infinity) - (bv ?? -Infinity));
    });
  }, [rows, sortDir, sortKey, locale]);

  // --- Virtual scrolling: only render the rows near the viewport. ---
  // Row height is measured from the first rendered row on mount (fallback 38)
  // so spacer rows keep the scroll height exactly in sync with the real list.
  const [viewportH, setViewportH] = useState(480);
  const [rowHeight, setRowHeight] = useState(ROW_HEIGHT_FALLBACK);
  const [startIndex, setStartIndex] = useState(0);
  const startIndexRef = useRef(0);
  const rowHeightMeasuredRef = useRef(false);
  // A native scroll paints immediately, but a plain setState is asynchronous:
  // during a fast fling the browser scrolls past the old row window before
  // React commits the new one, leaving a long blank spacer gap. We coalesce
  // scroll events into one rAF and commit with flushSync so the correct rows
  // are in the DOM before the frame is painted.
  const scrollRafRef = useRef<number | null>(null);
  const measureRowRef = useCallback((node: HTMLTableRowElement | null) => {
    if (!node || rowHeightMeasuredRef.current) return;
    // offsetHeight is the integer layout height; getBoundingClientRect can
    // return fractional values that accumulate into spacer drift over a
    // several-thousand-row list (and show up as blank/offset regions).
    const h = node.offsetHeight;
    if (h > 0) {
      rowHeightMeasuredRef.current = true;
      setRowHeight(h);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setViewportH(el.clientHeight || 480);
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  // Drop any queued scroll commit on unmount / symbol change so a stale frame
  // never writes a start index for a list that has been replaced.
  useEffect(
    () => () => {
      if (scrollRafRef.current != null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    },
    [],
  );

  const visibleCount = Math.ceil(viewportH / rowHeight) + ROW_OVERSCAN * 2;
  const safeStart = Math.min(startIndex, Math.max(0, sorted.length - 1));
  const endIndex = Math.min(sorted.length, safeStart + visibleCount);
  const visibleRows = sorted.slice(safeStart, endIndex);
  const topPad = safeStart * rowHeight;
  const bottomPad = Math.max(0, (sorted.length - endIndex) * rowHeight);

  // Load the next page when the user scrolls near the bottom. A ref guard
  // prevents duplicate requests before isFetchingNextPage flips to true.
  const loadingRef = useRef(false);
  const handleScroll = () => {
    const el = scrollRef.current;
    updateHScrollbarRef.current();
    if (!el) return;
    const next = Math.max(
      0,
      Math.floor(el.scrollTop / rowHeight) - ROW_OVERSCAN,
    );
    if (next !== startIndexRef.current) {
      // Mark the pending target so a burst of scroll events coalesces into a
      // single commit, then flush it synchronously next frame.
      startIndexRef.current = next;
      if (scrollRafRef.current == null) {
        scrollRafRef.current = requestAnimationFrame(() => {
          scrollRafRef.current = null;
          const node = scrollRef.current;
          if (!node) return;
          // Recompute from the live DOM: sorting or a list swap can move
          // scrollTop after this frame was queued, so a cached index would be
          // stale. The synchronous commit puts the right rows in before paint.
          const target = Math.max(
            0,
            Math.floor(node.scrollTop / rowHeight) - ROW_OVERSCAN,
          );
          startIndexRef.current = target;
          flushSync(() => setStartIndex(target));
        });
      }
    }
    if (!hasNextPage || isFetchingNextPage || loadingRef.current) {
      return;
    }
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 320) {
      loadingRef.current = true;
      void fetchNextPage().finally(() => {
        loadingRef.current = false;
      });
    }
  };

  const openSymbol = (symbol: string) => {
    // Dragging to copy a cell's value should not navigate.
    if (typeof window !== "undefined" && window.getSelection()?.toString()) {
      return;
    }
    router.push(`/symbol/${assetType}/${symbol}`);
  };

  const toggleSort = (key: SortKey) => {
    // A drag ends with a pointerup that can still emit a click on the header
    // button; ignore that stray click so dragging never changes the sort.
    if (justDraggedRef.current) return;
    // Sorting reorders the virtualized window; jump back to the top so the
    // user does not land in the middle of a freshly sorted list.
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    startIndexRef.current = 0;
    setStartIndex(0);
    if (key === sortKey) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDir(TEXT_SORT_KEYS.has(key) ? "asc" : "desc");
  };

  const startResize = (event: ReactPointerEvent<HTMLSpanElement>, id: string) => {
    event.preventDefault();
    event.stopPropagation();
    resizeRef.current = {
      id,
      startX: event.clientX,
      startWidth: widthOf(id),
      startTotal: totalWidth,
    };
    pendingWidthRef.current = widthOf(id);
    setResizingId(id);
  };

  // --- Column reorder via Pointer Events (no HTML5 DnD, no extra package). ---
  // The gesture starts on the header cell; a small movement threshold keeps a
  // plain click available for sorting. Drag state lives in refs and all visual
  // feedback is applied to the DOM directly, so dragging never re-renders the
  // (virtualized) table. This also avoids the native-DnD pitfalls where a
  // button or text selection silently swallows dragstart.
  type ColDrag = {
    id: string;
    label: string;
    startX: number;
    startY: number;
    active: boolean;
  };
  const colDragRef = useRef<ColDrag | null>(null);
  const dragTargetRef = useRef<string | null>(null);
  const justDraggedRef = useRef(false);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const startColDrag = (
    event: ReactPointerEvent<HTMLTableCellElement>,
    col: Column,
  ) => {
    if (event.button !== 0 || resizeRef.current) return;
    colDragRef.current = {
      id: col.id,
      label: col.label,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
    };
  };

  useEffect(() => {
    const findTargetCol = (x: number, y: number): string | null => {
      const hit = document.elementFromPoint(x, y)?.closest<HTMLElement>(
        "th[data-col-id]",
      );
      if (hit?.dataset.colId) return hit.dataset.colId;
      // Fallback for pointers over body rows: match by column x-range.
      const ths = tableRef.current?.querySelectorAll<HTMLElement>(
        "thead th[data-col-id]",
      );
      if (!ths) return null;
      for (const node of Array.from(ths)) {
        const r = node.getBoundingClientRect();
        if (x >= r.left && x <= r.right) return node.dataset.colId ?? null;
      }
      return null;
    };

    const clearHighlights = () => {
      tableRef.current
        ?.querySelectorAll(".qt-col-drop-target, .qt-col-drag-source")
        .forEach((el) =>
          el.classList.remove("qt-col-drop-target", "qt-col-drag-source"),
        );
      dragTargetRef.current = null;
    };

    const onMove = (event: PointerEvent) => {
      const drag = colDragRef.current;
      if (!drag) return;
      if (!drag.active) {
        if (
          Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <
          5
        ) {
          return;
        }
        drag.active = true;
        document.body.classList.add("qstock-col-grabbing");
        if (ghostRef.current) {
          ghostRef.current.textContent = drag.label;
          ghostRef.current.style.display = "block";
          tableRef.current
            ?.querySelectorAll(`th[data-col-id="${drag.id}"]`)
            .forEach((el) => el.classList.add("qt-col-drag-source"));
        }
      }
      event.preventDefault();
      if (ghostRef.current) {
        ghostRef.current.style.left = `${event.clientX + 14}px`;
        ghostRef.current.style.top = `${event.clientY + 14}px`;
      }
      const targetId = findTargetCol(event.clientX, event.clientY);
      if (targetId !== dragTargetRef.current) {
        clearHighlights();
        dragTargetRef.current = targetId;
        if (targetId && targetId !== drag.id) {
          tableRef.current
            ?.querySelectorAll(`th[data-col-id="${targetId}"]`)
            .forEach((el) => el.classList.add("qt-col-drop-target"));
        }
        if (targetId === drag.id) {
          tableRef.current
            ?.querySelectorAll(`th[data-col-id="${drag.id}"]`)
            .forEach((el) => el.classList.add("qt-col-drag-source"));
        }
      }
    };

    const onUp = () => {
      const drag = colDragRef.current;
      colDragRef.current = null;
      document.body.classList.remove("qstock-col-grabbing");
      if (ghostRef.current) ghostRef.current.style.display = "none";
      if (!drag?.active) {
        clearHighlights();
        return;
      }
      // Suppress the click that follows pointerup so the sort button does not
      // fire after a drag.
      justDraggedRef.current = true;
      window.setTimeout(() => {
        justDraggedRef.current = false;
      }, 0);
      const targetId = dragTargetRef.current;
      clearHighlights();
      if (!targetId || targetId === drag.id) return;
      setLayout((prev) => {
        const next = prev.order.filter((id) => id !== drag.id);
        const index = next.indexOf(targetId);
        next.splice(index < 0 ? next.length : index, 0, drag.id);
        return { ...prev, order: next };
      });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [setLayout]);

  // Rebuilt only when the locale / identity inputs change, NOT on every
  // scroll render. Previously ~24 objects + render closures were recreated
  // for each virtual-window update, which made the synchronous scroll commit
  // expensive enough to leave a visible blank gap during fast scrolling.
  const baseColumns = useMemo<Column[]>(
    () => [
    {
      id: "symbol",
      key: "symbol",
      label: t("watchlistColCode"),
      render: (row) => (
        <Link
          href={`/symbol/${assetType}/${row.symbol}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[var(--aw-primary,var(--brand-text))] hover:underline"
        >
          {row.symbol}
        </Link>
      ),
    },
    {
      id: "name",
      key: "name",
      label: t("watchlistColName"),
      render: (row) => (
        <span className="block truncate" title={row.name}>
          {row.name}
        </span>
      ),
    },
    {
      id: "price",
      key: "price",
      label: t("watchlistColPrice"),
      render: (row) => <PriceText value={row.price} change={row.percentChange} />,
    },
    {
      id: "percentChange",
      key: "percentChange",
      label: t("watchlistColChg"),
      render: (row) => <ChangePct value={row.percentChange} />,
    },
    {
      id: "change",
      key: "change",
      label: t("constituentsColChange"),
      render: (row) =>
        row.change == null ? (
          <>—</>
        ) : (
          <ChangeAbs value={row.change} />
        ),
    },
    {
      id: "changeSpeed",
      key: "changeSpeed",
      label: t("constituentsColSpeed"),
      render: (row) =>
        row.changeSpeed == null ? (
          <>—</>
        ) : (
          <span
            className={
              row.changeSpeed >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
            }
          >
            {fmtPct(row.changeSpeed)}
          </span>
        ),
    },
    {
      id: "volume",
      key: "volume",
      label: t("volume"),
      render: (row) => fmtCompact(row.volume, locale),
    },
    {
      id: "turnover",
      key: "turnover",
      label: t("turnover"),
      render: (row) => fmtCompact(row.turnover, locale),
    },
    {
      id: "turnoverRate",
      key: "turnoverRate",
      label: t("turnoverRate"),
      render: (row) => fmtPct(row.turnoverRate),
    },
    {
      id: "amplitude",
      key: "amplitude",
      label: t("amplitude"),
      render: (row) => fmtPct(row.amplitude),
    },
    {
      id: "volumeRatio",
      key: "volumeRatio",
      label: t("constituentsColVolumeRatio"),
      render: (row) => fmtNum(row.volumeRatio),
    },
    {
      id: "peTtm",
      key: "peTtm",
      label: t("peTtm"),
      render: (row) =>
        row.peTtm && row.peTtm > 0 ? fmtNum(row.peTtm) : "—",
    },
    {
      id: "pb",
      key: "pb",
      label: t("pbRatio"),
      render: (row) => (row.pb && row.pb > 0 ? fmtNum(row.pb) : "—"),
    },
    {
      id: "dividendYieldTtm",
      key: "dividendYieldTtm",
      label: t("constituentsColDividendYield"),
      render: (row) => fmtPct(row.dividendYieldTtm),
    },
    {
      id: "dividendTtm",
      key: "dividendTtm",
      label: t("constituentsColDividend"),
      render: (row) => fmtNum(row.dividendTtm),
    },
    {
      id: "payoutRatio",
      key: "payoutRatio",
      label: t("constituentsColPayout"),
      render: (row) => fmtPct(row.payoutRatio),
    },
    {
      id: "marketCap",
      key: "marketCap",
      label: t("constituentsColMarketCap"),
      render: (row) => fmtCompact(row.marketCap, locale),
    },
    {
      id: "circulatingMarketCap",
      key: "circulatingMarketCap",
      label: t("constituentsColCirculatingCap"),
      render: (row) => fmtCompact(row.circulatingMarketCap, locale),
    },
    {
      id: "open",
      key: "open",
      label: t("open"),
      render: (row) => fmtNum(row.open),
    },
    {
      id: "prevClose",
      key: "prevClose",
      label: t("constituentsColPrevClose"),
      render: (row) => fmtNum(row.prevClose),
    },
    {
      id: "high",
      key: "high",
      label: t("high"),
      render: (row) => fmtNum(row.high),
    },
    {
      id: "low",
      key: "low",
      label: t("low"),
      render: (row) => fmtNum(row.low),
    },
    {
      id: "bid",
      key: "bid",
      label: t("bid"),
      render: (row) => fmtNum(row.bid),
    },
    {
      id: "ask",
      key: "ask",
      label: t("ask"),
      render: (row) => fmtNum(row.ask),
    },
    {
      id: "bidVol",
      key: "bidVol",
      label: t("constituentsColBidVol"),
      render: (row) => fmtCompact(row.bidVol, locale),
    },
    {
      id: "askVol",
      key: "askVol",
      label: t("constituentsColAskVol"),
      render: (row) => fmtCompact(row.askVol, locale),
    },
    ],
    [t, locale, assetType],
  );

  const columns = useMemo(
    () =>
      order
        .map((id) => baseColumns.find((col) => col.id === id))
        .filter((col): col is Column => col != null),
    [order, baseColumns],
  );
  const totalWidth = useMemo(
    () => columns.reduce((sum, col) => sum + widthOf(col.id), 0),
    [columns, widthOf],
  );
  const stickyWidth = useMemo(
    () =>
      columns.length > 1
        ? widthOf(columns[0].id) + widthOf(columns[1].id)
        : 0,
    [columns, widthOf],
  );

  // Native horizontal scrollbar spans the frozen columns too. Draw our own
  // thumb over just the scrollable region (to the right of the frozen pair).
  const updateHScrollbar = () => {
    const el = scrollRef.current;
    const thumb = hThumbRef.current;
    if (!el || !thumb) return;
    const trackWidth = Math.max(0, el.clientWidth - stickyWidth);
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const ratio =
      trackWidth > 0 && el.scrollWidth > 0
        ? Math.min(1, trackWidth / (el.scrollWidth - stickyWidth || 1))
        : 1;
    const thumbWidth = Math.max(24, Math.min(trackWidth, trackWidth * ratio));
    const maxThumbLeft = Math.max(0, trackWidth - thumbWidth);
    const left = maxScroll > 0 ? (el.scrollLeft / maxScroll) * maxThumbLeft : 0;
    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translateX(${left}px)`;
    thumb.style.visibility = maxScroll > 0 ? "visible" : "hidden";
  };
  updateHScrollbarRef.current = updateHScrollbar;

  useEffect(() => {
    updateHScrollbarRef.current();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateHScrollbarRef.current());
    observer.observe(el);
    return () => observer.disconnect();
  }, [layout, columns.length, stickyWidth]);

  const startHorizontalDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const el = scrollRef.current;
    const thumb = hThumbRef.current;
    if (!el || !thumb) return;
    hDragRef.current = {
      startX: event.clientX,
      startScroll: el.scrollLeft,
      trackWidth: Math.max(0, el.clientWidth - stickyWidth),
      thumbWidth: thumb.offsetWidth,
    };
    setHDragging(true);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-3 py-2 sm:px-4">
        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
          {t("constituentsTab")}
        </h3>
        <span className="text-[11px] tabular-nums text-[var(--muted)]">
          {t("constituentsLoaded", { loaded: rows.length, total })}
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="qt-scroll qt-scroll-hide-x absolute inset-0 overflow-auto"
        >
          {query.isPending ? (
          <div className="p-4">
            <PanelSkeleton rows={8} label={tCommon("loading")} />
          </div>
        ) : isError && !rows.length ? (
          <div className="flex min-h-[180px] items-center justify-center px-4 text-center text-[13px] text-[var(--muted)]">
            {query.isError ? t("constituentsError") : t("constituentsEmpty")}
          </div>
        ) : (
          <table
            ref={tableRef}
            className="table-fixed border-separate border-spacing-0 text-[13px]"
            style={
              {
                width: totalWidth,
                ...Object.fromEntries(
                  columns.map((col) => [
                    `--cw-${col.id}`,
                    `${widthOf(col.id)}px`,
                  ]),
                ),
              } as CSSProperties
            }
          >
            <colgroup>
              {columns.map((col) => (
                <col key={col.id} style={{ width: `var(--cw-${col.id})` }} />
              ))}
            </colgroup>
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-[var(--muted)]">
                {columns.map((col, index) => (
                  <HeaderCell
                    key={col.id}
                    col={col}
                    index={index}
                    firstColId={columns[0]?.id ?? col.id}
                    sticky={index < 2}
                    active={col.key != null && col.key === sortKey}
                    sortDir={sortDir}
                    onToggleSort={toggleSort}
                    onStartResize={startResize}
                    onResizeHover={applyResizeHover}
                    onStartDrag={startColDrag}
                    hint={t("constituentsColumnHint")}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {topPad > 0 ? (
                <tr aria-hidden="true" className="pointer-events-none">
                  <td
                    colSpan={columns.length}
                    style={{ height: topPad, padding: 0, border: 0 }}
                  />
                </tr>
              ) : null}
              {visibleRows.map((row, index) => (
                <tr
                  ref={index === 0 ? measureRowRef : undefined}
                  key={`${assetType}:${row.symbol}`}
                  onClick={() => openSymbol(row.symbol)}
                  className="group cursor-pointer"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={col.id}
                      data-resize-col={col.id}
                      className={`${colIndex < 2 ? "sticky z-10 bg-[var(--panel)]" : ""} whitespace-nowrap border-b border-[var(--border)]/70 px-2 py-2.5 tabular-nums ${
                        colIndex < 2
                          ? "group-hover:bg-[color-mix(in_srgb,var(--sidebar-hover)_50%,var(--panel))]"
                          : "group-hover:bg-[var(--sidebar-hover)]/50"
                      }`}
                      style={{
                        width: `var(--cw-${col.id})`,
                        left:
                          colIndex === 0
                            ? 0
                            : colIndex === 1
                              ? `var(--cw-${columns[0].id})`
                              : undefined,
                      }}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
              {bottomPad > 0 ? (
                <tr aria-hidden="true" className="pointer-events-none">
                  <td
                    colSpan={columns.length}
                    style={{ height: bottomPad, padding: 0, border: 0 }}
                  />
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
        </div>
        <div
          className="absolute bottom-0 right-0 z-20 h-2.5 bg-[var(--panel)]"
          style={{ left: stickyWidth }}
        >
          <div
            ref={hThumbRef}
            onPointerDown={startHorizontalDrag}
            data-dragging={hDragging ? "true" : undefined}
            className="qt-h-thumb absolute left-0 top-0"
          />
        </div>
      </div>
      {/* Ghost label that follows the pointer while reordering columns. */}
      <div
        ref={ghostRef}
        className="qt-col-drag-ghost pointer-events-none fixed z-[100] hidden rounded border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-[12px] font-medium text-[var(--foreground)] shadow-lg"
      />
      {!isPending && rows.length > 0 && (isFetchingNextPage || isFetchNextPageError) ? (
        <div className="flex min-h-12 shrink-0 items-center justify-center gap-2 border-t border-[var(--border)]/60 px-3 py-2 text-[11px] text-[var(--muted)]">
          {isFetchingNextPage ? (
            <>
              <Spinner className="h-3.5 w-3.5 shrink-0" />
              <span>{t("constituentsLoadingMore")}</span>
            </>
          ) : (
            <>
              <span>{t("constituentsError")}</span>
              <button
                type="button"
                className="rounded border border-[var(--border)] px-2 py-0.5 text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                onClick={() => void fetchNextPage()}
              >
                {tCommon("retry")}
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

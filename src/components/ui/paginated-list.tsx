"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";

type Props<T> = {
  items: T[];
  pageSize?: number;
  /** Stable identity for the dataset (e.g. symbol+tab); resets to page 1 when it changes. */
  resetKey?: string;
  empty?: ReactNode;
  /** Classes for the `<ul>` (default vertical stack). */
  listClassName?: string;
  /**
   * `spread` — prev / pages / next across full width (dense tabs).
   * `compact` — centered cluster, no redundant “n / total” (marketing grids).
   */
  variant?: "spread" | "compact";
  /** Smaller controls for tight panels / drawers. */
  dense?: boolean;
  /**
   * Stretch in a flex parent and keep the pager pinned to the bottom
   * (does not sit right under short card grids).
   */
  pinPager?: boolean;
  renderItem: (item: T, index: number) => ReactNode;
};

function pageWindow(current: number, total: number, max = 5): number[] {
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = start + max - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - max + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function pagerLabels(locale: string) {
  const zh = locale.startsWith("zh");
  return {
    prev: zh ? "上一页" : "Prev",
    next: zh ? "下一页" : "Next",
  };
}

/**
 * Client-side list pager. Page indicator is plain text (no next-intl ICU)
 * to avoid FORMATTING_ERROR / raw keys like "common.pageOf".
 */
export function PaginatedList<T>({
  items,
  pageSize = 8,
  resetKey,
  empty,
  listClassName = "space-y-3",
  variant = "spread",
  dense = false,
  pinPager = false,
  renderItem,
}: Props<T>) {
  const locale = useLocale();
  const labels = pagerLabels(locale);
  const [page, setPage] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize, items.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goTo = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next));
    if (clamped === page) return;
    setPage(clamped);
    requestAnimationFrame(() => {
      if (pinPager) {
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } else if (!dense) {
        rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  if (items.length === 0) {
    if (!pinPager) return <>{empty}</>;
    return (
      <div className="flex min-h-0 flex-1 flex-col">{empty}</div>
    );
  }

  const pages = pageWindow(page, totalPages);
  const showPager = totalPages > 1;
  const btnH = dense
    ? "h-7 min-w-7 px-2 text-[12px]"
    : "h-8 min-w-8 px-2 text-[12px]";
  const navH = dense
    ? "h-7 shrink-0 px-2 text-[12px]"
    : "h-8 shrink-0 px-2.5 text-[12px] sm:px-3";

  const rootClass = pinPager
    ? "flex min-h-0 flex-1 flex-col scroll-mt-24"
    : `scroll-mt-24 ${
        variant === "compact"
          ? dense
            ? "space-y-2"
            : "space-y-8"
          : "space-y-3"
      }`;

  const listClass = pinPager
    ? `min-h-0 flex-1 overflow-y-auto ${listClassName}`
    : listClassName;

  const pagerClass =
    variant === "compact"
      ? `flex shrink-0 items-center justify-center gap-0.5${pinPager ? " mt-auto pt-2" : dense ? " pt-1.5" : ""}`
      : `${pinPager ? "mt-auto pt-2" : "mt-2"} grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2`;

  return (
    <div ref={rootRef} className={rootClass} data-pager="paginated-list-v2">
      <ul ref={listRef} className={listClass}>
        {slice.map((item, i) => renderItem(item, (page - 1) * pageSize + i))}
      </ul>
      {showPager ? (
        <div className={pagerClass}>
          <button
            type="button"
            className={`qt-btn qt-btn-ghost leading-none tracking-[-0.12px] disabled:opacity-40 ${navH}`}
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            aria-label={labels.prev}
          >
            {dense || variant === "compact" ? (
              dense ? (
                <span aria-hidden>‹</span>
              ) : (
                labels.prev
              )
            ) : (
              <>
                <span className="sm:hidden" aria-hidden>
                  ‹
                </span>
                <span className="hidden sm:inline">{labels.prev}</span>
              </>
            )}
          </button>
          <div
            className={
              variant === "compact"
                ? "flex items-center gap-0.5"
                : "flex min-w-0 items-center justify-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            }
          >
            {dense ? (
              <span className="px-2 text-[12px] tabular-nums text-[var(--muted)]">
                {page} / {totalPages}
              </span>
            ) : (
              pages.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-label={`${p} / ${totalPages}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`qt-btn shrink-0 leading-none tracking-[-0.12px] ${btnH} ${
                    p === page
                      ? "qt-btn-primary"
                      : "qt-btn-ghost text-[var(--aw-ink-muted-48,var(--muted))]"
                  }`}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              ))
            )}
            {!dense && variant === "spread" ? (
              <span className="ml-1 hidden shrink-0 text-[12px] tabular-nums tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))] sm:inline">
                {page} / {totalPages}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className={`qt-btn qt-btn-ghost leading-none tracking-[-0.12px] disabled:opacity-40 ${navH}`}
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
            aria-label={labels.next}
          >
            {dense || variant === "compact" ? (
              dense ? (
                <span aria-hidden>›</span>
              ) : (
                labels.next
              )
            ) : (
              <>
                <span className="sm:hidden" aria-hidden>
                  ›
                </span>
                <span className="hidden sm:inline">{labels.next}</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

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
  renderItem,
}: Props<T>) {
  const locale = useLocale();
  const labels = pagerLabels(locale);
  const [page, setPage] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
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
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (items.length === 0) {
    return <>{empty}</>;
  }

  const pages = pageWindow(page, totalPages);

  return (
    <div
      ref={rootRef}
      className="space-y-3 scroll-mt-24"
      data-pager="paginated-list-v2"
    >
      <ul className="space-y-3">
        {slice.map((item, i) => renderItem(item, (page - 1) * pageSize + i))}
      </ul>
      {totalPages > 1 && (
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 border-t border-[var(--border)] pt-3 sm:gap-2">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-8 shrink-0 px-2.5 text-xs disabled:opacity-40 sm:px-3"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            aria-label={labels.prev}
          >
            <span className="sm:hidden" aria-hidden>
              ‹
            </span>
            <span className="hidden sm:inline">{labels.prev}</span>
          </button>
          <div className="flex min-w-0 items-center justify-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden">
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                aria-label={`${p} / ${totalPages}`}
                aria-current={p === page ? "page" : undefined}
                className={`qt-btn h-8 min-w-7 shrink-0 px-1.5 text-xs tabular-nums sm:min-w-8 sm:px-2 ${
                  p === page
                    ? "qt-btn-primary"
                    : "qt-btn-ghost text-[var(--muted)]"
                }`}
                onClick={() => goTo(p)}
              >
                {p}
              </button>
            ))}
            <span className="ml-0.5 hidden shrink-0 text-xs tabular-nums text-[var(--muted)] sm:ml-1 sm:inline">
              {page} / {totalPages}
            </span>
          </div>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-8 shrink-0 px-2.5 text-xs disabled:opacity-40 sm:px-3"
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
            aria-label={labels.next}
          >
            <span className="sm:hidden" aria-hidden>
              ›
            </span>
            <span className="hidden sm:inline">{labels.next}</span>
          </button>
        </div>
      )}
    </div>
  );
}

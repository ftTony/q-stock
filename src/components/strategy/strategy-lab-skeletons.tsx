import type { ReactNode } from "react";

const CARD_GRID =
  "grid w-full content-start items-start gap-3 sm:grid-cols-2 xl:grid-cols-3";

const HISTORY_COL =
  "grid grid-cols-[minmax(7rem,1.4fr)_4.25rem_minmax(9rem,1.2fr)_3.75rem_4.75rem_4.25rem_3.5rem_5.25rem] items-center gap-x-3 px-3";

function TemplateCardSkeleton() {
  return (
    <li className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/5 max-w-[9rem] animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="h-4 w-14 animate-pulse rounded bg-[var(--surface-2)]" />
        </div>
        <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-[var(--surface-2)]" />
      </div>
      <div className="mt-2.5 space-y-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--surface-2)]" />
      </div>
      <div className="mt-2.5 flex gap-1.5">
        <div className="h-5 w-10 animate-pulse rounded border border-[var(--border)] bg-[var(--surface-2)]" />
        <div className="h-5 w-10 animate-pulse rounded border border-[var(--border)] bg-[var(--surface-2)]" />
        <div className="h-5 w-10 animate-pulse rounded border border-[var(--border)] bg-[var(--surface-2)]" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-3 w-14 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="h-3 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="ml-auto h-7 w-12 animate-pulse rounded-md bg-[var(--surface-2)]" />
      </div>
    </li>
  );
}

function HistoryRowSkeleton() {
  return (
    <li className="border-b border-[var(--border)] last:border-0">
      <div className={`${HISTORY_COL} py-2.5`} aria-hidden>
        <div className="h-3.5 w-24 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="h-3.5 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="h-3 w-36 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="h-5 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="ml-auto h-3.5 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="ml-auto h-3.5 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="ml-auto h-3.5 w-6 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
      </div>
    </li>
  );
}

/** Skeleton grid matching template / mine cards while the list loads. */
export function StrategyLabCardGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <ul className={CARD_GRID} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <TemplateCardSkeleton key={i} />
      ))}
    </ul>
  );
}

export function StrategyLabHistorySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]"
      aria-hidden
    >
      <div className="min-w-[44rem]">
        <div
          className={`${HISTORY_COL} border-b border-[var(--border)] bg-[var(--surface-2)] py-2`}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className={`h-3 animate-pulse rounded bg-[var(--border)] ${
                i >= 4 ? "ml-auto w-10" : "w-12"
              }`}
            />
          ))}
        </div>
        <ul>
          {Array.from({ length: count }, (_, i) => (
            <HistoryRowSkeleton key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function StrategyLabEmptyPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[12rem] flex-1 items-start justify-center pt-6 sm:pt-10">
      <div className="max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] px-5 py-8 text-center text-sm leading-relaxed text-[var(--muted)]">
        {children}
      </div>
    </div>
  );
}

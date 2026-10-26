import type { ReactNode } from "react";

const CARD_GRID =
  "grid w-full content-start items-start gap-3 sm:grid-cols-2 xl:grid-cols-3";

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
    <li className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5 last:border-0">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3.5 w-32 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="h-3 w-40 animate-pulse rounded bg-[var(--surface-2)]" />
      </div>
      <div className="h-3.5 w-12 shrink-0 animate-pulse rounded bg-[var(--surface-2)]" />
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
    <ul
      className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]"
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <HistoryRowSkeleton key={i} />
      ))}
    </ul>
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

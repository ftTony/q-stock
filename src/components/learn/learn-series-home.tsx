import { Link } from "@/i18n/routing";
import type { LearnSeriesTocItem } from "@/components/learn/learn-series-toc";

/** Drop a leading "01 " only when it duplicates the series index we already show. */
export function bareSeriesLabel(label: string, index?: number): string {
  const trimmed = label.trim();
  if (index == null) return trimmed;
  const padded = String(index).padStart(2, "0");
  if (trimmed.startsWith(`${padded} `)) {
    return trimmed.slice(padded.length + 1).trim();
  }
  // "1 Foo" but not "10 万…" (content that starts with a number ≥10).
  if (index < 10 && trimmed.startsWith(`${index} `)) {
    return trimmed.slice(String(index).length + 1).trim();
  }
  return trimmed;
}

function DocIcon() {
  return (
    <svg
      aria-hidden
      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)]"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M4 1.5h5.5L13 5v9.5H4v-13z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 1.5V5H13M6 8h4M6 10.5h4M6 13h2.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type LearnSeriesHomeBlock = {
  id: string;
  seriesTitle: string;
  hint: string;
  items: LearnSeriesTocItem[];
  startHref: string;
};

/** Featured path: full outline + primary CTA. */
export function LearnSeriesSpotlight({
  catalogTitle,
  seriesTitle,
  hint,
  startLabel,
  startHref,
  items,
  lessonCountLabel,
}: {
  catalogTitle: string;
  seriesTitle: string;
  hint: string;
  startLabel: string;
  startHref: string;
  items: LearnSeriesTocItem[];
  lessonCountLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--panel)]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[var(--brand-text)]">
            {catalogTitle}
            <span className="mx-1.5 text-[var(--muted)]">·</span>
            <span className="tabular-nums text-[var(--muted)]">
              {lessonCountLabel}
            </span>
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">
            {seriesTitle}
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--muted)] sm:text-[13px]">
            {hint}
          </p>
        </div>
        <Link
          href={startHref}
          className="qt-btn qt-btn-primary h-9 shrink-0 px-3 text-sm"
        >
          {startLabel}
        </Link>
      </div>
      <ol className="divide-y divide-[var(--border)] sm:grid sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.slug}
            className="sm:border-b sm:border-[var(--border)]"
          >
            <Link
              href={`/learn/${item.slug}`}
              className="flex gap-2.5 px-5 py-3 text-[13px] leading-snug text-[var(--foreground)]/85 transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--brand-text)]"
            >
              <DocIcon />
              <span className="min-w-0">
                <span className="mr-1.5 tabular-nums text-[11px] text-[var(--muted)]">
                  {String(item.index).padStart(2, "0")}
                </span>
                {bareSeriesLabel(item.label, item.index)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Secondary courses: CTA + collapsed outline.
 * Lessons stay in the DOM (open details / crawler) without eating the first viewport.
 */
export function LearnSeriesCompact({
  seriesTitle,
  hint,
  startLabel,
  startHref,
  items,
  lessonCountLabel,
  expandLabel,
}: {
  seriesTitle: string;
  hint: string;
  startLabel: string;
  startHref: string;
  items: LearnSeriesTocItem[];
  lessonCountLabel: string;
  expandLabel: string;
}) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--panel)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
            {seriesTitle}
            <span className="ml-2 text-[11px] font-normal tabular-nums text-[var(--muted)]">
              {lessonCountLabel}
            </span>
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">
            {hint}
          </p>
        </div>
        <Link
          href={startHref}
          className="qt-btn qt-btn-ghost h-8 shrink-0 px-2.5 text-xs"
        >
          {startLabel}
        </Link>
      </div>
      <details className="border-t border-[var(--border)]">
        <summary className="cursor-pointer list-none px-4 py-2 text-[11px] text-[var(--muted)] marker:content-none hover:text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
          {expandLabel}
        </summary>
        <ol className="px-2 pb-2 sm:grid sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/learn/${item.slug}`}
                className="flex gap-2 rounded-md px-2.5 py-2 text-[13px] leading-snug text-[var(--foreground)]/80 hover:bg-[var(--surface-2)] hover:text-[var(--brand-text)]"
              >
                <span className="tabular-nums text-[11px] text-[var(--muted)]">
                  {String(item.index).padStart(2, "0")}
                </span>
                {bareSeriesLabel(item.label, item.index)}
              </Link>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

import { Link } from "@/i18n/routing";
import { bareSeriesLabel } from "@/components/learn/learn-series-home";

export type LearnSeriesTocItem = {
  slug: string;
  label: string;
  index: number;
};

/** @deprecated Prefer bareSeriesLabel(label, index). */
function bareLabel(label: string, index?: number): string {
  return bareSeriesLabel(label, index);
}

type Props = {
  catalogTitle: string;
  seriesTitle: string;
  currentSlug: string;
  items: LearnSeriesTocItem[];
  /** Compact strip for mobile / narrow rails. */
  compact?: boolean;
};

function DocIcon({ active }: { active?: boolean }) {
  return (
    <svg
      aria-hidden
      className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
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

/** Course-style outline for a Learn series (left rail or mobile block). */
export function LearnSeriesToc({
  catalogTitle,
  seriesTitle,
  currentSlug,
  items,
  compact,
}: Props) {
  return (
    <nav
      aria-label={catalogTitle}
      className={
        compact
          ? "rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4"
          : "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]"
      }
    >
      <div className={compact ? "" : "border-b border-[var(--border)] px-4 py-3"}>
        <p className="text-[13px] font-semibold tracking-tight text-[var(--foreground)]">
          {catalogTitle}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-[var(--muted)]">
          {seriesTitle}
        </p>
      </div>
      <ol className={compact ? "mt-3 space-y-0.5" : "px-2 py-2"}>
        {items.map((item) => {
          const active = item.slug === currentSlug;
          return (
            <li key={item.slug}>
              <Link
                href={`/learn/${item.slug}`}
                aria-current={active ? "page" : undefined}
                className={`flex gap-2.5 rounded-lg px-2.5 py-2 text-[13px] leading-snug transition-colors ${
                  active
                    ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                    : "text-[var(--foreground)]/80 hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                }`}
              >
                <DocIcon active={active} />
                <span className="min-w-0">
                  <span className="mr-1.5 tabular-nums text-[11px] text-[var(--muted)]">
                    {String(item.index).padStart(2, "0")}
                  </span>
                  {bareLabel(item.label, item.index)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Bottom pager: previous / next within the same series. */
export function LearnSeriesPager({
  prevLabel,
  nextLabel,
  prev,
  next,
}: {
  prevLabel: string;
  nextLabel: string;
  prev: LearnSeriesTocItem | null;
  next: LearnSeriesTocItem | null;
}) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label={`${prevLabel} / ${nextLabel}`}
      className="mt-10 grid max-w-2xl gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/learn/${prev.slug}`}
          className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 transition-colors hover:border-[var(--brand)]/40"
        >
          <p className="text-[11px] text-[var(--muted)]">{prevLabel}</p>
          <p className="mt-1 text-sm font-medium leading-snug text-[var(--foreground)]">
            {String(prev.index).padStart(2, "0")} ·{" "}
            {bareLabel(prev.label, prev.index)}
          </p>
        </Link>
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/learn/${next.slug}`}
          className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-right transition-colors hover:border-[var(--brand)]/40 sm:justify-self-stretch"
        >
          <p className="text-[11px] text-[var(--muted)]">{nextLabel}</p>
          <p className="mt-1 text-sm font-medium leading-snug text-[var(--brand-text)]">
            {String(next.index).padStart(2, "0")} ·{" "}
            {bareLabel(next.label, next.index)}
          </p>
        </Link>
      ) : null}
    </nav>
  );
}

export {
  LearnSeriesSpotlight,
  LearnSeriesCompact,
} from "@/components/learn/learn-series-home";

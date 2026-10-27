"use client";

import { Link } from "@/i18n/routing";
import type {
  MarketSentiment,
  PortfolioNewsItem,
} from "@/components/portfolio/types";

type Props = {
  news: PortfolioNewsItem[];
  sentiment: MarketSentiment | null;
  bullish: number;
  bearish: number;
  neutral: number;
  labels: {
    narrative: string;
    viewAll: string;
    unavailable: string;
    sentiment: string;
    bullish: string;
    neutral: string;
    bearish: string;
    sentimentHint: string;
  };
};

export function PortfolioAside({
  news,
  sentiment,
  bullish,
  bearish,
  neutral,
  labels,
}: Props) {
  return (
    <section className="qt-panel grid overflow-hidden lg:grid-cols-2 lg:divide-x lg:divide-[var(--border)]">
      <div className="flex min-h-0 flex-col border-b border-[var(--border)] p-4 lg:border-b-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">
            {labels.narrative}
          </h2>
          <Link
            href="/markets"
            className="text-xs text-[var(--brand-text)] hover:underline"
          >
            {labels.viewAll}
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {news.length === 0 && (
            <li className="py-6 text-sm text-[var(--muted)]">
              {labels.unavailable}
            </li>
          )}
          {news.map((n, i) => (
            <li key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              {n.image ? (
                <div className="h-12 w-12 shrink-0 overflow-hidden bg-[var(--surface-2)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={n.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-[10px] tracking-wide text-[var(--muted)] uppercase">
                  {n.category || n.source || "MARKET"}
                </div>
                <a
                  href={n.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="line-clamp-2 text-sm font-medium leading-snug hover:text-[var(--brand-text)]"
                >
                  {n.headline}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-h-0 flex-col p-4">
        <h2 className="text-sm font-semibold tracking-tight">
          {labels.sentiment}
        </h2>
        {sentiment?.available === false ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {sentiment.message || labels.unavailable}
          </p>
        ) : (
          <>
            <div className="mt-4 flex h-2 overflow-hidden rounded-sm bg-[var(--surface-2)]">
              <div className="bg-[var(--up)]" style={{ width: `${bullish}%` }} />
              <div
                className="bg-[var(--muted)]"
                style={{ width: `${neutral}%` }}
              />
              <div
                className="bg-[var(--down)]"
                style={{ width: `${bearish}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold tabular-nums text-[var(--up)]">
                  {bullish.toFixed(0)}%
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  {labels.bullish}
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold tabular-nums text-[var(--muted)]">
                  {neutral.toFixed(0)}%
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  {labels.neutral}
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold tabular-nums text-[var(--down)]">
                  {bearish.toFixed(0)}%
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  {labels.bearish}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
              {labels.sentimentHint}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

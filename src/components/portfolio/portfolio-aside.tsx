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
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="qt-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{labels.narrative}</h2>
          <Link href="/" className="text-xs text-[var(--brand-text)]">
            {labels.viewAll}
          </Link>
        </div>
        <ul className="space-y-3">
          {news.length === 0 && (
            <li className="text-sm text-[var(--muted)]">{labels.unavailable}</li>
          )}
          {news.map((n, i) => (
            <li
              key={i}
              className="flex gap-3 border-b border-[var(--border)] pb-3 last:border-0"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                {n.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-[var(--muted)]">
                    NEWS
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="mb-1 text-[10px] tracking-wide text-[var(--muted)] uppercase">
                  {n.category || n.source || "MARKET"}
                </div>
                <a
                  href={n.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="line-clamp-2 text-sm font-medium hover:text-[var(--brand-text)]"
                >
                  {n.headline}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="qt-panel p-4">
        <h2 className="mb-4 font-semibold">{labels.sentiment}</h2>
        {sentiment?.available === false ? (
          <p className="text-sm text-[var(--muted)]">
            {sentiment.message || labels.unavailable}
          </p>
        ) : (
          <>
            <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="bg-[var(--up)]" style={{ width: `${bullish}%` }} />
              <div className="bg-[var(--muted)]" style={{ width: `${neutral}%` }} />
              <div className="bg-[var(--down)]" style={{ width: `${bearish}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-semibold text-[var(--up)]">
                  {bullish.toFixed(0)}%
                </div>
                <div className="text-xs uppercase text-[var(--muted)]">
                  {labels.bullish}
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold text-[var(--muted)]">
                  {neutral.toFixed(0)}%
                </div>
                <div className="text-xs uppercase text-[var(--muted)]">
                  {labels.neutral}
                </div>
              </div>
              <div>
                <div className="text-xl font-semibold text-[var(--down)]">
                  {bearish.toFixed(0)}%
                </div>
                <div className="text-xs uppercase text-[var(--muted)]">
                  {labels.bearish}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--muted)]">
              {labels.sentimentHint}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

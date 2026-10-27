"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IpoPanel } from "@/components/market/ipo-panel";
import type { AssetType } from "@/lib/types";

type NewsItem = {
  headline: string;
  url?: string;
  image?: string;
  category?: string;
  source?: string;
  datetime?: number;
};

type Sentiment = {
  available?: boolean;
  message?: string;
  bullish_pct?: number;
  bearish_pct?: number;
} | null;

/** Client-only relative age — avoids Date.now() SSR/client hydration skew. */
function NewsAgeMinutes({ datetime }: { datetime: number }) {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const mins = Math.max(1, Math.round((Date.now() / 1000 - datetime) / 60));
    setLabel(`${mins}m`);
  }, [datetime]);
  if (!label) return null;
  return <span suppressHydrationWarning>{label}</span>;
}

export function MarketsAsidePanels({
  tab,
  news,
  sentiment,
}: {
  tab: AssetType;
  news: NewsItem[];
  sentiment: Sentiment;
}) {
  const t = useTranslations("market");
  const bullish = sentiment?.bullish_pct ?? 0;
  const bearish = sentiment?.bearish_pct ?? 0;
  const neutral = Math.max(0, 100 - bullish - bearish);

  return (
    <section className="qt-panel grid overflow-hidden lg:grid-cols-2 lg:divide-x lg:divide-[var(--border)]">
      <div className="flex min-h-0 flex-col border-b border-[var(--border)] p-4 lg:border-b-0">
        <h2 className="text-sm font-semibold tracking-tight">{t("narrative")}</h2>
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {news.length === 0 && (
            <li className="py-6 text-sm text-[var(--muted)]">
              {t("unavailable")}
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
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] tracking-wide text-[var(--muted)] uppercase">
                  <span>{n.category || n.source || "MARKET"}</span>
                  {n.datetime ? <NewsAgeMinutes datetime={n.datetime} /> : null}
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

      {tab === "hk" ? (
        <div className="min-h-0 p-0">
          <IpoPanel assetType="hk" embedded />
        </div>
      ) : (
        <div className="flex min-h-0 flex-col p-4">
          <h2 className="text-sm font-semibold tracking-tight">
            {t("sentiment")}
          </h2>
          {sentiment?.available === false ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              {sentiment.message || t("unavailable")}
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
                    {t("bullish")}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold tabular-nums text-[var(--muted)]">
                    {neutral.toFixed(0)}%
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {t("neutral")}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold tabular-nums text-[var(--down)]">
                    {bearish.toFixed(0)}%
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {t("bearish")}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
                {t("sentimentHint")}
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}

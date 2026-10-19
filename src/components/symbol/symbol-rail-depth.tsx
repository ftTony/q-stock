"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useRailDepth } from "@/components/symbol/use-rail-depth";
import { formatNumber, formatTime } from "@/lib/format-number";
import type { DepthBook, TradeTick } from "@/lib/market/book-types";
import type { AssetType } from "@/lib/types";

type Mode = "book" | "ticks" | "split";

function fmtPx(n: number) {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function fmtVol(n: number) {
  if (n >= 1e6) return `${formatNumber(n / 1e6, { maximumFractionDigits: 2 })}M`;
  if (n >= 1e3) return `${formatNumber(n / 1e3, { maximumFractionDigits: 1 })}K`;
  return formatNumber(n, { maximumFractionDigits: 0 });
}

function TickPrice({ trade }: { trade: TradeTick }) {
  return (
    <span
      className={`truncate text-right font-medium ${
        trade.direction === "up"
          ? "text-[var(--up)]"
          : trade.direction === "down"
            ? "text-[var(--down)]"
            : "text-[var(--foreground)]"
      }`}
    >
      {fmtPx(trade.price)}
    </span>
  );
}

function TicksList({
  trades,
  title,
  empty,
  cols,
  limit,
}: {
  trades: TradeTick[];
  title: string;
  empty: string;
  cols: { time: string; price: string; volume: string };
  /** Cap rows when embedded in a long rail page (no nested scroll). */
  limit?: number;
}) {
  const rows = limit != null ? trades.slice(0, limit) : trades;
  const mid = Math.ceil(rows.length / 2);
  const pairs = Array.from({ length: mid }, (_, i) => [rows[i], rows[i + mid]] as const);
  const grid =
    "grid grid-cols-[3.6rem_minmax(0,1fr)_3rem_3.6rem_minmax(0,1fr)_3rem] items-center gap-x-1.5";
  const head =
    "whitespace-nowrap text-[12px] leading-none tracking-[-0.12px] text-[var(--aw-ink-muted-48,var(--muted))]";
  return (
    <div className="px-2 py-2">
      <p className="text-[12px] font-semibold leading-none tracking-[-0.12px] text-[var(--aw-ink,var(--foreground))]">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 text-[12px] leading-[1.47] tracking-[-0.12px] text-[var(--muted)]">
          {empty}
        </p>
      ) : (
        <div className="mt-1.5">
          <div className={`${grid} border-b border-[var(--aw-hairline,var(--border))] pb-1 ${head}`}>
            <span>{cols.time}</span>
            <span className="text-right">{cols.price}</span>
            <span className="text-right">{cols.volume}</span>
            <span>{cols.time}</span>
            <span className="text-right">{cols.price}</span>
            <span className="text-right">{cols.volume}</span>
          </div>
          {pairs.map(([left, right], i) => (
            <div
              key={`${left.time}-${i}`}
              className={`${grid} h-[22px] text-[12px] tabular-nums leading-none tracking-[-0.12px]`}
            >
              <span className="truncate text-[var(--aw-ink-muted-48,var(--muted))]">
                {formatTime(left.time * 1000)}
              </span>
              <TickPrice trade={left} />
              <span className="text-right text-[var(--aw-ink-muted-48,var(--muted))]">
                {fmtVol(left.volume)}
              </span>
              {right ? (
                <>
                  <span className="truncate text-[var(--aw-ink-muted-48,var(--muted))]">
                    {formatTime(right.time * 1000)}
                  </span>
                  <TickPrice trade={right} />
                  <span className="text-right text-[var(--aw-ink-muted-48,var(--muted))]">
                    {fmtVol(right.volume)}
                  </span>
                </>
              ) : (
                <>
                  <span />
                  <span />
                  <span />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookList({
  book,
  labels,
  empty,
}: {
  book: DepthBook | null;
  labels: { bid: string; ask: string; price: string; title: string };
  empty: string;
}) {
  if (!book) {
    return (
      <div className="space-y-2 p-3">
        <p className="text-[12px] font-medium text-[var(--muted)]">{labels.title}</p>
        <p className="text-[12px] leading-relaxed text-[var(--muted)]">{empty}</p>
      </div>
    );
  }
  const maxVol = Math.max(
    1,
    ...book.bids.map((b) => b.volume),
    ...book.asks.map((a) => a.volume),
  );
  return (
    <div className="space-y-2 p-3">
      <p className="text-[12px] font-medium text-[var(--muted)]">{labels.title}</p>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 text-[11px]">
        <div className="text-[var(--muted)]">{labels.bid}</div>
        <div className="text-center text-[var(--muted)]">{labels.price}</div>
        <div className="text-right text-[var(--muted)]">{labels.ask}</div>
      </div>
      <div className="space-y-0.5">
        {Array.from({
          length: Math.max(book.asks.length, book.bids.length),
        }).map((_, i) => {
          const ask = book.asks[i];
          const bid = book.bids[i];
          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 text-[12px] tabular-nums"
            >
              <div className="relative overflow-hidden py-0.5 text-[var(--up)]">
                {bid ? (
                  <>
                    <span
                      className="absolute inset-y-0 right-0 bg-[var(--up)]/10"
                      style={{ width: `${(bid.volume / maxVol) * 100}%` }}
                    />
                    <span className="relative">{fmtVol(bid.volume)}</span>
                  </>
                ) : (
                  <span className="text-[var(--muted)]">—</span>
                )}
              </div>
              <div className="min-w-[4.5rem] text-center font-medium">
                <span className="text-[var(--up)]">{bid ? fmtPx(bid.price) : "—"}</span>
                <span className="mx-1 text-[var(--muted)]">/</span>
                <span className="text-[var(--down)]">{ask ? fmtPx(ask.price) : "—"}</span>
              </div>
              <div className="relative overflow-hidden py-0.5 text-right text-[var(--down)]">
                {ask ? (
                  <>
                    <span
                      className="absolute inset-y-0 left-0 bg-[var(--down)]/10"
                      style={{ width: `${(ask.volume / maxVol) * 100}%` }}
                    />
                    <span className="relative">{fmtVol(ask.volume)}</span>
                  </>
                ) : (
                  <span className="text-[var(--muted)]">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SymbolRailDepth({
  mode,
  symbol,
  assetType,
}: {
  mode: Mode;
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("symbolRail");
  const tSymbol = useTranslations("symbol");
  const tickCols = {
    time: tSymbol("time"),
    price: t("price"),
    volume: tSymbol("volume"),
  };
  const { book, trades, unavailable, locked, detail, loading } = useRailDepth(
    mode,
    symbol,
    assetType,
  );

  if (loading && unavailable === false && !book && !trades.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center px-3 text-[12px] text-[var(--muted)]">
        …
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 px-3 py-8 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">
          {mode === "book" ? t("bookTitle") : t("ticksTitle")}
        </p>
        <p className="max-w-[16rem] text-[12px] leading-relaxed text-[var(--muted)]">
          {mode === "book" ? t("bookEmpty") : t("ticksEmpty")}
        </p>
        {detail ? (
          <p className="max-w-[18rem] break-all text-[11px] leading-relaxed text-[var(--muted)] opacity-80">
            {detail}
          </p>
        ) : null}
        <Link
          href="/advanced-quotes"
          className="text-[12px] text-[var(--brand-text)] hover:underline"
        >
          {t("advancedQuotes")}
        </Link>
      </div>
    );
  }

  if (mode === "split") {
    return (
      <div className="divide-y divide-[var(--border)]">
        {locked || (!book && !trades.length) ? (
          <div className="space-y-1 px-3 py-3 text-center">
            <p className="text-[12px] leading-relaxed text-[var(--muted)]">
              {t("bookEmpty")}
            </p>
            {detail ? (
              <p className="break-all text-[11px] leading-relaxed text-[var(--muted)] opacity-80">
                {detail}
              </p>
            ) : null}
            <Link
              href="/advanced-quotes"
              className="inline-block text-[12px] text-[var(--brand-text)] hover:underline"
            >
              {t("advancedQuotes")} →
            </Link>
          </div>
        ) : null}
        {locked || (!book && !trades.length) ? null : (
          <>
            <TicksList
              trades={trades}
              title={t("ticksTitle")}
              empty={t("ticksEmpty")}
              cols={tickCols}
              limit={24}
            />
            <BookList
              book={book}
              labels={{
                bid: t("bid"),
                ask: t("ask"),
                price: t("price"),
                title: t("bookTitle"),
              }}
              empty={t("bookEmpty")}
            />
          </>
        )}
      </div>
    );
  }

  if (mode === "book") {
    return (
      <BookList
        book={book}
        labels={{
          bid: t("bid"),
          ask: t("ask"),
          price: t("price"),
          title: t("bookTitle"),
        }}
        empty={t("bookEmpty")}
      />
    );
  }

  return (
    <TicksList
      trades={trades}
      title={t("ticksTitle")}
      empty={t("ticksEmpty")}
      cols={tickCols}
    />
  );
}

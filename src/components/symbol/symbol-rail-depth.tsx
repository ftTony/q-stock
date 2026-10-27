"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { EmptyStateBlock } from "@/components/symbol/symbol-empty-art";
import { useRailDepth } from "@/components/symbol/use-rail-depth";
import { RailPanelSkeleton } from "@/components/ui/panel-skeleton";
import { formatNumber, formatTime } from "@/lib/format-number";
import type { DepthBook, TradeTick } from "@/lib/market/book-types";
import type { AssetType } from "@/lib/types";

type Mode = "book" | "ticks" | "split";

function fmtPx(n: number) {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
      className={`truncate text-right tabular-nums ${
        trade.direction === "up"
          ? "text-[var(--up)]"
          : trade.direction === "down"
            ? "text-[var(--down)]"
            : "text-[var(--aw-ink,var(--foreground))]"
      }`}
    >
      {fmtPx(trade.price)}
    </span>
  );
}

function TickTriple({ trade }: { trade: TradeTick }) {
  return (
    <>
      <span className="truncate text-[var(--aw-ink-muted-48,var(--muted))]">
        {formatTime(trade.time * 1000)}
      </span>
      <TickPrice trade={trade} />
      <span className="text-right text-[var(--aw-ink-muted-48,var(--muted))]">
        {fmtVol(trade.volume)}
      </span>
    </>
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
  // Gutter col separates the two tapes so halves don't visually merge.
  const grid =
    "grid grid-cols-[3.25rem_minmax(0,1fr)_2.5rem_0.75rem_3.25rem_minmax(0,1fr)_2.5rem] items-center gap-x-1";
  const head =
    "whitespace-nowrap text-[10px] leading-none tracking-[-0.08px] text-[var(--aw-ink-muted-48,var(--muted))]";
  return (
    <div className="px-3 py-2.5">
      <p className="text-[12px] font-semibold leading-none tracking-[-0.12px] text-[var(--aw-ink,var(--foreground))]">
        {title}
      </p>
      {rows.length === 0 ? (
        <EmptyStateBlock art="depth" label={empty} compact />
      ) : (
        <div className="mt-2">
          <div
            className={`${grid} border-b border-[var(--aw-hairline,var(--border))] pb-1.5 ${head}`}
          >
            <span>{cols.time}</span>
            <span className="text-right">{cols.price}</span>
            <span className="text-right">{cols.volume}</span>
            <span aria-hidden />
            <span>{cols.time}</span>
            <span className="text-right">{cols.price}</span>
            <span className="text-right">{cols.volume}</span>
          </div>
          {pairs.map(([left, right], i) => (
            <div
              key={`${left.time}-${i}`}
              className={`${grid} h-6 text-[11px] tabular-nums leading-none tracking-[-0.1px]`}
            >
              <TickTriple trade={left} />
              <span aria-hidden />
              {right ? (
                <TickTriple trade={right} />
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
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-semibold leading-none tracking-[-0.12px] text-[var(--aw-ink,var(--foreground))]">
          {labels.title}
        </p>
        <EmptyStateBlock art="depth" label={empty} compact />
      </div>
    );
  }
  const maxVol = Math.max(
    1,
    ...book.bids.map((b) => b.volume),
    ...book.asks.map((a) => a.volume),
  );
  return (
    <div className="space-y-2 px-3 py-2.5">
      <p className="text-[12px] font-semibold leading-none tracking-[-0.12px] text-[var(--aw-ink,var(--foreground))]">
        {labels.title}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 text-[10px] leading-none tracking-[-0.08px] text-[var(--aw-ink-muted-48,var(--muted))]">
        <div>{labels.bid}</div>
        <div className="text-center">{labels.price}</div>
        <div className="text-right">{labels.ask}</div>
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
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 text-[11px] tabular-nums leading-none tracking-[-0.1px]"
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
    return <RailPanelSkeleton rows={8} className="min-h-[200px]" />;
  }

  if (unavailable) {
    return (
      <EmptyStateBlock
        art="depth"
        label={mode === "book" ? t("bookEmpty") : t("ticksEmpty")}
        compact
      >
        {detail ? (
          <p className="max-w-[18rem] break-all text-[11px] leading-relaxed text-[var(--muted)] opacity-80">
            {detail}
          </p>
        ) : null}
        <Link
          href="/advanced-quotes"
          className="aw-text-link text-[12px]"
        >
          {t("advancedQuotes")}
        </Link>
      </EmptyStateBlock>
    );
  }

  if (mode === "split") {
    return (
      <div className="divide-y divide-[var(--border)]">
        {locked || (!book && !trades.length) ? (
          <EmptyStateBlock art="depth" label={t("bookEmpty")} compact>
            {detail ? (
              <p className="break-all text-[11px] leading-relaxed text-[var(--muted)] opacity-80">
                {detail}
              </p>
            ) : null}
            <Link href="/advanced-quotes" className="aw-text-link text-[12px]">
              {t("advancedQuotes")} →
            </Link>
          </EmptyStateBlock>
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

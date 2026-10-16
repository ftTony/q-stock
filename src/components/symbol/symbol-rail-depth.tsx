"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber, formatTime } from "@/lib/format-number";
import type { DepthBook, TradeTick } from "@/lib/market/providers/longbridge-book";
import type { AssetType } from "@/lib/types";

type Mode = "book" | "ticks" | "split";

const POLL_MS = 4000;

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

function TicksList({
  trades,
  title,
  empty,
  limit,
}: {
  trades: TradeTick[];
  title: string;
  empty: string;
  /** Cap rows when embedded in a long rail page (no nested scroll). */
  limit?: number;
}) {
  const rows = limit != null ? trades.slice(0, limit) : trades;
  return (
    <div className="space-y-2 p-3">
      <p className="text-[12px] font-medium text-[var(--muted)]">{title}</p>
      {rows.length === 0 ? (
        <p className="text-[12px] leading-relaxed text-[var(--muted)]">{empty}</p>
      ) : (
        <div className="space-y-0.5">
          {rows.map((tr, i) => (
            <div
              key={`${tr.time}-${i}`}
              className="flex items-center justify-between gap-2 text-[12px] tabular-nums"
            >
              <span className="text-[11px] text-[var(--muted)]">
                {formatTime(tr.time * 1000)}
              </span>
              <span
                className={
                  tr.direction === "up"
                    ? "text-[var(--up)]"
                    : tr.direction === "down"
                      ? "text-[var(--down)]"
                      : "text-[var(--foreground)]"
                }
              >
                {fmtPx(tr.price)}
              </span>
              <span className="text-[var(--muted)]">{fmtVol(tr.volume)}</span>
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
  const [book, setBook] = useState<DepthBook | null>(null);
  const [trades, setTrades] = useState<TradeTick[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [locked, setLocked] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopPoll = false;

    function reasonOf(data: { detail?: unknown }): string | null {
      return typeof data.detail === "string" && data.detail.trim()
        ? data.detail.trim()
        : null;
    }

    async function loadBook(): Promise<"ok" | "empty" | "locked"> {
      const res = await fetch(
        `/api/market/depth?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      );
      const data = await res.json();
      if (data.code === "ADVANCED_QUOTES_REQUIRED" || res.status === 403) {
        setBook(null);
        setDetail(reasonOf(data));
        return "locked";
      }
      if (data.unavailable || (!data.bids?.length && !data.asks?.length)) {
        setBook(null);
        setDetail(reasonOf(data));
        return "empty";
      }
      setBook({ bids: data.bids ?? [], asks: data.asks ?? [] });
      return "ok";
    }

    async function loadTicks(): Promise<"ok" | "empty" | "locked"> {
      const res = await fetch(
        `/api/market/trades?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      );
      const data = await res.json();
      if (data.code === "ADVANCED_QUOTES_REQUIRED" || res.status === 403) {
        setTrades([]);
        setDetail((prev) => prev ?? reasonOf(data));
        return "locked";
      }
      if (data.unavailable || !data.trades?.length) {
        setTrades([]);
        setDetail((prev) => prev ?? reasonOf(data));
        return "empty";
      }
      setTrades(data.trades as TradeTick[]);
      return "ok";
    }

    async function load() {
      try {
        const wantBook = mode === "book" || mode === "split";
        const wantTicks = mode === "ticks" || mode === "split";
        const [bookState, tickState] = await Promise.all([
          wantBook ? loadBook() : Promise.resolve("ok" as const),
          wantTicks ? loadTicks() : Promise.resolve("ok" as const),
        ]);
        if (cancelled) return;
        const isLocked = bookState === "locked" || tickState === "locked";
        if (isLocked) stopPoll = true;
        setLocked(isLocked);
        if (bookState === "ok" && tickState === "ok") setDetail(null);
        const failed =
          (wantBook && bookState !== "ok") || (wantTicks && tickState !== "ok");
        setUnavailable(failed && mode !== "split");
        if (mode === "split") setUnavailable(false);
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
      if (!cancelled && !stopPoll) {
        timer = setTimeout(() => void load(), POLL_MS);
      }
    }

    setLoading(true);
    void load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [mode, symbol, assetType]);

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
    <TicksList trades={trades} title={t("ticksTitle")} empty={t("ticksEmpty")} />
  );
}

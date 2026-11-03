import type { ExtendedSessionQuote, Quote } from "@/lib/types";
import { getUsMarketPhase, type UsMarketPhase } from "@/lib/market/session";

export type QuoteDisplay = ExtendedSessionQuote & {
  session: "pre" | "regular" | "post" | "overnight";
};

/** Pick the extended-hours snapshot that should drive primary display. */
export function activeExtendedQuote(
  quote: Pick<Quote, "preMarket" | "postMarket" | "overnight" | "activeSession">,
  phase: UsMarketPhase = getUsMarketPhase(),
): { session: "pre" | "post" | "overnight"; quote: ExtendedSessionQuote } | null {
  if (phase === "pre" && quote.preMarket) {
    return { session: "pre", quote: quote.preMarket };
  }
  if (phase === "post" && quote.postMarket) {
    return { session: "post", quote: quote.postMarket };
  }
  if (phase === "overnight" && quote.overnight) {
    return { session: "overnight", quote: quote.overnight };
  }
  // After regular close, prefer post then overnight when phase is closed overnight window.
  if (phase === "closed") {
    if (quote.postMarket) return { session: "post", quote: quote.postMarket };
    if (quote.overnight) return { session: "overnight", quote: quote.overnight };
  }
  return null;
}

/** Main quote bar: prefer the currently active US extended session. */
export function primaryQuoteDisplay(
  quote: Quote,
  phase: UsMarketPhase = getUsMarketPhase(),
): QuoteDisplay | null {
  const active =
    quote.assetType === "stock" ? activeExtendedQuote(quote, phase) : null;
  if (active) return { ...active.quote, session: active.session };

  if (quote.assetType === "stock" && phase !== "regular") return null;
  return {
    price: quote.price,
    change: quote.change,
    percentChange: quote.percentChange,
    timestamp: quote.timestamp,
    session: "regular",
  };
}

/** Rail header: keep showing the regular-session quote during extended hours. */
export function regularQuoteDisplay(
  quote: Quote,
  phase: UsMarketPhase = getUsMarketPhase(),
): ExtendedSessionQuote {
  if (
    phase !== "regular" &&
    quote.activeSession &&
    quote.activeSession !== "regular" &&
    quote.regularSession
  ) {
    return quote.regularSession;
  }
  return {
    price: quote.price,
    change: quote.change,
    percentChange: quote.percentChange,
    timestamp: quote.timestamp,
  };
}

/** Add extended-session data from a supplemental quote without replacing the primary quote. */
export function mergeExtendedQuoteFields<T extends Quote>(
  row: T,
  fresh: Quote,
  phase: UsMarketPhase = getUsMarketPhase(),
): T {
  const preMarket = fresh.preMarket ?? row.preMarket;
  const postMarket = fresh.postMarket ?? row.postMarket;
  const overnight = fresh.overnight ?? row.overnight;
  const active = activeExtendedQuote(
    { preMarket, postMarket, overnight },
    phase,
  );
  if (!active) return row;

  return {
    ...row,
    preMarket,
    postMarket,
    overnight,
    activeSession: active.session,
    regularSession:
      fresh.regularSession ??
      row.regularSession ?? {
        price: row.price,
        change: row.change,
        percentChange: row.percentChange,
        timestamp: row.timestamp,
      },
  };
}

/** Merge extended-session fields from a fresh quote onto a rank row. */
export function mergeExtendedOntoRank<T extends Quote>(
  row: T,
  fresh: Quote | undefined,
  phase: UsMarketPhase = getUsMarketPhase(),
): T {
  if (!fresh) return row;
  const preMarket = fresh.preMarket ?? row.preMarket;
  const postMarket = fresh.postMarket ?? row.postMarket;
  const overnight = fresh.overnight ?? row.overnight;
  const active = activeExtendedQuote(
    { preMarket, postMarket, overnight },
    phase,
  );
  if (!active) {
    return {
      ...row,
      preMarket,
      postMarket,
      overnight,
      activeSession: "regular",
    };
  }
  return {
    ...row,
    preMarket,
    postMarket,
    overnight,
    regularSession: fresh.regularSession ?? row.regularSession ?? {
      price: row.price,
      change: row.change,
      percentChange: row.percentChange,
      timestamp: row.timestamp,
    },
    activeSession: active.session,
    price: active.quote.price,
    change: active.quote.change,
    percentChange: active.quote.percentChange,
    ...(active.quote.timestamp != null
      ? { timestamp: active.quote.timestamp }
      : {}),
  };
}

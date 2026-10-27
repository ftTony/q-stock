import type { ExtendedSessionQuote, Quote } from "@/lib/types";
import { getUsMarketPhase, type UsMarketPhase } from "@/lib/market/session";

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
    activeSession: active.session,
    price: active.quote.price,
    change: active.quote.change,
    percentChange: active.quote.percentChange,
    ...(active.quote.high != null ? { high: active.quote.high } : {}),
    ...(active.quote.low != null ? { low: active.quote.low } : {}),
    ...(active.quote.volume != null ? { volume: active.quote.volume } : {}),
    ...(active.quote.timestamp != null
      ? { timestamp: active.quote.timestamp }
      : {}),
  };
}

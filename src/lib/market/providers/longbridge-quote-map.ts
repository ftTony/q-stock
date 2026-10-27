import type { ExtendedSessionQuote, QuoteSession } from "@/lib/types";
import { getUsMarketPhase } from "@/lib/market/session";
import { dec } from "@/lib/market/providers/longbridge-client";

type LbPrePost = {
  lastDone?: { toNumber(): number } | null;
  prevClose?: { toNumber(): number } | null;
  high?: { toNumber(): number } | null;
  low?: { toNumber(): number } | null;
  volume?: number | null;
  timestamp?: Date | null;
  turnover?: { toNumber(): number } | null;
};

type LbSecurityQuote = {
  lastDone?: { toNumber(): number } | null;
  prevClose?: { toNumber(): number } | null;
  high?: { toNumber(): number } | null;
  low?: { toNumber(): number } | null;
  open?: { toNumber(): number } | null;
  volume?: number | null;
  turnover?: { toNumber(): number } | null;
  timestamp?: Date | null;
  preMarketQuote?: LbPrePost | null;
  postMarketQuote?: LbPrePost | null;
  overnightQuote?: LbPrePost | null;
};

export function mapLbPrePost(
  pp: LbPrePost | null | undefined,
): ExtendedSessionQuote | undefined {
  if (!pp) return undefined;
  const price = dec(pp.lastDone);
  if (!(price > 0)) return undefined;
  const prev = dec(pp.prevClose);
  const change = prev > 0 ? price - prev : 0;
  const high = dec(pp.high);
  const low = dec(pp.low);
  const volume = Number(pp.volume ?? 0);
  const ts = pp.timestamp?.getTime?.();
  return {
    price,
    change,
    percentChange: prev > 0 ? (change / prev) * 100 : 0,
    ...(ts ? { timestamp: Math.floor(ts / 1000) } : {}),
    ...(high > 0 ? { high } : {}),
    ...(low > 0 ? { low } : {}),
    ...(volume > 0 ? { volume } : {}),
  };
}

export function mapLbExtendedFields(q: LbSecurityQuote): {
  preMarket?: ExtendedSessionQuote;
  postMarket?: ExtendedSessionQuote;
  overnight?: ExtendedSessionQuote;
  activeSession: QuoteSession;
} {
  const preMarket = mapLbPrePost(q.preMarketQuote);
  const postMarket = mapLbPrePost(q.postMarketQuote);
  const overnight = mapLbPrePost(q.overnightQuote);
  const phase = getUsMarketPhase();
  let activeSession: QuoteSession = "regular";
  if (phase === "pre" && preMarket) activeSession = "pre";
  else if (phase === "post" && postMarket) activeSession = "post";
  else if (phase === "overnight" && overnight) activeSession = "overnight";
  else if (phase === "closed" && postMarket) activeSession = "post";
  else if (phase === "closed" && overnight) activeSession = "overnight";
  return { preMarket, postMarket, overnight, activeSession };
}

/** When extended session is active, overlay primary price/change from that snapshot. */
export function applyActiveExtendedPrice<T extends {
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  volume?: number;
  timestamp: number;
  preMarket?: ExtendedSessionQuote;
  postMarket?: ExtendedSessionQuote;
  overnight?: ExtendedSessionQuote;
  activeSession?: QuoteSession;
}>(row: T): T {
  const session = row.activeSession;
  if (!session || session === "regular") return row;
  const ext =
    session === "pre"
      ? row.preMarket
      : session === "post"
        ? row.postMarket
        : row.overnight;
  if (!ext) return row;
  return {
    ...row,
    price: ext.price,
    change: ext.change,
    percentChange: ext.percentChange,
    ...(ext.high != null ? { high: ext.high } : {}),
    ...(ext.low != null ? { low: ext.low } : {}),
    ...(ext.volume != null ? { volume: ext.volume } : {}),
    ...(ext.timestamp != null ? { timestamp: ext.timestamp } : {}),
  };
}

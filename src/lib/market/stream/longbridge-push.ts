import {
  dec,
  getQuoteCtx,
  hasLongbridgeCreds,
} from "@/lib/market/providers/longbridge-client";
import type { DepthBook, TradeTick } from "@/lib/market/book-types";
import {
  fromLongbridgeSymbol,
  toLbWire,
  type InternalSymbol,
} from "@/lib/market/stream/symbol-map";
import type { Quote } from "@/lib/types";

type QuoteHandler = (quote: Quote) => void;
type DepthHandler = (internal: InternalSymbol, book: DepthBook) => void;
type TradesHandler = (internal: InternalSymbol, trades: TradeTick[]) => void;

let started = false;
let pushAvailable = false;
const lbQuote = new Set<string>();
const lbDepth = new Set<string>();
const lbTrade = new Set<string>();
const lastByKey = new Map<string, Quote>();
const lbToInternal = new Map<string, InternalSymbol>();

let onQuote: QuoteHandler | null = null;
let onDepth: DepthHandler | null = null;
let onTrades: TradesHandler | null = null;

/** SubType numeric values — avoid ambient const enum under isolatedModules. */
const SUB_QUOTE = 0;
const SUB_DEPTH = 1;
const SUB_TRADE = 3;

export type LbWanted = {
  quotes: InternalSymbol[];
  depth: InternalSymbol[];
  trades: InternalSymbol[];
};

export function isLongbridgePushAvailable(): boolean {
  return pushAvailable && hasLongbridgeCreds();
}

export function setLongbridgeQuoteHandler(handler: QuoteHandler | null) {
  onQuote = handler;
}

export function setLongbridgeDepthHandler(handler: DepthHandler | null) {
  onDepth = handler;
}

export function setLongbridgeTradesHandler(handler: TradesHandler | null) {
  onTrades = handler;
}

function cacheKey(it: InternalSymbol): string {
  return `${it.assetType}:${it.symbol.toUpperCase()}`;
}

function resolveInternal(lbSym: string): InternalSymbol | null {
  return (
    lbToInternal.get(lbSym.toUpperCase()) ?? fromLongbridgeSymbol(lbSym)
  );
}

function remember(it: InternalSymbol, wire: string) {
  lbToInternal.set(wire.toUpperCase(), {
    assetType: it.assetType,
    symbol: it.symbol.toUpperCase(),
  });
}

function mergePush(
  internal: InternalSymbol,
  lastDone: number,
  open: number,
  high: number,
  low: number,
  timestamp: number,
  volume: number,
  turnover: number,
): Quote {
  const key = cacheKey(internal);
  const prev = lastByKey.get(key);
  const previousClose =
    prev?.previousClose && prev.previousClose > 0
      ? prev.previousClose
      : prev?.price && prev.price > 0
        ? prev.price
        : lastDone;
  const change = lastDone - previousClose;
  const percentChange =
    previousClose > 0 ? (change / previousClose) * 100 : 0;
  const quote: Quote = {
    symbol: internal.symbol.toUpperCase(),
    assetType: internal.assetType,
    price: lastDone,
    change,
    percentChange,
    high: high > 0 ? high : (prev?.high ?? lastDone),
    low: low > 0 ? low : (prev?.low ?? lastDone),
    open: open > 0 ? open : (prev?.open ?? lastDone),
    previousClose,
    timestamp,
    ...(volume > 0 ? { volume } : prev?.volume ? { volume: prev.volume } : {}),
    ...(turnover > 0
      ? { turnover }
      : prev?.turnover
        ? { turnover: prev.turnover }
        : {}),
    // Push ticks omit static name — keep last known so UI does not flicker.
    ...(prev?.name ? { name: prev.name } : {}),
  };
  lastByKey.set(key, quote);
  return quote;
}

/** Seed previousClose from REST snapshot so first push can compute change. */
export function seedQuoteCache(quotes: Quote[]) {
  for (const q of quotes) {
    if (!(q.price > 0)) continue;
    lastByKey.set(`${q.assetType}:${q.symbol.toUpperCase()}`, q);
  }
}

function mapDepthLevel(row: {
  price: { toNumber(): number } | null;
  volume: number;
  orderNum: number;
}) {
  const price = dec(row.price);
  if (!(price > 0)) return null;
  return {
    price,
    volume: Number(row.volume ?? 0),
    orderNum: Number(row.orderNum ?? 0),
  };
}

export async function initLongbridgePush(): Promise<boolean> {
  if (!hasLongbridgeCreds()) {
    pushAvailable = false;
    return false;
  }
  if (started) return pushAvailable;

  try {
    const ctx = await getQuoteCtx();
    ctx.setOnQuote((err, event) => {
      if (err || !event) {
        if (err) {
          console.warn("[quote-ws] longbridge onQuote error:", err.message);
        }
        return;
      }
      try {
        const internal = resolveInternal(event.symbol);
        if (!internal) return;
        const data = event.data;
        const price = dec(data.lastDone);
        if (!(price > 0)) return;
        const quote = mergePush(
          internal,
          price,
          dec(data.open),
          dec(data.high),
          dec(data.low),
          Math.floor((data.timestamp?.getTime?.() ?? Date.now()) / 1000),
          Number(data.volume ?? 0),
          dec(data.turnover),
        );
        onQuote?.(quote);
      } catch (e) {
        console.warn(
          "[quote-ws] push quote map failed:",
          e instanceof Error ? e.message : e,
        );
      }
    });

    ctx.setOnDepth((err, event) => {
      if (err || !event) {
        if (err) {
          console.warn("[quote-ws] longbridge onDepth error:", err.message);
        }
        return;
      }
      try {
        const internal = resolveInternal(event.symbol);
        if (!internal) return;
        const data = event.data;
        const bids = (data.bids ?? [])
          .map(mapDepthLevel)
          .filter((x): x is NonNullable<typeof x> => x != null)
          .slice(0, 10);
        const asks = (data.asks ?? [])
          .map(mapDepthLevel)
          .filter((x): x is NonNullable<typeof x> => x != null)
          .slice(0, 10);
        if (!bids.length && !asks.length) return;
        onDepth?.(internal, { bids, asks });
      } catch (e) {
        console.warn(
          "[quote-ws] push depth map failed:",
          e instanceof Error ? e.message : e,
        );
      }
    });

    ctx.setOnTrades((err, event) => {
      if (err || !event) {
        if (err) {
          console.warn("[quote-ws] longbridge onTrades error:", err.message);
        }
        return;
      }
      try {
        const internal = resolveInternal(event.symbol);
        if (!internal) return;
        const out: TradeTick[] = [];
        for (const t of event.data.trades ?? []) {
          const price = dec(t.price);
          if (!(price > 0)) continue;
          const dir = Number(t.direction);
          out.push({
            price,
            volume: Number(t.volume ?? 0),
            time: Math.floor((t.timestamp?.getTime?.() ?? Date.now()) / 1000),
            direction: dir === 2 ? "up" : dir === 1 ? "down" : "neutral",
          });
        }
        if (!out.length) return;
        onTrades?.(internal, out);
      } catch (e) {
        console.warn(
          "[quote-ws] push trades map failed:",
          e instanceof Error ? e.message : e,
        );
      }
    });

    started = true;
    pushAvailable = true;
    console.info("[quote-ws] longbridge push handler ready (quote+depth+trade)");
    return true;
  } catch (err) {
    pushAvailable = false;
    console.warn(
      "[quote-ws] longbridge push init failed:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

async function syncSet(
  label: string,
  current: Set<string>,
  nextWires: Set<string>,
  subType: number,
): Promise<void> {
  if (!pushAvailable || !hasLongbridgeCreds()) return;
  const ctx = await getQuoteCtx();
  const toAdd = [...nextWires].filter((s) => !current.has(s));
  const toRemove = [...current].filter((s) => !nextWires.has(s));

  if (toAdd.length) {
    try {
      await ctx.subscribe(toAdd, [subType]);
      for (const s of toAdd) current.add(s);
      console.info(`[quote-ws] lb ${label} +${toAdd.length}`);
    } catch (err) {
      console.warn(
        `[quote-ws] lb ${label} subscribe failed:`,
        err instanceof Error ? err.message : err,
      );
      // Quota / permission — do not kill quote push entirely for depth/trade.
      if (label === "quote") pushAvailable = false;
    }
  }

  if (toRemove.length) {
    try {
      await ctx.unsubscribe(toRemove, [subType]);
      for (const s of toRemove) current.delete(s);
      console.info(`[quote-ws] lb ${label} -${toRemove.length}`);
    } catch (err) {
      console.warn(
        `[quote-ws] lb ${label} unsubscribe failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

function wiresOf(items: InternalSymbol[]): Set<string> {
  const next = new Set<string>();
  for (const it of items) {
    if (it.assetType === "crypto") continue;
    const wire = toLbWire(it.assetType, it.symbol);
    next.add(wire);
    remember(it, wire);
  }
  return next;
}

/**
 * Sync Longbridge subscriptions. Depth/Trade only when UI asks
 * (Futu: release quota on leave; do not subscribe book/ticks for every quote).
 */
export async function syncLongbridgeSubscriptions(
  wanted: LbWanted | InternalSymbol[],
): Promise<void> {
  const w: LbWanted = Array.isArray(wanted)
    ? { quotes: wanted, depth: [], trades: [] }
    : wanted;

  await syncSet("quote", lbQuote, wiresOf(w.quotes), SUB_QUOTE);
  await syncSet("depth", lbDepth, wiresOf(w.depth), SUB_DEPTH);
  await syncSet("trade", lbTrade, wiresOf(w.trades), SUB_TRADE);
}

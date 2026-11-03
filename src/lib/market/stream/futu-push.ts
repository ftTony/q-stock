import WebSocket from "ws";
import {
  buildFutuWsAuthFrame,
  isFutuConfigured,
} from "@/lib/market/providers/futu-http";
import type { DepthBook, TradeTick } from "@/lib/market/book-types";
import {
  fromFutuSymbol,
  toFutuWire,
  type InternalSymbol,
} from "@/lib/market/stream/symbol-map";
import type { Quote } from "@/lib/types";

type QuoteHandler = (quote: Quote) => void;
type DepthHandler = (internal: InternalSymbol, book: DepthBook) => void;
type TradesHandler = (internal: InternalSymbol, trades: TradeTick[]) => void;

const FUTU_WS_URL =
  process.env.FUTU_QUOTE_WS_URL?.trim() || "wss://webapi-quote.futunn.com/ws";
/** Docs: refresh at least every 10m; 5m leaves headroom. */
const REFRESH_MS = 5 * 60_000;
const RECONNECT_BASE_MS = 2_000;
const RECONNECT_MAX_MS = 60_000;

let started = false;
let pushAvailable = false;
let ws: WebSocket | null = null;
let authenticated = false;
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

const futuQuote = new Set<string>();
const futuDepth = new Set<string>();
const futuTrade = new Set<string>();
const wantedQuote = new Set<string>();
const wantedDepth = new Set<string>();
const wantedTrade = new Set<string>();
const lastByKey = new Map<string, Quote>();
const wireToInternal = new Map<string, InternalSymbol>();

let onQuote: QuoteHandler | null = null;
let onDepth: DepthHandler | null = null;
let onTrades: TradesHandler | null = null;
let onAvailability: ((ok: boolean) => void) | null = null;

export type FutuWanted = {
  quotes: InternalSymbol[];
  depth: InternalSymbol[];
  trades: InternalSymbol[];
};

export function isFutuPushAvailable(): boolean {
  return pushAvailable && isFutuConfigured() && authenticated;
}

export function setFutuQuoteHandler(handler: QuoteHandler | null) {
  onQuote = handler;
}

export function setFutuDepthHandler(handler: DepthHandler | null) {
  onDepth = handler;
}

export function setFutuTradesHandler(handler: TradesHandler | null) {
  onTrades = handler;
}

export function setFutuPushAvailabilityHandler(
  handler: ((ok: boolean) => void) | null,
) {
  onAvailability = handler;
}

function setAvailable(ok: boolean) {
  if (pushAvailable === ok) return;
  pushAvailable = ok;
  onAvailability?.(ok);
}

function cacheKey(it: InternalSymbol): string {
  return `${it.assetType}:${it.symbol.toUpperCase()}`;
}

function remember(it: InternalSymbol, wire: string) {
  wireToInternal.set(wire.toUpperCase(), {
    assetType: it.assetType,
    symbol: it.symbol.toUpperCase(),
  });
}

function resolveInternal(wire: string): InternalSymbol | null {
  return (
    wireToInternal.get(wire.toUpperCase()) ?? fromFutuSymbol(wire)
  );
}

function mergeQuote(
  internal: InternalSymbol,
  lastDone: number,
  open: number,
  high: number,
  low: number,
  previousClose: number,
  timestamp: number,
  volume: number,
  turnover: number,
): Quote {
  const key = cacheKey(internal);
  const prev = lastByKey.get(key);
  const prevClose =
    previousClose > 0
      ? previousClose
      : prev?.previousClose && prev.previousClose > 0
        ? prev.previousClose
        : prev?.price && prev.price > 0
          ? prev.price
          : lastDone;
  const change = lastDone - prevClose;
  const percentChange = prevClose > 0 ? (change / prevClose) * 100 : 0;
  const quote: Quote = {
    symbol: internal.symbol.toUpperCase(),
    assetType: internal.assetType,
    price: lastDone,
    change,
    percentChange,
    high: high > 0 ? high : (prev?.high ?? lastDone),
    low: low > 0 ? low : (prev?.low ?? lastDone),
    open: open > 0 ? open : (prev?.open ?? lastDone),
    previousClose: prevClose,
    timestamp,
    ...(volume > 0 ? { volume } : prev?.volume ? { volume: prev.volume } : {}),
    ...(turnover > 0
      ? { turnover }
      : prev?.turnover
        ? { turnover: prev.turnover }
        : {}),
    ...(prev?.name ? { name: prev.name } : {}),
  };
  lastByKey.set(key, quote);
  return quote;
}

export function seedFutuQuoteCache(quotes: Quote[]) {
  for (const q of quotes) {
    if (!(q.price > 0)) continue;
    lastByKey.set(`${q.assetType}:${q.symbol.toUpperCase()}`, q);
  }
}

function safeSend(payload: unknown) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  try {
    ws.send(JSON.stringify(payload));
  } catch (err) {
    console.warn(
      "[quote-ws] futu send failed:",
      err instanceof Error ? err.message : err,
    );
  }
}

function clearRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

function startRefreshLoop() {
  clearRefresh();
  refreshTimer = setInterval(() => {
    void (async () => {
      try {
        const frame = await buildFutuWsAuthFrame("refresh");
        safeSend(frame);
      } catch (err) {
        console.warn(
          "[quote-ws] futu refresh frame failed:",
          err instanceof Error ? err.message : err,
        );
      }
    })();
  }, REFRESH_MS);
}

function sendSubDiff(
  action: "subscribe" | "unsubscribe",
  quote: string[],
  orderBook: string[],
  ticker: string[],
) {
  if (!quote.length && !orderBook.length && !ticker.length) return;
  const body: Record<string, unknown> = {
    id: `futu-${action}-${Date.now()}`,
    action,
  };
  if (quote.length) body.quote = quote;
  if (orderBook.length) body.order_book = orderBook;
  if (ticker.length) body.ticker = ticker;
  safeSend(body);
}

function applyWantedSets() {
  if (!authenticated || !ws || ws.readyState !== WebSocket.OPEN) return;

  const qAdd = [...wantedQuote].filter((s) => !futuQuote.has(s));
  const qRem = [...futuQuote].filter((s) => !wantedQuote.has(s));
  const dAdd = [...wantedDepth].filter((s) => !futuDepth.has(s));
  const dRem = [...futuDepth].filter((s) => !wantedDepth.has(s));
  const tAdd = [...wantedTrade].filter((s) => !futuTrade.has(s));
  const tRem = [...futuTrade].filter((s) => !wantedTrade.has(s));

  if (qRem.length || dRem.length || tRem.length) {
    sendSubDiff("unsubscribe", qRem, dRem, tRem);
    for (const s of qRem) futuQuote.delete(s);
    for (const s of dRem) futuDepth.delete(s);
    for (const s of tRem) futuTrade.delete(s);
  }
  if (qAdd.length || dAdd.length || tAdd.length) {
    sendSubDiff("subscribe", qAdd, dAdd, tAdd);
    for (const s of qAdd) futuQuote.add(s);
    for (const s of dAdd) futuDepth.add(s);
    for (const s of tAdd) futuTrade.add(s);
    if (qAdd.length || dAdd.length || tAdd.length) {
      console.info(
        `[quote-ws] futu +q${qAdd.length} +d${dAdd.length} +t${tAdd.length}`,
      );
    }
  }
}

function wiresOf(items: InternalSymbol[]): Set<string> {
  const next = new Set<string>();
  for (const it of items) {
    if (it.assetType === "crypto") continue;
    try {
      const wire = toFutuWire(it.assetType, it.symbol);
      next.add(wire);
      remember(it, wire);
    } catch {
      /* unsupported */
    }
  }
  return next;
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  const delay = Math.min(
    RECONNECT_MAX_MS,
    RECONNECT_BASE_MS * 2 ** Math.min(reconnectAttempt, 5),
  );
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connect();
  }, delay);
  console.info(`[quote-ws] futu reconnect in ${delay}ms`);
}

function handleMessage(raw: string) {
  let msg: Record<string, unknown>;
  try {
    msg = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return;
  }

  // Auth / refresh success: session_id present, no type.
  if (typeof msg.session_id === "string" || typeof msg.session_id === "number") {
    if (!authenticated) {
      authenticated = true;
      reconnectAttempt = 0;
      setAvailable(true);
      console.info("[quote-ws] futu ws authenticated");
      startRefreshLoop();
      applyWantedSets();
    }
    return;
  }

  // Error-ish frames
  const code = msg.code ?? msg.ret_code ?? msg.err_code;
  if (code != null && Number(code) !== 0) {
    console.warn(
      "[quote-ws] futu ws error:",
      msg.message ?? msg.ret_msg ?? msg.msg ?? code,
    );
    return;
  }

  const type = String(msg.type ?? "").toUpperCase();
  const symbol = String(msg.symbol ?? "");
  const data = (msg.data ?? {}) as Record<string, unknown>;
  if (!type || !symbol) return;

  const internal = resolveInternal(symbol);
  if (!internal) return;

  if (type === "QUOTE") {
    const price = Number(data.last_price);
    if (!(price > 0)) return;
    const tsMs = Number(data.data_time_ms);
    const quote = mergeQuote(
      internal,
      price,
      Number(data.open_price) || 0,
      Number(data.high_price) || 0,
      Number(data.low_price) || 0,
      Number(data.prev_close_price) || 0,
      Math.floor((Number.isFinite(tsMs) && tsMs > 0 ? tsMs : Date.now()) / 1000),
      Number(data.volume) || 0,
      Number(data.turnover) || 0,
    );
    onQuote?.(quote);
    return;
  }

  if (type === "ORDER_BOOK") {
    const mapLevel = (row: Record<string, unknown>) => {
      const price = Number(row.price);
      if (!(price > 0)) return null;
      return {
        price,
        volume: Number(row.volume ?? 0),
        orderNum: Number(row.order_count ?? 0),
      };
    };
    const bids = ((data.bid_list as Record<string, unknown>[]) ?? [])
      .map(mapLevel)
      .filter((x): x is NonNullable<typeof x> => x != null)
      .slice(0, 10);
    const asks = ((data.ask_list as Record<string, unknown>[]) ?? [])
      .map(mapLevel)
      .filter((x): x is NonNullable<typeof x> => x != null)
      .slice(0, 10);
    if (!bids.length && !asks.length) return;
    onDepth?.(internal, { bids, asks });
    return;
  }

  if (type === "TICKER") {
    const out: TradeTick[] = [];
    for (const t of (data.ticker_list as Record<string, unknown>[]) ?? []) {
      const price = Number(t.price);
      if (!(price > 0)) continue;
      const dir = String(t.direction ?? "").toUpperCase();
      const timeMs = Number(t.time_ms);
      out.push({
        price,
        volume: Number(t.volume ?? 0),
        time: Math.floor(
          (Number.isFinite(timeMs) && timeMs > 0 ? timeMs : Date.now()) / 1000,
        ),
        direction: dir === "BUY" ? "up" : dir === "SELL" ? "down" : "neutral",
      });
    }
    if (out.length) onTrades?.(internal, out);
  }
}

async function connect(): Promise<void> {
  if (!isFutuConfigured()) {
    setAvailable(false);
    return;
  }
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  authenticated = false;
  futuQuote.clear();
  futuDepth.clear();
  futuTrade.clear();
  clearRefresh();

  try {
    const socket = new WebSocket(FUTU_WS_URL, {
      perMessageDeflate: true,
      handshakeTimeout: 15_000,
    });
    ws = socket;

    socket.on("open", () => {
      void (async () => {
        try {
          const frame = await buildFutuWsAuthFrame("auth");
          safeSend(frame);
        } catch (err) {
          console.warn(
            "[quote-ws] futu auth frame failed:",
            err instanceof Error ? err.message : err,
          );
          socket.close();
        }
      })();
    });

    socket.on("message", (data) => {
      handleMessage(String(data));
    });

    socket.on("close", () => {
      authenticated = false;
      setAvailable(false);
      clearRefresh();
      futuQuote.clear();
      futuDepth.clear();
      futuTrade.clear();
      if (ws === socket) ws = null;
      scheduleReconnect();
    });

    socket.on("error", (err) => {
      console.warn(
        "[quote-ws] futu ws error:",
        err instanceof Error ? err.message : err,
      );
    });
  } catch (err) {
    console.warn(
      "[quote-ws] futu connect failed:",
      err instanceof Error ? err.message : err,
    );
    setAvailable(false);
    scheduleReconnect();
  }
}

export async function initFutuPush(): Promise<boolean> {
  if (!isFutuConfigured()) {
    setAvailable(false);
    return false;
  }
  if (started) return isFutuPushAvailable();
  started = true;
  await connect();
  return isFutuPushAvailable();
}

/**
 * Sync Futu WS subscriptions. Depth/ticker only when UI asks (quota).
 */
export function syncFutuSubscriptions(
  wanted: FutuWanted | InternalSymbol[],
): void {
  const w: FutuWanted = Array.isArray(wanted)
    ? { quotes: wanted, depth: [], trades: [] }
    : wanted;

  const nextQ = wiresOf(w.quotes);
  const nextD = wiresOf(w.depth);
  const nextT = wiresOf(w.trades);
  wantedQuote.clear();
  wantedDepth.clear();
  wantedTrade.clear();
  for (const s of nextQ) wantedQuote.add(s);
  for (const s of nextD) wantedDepth.add(s);
  for (const s of nextT) wantedTrade.add(s);

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    applyWantedSets();
  }, 150);
}

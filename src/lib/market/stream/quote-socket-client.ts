/**
 * Browser-only quote WebSocket client (singleton).
 * - Ref-counted channels (many React components → one wire subscribe)
 * - Reconnect with backoff + online/visibility
 * - Heartbeat; silence → force reconnect → degraded
 */
import {
  channelKey,
  type ServerMessage,
  type StreamChannel,
} from "@/lib/market/stream/protocol";

export type QuoteSocketStatus =
  | "disabled"
  | "connecting"
  | "connected"
  | "degraded";

export type ChannelListener = (msg: ServerMessage) => void;
export type StatusListener = (status: QuoteSocketStatus) => void;

type ChannelEntry = {
  channel: StreamChannel;
  refs: number;
  listeners: Set<ChannelListener>;
};

const PING_MS = 20_000;
const PONG_DEAD_MS = 50_000;
const BACKOFF_MIN = 800;
const BACKOFF_MAX = 20_000;

export function readQuoteWsUrl(): string | null {
  const u = (process.env.NEXT_PUBLIC_QUOTE_WS_URL || "").trim();
  return u || null;
}

export class QuoteSocketClient {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly channels = new Map<string, ChannelEntry>();
  private readonly statusListeners = new Set<StatusListener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private backoffMs = BACKOFF_MIN;
  private intentionalClose = false;
  private visible = true;
  private online = true;
  private lastRxAt = 0;
  private status: QuoteSocketStatus = "connecting";
  private lifecycleBound = false;
  /** Last fan-out message per channel — replay for late subscribers (same symbol). */
  private lastMsg = new Map<string, ServerMessage>();

  constructor(url: string) {
    this.url = url;
  }

  getStatus(): QuoteSocketStatus {
    return this.status;
  }

  onStatus(fn: StatusListener): () => void {
    this.statusListeners.add(fn);
    queueMicrotask(() => fn(this.status));
    return () => this.statusListeners.delete(fn);
  }

  /** Subscribe channels for one consumer; wire subscribe only on 0→1. */
  subscribe(channels: StreamChannel[], listener: ChannelListener) {
    this.bindLifecycle();
    const firstTime: StreamChannel[] = [];
    const joined: string[] = [];
    for (const raw of channels) {
      const ch = normalizeChannel(raw);
      if (!ch) continue;
      const key = channelKey(ch);
      let entry = this.channels.get(key);
      if (!entry) {
        entry = { channel: ch, refs: 0, listeners: new Set() };
        this.channels.set(key, entry);
        firstTime.push(ch);
      }
      entry.refs += 1;
      entry.listeners.add(listener);
      joined.push(key);
    }
    this.ensureOpen();
    if (firstTime.length) this.sendSubscribe(firstTime);
    // Late joiners (2nd component on same symbol) get cached last tick.
    for (const key of joined) {
      const cached = this.lastMsg.get(key);
      if (cached) {
        try {
          listener(cached);
        } catch {
          /* ignore */
        }
      }
    }
  }

  /** Drop one consumer; wire unsubscribe only on 1→0. */
  unsubscribe(channels: StreamChannel[], listener: ChannelListener) {
    const dropped: StreamChannel[] = [];
    for (const raw of channels) {
      const ch = normalizeChannel(raw);
      if (!ch) continue;
      const key = channelKey(ch);
      const entry = this.channels.get(key);
      if (!entry) continue;
      entry.listeners.delete(listener);
      entry.refs = Math.max(0, entry.refs - 1);
      if (entry.refs === 0) {
        this.channels.delete(key);
        this.lastMsg.delete(key);
        dropped.push(ch);
      }
    }
    if (dropped.length && this.ws?.readyState === WebSocket.OPEN) {
      this.safeSend({ op: "unsubscribe", channels: dropped });
    }
    if (!this.channels.size) this.idleClose();
  }

  private setStatus(next: QuoteSocketStatus) {
    if (this.status === next) return;
    this.status = next;
    for (const h of this.statusListeners) {
      try {
        h(next);
      } catch {
        /* ignore */
      }
    }
  }

  private bindLifecycle() {
    if (this.lifecycleBound || typeof window === "undefined") return;
    this.lifecycleBound = true;
    this.online = navigator.onLine;
    this.visible = document.visibilityState === "visible";

    window.addEventListener("online", this.onOnline);
    window.addEventListener("offline", this.onOffline);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private onOnline = () => {
    this.online = true;
    this.backoffMs = BACKOFF_MIN;
    this.ensureOpen();
  };

  private onOffline = () => {
    this.online = false;
    this.setStatus("degraded");
    this.stopPing();
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
  };

  private onVisibility = () => {
    this.visible = document.visibilityState === "visible";
    if (this.visible) {
      this.backoffMs = BACKOFF_MIN;
      this.ensureOpen();
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.resubscribeAll();
        this.safeSend({ op: "ping" });
      }
    }
  };

  private ensureOpen() {
    if (!this.url || !this.online) {
      if (!this.online) this.setStatus("degraded");
      return;
    }
    if (!this.visible && this.channels.size === 0) return;
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.intentionalClose = false;
    if (this.channels.size) this.setStatus("connecting");

    try {
      const ws = new WebSocket(this.url);
      this.ws = ws;
      ws.onopen = () => {
        this.backoffMs = BACKOFF_MIN;
        this.lastRxAt = Date.now();
        this.setStatus("connected");
        this.startPing();
        this.resubscribeAll();
      };
      ws.onmessage = (ev) => this.onMessage(String(ev.data));
      ws.onclose = () => {
        this.stopPing();
        this.ws = null;
        if (this.intentionalClose) return;
        if (this.channels.size > 0) {
          this.setStatus("degraded");
          this.scheduleReconnect();
        } else {
          this.setStatus("disabled");
        }
      };
      ws.onerror = () => {
        /* onclose follows */
      };
    } catch {
      this.setStatus("degraded");
      this.scheduleReconnect();
    }
  }

  private onMessage(raw: string) {
    this.lastRxAt = Date.now();
    let msg: ServerMessage;
    try {
      msg = JSON.parse(raw) as ServerMessage;
    } catch {
      return;
    }

    if (msg.op === "pong" || msg.op === "hello") {
      if (msg.op === "hello" && this.status !== "connected") {
        this.setStatus("connected");
      }
      return;
    }

    if (msg.op === "error") {
      console.warn("[quote-ws]", msg.message);
      return;
    }

    this.dispatch(msg);
  }

  private dispatch(msg: ServerMessage) {
    if (msg.op === "quote") {
      const key = channelKey({
        type: "symbol",
        assetType: msg.quote.assetType,
        symbol: msg.quote.symbol,
      });
      this.emit(key, msg);
      return;
    }
    if (msg.op === "indices") {
      this.emit(channelKey({ type: "indices" }), msg);
      return;
    }
    if (msg.op === "snapshot") {
      if (msg.quotes?.length) {
        for (const q of msg.quotes) {
          const key = channelKey({
            type: "symbol",
            assetType: q.assetType,
            symbol: q.symbol,
          });
          this.emit(key, { op: "quote", quote: q });
          this.emit(key, msg);
        }
      }
      if (msg.indicesByMarket) {
        const idxKey = channelKey({ type: "indices" });
        this.emit(idxKey, msg);
        for (const market of ["stock", "hk", "cn"] as const) {
          const indices = msg.indicesByMarket[market];
          if (indices) {
            this.emit(idxKey, { op: "indices", assetType: market, indices });
          }
        }
      }
    }
  }

  private emit(key: string, msg: ServerMessage) {
    if (msg.op === "quote" || msg.op === "indices") {
      this.lastMsg.set(key, msg);
    }
    const entry = this.channels.get(key);
    if (!entry?.listeners.size) return;
    for (const fn of entry.listeners) {
      try {
        fn(msg);
      } catch {
        /* ignore */
      }
    }
  }

  private sendSubscribe(channels: StreamChannel[]) {
    if (!channels.length) return;
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.safeSend({ op: "subscribe", channels });
  }

  private resubscribeAll() {
    const list = [...this.channels.values()].map((e) => e.channel);
    this.sendSubscribe(list);
  }

  private safeSend(payload: unknown) {
    try {
      this.ws?.send(JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;
      if (Date.now() - this.lastRxAt > PONG_DEAD_MS) {
        try {
          this.ws.close();
        } catch {
          /* ignore */
        }
        return;
      }
      this.safeSend({ op: "ping" });
    }, PING_MS);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (!this.online || this.reconnectTimer) return;
    if (!this.channels.size) return;
    const jitter = Math.floor(Math.random() * 400);
    const wait = this.backoffMs + jitter;
    this.backoffMs = Math.min(
      BACKOFF_MAX,
      Math.floor(this.backoffMs * 1.7),
    );
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureOpen();
    }, wait);
  }

  private idleClose() {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
    this.setStatus("disabled");
  }
}

function normalizeChannel(ch: StreamChannel): StreamChannel | null {
  if (ch.type === "indices") return { type: "indices" };
  const symbol = ch.symbol?.trim().toUpperCase();
  if (!symbol) return null;
  return { type: "symbol", assetType: ch.assetType, symbol };
}

let singleton: QuoteSocketClient | null = null;

export function getQuoteSocketClient(): QuoteSocketClient | null {
  const url = readQuoteWsUrl();
  if (!url || typeof window === "undefined") return null;
  if (!singleton) singleton = new QuoteSocketClient(url);
  return singleton;
}

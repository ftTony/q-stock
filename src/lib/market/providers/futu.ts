import crypto from "crypto";
import fs from "fs";
import { cachedFetch } from "@/lib/cache";
import { normalizeSymbol, toFutuSymbol } from "@/lib/market/symbols";
import type { MarketDataProvider, QuoteWithSource } from "@/lib/market/types";
import { MarketDataError } from "@/lib/market/types";
import type { AssetType, OhlcvBar, SearchResult } from "@/lib/types";

/**
 * Futu OpenAPI (cloud REST) — https://open.futunn.com/zh-cn/api/overview/
 * Host: https://webapi.futunn.com
 * Auth: Bearer access token OR legacy AppKey + private-key signature.
 */

const FUTU_HOST = process.env.FUTU_HTTP_URL || "https://webapi.futunn.com";

function hasBearerAuth(): boolean {
  return Boolean(process.env.FUTU_ACCESS_TOKEN?.trim());
}

function hasAppKeyAuth(): boolean {
  return Boolean(
    process.env.FUTU_APP_KEY?.trim() &&
      (process.env.FUTU_PRIVATE_KEY?.trim() ||
        process.env.FUTU_PRIVATE_KEY_PATH?.trim()),
  );
}

function isFutuConfigured(): boolean {
  return hasBearerAuth() || hasAppKeyAuth();
}

function loadPrivateKeyPem(): string {
  const inline = process.env.FUTU_PRIVATE_KEY?.trim();
  if (inline) {
    return inline.replace(/\\n/g, "\n");
  }
  const path = process.env.FUTU_PRIVATE_KEY_PATH?.trim();
  if (path) {
    return fs.readFileSync(path, "utf8");
  }
  throw new Error("FUTU_PRIVATE_KEY or FUTU_PRIVATE_KEY_PATH required");
}

function signPayload(payload: string): string {
  const alg = (process.env.FUTU_SIGN_ALG || "ed25519").toLowerCase();
  const pem = loadPrivateKeyPem();
  if (alg === "rsa-sha256" || alg === "rsa") {
    const sig = crypto.sign("sha256", Buffer.from(payload, "utf8"), {
      key: pem,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    });
    return sig.toString("base64");
  }
  // Ed25519
  const keyObj = crypto.createPrivateKey(pem);
  const sig = crypto.sign(null, Buffer.from(payload, "utf8"), keyObj);
  return sig.toString("base64");
}

function buildAuthHeaders(
  method: string,
  requestPath: string,
  queryString: string,
  body: string | null,
): Record<string, string> {
  if (hasBearerAuth()) {
    return {
      Authorization: `Bearer ${process.env.FUTU_ACCESS_TOKEN!.trim()}`,
      "Content-Type": "application/json",
    };
  }

  const timestampMs = String(Date.now());
  const nonce = crypto.randomBytes(12).toString("hex");
  const bodyPart = body
    ? crypto.createHash("sha256").update(body, "utf8").digest("hex")
    : "";
  const payload = [
    timestampMs,
    method.toUpperCase(),
    requestPath,
    queryString,
    bodyPart,
  ].join("\n");
  const signature = signPayload(payload);

  return {
    "X-Api-Key": process.env.FUTU_APP_KEY!.trim(),
    Authorization: signature,
    "X-Timestamp": timestampMs,
    "X-Nonce": nonce,
    "Content-Type": "application/json",
  };
}

type FutuEnvelope<T> = {
  ret_code?: number;
  ret_msg?: string;
  data?: T;
};

async function futuRequest<T>(
  method: "GET" | "POST",
  requestPath: string,
  opts?: { query?: Record<string, string | number | undefined>; body?: unknown },
): Promise<T> {
  const queryEntries = Object.entries(opts?.query ?? {}).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  const queryString = queryEntries
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
  const bodyStr =
    opts?.body !== undefined ? JSON.stringify(opts.body) : null;
  const url =
    queryString.length > 0
      ? `${FUTU_HOST}${requestPath}?${queryString}`
      : `${FUTU_HOST}${requestPath}`;

  const headers = buildAuthHeaders(method, requestPath, queryString, bodyStr);
  const res = await fetch(url, {
    method,
    headers,
    body: bodyStr,
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new MarketDataError(
      `Futu HTTP ${res.status}: ${text.slice(0, 200)}`,
      "futu",
    );
  }

  const json = (await res.json()) as FutuEnvelope<T>;
  if (json.ret_code != null && json.ret_code !== 0) {
    throw new MarketDataError(
      `Futu ${json.ret_code}: ${json.ret_msg || "request failed"}`,
      "futu",
    );
  }
  if (json.data === undefined) {
    throw new MarketDataError("Futu empty response", "futu");
  }
  return json.data;
}

type SnapshotRow = {
  code?: string;
  last_price?: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  prev_close_price?: number;
  update_time?: number;
};

type KlineRow = {
  time_key?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

function msToSec(ms?: number): number {
  if (!ms) return Math.floor(Date.now() / 1000);
  return ms > 1e12 ? Math.floor(ms / 1000) : Math.floor(ms);
}

function toDateYmd(unixSec: number): string {
  return new Date(unixSec * 1000).toISOString().slice(0, 10);
}

export const futuProvider: MarketDataProvider = {
  id: "futu",

  isConfigured() {
    return isFutuConfigured();
  },

  supports(assetType) {
    return assetType === "stock";
  },

  async getQuote(symbol, assetType) {
    if (assetType !== "stock") {
      throw new MarketDataError("Futu supports stocks only", "futu");
    }
    const normalized = normalizeSymbol(symbol, assetType);
    const code = toFutuSymbol(normalized, assetType);
    const key = `futu:quote:${normalized}`;

    try {
      return await cachedFetch(key, 15_000, async () => {
        const data = await futuRequest<{ snapshot_list?: SnapshotRow[] }>(
          "POST",
          "/api/v1.0/quote/snapshot",
          { body: { code_list: [code] } },
        );
        const snap = data.snapshot_list?.[0];
        if (!snap || !(Number(snap.last_price) > 0)) {
          throw new MarketDataError(`No Futu snapshot for ${code}`, "futu");
        }
        const price = Number(snap.last_price);
        const prev = Number(snap.prev_close_price ?? 0);
        const change = price - prev;
        return {
          symbol: normalized,
          assetType,
          price,
          change,
          percentChange: prev ? (change / prev) * 100 : 0,
          high: Number(snap.high_price ?? 0),
          low: Number(snap.low_price ?? 0),
          open: Number(snap.open_price ?? 0),
          previousClose: prev,
          timestamp: msToSec(snap.update_time),
          source: "futu" as const,
        } satisfies QuoteWithSource;
      });
    } catch (err) {
      throw new MarketDataError(
        err instanceof Error ? err.message : "Futu quote failed",
        "futu",
      );
    }
  },

  async getQuotes(items) {
    const stockItems = items.filter((i) => i.assetType === "stock");
    if (!stockItems.length) return [];

    try {
      const codes = stockItems.map((i) =>
        toFutuSymbol(normalizeSymbol(i.symbol, i.assetType), i.assetType),
      );
      const data = await futuRequest<{ snapshot_list?: SnapshotRow[] }>(
        "POST",
        "/api/v1.0/quote/snapshot",
        { body: { code_list: codes } },
      );
      const byCode = new Map(
        (data.snapshot_list ?? []).map((s) => [s.code, s]),
      );
      const out: QuoteWithSource[] = [];
      for (const item of stockItems) {
        const normalized = normalizeSymbol(item.symbol, item.assetType);
        const code = toFutuSymbol(normalized, item.assetType);
        const snap = byCode.get(code);
        if (!snap || !(Number(snap.last_price) > 0)) continue;
        const price = Number(snap.last_price);
        const prev = Number(snap.prev_close_price ?? 0);
        const change = price - prev;
        out.push({
          symbol: normalized,
          assetType: item.assetType,
          price,
          change,
          percentChange: prev ? (change / prev) * 100 : 0,
          high: Number(snap.high_price ?? 0),
          low: Number(snap.low_price ?? 0),
          open: Number(snap.open_price ?? 0),
          previousClose: prev,
          timestamp: msToSec(snap.update_time),
          source: "futu",
        });
      }
      return out;
    } catch {
      const results = await Promise.allSettled(
        stockItems.map((i) => futuProvider.getQuote(i.symbol, i.assetType)),
      );
      return results
        .filter(
          (r): r is PromiseFulfilledResult<QuoteWithSource> =>
            r.status === "fulfilled",
        )
        .map((r) => r.value);
    }
  },

  async getDailyCandles(symbol, assetType, from, to) {
    return fetchKlines(symbol, assetType, from, to, 2);
  },

  async getMonthlyCandles(symbol, assetType, from, to) {
    return fetchKlines(symbol, assetType, from, to, 4);
  },

  async searchSymbols(q, assetType): Promise<SearchResult[]> {
    if (assetType === "crypto") return [];
    const query = q.trim().toUpperCase();
    if (!query) return [];
    const sym = normalizeSymbol(query.replace(/^(US|HK|SH|SZ)\./, ""), "stock");
    return [
      {
        symbol: sym,
        displaySymbol: toFutuSymbol(sym, "stock"),
        description: `${sym} (Futu)`,
        assetType: "stock",
        type: "Common Stock",
      },
    ];
  },
};

async function fetchKlines(
  symbol: string,
  assetType: AssetType,
  from: number,
  to: number,
  ktype: number,
): Promise<OhlcvBar[]> {
  if (assetType !== "stock") {
    throw new MarketDataError("Futu supports stocks only", "futu");
  }
  const normalized = normalizeSymbol(symbol, assetType);
  const code = toFutuSymbol(normalized, assetType);
  const key = `futu:candle:${ktype}:${normalized}:${from}:${to}`;

  return cachedFetch(key, ktype === 2 ? 60_000 : 120_000, async () => {
    const path = `/api/v1.0/quote/${encodeURIComponent(code)}/history-kline`;
    const data = await futuRequest<{ kline_list?: KlineRow[] }>("GET", path, {
      query: {
        start: toDateYmd(from),
        end: toDateYmd(to),
        ktype,
        autype: 0,
        num: 370,
      },
    });
    return (data.kline_list ?? [])
      .map(
        (k): OhlcvBar => ({
          time: msToSec(k.time_key),
          open: Number(k.open ?? 0),
          high: Number(k.high ?? 0),
          low: Number(k.low ?? 0),
          close: Number(k.close ?? 0),
          volume: Number(k.volume ?? 0),
        }),
      )
      .filter((b) => b.time >= from && b.time <= to)
      .sort((a, b) => a.time - b.time);
  });
}

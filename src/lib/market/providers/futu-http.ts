import crypto from "crypto";
import { getMarketCreds } from "@/lib/market/creds-context";
import type { FutuCreds } from "@/lib/market/creds-types";
import { MarketDataError } from "@/lib/market/types";

/**
 * Futu OpenAPI cloud REST client — https://open.futunn.com/api/overview/getting-started
 * Host: https://webapi.futunn.com
 *
 * Auth uses per-request BYOK from AsyncLocalStorage (not process.env).
 * - Method 2: X-Api-Key + Ed25519/RSA signature
 * - Method 1: Authorization: Bearer {access_token}
 */

const FUTU_HOST = process.env.FUTU_HTTP_URL?.trim() || "https://webapi.futunn.com";

/** Clock skew cache for Method 2 (server allows ±5s). */
let timeOffsetMs = 0;
let timeSyncedAt = 0;
const TIME_SYNC_TTL_MS = 5 * 60_000;

function currentFutuCreds(): FutuCreds | undefined {
  return getMarketCreds().futu;
}

export function hasBearerAuth(): boolean {
  const c = currentFutuCreds();
  return c?.mode === "bearer";
}

export function hasAppKeyAuth(): boolean {
  const c = currentFutuCreds();
  return c?.mode === "appkey";
}

export function isFutuConfigured(): boolean {
  return Boolean(currentFutuCreds());
}

/**
 * Accept PEM, base64 PKCS#8 DER (console one-liner), or hex DER.
 * Ed25519 PKCS#8 typically starts with MC4CAQAwBQYDK2VwBCIE when base64-encoded.
 */
function loadPrivateKey(privateKey: string): crypto.KeyObject {
  const raw = privateKey.replace(/\\n/g, "\n").trim();
  if (raw.includes("BEGIN")) {
    return crypto.createPrivateKey(raw);
  }
  const compact = raw.replace(/\s+/g, "");
  let der: Buffer | null = null;
  if (/^[0-9a-fA-F]+$/.test(compact) && compact.length % 2 === 0) {
    der = Buffer.from(compact, "hex");
  } else {
    try {
      der = Buffer.from(compact, "base64");
    } catch {
      der = null;
    }
  }
  if (der && der.length > 0) {
    try {
      return crypto.createPrivateKey({ key: der, format: "der", type: "pkcs8" });
    } catch {
      /* fall through to PEM wrap */
    }
    const lines = compact.match(/.{1,64}/g)?.join("\n") ?? compact;
    const pem = `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`;
    return crypto.createPrivateKey(pem);
  }
  return crypto.createPrivateKey(raw);
}

function signPayload(payload: string, creds: Extract<FutuCreds, { mode: "appkey" }>): string {
  const alg = (creds.signAlg || "ed25519").toLowerCase();
  const key = loadPrivateKey(creds.privateKey);
  if (alg === "rsa-sha256" || alg === "rsa") {
    const sig = crypto.sign("sha256", Buffer.from(payload, "utf8"), {
      key,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    });
    return sig.toString("base64");
  }
  const sig = crypto.sign(null, Buffer.from(payload, "utf8"), key);
  return sig.toString("base64");
}

async function syncServerTime(force = false): Promise<void> {
  if (!force && Date.now() - timeSyncedAt < TIME_SYNC_TTL_MS) return;
  try {
    const res = await fetch(`${FUTU_HOST}/api/v1.0/server-time`, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) return;
    const json = (await res.json()) as {
      server_time_ms?: string | number;
      data?: { server_time_ms?: string | number };
    };
    const raw = json.server_time_ms ?? json.data?.server_time_ms;
    const serverMs = Number(raw);
    if (Number.isFinite(serverMs) && serverMs > 0) {
      timeOffsetMs = serverMs - Date.now();
      timeSyncedAt = Date.now();
    }
  } catch {
    /* keep last offset / zero */
  }
}

function nowMs(): number {
  return Date.now() + timeOffsetMs;
}

async function buildAuthHeaders(
  method: string,
  requestPath: string,
  queryString: string,
  body: string | null,
): Promise<Record<string, string>> {
  const creds = currentFutuCreds();
  if (!creds) {
    throw new MarketDataError("Futu credentials not configured", "futu");
  }

  if (!hasAppKeyAuth() || creds.mode === "bearer") {
    if (creds.mode !== "bearer") {
      throw new MarketDataError("Futu credentials not configured", "futu");
    }
    return {
      Authorization: `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  await syncServerTime();
  const timestampMs = String(nowMs());
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
  const signature = signPayload(payload, creds);

  return {
    "X-Api-Key": creds.appKey,
    Authorization: signature,
    "X-Timestamp": timestampMs,
    "X-Nonce": nonce,
    "Content-Type": "application/json",
  };
}

type FutuEnvelope<T> = {
  ret_code?: number;
  code?: number;
  ret_msg?: string;
  message?: string;
  data?: T;
  extra?: { next_time?: number };
  pagination?: { has_more?: boolean; next_key?: string };
};

export type FutuRequestResult<T> = {
  data: T;
  nextTime?: number;
  hasMore?: boolean;
  nextKey?: string;
};

export async function futuRequest<T>(
  method: "GET" | "POST",
  requestPath: string,
  opts?: { query?: Record<string, string | number | undefined>; body?: unknown },
): Promise<FutuRequestResult<T>> {
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

  const headers = await buildAuthHeaders(
    method,
    requestPath,
    queryString,
    bodyStr,
  );
  const res = await fetch(url, {
    method,
    headers,
    body: bodyStr,
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Clock skew → resync and surface a clear error for one retry upstream
    if (res.status === 401 || text.includes("-12006")) {
      await syncServerTime(true);
    }
    throw new MarketDataError(
      `Futu HTTP ${res.status}: ${text.slice(0, 200)}`,
      "futu",
    );
  }

  const json = (await res.json()) as FutuEnvelope<T> & {
    data?: T & { next_time?: number };
  };
  const ret = json.ret_code ?? json.code;
  if (ret != null && ret !== 0) {
    if (ret === -12006) await syncServerTime(true);
    throw new MarketDataError(
      `Futu ${ret}: ${json.ret_msg || json.message || "request failed"}`,
      "futu",
    );
  }
  if (json.data === undefined) {
    throw new MarketDataError("Futu empty response", "futu");
  }

  const nextTime =
    Number(json.data?.next_time ?? json.extra?.next_time ?? 0) || undefined;

  return {
    data: json.data,
    nextTime,
    hasMore: json.pagination?.has_more,
    nextKey: json.pagination?.next_key,
  };
}

import { resolveTigerCreds } from "@/lib/market/resolve-market-creds";
import { ensureFreshTigerBearer } from "@/lib/market/providers/tiger-token";
import { MarketDataError } from "@/lib/market/types";

/** Max symbols per Tiger quote/kline request (official cap). */
export const TIGER_SYMBOL_CHUNK = 50;

const DEFAULT_HOST = "https://openapi.tigerfintech.com";
const DEFAULT_VERSION = "2.0";
const CHARSET = "UTF-8";

type TigerGatewayResponse = {
  code?: number;
  message?: string;
  msg?: string;
  data?: unknown;
};

function gatewayUrl(): string {
  const raw = (
    process.env.TIGER_API_HOST?.trim() || DEFAULT_HOST
  ).replace(/\/+$/, "");
  if (raw.endsWith("/gateway")) return raw;
  return `${raw}/gateway`;
}

function formatTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

export function isTigerConfigured(): boolean {
  return Boolean(resolveTigerCreds());
}

/**
 * POST Tiger OpenAPI gateway (OAuth Bearer).
 * Body mirrors SDK execute: method + biz_content JSON, no RSA sign fields.
 */
export async function tigerExecute<T = unknown>(
  method: string,
  biz: Record<string, unknown>,
  opts?: { version?: string },
): Promise<T> {
  const creds = resolveTigerCreds();
  if (!creds?.accessToken) {
    throw new MarketDataError("Tiger credentials not configured", "tiger");
  }

  const fresh = await ensureFreshTigerBearer(creds);
  const body = {
    method,
    charset: CHARSET,
    version: opts?.version ?? DEFAULT_VERSION,
    timestamp: formatTimestamp(),
    biz_content: JSON.stringify(biz),
  };

  let res: Response;
  try {
    res = await fetch(gatewayUrl(), {
      method: "POST",
      headers: {
        "Content-Type": `application/json;charset=${CHARSET}`,
        Authorization: `Bearer ${fresh.accessToken}`,
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
  } catch (err) {
    throw new MarketDataError(
      err instanceof Error ? err.message : "Tiger request failed",
      "tiger",
    );
  }

  if (res.status === 401 || res.status === 403) {
    throw new MarketDataError(
      `Tiger auth failed (HTTP ${res.status})`,
      "tiger",
    );
  }

  const text = await res.text().catch(() => "");
  let json: TigerGatewayResponse = {};
  try {
    json = text ? (JSON.parse(text) as TigerGatewayResponse) : {};
  } catch {
    throw new MarketDataError(
      `Tiger invalid JSON (HTTP ${res.status})`,
      "tiger",
    );
  }

  if (!res.ok) {
    const msg =
      String(json.message ?? json.msg ?? text).slice(0, 200) ||
      `HTTP ${res.status}`;
    throw new MarketDataError(`Tiger request failed: ${msg}`, "tiger");
  }

  const code = Number(json.code);
  if (Number.isFinite(code) && code !== 0) {
    const msg = String(json.message ?? json.msg ?? `code ${code}`).slice(
      0,
      200,
    );
    throw new MarketDataError(`Tiger API error: ${msg}`, "tiger");
  }

  return json.data as T;
}

/** Split symbols into ≤50 chunks for batch quote calls. */
export function chunkTigerSymbols(symbols: string[]): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < symbols.length; i += TIGER_SYMBOL_CHUNK) {
    out.push(symbols.slice(i, i + TIGER_SYMBOL_CHUNK));
  }
  return out;
}

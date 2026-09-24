import { createHash, createHmac } from "crypto";
import { getMarketCreds } from "@/lib/market/creds-context";

const HOST =
  process.env.LONGBRIDGE_HTTP_HOST?.trim() ||
  "https://openapi.longbridge.cn";

function hasLongbridgeCreds(): boolean {
  return Boolean(getMarketCreds().longbridge);
}

export { hasLongbridgeCreds as hasLongbridgeHttpCreds };

function sha1Hex(s: string): string {
  return createHash("sha1").update(s).digest("hex");
}

function hmacHex(secret: string, s: string): string {
  return createHmac("sha256", secret).update(s).digest("hex");
}

function signGet(
  path: string,
  query: string,
  ts: string,
  key: string,
  secret: string,
  token: string,
): string {
  const signedHeaders = "authorization;x-api-key;x-timestamp";
  const headerVals =
    `authorization:${token}\n` +
    `x-api-key:${key}\n` +
    `x-timestamp:${ts}\n`;
  const canonical = `GET|${path}|${query}|${headerVals}|${signedHeaders}|`;
  return `HMAC-SHA256 SignedHeaders=${signedHeaders}, Signature=${hmacHex(
    secret,
    `HMAC-SHA256|${sha1Hex(canonical)}`,
  )}`;
}

/** Signed Longbridge OpenAPI GET (JSON body). Uses request ALS BYOK. */
export async function longbridgeHttpGet<T = unknown>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const creds = getMarketCreds().longbridge;
  if (!creds) {
    throw new Error("Longbridge credentials not configured");
  }
  const { appKey: key, appSecret: secret, accessToken: token } = creds;

  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

  const ts = String(Math.floor(Date.now() / 1000));
  const signature = signGet(path, query, ts, key, secret, token);
  const url = query ? `${HOST}${path}?${query}` : `${HOST}${path}`;

  const res = await fetch(url, {
    headers: {
      "X-Api-Key": key,
      Authorization: token,
      "X-Timestamp": ts,
      "X-Api-Signature": signature,
    },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Longbridge HTTP ${res.status} ${path}`);
  }
  return (await res.json()) as T;
}

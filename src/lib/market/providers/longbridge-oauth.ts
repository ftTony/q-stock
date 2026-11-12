import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import type { LongbridgeBearerCreds } from "@/lib/market/creds-types";

/**
 * Longbridge OpenAPI OAuth 2.0 + PKCE helpers.
 * @see https://open.longbridge.com/zh-CN/docs/getting-started
 * @see https://open.longbridge.com/docs/api
 */

const COOKIE_NAME = "q_lb_oauth";
const COOKIE_MAX_AGE_SEC = 10 * 60;

/** Official SDK default authorize scope (quotes need no extra scopes). */
const DEFAULT_SCOPE = "3";

export type LongbridgeOAuthSession = {
  state: string;
  codeVerifier: string;
  userId: string;
  locale: string;
};

export type LongbridgeTokenResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
};

function base64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function getLongbridgeOAuthCookieName(): string {
  return COOKIE_NAME;
}

export function getLongbridgeOAuthCookieMaxAge(): number {
  return COOKIE_MAX_AGE_SEC;
}

export function getLongbridgeOAuthClientId(): string | undefined {
  return process.env.LONGBRIDGE_OAUTH_CLIENT_ID?.trim() || undefined;
}

export function isLongbridgeOAuthConfigured(): boolean {
  return Boolean(getLongbridgeOAuthClientId());
}

/** OAuth HTTP host (.com / .cn). Token works on both. */
export function getLongbridgeOAuthHost(): string {
  const explicit =
    process.env.LONGBRIDGE_OAUTH_HOST?.trim() ||
    process.env.LONGBRIDGE_HTTP_URL?.trim();
  if (explicit) {
    try {
      const u = new URL(explicit);
      return `${u.protocol}//${u.host}`;
    } catch {
      return explicit.replace(/\/+$/, "");
    }
  }
  return "https://openapi.longbridge.com";
}

export function getLongbridgeOAuthScope(): string {
  return process.env.LONGBRIDGE_OAUTH_SCOPE?.trim() || DEFAULT_SCOPE;
}

/** Public callback URL registered with the Longbridge OAuth client. */
export function getLongbridgeOAuthRedirectUri(): string {
  const explicit = process.env.LONGBRIDGE_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const origin = (
    process.env.APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
  return `${origin}/api/oauth/longbridge/callback`;
}

export function createPkcePair(): {
  codeVerifier: string;
  codeChallenge: string;
} {
  const codeVerifier = base64Url(crypto.randomBytes(32));
  const codeChallenge = base64Url(
    crypto.createHash("sha256").update(codeVerifier, "utf8").digest(),
  );
  return { codeVerifier, codeChallenge };
}

export function createOAuthState(): string {
  return base64Url(crypto.randomBytes(24));
}

export function buildAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const q = new URLSearchParams({
    client_id: opts.clientId,
    response_type: "code",
    redirect_uri: opts.redirectUri,
    state: opts.state,
    scope: getLongbridgeOAuthScope(),
    code_challenge: opts.codeChallenge,
    code_challenge_method: "S256",
  });
  return `${getLongbridgeOAuthHost()}/oauth2/authorize?${q.toString()}`;
}

async function postToken(
  body: Record<string, string>,
): Promise<LongbridgeTokenResponse> {
  const res = await fetch(`${getLongbridgeOAuthHost()}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const text = await res.text().catch(() => "");
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    json = {};
  }
  if (!res.ok) {
    const msg =
      String(json.error_description ?? json.error ?? text).slice(0, 200) ||
      `HTTP ${res.status}`;
    throw new Error(`Longbridge token exchange failed: ${msg}`);
  }
  const accessToken = String(json.access_token ?? "").trim();
  if (!accessToken) {
    throw new Error("Longbridge token response missing access_token");
  }
  const refreshToken = String(json.refresh_token ?? "").trim() || undefined;
  const expiresInRaw = Number(json.expires_in);
  return {
    accessToken,
    refreshToken,
    expiresIn: Number.isFinite(expiresInRaw) ? expiresInRaw : undefined,
    tokenType: String(json.token_type ?? "").trim() || undefined,
    scope: String(json.scope ?? "").trim() || undefined,
  };
}

export async function exchangeAuthorizationCode(opts: {
  code: string;
  codeVerifier: string;
  clientId: string;
  redirectUri: string;
}): Promise<LongbridgeTokenResponse> {
  return postToken({
    grant_type: "authorization_code",
    code: opts.code,
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    code_verifier: opts.codeVerifier,
  });
}

export async function refreshAccessToken(opts: {
  refreshToken: string;
  clientId: string;
}): Promise<LongbridgeTokenResponse> {
  return postToken({
    grant_type: "refresh_token",
    refresh_token: opts.refreshToken,
    client_id: opts.clientId,
  });
}

/** Absolute expiry ms; refresh a bit early. */
export function expiresAtFromExpiresIn(
  expiresInSec?: number,
): number | undefined {
  if (expiresInSec == null || !(expiresInSec > 0)) return undefined;
  return Date.now() + expiresInSec * 1000;
}

export function shouldRefreshAccessToken(expiresAt?: number): boolean {
  if (expiresAt == null || !(expiresAt > 0)) return false;
  return Date.now() >= expiresAt - 60_000;
}

/**
 * Node SDK only builds OAuth Config via disk cache at
 * `~/.longbridge/openapi/tokens/<client_id>`. Write the user token there
 * before `OAuth.build` (single-file; caller must serialize).
 */
export async function writeLongbridgeSdkTokenFile(
  clientId: string,
  creds: LongbridgeBearerCreds,
): Promise<void> {
  const dir = path.join(os.homedir(), ".longbridge", "openapi", "tokens");
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, clientId);
  const body: Record<string, string | number | undefined> = {
    access_token: creds.accessToken,
    refresh_token: creds.refreshToken,
    token_type: "Bearer",
    http_url: getLongbridgeOAuthHost(),
  };
  if (creds.expiresAt != null && creds.expiresAt > 0) {
    body.expires_at = Math.floor(creds.expiresAt / 1000);
  }
  await fs.writeFile(file, JSON.stringify(body), { mode: 0o600 });
}

import crypto from "crypto";

/**
 * Tiger OpenAPI OAuth 2.0 helpers (confidential client).
 * @see https://docs.itigerup.com/docs/authentication
 * @see https://enterprise-docs.itigerup.com/reference/get-v1-authorize
 * @see https://enterprise-docs.itigerup.com/reference/post-v1-token
 */

const COOKIE_NAME = "q_tiger_oauth";
const COOKIE_MAX_AGE_SEC = 10 * 60;

const DEFAULT_HOST = "https://openapi.tigerfintech.com/oauth2";
const DEFAULT_SCOPE = "uuid offline";
const DEFAULT_AUDIENCE = "openapi";

export type TigerOAuthSession = {
  state: string;
  userId: string;
  locale: string;
};

export type TigerTokenResponse = {
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

export function getTigerOAuthCookieName(): string {
  return COOKIE_NAME;
}

export function getTigerOAuthCookieMaxAge(): number {
  return COOKIE_MAX_AGE_SEC;
}

export function getTigerOAuthClientId(): string | undefined {
  return process.env.TIGER_OAUTH_CLIENT_ID?.trim() || undefined;
}

export function getTigerOAuthClientSecret(): string | undefined {
  return process.env.TIGER_OAUTH_CLIENT_SECRET?.trim() || undefined;
}

export function isTigerOAuthConfigured(): boolean {
  return Boolean(getTigerOAuthClientId() && getTigerOAuthClientSecret());
}

export function getTigerOAuthHost(): string {
  const explicit = process.env.TIGER_OAUTH_HOST?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  return DEFAULT_HOST;
}

export function getTigerOAuthScope(): string {
  return process.env.TIGER_OAUTH_SCOPE?.trim() || DEFAULT_SCOPE;
}

export function getTigerOAuthAudience(): string {
  return process.env.TIGER_OAUTH_AUDIENCE?.trim() || DEFAULT_AUDIENCE;
}

/** Public callback URL registered with the Tiger OAuth app. */
export function getTigerOAuthRedirectUri(): string {
  const explicit = process.env.TIGER_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const origin = (
    process.env.APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
  return `${origin}/api/oauth/tiger/callback`;
}

export function createOAuthState(): string {
  return base64Url(crypto.randomBytes(24));
}

export function buildAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const q = new URLSearchParams({
    client_id: opts.clientId,
    response_type: "code",
    redirect_uri: opts.redirectUri,
    state: opts.state,
    scope: getTigerOAuthScope(),
    audience: getTigerOAuthAudience(),
  });
  return `${getTigerOAuthHost()}/v1/authorize?${q.toString()}`;
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64")}`;
}

async function postToken(
  body: Record<string, string>,
): Promise<TigerTokenResponse> {
  const clientId = getTigerOAuthClientId();
  const clientSecret = getTigerOAuthClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("Tiger OAuth client_id/secret not configured");
  }

  const res = await fetch(`${getTigerOAuthHost()}/v1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
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
    throw new Error(`Tiger token exchange failed: ${msg}`);
  }
  const accessToken = String(json.access_token ?? "").trim();
  if (!accessToken) {
    throw new Error("Tiger token response missing access_token");
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
  redirectUri: string;
}): Promise<TigerTokenResponse> {
  return postToken({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
  });
}

export async function refreshAccessToken(opts: {
  refreshToken: string;
}): Promise<TigerTokenResponse> {
  return postToken({
    grant_type: "refresh_token",
    refresh_token: opts.refreshToken,
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

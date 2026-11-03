import crypto from "crypto";

/**
 * Futu OpenAPI OAuth 2.1 + PKCE helpers.
 * @see https://open.futunn.com/api/overview/getting-started
 */

const FUTU_HOST =
  process.env.FUTU_HTTP_URL?.trim() || "https://webapi.futunn.com";

const COOKIE_NAME = "q_futu_oauth";
const COOKIE_MAX_AGE_SEC = 10 * 60;

export type FutuOAuthSession = {
  state: string;
  codeVerifier: string;
  userId: string;
  locale: string;
};

export type FutuTokenResponse = {
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

export function getFutuOAuthCookieName(): string {
  return COOKIE_NAME;
}

export function getFutuOAuthCookieMaxAge(): number {
  return COOKIE_MAX_AGE_SEC;
}

export function getFutuOAuthClientId(): string | undefined {
  return process.env.FUTU_OAUTH_CLIENT_ID?.trim() || undefined;
}

export function isFutuOAuthConfigured(): boolean {
  return Boolean(getFutuOAuthClientId());
}

/** Public callback URL registered with the Futu OAuth client. */
export function getFutuOAuthRedirectUri(): string {
  const explicit = process.env.FUTU_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const origin = (
    process.env.APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
  return `${origin}/api/oauth/futu/callback`;
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
    code_challenge: opts.codeChallenge,
    code_challenge_method: "S256",
  });
  return `${FUTU_HOST}/oauth2/authorize/confirm?${q.toString()}`;
}

async function postToken(
  body: Record<string, string>,
): Promise<FutuTokenResponse> {
  const res = await fetch(`${FUTU_HOST}/oauth2/token`, {
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
    throw new Error(`Futu token exchange failed: ${msg}`);
  }
  const accessToken = String(json.access_token ?? "").trim();
  if (!accessToken) {
    throw new Error("Futu token response missing access_token");
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
}): Promise<FutuTokenResponse> {
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
}): Promise<FutuTokenResponse> {
  return postToken({
    grant_type: "refresh_token",
    refresh_token: opts.refreshToken,
    client_id: opts.clientId,
  });
}

/** Absolute expiry ms; refresh a bit early. */
export function expiresAtFromExpiresIn(expiresInSec?: number): number | undefined {
  if (expiresInSec == null || !(expiresInSec > 0)) return undefined;
  return Date.now() + expiresInSec * 1000;
}

export function shouldRefreshAccessToken(expiresAt?: number): boolean {
  if (expiresAt == null || !(expiresAt > 0)) return false;
  return Date.now() >= expiresAt - 60_000;
}

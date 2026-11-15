import { createLocalJWKSet, jwtVerify, type LocalJWKSet, type JSONWebKeySet } from "jose";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getProxyAwareFetch } from "@/lib/http/proxy-fetch";
import { GOOGLE_JWKS_BUNDLED } from "@/lib/auth/google-jwks";

/**
 * Verify a Google-issued ID token (Google One Tap / FedCM) against Google's
 * published JWK Set.
 *
 * Key resolution order:
 *  1. in-memory cache (6h)
 *  2. live fetch with a 2.5s timeout (proxy-aware) → persisted to ApiCache
 *  3. ApiCache rows persisted by a previous successful fetch
 *  4. the bundled snapshot in `google-jwks.ts` — works on hosts that can
 *     never reach Google (mainland dev machines / mainland servers)
 *
 * Google keeps old signing keys published for years, so a stale snapshot
 * still verifies correctly; the live refresh exists to pick up new kids.
 */

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const JWKS_TTL_MS = 6 * 60 * 60 * 1000;
const LIVE_FETCH_TIMEOUT_MS = 2_500;
const APICACHE_KEY = "auth:google-jwks";
const APICACHE_TTL_DAYS = 30;

export type GoogleIdTokenClaims = {
  email: string;
  name: string | null;
  emailVerified: boolean;
};

let jwks: LocalJWKSet | null = null;
let jwksLoadedAt = 0;

async function fetchJwksLive(): Promise<JSONWebKeySet | null> {
  const doFetch = getProxyAwareFetch();
  try {
    const res = await doFetch(GOOGLE_JWKS_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(LIVE_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as JSONWebKeySet;
  } catch {
    // Offline / blocked host — fall through to cached or bundled keys.
    return null;
  }
}

async function jwksFromApiCache(): Promise<JSONWebKeySet | null> {
  try {
    const row = await prisma.apiCache.findUnique({
      where: { key: APICACHE_KEY },
      select: { value: true, expiresAt: true },
    });
    if (!row || row.expiresAt.getTime() < Date.now()) return null;
    return row.value as unknown as JSONWebKeySet;
  } catch {
    return null;
  }
}

async function persistJwks(set: JSONWebKeySet): Promise<void> {
  const expiresAt = new Date(Date.now() + APICACHE_TTL_DAYS * 86_400_000);
  const value = set as unknown as Prisma.InputJsonValue;
  try {
    await prisma.apiCache.upsert({
      where: { key: APICACHE_KEY },
      create: { key: APICACHE_KEY, value, expiresAt },
      update: { value, expiresAt },
    });
  } catch {
    // Cache write is best-effort.
  }
}

async function resolveJwks(): Promise<LocalJWKSet> {
  if (jwks && Date.now() - jwksLoadedAt < JWKS_TTL_MS) return jwks;

  const live = await fetchJwksLive();
  if (live?.keys?.length) {
    jwks = createLocalJWKSet(live);
    jwksLoadedAt = Date.now();
    void persistJwks(live);
    return jwks;
  }

  const cached = await jwksFromApiCache();
  if (cached?.keys?.length) {
    jwks = createLocalJWKSet(cached);
    jwksLoadedAt = Date.now();
    return jwks;
  }

  jwks = createLocalJWKSet(GOOGLE_JWKS_BUNDLED as unknown as JSONWebKeySet);
  jwksLoadedAt = Date.now();
  return jwks;
}

/**
 * Returns verified claims, or null when the token is invalid / not usable for
 * login (unverified email). Throws only on unexpected failures so callers can
 * log them.
 */
export async function verifyGoogleIdToken(
  credential: string,
  audience: string,
): Promise<GoogleIdTokenClaims | null> {
  const keySet = await resolveJwks();
  const { payload } = await jwtVerify(credential, keySet, {
    issuer: GOOGLE_ISSUERS,
    audience,
    // One Tap tokens are short-lived; 30s clock skew is plenty.
    clockTolerance: 30,
  });

  const email =
    typeof payload.email === "string" ? payload.email.toLowerCase() : "";
  if (!email) return null;
  if (payload.email_verified === false) return null;

  return {
    email,
    name: typeof payload.name === "string" ? payload.name : null,
    emailVerified: payload.email_verified === true,
  };
}

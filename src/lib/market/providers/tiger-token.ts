import { prisma } from "@/lib/db";
import { encryptJson } from "@/lib/crypto/secret-box";
import {
  getMarketCreds,
  invalidateUserMarketCredsCache,
} from "@/lib/market/creds-context";
import type { TigerBearerCreds } from "@/lib/market/creds-types";
import {
  expiresAtFromExpiresIn,
  getTigerOAuthClientId,
  getTigerOAuthClientSecret,
  refreshAccessToken,
  shouldRefreshAccessToken,
} from "@/lib/market/providers/tiger-oauth";

/** In-flight refresh per user (bounded: prune after settle). */
const refreshInflight = new Map<string, Promise<TigerBearerCreds>>();

async function persistUserBearer(
  userId: string,
  next: TigerBearerCreds,
): Promise<void> {
  const payload = encryptJson(next);
  await prisma.userMarketCredential.upsert({
    where: { userId_provider: { userId, provider: "tiger" } },
    create: { userId, provider: "tiger", payload },
    update: { payload },
  });
  invalidateUserMarketCredsCache(userId);
  const store = getMarketCreds();
  if (store.userId === userId) {
    store.tiger = next;
  }
}

/**
 * Renew OAuth access_token when near expiry.
 * Tiger rotates refresh_token — always persist the new pair.
 * Env-only tokens (no userId / no refreshToken) are returned unchanged.
 */
export async function ensureFreshTigerBearer(
  creds: TigerBearerCreds,
): Promise<TigerBearerCreds> {
  if (!shouldRefreshAccessToken(creds.expiresAt) || !creds.refreshToken) {
    return creds;
  }
  const clientId = getTigerOAuthClientId();
  const clientSecret = getTigerOAuthClientSecret();
  const userId = getMarketCreds().userId;
  if (!clientId || !clientSecret || !userId) return creds;

  const existing = refreshInflight.get(userId);
  if (existing) return existing;

  const job = (async () => {
    const tokens = await refreshAccessToken({
      refreshToken: creds.refreshToken!,
    });
    const next: TigerBearerCreds = {
      mode: "bearer",
      accessToken: tokens.accessToken,
      // Tiger rotates refresh_token on every refresh.
      refreshToken: tokens.refreshToken || creds.refreshToken,
      expiresAt: expiresAtFromExpiresIn(tokens.expiresIn),
    };
    await persistUserBearer(userId, next);
    return next;
  })().finally(() => {
    refreshInflight.delete(userId);
  });

  refreshInflight.set(userId, job);
  try {
    return await job;
  } catch (err) {
    console.warn(
      "[tiger] token refresh failed:",
      err instanceof Error ? err.message : err,
    );
    return creds;
  }
}

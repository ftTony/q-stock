import { AsyncLocalStorage } from "async_hooks";
import { prisma } from "@/lib/db";
import { decryptJson } from "@/lib/crypto/secret-box";
import type {
  FutuCreds,
  LongbridgeCreds,
  MarketCredsStore,
} from "@/lib/market/creds-types";

const als = new AsyncLocalStorage<MarketCredsStore>();

const CACHE_TTL_MS = 60_000;
const cache = new Map<
  string,
  { store: MarketCredsStore; expiresAt: number }
>();

export function getMarketCreds(): MarketCredsStore {
  return als.getStore() ?? {};
}

export function runWithMarketCreds<T>(
  store: MarketCredsStore,
  fn: () => T,
): T {
  return als.run(store, fn);
}

export function invalidateUserMarketCredsCache(userId: string): void {
  cache.delete(userId);
}

function parseLongbridge(raw: unknown): LongbridgeCreds | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const appKey = String(o.appKey ?? "").trim();
  const appSecret = String(o.appSecret ?? "").trim();
  const accessToken = String(o.accessToken ?? "").trim();
  if (!appKey || !appSecret || !accessToken) return undefined;
  return { appKey, appSecret, accessToken };
}

function parseFutu(raw: unknown): FutuCreds | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const mode = String(o.mode ?? "").toLowerCase();
  if (mode === "bearer") {
    const accessToken = String(o.accessToken ?? "").trim();
    if (!accessToken) return undefined;
    return { mode: "bearer", accessToken };
  }
  if (mode === "appkey") {
    const appKey = String(o.appKey ?? "").trim();
    const privateKey = String(o.privateKey ?? "").trim();
    if (!appKey || !privateKey) return undefined;
    const signAlg = o.signAlg ? String(o.signAlg).trim() : undefined;
    return { mode: "appkey", appKey, privateKey, signAlg };
  }
  return undefined;
}

export async function loadUserMarketCreds(
  userId: string,
): Promise<MarketCredsStore> {
  const hit = cache.get(userId);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.store;
  }

  const rows = await prisma.userMarketCredential.findMany({
    where: { userId },
  });

  const store: MarketCredsStore = { userId };
  for (const row of rows) {
    try {
      const parsed = decryptJson<unknown>(row.payload);
      if (row.provider === "longbridge") {
        store.longbridge = parseLongbridge(parsed);
      } else if (row.provider === "futu") {
        store.futu = parseFutu(parsed);
      }
    } catch (err) {
      console.warn(
        `[market-creds] decrypt failed for ${row.provider}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  cache.set(userId, { store, expiresAt: Date.now() + CACHE_TTL_MS });
  return store;
}

/** Status for GET API — never includes secrets. */
export async function getUserMarketCredsStatus(userId: string): Promise<{
  longbridge: { configured: boolean };
  futu: { configured: boolean; mode?: "bearer" | "appkey" };
}> {
  const store = await loadUserMarketCreds(userId);
  return {
    longbridge: { configured: Boolean(store.longbridge) },
    futu: {
      configured: Boolean(store.futu),
      mode: store.futu?.mode,
    },
  };
}

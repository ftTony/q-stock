import { AsyncLocalStorage } from "async_hooks";
import { prisma } from "@/lib/db";
import { decryptJson } from "@/lib/crypto/secret-box";
import type {
  BinanceCreds,
  FutuCreds,
  LongbridgeCreds,
  MarketCredsStore,
  OkxCreds,
} from "@/lib/market/creds-types";
import type { CryptoVendorId, EquityVendorId } from "@/lib/market/types";

const als = new AsyncLocalStorage<MarketCredsStore>();

const CACHE_TTL_MS = 60_000;
const cache = new Map<
  string,
  { store: MarketCredsStore; expiresAt: number }
>();

function marketCredentialDelegate() {
  const d = prisma.userMarketCredential;
  if (!d) {
    throw new Error(
      "Prisma client missing UserMarketCredential — run `npx prisma generate` and restart the server",
    );
  }
  return d;
}

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

function parseBinance(raw: unknown): BinanceCreds | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const apiKey = String(o.apiKey ?? "").trim();
  if (!apiKey) return undefined;
  const apiSecret = String(o.apiSecret ?? "").trim() || undefined;
  return { apiKey, apiSecret };
}

function parseOkx(raw: unknown): OkxCreds | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const apiKey = String(o.apiKey ?? "").trim();
  if (!apiKey) return undefined;
  return {
    apiKey,
    apiSecret: String(o.apiSecret ?? "").trim() || undefined,
    passphrase: String(o.passphrase ?? "").trim() || undefined,
  };
}

export async function loadUserMarketCreds(
  userId: string,
): Promise<MarketCredsStore> {
  const hit = cache.get(userId);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.store;
  }

  const [rows, user] = await Promise.all([
    marketCredentialDelegate().findMany({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { equityVendor: true, cryptoVendor: true },
    }),
  ]);

  const store: MarketCredsStore = {
    userId,
    equityVendor: (user?.equityVendor as EquityVendorId | undefined) ?? "longbridge",
    cryptoVendor: (user?.cryptoVendor as CryptoVendorId | undefined) ?? "binance",
  };
  for (const row of rows) {
    try {
      const parsed = decryptJson<unknown>(row.payload);
      if (row.provider === "longbridge") {
        store.longbridge = parseLongbridge(parsed);
      } else if (row.provider === "futu") {
        store.futu = parseFutu(parsed);
      } else if (row.provider === "binance") {
        store.binance = parseBinance(parsed);
      } else if (row.provider === "okx") {
        store.okx = parseOkx(parsed);
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

export async function getUserMarketCredsStatus(userId: string): Promise<{
  longbridge: { configured: boolean };
  futu: { configured: boolean; mode?: "bearer" | "appkey" };
  binance: { configured: boolean };
  okx: { configured: boolean };
  equityVendor: EquityVendorId;
  cryptoVendor: CryptoVendorId;
}> {
  const store = await loadUserMarketCreds(userId);
  return {
    longbridge: { configured: Boolean(store.longbridge) },
    futu: {
      configured: Boolean(store.futu),
      mode: store.futu?.mode,
    },
    binance: { configured: Boolean(store.binance) },
    okx: { configured: Boolean(store.okx) },
    equityVendor: store.equityVendor ?? "longbridge",
    cryptoVendor: store.cryptoVendor ?? "binance",
  };
}

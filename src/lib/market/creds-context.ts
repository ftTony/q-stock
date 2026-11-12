import { AsyncLocalStorage } from "async_hooks";
import { prisma } from "@/lib/db";
import { decryptJson } from "@/lib/crypto/secret-box";
import type {
  BinanceCreds,
  FutuCreds,
  FuyaoCreds,
  LongbridgeCreds,
  MarketCredsStore,
  OkxCreds,
} from "@/lib/market/creds-types";
import type { CryptoVendorId, EquityVendorId } from "@/lib/market/types";
import { isFutuOAuthConfigured } from "@/lib/market/providers/futu-oauth";
import { isLongbridgeOAuthConfigured } from "@/lib/market/providers/longbridge-oauth";

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
  const mode = String(o.mode ?? "").toLowerCase();
  if (mode === "bearer") {
    const accessToken = String(o.accessToken ?? "").trim();
    if (!accessToken) return undefined;
    const refreshToken = String(o.refreshToken ?? "").trim() || undefined;
    const expiresAtRaw = Number(o.expiresAt);
    const expiresAt =
      Number.isFinite(expiresAtRaw) && expiresAtRaw > 0
        ? expiresAtRaw
        : undefined;
    return { mode: "bearer", accessToken, refreshToken, expiresAt };
  }
  const appKey = String(o.appKey ?? "").trim();
  const appSecret = String(o.appSecret ?? "").trim();
  const accessToken = String(o.accessToken ?? "").trim();
  if (!appKey || !appSecret || !accessToken) return undefined;
  return { mode: "appkey", appKey, appSecret, accessToken };
}

function parseFutu(raw: unknown): FutuCreds | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const mode = String(o.mode ?? "").toLowerCase();
  if (mode === "bearer") {
    const accessToken = String(o.accessToken ?? "").trim();
    if (!accessToken) return undefined;
    const refreshToken = String(o.refreshToken ?? "").trim() || undefined;
    const expiresAtRaw = Number(o.expiresAt);
    const expiresAt =
      Number.isFinite(expiresAtRaw) && expiresAtRaw > 0
        ? expiresAtRaw
        : undefined;
    return { mode: "bearer", accessToken, refreshToken, expiresAt };
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

function parseFuyao(raw: unknown): FuyaoCreds | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const apiKey = String(o.apiKey ?? "").trim();
  if (!apiKey) return undefined;
  return { apiKey };
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
      } else if (row.provider === "fuyao") {
        store.fuyao = parseFuyao(parsed);
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
  longbridge: {
    configured: boolean;
    mode?: "bearer" | "appkey";
    oauthAvailable: boolean;
  };
  futu: {
    configured: boolean;
    mode?: "bearer" | "appkey";
    oauthAvailable: boolean;
  };
  binance: { configured: boolean };
  okx: { configured: boolean };
  fuyao: { configured: boolean };
  equityVendor: EquityVendorId;
  cryptoVendor: CryptoVendorId;
}> {
  const store = await loadUserMarketCreds(userId);
  const lb = store.longbridge;
  return {
    longbridge: {
      configured: Boolean(lb),
      mode: lb ? (lb.mode === "bearer" ? "bearer" : "appkey") : undefined,
      oauthAvailable: isLongbridgeOAuthConfigured(),
    },
    futu: {
      configured: Boolean(store.futu),
      mode: store.futu?.mode,
      oauthAvailable: isFutuOAuthConfigured(),
    },
    binance: { configured: Boolean(store.binance) },
    okx: { configured: Boolean(store.okx) },
    fuyao: { configured: Boolean(store.fuyao) },
    equityVendor: store.equityVendor ?? "longbridge",
    cryptoVendor: store.cryptoVendor ?? "binance",
  };
}

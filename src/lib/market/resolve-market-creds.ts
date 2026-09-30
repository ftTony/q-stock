import { getMarketCreds } from "@/lib/market/creds-context";
import type {
  BinanceCreds,
  FutuCreds,
  FuyaoCreds,
  LongbridgeCreds,
  OkxCreds,
} from "@/lib/market/creds-types";

/** Platform Longbridge keys from env (all three required). */
export function envLongbridgeCreds(): LongbridgeCreds | undefined {
  const appKey = process.env.LONGBRIDGE_APP_KEY?.trim();
  const appSecret = process.env.LONGBRIDGE_APP_SECRET?.trim();
  const accessToken = process.env.LONGBRIDGE_ACCESS_TOKEN?.trim();
  if (!appKey || !appSecret || !accessToken) return undefined;
  return { appKey, appSecret, accessToken };
}

/** Env first, then user BYOK in ALS. */
export function resolveLongbridgeCreds(): LongbridgeCreds | undefined {
  return envLongbridgeCreds() ?? getMarketCreds().longbridge;
}

/** Platform Futu: Bearer token preferred, else AppKey + private key. */
export function envFutuCreds(): FutuCreds | undefined {
  const accessToken = process.env.FUTU_ACCESS_TOKEN?.trim();
  if (accessToken) {
    return { mode: "bearer", accessToken };
  }
  const appKey = process.env.FUTU_APP_KEY?.trim();
  const privateKey = process.env.FUTU_PRIVATE_KEY?.trim();
  if (!appKey || !privateKey) return undefined;
  const signAlg = process.env.FUTU_SIGN_ALG?.trim() || undefined;
  return { mode: "appkey", appKey, privateKey, signAlg };
}

export function resolveFutuCreds(): FutuCreds | undefined {
  return envFutuCreds() ?? getMarketCreds().futu;
}

export function envBinanceCreds(): BinanceCreds | undefined {
  const apiKey = process.env.BINANCE_API_KEY?.trim();
  if (!apiKey) return undefined;
  const apiSecret = process.env.BINANCE_API_SECRET?.trim() || undefined;
  return { apiKey, apiSecret };
}

export function resolveBinanceCreds(): BinanceCreds | undefined {
  return envBinanceCreds() ?? getMarketCreds().binance;
}

export function envOkxCreds(): OkxCreds | undefined {
  const apiKey = process.env.OKX_API_KEY?.trim();
  if (!apiKey) return undefined;
  return {
    apiKey,
    apiSecret: process.env.OKX_API_SECRET?.trim() || undefined,
    passphrase: process.env.OKX_PASSPHRASE?.trim() || undefined,
  };
}

export function resolveOkxCreds(): OkxCreds | undefined {
  return envOkxCreds() ?? getMarketCreds().okx;
}

export function envFuyaoApiKey(): string | undefined {
  return process.env.FUYAO_API_KEY?.trim() || undefined;
}

export function resolveFuyaoCreds(): FuyaoCreds | undefined {
  const fromEnv = envFuyaoApiKey();
  if (fromEnv) return { apiKey: fromEnv };
  return getMarketCreds().fuyao;
}

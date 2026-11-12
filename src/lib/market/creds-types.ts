import type { CryptoVendorId, EquityVendorId } from "@/lib/market/types";

export type LongbridgeBearerCreds = {
  mode: "bearer";
  accessToken: string;
  /** Present after OAuth PKCE; used to renew accessToken. */
  refreshToken?: string;
  /** Unix ms when accessToken expires. */
  expiresAt?: number;
};

export type LongbridgeAppKeyCreds = {
  mode?: "appkey";
  appKey: string;
  appSecret: string;
  accessToken: string;
};

export type LongbridgeCreds = LongbridgeBearerCreds | LongbridgeAppKeyCreds;

export function isLongbridgeBearer(
  c: LongbridgeCreds,
): c is LongbridgeBearerCreds {
  return (c as LongbridgeBearerCreds).mode === "bearer";
}

export type FutuBearerCreds = {
  mode: "bearer";
  accessToken: string;
  /** Present after OAuth PKCE; used to renew accessToken. */
  refreshToken?: string;
  /** Unix ms when accessToken expires (optional for legacy/env tokens). */
  expiresAt?: number;
};

export type FutuAppKeyCreds = {
  mode: "appkey";
  appKey: string;
  privateKey: string;
  signAlg?: string;
};

export type FutuCreds = FutuBearerCreds | FutuAppKeyCreds;

export type BinanceCreds = {
  apiKey: string;
  apiSecret?: string;
};

export type OkxCreds = {
  apiKey: string;
  apiSecret?: string;
  passphrase?: string;
};

export type FuyaoCreds = {
  apiKey: string;
};

/** Pin Longbridge/Futu resolve to user BYOK or platform env for one failover hop. */
export type BrokerCredsSource = "user" | "platform";

export type MarketCredsStore = {
  userId?: string;
  longbridge?: LongbridgeCreds;
  futu?: FutuCreds;
  binance?: BinanceCreds;
  okx?: OkxCreds;
  fuyao?: FuyaoCreds;
  /** Preferred US/HK broker when configured. */
  equityVendor?: EquityVendorId;
  /** Preferred crypto exchange. */
  cryptoVendor?: CryptoVendorId;
  /**
   * When set, `resolveLongbridgeCreds` / `resolveFutuCreds` only read this source.
   * Unset = user ?? platform (status / “any configured” checks).
   */
  brokerCredsSource?: BrokerCredsSource;
};

export function fingerprintLongbridge(c: LongbridgeCreds): string {
  if (isLongbridgeBearer(c)) {
    return `lb:bearer:${c.accessToken.slice(0, 8)}`;
  }
  return `lb:${c.appKey}:${c.accessToken.slice(0, 8)}`;
}

export function fingerprintFutu(c: FutuCreds): string {
  if (c.mode === "bearer") {
    return `futu:bearer:${c.accessToken.slice(0, 8)}`;
  }
  return `futu:appkey:${c.appKey}`;
}

export function fingerprintBinance(c: BinanceCreds): string {
  return `bn:${c.apiKey.slice(0, 8)}`;
}

export function fingerprintFuyao(c: FuyaoCreds): string {
  return `fy:${c.apiKey.slice(0, 8)}`;
}

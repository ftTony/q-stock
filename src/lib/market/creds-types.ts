import type { CryptoVendorId, EquityVendorId } from "@/lib/market/types";

export type LongbridgeCreds = {
  appKey: string;
  appSecret: string;
  accessToken: string;
};

export type FutuBearerCreds = {
  mode: "bearer";
  accessToken: string;
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
};

export function fingerprintLongbridge(c: LongbridgeCreds): string {
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

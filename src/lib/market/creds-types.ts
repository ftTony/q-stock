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

export type MarketCredsStore = {
  userId?: string;
  longbridge?: LongbridgeCreds;
  futu?: FutuCreds;
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

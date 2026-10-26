import type { AssetType } from "@/lib/types";
import { normalizeCnThscode } from "@/lib/types";

export const STOCK_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  GOOGL: "Alphabet Inc.",
  GOOG: "Alphabet Inc.",
  AMZN: "Amazon.com Inc.",
  NVDA: "NVIDIA Corp.",
  META: "Meta Platforms",
  TSLA: "Tesla Inc.",
  JPM: "JPMorgan Chase",
  "BRK.A": "Berkshire Hathaway A",
  "BRK.B": "Berkshire Hathaway B",
  "BRK/A": "Berkshire Hathaway A",
  "BRK/B": "Berkshire Hathaway B",
  MU: "Micron Technology",
  AMD: "Advanced Micro Devices",
  INTC: "Intel Corp.",
  NFLX: "Netflix Inc.",
  AVGO: "Broadcom Inc.",
  SKHY: "SK hynix Inc.",
};

export const HK_NAMES: Record<string, string> = {
  "00700": "腾讯控股",
  "09988": "阿里巴巴-SW",
  "03690": "美团-W",
  "01810": "小米集团-W",
  "00941": "中国移动",
  "01299": "友邦保险",
  "02318": "中国平安",
  "00388": "香港交易所",
};

export const CN_NAMES: Record<string, string> = {
  "600519.SH": "贵州茅台",
  "000001.SZ": "平安银行",
  "000858.SZ": "五粮液",
  "601318.SH": "中国平安",
  "300750.SZ": "宁德时代",
  "002594.SZ": "比亚迪",
  "601012.SH": "隆基绿能",
  "000333.SZ": "美的集团",
};

export const CRYPTO_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "BNB",
  XRP: "XRP",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  AVAX: "Avalanche",
};

/** Seeded / static map only — stable product copy when we know the ticker. */
export function seededDisplayName(
  symbol: string,
  assetType: AssetType,
): string | null {
  const key = symbol.toUpperCase();
  if (assetType === "crypto") return CRYPTO_NAMES[key] ?? null;
  if (assetType === "hk") {
    const padded = key.replace(/\D/g, "").padStart(5, "0");
    return HK_NAMES[padded] || HK_NAMES[key] || null;
  }
  if (assetType === "cn") {
    const ths = normalizeCnThscode(key);
    return CN_NAMES[ths] ?? null;
  }
  return STOCK_NAMES[key] ?? null;
}

/**
 * Prefer seeded names so UI copy does not flicker when quote feeds
 * alternate between REST (with name) and push (without) or vendor variants.
 * Live name is only used when we have no seed for the ticker.
 */
export function displayName(
  symbol: string,
  assetType: AssetType,
  liveName?: string | null,
): string {
  const seeded = seededDisplayName(symbol, assetType);
  if (seeded) return seeded;
  const live = liveName?.trim();
  if (live) return live;
  const key = symbol.toUpperCase();
  if (assetType === "cn") return normalizeCnThscode(key);
  if (assetType === "hk") {
    const padded = key.replace(/\D/g, "").padStart(5, "0");
    return padded || key;
  }
  return key;
}

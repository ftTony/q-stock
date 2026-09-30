import type { AssetType } from "@/lib/types";
import { normalizeCnThscode } from "@/lib/types";

export const STOCK_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com Inc.",
  NVDA: "NVIDIA Corp.",
  META: "Meta Platforms",
  TSLA: "Tesla Inc.",
  JPM: "JPMorgan Chase",
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

export function displayName(symbol: string, assetType: AssetType): string {
  const key = symbol.toUpperCase();
  if (assetType === "crypto") return CRYPTO_NAMES[key] || key;
  if (assetType === "hk") {
    const padded = key.replace(/\D/g, "").padStart(5, "0");
    return HK_NAMES[padded] || HK_NAMES[key] || key;
  }
  if (assetType === "cn") {
    const ths = normalizeCnThscode(key);
    return CN_NAMES[ths] || ths;
  }
  return STOCK_NAMES[key] || key;
}

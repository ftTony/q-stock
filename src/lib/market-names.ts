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

export function displayName(
  symbol: string,
  assetType: "stock" | "hk" | "crypto",
): string {
  const key = symbol.toUpperCase();
  if (assetType === "crypto") return CRYPTO_NAMES[key] || key;
  if (assetType === "hk") {
    const padded = key.replace(/\D/g, "").padStart(5, "0");
    return HK_NAMES[padded] || HK_NAMES[key] || key;
  }
  return STOCK_NAMES[key] || key;
}

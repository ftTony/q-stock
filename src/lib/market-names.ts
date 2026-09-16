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

export function displayName(symbol: string, assetType: "stock" | "crypto"): string {
  const key = symbol.toUpperCase();
  if (assetType === "crypto") return CRYPTO_NAMES[key] || key;
  return STOCK_NAMES[key] || key;
}

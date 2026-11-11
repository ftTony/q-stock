import type { AssetType } from "@/lib/types";

export type SymbolLearnHubLink = {
  slug: string;
  /** i18n key under seo.* — resolved by the caller. */
  labelKey: "learnHubWorkbench" | "learnHubKline" | "learnHubPeer" | "learnHubChecklist" | "learnHubCryptoVol" | "learnHubMarkets" | "learnHubRisk" | "learnHubOptions";
};

/**
 * Static Learn hubs for symbol SSR crawl / visible chrome.
 * Keep short — crawl budget + terminal density.
 */
const EQUITY_HUBS: readonly SymbolLearnHubLink[] = [
  { slug: "stocks-workbench-loop", labelKey: "learnHubWorkbench" },
  { slug: "kline-basics", labelKey: "learnHubKline" },
  { slug: "peer-compare", labelKey: "learnHubPeer" },
  { slug: "checklist-three", labelKey: "learnHubChecklist" },
];

const CRYPTO_HUBS: readonly SymbolLearnHubLink[] = [
  { slug: "crypto-vs-equity-volatility", labelKey: "learnHubCryptoVol" },
  { slug: "multi-market-101", labelKey: "learnHubMarkets" },
  { slug: "risk-reward-expectancy", labelKey: "learnHubRisk" },
  { slug: "checklist-three", labelKey: "learnHubChecklist" },
];

const US_OPTIONS_EXTRA: SymbolLearnHubLink = {
  slug: "options-basics-roles-pricing",
  labelKey: "learnHubOptions",
};

/** Popular US names that commonly have listed options — teach options path. */
const US_OPTIONS_SYMBOLS = new Set([
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "SPY",
  "QQQ",
  "IWM",
]);

export function learnHubsForSymbol(
  assetType: AssetType,
  symbol: string,
): SymbolLearnHubLink[] {
  if (assetType === "crypto") return [...CRYPTO_HUBS];
  const hubs = [...EQUITY_HUBS];
  if (assetType === "stock" && US_OPTIONS_SYMBOLS.has(symbol.toUpperCase())) {
    hubs.push(US_OPTIONS_EXTRA);
  }
  return hubs;
}

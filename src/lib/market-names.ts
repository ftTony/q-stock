import type { AssetType } from "@/lib/types";
import { normalizeCnThscode } from "@/lib/types";

/** US equity English display names (seed). */
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

/** US equity Simplified Chinese display names (seed). */
export const STOCK_NAMES_ZH: Record<string, string> = {
  AAPL: "苹果",
  MSFT: "微软",
  GOOGL: "谷歌",
  GOOG: "谷歌",
  AMZN: "亚马逊",
  NVDA: "英伟达",
  META: "Meta",
  TSLA: "特斯拉",
  JPM: "摩根大通",
  "BRK.A": "伯克希尔A",
  "BRK.B": "伯克希尔B",
  "BRK/A": "伯克希尔A",
  "BRK/B": "伯克希尔B",
  MU: "美光科技",
  AMD: "超威半导体",
  INTC: "英特尔",
  NFLX: "奈飞",
  AVGO: "博通",
  SKHY: "SK海力士",
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

/** HK English seeds for non-zh locales (optional; live quote may fill gaps). */
export const HK_NAMES_EN: Record<string, string> = {
  "00700": "Tencent",
  "09988": "Alibaba-SW",
  "03690": "Meituan-W",
  "01810": "Xiaomi-W",
  "00941": "China Mobile",
  "01299": "AIA",
  "02318": "Ping An",
  "00388": "HKEX",
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

export const CRYPTO_NAMES_ZH: Record<string, string> = {
  BTC: "比特币",
  ETH: "以太坊",
  SOL: "Solana",
  BNB: "BNB",
  XRP: "瑞波币",
  ADA: "艾达币",
  DOGE: "狗狗币",
  AVAX: "雪崩",
};

/** True for zh-CN / zh-TW (and bare `zh`). */
export function preferChineseNames(locale?: string | null): boolean {
  if (!locale) return false;
  return locale === "zh" || locale.startsWith("zh-");
}

/** Seeded / static map only — stable product copy when we know the ticker. */
export function seededDisplayName(
  symbol: string,
  assetType: AssetType,
  locale?: string | null,
): string | null {
  const key = symbol.toUpperCase();
  const zh = preferChineseNames(locale);

  if (assetType === "crypto") {
    if (zh) return CRYPTO_NAMES_ZH[key] ?? CRYPTO_NAMES[key] ?? null;
    return CRYPTO_NAMES[key] ?? null;
  }
  if (assetType === "hk") {
    const padded = key.replace(/\D/g, "").padStart(5, "0");
    if (zh) {
      return HK_NAMES[padded] || HK_NAMES[key] || null;
    }
    return (
      HK_NAMES_EN[padded] ||
      HK_NAMES_EN[key] ||
      null
    );
  }
  if (assetType === "cn") {
    const ths = normalizeCnThscode(key);
    // CN seeds are Chinese; for Latin locales prefer live quote when available.
    if (zh) return CN_NAMES[ths] ?? null;
    return null;
  }
  if (zh) return STOCK_NAMES_ZH[key] ?? STOCK_NAMES[key] ?? null;
  return STOCK_NAMES[key] ?? null;
}

/**
 * Pick locale-appropriate name from quote fields (upstream Longbridge/Futu).
 * Falls back to legacy `name` when zh/en variants are missing.
 */
export function localizedNameFromQuote(
  quote:
    | { name?: string | null; nameZh?: string | null; nameEn?: string | null }
    | null
    | undefined,
  locale?: string | null,
): string | undefined {
  if (!quote) return undefined;
  const zh = quote.nameZh?.trim();
  const en = quote.nameEn?.trim();
  const legacy = quote.name?.trim();
  if (preferChineseNames(locale)) {
    return zh || legacy || en || undefined;
  }
  return en || legacy || zh || undefined;
}

/**
 * Prefer live/API name (locale-picked) so we do not hardcode every ticker.
 * Seeded maps are fallback when the feed has no name (e.g. push-only ticks).
 * Pass `locale` so zh seeds still work as fallback (e.g. NVDA → 英伟达).
 */
export function displayName(
  symbol: string,
  assetType: AssetType,
  liveName?: string | null,
  locale?: string | null,
): string {
  const live = liveName?.trim();
  if (live) return live;
  const seeded = seededDisplayName(symbol, assetType, locale);
  if (seeded) return seeded;
  const key = symbol.toUpperCase();
  if (assetType === "cn") return normalizeCnThscode(key);
  if (assetType === "hk") {
    const padded = key.replace(/\D/g, "").padStart(5, "0");
    return padded || key;
  }
  return key;
}

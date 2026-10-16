import {
  resolveFutuCreds,
  resolveLongbridgeCreds,
} from "@/lib/market/resolve-market-creds";

/**
 * Depth / trades gate (PRD: ADVANCED_QUOTES_ENABLED).
 * - `false` / `0` / `off` → locked (no broker calls)
 * - `true` / `1` / `yes` → open when Longbridge or Futu creds resolve
 * - unset → open when broker creds resolve (platform env or BYOK ALS)
 */
export function canUseAdvancedQuotes(): boolean {
  const raw = process.env.ADVANCED_QUOTES_ENABLED?.trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "off" || raw === "no") {
    return false;
  }
  const hasBroker = Boolean(resolveLongbridgeCreds() || resolveFutuCreds());
  if (raw === "1" || raw === "true" || raw === "yes" || raw === "on") {
    return hasBroker;
  }
  return hasBroker;
}

export const ADVANCED_QUOTES_REQUIRED = "ADVANCED_QUOTES_REQUIRED" as const;

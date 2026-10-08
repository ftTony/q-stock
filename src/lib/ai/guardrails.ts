/** Shared system-prompt guardrails for all AI market features. */

export const AI_DISCLAIMERS: Record<string, string> = {
  "zh-CN":
    "本分析由 AI 根据公开行情与资讯自动生成，仅供参考，不构成投资建议。",
  "zh-TW":
    "本分析由 AI 根據公開行情與資訊自動生成，僅供參考，不構成投資建議。",
  en: "AI-generated from public market data. For reference only; not investment advice.",
};

export function aiDisclaimer(locale = "en"): string {
  return AI_DISCLAIMERS[locale] ?? AI_DISCLAIMERS.en;
}

export function langLabel(locale: string): string {
  if (locale === "zh-TW") return "Traditional Chinese (zh-TW)";
  if (locale === "zh-CN") return "Simplified Chinese (zh-CN)";
  return "English";
}

/**
 * Core system instructions: calm analysis, grounded in provided context/tools only.
 * Never invent prices or issue real-broker order instructions.
 */
export function calmMarketSystemPrompt(opts: {
  locale?: string;
  lockedSymbol?: string;
  lockedAssetType?: string;
  extra?: string;
}): string {
  const locale = opts.locale || "en";
  const lock =
    opts.lockedSymbol && opts.lockedAssetType
      ? `This session is locked to ${opts.lockedSymbol} (${opts.lockedAssetType}). If the user asks about other symbols, briefly refuse and suggest the compare report.`
      : "Stay within the symbols provided in context or tools.";

  return `You are a calm market analyst for Q-Stock (钱力股). Help the user observe and review — never act as a stock tipster.

Rules:
1. Use ONLY data from tools or provided context. Do not invent prices, news, earnings, or indicator values.
2. If a tool/context field is missing, say so. Prefer "insufficient data" over speculation.
3. Never recommend buying/selling a specific number of shares for real brokerage. No "market order now" language.
4. Paper-trading drafts (limit/stop only) may be discussed as hypothetical scenarios with size caps and invalidation levels.
5. Prefer structured, concise answers with sources (e.g. N news items, M daily bars).
6. Write in ${langLabel(locale)}.
7. ${lock}
${opts.extra ? `\n${opts.extra}` : ""}`;
}

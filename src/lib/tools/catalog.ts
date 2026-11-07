import type { AppLocale } from "@/i18n/config";

export type ToolSlug =
  | "position"
  | "dca"
  | "compound"
  | "deposit"
  | "dividend-tax"
  | "pension"
  | "retirement"
  | "options"
  | "mortgage"
  | "risk-reward";

export type ToolMeta = {
  slug: ToolSlug;
  href: `/tools/${ToolSlug}`;
  /**
   * Key under `tools.*` / `tools.cards.*`.
   * Defaults to `slug`. Use camelCase when the slug contains `-`
   * (next-intl path lookups with hyphens are unreliable in some versions).
   */
  messageKey?: string;
  /**
   * Restrict the tool to a subset of UI locales. Omit to publish everywhere.
   *
   * Used for statutorily Chinese-mainland calculators (pension = 城镇职工基本
   * 养老保险, deposit = 整存整取挂牌利率与提前支取规则). Showing those to an
   * English / Japanese / German visitor is worse than not having them: the
   * concept does not exist in their market, so the page reads as machine-
   * translated bureaucracy and burns trust (and crawl budget) for nothing.
   */
  locales?: readonly AppLocale[];
};

/** Mainland-only statutory calculators. */
const CN_ONLY: readonly AppLocale[] = ["zh-CN"];

export const TOOL_CATALOG: ToolMeta[] = [
  { slug: "position", href: "/tools/position" },
  {
    slug: "risk-reward",
    href: "/tools/risk-reward",
    messageKey: "riskReward",
  },
  { slug: "dca", href: "/tools/dca" },
  { slug: "compound", href: "/tools/compound" },
  { slug: "retirement", href: "/tools/retirement" },
  { slug: "deposit", href: "/tools/deposit", locales: CN_ONLY },
  {
    slug: "dividend-tax",
    href: "/tools/dividend-tax",
    messageKey: "dividendTax",
  },
  { slug: "pension", href: "/tools/pension", locales: CN_ONLY },
  { slug: "options", href: "/tools/options" },
  { slug: "mortgage", href: "/tools/mortgage" },
];

export function getToolMeta(slug: string): ToolMeta | null {
  return TOOL_CATALOG.find((t) => t.slug === slug) ?? null;
}

/** Whether a tool is published for the given UI locale. */
export function isToolAvailable(
  meta: ToolMeta,
  locale: string | undefined,
): boolean {
  if (!meta.locales) return true;
  if (!locale) return false;
  return meta.locales.includes(locale as AppLocale);
}

/** Tools to list (index page, sitemap) for a locale. */
export function toolsForLocale(locale: string | undefined): ToolMeta[] {
  return TOOL_CATALOG.filter((t) => isToolAvailable(t, locale));
}

/** i18n key for a tool (card + detail namespace). */
export function toolMessageKey(slugOrMeta: ToolSlug | ToolMeta): string {
  const meta =
    typeof slugOrMeta === "string" ? getToolMeta(slugOrMeta) : slugOrMeta;
  return meta?.messageKey ?? meta?.slug ?? String(slugOrMeta);
}

export function formatToolNumber(
  value: number,
  digits = 2,
): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

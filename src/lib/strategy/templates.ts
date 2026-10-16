import type { StrategyRules } from "@/lib/strategy/rules";

export type StrategyTemplateMeta = {
  tagKey:
    | "tagTrend"
    | "tagRisk"
    | "tagDca"
    | "tagExit"
    | "tagDiscipline"
    | "tagSizing";
  markets: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  learnHref: string;
};

export type StrategyTemplateDef = {
  slug: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  rules: StrategyRules;
  meta: StrategyTemplateMeta;
};

/** PRD §5.1 — card order matches mockup first four, then extras. */
export const STRATEGY_TEMPLATES: StrategyTemplateDef[] = [
  {
    slug: "ma-cross",
    nameZh: "双均线交叉",
    nameEn: "MA crossover",
    descriptionZh:
      "短均线上穿长均线开多，下穿平仓。适合理解趋势滞后与震荡磨损。",
    descriptionEn:
      "Enter long on golden cross; exit on death cross. Learn lag and chop.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 20, direction: "up" }],
      exit: [{ type: "ma_cross", fast: 10, slow: 20, direction: "down" }],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagTrend",
      markets: ["stock", "index", "etf"],
      difficulty: 1,
      learnHref: "/learn/checklist-three",
    },
  },
  {
    slug: "break-stop",
    nameZh: "突破 + 止损",
    nameEn: "Breakout + stop",
    descriptionZh:
      "创 N 日新高买入，跌破入场价固定比例止损，建立风险预算直觉。",
    descriptionEn:
      "Buy N-day high breakout; stop at fixed % below entry for risk budget.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 20 }],
      exit: [{ type: "stop_pct", pct: 5 }],
      sizing: { mode: "riskPercent", riskPercent: 1, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagRisk",
      markets: ["stock", "futures", "crypto"],
      difficulty: 1,
      learnHref: "/learn/paper-review",
    },
  },
  {
    slug: "dca-fixed",
    nameZh: "定额定投",
    nameEn: "Fixed DCA",
    descriptionZh:
      "每隔固定交易日买入固定金额，平滑成本（学习向，非收益承诺）。",
    descriptionEn:
      "Buy fixed notional every N bars to smooth cost (educational, not a promise).",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "hold_bars", bars: 20 }],
      exit: [{ type: "hold_bars", bars: 999 }],
      sizing: { mode: "fixedNotional", notional: 1000 },
      constraints: { cooldownBars: 20 },
    },
    meta: {
      tagKey: "tagDca",
      markets: ["index", "etf", "fund"],
      difficulty: 1,
      learnHref: "/tools/dca",
    },
  },
  {
    slug: "invalidation",
    nameZh: "失效价出场",
    nameEn: "Invalidation exit",
    descriptionZh:
      "突破入场后，价格跌破预设失效价即出场，对齐冷静情景里的失效条件。",
    descriptionEn:
      "After breakout entry, exit when price breaches a preset invalidation level.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 10 }],
      exit: [{ type: "price_level", op: "lte", price: 100 }],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagExit",
      markets: ["stock", "futures", "etf"],
      difficulty: 1,
      learnHref: "/learn/checklist-three",
    },
  },
  {
    slug: "time-exit",
    nameZh: "持有 N 日必出",
    nameEn: "Time exit",
    descriptionZh: "均线上穿后开多，持有固定天数后了结，减少死扛。",
    descriptionEn: "Enter on MA cross up; exit after N bars to avoid holding forever.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 30, direction: "up" }],
      exit: [{ type: "hold_bars", bars: 20 }],
      sizing: { mode: "fixedNotional", notional: 5000 },
    },
    meta: {
      tagKey: "tagDiscipline",
      markets: ["stock", "etf"],
      difficulty: 1,
      learnHref: "/learn/checklist-three",
    },
  },
  {
    slug: "risk-sized",
    nameZh: "风险定仓",
    nameEn: "Risk-sized entry",
    descriptionZh:
      "按权益风险百分比与止损距估算名义仓位，对齐仓位风险工具。",
    descriptionEn:
      "Size by equity risk % and stop distance; aligns with the position tool.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 20, direction: "up" }],
      exit: [{ type: "stop_pct", pct: 3 }],
      sizing: { mode: "riskPercent", riskPercent: 1, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagSizing",
      markets: ["stock", "etf"],
      difficulty: 2,
      learnHref: "/tools/position",
    },
  },
];

export function templateMetaBySlug(
  slug: string | null | undefined,
): StrategyTemplateMeta | null {
  if (!slug) return null;
  return STRATEGY_TEMPLATES.find((t) => t.slug === slug)?.meta ?? null;
}

/** Stable display order for template cards (mockup order first). */
export const TEMPLATE_SLUG_ORDER = STRATEGY_TEMPLATES.map((t) => t.slug);

export function sortTemplatesBySlugOrder<T extends { slug: string | null }>(
  rows: T[],
): T[] {
  const rank = new Map(TEMPLATE_SLUG_ORDER.map((s, i) => [s, i]));
  return [...rows].sort((a, b) => {
    const ra = a.slug != null ? (rank.get(a.slug) ?? 999) : 999;
    const rb = b.slug != null ? (rank.get(b.slug) ?? 999) : 999;
    return ra - rb;
  });
}

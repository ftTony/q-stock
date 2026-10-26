import type { StrategyTemplateDef } from "@/lib/strategy/template-types";

/** Extra educational templates (composites of existing rule clauses). */
export const STRATEGY_TEMPLATES_EXTRA: StrategyTemplateDef[] = [
  {
    slug: "fast-ma-cross",
    nameZh: "快速双均线",
    nameEn: "Fast MA crossover",
    descriptionZh:
      "5/15 均线交叉：信号更密、震荡磨损更明显。对照标准/慢速双均线一起看。",
    descriptionEn:
      "5/15 MA cross—more signals, more chop. Compare with the standard and slow MA templates.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 5, slow: 15, direction: "up" }],
      exit: [{ type: "ma_cross", fast: 5, slow: 15, direction: "down" }],
      sizing: { mode: "fixedNotional", notional: 4000, maxPositionPct: 15 },
      constraints: { cooldownBars: 2 },
    },
    meta: {
      tagKey: "tagTrend",
      markets: ["stock", "crypto", "etf"],
      difficulty: 2,
      learnHref: "/learn/strategy-ma-cross",
    },
  },
  {
    slug: "tight-stop-break",
    nameZh: "紧止损突破",
    nameEn: "Tight-stop breakout",
    descriptionZh:
      "突破入场，仅 2% 止损。体会「止损太紧」时被洗出的频率，不是追求高胜率。",
    descriptionEn:
      "Breakout with a 2% stop—feel how often a tight stop gets shaken out (not a win-rate chase).",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 20 }],
      exit: [{ type: "stop_pct", pct: 2 }],
      sizing: { mode: "riskPercent", riskPercent: 1, maxPositionPct: 15 },
    },
    meta: {
      tagKey: "tagRisk",
      markets: ["stock", "futures", "crypto"],
      difficulty: 2,
      learnHref: "/learn/strategy-break-stop",
    },
  },
  {
    slug: "wide-target-break",
    nameZh: "宽目标突破",
    nameEn: "Wide-target breakout",
    descriptionZh:
      "突破后 5% 止损、15% 止盈。练「给趋势留空间」，接受多数交易先触止损。",
    descriptionEn:
      "Breakout with 5% stop / 15% target—leave room for trend; accept that many trades hit the stop first.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 30 }],
      exit: [
        { type: "take_profit_pct", pct: 15 },
        { type: "stop_pct", pct: 5 },
      ],
      sizing: { mode: "riskPercent", riskPercent: 1, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagRisk",
      markets: ["stock", "etf", "index"],
      difficulty: 2,
      learnHref: "/learn/strategy-break-stop",
    },
  },
  {
    slug: "ma-filter-time",
    nameZh: "均线过滤限时",
    nameEn: "MA filter + time exit",
    descriptionZh:
      "站上均线才开多，最多持有固定天数必出。趋势过滤 + 时间纪律的组合练习。",
    descriptionEn:
      "Enter only above an MA; force flat after N bars—trend filter plus a time cap.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "price_vs_ma", period: 50, op: "gt" }],
      exit: [{ type: "hold_bars", bars: 15 }],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
      constraints: { cooldownBars: 5 },
    },
    meta: {
      tagKey: "tagDiscipline",
      markets: ["stock", "etf"],
      difficulty: 2,
      learnHref: "/learn/strategy-time-exit",
    },
  },
  {
    slug: "break-ma-exit",
    nameZh: "突破均线出场",
    nameEn: "Breakout, MA exit",
    descriptionZh:
      "创 N 日新高买入，跌破均线离场。入场用突破、出场用结构，而不是固定百分比。",
    descriptionEn:
      "Buy an N-day high; exit when price slips below an MA—structure exit instead of a fixed %.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 20 }],
      exit: [{ type: "price_vs_ma", period: 20, op: "lt" }],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagExit",
      markets: ["stock", "etf", "index"],
      difficulty: 2,
      learnHref: "/learn/strategy-break-stop",
    },
  },
  {
    slug: "cross-ma-filter",
    nameZh: "金叉 + 长均线过滤",
    nameEn: "Cross + long MA filter",
    descriptionZh:
      "短均线金叉且收盘仍在长均线上方才开多，减少逆大趋势的金叉。",
    descriptionEn:
      "Require a golden cross while close is still above a longer MA—fewer crosses against the bigger trend.",
    rules: {
      version: 1,
      market: "stock",
      entry: [
        { type: "ma_cross", fast: 10, slow: 20, direction: "up" },
        { type: "price_vs_ma", period: 60, op: "gt" },
      ],
      exit: [
        { type: "ma_cross", fast: 10, slow: 20, direction: "down" },
        { type: "stop_pct", pct: 5 },
      ],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagTrend",
      markets: ["stock", "index", "etf"],
      difficulty: 3,
      learnHref: "/learn/strategy-ma-cross",
    },
  },
  {
    slug: "small-risk-budget",
    nameZh: "小风险预算",
    nameEn: "Small risk budget",
    descriptionZh:
      "金叉开多、3% 止损，单笔风险仅 0.5% 权益。练「先定能亏多少，再算仓位」。",
    descriptionEn:
      "Golden cross + 3% stop, risking only 0.5% of equity—size from what you can lose first.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 20, direction: "up" }],
      exit: [{ type: "stop_pct", pct: 3 }],
      sizing: { mode: "riskPercent", riskPercent: 0.5, maxPositionPct: 10 },
    },
    meta: {
      tagKey: "tagSizing",
      markets: ["stock", "etf"],
      difficulty: 2,
      learnHref: "/learn/strategy-risk-sized",
    },
  },
  {
    slug: "quarterly-dca",
    nameZh: "每季定投",
    nameEn: "Quarterly DCA",
    descriptionZh:
      "约每 60 个交易日定额买入一次，更稀疏的定投节奏（学习向）。",
    descriptionEn:
      "Buy a fixed notional about every 60 sessions—a sparser, quarterly-style DCA cadence.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "hold_bars", bars: 60 }],
      exit: [{ type: "hold_bars", bars: 999 }],
      sizing: { mode: "fixedNotional", notional: 3000 },
      constraints: { cooldownBars: 60 },
    },
    meta: {
      tagKey: "tagDca",
      markets: ["index", "etf", "fund"],
      difficulty: 1,
      learnHref: "/learn/strategy-dca-fixed",
    },
  },
  {
    slug: "break-time-box",
    nameZh: "突破限时盒子",
    nameEn: "Breakout time box",
    descriptionZh:
      "突破入场；止盈、止损或持有期满先触先出。短持突破也要写清离场边界。",
    descriptionEn:
      "Breakout entry; exit on TP, stop, or max hold—clear exits even for short breakout holds.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 15 }],
      exit: [
        { type: "take_profit_pct", pct: 6 },
        { type: "stop_pct", pct: 3 },
        { type: "hold_bars", bars: 10 },
      ],
      sizing: { mode: "fixedNotional", notional: 4000, maxPositionPct: 15 },
      constraints: { cooldownBars: 5 },
    },
    meta: {
      tagKey: "tagDiscipline",
      markets: ["stock", "crypto"],
      difficulty: 2,
      learnHref: "/learn/strategy-time-exit",
    },
  },
];

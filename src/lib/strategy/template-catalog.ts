import { STRATEGY_TEMPLATES_EXTRA } from "@/lib/strategy/template-catalog-extra";
import type { StrategyTemplateDef } from "@/lib/strategy/template-types";

/** PRD §5.1 — card order matches mockup first four, then extras. */
const STRATEGY_TEMPLATES_CORE: StrategyTemplateDef[] = [
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
      learnHref: "/learn/strategy-ma-cross",
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
      learnHref: "/learn/strategy-break-stop",
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
      learnHref: "/learn/strategy-dca-fixed",
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
      learnHref: "/learn/strategy-invalidation",
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
      learnHref: "/learn/strategy-time-exit",
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
      learnHref: "/learn/strategy-risk-sized",
    },
  },
  {
    slug: "ma-above",
    nameZh: "均线上方持股",
    nameEn: "Hold above MA",
    descriptionZh:
      "收盘价站上均线才持有，跌破均线离场。最简单的趋势过滤，体会「不站上就不做」。",
    descriptionEn:
      "Hold only while close is above an MA; exit when it slips below. A simple trend filter.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "price_vs_ma", period: 60, op: "gt" }],
      exit: [{ type: "price_vs_ma", period: 60, op: "lt" }],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
      constraints: { cooldownBars: 1 },
    },
    meta: {
      tagKey: "tagTrend",
      markets: ["stock", "index", "etf"],
      difficulty: 1,
      learnHref: "/learn/strategy-ma-cross",
    },
  },
  {
    slug: "break-tp-sl",
    nameZh: "突破止盈止损",
    nameEn: "Breakout TP/SL",
    descriptionZh:
      "创 N 日新高买入，先触止盈或止损即出场。一次把两边边界写清楚。",
    descriptionEn:
      "Buy N-day high; exit on take-profit or stop—whichever hits first.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 20 }],
      exit: [
        { type: "take_profit_pct", pct: 10 },
        { type: "stop_pct", pct: 5 },
      ],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagRisk",
      markets: ["stock", "etf", "crypto"],
      difficulty: 1,
      learnHref: "/learn/strategy-break-stop",
    },
  },
  {
    slug: "ma-with-stop",
    nameZh: "金叉 + 止损",
    nameEn: "Golden cross + stop",
    descriptionZh:
      "均线上穿开多，死叉或固定比例止损先触先出——趋势信号也要带风险框。",
    descriptionEn:
      "Enter on golden cross; exit on death cross or a fixed % stop—first hit wins.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 20, direction: "up" }],
      exit: [
        { type: "ma_cross", fast: 10, slow: 20, direction: "down" },
        { type: "stop_pct", pct: 6 },
      ],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagTrend",
      markets: ["stock", "index", "etf"],
      difficulty: 1,
      learnHref: "/learn/strategy-ma-cross",
    },
  },
  {
    slug: "ma-take-profit",
    nameZh: "金叉止盈",
    nameEn: "Golden cross + TP",
    descriptionZh:
      "均线上穿开多，达到固定止盈比例就兑现。练「见好就收」，而不是死等死叉。",
    descriptionEn:
      "Enter on golden cross; take a fixed % profit—practice banking gains without waiting for a death cross.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 20, direction: "up" }],
      exit: [{ type: "take_profit_pct", pct: 8 }],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagExit",
      markets: ["stock", "etf"],
      difficulty: 1,
      learnHref: "/learn/strategy-ma-cross",
    },
  },
  {
    slug: "weekly-dca",
    nameZh: "每周定投",
    nameEn: "Weekly DCA",
    descriptionZh:
      "大约每 5 个交易日定额买入一次，节奏更密的定投练习（学习向）。",
    descriptionEn:
      "Buy a fixed notional about every 5 sessions—a denser DCA cadence for practice.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "hold_bars", bars: 5 }],
      exit: [{ type: "hold_bars", bars: 999 }],
      sizing: { mode: "fixedNotional", notional: 500 },
      constraints: { cooldownBars: 5 },
    },
    meta: {
      tagKey: "tagDca",
      markets: ["index", "etf", "fund"],
      difficulty: 1,
      learnHref: "/learn/strategy-dca-fixed",
    },
  },
  {
    slug: "short-break",
    nameZh: "短线突破",
    nameEn: "Short breakout",
    descriptionZh:
      "突破近 10 日高点入场，最多持有 5 日必出。练短持与快速复盘节奏。",
    descriptionEn:
      "Enter on a 10-day high; force flat after 5 bars—practice short holds and quick review.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 10 }],
      exit: [{ type: "hold_bars", bars: 5 }],
      sizing: { mode: "fixedNotional", notional: 3000, maxPositionPct: 15 },
    },
    meta: {
      tagKey: "tagDiscipline",
      markets: ["stock", "crypto"],
      difficulty: 1,
      learnHref: "/learn/strategy-time-exit",
    },
  },
  {
    slug: "dual-barrier",
    nameZh: "止盈止损盒",
    nameEn: "TP/SL box",
    descriptionZh:
      "均线上穿开多，同时挂止盈与止损。最常用的「风险回报盒子」入门。",
    descriptionEn:
      "Enter on MA cross up; exit on take-profit or stop—the classic risk/reward box.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 30, direction: "up" }],
      exit: [
        { type: "take_profit_pct", pct: 6 },
        { type: "stop_pct", pct: 3 },
      ],
      sizing: { mode: "riskPercent", riskPercent: 1, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagRisk",
      markets: ["stock", "etf"],
      difficulty: 1,
      learnHref: "/learn/strategy-break-stop",
    },
  },
  {
    slug: "slow-ma-cross",
    nameZh: "慢速双均线",
    nameEn: "Slow MA crossover",
    descriptionZh:
      "20/60 均线交叉：交易更少、滞后更大。对照快均线模板，体会「信号变慢」的代价。",
    descriptionEn:
      "20/60 MA cross—fewer trades, more lag. Compare with the fast MA template.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 20, slow: 60, direction: "up" }],
      exit: [{ type: "ma_cross", fast: 20, slow: 60, direction: "down" }],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagTrend",
      markets: ["stock", "index", "etf"],
      difficulty: 2,
      learnHref: "/learn/strategy-ma-cross",
    },
  },
  {
    slug: "trend-filter-break",
    nameZh: "趋势内突破",
    nameEn: "Breakout in uptrend",
    descriptionZh:
      "先要求收盘站上均线，再等创 N 日新高才开多；下跌趋势里的假突破少做。",
    descriptionEn:
      "Require close above MA, then buy an N-day high—fewer breakouts against the trend.",
    rules: {
      version: 1,
      market: "stock",
      entry: [
        { type: "price_vs_ma", period: 60, op: "gt" },
        { type: "break_high", lookback: 20 },
      ],
      exit: [
        { type: "stop_pct", pct: 5 },
        { type: "price_vs_ma", period: 60, op: "lt" },
      ],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagTrend",
      markets: ["stock", "etf", "index"],
      difficulty: 2,
      learnHref: "/learn/strategy-break-stop",
    },
  },
  {
    slug: "asymmetric-rr",
    nameZh: "盈亏比 1:3",
    nameEn: "1:3 reward/risk",
    descriptionZh:
      "金叉开多，止损 3%、止盈 9%。练「愿赌服输」的固定盈亏比，而不是事后改目标。",
    descriptionEn:
      "Enter on golden cross; 3% stop / 9% target—practice a fixed 1:3 reward/risk box.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 20, direction: "up" }],
      exit: [
        { type: "take_profit_pct", pct: 9 },
        { type: "stop_pct", pct: 3 },
      ],
      sizing: { mode: "riskPercent", riskPercent: 1, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagRisk",
      markets: ["stock", "etf"],
      difficulty: 2,
      learnHref: "/learn/strategy-break-stop",
    },
  },
  {
    slug: "break-cooldown",
    nameZh: "突破冷却",
    nameEn: "Breakout + cooldown",
    descriptionZh:
      "突破买入后带止损，并设冷却期，避免刚止损又立刻追下一次假突破。",
    descriptionEn:
      "Breakout entry with a stop and cooldown—avoid re-chasing right after a stop-out.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "break_high", lookback: 20 }],
      exit: [{ type: "stop_pct", pct: 4 }],
      sizing: { mode: "fixedNotional", notional: 4000, maxPositionPct: 15 },
      constraints: { cooldownBars: 10 },
    },
    meta: {
      tagKey: "tagDiscipline",
      markets: ["stock", "crypto", "futures"],
      difficulty: 2,
      learnHref: "/learn/strategy-break-stop",
    },
  },
  {
    slug: "long-ma-hold",
    nameZh: "长均线持股",
    nameEn: "Hold above long MA",
    descriptionZh:
      "站上 120 日均线才持有，跌破离场。偏长线过滤，交易次数更少。",
    descriptionEn:
      "Hold only while close is above the 120-day MA—a slower, longer-horizon filter.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "price_vs_ma", period: 120, op: "gt" }],
      exit: [{ type: "price_vs_ma", period: 120, op: "lt" }],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 25 },
      constraints: { cooldownBars: 3 },
    },
    meta: {
      tagKey: "tagTrend",
      markets: ["index", "etf", "stock"],
      difficulty: 2,
      learnHref: "/learn/strategy-ma-cross",
    },
  },
  {
    slug: "ma-triple-exit",
    nameZh: "金叉三重退出",
    nameEn: "Cross + triple exit",
    descriptionZh:
      "金叉开多；止盈、止损或持有期满，谁先触达谁出场。把多种离场理由写进同一规则。",
    descriptionEn:
      "Enter on golden cross; exit on TP, stop, or max hold—whichever hits first.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "ma_cross", fast: 10, slow: 20, direction: "up" }],
      exit: [
        { type: "take_profit_pct", pct: 8 },
        { type: "stop_pct", pct: 4 },
        { type: "hold_bars", bars: 30 },
      ],
      sizing: { mode: "fixedNotional", notional: 5000, maxPositionPct: 20 },
    },
    meta: {
      tagKey: "tagExit",
      markets: ["stock", "etf"],
      difficulty: 2,
      learnHref: "/learn/strategy-time-exit",
    },
  },
  {
    slug: "monthly-dca",
    nameZh: "每月定投",
    nameEn: "Monthly DCA",
    descriptionZh:
      "约每 20 个交易日定额买入一次，更接近「按月定投」节奏（学习向）。",
    descriptionEn:
      "Buy a fixed notional about every 20 sessions—closer to a monthly DCA cadence.",
    rules: {
      version: 1,
      market: "stock",
      entry: [{ type: "hold_bars", bars: 20 }],
      exit: [{ type: "hold_bars", bars: 999 }],
      sizing: { mode: "fixedNotional", notional: 2000 },
      constraints: { cooldownBars: 20 },
    },
    meta: {
      tagKey: "tagDca",
      markets: ["index", "etf", "fund"],
      difficulty: 1,
      learnHref: "/learn/strategy-dca-fixed",
    },
  },
];

export const STRATEGY_TEMPLATES: StrategyTemplateDef[] = [
  ...STRATEGY_TEMPLATES_CORE,
  ...STRATEGY_TEMPLATES_EXTRA,
];

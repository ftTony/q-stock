import type { LearnLocaleMap } from "@/lib/learn/types";

export type LearnSeriesDef = {
  id: string;
  /** Sidebar / mobile block heading is i18n `learn.seriesCatalog`; this is the series name. */
  title: LearnLocaleMap<string>;
  /** One-line pitch on the /learn spotlight card. */
  blurb: LearnLocaleMap<string>;
  /** Reading order: first → deeper. */
  slugs: readonly string[];
  /** Short TOC labels; falls back to the article title. */
  tocTitle?: Record<string, LearnLocaleMap<string>>;
};

/**
 * Hand-authored series. Keep lists short — the left rail is for a course path,
 * not a dump of every related slug.
 *
 * Options path mirrors classic broker curricula (roles → moneyness → Greeks →
 * IV → expiry → chain → structures → scenarios → events) but is rewritten for
 * Q-Stock’s drawer / plan loop — not a mirror of any third-party lesson text.
 */
export const LEARN_SERIES: readonly LearnSeriesDef[] = [
  {
    id: "mindset",
    title: {
      en: "Mindset course: calm frame → biases → enough",
      "zh-CN": "心态课程：冷静框架 → 偏差 → 足够",
    },
    blurb: {
      en: "Twelve lessons: watching discipline, biases, crash first-aid, compounding behavior—plus freedom and life-stage essays already in the library.",
      "zh-CN":
        "12 课：冷静看盘、行为偏差、暴跌急救、复利行为，串上站内已有的自由与人生阶段短文——不跟机构持仓八卦。",
    },
    slugs: [
      "calm-watching",
      "checklist-three",
      "dao-greed-fear-desire",
      "mindset-behavior-biases",
      "book-thinking-fast-slow",
      "mindset-crash-first-aid",
      "mindset-compounding-hard",
      "financial-freedom-defined",
      "wealth-building-process",
      "life-stage-money-plan",
      "economics-for-retail",
      "book-psychology-of-money",
    ],
    tocTitle: {
      "calm-watching": {
        en: "Calm watching",
        "zh-CN": "冷静看盘",
      },
      "checklist-three": {
        en: "Three questions before click",
        "zh-CN": "下单前三问",
      },
      "dao-greed-fear-desire": {
        en: "Greed, fear, desire",
        "zh-CN": "贪婪、恐惧与欲望",
      },
      "mindset-behavior-biases": {
        en: "Five behavior biases",
        "zh-CN": "五种行为偏差",
      },
      "book-thinking-fast-slow": {
        en: "Fast & slow thinking",
        "zh-CN": "《思考，快与慢》",
      },
      "mindset-crash-first-aid": {
        en: "Crash first-aid hour",
        "zh-CN": "暴跌第一个小时",
      },
      "mindset-compounding-hard": {
        en: "Compounding is hard behavior",
        "zh-CN": "复利难在行为",
      },
      "financial-freedom-defined": {
        en: "What freedom means",
        "zh-CN": "财富自由怎么定义",
      },
      "wealth-building-process": {
        en: "Wealth as process",
        "zh-CN": "财富累积是过程",
      },
      "life-stage-money-plan": {
        en: "Life-stage money plan",
        "zh-CN": "人生阶段与钱",
      },
      "economics-for-retail": {
        en: "Economics for retail",
        "zh-CN": "散户用得上的经济常识",
      },
      "book-psychology-of-money": {
        en: "Psychology of Money",
        "zh-CN": "《金钱心理学》",
      },
    },
  },
  {
    id: "stocks",
    title: {
      en: "Stocks course: watch → analyze → plan → review",
      "zh-CN": "股票课程：看盘 → 分析 → 计划 → 复盘",
    },
    blurb: {
      en: "Twelve lessons stitched from classic craft and this workbench—markets, levels, exits, paper—not headline chasing.",
      "zh-CN":
        "12 课：经典看盘手艺 + 本站工作台闭环。多市场、价位、离场与模拟——不追标题党行情复盘。",
    },
    slugs: [
      "multi-market-101",
      "stocks-workbench-loop",
      "stock-picking-steps",
      "financials-three-statements",
      "peer-compare",
      "kline-basics",
      "stocks-support-resistance",
      "stocks-false-breakout",
      "indicator-trend-momentum",
      "risk-reward-expectancy",
      "stocks-exit-rules",
      "paper-review",
    ],
    tocTitle: {
      "multi-market-101": {
        en: "Markets in one shell",
        "zh-CN": "多市场差异先弄清",
      },
      "stocks-workbench-loop": {
        en: "Workbench loop",
        "zh-CN": "看盘闭环怎么走",
      },
      "stock-picking-steps": {
        en: "Picking order",
        "zh-CN": "选股顺序：基本面→位置",
      },
      "financials-three-statements": {
        en: "Three statements",
        "zh-CN": "三张报表怎么串",
      },
      "peer-compare": {
        en: "Peer compare",
        "zh-CN": "同业对比怎么用",
      },
      "kline-basics": {
        en: "Candles without superstition",
        "zh-CN": "K 线：别过度解读",
      },
      "stocks-support-resistance": {
        en: "Support & resistance zones",
        "zh-CN": "支撑与阻力带子",
      },
      "stocks-false-breakout": {
        en: "Breakout or trap",
        "zh-CN": "真突破还是假突破",
      },
      "indicator-trend-momentum": {
        en: "Trend & momentum toolkit",
        "zh-CN": "趋势与动量指标",
      },
      "risk-reward-expectancy": {
        en: "Risk, reward, expectancy",
        "zh-CN": "风险回报与期望值",
      },
      "stocks-exit-rules": {
        en: "When to sell",
        "zh-CN": "何时卖出：三扇门",
      },
      "paper-review": {
        en: "Paper trading & review",
        "zh-CN": "模拟交易与复盘",
      },
    },
  },
  {
    id: "options",
    title: {
      en: "Options course: rights → structures → events",
      "zh-CN": "期权课程：从权利到策略再到事件",
    },
    blurb: {
      en: "Eleven classic lessons: moneyness, Greeks, IV, drawer templates, scenarios, earnings week—rewritten for this product.",
      "zh-CN":
        "11 课经典路径：价内价外、希腊字母、IV、抽屉策略、情景与财报周——按本站工具重写。",
    },
    slugs: [
      "options-basics-roles-pricing",
      "options-moneyness-itm-otm",
      "options-greeks-in-practice",
      "options-iv-hv-rank",
      "options-expiry-iv-crush",
      "options-chain-and-drawer",
      "options-strategies-directional",
      "options-strategies-volatility",
      "options-strategies-calendar",
      "options-breakeven-scenarios",
      "options-earnings-season",
    ],
    tocTitle: {
      "options-basics-roles-pricing": {
        en: "What options buy you",
        "zh-CN": "期权是什么：作用与定价",
      },
      "options-moneyness-itm-otm": {
        en: "ITM / ATM / OTM",
        "zh-CN": "价内 · 平值 · 价外",
      },
      "options-greeks-in-practice": {
        en: "Greeks in practice",
        "zh-CN": "希腊字母怎么用",
      },
      "options-iv-hv-rank": {
        en: "IV, HV and rank",
        "zh-CN": "IV、HV 与高低分位",
      },
      "options-expiry-iv-crush": {
        en: "Expiry and IV crush",
        "zh-CN": "到期日与 IV Crush",
      },
      "options-chain-and-drawer": {
        en: "Chain and strategy drawer",
        "zh-CN": "期权链与策略抽屉",
      },
      "options-strategies-directional": {
        en: "Single · covered · vertical · collar",
        "zh-CN": "单腿 · 担保 · 垂直 · 领口",
      },
      "options-strategies-volatility": {
        en: "Straddle · strangle · butterfly",
        "zh-CN": "跨式 · 宽跨式 · 蝶式",
      },
      "options-strategies-calendar": {
        en: "Calendar and diagonal",
        "zh-CN": "日历与对角",
      },
      "options-breakeven-scenarios": {
        en: "Break-evens and ±σ scenarios",
        "zh-CN": "盈亏平衡与到期情景",
      },
      "options-earnings-season": {
        en: "Earnings week playbook",
        "zh-CN": "财报周怎么核对",
      },
    },
  },
];

const SLUG_TO_SERIES = new Map<string, LearnSeriesDef>();
for (const series of LEARN_SERIES) {
  for (const slug of series.slugs) {
    SLUG_TO_SERIES.set(slug, series);
  }
}

export function getLearnSeriesForSlug(slug: string): LearnSeriesDef | null {
  return SLUG_TO_SERIES.get(slug) ?? null;
}

export function learnSeriesText(
  locale: string,
  map: LearnLocaleMap<string>,
): string {
  if (locale in map && map[locale as keyof typeof map]) {
    return map[locale as keyof typeof map] as string;
  }
  if (locale.startsWith("zh") && map["zh-CN"]) return map["zh-CN"];
  return map.en;
}

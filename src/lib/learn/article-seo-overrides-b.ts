import type { LearnLink, LearnLocaleMap } from "@/lib/learn/types";

export type SeoPatch = {
  links?: LearnLocaleMap<LearnLink[]>;
  summary?: LearnLocaleMap<string>;
  title?: LearnLocaleMap<string>;
};

export const LEARN_SEO_OVERRIDES_B: Record<string, SeoPatch> = {
  "book-random-walk": {
    summary: {
      en: "A Random Walk Down Wall Street: humility about forecasts and costs. Pair with diversified long-horizon practice—not stock tips. Learning only.",
      "zh-CN":
        "《漫步华尔街》讲预测谦逊与成本纪律。配长期分散练习与定投假设，不当选股秘籍。仅供学习。",
    },
    links: {
      en: [
        { label: "Reading list", href: "/learn/reading-list" },
        { label: "Learning paths", href: "/learn/learning-path" },
        { label: "Lump sum vs DCA", href: "/learn/lump-sum-vs-dca" },
        { label: "DCA calculator", href: "/tools/dca" },
        { label: "Markets", href: "/markets" },
      ],
      "zh-CN": [
        { label: "冷静投书单", href: "/learn/reading-list" },
        { label: "三条学习路线", href: "/learn/learning-path" },
        { label: "一次性与定投", href: "/learn/lump-sum-vs-dca" },
        { label: "定投计算器", href: "/tools/dca" },
        { label: "行情首页", href: "/markets" },
      ],
    },
  },
  "book-poor-economics": {
    summary: {
      en: "Poor Economics: incentives and scarcity bandwidth. Migrate the temper to your checklist and buffer—not macro calls. Learning only.",
      "zh-CN":
        "《贫困的本质》谈激励与匮乏带宽。迁到你的清单与现金缓冲，不当宏观喊单。仅供学习。",
    },
    links: {
      en: [
        { label: "Economics for retail", href: "/learn/economics-for-retail" },
        { label: "Reading list", href: "/learn/reading-list" },
        { label: "Thinking, Fast and Slow", href: "/learn/book-thinking-fast-slow" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Position sizing", href: "/tools/position" },
      ],
      "zh-CN": [
        { label: "经济学怎么帮散户", href: "/learn/economics-for-retail" },
        { label: "冷静投书单", href: "/learn/reading-list" },
        { label: "《思考，快与慢》", href: "/learn/book-thinking-fast-slow" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "仓位计算器", href: "/tools/position" },
      ],
    },
  },
  "book-thinking-fast-slow": {
    summary: {
      en: "Thinking, Fast and Slow: System 1 hijacks crowded markets. Install slow checklists and smaller size when bandwidth is thin. Learning only.",
      "zh-CN":
        "《思考，快与慢》：系统 1 在拥挤行情最易接管。带宽紧时用慢清单与更小仓位。仅供学习。",
    },
    links: {
      en: [
        { label: "Behavior biases", href: "/learn/mindset-behavior-biases" },
        { label: "Economics for retail", href: "/learn/economics-for-retail" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Calm watching", href: "/learn/calm-watching" },
        { label: "Position sizing", href: "/tools/position" },
      ],
      "zh-CN": [
        { label: "五种行为偏差", href: "/learn/mindset-behavior-biases" },
        { label: "经济学怎么帮散户", href: "/learn/economics-for-retail" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "冷静看盘", href: "/learn/calm-watching" },
        { label: "仓位计算器", href: "/tools/position" },
      ],
    },
  },
  "book-intelligent-investor": {
    summary: {
      en: "Graham’s Intelligent Investor: margin of safety and the right to wait. Use it for process language—not a modern stock screen. Learning only.",
      "zh-CN":
        "《聪明的投资者》讲安全边际与等待的权利。借流程语言，不当当代选股器。仅供学习。",
    },
    links: {
      en: [
        { label: "Reading list", href: "/learn/reading-list" },
        { label: "Stock picking steps", href: "/learn/stock-picking-steps" },
        { label: "Risk before size", href: "/learn/risk-reward-expectancy" },
        { label: "Peer compare", href: "/learn/peer-compare" },
        { label: "Analysis page", href: "/analysis" },
      ],
      "zh-CN": [
        { label: "冷静投书单", href: "/learn/reading-list" },
        { label: "选股顺序", href: "/learn/stock-picking-steps" },
        { label: "风险回报与期望", href: "/learn/risk-reward-expectancy" },
        { label: "同业对比", href: "/learn/peer-compare" },
        { label: "分析页", href: "/analysis" },
      ],
    },
  },
  "cross-market-premium-guide": {
    links: {
      en: [
        { label: "Multi-chart", href: "/multi-chart" },
        { label: "HK access costs", href: "/learn/hk-access-channels-cost" },
        { label: "HK rules pitfalls", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "ADR vs common", href: "/learn/term-adr-vs-common" },
        { label: "00700 workbench", href: "/symbol/hk/00700" },
      ],
      "zh-CN": [
        { label: "多图对比", href: "/multi-chart" },
        { label: "港股通道成本", href: "/learn/hk-access-channels-cost" },
        { label: "港股规则坑", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "ADR 与普通股", href: "/learn/term-adr-vs-common" },
        { label: "打开 00700", href: "/symbol/hk/00700" },
      ],
    },
  },
  "hk-access-channels-cost": {
    links: {
      en: [
        { label: "HK rules pitfalls", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "Cross-market premium", href: "/learn/cross-market-premium-guide" },
        { label: "Multi-market 101", href: "/learn/multi-market-101" },
        { label: "Markets", href: "/markets" },
        { label: "00700 workbench", href: "/symbol/hk/00700" },
      ],
      "zh-CN": [
        { label: "港股规则坑", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "跨境溢价", href: "/learn/cross-market-premium-guide" },
        { label: "多市场入门", href: "/learn/multi-market-101" },
        { label: "行情首页", href: "/markets" },
        { label: "打开 00700", href: "/symbol/hk/00700" },
      ],
    },
  },
  "hk-trading-rules-pitfalls": {
    links: {
      en: [
        { label: "HK access costs", href: "/learn/hk-access-channels-cost" },
        { label: "Multi-market 101", href: "/learn/multi-market-101" },
        { label: "T+1 vs T+0", href: "/learn/term-t1-vs-t0" },
        { label: "Markets", href: "/markets" },
        { label: "00700 workbench", href: "/symbol/hk/00700" },
      ],
      "zh-CN": [
        { label: "港股通道成本", href: "/learn/hk-access-channels-cost" },
        { label: "多市场入门", href: "/learn/multi-market-101" },
        { label: "T+1 与 T+0", href: "/learn/term-t1-vs-t0" },
        { label: "行情首页", href: "/markets" },
        { label: "打开 00700", href: "/symbol/hk/00700" },
      ],
    },
  },
  "adjusted-price-and-dividends": {
    links: {
      en: [
        { label: "Lump sum vs DCA", href: "/learn/lump-sum-vs-dca" },
        { label: "Dividend tax holding", href: "/learn/dividend-tax-holding-period" },
        { label: "HK/US withholding", href: "/learn/hk-us-dividend-withholding" },
        { label: "DCA tool", href: "/tools/dca" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "一次性与定投", href: "/learn/lump-sum-vs-dca" },
        { label: "股息税持有期", href: "/learn/dividend-tax-holding-period" },
        { label: "港美预扣税", href: "/learn/hk-us-dividend-withholding" },
        { label: "定投计算器", href: "/tools/dca" },
        { label: "打开 AAPL", href: "/symbol/stock/AAPL" },
      ],
    },
  },
  "position-cost-methods": {
    links: {
      en: [
        { label: "Position tool", href: "/tools/position" },
        { label: "Risk before size", href: "/learn/risk-before-size" },
        { label: "Paper review", href: "/learn/paper-review" },
        { label: "Position term", href: "/learn/term-position-sizing" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "仓位计算器", href: "/tools/position" },
        { label: "风险预算", href: "/learn/risk-before-size" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
        { label: "仓位词条", href: "/learn/term-position-sizing" },
        { label: "打开 AAPL", href: "/symbol/stock/AAPL" },
      ],
    },
  },
  "lump-sum-vs-dca": {
    links: {
      en: [
        { label: "DCA calculator", href: "/tools/dca" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Adjusted prices", href: "/learn/adjusted-price-and-dividends" },
        { label: "DCA term", href: "/learn/term-dca" },
        { label: "DCA tool guide", href: "/learn/dca-tool-guide" },
      ],
      "zh-CN": [
        { label: "定投计算器", href: "/tools/dca" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "复权与分红", href: "/learn/adjusted-price-and-dividends" },
        { label: "定投词条", href: "/learn/term-dca" },
        { label: "定投工具导读", href: "/learn/dca-tool-guide" },
      ],
    },
  },
  "cash-flow-red-flags": {
    links: {
      en: [
        { label: "Cash flow statement", href: "/learn/financials-cash-flow" },
        { label: "Three statements", href: "/learn/financials-three-statements" },
        { label: "Balance sheet", href: "/learn/financials-balance-sheet" },
        { label: "Peer compare", href: "/learn/peer-compare" },
        { label: "600519.SH", href: "/symbol/cn/600519.SH" },
      ],
      "zh-CN": [
        { label: "现金流量表", href: "/learn/financials-cash-flow" },
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "资产负债表", href: "/learn/financials-balance-sheet" },
        { label: "同业对比", href: "/learn/peer-compare" },
        { label: "打开 600519.SH", href: "/symbol/cn/600519.SH" },
      ],
    },
  },
  "crypto-vs-equity-volatility": {
    links: {
      en: [
        { label: "Multi-market 101", href: "/learn/multi-market-101" },
        { label: "Risk & expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "Position tool", href: "/tools/position" },
        { label: "BTC workbench", href: "/symbol/crypto/BTC" },
        { label: "Markets", href: "/markets" },
      ],
      "zh-CN": [
        { label: "多市场入门", href: "/learn/multi-market-101" },
        { label: "风险回报与期望", href: "/learn/risk-reward-expectancy" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "打开 BTC", href: "/symbol/crypto/BTC" },
        { label: "行情首页", href: "/markets" },
      ],
    },
  },
  "options-breakeven-scenarios": {
    links: {
      en: [
        { label: "Chain and drawer", href: "/learn/options-chain-and-drawer" },
        { label: "IV, HV and rank", href: "/learn/options-iv-hv-rank" },
        { label: "Options calculator", href: "/tools/options" },
        { label: "Options tool guide", href: "/learn/options-tool-guide" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "期权链与抽屉", href: "/learn/options-chain-and-drawer" },
        { label: "IV、HV 与百分位", href: "/learn/options-iv-hv-rank" },
        { label: "期权计算器", href: "/tools/options" },
        { label: "期权工具导读", href: "/learn/options-tool-guide" },
        { label: "打开 AAPL", href: "/symbol/stock/AAPL" },
      ],
    },
  },
  "options-earnings-season": {
    links: {
      en: [
        { label: "Earnings season (stocks)", href: "/learn/earnings-season" },
        { label: "IV crush", href: "/learn/options-expiry-iv-crush" },
        { label: "Break-evens", href: "/learn/options-breakeven-scenarios" },
        { label: "Options tool", href: "/tools/options" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "财报季（股票）", href: "/learn/earnings-season" },
        { label: "到期与 IV Crush", href: "/learn/options-expiry-iv-crush" },
        { label: "盈亏平衡情景", href: "/learn/options-breakeven-scenarios" },
        { label: "期权估算", href: "/tools/options" },
        { label: "打开 AAPL", href: "/symbol/stock/AAPL" },
      ],
    },
  },
};

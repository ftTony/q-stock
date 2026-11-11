import type { LearnLink, LearnLocaleMap } from "@/lib/learn/types";

export type SeoPatch = {
  links?: LearnLocaleMap<LearnLink[]>;
  summary?: LearnLocaleMap<string>;
  title?: LearnLocaleMap<string>;
};

export const LEARN_SEO_OVERRIDES_A: Record<string, SeoPatch> = {
  "financial-freedom-defined": {
    summary: {
      en: "Define financial freedom as cash-flow coverage, a buffer, and the option to say no—not a sliding net-worth number. Practice enough-lines and conservative compound math. Learning only—not a date promise.",
      "zh-CN":
        "把财富自由写成可检验的三层：现金流覆盖、缓冲与说「不」的权利，而不是滑动的净资产口号。用足够线与保守复利假设练习。仅供学习，不承诺达标日期。",
    },
    links: {
      en: [
        { label: "Wealth-building process", href: "/learn/wealth-building-process" },
        { label: "100k→1M stages", href: "/learn/wealth-stages-100k-10m" },
        { label: "Psychology of Money guide", href: "/learn/book-psychology-of-money" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Three questions", href: "/learn/checklist-three" },
      ],
      "zh-CN": [
        { label: "财富积累过程", href: "/learn/wealth-building-process" },
        { label: "10 万与 1000 万", href: "/learn/wealth-stages-100k-10m" },
        { label: "《金钱心理学》导读", href: "/learn/book-psychology-of-money" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "下单前三问", href: "/learn/checklist-three" },
      ],
    },
  },
  "wealth-building-process": {
    summary: {
      en: "Wealth usually starts with earning power, surplus, buffer, and debt discipline—investing is one later step. Map cash flow before return fantasies. Learning only—not a portfolio pitch.",
      "zh-CN":
        "财富积累多半先问赚钱能力、结余、缓冲与债务，投资只是后段一步。先画清现金流，再谈收益假设。仅供学习，不是配置建议。",
    },
    links: {
      en: [
        { label: "What freedom means", href: "/learn/financial-freedom-defined" },
        { label: "Life-stage money plan", href: "/learn/life-stage-money-plan" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "DCA calculator", href: "/tools/dca" },
        { label: "Position sizing", href: "/tools/position" },
      ],
      "zh-CN": [
        { label: "财富自由怎么定义", href: "/learn/financial-freedom-defined" },
        { label: "人生阶段金钱规划", href: "/learn/life-stage-money-plan" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "定投计算器", href: "/tools/dca" },
        { label: "仓位计算器", href: "/tools/position" },
      ],
    },
  },
  "life-stage-money-plan": {
    summary: {
      en: "Match horizon and risk budget to life stages—buckets for living cash, near goals, and long growth. Revisit when duties change. Learning only—not a one-ratio forever plan.",
      "zh-CN":
        "按人生阶段匹配期限与风险预算：生活现金、近几大事、长期增值分桶，责任变化就改表。仅供学习，不是一张用到老的固定比例。",
    },
    links: {
      en: [
        { label: "Wealth-building process", href: "/learn/wealth-building-process" },
        { label: "What freedom means", href: "/learn/financial-freedom-defined" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Retirement tool", href: "/tools/retirement" },
        { label: "Three questions", href: "/learn/checklist-three" },
      ],
      "zh-CN": [
        { label: "财富积累过程", href: "/learn/wealth-building-process" },
        { label: "财富自由怎么定义", href: "/learn/financial-freedom-defined" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "退休估算", href: "/tools/retirement" },
        { label: "下单前三问", href: "/learn/checklist-three" },
      ],
    },
  },
  "dao-greed-fear-desire": {
    summary: {
      en: "Name desire, greed, and fear as decision forces—then install enough/stop rules and a checklist. Classics map the mind; they do not pick entries. Learning only.",
      "zh-CN":
        "把贪婪、恐惧与欲望当成决策推力来命名，再装上知足／知止与三问清单。经典给地图，不给买卖点。仅供学习。",
    },
    links: {
      en: [
        { label: "Calm watching", href: "/learn/calm-watching" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Behavior biases", href: "/learn/mindset-behavior-biases" },
        { label: "Position sizing", href: "/tools/position" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "冷静看盘", href: "/learn/calm-watching" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "五种行为偏差", href: "/learn/mindset-behavior-biases" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    },
  },
  "economics-for-retail": {
    summary: {
      en: "Retail economics is incentives, opportunity cost, and cognitive bandwidth—not memorizing GDP. Redesign the checklist before preaching rationality. Learning only.",
      "zh-CN":
        "散户更用得上的经济学是激励、机会成本与认知带宽，不是背 GDP。先改清单与缓冲，再谈「要理性」。仅供学习。",
    },
    links: {
      en: [
        { label: "Thinking, Fast and Slow", href: "/learn/book-thinking-fast-slow" },
        { label: "Poor Economics guide", href: "/learn/book-poor-economics" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Money traps", href: "/learn/money-traps-small-capital" },
        { label: "Position sizing", href: "/tools/position" },
      ],
      "zh-CN": [
        { label: "《思考，快与慢》", href: "/learn/book-thinking-fast-slow" },
        { label: "《贫困的本质》导读", href: "/learn/book-poor-economics" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "本金少先避坑", href: "/learn/money-traps-small-capital" },
        { label: "仓位计算器", href: "/tools/position" },
      ],
    },
  },
  "retail-company-focus": {
    summary: {
      en: "When bandwidth is limited, watch a short company list: one-line business, trajectory, cash quality, peers, relative valuation, and size plus invalidation. Learning only.",
      "zh-CN":
        "时间有限时，企业关注清单要短：业务一句话、近况方向、现金含金量、同业尺子、相对估值，再加上仓位与失效。仅供学习。",
    },
    links: {
      en: [
        { label: "Fundamentals checklist", href: "/learn/fundamentals-checklist" },
        { label: "Three statements", href: "/learn/financials-three-statements" },
        { label: "Peer compare", href: "/learn/peer-compare" },
        { label: "Analysis page", href: "/analysis" },
        { label: "600519.SH workbench", href: "/symbol/cn/600519.SH" },
      ],
      "zh-CN": [
        { label: "基本面清单", href: "/learn/fundamentals-checklist" },
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "同业对比怎么用", href: "/learn/peer-compare" },
        { label: "分析页", href: "/analysis" },
        { label: "打开 600519.SH", href: "/symbol/cn/600519.SH" },
      ],
    },
  },
  "fundamentals-checklist": {
    summary: {
      en: "A full PE sheet is not a read. Five handwritten lines—business, trajectory evidence, peers, unknowns, loss budget—before the chart votes. Learning only.",
      "zh-CN":
        "填满 PE 表不算看过。手写五句：业务、近况证据、同业、不懂、亏得起——再让 K 线投票。仅供学习。",
    },
    links: {
      en: [
        { label: "Retail focus list", href: "/learn/retail-company-focus" },
        { label: "Three statements", href: "/learn/financials-three-statements" },
        { label: "Peer compare", href: "/learn/peer-compare" },
        { label: "Analysis page", href: "/analysis" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "散户关注企业清单", href: "/learn/retail-company-focus" },
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "同业对比怎么用", href: "/learn/peer-compare" },
        { label: "分析页", href: "/analysis" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    },
  },
  "financials-income-statement": {
    summary: {
      en: "Our income view highlights surprise %—mood, not a ticket. Check whether the beat sits in ops, and whether receivables swell with it. Learning only.",
      "zh-CN":
        "站内利润表突出超预期 %——情绪线索，不是下单键。先问超预期是否落在主业、应收有没有一起胀。仅供学习。",
    },
    links: {
      en: [
        { label: "Three statements", href: "/learn/financials-three-statements" },
        { label: "Balance sheet", href: "/learn/financials-balance-sheet" },
        { label: "Cash flow", href: "/learn/financials-cash-flow" },
        { label: "Peer compare", href: "/learn/peer-compare" },
        { label: "600519.SH workbench", href: "/symbol/cn/600519.SH" },
      ],
      "zh-CN": [
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "资产负债表", href: "/learn/financials-balance-sheet" },
        { label: "现金流量表", href: "/learn/financials-cash-flow" },
        { label: "同业对比", href: "/learn/peer-compare" },
        { label: "打开 600519.SH", href: "/symbol/cn/600519.SH" },
      ],
    },
  },
  "financials-balance-sheet": {
    summary: {
      en: "When ROE looks great, check short debt and receivables. Our balance tab can be empty—coverage, not your failure. Learning only.",
      "zh-CN":
        "ROE 好看时先查短债与应收。站内资产负债页可能空表——是覆盖缺口，不是你没读会。仅供学习。",
    },
    links: {
      en: [
        { label: "Three statements", href: "/learn/financials-three-statements" },
        { label: "Income statement", href: "/learn/financials-income-statement" },
        { label: "Cash flow", href: "/learn/financials-cash-flow" },
        { label: "Cash-flow red flags", href: "/learn/cash-flow-red-flags" },
        { label: "00700 workbench", href: "/symbol/hk/00700" },
      ],
      "zh-CN": [
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "利润表", href: "/learn/financials-income-statement" },
        { label: "现金流量表", href: "/learn/financials-cash-flow" },
        { label: "现金流红旗", href: "/learn/cash-flow-red-flags" },
        { label: "打开 00700 工作台", href: "/symbol/hk/00700" },
      ],
    },
  },
  "financials-cash-flow": {
    summary: {
      en: "No one-click FCF here—and the cash tab is often empty. Ask whether NI and OCF move together before polishing formulas. Learning only.",
      "zh-CN":
        "站内没有一键 FCF，现金流页也常空。先问净利与经营现金是否同向，再打磨公式。仅供学习。",
    },
    links: {
      en: [
        { label: "Three statements", href: "/learn/financials-three-statements" },
        { label: "Income statement", href: "/learn/financials-income-statement" },
        { label: "Balance sheet", href: "/learn/financials-balance-sheet" },
        { label: "Cash-flow red flags", href: "/learn/cash-flow-red-flags" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "利润表", href: "/learn/financials-income-statement" },
        { label: "资产负债表", href: "/learn/financials-balance-sheet" },
        { label: "现金流红旗", href: "/learn/cash-flow-red-flags" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    },
  },
  "indicators-lite": {
    summary: {
      en: "MA, MACD, and RSI describe rhythm and stretch—they are helpers, not holy grails. Read them beside structure and invalidation. Learning only.",
      "zh-CN":
        "均线、MACD 与 RSI 描述节奏与拥挤度，是辅助不是圣杯。要和结构、失效条件一起读，别当买卖按钮。仅供学习。",
    },
    title: {
      en: "MA / MACD / RSI: helpers, not holy grails",
      "zh-CN": "均线 / MACD / RSI：辅助而非圣杯",
    },
    links: {
      en: [
        { label: "Candle basics", href: "/learn/kline-basics" },
        { label: "Trend & momentum", href: "/learn/indicator-trend-momentum" },
        { label: "Volatility toolkit", href: "/learn/indicator-volatility-toolkit" },
        { label: "Markets", href: "/markets" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "K 线怎么读", href: "/learn/kline-basics" },
        { label: "趋势与动量指标", href: "/learn/indicator-trend-momentum" },
        { label: "波动率工具箱", href: "/learn/indicator-volatility-toolkit" },
        { label: "行情首页", href: "/markets" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    },
  },
  "strategy-lab-intro": {
    summary: {
      en: "The strategy lab replays written rules on real daily bars—returns, drawdown, and when the rule fails. It is a falsification tool, not a signal feed. Learning only.",
      "zh-CN":
        "规则实验室用真实日 K 回放你写好的进出条件，看收益、回撤与失效区间。它是证伪工具，不是信号源。仅供学习。",
    },
    links: {
      en: [
        { label: "Six templates", href: "/learn/strategy-lab-six-templates" },
        { label: "Risk, reward, expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "Paper review", href: "/learn/paper-review" },
        { label: "Strategy lab", href: "/lab" },
        { label: "Position sizing", href: "/tools/position" },
      ],
      "zh-CN": [
        { label: "六套模板", href: "/learn/strategy-lab-six-templates" },
        { label: "风险回报与期望", href: "/learn/risk-reward-expectancy" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
        { label: "规则实验室", href: "/lab" },
        { label: "仓位计算器", href: "/tools/position" },
      ],
    },
  },
  "reading-list": {
    summary: {
      en: "A calm reading list for money habits, markets humility, and process—what to read first and what to skip. Pair books with on-site drills. Learning only.",
      "zh-CN":
        "冷静投书单：先读金钱观与市场谦逊，再读纪律与估值；写明别读什么。书要配站内练习，不是收藏清单。仅供学习。",
    },
    links: {
      en: [
        { label: "Learning paths", href: "/learn/learning-path" },
        { label: "Psychology of Money", href: "/learn/book-psychology-of-money" },
        { label: "Random Walk guide", href: "/learn/book-random-walk" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Three questions", href: "/learn/checklist-three" },
      ],
      "zh-CN": [
        { label: "三条学习路线", href: "/learn/learning-path" },
        { label: "《金钱心理学》", href: "/learn/book-psychology-of-money" },
        { label: "《漫步华尔街》", href: "/learn/book-random-walk" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "下单前三问", href: "/learn/checklist-three" },
      ],
    },
  },
  "learning-path": {
    summary: {
      en: "Three paths—habits, long-term discipline, and advanced risk language—each with books, short essays, and one on-site action. Pick a lane; don’t binge. Learning only.",
      "zh-CN":
        "三条路线：启蒙习惯、长期纪律、进阶风险语言；每条配书、短文与一个站内动作。选一条走，别刷完收藏。仅供学习。",
    },
    links: {
      en: [
        { label: "Reading list", href: "/learn/reading-list" },
        { label: "Calm watching", href: "/learn/calm-watching" },
        { label: "Workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Paper review", href: "/learn/paper-review" },
      ],
      "zh-CN": [
        { label: "冷静投书单", href: "/learn/reading-list" },
        { label: "冷静看盘", href: "/learn/calm-watching" },
        { label: "看盘闭环", href: "/learn/stocks-workbench-loop" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
      ],
    },
  },
  "book-psychology-of-money": {
    summary: {
      en: "Housel’s Psychology of Money: luck, enough, and behavior beat clever forecasts. Use it to write your enough-line—then drill on compound math. Learning only.",
      "zh-CN":
        "《金钱心理学》强调运气、足够与行为，重于聪明预测。用来写下你的足够线，再用复利工具做保守假设。仅供学习。",
    },
    links: {
      en: [
        { label: "Reading list", href: "/learn/reading-list" },
        { label: "What freedom means", href: "/learn/financial-freedom-defined" },
        { label: "Compounding is hard", href: "/learn/mindset-compounding-hard" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Money traps", href: "/learn/money-traps-small-capital" },
      ],
      "zh-CN": [
        { label: "冷静投书单", href: "/learn/reading-list" },
        { label: "财富自由怎么定义", href: "/learn/financial-freedom-defined" },
        { label: "复利难在行为", href: "/learn/mindset-compounding-hard" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "本金少先避坑", href: "/learn/money-traps-small-capital" },
      ],
    },
  },
};

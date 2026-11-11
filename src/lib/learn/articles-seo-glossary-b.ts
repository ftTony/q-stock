import type { LearnArticle } from "@/lib/learn/types";
import {
  buildTermArticle,
  termBlocks,
  termFaq,
  termLinks,
} from "@/lib/learn/articles-seo-term-helpers";

/** Glossary batch B: options, chart terms, market mechanics. */
export const LEARN_ARTICLES_SEO_GLOSSARY_B: LearnArticle[] = [
  buildTermArticle({
    slug: "term-iv",
    ctaHref: "/tools/options",
    titleEn: "Implied volatility (IV): the market’s fear quote",
    titleZh: "隐含波动率 IV：市场给的「慌张报价」",
    summaryEn:
      "IV is the volatility priced into options—not a direction forecast. High IV means expensive options relative to that model, not “must sell.” Learning only.",
    summaryZh:
      "IV 是期权价格隐含的波动假设，不是涨跌方向。IV 高表示期权相对更贵，不等于「必须卖」。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "IV vs HV" },
        {
          type: "p",
          text: "Historical volatility looks backward; IV is forward-looking in the option price. Rank/percentile helps you see rich vs quiet regimes—see the IV essay.",
        },
      ],
      [
        { type: "h2", text: "IV 与 HV" },
        {
          type: "p",
          text: "历史波动看过去；IV 写在期权价格里朝前看。分位/排名用来感受贵与静——详见 IV 专文。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Does high IV mean the stock will crash?",
          a: "No. It means options are pricing large moves; direction is separate.",
        },
      ],
      [
        {
          q: "IV 高就一定会暴跌吗？",
          a: "不。它只说明期权在定价大幅波动，方向是另一回事。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "IV / HV / rank", href: "/learn/options-iv-hv-rank" },
        { label: "Options basics", href: "/learn/options-basics-roles-pricing" },
        { label: "Options tool", href: "/tools/options" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      [
        { label: "IV、HV 与分位", href: "/learn/options-iv-hv-rank" },
        { label: "期权入门", href: "/learn/options-basics-roles-pricing" },
        { label: "期权估算工具", href: "/tools/options" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-delta-theta",
    ctaHref: "/tools/options",
    titleEn: "Delta and Theta: direction sensitivity and time decay",
    titleZh: "Delta 与 Theta：方向敏感与时间损耗",
    summaryEn:
      "Delta approximates how an option moves with the underlying; Theta is the daily time bleed. Greeks are local approximations—see the Greeks essay. Learning only.",
    summaryZh:
      "Delta 近似期权对标的价格的敏感度；Theta 是时间流逝带来的损耗。希腊字母是局部近似——见希腊字母专文。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Use, don’t memorize" },
        {
          type: "p",
          text: "Long options usually pay Theta; short options often collect it while taking other risks. Always pair with max loss and expiry.",
        },
      ],
      [
        { type: "h2", text: "会用，别死背" },
        {
          type: "p",
          text: "买方常付 Theta；卖方常收 Theta 但承担别的风险。永远和最大亏损、到期日一起看。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Is Delta 0.5 a 50% win rate?",
          a: "No. It is a sensitivity estimate, not a probability promise.",
        },
      ],
      [
        {
          q: "Delta 0.5 等于胜率 50% 吗？",
          a: "不。它是敏感度近似，不是胜率承诺。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Greeks in practice", href: "/learn/options-greeks-in-practice" },
        { label: "Moneyness", href: "/learn/options-moneyness-itm-otm" },
        { label: "Options tool", href: "/tools/options" },
        { label: "IV term", href: "/learn/term-iv" },
      ],
      [
        { label: "希腊字母怎么用", href: "/learn/options-greeks-in-practice" },
        { label: "价内价外", href: "/learn/options-moneyness-itm-otm" },
        { label: "期权估算工具", href: "/tools/options" },
        { label: "IV 词条", href: "/learn/term-iv" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-support-resistance",
    ctaHref: "/markets",
    titleEn: "Support and resistance: zones, not magic lines",
    titleZh: "支撑与阻力：是带子，不是神线",
    summaryEn:
      "Support/resistance are areas where supply and demand previously reacted—not guarantees. Prefer zones, then write invalidation. Learning only.",
    summaryZh:
      "支撑与阻力是供需曾经反应过的区域，不是保证。优先画带子，再写失效条件。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "How to mark" },
        {
          type: "ul",
          items: [
            "Prior swing highs/lows and consolidation shelves",
            "Round numbers as crowd magnets—use carefully",
            "Invalidation just beyond the zone, not hope inside it",
          ],
        },
      ],
      [
        { type: "h2", text: "怎么标" },
        {
          type: "ul",
          items: [
            "前高前低与盘整平台",
            "整数关口是大众焦点——谨慎使用",
            "失效写在带子之外，而不是带子里许愿",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Does a touch mean reverse?",
          a: "No. Treat it as a place to observe; false breaks are common.",
        },
      ],
      [
        {
          q: "碰到支撑就会反弹吗？",
          a: "不。当作观察区；假突破很常见。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Support & resistance essay", href: "/learn/stocks-support-resistance" },
        { label: "False breakout", href: "/learn/stocks-false-breakout" },
        { label: "Candle basics", href: "/learn/kline-basics" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      [
        { label: "支撑与阻力专文", href: "/learn/stocks-support-resistance" },
        { label: "假突破", href: "/learn/stocks-false-breakout" },
        { label: "K 线怎么读", href: "/learn/kline-basics" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-paper-trading",
    ctaHref: "/portfolio",
    titleEn: "Paper trading: practice the loop without real cash",
    titleZh: "模拟交易：用假钱练真流程",
    summaryEn:
      "Paper trading drills rules, size, and review—not a badge of genius. Treat fills as process tests. Learning only.",
    summaryZh:
      "模拟盘练的是规则、仓位与复盘，不是证明自己很神。把成交当流程测验。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "What to score" },
        {
          type: "ul",
          items: [
            "Did I write invalidation first?",
            "Did size match the risk budget?",
            "Did I follow the plan after a ping?",
          ],
        },
      ],
      [
        { type: "h2", text: "复盘记什么" },
        {
          type: "ul",
          items: [
            "有没有先写失效？",
            "仓位是否匹配风险预算？",
            "提醒响了有没有按计划停手？",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Do paper profits mean I’m ready live?",
          a: "Not by themselves. Look for process adherence across losing weeks too.",
        },
      ],
      [
        {
          q: "模拟赚钱就能实盘了吗？",
          a: "不够。还要看亏损周是否仍守流程。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Paper review essay", href: "/learn/paper-review" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Portfolio / paper", href: "/portfolio" },
        { label: "Position tool", href: "/tools/position" },
      ],
      [
        { label: "模拟与复盘", href: "/learn/paper-review" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "模拟组合", href: "/portfolio" },
        { label: "仓位计算器", href: "/tools/position" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-t1-vs-t0",
    ctaHref: "/markets",
    titleEn: "T+1 vs T+0: settlement and same-day habits",
    titleZh: "T+1 与 T+0：交收节奏与当日习惯",
    summaryEn:
      "T+1 means you generally cannot sell shares bought today until the next session (A-shares style). T+0 allows same-day round trips where rules permit. Match tactics to the market. Learning only.",
    summaryZh:
      "T+1（如 A 股股票）通常当日买入次日才能卖；T+0 允许当日回转（视市场与品种规则）。策略要匹配交收，不要跨市场照搬。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Why it matters" },
        {
          type: "p",
          text: "Intraday revenge trades that work on T+0 products can strand you overnight on T+1. Read multi-market 101 before copying tactics.",
        },
      ],
      [
        { type: "h2", text: "为什么重要" },
        {
          type: "p",
          text: "在 T+0 品种上成立的日内报复单，搬到 T+1 可能被迫隔夜。先读多市场入门，再抄手法。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Do US stocks settle T+1 too?",
          a: "Settlement cycles change by market and era—verify with your broker.",
        },
      ],
      [
        {
          q: "美股也是 T+1 吗？",
          a: "交收周期因市场与时期而异，以券商说明为准。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Multi-market 101", href: "/learn/multi-market-101" },
        { label: "HK rules pitfalls", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "Markets", href: "/markets" },
        { label: "600519.SH", href: "/symbol/cn/600519.SH" },
      ],
      [
        { label: "多市场入门", href: "/learn/multi-market-101" },
        { label: "港股规则坑", href: "/learn/hk-trading-rules-pitfalls" },
        { label: "行情首页", href: "/markets" },
        { label: "打开 600519.SH", href: "/symbol/cn/600519.SH" },
      ],
    ),
  }),
  buildTermArticle({
    slug: "term-adr-vs-common",
    ctaHref: "/markets",
    titleEn: "ADR vs common shares: same company, different wrapper",
    titleZh: "ADR 与普通股：同一公司，不同包装",
    summaryEn:
      "ADRs wrap foreign shares for US trading—FX, fees, and premium/discount can diverge from the home listing. See the cross-market premium guide. Learning only.",
    summaryZh:
      "ADR 把海外股份包装成美股交易品种；汇率、费用与溢价折价可能和本地股不一致。见跨境溢价指南。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Checklist" },
        {
          type: "ul",
          items: [
            "Which line is more liquid for your size?",
            "Are you comparing the same economic exposure after FX?",
            "Corporate actions and taxes differ by wrapper",
          ],
        },
      ],
      [
        { type: "h2", text: "核对清单" },
        {
          type: "ul",
          items: [
            "哪条线对你的仓位更有流动性？",
            "折算汇率后，经济敞口是否同一？",
            "公司行动与税务因包装而异",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Is the cheaper listing always better?",
          a: "Not if liquidity, taxes, or conversion frictions dominate.",
        },
      ],
      [
        {
          q: "更便宜的那条上市一定更好吗？",
          a: "若流动性、税或兑换摩擦更大，未必。要看综合成本。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Cross-market premium", href: "/learn/cross-market-premium-guide" },
        { label: "Multi-market 101", href: "/learn/multi-market-101" },
        { label: "HK access costs", href: "/learn/hk-access-channels-cost" },
        { label: "Markets", href: "/markets" },
      ],
      [
        { label: "跨境溢价指南", href: "/learn/cross-market-premium-guide" },
        { label: "多市场入门", href: "/learn/multi-market-101" },
        { label: "港股通道成本", href: "/learn/hk-access-channels-cost" },
        { label: "行情首页", href: "/markets" },
      ],
    ),
  }),
];

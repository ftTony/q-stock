import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Classic break-even + product scenarios/risk bar (Futu 盈亏平衡 / 损益分析 lane). */
export const LEARN_ARTICLES_SEO_OPTIONS_BREAKEVEN: LearnArticle[] = [
  {
    slug: "options-breakeven-scenarios",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Break-evens and ±σ scenarios: two numbers that keep options honest",
      "zh-CN": "盈亏平衡与 ±σ 情景：让期权诚实的两个数字",
    },
    summary: {
      en: "Break-even asks what expiry price pays you back. Scenarios ask what the IV-priced distribution implies along the way. Read both before the chart seduces you.",
      "zh-CN":
        "平衡点问：到期到哪个价你才回本。情景问：IV 定价的分布沿途意味着什么。别让盈亏图先把你看晕。",
    },
    paragraphs: {
      en: [
        "Pretty payoff curves hide lazy break-evens. If the stock must gap beyond the implied move just to get to zero, you did not buy a view — you bought a rarer view.",
        "Q-Stock prints that tension in plain language on purpose.",
      ],
      "zh-CN": [
        "好看的盈亏曲线会藏懒惰的平衡点。若股票必须跳出隐含波动才刚回本，你买的不是一个观点，而是更稀的观点。",
        "钱力股故意把这层张力写成白话。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "For a long call, expiry break-even ≈ strike + premium per share. Long put ≈ strike − premium. Verticals and multi-leg structures shift those points by the net debit/credit and the short strike.",
        },
        { type: "h2", text: "What the risk summary is for" },
        {
          type: "ul",
          items: [
            "A capped max-loss line in money terms — the number you should be able to say aloud.",
            "Break-even and net premium as secondary facts, not decoration.",
            "A link into the trade plan so the cap survives the next tab you open.",
          ],
        },
        { type: "h2", text: "How ±σ rows are built" },
        {
          type: "p",
          text: "Using chain IV (or a 30% illustration if IV is missing), the drawer sketches log-normal expiry levels at −2σ…+2σ around spot and evaluates strategy P&L at those prices under the expiry assumption. Colors follow your up/down preference; identical losses across the table usually mean the structure is still OTM everywhere in that band.",
        },
        {
          type: "table",
          head: ["Read", "Healthy sign", "Smell test fail"],
          rows: [
            [
              "Break-even vs implied move",
              "Inside or near what IV already prices",
              "Needs a hero print just to flat",
            ],
            [
              "Scenario P&L fan",
              "Widens as you leave spot for long vol",
              "Flat premium loss at every σ",
            ],
            [
              "Max loss sentence",
              "You can fund it without rewriting life plans",
              "Unbounded short premium with no hedge",
            ],
          ],
        },
        {
          type: "note",
          text: "Dual-expiry calendars/diagonals only approximate under a single exercise snapshot. After the near leg dies, re-check the residual long as its own trade.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "买看涨的到期平衡 ≈ 行权价 + 每股权利金。买看跌 ≈ 行权价 − 权利金。垂直和多腿会按净支出/净收入和短腿行权价把点挪走。",
        },
        { type: "h2", text: "风险摘要是干什么的" },
        {
          type: "ul",
          items: [
            "用金额写清有上限的最大亏损——这是你要能大声说出来的数。",
            "平衡点与净权利金是次要事实，不是装饰。",
            "链到交易计划，避免换一个标签页就把上限忘了。",
          ],
        },
        { type: "h2", text: "±σ 行怎么来的" },
        {
          type: "p",
          text: "用链上 IV（缺失时用 30% 示意），按对数正态在现价附近估 −2σ…+2σ 的到期标的价，再按到期行权假设算策略盈亏。颜色跟你的涨跌色设置；若整表亏损几乎一样，通常是这一带上结构仍全是虚值。",
        },
        {
          type: "table",
          head: ["读法", "健康信号", "气味不对"],
          rows: [
            [
              "平衡点 vs 隐含波动",
              "落在 IV 已经定价的附近",
              "要英雄行情才刚打平",
            ],
            [
              "情景盈亏张开",
              "买波动时随离开现价而分开",
              "每个 σ 都是同一笔权利金亏损",
            ],
            [
              "最大亏损那句",
              "亏得起，不必改人生计划",
              "无对冲的裸卖、亏损不封顶",
            ],
          ],
        },
        {
          type: "note",
          text: "双到期的日历/对角在「同一张行权快照」下只是近似。近月腿消失后，把剩余长仓当成新的一笔再核对。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is break-even the same as the probability cone edge?",
          a: "No. Break-even is accounting at expiry. The cone is an IV path band. Different questions.",
        },
      ],
      "zh-CN": [
        {
          q: "盈亏平衡等于概率锥边界吗？",
          a: "不等于。平衡点是到期会计；锥是 IV 路径带。问题不一样。",
        },
      ],
    },
    links: {
      en: [
        { label: "Chain and drawer", href: "/learn/options-chain-and-drawer" },
        { label: "IV, HV and rank", href: "/learn/options-iv-hv-rank" },
        { label: "Options calculator", href: "/tools/options" },
      ],
      "zh-CN": [
        { label: "期权链与抽屉", href: "/learn/options-chain-and-drawer" },
        { label: "IV、HV 与百分位", href: "/learn/options-iv-hv-rank" },
        { label: "期权计算器", href: "/tools/options" },
      ],
    },
    sourceNote: {
      en: "Educational. Scenarios assume expiry exercise; live marks still move with IV.",
      "zh-CN": "仅供学习。情景按到期行权假设；市值仍随 IV 波动。",
    },
  },
];

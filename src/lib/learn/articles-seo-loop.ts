import type { LearnArticle } from "@/lib/learn/types";
import {
  buildTermArticle,
  termBlocks,
  termFaq,
  termLinks,
} from "@/lib/learn/articles-seo-term-helpers";

function loop(
  opts: Parameters<typeof buildTermArticle>[0] & {
    category: LearnArticle["category"];
  },
): LearnArticle {
  const { category, ...rest } = opts;
  return { ...buildTermArticle(rest), category };
}

/** Product-loop fillers: risk, orders, earnings, FOMO, review, scenarios. */
export const LEARN_ARTICLES_SEO_LOOP: LearnArticle[] = [
  loop({
    category: "basics",
    slug: "risk-before-size",
    ctaHref: "/tools/position",
    titleEn: "Risk budget first: size only after you can lose it",
    titleZh: "风险预算：先定亏得起，再谈仓位",
    summaryEn:
      "Decide the cash you can lose on one idea before picking a share count. Same language as the position tool—without a budget, “conviction” is theater. Learning only.",
    summaryZh:
      "先定单笔亏得起的现金，再算手数。与仓位工具同一套语言——没有预算的「把握」只是表演。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Write the budget" },
        {
          type: "p",
          text: "Pick a percent of equity (often 0.5–2%). Convert to currency. That number caps the distance-to-stop × size product.",
        },
        { type: "h2", text: "Then size" },
        {
          type: "p",
          text: "Open /tools/position. If the stop is far, size shrinks—do not move the stop to keep a dream size.",
        },
      ],
      [
        { type: "h2", text: "先写预算" },
        {
          type: "p",
          text: "选权益比例（常见 0.5–2%），换成金额。它上限住「止损距离 × 仓位」。",
        },
        { type: "h2", text: "再算仓" },
        {
          type: "p",
          text: "打开仓位工具。止损远就减仓——别为了梦想手数去挪止损。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Can I risk more on “sure things”?",
          a: "That is how sure things become account events. Keep the budget boring.",
        },
      ],
      [
        {
          q: "把握大就能多赌吗？",
          a: "这是把「把握」做成账户事件的捷径。预算保持无聊。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Position tool guide", href: "/learn/position-tool-guide" },
        { label: "Position tool", href: "/tools/position" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Risk/reward essay", href: "/learn/risk-reward-expectancy" },
      ],
      [
        { label: "仓位工具导读", href: "/learn/position-tool-guide" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "风险回报专文", href: "/learn/risk-reward-expectancy" },
      ],
    ),
  }),
  loop({
    category: "basics",
    slug: "orders-and-slippage",
    ctaHref: "/portfolio",
    titleEn: "Limit, market, and slippage (learning view)",
    titleZh: "限价、市价与滑点（学习向）",
    summaryEn:
      "Market orders chase fills; limits wait for price—and may never fill. Slippage is the gap between intended and done. Practice on paper before live. Learning only.",
    summaryZh:
      "市价追成交，限价等价格——也可能不成交。滑点是意图价与成交价的差。先在模拟盘体会。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Feel it on paper" },
        {
          type: "p",
          text: "Place a limit away from the touch and a market through a quiet tape. Review fill vs plan—not P&L theater.",
        },
        {
          type: "note",
          text: "Live broker rules, fees, and auctions differ—this essay is vocabulary, not a trading desk manual.",
        },
      ],
      [
        { type: "h2", text: "在模拟里体会" },
        {
          type: "p",
          text: "挂一笔远离盘口的限价，再下一笔市价穿过清淡盘口。复盘成交相对计划，而不是秀盈亏。",
        },
        {
          type: "note",
          text: "真实券商规则、费用与竞价各异——本文只建词汇，不是交易台手册。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Are paper fills realistic?",
          a: "Often optimistic. Treat them as process drills, not proof of live edge.",
        },
      ],
      [
        {
          q: "模拟成交贴近实盘吗？",
          a: "往往偏乐观。当流程练习，不当实盘证明。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Paper trading term", href: "/learn/term-paper-trading" },
        { label: "Paper review", href: "/learn/paper-review" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Position tool", href: "/tools/position" },
      ],
      [
        { label: "模拟交易词条", href: "/learn/term-paper-trading" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
        { label: "模拟组合", href: "/portfolio" },
        { label: "仓位计算器", href: "/tools/position" },
      ],
    ),
  }),
  loop({
    category: "basics",
    slug: "earnings-season",
    ctaHref: "/markets",
    titleEn: "Earnings season: clues, not triggers",
    titleZh: "财报季：线索，不是扳机",
    summaryEn:
      "Use the calendar and summary as context—watch for one-offs and guidance changes. Price can finish the story before the print. Learning only; not a tip sheet.",
    summaryZh:
      "用日历与摘要当上下文：盯一次性项目与指引变化。价格常在数字前走完故事。仅供学习，不是喊单。",
    sections: termBlocks(
      [
        { type: "h2", text: "Before the print" },
        {
          type: "ul",
          items: [
            "Mark session (pre/post)",
            "Write invalidation if you hold risk",
            "Size for a gap you can survive",
          ],
        },
        { type: "h2", text: "After" },
        {
          type: "p",
          text: "Ask: revenue and profit same direction? One-offs? Guidance? Then peers—not social applause.",
        },
      ],
      [
        { type: "h2", text: "公布前" },
        {
          type: "ul",
          items: [
            "标好盘前/盘后",
            "有仓就写失效",
            "按扛得住的跳空算仓",
          ],
        },
        { type: "h2", text: "公布后" },
        {
          type: "p",
          text: "问：营收与利润同向吗？一次性？指引？再看同业——别看社交鼓掌。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Beat means buy?",
          a: "No. Crowded expectations can already be in the price.",
        },
      ],
      [
        {
          q: "超预期就该买吗？",
          a: "不。拥挤预期可能已在价格里。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Income statement", href: "/learn/financials-income-statement" },
        { label: "Options earnings week", href: "/learn/options-earnings-season" },
        { label: "AAPL earnings tab", href: "/symbol/stock/AAPL" },
        { label: "Peer compare", href: "/learn/peer-compare" },
      ],
      [
        { label: "利润表", href: "/learn/financials-income-statement" },
        { label: "期权财报周", href: "/learn/options-earnings-season" },
        { label: "打开 AAPL 财报", href: "/symbol/stock/AAPL" },
        { label: "同业对比", href: "/learn/peer-compare" },
      ],
    ),
  }),
  loop({
    category: "mindset",
    slug: "fomo-and-news",
    ctaHref: "/markets",
    titleEn: "Hot news and FOMO: context, not a trigger",
    titleZh: "热点与 FOMO：新闻怎么用",
    summaryEn:
      "Headlines are context for structure you already wrote—not a green light. If the ping only creates urgency, close the tab. Learning only.",
    summaryZh:
      "新闻是已有结构的上下文，不是绿灯。若提醒只制造紧迫感，先关标签页。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "A usable filter" },
        {
          type: "ul",
          items: [
            "Does it change the business one-liner?",
            "Does it void my invalidation?",
            "Or is it only social proof?",
          ],
        },
      ],
      [
        { type: "h2", text: "可用过滤" },
        {
          type: "ul",
          items: [
            "有没有改业务一句话？",
            "有没有作废我的失效条件？",
            "还是只是社交证明？",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Should I trade every headline?",
          a: "No. Most are noise relative to your written plan.",
        },
      ],
      [
        {
          q: "每条标题都要交易吗？",
          a: "不。相对已写计划，多数是噪声。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Calm watching", href: "/learn/calm-watching" },
        { label: "Greed fear desire", href: "/learn/dao-greed-fear-desire" },
        { label: "Watchlist alerts", href: "/learn/watchlist-alerts" },
        { label: "AAPL news tab", href: "/symbol/stock/AAPL" },
      ],
      [
        { label: "冷静看盘", href: "/learn/calm-watching" },
        { label: "贪婪恐惧欲望", href: "/learn/dao-greed-fear-desire" },
        { label: "自选与提醒", href: "/learn/watchlist-alerts" },
        { label: "打开 AAPL 新闻", href: "/symbol/stock/AAPL" },
      ],
    ),
  }),
  loop({
    category: "mindset",
    slug: "review-emotions",
    ctaHref: "/portfolio",
    titleEn: "Emotions in the review log: process, not labels",
    titleZh: "复盘里的情绪：改流程，不贴诊断标签",
    summaryEn:
      "Log impulse, revenge size, and off-plan clicks as process debts—not moral insults. Fix the checklist entry that failed. Learning only.",
    summaryZh:
      "把冲动、报复加仓、计划外点击记成流程债，而不是人格羞辱。去改失守的那条清单。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Three useful tags" },
        {
          type: "ul",
          items: [
            "Impulse — no written invalidation",
            "Revenge — size after a loss without a new plan",
            "Off-plan — alert fired, rule ignored",
          ],
        },
      ],
      [
        { type: "h2", text: "三个有用标记" },
        {
          type: "ul",
          items: [
            "冲动 — 没写失效",
            "报复 — 亏损后无新计划就加仓",
            "计划外 — 提醒响了却没守规则",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Should I stop trading after a revenge tag?",
          a: "Often yes for the session—protect bandwidth, then rewrite the rule.",
        },
      ],
      [
        {
          q: "出现报复标记就要停吗？",
          a: "当日常常该停——保住带宽，再改规则。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Paper review", href: "/learn/paper-review" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Behavior biases", href: "/learn/mindset-behavior-biases" },
        { label: "Portfolio", href: "/portfolio" },
      ],
      [
        { label: "模拟与复盘", href: "/learn/paper-review" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "行为偏差", href: "/learn/mindset-behavior-biases" },
        { label: "模拟组合", href: "/portfolio" },
      ],
    ),
  }),
  loop({
    category: "tools",
    slug: "scenario-map",
    ctaHref: "/markets",
    titleEn: "Scenario map: up, down, and chop each get a plan",
    titleZh: "情景地图：涨、跌、震荡各准备什么",
    summaryEn:
      "Write three short branches—trend up, break down, range—with size and invalidation for each. Then paper one branch. Learning only.",
    summaryZh:
      "写成三支短情景：趋势上、破位下、震荡——各配仓位与失效。再选一支做模拟。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Template" },
        {
          type: "ul",
          items: [
            "Up: add only if structure holds; invalidation below X",
            "Down: flat or hedge rules; no revenge size",
            "Chop: reduce activity; alerts on range edges only",
          ],
        },
      ],
      [
        { type: "h2", text: "模板" },
        {
          type: "ul",
          items: [
            "涨：结构仍在才考虑加；失效在 X 下",
            "跌：空仓或对冲规则；禁止报复仓",
            "震荡：少动；只在区间沿设提醒",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Do I need all three every day?",
          a: "Before risk, yes. In a dull range day you may only execute the chop branch.",
        },
      ],
      [
        {
          q: "每天都要写三支吗？",
          a: "有风险前要。清淡震荡日可以只执行震荡支。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Calm watching", href: "/learn/calm-watching" },
        { label: "AI chart read", href: "/learn/ai-chart-read" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      [
        { label: "看盘闭环", href: "/learn/stocks-workbench-loop" },
        { label: "冷静看盘", href: "/learn/calm-watching" },
        { label: "AI 读图", href: "/learn/ai-chart-read" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    ),
  }),
];

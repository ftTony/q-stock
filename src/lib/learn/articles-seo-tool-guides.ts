import type { LearnArticle } from "@/lib/learn/types";
import {
  buildTermArticle,
  termBlocks,
  termFaq,
  termLinks,
} from "@/lib/learn/articles-seo-term-helpers";

function guide(opts: Parameters<typeof buildTermArticle>[0]): LearnArticle {
  return { ...buildTermArticle(opts), category: "tools" };
}

/** How-to guides for live /tools calculators. */
export const LEARN_ARTICLES_SEO_TOOL_GUIDES: LearnArticle[] = [
  guide({
    slug: "position-tool-guide",
    ctaHref: "/tools/position",
    titleEn: "Position sizing calculator: risk budget → share count",
    titleZh: "仓位计算器怎么用：风险预算反推手数",
    summaryEn:
      "Enter account equity, risk percent, entry, and invalidation—the tool returns a size. Results are not buy signals. Pair with the three-question checklist. Learning only.",
    summaryZh:
      "输入权益、风险比例、入场与失效价，工具给出数量。结果不是买卖信号。配合三问清单使用。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Misconception" },
        {
          type: "p",
          text: "A large “suggested size” is not permission. If you cannot write why the stop is there, leave size at zero.",
        },
        { type: "h2", text: "Inputs that matter" },
        {
          type: "ul",
          items: [
            "Equity you can actually risk (not borrowed bravado)",
            "Risk % per idea",
            "Entry and invalidation distance",
          ],
        },
        { type: "h2", text: "After the number" },
        {
          type: "p",
          text: "Paper the trade, bind an alert to the invalidation, and review whether you respected it.",
        },
      ],
      [
        { type: "h2", text: "误区" },
        {
          type: "p",
          text: "算出「很大一手」不等于允许下单。写不出止损理由，仓位就该是零。",
        },
        { type: "h2", text: "关键输入" },
        {
          type: "ul",
          items: ["真实可承受的权益", "单笔风险比例", "入场与失效距离"],
        },
        { type: "h2", text: "算出之后" },
        {
          type: "p",
          text: "先模拟，提醒绑失效，复盘有没有守住。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Widen stop to get more shares?",
          a: "Only if the thesis still holds—and shrink risk % or accept smaller size.",
        },
      ],
      [
        {
          q: "放宽止损就能多买吗？",
          a: "只有解读仍成立时才谈；同时要降风险比例或接受更小仓。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Position term", href: "/learn/term-position-sizing" },
        { label: "Stop-loss term", href: "/learn/term-stop-loss" },
        { label: "Position tool", href: "/tools/position" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      [
        { label: "仓位词条", href: "/learn/term-position-sizing" },
        { label: "止损词条", href: "/learn/term-stop-loss" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    ),
  }),
  guide({
    slug: "dca-tool-guide",
    ctaHref: "/tools/dca",
    titleEn: "DCA calculator: assumptions you can survive",
    titleZh: "定投计算器：用得起的假设",
    summaryEn:
      "Model contribution, years, and a return scenario—not a promise. Stress lower returns before believing a finish line. Learning only.",
    summaryZh:
      "用投入、年限与报酬情景建模——不是承诺。先压更低报酬，再谈终点。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "What to enter" },
        {
          type: "p",
          text: "Monthly contribution you can keep in a dull year, horizon, and a conservative annual return. Then cut the return and re-run.",
        },
        { type: "h2", text: "What the output is not" },
        {
          type: "p",
          text: "Not a reason to skip an emergency fund or chase the hottest theme with every installment.",
        },
      ],
      [
        { type: "h2", text: "输入什么" },
        {
          type: "p",
          text: "无聊年份也能坚持的月投、期限，以及保守年化。然后把年化砍一刀再算一遍。",
        },
        { type: "h2", text: "输出不是什么" },
        {
          type: "p",
          text: "不是跳过应急金、也不是每期都追最热主题的理由。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Which return should I type?",
          a: "Start conservative; treat bull-market averages as stress tests the other way.",
        },
      ],
      [
        {
          q: "报酬率填多少？",
          a: "先填保守值；牛市均值当反向压测，不当默认。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "DCA term", href: "/learn/term-dca" },
        { label: "Lump sum vs DCA", href: "/learn/lump-sum-vs-dca" },
        { label: "DCA tool", href: "/tools/dca" },
        { label: "Compound tool", href: "/tools/compound" },
      ],
      [
        { label: "定投词条", href: "/learn/term-dca" },
        { label: "一次性与定投", href: "/learn/lump-sum-vs-dca" },
        { label: "定投计算器", href: "/tools/dca" },
        { label: "复利计算器", href: "/tools/compound" },
      ],
    ),
  }),
  guide({
    slug: "compound-tool-guide",
    ctaHref: "/tools/compound",
    titleEn: "Compound calculator: time beats slogans",
    titleZh: "复利计算器：时间比口号重要",
    summaryEn:
      "Compare principal, contributions, rate, and years. The chart is arithmetic under assumptions—behavior still decides if you keep contributing. Learning only.",
    summaryZh:
      "对比本金、定投、利率与年限。图是假设下的算术——能不能持续投入仍看行为。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Workflow" },
        {
          type: "ul",
          items: [
            "Write an enough-line first",
            "Run base / pessimistic / optimistic rates",
            "Ask what breaks if contributions pause for a year",
          ],
        },
      ],
      [
        { type: "h2", text: "用法" },
        {
          type: "ul",
          items: [
            "先写足够线",
            "跑基础／悲观／乐观三档利率",
            "问停投一年会怎样",
          ],
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Can I use it to pick stocks?",
          a: "No. It sizes habits and horizons, not tickers.",
        },
      ],
      [
        {
          q: "能用来选股吗？",
          a: "不能。它服务习惯与期限，不服务代码。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Compound term", href: "/learn/term-compound" },
        { label: "Compounding is hard", href: "/learn/mindset-compounding-hard" },
        { label: "Compound tool", href: "/tools/compound" },
        { label: "What freedom means", href: "/learn/financial-freedom-defined" },
      ],
      [
        { label: "复利词条", href: "/learn/term-compound" },
        { label: "复利难在行为", href: "/learn/mindset-compounding-hard" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "财富自由怎么定义", href: "/learn/financial-freedom-defined" },
      ],
    ),
  }),
  guide({
    slug: "options-tool-guide",
    ctaHref: "/tools/options",
    titleEn: "Options estimator: payoff before poetry",
    titleZh: "期权估算：先看盈亏结构",
    summaryEn:
      "Sketch break-evens and max loss before naming a strategy. The tool is teaching geometry—not a ticket. Learning only.",
    summaryZh:
      "先看打和与最大亏损，再谈策略名字。工具教的是盈亏几何，不是下单。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Order of operations" },
        {
          type: "ul",
          items: [
            "Define the scenario (direction, range, event)",
            "Map max loss you can sleep with",
            "Only then compare structures in the estimator",
          ],
        },
        {
          type: "p",
          text: "Read IV and Greeks essays so you know what the sliders imply.",
        },
      ],
      [
        { type: "h2", text: "顺序" },
        {
          type: "ul",
          items: [
            "先定情景（方向、区间、事件）",
            "写清亏得起的上限",
            "再用估算器比较结构",
          ],
        },
        {
          type: "p",
          text: "配合 IV 与希腊字母文，弄清滑杆在说什么。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Does a pretty payoff mean take the trade?",
          a: "No. Liquidity, assignment, and IV crush still exist outside the sketch.",
        },
      ],
      [
        {
          q: "盈亏图画得好看就能做吗？",
          a: "不。流动性、行权与 IV Crush 仍在图外。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Options basics", href: "/learn/options-basics-roles-pricing" },
        { label: "Break-evens", href: "/learn/options-breakeven-scenarios" },
        { label: "Options tool", href: "/tools/options" },
        { label: "IV term", href: "/learn/term-iv" },
      ],
      [
        { label: "期权入门", href: "/learn/options-basics-roles-pricing" },
        { label: "盈亏平衡情景", href: "/learn/options-breakeven-scenarios" },
        { label: "期权估算", href: "/tools/options" },
        { label: "IV 词条", href: "/learn/term-iv" },
      ],
    ),
  }),
  guide({
    slug: "risk-reward-tool-guide",
    ctaHref: "/tools/risk-reward",
    titleEn: "Risk/reward tool: expectancy before stories",
    titleZh: "风险回报工具：先算期望再听故事",
    summaryEn:
      "Plug win rate and payoff ratio assumptions to see expectancy. Optimistic win rates without review data are fan fiction. Learning only.",
    summaryZh:
      "用胜率与盈亏比假设看期望值。没有复盘数据的乐观胜率只是小说。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Use it to falsify" },
        {
          type: "p",
          text: "If the plan only works at 70% wins with 1:1 payoff, ask where that 70% was measured—or shrink size.",
        },
      ],
      [
        { type: "h2", text: "用来证伪" },
        {
          type: "p",
          text: "若计划只有在 70% 胜率、1:1 盈亏比下才成立，先问 70% 从哪来——或先减仓。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Where do I get win rate?",
          a: "From your paper/review log—not from a hot tip thread.",
        },
      ],
      [
        {
          q: "胜率从哪来？",
          a: "从自己的模拟/复盘记录，不是热帖。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Risk & expectancy essay", href: "/learn/risk-reward-expectancy" },
        { label: "Risk/reward tool", href: "/tools/risk-reward" },
        { label: "Paper review", href: "/learn/paper-review" },
        { label: "Position tool", href: "/tools/position" },
      ],
      [
        { label: "风险回报专文", href: "/learn/risk-reward-expectancy" },
        { label: "风险回报工具", href: "/tools/risk-reward" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
        { label: "仓位计算器", href: "/tools/position" },
      ],
    ),
  }),
  guide({
    slug: "retirement-tool-guide",
    ctaHref: "/tools/retirement",
    titleEn: "Retirement estimator: coverage under stress",
    titleZh: "退休估算：压力测试下的覆盖",
    summaryEn:
      "Estimate whether contributions and withdrawals cover an enough-line under conservative returns. It is planning arithmetic—not a guarantee. Learning only.",
    summaryZh:
      "在保守报酬下估算投入与提取能否覆盖足够线。这是规划算术，不是保证。仅供学习。",
    sections: termBlocks(
      [
        { type: "h2", text: "Start with the enough-line" },
        {
          type: "p",
          text: "Write annual spending you accept, then stress lower returns and longer longevity before celebrating a finish age.",
        },
      ],
      [
        { type: "h2", text: "从足够线开始" },
        {
          type: "p",
          text: "先写可接受的年支出，再用更低报酬与更长寿命压测，再谈「几岁够」。",
        },
      ],
    ),
    faq: termFaq(
      [
        {
          q: "Is 4% a law?",
          a: "No—a rough rule of thumb. Stress your own numbers.",
        },
      ],
      [
        {
          q: "4% 是定律吗？",
          a: "不是，只是粗尺。用自己的数字压测。",
        },
      ],
    ),
    links: termLinks(
      [
        { label: "Life-stage plan", href: "/learn/life-stage-money-plan" },
        { label: "What freedom means", href: "/learn/financial-freedom-defined" },
        { label: "Retirement tool", href: "/tools/retirement" },
        { label: "Compound tool", href: "/tools/compound" },
      ],
      [
        { label: "人生阶段规划", href: "/learn/life-stage-money-plan" },
        { label: "财富自由怎么定义", href: "/learn/financial-freedom-defined" },
        { label: "退休估算", href: "/tools/retirement" },
        { label: "复利计算器", href: "/tools/compound" },
      ],
    ),
  }),
];

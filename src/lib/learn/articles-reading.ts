import type { LearnArticle } from "@/lib/learn/types";

/** Book list, learning paths, and featured book guides. */
export const LEARN_ARTICLES_READING: LearnArticle[] = [
  {
    slug: "reading-list",
    category: "reading",
    ctaHref: "/learn/learning-path",
    title: {
      "zh-CN": "冷静投书单：先读什么、别读什么",
      en: "Calm-investing reading list: what first, what to skip",
    },
    summary: {
      "zh-CN": "精选约十二本：行为、长期、安全边际；避开暴富秘籍。",
      en: "About twelve books on behavior, patience, margin of safety—not get-rich manuals.",
    },
    paragraphs: {
      "zh-CN": [
        "书单服务「冷静投」：先建立金钱行为与市场谦逊，再谈研究与周期。核心可读《金钱心理学》《思考，快与慢》《漫步华尔街》《共同基金常识》或《指数基金投资指南》《聪明的投资者》《投资中最简单的事》，以及 Marks 的周期思想、Taleb 的随机性警示。",
        "《股票作手回忆录》只当人性案例，不当今日战法；衍生品厚教材只需选读，并配合站内期权估算看「最大亏损」。完整书目与每本要点见文档，站内会陆续加导读页。",
        "别读什么：承诺暴富、跟单密码、把回忆录当可复制策略的读法。读完任何书都不会自动盈利——下一步请走学习路线，并在模拟盘里练流程。",
      ],
      en: [
        "This list serves calm investing: behavior and humility before stock-picking lore. Start with Psychology of Money, Thinking Fast and Slow, A Random Walk Down Wall Street, Bogle’s common sense or a solid index/DCA guide, The Intelligent Investor, and clear “simple but hard” investing essays; add Marks on cycles and Taleb on randomness when ready.",
        "Reminiscences of a Stock Operator is a human case study—not a modern playbook. Treat heavy derivatives texts as selective reading beside the options payoff tool (max loss first).",
        "Skip get-rich promises and “copy this operator” fantasies. No book guarantees profit—follow a learning path and practice process on paper.",
      ],
    },
  },
  {
    slug: "learning-path",
    category: "reading",
    ctaHref: "/portfolio",
    title: {
      "zh-CN": "三条学习路线：启蒙 → 长期 → 进阶",
      en: "Three paths: foundations → long-term → advanced",
    },
    summary: {
      "zh-CN": "每阶段：目标、书、短文、站内动作；一次只走一条。",
      en: "Each stage: goal, books, essays, in-app drills—one path at a time.",
    },
    paragraphs: {
      "zh-CN": [
        "路线 A（启蒙，约 2–4 周）：读《金钱心理学》或《小狗钱钱》，跳读《思考，快与慢》中的偏见章节。站内用复利/定投工具建立量级直觉，写「下单前三问」，模拟盘只做 2～3 笔计划内交易并复盘一次。",
        "路线 B（长期，约 1–2 月）：读《漫步华尔街》+ 指数/定投类书籍，可选《投资中最简单的事》。站内弄清多市场差异，做一次同业对比，自选精简，提醒只绑失效条件，AI 只问结构。",
        "路线 C（进阶，可选）：选读《聪明的投资者》、Marks 周期、Taleb；《股票作手》当反面教材。站内走情景 → 纸面条件、连续周复盘，期权工具只算打和与最大亏损。共同终点：可重复的冷静流程，而不是会荐股。",
      ],
      en: [
        "Path A (≈2–4 weeks): Psychology of Money (or a gentle money-habits book) plus bias chapters from Thinking Fast and Slow. Use compound/DCA tools, write a three-question checklist, and run only a few planned paper trades plus one review.",
        "Path B (≈1–2 months): A Random Walk plus an index/DCA guide; optional “simple investing” essays. Tour multi-market differences, one peer compare, a lean watchlist, alerts on invalidation only, AI questions about structure—not tickers to buy.",
        "Path C (optional): Intelligent Investor (selective), Marks on cycles, Taleb on randomness; Stock Operator as cautionary tale. Scenario → paper conditions, weekly reviews, options tool for breakeven and max loss only. The shared finish line is a repeatable calm process—not stock tips.",
      ],
    },
  },
  {
    slug: "book-psychology-of-money",
    category: "reading",
    ctaHref: "/tools",
    title: {
      "zh-CN": "导读：《金钱心理学》",
      en: "Guide: The Psychology of Money",
    },
    summary: {
      "zh-CN": "财富是行为问题；「足够」与时间，往往比聪明短线重要。",
      en: "Wealth is mostly behavior; “enough” and time beat clever short games.",
    },
    paragraphs: {
      "zh-CN": [
        "本书用故事讲金钱决策：储蓄与知足、运气与风险、时间的力量，以及为什么表现欲会破坏复利。它不是选股教程，而是帮你检查「我是否在用金钱证明什么」。",
        "启发：能留下来的钱才是财富；长期一致的普通决策，常胜过反复高光却爆仓的聪明；为自己的风险性格选策略，而不是抄别人的仓位。",
        "站内练习：打开复利与定投工具，感受时间假设；读「冷静看盘」「下单前三问」；用复盘只记录行为对错，不记录面子。完整书单与路线见专栏其它文。",
      ],
      en: [
        "Housel’s stories cover saving, luck versus risk, the power of time, and how ego breaks compounding. It is not a stock-picking manual—it audits what money is doing to your behavior.",
        "Takeaways: wealth is what you don’t spend; consistent ordinary decisions often beat brilliant blow-ups; size risk to your temperament, not someone else’s feed.",
        "Practice: run compound and DCA tools, reread calm-watching and the three-question checklist, and review behavior—not ego. See the reading list and learning-path essays for what to read next.",
      ],
    },
  },
  {
    slug: "book-random-walk",
    category: "reading",
    ctaHref: "/markets",
    title: {
      "zh-CN": "导读：《漫步华尔街》",
      en: "Guide: A Random Walk Down Wall Street",
    },
    summary: {
      "zh-CN": "短期难测、成本重要；对分析流派保持谦逊。",
      en: "Short-term forecasts are hard; costs matter; stay humble about methods.",
    },
    paragraphs: {
      "zh-CN": [
        "Malkiel 梳理市场历史、泡沫与各类分析流派的局限，并讨论分散与低成本长期投资的思路。不同版本细节有更新，读时注意出版年份。",
        "启发：把「预测下一周涨跌」的执念降下来；更可控的往往是费用、分散、与自己能否坚持的计划。技术与基本面都可以学，但都不是水晶球。",
        "注意：书中语境偏美股与基金史，迁到港股、A 股或加密时只借框架。站内练习：多市场 101、同业对比、定投工具做假设（非承诺收益），并用模拟验证纪律而非运气。",
      ],
      en: [
        "Malkiel surveys market history, bubbles, and the limits of popular analysis schools, then argues for diversification and low-cost long-horizon investing. Prefer a recent edition.",
        "Takeaways: loosen the urge to forecast next week; costs, diversification, and a plan you can keep are often more controllable than “calls.” Charting and fundamentals can teach—neither is a crystal ball.",
        "Caveat: the framing is largely US markets; borrow the humility, not every product detail, for HK, A-shares, or crypto. Practice via multi-market 101, peer compare, DCA assumptions (not promised returns), and paper trades that test discipline—not luck.",
      ],
    },
  },
];

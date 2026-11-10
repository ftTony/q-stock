import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-03-01";
const UPDATED = "2026-11-10";

/**
 * Deep three-question checklist — gate before size, not a long license.
 * Order matters; mid-trade edits are the usual failure.
 */
export const LEARN_ARTICLE_CHECKLIST_THREE: LearnArticle = {
  slug: "checklist-three",
  category: "mindset",
  ctaHref: "/portfolio",
  author: AUTHOR,
  publishedAt: PUBLISHED,
  updatedAt: UPDATED,
  title: {
    "zh-CN": "下单前三问清单",
    "zh-TW": "下單前三問清單",
    en: "Three questions before you click",
  },
  summary: {
    "zh-CN":
      "结构清楚了吗？风险预算定了吗？失效写了吗？清单是门闩，不是做多许可证。",
    "zh-TW": "結構、風險、失效三問。清單是門閂，不是許可證。",
    en: "Structure? Risk budget? Invalidation written? A gate—not a long license.",
  },
  paragraphs: {
    en: [
      "Most regret trades fail the autopsy for a boring reason: there was no fixed question before the click. Not “I missed a headline.” Missing process.",
      "A short list will not make you rich. It will make impulse file for a permit it often cannot get.",
    ],
    "zh-CN": [
      "多数后悔单，尸检结论很无聊：点下去之前没有固定问题。不是「没看新闻」，是缺流程。",
      "短清单不会让你暴富。它会让冲动去申请一张常常批不下来的许可证。",
    ],
    "zh-TW": [
      "後悔單常敗在動手前沒有固定問題。",
      "短清單不保證獲利，只把衝動攔在門外。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Keep three questions. More than that and you will not use them when the tape is loud. Write answers in the paper-order note or the plan panel until muscle memory forms. Same language later on live size—new slogans under stress are decoration.",
      },
      {
        type: "p",
        text: "Calm watching trains the daily three lines. This checklist is the same language turned into a hard gate: no pass, no size. Passing is not a forecast from the universe.",
      },
      { type: "h2", text: "Q1 — Structure" },
      {
        type: "p",
        text: "Trend, range, or messy break? If you cannot name it, you are justifying size with local wiggles. Structure unclear → the other two questions become self-deception machines: you will invent a “tight stop” and a “wide enough” invalidation to fit a story you never framed. Daily structure first; minutes later—if at all.",
      },
      { type: "h2", text: "Q2 — Risk budget" },
      {
        type: "p",
        text: "What percent of equity is the maximum loss on this idea? Set “what I can lose” before dreaming upside. The position tool turns that sentence into share count. Dreaming “how much I need to buy to matter” first is how leverage sneaks in wearing ambition. High conviction without a written % is still naked size.",
      },
      { type: "h2", text: "Q3 — Invalidation" },
      {
        type: "p",
        text: "What price or condition voids the plan? Without it you invent patience on the way down and FOMO on the way up. Bind the line to an alert. Mid-trade relocation of invalidation is usually loss aversion editing the contract—see the biases lesson. “A bit more room” is the most expensive sentence on the list.",
      },
      {
        type: "table",
        head: ["Order", "If skipped", "Typical excuse"],
        rows: [
          [
            "Structure first",
            "Risk and stop become theater",
            "“I’ll figure the chart after I’m in.”",
          ],
          [
            "Risk second",
            "Pretty structure, naked size",
            "“It’s a high-conviction idea.”",
          ],
          [
            "Invalidation third",
            "Both prior answers get rewritten live",
            "“Just a bit more room.”",
          ],
        ],
      },
      { type: "h2", text: "A fill that looked like process" },
      {
        type: "p",
        text: "Structure: “daily pullback in an uptrend.” Risk: “1%.” Invalidation: “under yesterday’s low.” You buy. Price tags the low, you move the void “a little.” That single edit voided the checklist more than a wrong direction would. Review should score obedience to the three answers, not only P&L. A green day that required rewriting invalidation is still a process fail.",
      },
      { type: "h2", text: "What passing the checklist is not" },
      {
        type: "p",
        text: "It is not a forecast. It is not permission from the universe. It is the minimum to act. You can pass and still lose—that is expectancy and costs, not checklist failure. Treating a pass as a moral right to add forever is how people blow the risk %. Treat a fail as a successful block. The goal of the gate is fewer unclear clicks, not a higher win rate sticker.",
      },
      { type: "h2", text: "Product path" },
      {
        type: "ul",
        items: [
          "Paper: note structure / risk% / invalidation on every fill until it is boring.",
          "Position tool: convert risk% into size; do not reverse-engineer size from FOMO.",
          "Alert: invalidation side only—not wish integers on the dream side.",
          "Review: did you obey the three answers or edit them after color appeared?",
        ],
      },
      {
        type: "note",
        text: "When “a bit more” keeps winning, read greed/fear/desire. When System 1 drafts faster than you can write, read Thinking, Fast and Slow. When you keep rewriting after entry, read the five biases. The checklist is System 2’s shift schedule—not a lucky charm.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "只留三问。再多，盘面一吵你就不会用。写在模拟单备注或计划面板里，直到形成肌肉记忆。真仓用同一套语言——压力下换口号，多半是装饰。",
      },
      {
        type: "p",
        text: "冷静看盘练的是日常三句。本篇把同一套语言收成硬门闩：过不了，就不上仓位。通过不是宇宙颁发的预测。",
      },
      { type: "h2", text: "问一——结构" },
      {
        type: "p",
        text: "趋势、箱体，还是破位后的混乱？叫不出名字，就是在用局部抖动给仓位找理由。结构不清，后面两问容易变成自欺机器：你会发明「很紧的止损」和「够宽的失效」去迁就一个从未框清的故事。日线结构在先；分钟线其后——也可以不要。",
      },
      { type: "h2", text: "问二——风险预算" },
      {
        type: "p",
        text: "这笔最多愿意亏账户的百分之几？先定「亏得起」，再谈上行。仓位工具把这句话换成股数。先想「买多少才有存在感」，杠杆就会穿着雄心混进来。没有写成%的「高确信」，仍是裸奔。",
      },
      { type: "h2", text: "问三——失效" },
      {
        type: "p",
        text: "什么价位或条件出现，计划作废？不写，下跌时你会发明耐心，上涨时你会发明怕踏空。绑到提醒上。盘中挪失效，多半是损失厌恶在改合同——见行为偏差课。「再给一点空间」往往是整张清单里最贵的一句。",
      },
      {
        type: "table",
        head: ["顺序", "若跳过", "典型借口"],
        rows: [
          [
            "结构在先",
            "风险与止损变成演戏",
            "「进了再看图。」",
          ],
          [
            "风险其次",
            "结构再漂亮也是裸奔",
            "「高确信。」",
          ],
          [
            "失效最后",
            "前两答会在盘中被改写",
            "「再给一点空间。」",
          ],
        ],
      },
      { type: "h2", text: "一笔「看起来像流程」的成交" },
      {
        type: "p",
        text: "结构：「上升趋势里的日线回撤。」风险：「1%。」失效：「昨低下。」买了。价格戳到昨低，你把作废线「挪一点」。这一下改写，比方向看错更糟。复盘应打「是否遵守三答」，而不只看盈亏。为了保住浮盈而改失效的绿日，仍是流程失败。",
      },
      { type: "h2", text: "通过清单不是什么" },
      {
        type: "p",
        text: "不是预测。不是宇宙许可证。只是动手的最低条件。通过了仍可能亏——那是期望值与成本，不是清单失灵。把「通过」当成永远加仓的道德权利，风险%就会被打穿。把「没通过」当成一次成功的拦截。门闩的目标是减少说不清的点击，不是贴一张更高胜率的贴纸。",
      },
      { type: "h2", text: "产品路径" },
      {
        type: "ul",
        items: [
          "模拟：每笔备注结构 / 风险% / 失效，直到无聊为止。",
          "仓位工具：用风险%反推数量；别用 FOMO 反推必须买多少。",
          "提醒：只绑失效侧——不是许愿侧的整数。",
          "复盘：是遵守三答，还是变色之后改过？",
        ],
      },
      {
        type: "note",
        text: "总被「再多一点」推着走，读贪婪恐惧与欲望。系统 1 起草快过你书写，读《思考，快与慢》。进场后总改规则，读五种行为偏差。清单是系统 2 的排班表——不是幸运符。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Can I add a fourth question?",
        a: "Only if you still use it under stress. Most fourth questions become decoration. Deepen the three before extending.",
      },
      {
        q: "I passed the checklist and still lost. Did it fail?",
        a: "No. A gate filters unclear clicks; it does not buy expectancy. Score whether you kept the three answers—especially invalidation—after color appeared.",
      },
    ],
    "zh-CN": [
      {
        q: "可以加第四问吗？",
        a: "除非压力下你仍会用。多数第四问会变成装饰。先把三问用深，再谈扩展。",
      },
      {
        q: "过了清单仍亏，是清单失灵吗？",
        a: "不是。门闩筛的是说不清的点击，不买断期望值。复盘看三答——尤其失效——变色后有没有被改写。",
      },
    ],
  },
  links: {
    en: [
      { label: "Calm watching", href: "/learn/calm-watching" },
      { label: "Behavior biases", href: "/learn/mindset-behavior-biases" },
      { label: "Greed, fear, desire", href: "/learn/dao-greed-fear-desire" },
      { label: "Risk & expectancy", href: "/learn/risk-reward-expectancy" },
      { label: "Paper and review", href: "/learn/paper-review" },
    ],
    "zh-CN": [
      { label: "冷静看盘", href: "/learn/calm-watching" },
      { label: "五种行为偏差", href: "/learn/mindset-behavior-biases" },
      { label: "贪婪、恐惧与欲望", href: "/learn/dao-greed-fear-desire" },
      { label: "风险回报与期望值", href: "/learn/risk-reward-expectancy" },
      { label: "模拟与复盘", href: "/learn/paper-review" },
    ],
  },
  sourceNote: {
    en: "Educational. Passing the gate is not a return promise.",
    "zh-CN": "仅供学习。过门不等于收益承诺。",
  },
};

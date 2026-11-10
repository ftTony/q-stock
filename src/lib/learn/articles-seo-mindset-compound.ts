import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";
const UPDATED = "2026-11-10";

/** Deep: compounding fails as behavior, not as arithmetic. */
export const LEARN_ARTICLES_SEO_MINDSET_COMPOUND: LearnArticle[] = [
  {
    slug: "mindset-compounding-hard",
    category: "mindset",
    ctaHref: "/tools",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    title: {
      en: "The compound curve dies from interruption, not from low IQ",
      "zh-CN": "复利曲线死于打断，不死于算术太难",
    },
    summary: {
      en: "Everyone can plot (1+r)^n. Few can refuse the monthly urge to reset the experiment—new theme, new leverage, new “exception.” Tools show time; the workbench loop is what keeps time from being cancelled.",
      "zh-CN":
        "(1+r)^n 谁都会画。难的是拒绝每月重置实验的冲动——新题材、新杠杆、新「例外」。工具展示时间；看盘闭环负责别让时间被取消。",
    },
    paragraphs: {
      en: [
        "Middle-school math explains compounding. Adult behavior explains why the chart in the brochure rarely matches the chart in the account.",
        "The gap is almost never “I need a better formula.” It is “I keep restarting the clock.”",
      ],
      "zh-CN": [
        "复利的算术中学就会。说明书里的曲线和账户里的曲线对不上，解释权通常在成年人的行为。",
        "缺口几乎从不是「我需要更好的公式」，而是「我一直在把时钟清零」。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Open Q-Stock’s compound or DCA tool. Pick a boring contribution and a modest rate. Stare at year ten. Now list what would make you abandon that path in year two: a hotter ticker, a humiliating drawdown, a friend who doubled faster, a quarter of silence that feels like failure. Those items are the real curriculum. The tool only makes the contrast visible.",
        },
        { type: "h2", text: "Five ways people cancel the clock" },
        {
          type: "p",
          text: "Boredom invents activity—overtrading so the month “counts.” Envy imports someone else’s timeline as your benchmark. Drawdown intolerance voids plans that only looked good on up-only charts. Fee and tax leakage quietly flatten the brochure curve. Identity hunger—needing to look clever—interrupts the dull virtue of looking consistent. None of these appear in the (1+r)^n cell.",
        },
        {
          type: "table",
          head: ["Interrupt", "Feels like", "Actually does", "Workbench counter"],
          rows: [
            [
              "Overtrade for stimulation",
              "“I’m working.”",
              "Resets edge with fees + noise",
              "Weekly quota of checklist-passed setups",
            ],
            [
              "Chase a hotter path",
              "“Opportunity cost.”",
              "Abandons unfinished compounding",
              "Written enough-line / freedom definition",
            ],
            [
              "Quit after a red stretch",
              "“The method failed.”",
              "Samples only the pain window",
              "Pre-committed risk language + review",
            ],
            [
              "Ignore costs in the sim",
              "“Close enough.”",
              "Overstates what behavior must deliver",
              "Haircut assumptions in the tool; journal reality",
            ],
            [
              "Style drift for ego",
              "“I’ve leveled up.”",
              "Starts a new n at zero",
              "One process change per month max",
            ],
          ],
        },
        { type: "h2", text: "Active craft is allowed—interruption is not" },
        {
          type: "p",
          text: "Compounding is not a ban on skillful trading. It is a ban on repeatedly detonating the process that was supposed to carry skill across years. An active workbench loop—watch, analyze, plan, review—can compound judgment. A month of clever exceptions compounds only stories. If your “activity” cannot survive a written review without rewriting the rules, it is not craft; it is interruption with a better vocabulary.",
        },
        {
          type: "note",
          text: "Index patience and discretionary craft fail the same way when interrupted. Do not use “I’m active” as a moral upgrade over “I’m patient.” Both need a clock that is not reset by mood.",
        },
        { type: "h2", text: "A monthly drill that beats a new indicator" },
        {
          type: "ul",
          items: [
            "Rerun the same contribution assumption in the tool.",
            "Write whether you actually contributed / followed size rules.",
            "Name one interruption you refused this month—and one that almost won.",
            "Change at most one process knob next month.",
          ],
        },
        {
          type: "p",
          text: "That journal compounds faster than hunting a perfect entry. The Psychology of Money lesson rhymes here: wealth is what you keep behaving toward, not what you briefly understand on a slide.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "打开钱力股的复利或定投工具。设一笔无聊的定期投入和不高的年化。盯着第十年。然后列出：哪些东西会让你在第二年就放弃——更热的代码、难堪的回撤、跑得更快的朋友、安静到像失败的一季。那些条目才是真正的功课。工具只是把反差照亮。",
        },
        { type: "h2", text: "五种把时钟清零的方式" },
        {
          type: "p",
          text: "无聊发明活动——过度交易好让这个月「算数」。嫉妒把别人的时间表进口成你的基准。受不了回撤，会作废那些只在单边上涨图里好看的计划。费用与税负在漂亮模拟里被忽略，曲线就被偷偷削平。人设饥饿——需要看起来聪明——打断「看起来稳定」这种钝美德。(1+r)^n 的格子里，这些都不会出现。",
        },
        {
          type: "table",
          head: ["打断", "感觉像", "实际在做", "工作台反制"],
          rows: [
            [
              "为刺激而过度交易",
              "「我在干活。」",
              "用费用与噪音重置优势",
              "每周只做有限笔过三问的机会",
            ],
            [
              "追更热的路径",
              "「机会成本。」",
              "遗弃未完成的复利",
              "写下足够线 / 自由定义",
            ],
            [
              "红一段就弃计划",
              "「方法失败了。」",
              "只采样痛苦窗口",
              "预先承诺的风险语言 + 复盘",
            ],
            [
              "模拟里忽略成本",
              "「差不多就行。」",
              "高估行为必须交付的成果",
              "工具假设打折；日记对照现实",
            ],
            [
              "为人设漂移风格",
              "「我升级了。」",
              "把 n 从零再数",
              "每月最多改一个流程旋钮",
            ],
          ],
        },
        { type: "h2", text: "允许主动手艺——不允许打断" },
        {
          type: "p",
          text: "复利不是禁止有技巧的交易。它禁止的是反复引爆本该跨年承载技巧的过程。看盘→分析→计划→复盘，可以复利判断力；一个月的聪明例外，只能复利故事。若你的「活跃」经不起书面复盘、还要改规则才能说得通——那就不是手艺，是词汇升级过的打断。",
        },
        {
          type: "note",
          text: "指数式耐心与主观手艺，被打断时以同一种方式失败。别用「我主动」道德优越于「我耐心」。两者都需要不被心情清零的时钟。",
        },
        { type: "h2", text: "比新指标更有用的月度练习" },
        {
          type: "ul",
          items: [
            "用同一套贡献假设再跑一遍工具。",
            "写下你是否真的投入 / 遵守了仓位规则。",
            "点名本月拒绝的一次打断——以及差一点赢的那次。",
            "下月最多只改一个流程旋钮。",
          ],
        },
        {
          type: "p",
          text: "这本笔记，比寻找完美买点复利得更快。《金钱心理学》在这里同韵：财富是你持续朝它行为的东西，不是幻灯片上短暂理解的东西。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Does compounding require me to buy only indexes?",
          a: "No. It requires any path—index or active—to survive interruption. Activity without a loop is a steeper fee curve.",
        },
        {
          q: "What rate should I assume in the tool?",
          a: "A modest one you can defend. Optimistic brochure rates hide how little interruption your behavior can tolerate.",
        },
      ],
      "zh-CN": [
        {
          q: "复利是不是只能买指数？",
          a: "不是。它要求任何路径——指数或主动——都扛得住打断。没有闭环的活跃，只是更陡的费用曲线。",
        },
        {
          q: "工具里该假设多高年化？",
          a: "一个你能辩护的保守数。说明书式乐观，会掩盖你的行为其实扛不住多少打断。",
        },
      ],
    },
    links: {
      en: [
        {
          label: "Financial freedom defined",
          href: "/learn/financial-freedom-defined",
        },
        {
          label: "Wealth as process",
          href: "/learn/wealth-building-process",
        },
        {
          label: "Psychology of Money",
          href: "/learn/book-psychology-of-money",
        },
        { label: "Workbench loop", href: "/learn/stocks-workbench-loop" },
      ],
      "zh-CN": [
        {
          label: "财富自由怎么定义",
          href: "/learn/financial-freedom-defined",
        },
        {
          label: "财富累积是过程",
          href: "/learn/wealth-building-process",
        },
        {
          label: "《金钱心理学》",
          href: "/learn/book-psychology-of-money",
        },
        { label: "看盘闭环", href: "/learn/stocks-workbench-loop" },
      ],
    },
    sourceNote: {
      en: "Educational. Tool curves are assumptions, not forecasts of your path.",
      "zh-CN": "仅供学习。工具曲线是假设，不是对你路径的预测。",
    },
  },
];

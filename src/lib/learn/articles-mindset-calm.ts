import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-03-01";
const UPDATED = "2026-11-10";

/**
 * Deep calm-watching essay — sensation demoted; structure/level/invalidation default.
 * Desk scenes + product ritual; not a “stay zen” pep talk.
 */
export const LEARN_ARTICLE_CALM_WATCHING: LearnArticle = {
  slug: "calm-watching",
  category: "mindset",
  ctaHref: "/markets",
  author: AUTHOR,
  publishedAt: PUBLISHED,
  updatedAt: UPDATED,
  title: {
    "zh-CN": "冷静看盘：先看结构，再谈感觉",
    "zh-TW": "冷靜看盤：先看結構，再談感覺",
    en: "Calm watching: structure before feelings",
  },
  summary: {
    "zh-CN":
      "刷屏很少换来更干净的判断。把感觉降级，把结构、价位、失效升成默认流程——并落到图表、提醒与计划。",
    "zh-TW":
      "刷屏很少更清醒。把感覺降級，把結構、價位、失效升成預設流程。",
    en: "Refresh is not clarity. Demote feeling; promote structure, levels, invalidation—on chart, alert, and plan.",
  },
  paragraphs: {
    en: [
      "The quote page is engineered to ask one question: “Should I act now?” Color, push alerts, someone else’s P&L screenshot—none of that is neutral wallpaper. It trains urgency. More refresh rarely produces a cleaner read. It produces a louder body.",
      "Calm watching is not quitting the market. It is refusing to let sensation draft the plan while you still call the draft “analysis.”",
    ],
    "zh-CN": [
      "行情页天生会把人拽向「此刻该不该动」。涨跌色、推送、别人的盈亏截图——都不是中性壁纸，它们在训练紧迫感。多刷几遍很少换来更干净的判断，多半只换来更响的身体反应。",
      "冷静看盘不是退出市场。是拒绝让感觉起草计划，还把草稿叫做「分析」。",
    ],
    "zh-TW": [
      "行情頁會把人拽向「此刻該不該動」。多刷很少更清醒，多半只更焦慮。",
      "冷靜看盤不是關掉行情，而是不讓感覺起草計畫。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Feeling is real: FOMO after a squeeze, shame after a red open, the itch to “do something” on a flat afternoon so the day “counts.” Analysis is what remains after you name structure, mark levels you can defend in a review, and write what voids the read. Mixing the two is how people promote screenshots to research and call impulse “conviction.”",
      },
      { type: "h2", text: "A morning that fails without drama" },
      {
        type: "p",
        text: "You open three names because the watchlist is long. One is green hard. Chat heat arrives. You skip writing structure because “it’s obvious.” You buy. Midday fades. You invent “washout.” You add. Close is ugly. The autopsy will say “emotion.” The process failure was earlier: no three lines before the first click, no invalidation that could fire without a mid-trade trial. Calm watching is the boring prevention of that sequence—not a personality upgrade you install after the loss.",
      },
      { type: "h2", text: "Three questions that demote sensation" },
      {
        type: "p",
        text: "Structure: trend advance, range, or post-break mess? If you cannot say which in one sentence, you are still in local noise—size stays small or zero. Levels: where are the bands you marked before the session, not hope prices invented after the move? Invalidation: what print or condition ends the story without a courtroom on the tape? No invalidation means infinite defense—“washout” on the way down, “don’t miss it” on the way up.",
      },
      {
        type: "table",
        head: ["Question", "Good enough answer", "Still feeling"],
        rows: [
          [
            "Structure",
            "“Daily higher lows into a prior supply band.”",
            "“It looks strong / weak today.”",
          ],
          [
            "Level",
            "“Band 41.2–41.8 from two swing lows; alert under 41.0.”",
            "“Around forty something.”",
          ],
          [
            "Invalidation",
            "“Daily close under 41.0 voids the long plan.”",
            "“I’ll know when it feels wrong.”",
          ],
        ],
        caption:
          "If the middle column is empty, you are not calm-watching yet—you are browsing with a portfolio nearby.",
      },
      { type: "h2", text: "Desk ritual that fits this product" },
      {
        type: "ul",
        items: [
          "Open one familiar symbol. Mute news and comments for ten minutes.",
          "Daily chart + one average only. Write three lines: structure / level / invalidation.",
          "Only then open a lower timeframe—if at all. Minutes without a daily sentence are a FOMO projector.",
          "Bind the invalidation to an alert (≥ / ≤). When it fires: pause, re-run the checklist—do not add to prove you were right.",
          "Optional: AI chart-read for structure language. Cross-check with your eye and filings. Scaffolding, not a ticket.",
        ],
      },
      {
        type: "p",
        text: "Impulse adds after an alert often mean you are using size to paper over a missing frame. The watchlist lesson applies: fewer names, sharper lines. A long list is a machine for manufacturing false urgency—every green cell a possible emergency.",
      },
      { type: "h2", text: "What calm watching is not" },
      {
        type: "ul",
        items: [
          "Not “never click.” It is click only after sensation is demoted.",
          "Not indicator maximalism. Extra oscillators often smuggle feeling back in as “confirmation.”",
          "Not predicting the open. Structure can be wrong; the win is having a void condition ready.",
          "Not moral superiority over active traders. Activity without three lines is still browsing.",
        ],
      },
      { type: "h2", text: "When the protocol fails on purpose" },
      {
        type: "p",
        text: "Some days you will fail the three lines. That is a successful outcome: observe-only. The failure mode is forcing a trade so the afternoon “counts.” Pair this essay with greed/fear/desire when the feed is loud, with biases when you keep editing rules mid-trade, and with crash first-aid when the tape is violent—calm watching is the everyday protocol; those are stress expansions.",
      },
      {
        type: "note",
        text: "Calm watching ends when structure / level / invalidation are the default path—not when you never feel. Process is reusable; mood is not a strategy. Next: the three-question checklist turns the same language into a gate before size.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "感觉是真的：逼空后的怕踏空、低开后的羞耻、横盘下午「总得干点什么」才算参与的痒。分析是你命名结构、标出复盘时能辩护的价位、写清什么会作废判断之后剩下的东西。两者搅在一起，人就会把截图升格为研究，把冲动叫做「确信」。",
      },
      { type: "h2", text: "一场不戏剧化的失败上午" },
      {
        type: "p",
        text: "自选太长，你开了三只。其中一只绿得很狠，群热也到了。结构懒得写——「太明显了」。买了。午间回撤，你发明「洗盘」。加了。收盘很难看。尸检会写「情绪」。流程故障更早：第一下点击前没有三句，没有能响铃而不靠盘中庭审的失效。冷静看盘是对这条链的无聊预防——不是亏完再装的性格补丁。",
      },
      { type: "h2", text: "三句把感觉降级的问题" },
      {
        type: "p",
        text: "结构：趋势推进、箱体，还是破位后的混乱？一句话说不清，就还在局部噪声里——仓位小或为零。价位：会前就标过的带子在哪，不是涨完才找的希望价？失效：怎样的收盘或条件出现，故事结束、不许盘中庭审？没有失效，就有无限辩护——跌了说洗盘，涨了说别踏空。",
      },
      {
        type: "table",
        head: ["问题", "够用的答案", "仍是感觉"],
        rows: [
          [
            "结构",
            "「日线抬高低点，顶进前供给带。」",
            "「今天看起来很强 / 很弱。」",
          ],
          [
            "价位",
            "「带子 41.2–41.8 来自两个摆动低；提醒在 41.0 下。」",
            "「四十来块吧。」",
          ],
          [
            "失效",
            "「日线收在 41.0 下，多头计划作废。」",
            "「感觉不对就知道了。」",
          ],
        ],
        caption: "中间列空着，就还不是冷静看盘——只是旁边挂着组合的浏览。",
      },
      { type: "h2", text: "贴合本站的桌面仪式" },
      {
        type: "ul",
        items: [
          "打开一只熟悉的标的。新闻与评论静音十分钟。",
          "只用日线 + 一条均线。写三句：结构 / 价位 / 失效。",
          "写得出来，再考虑更短周期——也可以不看。没有日线句子的分钟线，是 FOMO 投影仪。",
          "失效做成 ≥ / ≤ 提醒。铃响：停手、重跑清单——不要加仓证明自己正确。",
          "可选：用 AI 读图逼出结构语言，再与肉眼、披露交叉验证。脚手架，不是下单按钮。",
        ],
      },
      {
        type: "p",
        text: "提醒后冲动加仓，往往是在用仓位掩盖框架缺失。自选课同样适用：名单越短，线越利。长名单是一台制造假紧迫感的机器——每个绿色格子都像紧急事件。",
      },
      { type: "h2", text: "冷静看盘不是什么" },
      {
        type: "ul",
        items: [
          "不是「永远不点」。是感觉降级之后再点。",
          "不是指标堆满。指标一多，感觉常会伪装成「共振确认」溜回来。",
          "不是预测开盘。结构可以错；赢在事先写好作废条件。",
          "不是对活跃交易者的道德优越。没有三句的活跃，仍是浏览。",
        ],
      },
      { type: "h2", text: "协议「故意失败」的那天" },
      {
        type: "p",
        text: "有些日子三句写不出来。那是成功结果：只观察。失败模式是为了让下午「算数」而硬做一笔。信息流很吵时，配读贪婪恐惧与欲望；盘中改规则时，配读行为偏差；盘面很暴时，配读暴跌急救——冷静看盘是日常协议，后几篇是压力扩展版。",
      },
      {
        type: "note",
        text: "终点不是永不感觉，而是结构 / 价位 / 失效升为默认路径。流程可反复用；情绪不能当策略。下一步：《下单前三问》把同一套语言收成动手前的门闩。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Do I need many indicators for calm watching?",
        a: "One average is enough to start. More indicators often smuggle feeling back in as “confirmation.” Deepen the three lines before adding tools.",
      },
      {
        q: "What if structure is clear but I still feel urgent?",
        a: "Urgency without a written invalidation is still feeling. Finish the third line or stay observe-only. Loud feed days: read greed/fear/desire first.",
      },
    ],
    "zh-CN": [
      {
        q: "冷静看盘一定要很多指标吗？",
        a: "一条均线起步就够。指标一多，感觉常会伪装成「共振确认」溜回来。先把三句用深，再谈加工具。",
      },
      {
        q: "结构清楚了仍很急怎么办？",
        a: "没有写成文字的失效，急仍是感觉。写完第三句，或只观察。信息流很吵时，先读贪婪恐惧与欲望。",
      },
    ],
  },
  links: {
    en: [
      { label: "Three questions", href: "/learn/checklist-three" },
      { label: "Greed, fear, desire", href: "/learn/dao-greed-fear-desire" },
      { label: "Behavior biases", href: "/learn/mindset-behavior-biases" },
      { label: "Support & resistance", href: "/learn/stocks-support-resistance" },
      { label: "Watchlist and alerts", href: "/learn/watchlist-alerts" },
    ],
    "zh-CN": [
      { label: "下单前三问", href: "/learn/checklist-three" },
      { label: "贪婪、恐惧与欲望", href: "/learn/dao-greed-fear-desire" },
      { label: "五种行为偏差", href: "/learn/mindset-behavior-biases" },
      { label: "支撑与阻力", href: "/learn/stocks-support-resistance" },
      { label: "自选与提醒", href: "/learn/watchlist-alerts" },
    ],
  },
  sourceNote: {
    en: "Educational. A frame reduces impulsive size—it does not forecast direction.",
    "zh-CN": "仅供学习。框架降低冲动仓位，不预测方向。",
  },
};

import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Support / resistance + false breakout — classic chart craft, product-tied. */
export const LEARN_ARTICLES_SEO_STOCKS_LEVELS: LearnArticle[] = [
  {
    slug: "stocks-support-resistance",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Support and resistance: zones you can defend, not magic horizontal lines",
      "zh-CN": "支撑与阻力：能辩护的区域，不是神奇水平线",
    },
    summary: {
      en: "Levels are places where participation once flipped. Draw them as bands, bind alerts to the invalidation side, and expect them to fail when the story changes.",
      "zh-CN":
        "价位是参与者曾经翻过脸的地方。画成带子，把提醒绑在失效一侧，并假定故事一变它们就会失效。",
    },
    paragraphs: {
      en: [
        "Open the chart of a name you are watching and skip the indicators for a minute. The first useful layer is participation: where did buyers last absorb selling, where did sellers cap it. Levels are not drawn onto a chart—they are traded into existence.",
        "A thin line feels precise and sells confidence. Markets trade zones: you call 172 support, somebody else has been buying since 174. The gap is harmless; the harm starts when your stop sits on the exact tick of the line.",
      ],
      "zh-CN": [
        "打开一只你最近在盯的票，先别看指标。图上真正有用的第一层信息是参与：谁在哪接过盘，谁在哪压过价。支撑是买盘曾经接住卖压的地方，阻力是卖盘曾经盖住买盘的地方。价位不是画出来的，是被交易出来的。",
        "一根细线显得精确，也容易卖自信。但市场交易的是区域：你说 172 是支撑，别人可能 174 就开始买了。差距本身没坏处，坏处是止损贴在一根线上，被一根影线扫掉。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Open a name you have been watching and ignore the indicators for a minute. The first useful layer of any chart is participation: where did buyers last absorb selling, where did sellers cap it. Support and resistance are not drawn onto a chart—they are traded into existence.",
        },
        {
          type: "p",
          text: "A thin line feels precise and sells confidence, but markets trade zones. You call 172 support; somebody else has been buying since 174. The gap itself is harmless. The harm starts when your stop sits on the exact tick of the line and one wick collects it. Treat the line as the center of a band you can defend in one sentence.",
        },
        { type: "h2", text: "Three raw materials for levels" },
        {
          type: "p",
          text: "Not every horizontal line deserves ink. A touch counts when it left a reaction—a wick rejected and reclaimed, or a full reversal candle. That is evidence someone actually acted there. A price brushed once without consequence is a rumor, not a level.",
        },
        {
          type: "table",
          head: ["Raw material", "How to find it", "Reliability"],
          rows: [
            ["Prior swing highs and lows", "Visible turning points on the daily", "The default; holds while the trend holds"],
            ["Range edges", "Tops and bottoms visited repeatedly without a break", "Most reliable in sideways regimes"],
            ["Dense close clusters", "Many candles opening and closing in the same band", "Behaves like a magnet—slows price, does not guarantee a reversal"],
          ],
          caption:
            "The raw material sets the band width: scattered touches mean a wider band and a stop placed further out.",
        },
        { type: "h2", text: "One band, with numbers (hypothetical)" },
        {
          type: "p",
          text: "Say a US name has traded a two-month box on the daily. The floor was tested three times, at 173.2, 171.9 and 172.6—within about 1.5% of each other—so the band draws as 171.8–174. The ceiling works out to 198–203 the same way. Price now sits at 186, dead center: chasing here buys the middle of the box, roughly 8% from resistance and 6% from support. No edge either way.",
        },
        {
          type: "p",
          text: "The plan waits for the edges. Suppose price returns to 174: entry band 174–177, invalidation 171.8 (a daily close below the floor kills the range thesis). From a 176 fill, risk per share is 4.2. Account 100,000, risk per trade 1.5% = 1,500, so size = 1,500 ÷ 4.2 ≈ 357 shares. Do not do that arithmetic at midnight—run /tools/position and copy the result into the plan tab: entry band, size, invalidation. Three fields, or it is not a plan.",
        },
        {
          type: "table",
          head: ["Plan item", "Value in this example", "Why this number"],
          rows: [
            ["Entry band", "174–177", "Upper half of the band; no bottom-fishing"],
            ["Invalidation", "171.8", "A daily close below the floor voids the thesis"],
            ["Alerts", "≤ 175 and ≥ 203", "Bound to the edges, not to wishes"],
            ["Review", "Weekly close", "Is the band still attracting reaction?"],
          ],
          caption:
            "All figures are hypothetical. Numbers existing before the fill matters more than the numbers being right.",
        },
        { type: "h2", text: "Bind alerts to the invalidation side" },
        {
          type: "p",
          text: "In /alerts set two: one at ≤ 175, meaning the band is near and the checklist reopens; one at ≤ 171.8, meaning the thesis is dead and you execute. Decide what each ping means before it fires. An alert bound to a wish price—say, ping me at 160 to buy the dip—hands you a bell with nothing prepared behind it.",
        },
        {
          type: "note",
          text: "On the symbol page, mark the band on the chart and copy the invalidation into the plan tab. AI chart read can list candidate levels, but where the band sits and why must be explainable in one sentence of yours. A line you cannot explain is decoration.",
        },
        { type: "h2", text: "When bands stop working" },
        {
          type: "p",
          text: "Gap opens, earnings prints and regime shifts can erase a two-month band in one session. That is not betrayal—it is the reason invalidation exists. Walk through the position-versus-band relationship before an event rather than being surprised after one. Retire levels that no longer attract reaction; a tattooed chart is a risk, not a résumé.",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Inventing a new line every session: it usually means there was never a plan to protect.",
            "Stops glued to the exact tick of the band: leave noise room—invalidation sits outside the band, not on it.",
            "Trusting the smaller timeframe in a conflict: when the daily band and a 15-minute scribble disagree, the daily wins.",
            "Treating round numbers as support: without a reaction record, an integer is a comfort zone, not a level.",
          ],
        },
        { type: "h2", text: "A 15-minute drill" },
        {
          type: "p",
          text: "Open /multi-chart and put two sector peers side by side: does the left chart's band edge have reaction history, or is the right one your private invention? Set two invalidation-side alerts on the left name and do nothing on the right. Run this for a month and most of your sudden opportunities will turn out to be impulses that never got drawn.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "打开一只你最近在盯的票，先别看指标。图上真正有用的第一层信息是参与：谁在哪接过盘，谁在哪压过价。支撑是买盘曾经接住卖压的地方，阻力是卖盘曾经盖住买盘的地方。价位不是画出来的，是被交易出来的。",
        },
        {
          type: "p",
          text: "一根细线显得精确，也容易卖自信。但市场交易的是区域：你说 172 是支撑，别人可能 174 就开始买了。差距本身没坏处，坏处是止损贴在一根线上，被一根影线扫掉。把线当成带子的中心——你能用一句话说清它是哪来的，它才算数。",
        },
        { type: "h2", text: "价位的三类原料" },
        {
          type: "p",
          text: "不是所有横线都值得画。有反应的触点才算数：影线打下去又收回，或者当天整根反转的 K 线，说明那个位置真的有人动手。光轻轻擦过一次、毫无下文的价位，证据太薄，只是传闻。",
        },
        {
          type: "table",
          head: ["原料", "怎么找", "可信度"],
          rows: [
            ["前期摆动高低点", "日线图上肉眼可见的拐头处", "最常用，趋势里反复有效"],
            ["箱体边缘", "多次到访却没穿过去的顶和底", "横盘期最可靠"],
            ["密集收盘区", "很多根 K 线的开收挤在同一窄带里", "更像磁场，减速但不保证反转"],
          ],
          caption: "原料决定带子的宽度：触点越散，带子越宽，止损就得放得越远。",
        },
        { type: "h2", text: "带数字画一遍（假设）" },
        {
          type: "p",
          text: "假设一只美股在日线箱体里晃了两个月：下沿试过三次，低点分别是 173.2、171.9、172.6，彼此差不到 1.5 个百分点，可以画成 171.8–174 的带子。上沿同理落在 198–203。价格现在 186，停在正中间——这时候进场等于买在盒子中央，离阻力约 8%，离支撑约 6%，两边都没便宜占。",
        },
        {
          type: "p",
          text: "计划应该等边缘。等价格回到 174 附近：买入区间 174–177，失效价 171.8（收盘跌破带子下沿，箱体论点作废）。按 176 买入算，每股风险 4.2。账户 10 万、单笔风险 1.5%，最大亏损 1500，仓位 = 1500 ÷ 4.2 ≈ 357 股。别在深夜口算——丢进 /tools/position 跑一遍，把结果抄进个股页的计划 Tab：买入区间、仓位、失效价，三栏写全才算计划。",
        },
        {
          type: "table",
          head: ["计划项", "本例取值", "为什么是这个数"],
          rows: [
            ["买入区间", "174–177", "带子上半段，不抄精确低点"],
            ["失效价", "171.8", "收盘跌破下沿，论点作废"],
            ["提醒", "≤ 175 与 ≥ 203", "贴着边缘设，不是许愿价"],
            ["复查", "每周收盘后", "带子还在引起反应吗"],
          ],
          caption: "全部数字均为假设。数字在成交之前存在，比数字本身准不准更重要。",
        },
        { type: "h2", text: "提醒绑在失效一侧" },
        {
          type: "p",
          text: "在 /alerts 给这只票设两条：一条 ≤ 175，含义是「带子近了，回去核清单」；一条 ≤ 171.8，含义是「论点死了，执行离场」。每条铃声的意思要事先定好。把提醒绑在许愿价上——比如「跌到 160 提醒我抄底」——铃声响起来的时候，你手里没有任何准备好的东西。",
        },
        {
          type: "note",
          text: "个股页的 K 线上直接标带子，把失效价抄进计划 Tab。AI 读图可以帮你列出候选价位，但带子画在哪、为什么，得你自己能用一句话说清。说不清的线就是装饰。",
        },
        { type: "h2", text: "带子什么时候失效" },
        {
          type: "p",
          text: "跳空、财报单、风格切换，可以一根 K 线抹掉一条带了两个月的带子。这不是带子背叛了你——这正是失效条件存在的原因。事件之前把仓位和带子的关系过一遍，比事后惊讶便宜得多。已经不再引起反应的线，删掉或退役；纹满历史的图是风险，不是资历。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "每个交易日新发明一根线：多半说明你从来没有一个需要保护的计划。",
            "止损贴在带子的精确价位上：留出噪音空间，失效在带外而不是带上。",
            "大小周期打架时听小的：日线带子和 15 分钟线冲突，先信日线。",
            "把整数关口当支撑：没有反应记录的整数，只是心理舒适区。",
          ],
        },
        { type: "h2", text: "十五分钟练习" },
        {
          type: "p",
          text: "打开 /multi-chart，把两只同板块的票并排放：左边那只的带子边缘有没有反应记录，右边那根是不是你自己发明的？给左边设两条失效侧提醒，右边什么都不做。练一个月你会发现，大部分「突然出现的机会」其实是从没画过图的冲动。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Are moving averages support?",
          a: "Sometimes they act as dynamic zones because enough people watch them. The bar stays the same: demand a reaction at the zone, rather than worship of the number itself.",
        },
        {
          q: "How wide should a band be?",
          a: "Wide enough to contain the wicks of its touches—often 1–2% on liquid names—and narrow enough that the stop distance still fits your risk budget. The touches decide, not your preference.",
        },
        {
          q: "Should I delete old levels?",
          a: "Retire whatever no longer attracts reaction. Two or three live levels beat a chart tattooed with history; clutter slows decisions exactly when speed matters.",
        },
        {
          q: "Do levels still work in a crash?",
          a: "News-driven sessions respect nothing. That is why invalidation is written before the event: on a gap day you execute the plan, you do not redraw it.",
        },
      ],
      "zh-CN": [
        {
          q: "均线算支撑吗？",
          a: "有时算动态区域，因为盯着的人够多。标准不变：要在那个位置看到反应，而不是膜拜数值本身。",
        },
        {
          q: "带子画多宽合适？",
          a: "宽到能罩住触点的影线——流动性好的票通常 1–2 个百分点——又窄到止损距离还装得进你的风险预算。宽度由触点决定，不由你的偏好决定。",
        },
        {
          q: "旧价位要删掉吗？",
          a: "不再引起反应的就退役。两三条活着的价位，胜过一张纹满历史的图；杂乱会在最需要决断的时刻拖慢你。",
        },
        {
          q: "暴跌的时候价位还有用吗？",
          a: "消息驱动的那几天什么都不认。所以失效条件要写在事件之前——跳空日你执行计划，而不是重新画计划。",
        },
      ],
    },
    links: {
      en: [
        { label: "Breakout or trap", href: "/learn/stocks-false-breakout" },
        { label: "Candles without over-reading", href: "/learn/kline-basics" },
        { label: "When to sell: three doors", href: "/learn/stocks-exit-rules" },
        { label: "Position sizing calculator", href: "/tools/position" },
        { label: "Watchlist and alerts", href: "/learn/watchlist-alerts" },
        { label: "Open Markets", href: "/markets" },
      ],
      "zh-CN": [
        { label: "真突破还是假突破", href: "/learn/stocks-false-breakout" },
        { label: "K 线怎么读", href: "/learn/kline-basics" },
        { label: "何时卖出：三扇门", href: "/learn/stocks-exit-rules" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "自选与提醒", href: "/learn/watchlist-alerts" },
        { label: "打开行情", href: "/markets" },
      ],
    },
    sourceNote: {
      en: "Educational. Levels are hypotheses until price reacts again; all example figures are hypothetical.",
      "zh-CN": "仅供学习。价位是假说，直到价格再次给出反应；示例中的数字均为假设。",
    },
  },
  {
    slug: "stocks-false-breakout",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Breakout or trap: five checks before you chase the close",
      "zh-CN": "真突破还是假突破：追收盘前的五次核对",
    },
    summary: {
      en: "A close beyond a level is a claim, not a verdict. Volume, context, close quality, retest behavior and a pre-written invalidation decide whether you participate.",
      "zh-CN":
        "收盘越过某价位是声明，不是判决。量能、位置语境、收盘质量、回踩表现和事先写好的失效，决定你参不参与。",
    },
    paragraphs: {
      en: [
        "The moment a close pokes above the range ceiling, group chats start posting rockets. Do nothing yet. A breakout is a claim—price left the old range—and whether it earns trend status depends on the next few sessions.",
        "False breakouts feel personal because the chart appears to have lied. Usually you paid for a certainty that was never for sale: you treated a probability question as a verdict.",
      ],
      "zh-CN": [
        "收盘越过箱体上沿的那一刻，群聊里通常已经开始发火箭表情。先别动。突破只是一个声明——价格离开了旧区间——它有没有资格变成趋势，要看之后几天的表现。",
        "假突破之所以让人恼火，是因为图看起来「骗」了你。其实多半是你为一份从未出售的确定性付了钱：把概率题当成了判断题。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "A breakout attempt is price leaving a prior range or level. A trap is when that excursion fails quickly and the trapped participants unwind—often straight back into the range. Your job is not to predict which label wins. It is to size only when your checklist clears, and to know in advance what a failed attempt costs you.",
        },
        { type: "h2", text: "Three kinds of excursion, three different jobs" },
        {
          type: "table",
          head: ["Pattern", "What it often means", "Reasonable action"],
          rows: [
            ["Expanding volume, close holds beyond the band", "More hands accepted the new price", "Wait for the retest, or probe small with a hard stop beyond the band"],
            ["Thin poke that closes back inside", "Probe or stop-run suspect", "Do nothing; let the daily close speak"],
            ["Next session engulfes the break in the opposite direction", "Trap unwind in progress", "Stand aside; keep the alert, delete the hope"],
          ],
          caption:
            "Only the first row deserves a written plan. The correct action in the other two is the one nobody posts about: nothing.",
        },
        { type: "h2", text: "Five checks before you chase" },
        {
          type: "p",
          text: "The checklist is short, but every item gets cleared before the buy button, not after:",
        },
        {
          type: "ul",
          items: [
            "Context: is the higher timeframe already extended, or is this the first clean leave?",
            "Participation: did the breakout candle trade at least 1.5x the average volume?",
            "Close quality: a long wick piercing beyond and closing back inside is a warning, not a trophy.",
            "Retest: durable breaks often retest the band as new support or resistance—plan the retest instead of FOMO-ing the first print.",
            "Invalidation: written before entry—a close back below the level means you were wrong, and by exactly how much.",
          ],
        },
        { type: "h2", text: "One pass with numbers (hypothetical)" },
        {
          type: "p",
          text: "Continue the box stock from the levels article: ceiling 198–203, and one day it closes at 205.8 on 1.9x the 20-day average volume, holding beyond the band into the close. Context clean, participation there, close acceptable. Now the invalidation: back below 202 and the breakout failed. Risk per share = 205.8 − 202 = 3.8.",
        },
        {
          type: "p",
          text: "Account 100,000, risk per trade 1% = 1,000, so size = 1,000 ÷ 3.8 ≈ 263 shares. The other side: extrapolating one box height puts the objective near 218, reward 12.2 per share, ratio about 3.2:1. The arithmetic looks good—on one condition, that you actually cut at 202. The one-line lesson of every false breakout: run all numbers on the stop you will execute, not the stop you hope to execute.",
        },
        {
          type: "table",
          head: ["Plan item", "Value in this example", "Note"],
          rows: [
            ["Trigger", "Daily close at 205.8 on volume", "Volume ≥ 1.5x the 20-day average"],
            ["Entry", "Scale in on the 203–204 retest", "Do not chase the first candle"],
            ["Invalidation", "Close back below 202", "Breakout thesis void"],
            ["Size", "≈ 263 shares (risk 1,000)", "Confirm via /tools/position first"],
          ],
          caption:
            "Hypothetical figures, process demo only. A retest entry and a chase entry carry different invalidation prices—never mix the two rulebooks.",
        },
        {
          type: "note",
          text: "AI chart read can list candidate bands and volume changes for you, but whether today counts as a breakout is decided by the rule you wrote yesterday. Paper the rule for a week in /portfolio—ten trades—before it touches real money.",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Chasing the intraday poke: an intraday break is not a breakout. Wait for the close, even if it costs you a few points.",
            "Thinking about the stop after the fill: invalidation first, size second. Reversed, it is not a trade, it is a bet.",
            "Refusing the retest out of fear: a pullback to the band's edge is often the better entry than the chase—provided the volume structure has not spoiled.",
          ],
        },
        { type: "h2", text: "After a false breakout" },
        {
          type: "p",
          text: "Getting stopped on a trap is not embarrassing; re-entering to get revenge is. After the unwind, the name often settles back into its range—where the box playbook from the levels article applies again. One false breakout costs you one planned unit of risk. Chasing it repeatedly is how an ordinary failure becomes a large one.",
        },
        { type: "h2", text: "A 15-minute drill" },
        {
          type: "p",
          text: "Pick any fresh breakout in /markets and grade it against the five checks, tick or cross. Do not trade it—drop it into /watchlist and follow it for a week. You will be surprised how many breakouts quietly shrink back inside by day three.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "突破尝试是价格离开旧区间或旧价位；陷阱是这次越界很快失败、被套的人回吐——常常直接跌回区间里。你的工作不是预言哪个标签会赢，而是只在清单通过时上仓，并且事先知道一次失败的尝试花多少钱。",
        },
        { type: "h2", text: "三种越界，三种应对" },
        {
          type: "table",
          head: ["形态", "常见含义", "合理动作"],
          rows: [
            ["放量越过带子，收盘站住", "更多人接受了新价格", "等回踩，或小仓试、硬止损放带外"],
            ["缩量刺破又收回区内", "试探或扫止损的嫌疑大", "什么都不做，等日线收盘说话"],
            ["次日反向大阴吞没突破", "陷阱盘回吐进行中", "旁观，提醒留着，希望删掉"],
          ],
          caption: "只有第一行值得写计划。另外两行的正确动作没人发朋友圈：不动。",
        },
        { type: "h2", text: "追进去之前的五次核对" },
        {
          type: "p",
          text: "清单不长，五条，但每一条都要在按买入之前过完，而不是之后：",
        },
        {
          type: "ul",
          items: [
            "语境：大周期是不是已经伸展开了，还是第一次干净离开？",
            "参与：突破那根 K 的量，有没有放大到二十日均量的一点五倍以上？",
            "收盘质量：长影线刺破又收回区内，是警告，不是战利品。",
            "回踩：站得住的突破常常回踩确认；计划回踩，而不是 FOMO 第一下。",
            "失效：进场前写好——收盘回到带内就是你错了，错多少钱也算得出来。",
          ],
        },
        { type: "h2", text: "带数字走一遍（假设）" },
        {
          type: "p",
          text: "接着上一篇那只箱体股：上沿 198–203，某天放量收在 205.8，量是二十日均量的 1.9 倍，日线收盘站住了。语境干净、参与够、收盘合格。轮到失效：回到 202 以下就算突破失败。每股风险 = 205.8 − 202 = 3.8。",
        },
        {
          type: "p",
          text: "账户 10 万、单笔风险 1% = 1000，仓位 = 1000 ÷ 3.8 ≈ 263 股。另一边按箱体高度外推一格，目标约 218，每股潜在盈利 12.2，盈亏比约 3.2:1。账面看着不错——前提是你真的会在 202 割。假突破教人的一句话：所有账都按你会执行的那个止损算，不是按你希望执行的算。",
        },
        {
          type: "table",
          head: ["计划项", "本例取值", "备注"],
          rows: [
            ["触发", "日线放量收在 205.8", "量 ≥ 二十日均量 1.5 倍"],
            ["买入", "回踩 203–204 分批", "不追第一根"],
            ["失效", "收盘回到 202 以下", "突破论点作废"],
            ["仓位", "约 263 股（风险 1000）", "先过 /tools/position 复核"],
          ],
          caption: "假设数字，仅作流程演示。回踩单和追价单的失效价不同，别把两套规则混着用。",
        },
        {
          type: "note",
          text: "AI 读图能帮你列出候选带子和量能变化，但今天算不算突破，由你昨天写好的规则决定。规则先在 /portfolio 用模拟盘练一周——十笔——再谈真仓。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "盘中破线就追：日内刺破不是突破。等收盘，哪怕为此错过几块钱。",
            "成交之后才想止损：先有失效再有仓位，顺序反了就不是交易，是赌。",
            "回踩不敢买：怕追高的人往往也怕回踩。只要量能结构没坏，带子上沿的回踩常比追价更好。",
          ],
        },
        { type: "h2", text: "假突破之后" },
        {
          type: "p",
          text: "被陷阱扫出来不丢人，丢人的是第二次冲进去报复。回吐之后，这只票常常回归区间震荡——那时候上一篇的箱体策略又适用了。一次假突破只花掉你计划内的一小笔风险；反复追，才会把一次普通的失败变成一次大的。",
        },
        { type: "h2", text: "十五分钟练习" },
        {
          type: "p",
          text: "在 /markets 随便挑一只刚突破的票，按五条核对逐条打钩或打叉。先别下单，把它丢进 /watchlist 跟一周。你会惊讶于多少「突破」第三天就自己安静地缩回去了。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Should I always wait for a retest?",
          a: "If your edge is patience, yes. If you trade momentum opens, define a different invalidation instead—just do not switch rulebooks mid-trade.",
        },
        {
          q: "Does volume really matter that much?",
          a: "It is the cheapest independent evidence you have. A break on 0.8x average volume is a question; a break on 2x with a held close is at least an answer.",
        },
        {
          q: "The breakout already ran 5% without me. Can I still enter?",
          a: "You can, but the trade is now different: further from the band means a wider stop or a smaller size, and the reward side has shrunk. Most of the time the honest answer is wait for the retest or skip it.",
        },
        {
          q: "How do I tell a trap early?",
          a: "You mostly cannot, in real time. What you can do is make the trap cheap: small size, hard stop beyond the band, and an alert at the invalidation so the exit does not depend on your mood.",
        },
      ],
      "zh-CN": [
        {
          q: "一定要等回踩吗？",
          a: "若你的优势是耐心，就等。若做动量开盘，另写一套失效——但不要盘中换规则书。",
        },
        {
          q: "量能真的那么重要吗？",
          a: "它是最便宜的独立证据。零点八倍均量的突破是个问句；两倍均量加收盘站住，至少算个回答。",
        },
        {
          q: "突破已经跑了 5%，我还能进吗？",
          a: "能进，但这已经是另一笔交易：离带子更远，止损更宽或仓位更小，盈利端却缩水了。多数时候诚实的答案是等回踩，或者不做。",
        },
        {
          q: "怎么提前识别陷阱？",
          a: "实时基本做不到。能做到的是让陷阱变得便宜：小仓、硬止损放带外、失效价挂提醒——离场不依赖你当下的情绪。",
        },
      ],
    },
    links: {
      en: [
        { label: "Support and resistance zones", href: "/learn/stocks-support-resistance" },
        { label: "When to sell: three doors", href: "/learn/stocks-exit-rules" },
        { label: "Workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Position sizing calculator", href: "/tools/position" },
        { label: "Risk-reward calculator", href: "/tools/risk-reward" },
        { label: "Watchlist and alerts", href: "/learn/watchlist-alerts" },
      ],
      "zh-CN": [
        { label: "支撑与阻力带子", href: "/learn/stocks-support-resistance" },
        { label: "何时卖出：三扇门", href: "/learn/stocks-exit-rules" },
        { label: "看盘闭环", href: "/learn/stocks-workbench-loop" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "风险回报计算器", href: "/tools/risk-reward" },
        { label: "自选与提醒", href: "/learn/watchlist-alerts" },
      ],
    },
    sourceNote: {
      en: "Educational. Breakout labels are usually after-the-fact; process before prediction. Example figures are hypothetical.",
      "zh-CN": "仅供学习。突破标签常是事后命名；流程先于预测。示例中的数字均为假设。",
    },
  },
];

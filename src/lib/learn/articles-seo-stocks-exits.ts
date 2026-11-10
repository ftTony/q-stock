import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/**
 * When to sell — inspired by classic “何时卖股票 / 止盈” lessons,
 * rewritten around invalidation + expectancy (not a fixed 20–25% slogan).
 */
export const LEARN_ARTICLES_SEO_STOCKS_EXITS: LearnArticle[] = [
  {
    slug: "stocks-exit-rules",
    category: "tools",
    ctaHref: "/tools/risk-reward",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "When to sell: invalidation first, targets second, slogans never",
      "zh-CN": "何时卖出：先失效，再目标，别背口号",
    },
    summary: {
      en: "Exits are contracts with yourself. A fixed percentage target can be a training wheel; without invalidation and expectancy it becomes a superstition.",
      "zh-CN":
        "卖出是跟自己签的合同。固定百分比目标可以当辅助轮；没有失效和期望值，它就会变成迷信。",
    },
    paragraphs: {
      en: [
        "Buying gets all the discussion, but the exit decides the equity curve. Most people carry only one exit: fear of giving back gains when up, refusal to look when down. Think of exits as three doors, each written before entry, and the picture changes.",
        "“Take 20–25% and move on” shows up in many classic playbooks. Sometimes it teaches discipline; sometimes it cuts winners that still fit the plan and keeps losers whose structure already broke. The problem with the slogan is not the number, it is the context it ignores.",
      ],
      "zh-CN": [
        "买入那一下被讨论得最多，但真正决定账户曲线的是卖出。多数人手里只有一种卖出：涨了怕回吐，跌了不敢看。把离场想成三扇门，每扇门在进场前就写好，局面会完全不一样。",
        "「涨 20%–25% 就走」在不少经典教程里出现。它有时教的是纪律，有时砍掉的是仍符合计划的赢家，留下的是结构已经坏了的输家。口号的问题不在数字，在于它不看语境。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Door A — invalidation: the structure or thesis you named at entry is broken. The level is lost, or the thesis fact failed. This door is mandatory. Door B — time: the catalyst window closed and price went nowhere. Door C — objective: a pre-written scale-out tied to risk multiples (R), not a round number borrowed from social media. Three doors, one order of authority: A overrules the other two.",
        },
        {
          type: "table",
          head: ["Door", "Trigger example", "Where in Q-Stock"],
          rows: [
            ["A · Invalidation", "Daily close beyond the plan band; earnings falsify the thesis", "Plan tab on the symbol page + alert in /alerts"],
            ["B · Time", "Event passed, price never confirmed", "Dated note in the plan; trim or exit on expiry"],
            ["C · Objective", "Scale out at +2R / +3R while structure holds", "Set with /tools/risk-reward before entry"],
          ],
          caption:
            "When Door A opens, do not negotiate with Door C. Hope is not a hedge.",
        },
        {
          type: "p",
          text: "Door A is mandatory. The sentence you wrote at entry—“a close below X means I am wrong”—is the hinge of that door. Whether it opens is decided by the market, not by your cost basis. Whether you bought at 45 or 50 means nothing to the tape.",
        },
        { type: "h2", text: "Why a fixed percentage alone is incomplete" },
        {
          type: "ul",
          items: [
            "Volatility differs: 20% on a sleepy utility is about one candle on a high-beta name.",
            "Expectancy reads the loss side too: a +25% target with a −30% average loss is a different machine.",
            "It answers nothing about time: three flat months of opportunity cost are outside the slogan's jurisdiction.",
          ],
        },
        { type: "h2", text: "One pass with numbers (hypothetical)" },
        {
          type: "p",
          text: "Account 100,000, risk per trade 1% = 1,000. Entry 50, invalidation 47.4, risk per share 2.6, size = 1,000 ÷ 2.6 ≈ 384 shares. Door C written in R-multiples: +1R is 52.6—bank one third there and lift the stop on the remainder above cost, at which point the trade can no longer lose money. +3R is 57.8—bank another third if structure still holds, and trail the rest behind the rising band.",
        },
        {
          type: "p",
          text: "Notice what Door C is anchored to: R, the risk you actually took, not a percentage. The same “+3R” rule adapts itself across names with different volatility—which is exactly what a fixed percentage cannot do. Do not compute R in your head; four numbers into /tools/risk-reward and it is done.",
        },
        {
          type: "table",
          head: ["Price", "Meaning", "Action"],
          rows: [
            ["47.4", "Door A · invalidation", "Exit everything; loss ≈ 1,000"],
            ["52.6", "+1R", "Sell one third; stop to breakeven on the rest"],
            ["57.8", "+3R", "Sell another third; trail the remainder"],
            ["Flat for 6 weeks", "Door B · time", "Cut half unconditionally"],
          ],
          caption:
            "Four lines and every exit of this trade exists before the fill. All figures hypothetical.",
        },
        {
          type: "note",
          text: "All three doors go into the plan tab before entry. An exit plan written after the fill is, most of the time, an alibi for the mood of that moment—and the review page makes such additions easy to spot.",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Door A opens and you go check the news instead: bad news explains everything but does not repair the band.",
            "Scaling out without written fractions: “sell a bit as it rises” reliably degenerates into “sell everything out of fear.”",
            "Using Door C reasoning to keep Door A shut: “give it a little room”—that room is a fresh, unplanned risk exposure.",
          ],
        },
        { type: "h2", text: "How the sale gets written into the plan" },
        {
          type: "p",
          text: "The plan tab on the symbol page has four fields: entry band, size, invalidation, target. Field three is Door A, field four is Door C, and Door B lives in the notes with a date. Set the matching alerts in /alerts and you are done in about fifteen minutes—after that, holding the position is execution, not a fresh decision on every candle.",
        },
        { type: "h2", text: "Paper ten trades through the three doors" },
        {
          type: "p",
          text: "Open simulated positions in /portfolio, run ten trades with all three doors active, then go through them in /review one by one: was each exit rule-triggered or mood-triggered? The answer will look worse than you expect, and the ugly trades are precisely the ones to fix.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "门 A——失效：你进场时点名的结构或论点坏了。价位失守，或者论点里的事实被证伪。这扇门是强制的。门 B——时间：催化剂窗口关了，价格却没反应。门 C——目标：按风险倍数（R）事先写好的减仓点，不是从社交网络借来的整数口号。三扇门有个权威顺序：A 压过另外两扇。",
        },
        {
          type: "table",
          head: ["门", "触发例子", "钱力股里去哪做"],
          rows: [
            ["A · 失效", "收盘越过计划带子；财报证伪论点", "个股页计划 Tab 写失效价 + /alerts 挂提醒"],
            ["B · 时间", "事件过了，价格没确认", "计划里记带日期的备注，到期减仓或清仓"],
            ["C · 目标", "结构仍好时按 +2R / +3R 分批兑现", "进场前用 /tools/risk-reward 定好"],
          ],
          caption: "门 A 开了，就不要跟门 C 讨价还价。希望不是对冲。",
        },
        {
          type: "p",
          text: "门 A 是强制的。你进场时写的那句「收盘跌破 X 就是我错了」，就是这扇门的门轴。它开不开，由市场决定，不由你的成本决定——你买在 45 还是 50，对盘面毫无意义。",
        },
        { type: "h2", text: "为什么固定百分比不够" },
        {
          type: "ul",
          items: [
            "波动不同：沉闷公用事业股的 20%，差不多是高弹性票一根 K 线的事。",
            "期望值要看亏损一侧：目标 +25%、平均亏 −30%，是另一台机器。",
            "它回答不了时间问题：横盘三个月的机会成本，不在口号的管辖范围。",
          ],
        },
        { type: "h2", text: "带数字走一遍（假设）" },
        {
          type: "p",
          text: "账户 10 万，单笔风险 1% = 1000。入场 50、失效 47.4，每股风险 2.6，仓位 = 1000 ÷ 2.6 ≈ 384 股。门 C 按 R 倍数写：+1R 是 52.6，先兑现三分之一，把剩余仓位的止损提到成本上方——从这一刻起这笔交易已经不可能亏钱。+3R 是 57.8，结构仍好就再兑现三分之一，最后一截用抬高的带子跟踪。",
        },
        {
          type: "p",
          text: "注意门 C 锚的是什么：R，你实际承担的风险，不是百分比。同一条「+3R」规则自动适应不同波动的票——这正是固定百分比做不到的。R 别口算，四个数填进 /tools/risk-reward 就出来了。",
        },
        {
          type: "table",
          head: ["价位", "含义", "动作"],
          rows: [
            ["47.4", "门 A · 失效", "全部离场，亏损约 1000"],
            ["52.6", "+1R", "兑现三分之一，剩余止损上移到成本"],
            ["57.8", "+3R", "再兑现三分之一，余下跟踪"],
            ["横盘满 6 周", "门 B · 时间", "无条件减仓一半"],
          ],
          caption: "四行写完，这笔交易的所有出口在成交之前就存在了。示例数字均为假设。",
        },
        {
          type: "note",
          text: "三扇门都要在进场前写进计划 Tab。成交之后补写的离场计划，多半是在给当时的情绪找说法——复盘页上这种「补充」一眼就能看出来。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "门 A 开了却改去核对新闻：坏消息可以解释一切，但不会把带子补回来。",
            "分批没写比例：「涨一点卖一点」执行起来多半变成「怕了就全卖」。",
            "用门 C 的理由让门 A 一直关着：「再给它一点空间」——那个空间就是一笔新的、没有计划的风险敞口。",
          ],
        },
        { type: "h2", text: "卖出怎么写进计划" },
        {
          type: "p",
          text: "个股页计划 Tab 一共四栏：买入区间、仓位、失效价、目标。第三栏是门 A，第四栏是门 C，门 B 写在备注里带日期。再到 /alerts 设对应提醒。十五分钟搞定，换来的是持仓期间你只需要执行，不用每根 K 线重新做一次决定。",
        },
        { type: "h2", text: "用模拟盘把三扇门练十笔" },
        {
          type: "p",
          text: "在 /portfolio 开模拟仓，三扇门全开地跑十笔，再到 /review 逐笔回看：离场是规则触发的，还是情绪触发的？答案通常比你预期的难看，而难看的那几笔正是要改的地方。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is a 20–25% rule wrong?",
          a: "As a training constraint it can help. As the only exit logic it ignores volatility, time and invalidation. R-multiples plus Door A generalize far better.",
        },
        {
          q: "Where should the stop go—exactly?",
          a: "Beyond the structure that defines your thesis, with room for noise. On a band, outside the band. Never at a distance chosen to maximize position size.",
        },
        {
          q: "What if I sell and it keeps running?",
          a: "It will happen, often. A rule-based exit that occasionally leaves money on the table still beats a mood-based one that occasionally loses the account. Missing upside is a cost of the system, not a bug in it.",
        },
        {
          q: "Should the whole position exit at once?",
          a: "Not necessarily. Bank a slice at +1R to cut risk, trail the rest behind structure. The fractions get written before entry, though—improvised scaling is where discipline leaks.",
        },
      ],
      "zh-CN": [
        {
          q: "20%–25% 规则是错的吗？",
          a: "当训练约束可以用。当唯一离场逻辑，它无视波动、时间和失效。R 倍数加门 A 的适用面宽得多。",
        },
        {
          q: "止损到底放哪？",
          a: "放在定义你论点的那个结构之外，留出噪音空间。带子之外，不是带上。永远不要为了让仓位算大一点而挑止损距离。",
        },
        {
          q: "卖飞了怎么办？",
          a: "会经常发生。规则化的离场偶尔留下桌上钱，仍然好过情绪化离场偶尔亏掉账户。错过上行是系统的成本，不是系统的故障。",
        },
        {
          q: "一定要一次性全卖吗？",
          a: "不必。+1R 先兑现一截降低风险，剩余用结构跟踪。但比例要进场前写好——临场发挥的分批，正是纪律漏水的地方。",
        },
      ],
    },
    links: {
      en: [
        { label: "Risk, reward, expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "Workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Paper and review", href: "/learn/paper-review" },
        { label: "Risk-reward calculator", href: "/tools/risk-reward" },
        { label: "Position sizing calculator", href: "/tools/position" },
        { label: "Review page", href: "/review" },
      ],
      "zh-CN": [
        { label: "风险回报与期望值", href: "/learn/risk-reward-expectancy" },
        { label: "看盘闭环", href: "/learn/stocks-workbench-loop" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
        { label: "风险回报计算器", href: "/tools/risk-reward" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "复盘页", href: "/review" },
      ],
    },
    sourceNote: {
      en: "Educational. No percentage guarantees anything; design the exits before the size. Example figures are hypothetical.",
      "zh-CN": "仅供学习。没有任何百分比能保证什么；上仓之前先设计离场。示例中的数字均为假设。",
    },
  },
];

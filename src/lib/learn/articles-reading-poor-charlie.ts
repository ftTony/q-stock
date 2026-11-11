import type { LearnArticle } from "@/lib/learn/types";

/**
 * Guide to Poor Charlie's Almanack — Munger's craft distilled to
 * inversion, circle of competence, mental models and sitting still,
 * each mapped to a trap it defuses. Paraphrased ideas, no long quotes.
 */
export const LEARN_ARTICLE_POOR_CHARLIE: LearnArticle = {
  slug: "book-poor-charlie-almanack",
  category: "reading",
  ctaHref: "/learn/money-traps-small-capital",
  author: "钱力股研究组",
  publishedAt: "2026-11-11",
  updatedAt: "2026-11-11",
  title: {
    en: "Guide: Poor Charlie's Almanack — the useful half is about avoiding",
    "zh-CN": "导读：《穷查理宝典》——有用的那一半都在讲避开",
  },
  summary: {
    en: "Munger's book is not a method for getting rich fast; it is a manual for not being stupid. Invert, stay inside the circle, borrow models from other disciplines, sit still—and each idea defuses a specific trap that eats small accounts.",
    "zh-CN":
      "芒格这本书不教赚快钱，教的是不蠢。反过来想、守住能力圈、借别的学科的模型、坐得住——每一个启发都对应一个正在吃掉小账户的具体坑。",
  },
  paragraphs: {
    en: [
      "Poor Charlie's Almanack is thick with biography and speeches, but the working core fits one sentence: rather than asking how to win, first list how you lose—then refuse to do those things. This guide distills the usable ideas and, for each one, names the trap it was designed to stop.",
    ],
    "zh-CN": [
      "《穷查理宝典》一半是传记和演讲，字多。但真正干活的核心可以压成一句话：与其问怎么赢，先列清楚自己会怎么输——然后拒绝做那些事。这篇导读把书里用得上的部分拧干，每一条启发都标出它对应的坑。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "A warning up front: the book rewards patience, not speed. It will not tell you what to buy next month. What it will do is quietly raise the floor of every decision you make—by removing the ways you can fall through it.",
      },
      { type: "h2", text: "Idea one: invert, always invert" },
      {
        type: "p",
        text: "Most people ask: how do I make 20% a year? The useful question runs the other way: how would I lose 30%? And that list is embarrassingly concrete—borrow at 13% to buy assets, go all-in on one story, chase what just moved, buy things a stranger on a screen is shouting about. Avoid the four items on the losing list and whatever remains drifts closer to positive returns for free. You did not get smarter; you just stopped donating.",
      },
      {
        type: "table",
        head: ["The forward question", "The inverted question", "Which one produces action today"],
        rows: [
          ["Which stock doubles this year?", "What would make me lose 30%?", "The second—you can act on it by deleting behaviors"],
          ["How do I time this entry?", "What position size survives me being wrong?", "The second—run it through /tools/position"],
          ["Who predicts the market best?", "Which predictions are unfalsifiable anyway?", "The second—ignore them and save the fee"],
        ],
        caption:
          "The forward questions feel smarter. The inverted ones are the only ones with an executable answer this week.",
      },
      { type: "h2", text: "Idea two: the circle of competence is about the edge, not the size" },
      {
        type: "p",
        text: "A huge circle with fuzzy borders is worse than a small one you can see. Three questions mark the border: How does this business actually make money? Who will still pay for it in ten years? Could I explain why the seller is willing to sell to me? Any silence on those, and you are outside the circle—no matter how good the chart looks. Note what this is not: not a ban on learning. The circle expands, one verified company at a time; the financials and peer-compare pages on this site are expansion tools, and the AI chart read is scaffolding for structure—not a shortcut past the border.",
      },
      {
        type: "p",
        text: "The trap this defuses: copying trades. Buying what a group bought works until it falls 20% and you have no idea whether that is the opportunity or the end. Without your own thesis you cannot hold winners or cut losers on schedule—you are renting convictions from whoever posted last.",
      },
      { type: "h2", text: "Idea three: borrow models from other disciplines" },
      {
        type: "p",
        text: "One lens distorts; a lattice of lenses reveals. Munger's habit: carry a few working models from physics, biology, economics, psychology, and apply several to one decision. You do not need forty. Four will change most of your decisions:",
      },
      {
        type: "ul",
        items: [
          "Compounding — most of the return arrives in the last years; quitting early spends the tail (test any promise in /tools/compound).",
          "Incentive bias — before believing an explanation, check who gets paid if you believe it: fund managers push high-fee products for reasons that have nothing to do with your returns.",
          "Opportunity cost — every position owns capital that could sit in an index instead; 'it might go up' is not a case against cash.",
          "Mean reversion — things that got extreme tend to get ordinary; the growth rate that cannot persist is the one being priced.",
        ],
      },
      { type: "h2", text: "Idea four: sit on your hands" },
      {
        type: "p",
        text: "Munger's phrase for it is blunter, but the substance is: big money is in the waiting, not the trading. Frequent switching pays a meter you never see—0.15% round-trip per full switch is about 1.8% a year if you rotate monthly, on top of every mistake the extra decisions invite. The patience frame is watchlist-based: keep a short list, define the level where you would act, set alerts at the invalidation, then do nothing until the market comes to you. Q-Stock's /watchlist and /alerts are exactly this discipline wearing software.",
      },
      { type: "h2", text: "Idea five: envy is the most expensive emotion in the room" },
      {
        type: "p",
        text: "Someone will always have doubled their account this year—always. Envy reads that as evidence you are behind, and pushes you out of your circle toward leverage, hot sectors, and strangers' portfolios. Munger's answer is unglamorous: the goal is to be sensible, not to win any particular year. Wealth is the process plus the absence of catastrophe, which is why the traps page on this site reads like a negative image of this book.",
      },
      { type: "h2", text: "The traps, matched to their antidotes" },
      {
        type: "table",
        head: ["Trap", "How it eats you", "The Munger move"],
        rows: [
          ["The guru forecast", "Macro predictions are unfalsifiable and crowd-sourced; you reposition on them anyway", "Ignore the forecast, size for being wrong"],
          ["Copying trades", "No thesis → cannot hold or cut → rents conviction", "Circle-of-competence three questions before any buy"],
          ["Complexity worship", "Stacked structures you cannot explain in one sentence", "If you cannot explain the worst case, skip it"],
          ["Screen addiction", "Fees plus decisions plus fatigue", "Alerts at invalidation levels; do nothing otherwise"],
          ["Envy-driven pivots", "Chasing last year's winner out of your circle", "Reread your own plan; envy is a signal, not a strategy"],
        ],
        caption:
          "Notice the pattern: none of the antidotes requires being smart. All of them require refusing something.",
      },
      { type: "h2", text: "How to read the book without wasting a month" },
      {
        type: "p",
        text: "Skip the biography on the first pass. Read the talks on psychology and misjudgment, then the talks on investing craft. After each talk, close the book and write one guardrail you can actually enforce—'no new position without answering the three questions', 'no borrowing above 8%', 'alerts before screens'. A guardrail you write beats a highlight you mark. And reread nothing until your review page shows you actually enforced the first round.",
      },
      {
        type: "note",
        text: "Pair it with our trap-avoidance article for the arithmetic, and with Thinking, Fast and Slow for the psychology underneath. The three books disagree about nothing—they cover different floors of the same building.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "先给一句提醒：这本书奖励的是耐心，不是速度。它不会告诉你下个月买什么。它能做的，是把你每一个决策的下限悄悄抬高——办法是把所有「掉下去」的洞先指给你看。",
      },
      { type: "h2", text: "启发一：反过来想，总是反过来想" },
      {
        type: "p",
        text: "大多数人问：怎么才能一年赚 20%？有用的问法是反的：我会怎么亏掉 30%？而这个清单具体得让人不好意思——借 13% 的钱买资产、在一个故事上 all-in、追刚刚涨过的东西、买屏幕里陌生人喊的东西。把亏钱清单上的四条划掉，剩下的路自动更接近正收益。你没有变聪明，只是不再捐款了。",
      },
      {
        type: "table",
        head: ["正着问", "反着问", "哪个今天就能行动"],
        rows: [
          ["哪只股票今年翻倍？", "什么会让我亏 30%？", "后者——靠删掉行为就能执行"],
          ["怎么择时入场？", "多大的仓位能扛住我看错？", "后者——丢进 /tools/position 就有数"],
          ["谁的预测最准？", "哪些预测本来就不可验证？", "后者——直接忽略，省下注意力"],
        ],
        caption: "正着问的问题显得更聪明；反着问的问题是唯一本周就能给出答案的。",
      },
      { type: "h2", text: "启发二：能力圈的重点是边界，不是面积" },
      {
        type: "p",
        text: "一个很大但边界模糊的圈，不如一个很小但看得清的圈。三个问题画出边界：这门生意到底怎么赚钱？十年后谁还会为它付钱？我能不能说清对方为什么愿意卖给我？任何一条答不上来，你就在圈外——不管图多好看。注意这不是禁止学习：圈可以一块一块扩大，本站的财报页和同业对比就是扩圈工具，AI 读图是搭结构的脚手架——不是绕过边界的捷径。",
      },
      {
        type: "p",
        text: "这条启发对应的坑：抄作业。跟着群里买，涨的时候还行，跌 20% 你根本判断不了这是机会还是终点。没有自己的论点，你既拿不住赢家，也砍不动输家——你的信念是从上一个发帖的人那里租来的。",
      },
      { type: "h2", text: "启发三：从别的学科借模型" },
      {
        type: "p",
        text: "一个镜片会扭曲，一组镜片互相校准。芒格的习惯是从物理、生物、经济、心理学里各搬几个能用的模型，对着同一个决策多角度照。你不需要四十个，四个就能改变大部分决策：",
      },
      {
        type: "ul",
        items: [
          "复利——大部分收益在最后几年到账，提前下车等于把尾巴扔了（任何承诺先在 /tools/compound 里验）。",
          "激励偏差——听解释之前先看谁付工资：基金经理推高费率产品，动机和你的收益无关。",
          "机会成本——每一个仓位都占着本可以放在指数里的钱；「可能会涨」不是现金的反方论据。",
          "均值回归——走极端的东西会变平常；那个不可能持续的增速，恰恰是被定价的那个。",
        ],
      },
      { type: "h2", text: "启发四：坐等，别乱动" },
      {
        type: "p",
        text: "芒格的说法更糙，意思是：大钱在等待里，不在交易里。频繁换手有个你看不见的计价器——每月一次全仓换手，往返 0.15% 就是一年 1.8%，还没算多出来的每个决策邀请的错误。把「坐等」工具化：自选清单只留几个名字，写清楚到什么价位才动手，把失效价绑进提醒，然后什么都不做，等市场来找你。钱力股的 /watchlist 和 /alerts 就是这套纪律穿了软件的外衣。",
      },
      { type: "h2", text: "启发五：嫉妒是全场最贵的情绪" },
      {
        type: "p",
        text: "总有人今年账户翻倍——永远有。嫉妒会把这当成「你落后了」的证据，把你推出能力圈，推向杠杆、热点和别人的组合。芒格的答案不性感：目标是活得合理，不是赢下每一年。财富是过程加上不发生灾难，这也是为什么本站的避坑篇读起来像这本书的负片。",
      },
      { type: "h2", text: "把坑和解药对齐" },
      {
        type: "table",
        head: ["坑", "它怎么吃你", "芒格式解药"],
        rows: [
          ["大师预测", "宏观预测不可验证还自带流量，你却照着调仓", "不看预测，按「自己会错」来定仓位"],
          ["抄作业", "没有论点 → 拿不住也砍不动 → 信念靠租", "任何买入前先过能力圈三问"],
          ["崇拜复杂", "堆到一句话讲不清的结构", "讲不清最坏情形，直接跳过"],
          ["盯盘成瘾", "手续费 + 决策疲劳双收费", "失效价绑提醒，其余时间什么都不做"],
          ["嫉妒式转向", "追去年赢家，一路追出能力圈", "重读自己的计划；嫉妒是信号，不是策略"],
        ],
        caption: "注意规律：这些解药没有一条需要你更聪明，每一条都只需要你拒绝做某件事。",
      },
      { type: "h2", text: "怎么读这本书才不浪费一个月" },
      {
        type: "p",
        text: "第一遍跳过传记。先读谈心理误判的讲稿，再读谈投资手艺的。每读完一篇，合上书，写一条你真的能执行的护栏——「没有回答三问之前不开新仓」「利率 8% 以上的债先还清」「先绑提醒再看屏幕」。一条自己写下的护栏，胜过十处划线高亮。复盘页显示你真的执行了第一轮之前，别急着重读。",
      },
      {
        type: "note",
        text: "搭配本站的避坑篇看算术，搭配《思考，快与慢》导读看心理机制。三本书不冲突——它们是同一栋楼的不同楼层。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Is this book suitable for beginners?",
        a: "As a second or third book, yes—after behavior and indexing basics. Reading it first mostly yields quotes. The talks on misjudgment and craft are the high-yield chapters; biography can wait.",
      },
      {
        q: "How many mental models do I actually need?",
        a: "Fewer than you think. Four working models—compounding, incentives, opportunity cost, mean reversion—cover most retail decisions. Add models only when a real decision exposes a gap.",
      },
      {
        q: "How do I turn 'invert' into an actual routine?",
        a: "Before any entry, write down three concrete ways this trade loses 30%, then verify none of them is present: no borrowed money above 8%, no single position that ends the game, no thesis you cannot state in one sentence.",
      },
      {
        q: "Can Munger's views serve as buy reasons?",
        a: "No. His frameworks filter decisions; they do not pick symbols. If a purchase depends on borrowed conviction, the circle-of-competence questions will flag it immediately.",
      },
    ],
    "zh-CN": [
      {
        q: "这本书适合新手吗？",
        a: "作为第二或第三本合适——先建立行为与指数基础再读。当第一本读，多半只收获金句。误判心理和投资手艺相关讲稿是高收益章节，传记可以放后面。",
      },
      {
        q: "多元思维模型到底要学多少个？",
        a: "比你想的少。复利、激励、机会成本、均值回归四个模型就能覆盖大部分散户决策；等真实决策暴露了缺口，再补下一个。",
      },
      {
        q: "「反过来想」怎么落成动作？",
        a: "每次开仓前，写下这笔交易亏 30% 的三种具体方式，再逐条核对：没有 8% 以上的借款、没有大到能终结游戏的单笔、没有一句话讲不清的论点。",
      },
      {
        q: "芒格的观点能直接当买入理由吗？",
        a: "不能。他的框架是过滤器，不是选股器。如果一笔买入靠的是租来的信念，能力圈三问会当场把它标出来。",
      },
    ],
  },
  links: {
    en: [
      { label: "Traps to dodge with small capital", href: "/learn/money-traps-small-capital" },
      { label: "Guide: Thinking, Fast and Slow", href: "/learn/book-thinking-fast-slow" },
      { label: "100k→1M vs 1M→10M", href: "/learn/wealth-stages-100k-10m" },
      { label: "The three-question checklist", href: "/learn/checklist-three" },
      { label: "Compound calculator", href: "/tools/compound" },
      { label: "Picking order: fundamentals → location", href: "/learn/stock-picking-steps" },
    ],
    "zh-CN": [
      { label: "本金少，先避开这些坑", href: "/learn/money-traps-small-capital" },
      { label: "导读：《思考，快与慢》", href: "/learn/book-thinking-fast-slow" },
      { label: "10 万与 1000 万：两个阶段", href: "/learn/wealth-stages-100k-10m" },
      { label: "复盘三问清单", href: "/learn/checklist-three" },
      { label: "复利计算器", href: "/tools/compound" },
      { label: "选股顺序：基本面→位置", href: "/learn/stock-picking-steps" },
    ],
  },
  sourceNote: {
    en: "Educational book guide. Ideas are paraphrased from the author's public talks and essays; examples are hypothetical. Not investment advice.",
    "zh-CN": "教学导读。书中观点以转述为主，示例均为假设。不构成投资建议。",
  },
};

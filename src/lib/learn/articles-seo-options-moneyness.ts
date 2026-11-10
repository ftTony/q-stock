import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Classic: ITM / ATM / OTM — “价内 vs 价外”, rewritten for Q-Stock. */
export const LEARN_ARTICLES_SEO_OPTIONS_MONEYNESS: LearnArticle[] = [
  {
    slug: "options-moneyness-itm-otm",
    category: "basics",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "ITM, ATM, OTM: which strike is actually buying leverage",
      "zh-CN": "价内、平值、价外：你买的到底是保险，还是杠杆彩票",
    },
    summary: {
      en: "Same ticker, same expiry, three strikes — three different instruments. Moneyness decides how much of the premium is already real and how far your break-even sits.",
      "zh-CN":
        "同一只股票、同一个到期日，三个行权价是三种工具。价值状态决定权利金里有多少已经是「真的」，也决定你的盈亏平衡有多远。",
    },
    paragraphs: {
      en: [
        "People argue about cheap options. Usually they are comparing different moneyness without saying so.",
        "Read the spot–strike gap first; the rest of the chain makes more sense after that.",
      ],
      "zh-CN": [
        "很多人吵「哪张期权便宜」。多半是在比不同的价值状态，却没把话说破。",
        "先读现价和行权价的差距，整条期权链会清楚很多。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "For a call: spot above strike is in-the-money (ITM), spot near strike is at-the-money (ATM), spot below is out-of-the-money (OTM). Puts flip the inequalities. The label answers one question directly: does this contract already carry intrinsic value — the part of the premium that is real, right now.",
        },
        {
          type: "p",
          text: "In Q-Stock, open a US symbol and switch to Options. Pick an expiry, then scan the strike band around spot — that band is where ATM lives. The chain marks every row with its quote and Greeks; clicking one seeds the strategy drawer.",
        },
        { type: "h2", text: "What each label feels like, and how it gets misused" },
        {
          type: "table",
          head: ["Label", "Intrinsic value", "Typical feel", "Common misuse"],
          rows: [
            [
              "ITM",
              "Yes",
              "Stock-like, higher delta, thicker premium",
              "Treated as safe — time value still sits on top",
            ],
            [
              "ATM",
              "≈ 0",
              "Most responsive to the next move; often the richest time value",
              "Ignoring that two ATM weeklies can carry very different IV",
            ],
            [
              "OTM",
              "0",
              "Lottery-ticket leverage; quote is mostly time + vol",
              "Chasing the smallest ticket and needing an extreme print",
            ],
          ],
          caption:
            "OTM is not better value just because the ticket is small. The break-even is simply farther away.",
        },
        { type: "h2", text: "One example, three strikes" },
        {
          type: "p",
          text: "Assume a stock at 100, 30 days out, and a flat IV of 40% (all figures hypothetical). Three calls on the same expiry quote like this: the 90 call at 11.20 — intrinsic 10.00, time value 1.20; the 100 call at 3.40 — all time value; the 110 call at 1.10 — also all time value. Deltas run roughly 0.75 / 0.50 / 0.25. Break-evens: 101.2, 103.4, 111.2. The ITM ticket needs a 1.2% rally to break even; the OTM ticket needs 11.2%.",
        },
        {
          type: "table",
          head: ["Strike", "Mid", "Intrinsic", "Time value", "Break-even", "Rally needed"],
          rows: [
            ["90 (ITM)", "11.20", "10.00", "1.20", "101.2", "1.2%"],
            ["100 (ATM)", "3.40", "0", "3.40", "103.4", "3.4%"],
            ["110 (OTM)", "1.10", "0", "1.10", "111.2", "11.2%"],
          ],
          caption:
            "Same stock, same expiry. The cheap 110 ticket is not a bargain — it is a different bet on a rarer outcome.",
        },
        {
          type: "p",
          text: "Note what the table does not say: that any strike is correct. It says the three rows are different instruments. Buying the 110 call because it costs 110 instead of 340 is comparing tickets, not comparing trades.",
        },
        { type: "h2", text: "When each label tends to fit" },
        {
          type: "p",
          text: "ITM when you want stock-like exposure with a defined debit and less decay drag. ATM when the thesis is a move soon and you accept paying for gamma. OTM only when you are explicitly buying a tail — and the plan should state how large a move you need before expiry. If you cannot write that number down, you are not buying a tail, you are buying a feeling.",
        },
        {
          type: "ul",
          items: [
            "Pick the expiry first, then scan strikes around spot.",
            "ITM calls: mid should sit close to intrinsic; the gap is time value, and it decays.",
            "Deep OTM with a fat bid–ask is often untradeable no matter how pretty the mid looks.",
          ],
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Judging by sticker price: the 1.10 ticket demands an 11.2% move; the 3.40 ticket demands 3.4%. Decide which outcome you are underwriting.",
            "Calling ITM safe: an ITM call still bleeds its time value, and if the stock gives back the move, you can lose a multiple of what an OTM buyer lost.",
            "Forgetting puts flip: a put above the strike is OTM. Newcomers mix this up on down days and buy the wrong side of the chain.",
          ],
        },
        {
          type: "note",
          text: "In the Q-Stock drawer, the risk summary and ±σ table follow the strike you actually loaded. Switch from ATM to far OTM and the scenario column can flatten to a single line: lose the premium. That is the product telling you what you just bought.",
        },
        { type: "h2", text: "Where delta takes over" },
        {
          type: "p",
          text: "Moneyness has a numeric face: delta. ITM leans toward 1, ATM sits near half, OTM leans toward 0 — which is why the three strikes above moved 0.75 / 0.50 / 0.25. The next article in this series takes those numbers and shows what they do to your P&L on a live day. Until then, keep using the calculator at /tools/options to re-run the example with your own quotes instead of trusting the hypotheticals here.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "看涨：现价高于行权价是价内（ITM），贴着是平值（ATM），低于是价外（OTM）。看跌把不等式反过来。这个标签直接回答一个问题：合约里现在有没有内在价值——权利金里「已经是真的」的那部分。",
        },
        {
          type: "p",
          text: "在钱力股里，打开美股标的切到「期权」，先选到期日，再扫现价附近的行权价带——那一带就是平值住的地方。链上每行有报价和希腊字母，点一行就带出策略抽屉。",
        },
        { type: "h2", text: "三档的体感，以及怎么被用错" },
        {
          type: "table",
          head: ["标签", "内在价值", "体感", "常见误用"],
          rows: [
            ["价内", "有", "更像股票，Delta 更高，权利金更厚", "当成「安全」——上面照样叠着时间价值"],
            ["平值", "≈ 0", "对下一步波动最敏感，时间价值常常最贵", "忽略两张平值周期权的 IV 可以差很远"],
            ["价外", "无", "彩票式杠杆；报价几乎全是时间 + 波动", "只图票面小，却要极端行情才打平"],
          ],
          caption: "价外不会因为票面小就更划算，只是盈亏平衡更远。",
        },
        { type: "h2", text: "一次算清楚三档" },
        {
          type: "p",
          text: "假设某股现价 100，剩 30 天，IV 平坦地取 40%（数字均为假设）。同一到期的三张 Call 这样报价：90 Call 报 11.20，其中内在 10.00、时间 1.20；100 Call 报 3.40，全是时间价值；110 Call 报 1.10，也全是时间价值。Delta 大致 0.75 / 0.50 / 0.25。盈亏平衡分别落在 101.2、103.4、111.2——价内那张涨 1.2% 就打平，价外那张要涨 11.2%。",
        },
        {
          type: "table",
          head: ["行权价", "中间价", "内在", "时间价值", "盈亏平衡", "需涨幅"],
          rows: [
            ["90（价内）", "11.20", "10.00", "1.20", "101.2", "1.2%"],
            ["100（平值）", "3.40", "0", "3.40", "103.4", "3.4%"],
            ["110（价外）", "1.10", "0", "1.10", "111.2", "11.2%"],
          ],
          caption:
            "同一只股票，同一个到期。110 那张便宜不是划算——它赌的是另一档、更罕见的结局。",
        },
        {
          type: "p",
          text: "注意这张表没说的话：没有任何一行是「正确答案」。它只说这三行是三种工具。因为 110 票面 110 而 100 票面 340 就选前者，是在比票面，不是在比交易。",
        },
        { type: "h2", text: "什么时候想到哪一档" },
        {
          type: "p",
          text: "要类股票敞口、愿意付厚借记、少受时间损耗拖累：价内。论点是「很快要动」、接受为 Gamma 付钱：平值。明确在买尾部：才轮到价外——并且计划里必须写明到期前需要多大的幅度。这个数写不出来，你买的就不是尾部，是一种感觉。",
        },
        {
          type: "ul",
          items: [
            "先选到期，再扫现价附近的行权价。",
            "价内 Call 的中间价应贴近内在价值；多出的差就是时间价值，会衰减。",
            "深度价外若价差很肥，中间价再好看也难成交。",
          ],
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "只看票面价：1.10 的票要 11.2% 的涨幅，3.40 的票要 3.4%。先想清楚你在为哪种结局付钱。",
            "把价内当安全：价内 Call 照样亏时间价值，标的回吐涨幅时，亏的绝对额可以比价外买家多好几倍。",
            "忘了 Put 方向反着来：行权价之上的 Put 是价外。下跌日容易点错链条的那一边。",
          ],
        },
        {
          type: "note",
          text: "钱力股抽屉里的风险摘要和 ±σ 表，跟着你真正加载的行权价走。从平值换成远处价外，情景可能整列压成一行：亏掉权利金。这是产品在告诉你刚才买的是什么。",
        },
        { type: "h2", text: "接下来交给 Delta" },
        {
          type: "p",
          text: "价值状态有一张数字脸：Delta。价内靠 1，平值半张，价外靠 0——上面三张牌的 0.75 / 0.50 / 0.25 就是这么来的。本系列下一篇讲这些数字在实盘一天里怎么动你的盈亏。在那之前，拿你自己的报价去 /tools/options 把例题重算一遍，别信这里的假设数。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Are OTM options better value because they cost less?",
          a: "They cost less per ticket but demand a bigger move. Value depends on what outcome you are underwriting, not on the sticker. Compare break-evens, not premiums.",
        },
        {
          q: "Is ATM always the fairest strike?",
          a: "It is usually the most liquid and gamma-rich, which is why it is a default for short-term event trades. It is not automatically the cheapest — check the IV and the spread.",
        },
        {
          q: "Can an ITM option still expire worthless?",
          a: "If you bought it and the stock falls back below the strike, yes — intrinsic evaporates and time value decays to zero too. ITM describes today, not the future.",
        },
        {
          q: "Why can I barely get filled on deep OTM strikes?",
          a: "Thin interest. Market makers widen the spread to price that risk, so the mid you see and the price you can trade diverge. If the spread is 10% of the mid, treat the option as mostly untradeable.",
        },
      ],
      "zh-CN": [
        {
          q: "价外期权票面便宜，是不是性价比更高？",
          a: "每张便宜，但要求的涨幅大得多。性价比取决于你在为什么结局付钱，不是票面。比盈亏平衡，别比权利金。",
        },
        {
          q: "平值一定是「最公道」的行权价吗？",
          a: "它通常流动性最好、Gamma 最厚，所以短期事件交易常拿它打底。但不等于最便宜——还要看 IV 和价差。",
        },
        {
          q: "价内期权也会到期归零吗？",
          a: "会。买入后股价跌回行权价之下，内在价值蒸发，时间价值也一起衰减到零。价内说的是今天，不是未来。",
        },
        {
          q: "深度价外为什么几乎成交不了？",
          a: "没量。做市商把价差放宽来给这份风险定价，你看到的中间价和你能成交的价差得很远。价差超过中间价一成，就当它基本不可交易。",
        },
      ],
    },
    links: {
      en: [
        { label: "Options basics", href: "/learn/options-basics-roles-pricing" },
        { label: "Greeks in practice", href: "/learn/options-greeks-in-practice" },
        { label: "IV, HV and rank", href: "/learn/options-iv-hv-rank" },
        { label: "Chain and drawer", href: "/learn/options-chain-and-drawer" },
        { label: "Options calculator", href: "/tools/options" },
      ],
      "zh-CN": [
        { label: "期权入门：作用与定价", href: "/learn/options-basics-roles-pricing" },
        { label: "希腊字母怎么用", href: "/learn/options-greeks-in-practice" },
        { label: "IV、HV 与高低分位", href: "/learn/options-iv-hv-rank" },
        { label: "期权链与策略抽屉", href: "/learn/options-chain-and-drawer" },
        { label: "期权计算器", href: "/tools/options" },
      ],
    },
    sourceNote: {
      en: "Educational. Moneyness labels are conventions around spot; pin-risk near expiry still applies. All figures hypothetical.",
      "zh-CN": "仅供学习。价值状态是相对现价的约定叫法，临近到期仍有钉价风险。文中数字均为假设。",
    },
  },
];

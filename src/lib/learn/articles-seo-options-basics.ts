import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/**
 * Options literacy — roles, taxonomy, pricing intuition.
 * Companion pieces cover the nine templates in the symbol options drawer.
 */
export const LEARN_ARTICLES_SEO_OPTIONS_BASICS: LearnArticle[] = [
  {
    slug: "options-basics-roles-pricing",
    category: "basics",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "What options actually buy you: rights, types, and how price is built",
      "zh-CN": "期权到底买的是什么：作用、分类，以及价格是怎么凑出来的",
    },
    summary: {
      en: "An option is a priced right with a clock, not a miniature stock. What the right is for, how contracts sort into boxes, and why premium splits into intrinsic plus time value — the same numbers you can verify on a chain.",
      "zh-CN":
        "期权是一份被标了价、带倒计时的权利，不是缩小版的股票。权利干什么用、合约怎么分格子、权利金为什么拆成内在加时间——每个数字都能在链上现场验证。",
    },
    paragraphs: {
      en: [
        "Most people meet options as a louder stock: buy a call, hope it goes up. That framing breaks the first time the underlying rises and the option still loses money.",
        "Start from the contract instead: a right, with an expiry clock, priced by the market.",
      ],
      "zh-CN": [
        "很多人第一课把期权当成「更刺激的股票」：买张看涨，盼着涨。这个框架一碰到「标的涨了、期权还亏钱」，就碎了。",
        "换个入口：你买卖的是一份带倒计时的权利，价格由市场来标。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "A call gives the holder the right to buy 100 shares at a fixed strike before or at expiry (American equity options). A put gives the right to sell. The buyer pays a premium for that right; the seller collects the premium and takes on the matching obligation. That is the whole machine. Everything else — Greeks, IV rank, spreads — is detail on top of it.",
        },
        {
          type: "p",
          text: "In Q-Stock, open any US equity from /markets and switch to Options. The drawer shows the chain with bid/ask, IV and Greeks per row; clicking a row seeds a strategy template. Every number used below can be reproduced on that screen.",
        },
        { type: "h2", text: "What the right is for" },
        {
          type: "p",
          text: "Three jobs cover most retail use. Direction with a capped check: a long call or put risks only the premium. Insurance: a long put against shares you own, with the strike as the deductible. Income by accepting an obligation: covered calls and credit spreads sell premium against a defined (or not-so-defined) risk. None of these need you to predict the next candle. All of them need you to name which risk sits on your side of the table.",
        },
        {
          type: "table",
          head: ["Job", "Typical structure", "Worst case"],
          rows: [
            ["Direction, small capital", "Long call or put", "Premium fully lost"],
            ["Hedge a holding", "Protective put, collar", "Premium paid (or upside given away in a collar)"],
            ["Collect premium", "Covered call, credit spread", "Covered: upside capped. Naked short: loss is uncapped"],
          ],
          caption:
            "Buyers have a hard floor on losses. Sellers do not — a naked short option can lose without limit. That line belongs before any strategy discussion.",
        },
        {
          type: "ul",
          items: [
            "Testing a directional view with a few hundred dollars: buy something slightly ITM with weeks left, not the cheapest far OTM ticket.",
            "Holding 100k of a stock through earnings and unwilling to sell: a collar — the short call part-funds the long put.",
            "Convinced the name will chop sideways for a month: premium-selling structures, not paying more rent for time you do not need.",
          ],
        },
        { type: "h2", text: "How contracts are classified" },
        {
          type: "p",
          text: "Same underlying, different box on this grid, different instrument. Check the multiplier (usually 100), the last trading day and the settlement method before sizing anything.",
        },
        {
          type: "table",
          head: ["Axis", "Common split", "Why it matters"],
          rows: [
            ["Right", "Call vs put", "Call finishes ahead above the strike; put below"],
            ["Side", "Long vs short", "Long pays premium with capped loss; short's shape depends on the hedge"],
            ["Moneyness", "ITM / ATM / OTM", "Only ITM carries intrinsic value; OTM is pure time value"],
            ["Exercise style", "American vs European", "American (most equity options) allows early exercise; European waits"],
            ["Settlement", "Physical vs cash", "Equity options usually deliver shares; many index options settle in cash"],
            ["Tenor", "Weekly / monthly / LEAPS", "Shorter tenors decay faster per day"],
          ],
          caption:
            "The classification is not trivia. A weekly 0DTE and a two-year LEAPS on the same ticker share a name and nothing else.",
        },
        { type: "h2", text: "How premium is built" },
        {
          type: "p",
          text: "Market price ≈ intrinsic value + time value. For a call, intrinsic is max(spot − strike, 0); for a put, max(strike − spot, 0). Everything above intrinsic is time value: the market's charge for what might happen between now and expiry.",
        },
        {
          type: "p",
          text: "Run the numbers. Assume a stock at 102 and a 30-day 100 call quoted at 4.60 mid (all figures hypothetical). Intrinsic = 102 − 100 = 2.00. Time value = 4.60 − 2.00 = 2.60. Break-even at expiry = 100 + 4.60 = 104.60, about 2.55% above spot. One contract controls 100 shares, so the cash outlay is 4.60 × 100 = 460, plus fees. Same arithmetic, row by row, works on the live chain.",
        },
        {
          type: "table",
          head: ["Input", "If it rises…", "Rough effect on a long call"],
          rows: [
            ["Spot", "Underlying rallies", "Premium usually rises (delta)"],
            ["Days to expiry", "More time left", "More time value, all else equal"],
            ["Implied vol", "Market prices a wider range", "Premium rises"],
            ["Rates / dividends", "Funding and yield shift", "Second-order at most retail sizes"],
          ],
          caption:
            "Implied volatility is the number that makes a pricing model match the screen. Higher IV, richer premium for the same strike and expiry.",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Reading a cheap ticket as a cheap option: a 1.00 far-OTM call may need an 8% move to break even, while a 4.60 ITM call needs 2.55%. Check the break-even before the sticker price.",
            "Ignoring the spread: on short-dated contracts, bid–ask can tax 5–10% of the ticket. Quote the mid, fill at the touch — record your P&L against the price you can actually trade.",
            "Treating American as European: most equity options allow early exercise, and deep-ITM puts carry real early-exercise value. Naked shorts who forget this get assigned into a position they did not plan.",
          ],
        },
        {
          type: "note",
          text: "Thirty seconds before confirming: where is the break-even, what is the worst case, is IV high or low for this name. The options calculator at /tools/options — American binomial tree or European Black–Scholes approximation — gives theoretical value and Greeks. Use it to sanity-check a quote, not to overrule the book.",
        },
        { type: "h2", text: "Where the series goes next" },
        {
          type: "p",
          text: "The order that follows: moneyness, Greeks, IV and rank, chain and drawer, then the nine strategy templates and expiry crush. Put the names on your radar first — /watchlist for tracking, /alerts at the break-even you care about — and come back to the chain when price actually moves. Reading about options without a live quote nearby is how the framing drifts back to louder stock.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "看涨期权（Call）给买方在到期前（美式股票期权）以约定行权价买入 100 股的权利；看跌期权（Put）是卖出的权利。买方付权利金，卖方收权利金、担对等义务。机器就这么大，后面所有东西——希腊字母、IV 分位、价差——都是这台机器上的零件。",
        },
        {
          type: "p",
          text: "在钱力股里，从 /markets 打开任意美股标的，切到「期权」：抽屉里是链，每行列着买卖价、IV 和希腊字母，点一行就能带出策略模板。本文用到的每个数字，都能在这块屏上对出来。",
        },
        { type: "h2", text: "这份权利通常用来干什么" },
        {
          type: "p",
          text: "散户的用法，三件事能覆盖大半。用有限的本金表达方向：买期权，最坏就是权利金归零。给持股上保险：买一张看跌，行权价就是免赔额。反过来承担义务换收入：备兑、信用价差卖权利金。三件事都不要求你猜下一根 K 线，但都要求你说清楚：桌上留着的是哪种风险。",
        },
        {
          type: "table",
          head: ["用途", "典型结构", "最坏情形"],
          rows: [
            ["方向、小资金", "买 Call 或 Put", "权利金全部亏掉"],
            ["给持股上保险", "保护性 Put、领口", "付出的权利金（或领口里让掉的上行）"],
            ["收权利金", "备兑 Call、信用价差", "备兑封顶上行；裸卖理论亏损不封顶"],
          ],
          caption:
            "买方的亏损有硬底，卖方没有——裸卖单腿期权，理论亏损不封顶。这条要放在一切策略讨论之前。",
        },
        {
          type: "ul",
          items: [
            "几百块试一个方向判断：买价内一点、剩几周的，别追最便宜的深度虚值票。",
            "持仓十万要扛财报又不想卖：领口——卖 Call 收的钱，替买 Put 出一部分。",
            "笃定这只票要横一个月：用收权利金的结构，而不是继续为不需要的时间付租金。",
          ],
        },
        { type: "h2", text: "合约分类：先认格子，再看价格" },
        {
          type: "p",
          text: "同一只标的，落在下表的不同格子里，就是不同工具。下单前确认乘数（美股常见 100）、最后交易日和结算方式。",
        },
        {
          type: "table",
          head: ["维度", "常见切法", "为什么要紧"],
          rows: [
            ["权利方向", "看涨 / 看跌", "涨过行权价 Call 才占优；跌破行权价 Put 占优"],
            ["买卖方向", "多头 / 空头", "买方亏损封顶；卖方的盈亏形状取决于有没有对冲"],
            ["价值状态", "实值 / 平值 / 虚值", "只有实值有内在价值；虚值全是时间价值"],
            ["行权风格", "美式 / 欧式", "美式（多数股票期权）可提前行权；欧式等到期"],
            ["交割方式", "实物 / 现金", "股票期权多交股票；不少指数期权现金结算"],
            ["期限", "周期权 / 月期权 / 远期", "期限越短，每天损耗越猛"],
          ],
          caption:
            "分类不是冷知识。同一只票的 0DTE 和两年期 LEAPS，除了名字相同，几乎不是一种东西。",
        },
        { type: "h2", text: "权利金是怎么凑出来的" },
        {
          type: "p",
          text: "市价 ≈ 内在价值 + 时间价值。看涨的内在价值是 max(现价 − 行权价, 0)，看跌是 max(行权价 − 现价, 0)，高出的部分全是时间价值——市场对「现在到到期之间会发生什么」收的钱。",
        },
        {
          type: "p",
          text: "代入数字。假设某股现价 102，一张 30 天后到期、行权价 100 的 Call，中间价 4.60（数字均为假设）。内在价值 = 102 − 100 = 2.00；时间价值 = 4.60 − 2.00 = 2.60；到期盈亏平衡 = 100 + 4.60 = 104.60，比现价高约 2.55%。一张合约对应 100 股，现金支出 = 4.60 × 100 = 460，另加费用。同样的拆法，在实盘链上一行一行都对得上。",
        },
        {
          type: "table",
          head: ["输入", "变大时…", "对买 Call 的大致影响"],
          rows: [
            ["标的现价", "股价上涨", "权利金通常涨（Delta）"],
            ["剩余天数", "离到期更远", "时间价值通常更高（其他不变）"],
            ["隐含波动率", "市场给更宽的区间定价", "权利金涨"],
            ["利率 / 分红", "资金成本与派息变化", "对多数零售仓位是二阶影响"],
          ],
          caption:
            "隐含波动率（IV）就是让定价模型贴上屏幕报价的那个数。IV 越高，同样行权价和到期日的权利金越贵。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "把票面便宜当期权便宜：1 块的深度虚值可能要标的涨 8% 才打平，4 块 6 的价内只需 2.55%。先看平衡点，再看票面。",
            "忽略价差：短期限合约的买卖价差能吃掉票面 5%–10%。核对用中间价，记账按你能成交的价。",
            "把美式当欧式玩：多数美股期权可提前行权，深度价内 Put 的提前行权价值很实在。裸卖后忘了这条，可能被动接货接进一个没计划过的仓位。",
          ],
        },
        {
          type: "note",
          text: "点确认前的 30 秒：平衡点在哪、最坏亏多少、IV 对这只票算高算低。/tools/options 的期权计算器（美式二叉树 / 欧式 BS 近似）给理论价和希腊字母，用来校对报价，不是用来否定盘口。",
        },
        { type: "h2", text: "这组文章往下走" },
        {
          type: "p",
          text: "顺序是：价内平值价外、希腊字母、IV 与分位、期权链与抽屉，再到九种策略模板和到期 Crush。先把标的放进 /watchlist，在你在意的平衡点挂一条 /alerts，价格真动了再回来看链。离着实时报价谈期权，框架很容易又漂回「更刺激的股票」。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "If I buy a call and the stock rises, am I guaranteed to make money?",
          a: "No. Theta keeps charging and a drop in implied volatility can outweigh the delta gain. A 2% rally into a vol crush can still be a losing day.",
        },
        {
          q: "How much cash does one contract actually cost?",
          a: "Quoted premium × 100, plus fees. A 4.60 quote means about 460 out of pocket per contract. Settlement and assignment mechanics add more later — never at entry, but plan for it.",
        },
        {
          q: "What can I lose as an option seller?",
          a: "Depends entirely on the structure. A covered call caps your upside, a cash-secured put caps at strike minus premium, but a naked short option has no theoretical limit on losses. Defined-risk spreads exist for a reason.",
        },
        {
          q: "What happens if the option expires with no value?",
          a: "It expires worthless and the premium paid is your realized loss. If it finishes ITM, most brokers auto-exercise — know your broker's threshold, because auto-exercise of a barely-ITM contract can surprise you with 100 shares and fees.",
        },
      ],
      "zh-CN": [
        {
          q: "买了 Call，股票涨了我一定赚吗？",
          a: "不一定。Theta 一直在扣钱，隐含波动率回落也可能盖过 Delta 的涨幅。涨 2% 碰上 IV 塌陷，当天照样可能亏。",
        },
        {
          q: "一张合约到底要多少现金？",
          a: "报价 × 100，另加费用。报 4.60 就是一张约 460。行权和被指派后续还可能涉及更多资金——入场时不发生，但要有数。",
        },
        {
          q: "卖期权最多亏多少？",
          a: "完全取决于结构。备兑封顶上行；现金担保 Put 最多亏到行权价减权利金；但裸卖单腿期权理论亏损不封顶。有限风险的价差结构就是为这个存在的。",
        },
        {
          q: "到期归零会怎么样？",
          a: "合约作废，已付权利金变成已实现亏损。收在价内的话，多数券商自动行权——弄清你券商的门槛，刚好过线的合约被自动行权，可能突然多出 100 股和费用。",
        },
      ],
    },
    links: {
      en: [
        { label: "Options calculator", href: "/tools/options" },
        { label: "ITM, ATM, OTM", href: "/learn/options-moneyness-itm-otm" },
        { label: "Greeks in practice", href: "/learn/options-greeks-in-practice" },
        { label: "IV, HV and rank", href: "/learn/options-iv-hv-rank" },
        { label: "Chain and drawer", href: "/learn/options-chain-and-drawer" },
        {
          label: "Single leg, covered, vertical, collar",
          href: "/learn/options-strategies-directional",
        },
      ],
      "zh-CN": [
        { label: "期权计算器", href: "/tools/options" },
        { label: "价内 · 平值 · 价外", href: "/learn/options-moneyness-itm-otm" },
        { label: "希腊字母怎么用", href: "/learn/options-greeks-in-practice" },
        { label: "IV、HV 与高低分位", href: "/learn/options-iv-hv-rank" },
        { label: "期权链与策略抽屉", href: "/learn/options-chain-and-drawer" },
        {
          label: "单腿 · 担保 · 垂直 · 领口",
          href: "/learn/options-strategies-directional",
        },
      ],
    },
    sourceNote: {
      en: "Educational only. Contract specs differ by product and exchange. All figures are hypothetical. Nothing here is a trade recommendation.",
      "zh-CN":
        "仅供学习。合约规则因产品与交易所而异，文中数字均为假设。本文不构成任何交易建议。",
    },
  },
];

import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Classic IV/HV/IV Rank — “隐含波动率 / 波动率分析” lane. */
export const LEARN_ARTICLES_SEO_OPTIONS_IV_RANK: LearnArticle[] = [
  {
    slug: "options-iv-hv-rank",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "IV, HV, and rank: is this option expensive before you pick a strategy",
      "zh-CN": "IV、HV 与高低分位：选策略之前，先问这张期权贵不贵",
    },
    summary: {
      en: "Implied vol is priced fear; historical vol is what already happened; rank puts today's IV back into its own history. Answer expensive-or-cheap before choosing a template.",
      "zh-CN":
        "隐含波动是标好价的恐慌，历史波动是已经发生的振幅，分位把今天的 IV 放回它自己的历史里。先答「贵不贵」，再挑策略模板。",
    },
    paragraphs: {
      en: [
        "Strategy templates cannot fix a bad entry vol. Buying a straddle into already-elevated IV is paying twice for a story the market has told.",
        "Separate will-it-move from is-the-move-already-priced.",
      ],
      "zh-CN": [
        "策略模板救不了买贵的波动。IV 已经抬得很高时再买跨式，等于为市场讲过的故事再付一遍钱。",
        "把「会不会动」和「动静是否已经进价」分开。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "IV is the volatility number that makes a pricing model match the screen — the market's priced range for the future. HV (realized or historical vol) measures how wild past returns actually were. Rank or percentile puts today's IV back into that symbol's own year of history. Three different questions; retail traders mix them up constantly.",
        },
        {
          type: "p",
          text: "On a Q-Stock symbol, the chain shows IV per row and the drawer feeds it into the probability cone and ±σ scenario prices. Before touching any template, this article's question comes first: is the option expensive?",
        },
        { type: "h2", text: "Three metrics, three questions" },
        {
          type: "table",
          head: ["Metric", "Question it answers", "Retail use"],
          rows: [
            ["IV", "What move is priced from now to expiry?", "Compare strikes and expiries on one name"],
            ["HV", "How wild was the recent past?", "Sanity-check whether IV looks stretched"],
            ["IV rank / percentile", "Where is today's IV in its own history?", "Filter sell-rich / buy-cheap narratives"],
          ],
          caption:
            "Rank is relative to one underlying's own history — not a cross-sectional cheap-vs-the-market score.",
        },
        { type: "h2", text: "One number, worked through" },
        {
          type: "p",
          text: "Assume a stock whose IV traded between 18 and 62 over the past year, and today's ATM IV is 47 (all hypothetical). Rank = (47 − 18) ÷ (62 − 18) ≈ 66% — the elevated end of its range. Now check HV: the 20-day realized vol is 28, so IV sits 19 points above what the stock has actually been doing. The market is charging for a wider future than the recent past delivered, which usually means an event is ahead. Buying a straddle here buys fear that already has a price tag on it.",
        },
        {
          type: "p",
          text: "After the event, IV prints 25. Rank instantly falls to (25 − 18) ÷ 44 ≈ 16%, and both legs of that straddle shrink together — the classic earnings-week outcome of winning the direction and losing the volatility. Same stock, same thesis, completely different P&L, and the only thing that changed was the vol assumption.",
        },
        {
          type: "table",
          head: ["Moment", "IV", "Rank", "What it means"],
          rows: [
            ["Week before earnings", "47", "≈ 66%", "Expensive: fear is priced, straddles pay up"],
            ["Evening of earnings", "25", "≈ 16%", "Crushed: option prices deflate together"],
            ["Quiet drift, no event", "22", "≈ 9%", "Cheap-ish: long vega hurts less if wrong on timing"],
          ],
          caption:
            "The rank moved 50 points without the stock doing anything remarkable. Vol is its own market.",
        },
        { type: "h2", text: "Term structure and skew, briefly" },
        {
          type: "p",
          text: "Front-month IV spikes into events and collapses after; farther expiries move slower. A smile or skew means different strikes on the same expiry carry different IV — your OTM put is rarely priced like your OTM call. Two wings with the same delta can still be two different trades, because one is buying skew and the other is selling it.",
        },
        { type: "h2", text: "Common traps" },
        {
          type: "ul",
          items: [
            "Selling premium just because IV is high: high can stay high, and a naked short still has uncapped theoretical losses. Rank is a filter, never a trigger.",
            "Comparing IV across tickers: 45% may be a quiet day for a small cap and a panic for a mega cap. Rank only means something within one symbol's history.",
            "Ignoring the lookback window: some vendors use 52 weeks, others 252 trading days. Same data, different number — check the definition before trusting any rank you did not compute yourself.",
          ],
        },
        {
          type: "note",
          text: "In the Q-Stock drawer, missing IV makes the ±σ scenarios fall back to a 30% illustration. Read the hint on the card before treating those rows as live marks — an illustrative cone is not a quote.",
        },
        { type: "h2", text: "Rank to strategy lean, with the fine print" },
        {
          type: "table",
          head: ["Rank zone", "Lean often discussed", "The fine print"],
          rows: [
            ["High (roughly 70+)", "Credit spreads, selling premium", "IV can spike further; cap position size and define max loss first"],
            ["Middle", "Directional structures, delta-led", "No vol edge either way; your thesis does the work"],
            ["Low (roughly under 30)", "Long options, calendars, straddles", "Cheap does not mean it will move; you still need an event or trend"],
          ],
          caption:
            "A lean is not a signal. Position size and max loss precede anything this table suggests.",
        },
        {
          type: "p",
          text: "Keep the loop concrete: watch the name in /watchlist, set an /alerts trigger at the event date, then re-read the rank on the chain the day before. Whatever the template you pick in the drawer, the entry vol you locked in matters more than the legs you assembled.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "IV 是让定价模型贴上屏幕报价的那个波动率——市场为未来标好价的幅度。HV（已实现波动）量的是过去实际振幅。分位把今天的 IV 放回这只标的自己过去一年的历史里。三个问题，散户经常混成一团。",
        },
        {
          type: "p",
          text: "钱力股的链上每行显示 IV，抽屉把它喂给概率锥和 ±σ 情景价。在碰任何模板之前，先回答本文的问题：这张期权，贵吗？",
        },
        { type: "h2", text: "三个指标，各答各的问题" },
        {
          type: "table",
          head: ["指标", "回答什么问题", "零售怎么用"],
          rows: [
            ["IV", "从现在到到期，市场给多大波动定价？", "同一标的上比较行权价与到期日"],
            ["HV", "最近一段真实有多疯？", "核对 IV 是否显得被抬高"],
            ["IV 分位", "今天的 IV 在它自己的历史里排第几？", "过滤「卖贵买便宜」的叙事"],
          ],
          caption: "分位只对这一只标的历史有意义，不是跨标的比谁便宜的截面分数。",
        },
        { type: "h2", text: "一个数字算到底" },
        {
          type: "p",
          text: "假设某股过去一年 IV 在 18 到 62 之间，今天平值 IV 是 47（数字均为假设）。分位 = (47 − 18) ÷ (62 − 18) ≈ 66%，处在偏高区域。再看 HV：20 日已实现波动是 28，IV 比实际振幅高出 19 个点——市场在为「比近况更宽的未来」收费，通常意味着前面有事件。这时候买跨式，买的恐慌是已经标好价的。",
        },
        {
          type: "p",
          text: "事件过后 IV 报 25。分位瞬间掉到 (25 − 18) ÷ 44 ≈ 16%，跨式的两条腿一起缩水——财报周经典的「赢了方向、输了波动」。同一只股票、同一个论点，盈亏完全不同，变的只是波动率这个假设。",
        },
        {
          type: "table",
          head: ["时点", "IV", "分位", "含义"],
          rows: [
            ["财报前一周", "47", "≈ 66%", "贵：恐慌已定价，跨式要付溢价"],
            ["财报当晚", "25", "≈ 16%", "塌了：期权价格一起缩水"],
            ["平静阴跌、无事件", "22", "≈ 9%", "偏便宜：买错时机时受伤更轻"],
          ],
          caption: "股票没干什么大事，分位却动了 50 个点。波动自己就是一个市场。",
        },
        { type: "h2", text: "期限结构与偏斜，短版" },
        {
          type: "p",
          text: "近月 IV 在事件前抬升、事后塌陷；远月动得慢。微笑或偏斜意味着同一到期日下不同行权价的 IV 不同——你的虚值 Put 很少跟虚值 Call 一个价。两张「同 Delta」的翅膀仍可能是两笔交易：一张在买偏斜，另一张在卖偏斜。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "IV 高就无脑卖权利金：高可以继续高，裸卖理论亏损不封顶。分位是过滤器，不是扳机。",
            "跨标的比 IV：45% 对小盘股可能算平静，对大盘股可能是恐慌。分位只在一只标的历史内成立。",
            "不看回看口径：有数据源用 52 周，有的用 252 个交易日。同一份数据，两个数字——不是自己算的分位，先查定义再信。",
          ],
        },
        {
          type: "note",
          text: "钱力股抽屉里，缺 IV 时 ±σ 情景会退回 30% 示意。先读卡片上的提示，别把示意行当成实盘标记——示意锥不是报价。",
        },
        { type: "h2", text: "分位到策略倾向，附细则" },
        {
          type: "table",
          head: ["分位区间", "常被讨论的倾向", "细则"],
          rows: [
            ["高（约 70 以上）", "信用价差、卖权利金", "IV 可能更崩；先定最大亏损、限制仓位规模"],
            ["中间", "方向结构、Delta 主导", "波动上没有便宜可占，靠论点本身干活"],
            ["低（约 30 以下）", "买期权、日历、跨式", "便宜不等于会动，仍需事件或趋势论点"],
          ],
          caption: "倾向不是信号。仓位规模和最大亏损，排在这张表任何一格前面。",
        },
        {
          type: "p",
          text: "把循环做实：标的放进 /watchlist，事件日在 /alerts 挂提醒，前一天回到链上重读分位。抽屉里最后选哪个模板先放一边——你锁定的入场波动率，比你搭的腿更重要。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is IV of 50% high?",
          a: "Meaningless without context. For a utility stock it would be extreme; for a biotech ahead of an FDA decision it might be low. Compare against the same symbol's rank, not against a number you remember.",
        },
        {
          q: "Is buying a straddle before earnings a sure win?",
          a: "No — it is the textbook crush setup. The move needs to beat the priced expectation, not just happen. Many earnings straddles finish down despite big absolute moves.",
        },
        {
          q: "How is HV calculated?",
          a: "Usually the annualized standard deviation of daily returns over a window, 20 days being common. Different windows give different numbers, which is why IV-versus-HV is a rough visual check, not a formula trade.",
        },
        {
          q: "Where do I find IV in the product?",
          a: "Per contract on the options chain, and the drawer feeds it into the probability cone and ±σ scenarios. The calculator at /tools/options also takes IV as an input, so you can test how sensitive the price is to it.",
        },
      ],
      "zh-CN": [
        {
          q: "IV 50% 算高吗？",
          a: "没上下文就没意义。对公用事业股是极端，对 FDA 审批前的生物科技股可能偏低。跟同一只标的的分位比，别跟你记忆里的数比。",
        },
        {
          q: "财报前买跨式是不是稳赚？",
          a: "不是，它恰恰是教科书级的塌陷场景。涨幅要跑赢「已定价的预期」，而不只是发生。绝对涨幅很大的财报，跨式照样收亏。",
        },
        {
          q: "HV 是怎么算的？",
          a: "常见口径是某窗口（常用 20 日）内日收益率的标准差年化。窗口不同数字不同，所以 IV 对 HV 只适合当粗校，不适合当公式化交易。",
        },
        {
          q: "产品里去哪看 IV？",
          a: "期权链的每张合约上；抽屉会把它喂给概率锥和 ±σ 情景。/tools/options 的计算器也拿 IV 当输入，可以自己测价格对 IV 有多敏感。",
        },
      ],
    },
    links: {
      en: [
        { label: "Greeks in practice", href: "/learn/options-greeks-in-practice" },
        { label: "Expiry and IV crush", href: "/learn/options-expiry-iv-crush" },
        { label: "Straddle, strangle, butterfly", href: "/learn/options-strategies-volatility" },
        { label: "Chain and drawer", href: "/learn/options-chain-and-drawer" },
        { label: "Options calculator", href: "/tools/options" },
      ],
      "zh-CN": [
        { label: "希腊字母怎么用", href: "/learn/options-greeks-in-practice" },
        { label: "到期日、周期权与 IV Crush", href: "/learn/options-expiry-iv-crush" },
        { label: "跨式 · 宽跨式 · 蝶式", href: "/learn/options-strategies-volatility" },
        { label: "期权链与策略抽屉", href: "/learn/options-chain-and-drawer" },
        { label: "期权计算器", href: "/tools/options" },
      ],
    },
    sourceNote: {
      en: "Educational. Rank windows and HV definitions differ by vendor; always check the lookback. All figures hypothetical.",
      "zh-CN": "仅供学习。分位回看窗口与 HV 口径因数据源而异，使用前先确认。文中数字均为假设。",
    },
  },
];

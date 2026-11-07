import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * Calculation cluster — every article here ends at a tool page, so the
 * internal links are load-bearing: they are what pulls the crawler from
 * editorial content into the app surface.
 */
export const LEARN_ARTICLES_SEO_METHODS: LearnArticle[] = [
  {
    slug: "adjusted-price-and-dividends",
    category: "basics",
    ctaHref: "/tools/compound",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Adjusted prices, ex-dividend days, and why your long-run return keeps coming out short",
      "zh-CN": "复权、除权、分红再投：为什么你的长期收益总是算少一截",
    },
    summary: {
      en: "On the ex-dividend day the price drops and nothing is lost — unless you measure it wrong. Forward-adjusted, backward-adjusted and unadjusted prices answer three different questions, and mixing them is the most common return error retail investors make.",
      "zh-CN": "除权那天价格掉了，但你并没有亏钱——前提是你量对了。前复权、后复权、不复权回答的是三个不同的问题，混着用是散户最常见的收益计算错误。",
    },
    paragraphs: {
      en: [
        "A stock goes ex-dividend, the price gaps down, and a lot of people conclude they lost money.",
        "They did not. What changed is the price series, not the value — and the series now has three versions.",
      ],
      "zh-CN": [
        "股票除权除息，价格向下跳一格，很多人以为自己亏了。",
        "其实没有。变的是价格序列，不是价值——而这条序列现在有三个版本。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: use unadjusted prices for market value and tax, forward-adjusted for chart patterns and short-term technicals, and total return with dividends reinvested when you are judging a holding period. Comparing two stocks with different conventions is the error that quietly understates your return.",
        },
        { type: "h2", text: "What actually happens on the ex-dividend day" },
        {
          type: "p",
          text: "The company pays out cash, so the business is worth less by that amount per share. The exchange marks the price down at the open. Your share count is unchanged and you receive the dividend, so total value is unchanged — minus tax. Nothing was lost; the value moved from the price column to the cash column.",
        },
        { type: "h2", text: "Three series, three questions" },
        {
          type: "table",
          head: ["Series", "What it does", "Use it for", "Do not use it for"],
          rows: [
            [
              "Unadjusted",
              "Shows the price that actually printed",
              "Market value, taxes, order prices",
              "Multi-year return comparisons",
            ],
            [
              "Forward-adjusted",
              "Rescales history around the latest price",
              "Chart reading, support and resistance",
              "Any absolute level you will trade at",
            ],
            [
              "Backward-adjusted",
              "Grows the past so today equals the past base",
              "Long-run cumulative return",
              "Reading a chart's visual shape",
            ],
          ],
          caption:
            "Forward-adjusted prices change every time a new dividend is paid, so a level you saved last year may no longer exist.",
        },
        { type: "h2", text: "The reinvestment gap over 15 years" },
        {
          type: "p",
          text: "Assume a 4% dividend yield and a flat share price. Take the cash and you end with 1 + 0.04 × 15 = 1.60 times your money. Reinvest each dividend and you compound: 1.04^15 ≈ 1.80 times. The 12-point gap is not return from the stock — it is return from the decision to reinvest, and it never appears in a price chart.",
        },
        {
          type: "note",
          text: "Dividend tax is ignored above on purpose, to isolate the compounding effect. In practice withholding is charged per distribution and reduces the reinvestment rate — which is exactly why the channel you hold through matters.",
        },
        { type: "h2", text: "Where the wrong series hurts most" },
        {
          type: "ul",
          items: [
            "Calculating market value from an adjusted price: the number looks plausible and is simply not your holding.",
            "Comparing two stocks across a decade when one series is adjusted and the other is not.",
            "Backtesting a strategy on forward-adjusted data, which leaks future dividend information into the past.",
            "Ignoring share-count changes from splits, scrip dividends and rights issues, which adjust price but not position size.",
          ],
        },
        { type: "h2", text: "Reproducing it yourself" },
        {
          type: "p",
          text: "Run the same holding through the compound tool twice: once with the dividend withdrawn, once reinvested. The difference is the reinvestment premium. Then repeat with your actual withholding rate — the gap narrows, and sometimes the conclusion flips.",
        },
        { type: "h2", text: "How the adjustment factor is actually built" },
        {
          type: "p",
          text: "For a cash dividend, the single-event factor is previous close ÷ (previous close − dividend per share). At a 10.00 price and a 0.50 dividend, the factor is 10 ÷ 9.5 ≈ 1.0526. Multiple events multiply into a cumulative factor.",
        },
        {
          type: "p",
          text: "Backward-adjusted price = raw price × cumulative factor. Forward-adjusted price = raw price × (cumulative factor ÷ latest cumulative factor). Both produce the same return; they differ only in where the price level sits.",
        },
        {
          type: "p",
          text: "Splits, bonus issues and rights issues use a different denominator, which is why hand-adjusting a price by a single multiplier usually goes wrong. A proper series handles every corporate action at once.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：算市值和税费用不复权；看图形和支撑压力用前复权；判断一段持有期的真实回报，用「分红再投」的总回报。把两种口径混在一起比，是让收益被悄悄算少的最常见原因。",
        },
        { type: "h2", text: "除权除息那天，到底发生了什么" },
        {
          type: "p",
          text: "公司把现金分出去，每股对应的企业价值就少了那么多，交易所开盘时把价格相应下调。你的股数没变，同时收到了股息，所以总价值不变——减去税。没有损失，只是价值从「价格」这一列挪到了「现金」这一列。",
        },
        { type: "h2", text: "三条序列，回答三个问题" },
        {
          type: "table",
          head: ["序列", "做了什么", "适合用来", "不要用来"],
          rows: [
            ["不复权", "显示真实成交过的价格", "算市值、算税、下单", "做多年收益对比"],
            ["前复权", "以最新价为基准重算历史", "看图形、看支撑压力", "当作可成交的绝对价位"],
            ["后复权", "以历史为基准放大至今", "算长期累计收益", "看图形的视觉形态"],
          ],
          caption:
            "前复权价格每次分红都会重算，你去年记下的某个价位，今年可能已经不存在了。",
        },
        { type: "h2", text: "15 年的再投差距" },
        {
          type: "p",
          text: "假设股息率 4%、股价不变。把分红取出来，15 年后是 1 + 0.04 × 15 = 1.60 倍；每次分红都再投，是 1.04^15 ≈ 1.80 倍。那 12 个百分点不是股票给的，是「再投」这个动作给的，而它永远不会出现在价格图上。",
        },
        {
          type: "note",
          text: "上面的计算刻意忽略了红利税，为的是把复利效应单独拎出来。实际中红利税按每次分红征收，会降低再投比率——这正是持有通道会影响最终结果的原因。",
        },
        { type: "h2", text: "用错序列，伤在哪里" },
        {
          type: "ul",
          items: [
            "用复权价算市值：数字看起来很合理，但它不是你的持仓。",
            "两只股票比十年，一只用复权、一只用不复权。",
            "用前复权数据做回测，等于把未来的分红信息泄漏进了过去。",
            "忽略拆股、以股代息、供股带来的股数变化——价格调整了，持仓没调。",
          ],
        },
        { type: "h2", text: "自己复算一遍" },
        {
          type: "p",
          text: "把同一笔持有放进复利工具算两次：一次分红取出，一次分红再投。差值就是再投溢价。然后用你真实的红利税率再算一次——差距会缩小，有时候结论会翻转。",
        },
        { type: "h2", text: "复权因子到底怎么算" },
        {
          type: "p",
          text: "只考虑现金分红时，单次除权的复权因子 = 除权前收盘价 ÷（除权前收盘价 − 每股分红）。价格 10 元、每股分红 0.5 元，因子就是 10 ÷ 9.5 ≈ 1.0526。多次除权把各次因子连乘，得到累计因子。",
        },
        {
          type: "p",
          text: "后复权价 = 不复权价 × 累计因子；前复权价 = 不复权价 ×（累计因子 ÷ 最新累计因子）。前者把历史放大到现在，后者把现在缩回历史，所以两者算出的收益率相同，但价位不同。",
        },
        {
          type: "p",
          text: "送股、拆股、配股用的是另一套公式（分母要按股数变化调整），这也是为什么用「自己乘一个系数」手算复权价经常出错——工具里的复权序列已经把这些事件都处理过了。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Which price should I use to calculate my portfolio value?",
          a: "Unadjusted. Adjusted series are analysis tools; they do not correspond to a price you could have traded at.",
        },
        {
          q: "Why does the forward-adjusted chart change over time?",
          a: "Because it is anchored to the latest price. Every new dividend rescales the entire history, so old levels shift.",
        },
        {
          q: "Does dividend reinvestment really matter that much?",
          a: "Over long periods, yes — the effect compounds. Over one year it is usually smaller than the FX or fee differences people ignore.",
        },
        {
          q: "Do splits change my return?",
          a: "No. The share count and the price adjust proportionally; only the units change.",
        },
      ],
      "zh-CN": [
        {
          q: "算持仓市值该用哪个价格？",
          a: "不复权。复权序列是分析工具，它对应的不是一个你能成交的价位。",
        },
        {
          q: "为什么前复权图会随时间变化？",
          a: "因为它以最新价为锚。每次分红都会重算整段历史，所以旧价位会移动。",
        },
        {
          q: "分红再投真的差那么多吗？",
          a: "拉长看是的，复利会放大。单看一年，它通常小于人们忽略的汇率差或费率差。",
        },
        {
          q: "拆股会改变我的收益吗？",
          a: "不会。股数和价格按比例调整，变的是单位，不是价值。",
        },
      ],
    },
    links: {
      en: [
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "DCA vs lump sum", href: "/learn/lump-sum-vs-dca" },
        { label: "Position cost conventions", href: "/learn/position-cost-methods" },
      ],
      "zh-CN": [
        { label: "复利计算器", href: "/tools/compound" },
        { label: "定投还是一次性投入", href: "/learn/lump-sum-vs-dca" },
        { label: "持仓成本的三种口径", href: "/learn/position-cost-methods" },
      ],
    },
    sourceNote: {
      en: "The 15-year example uses a constant 4% yield and a flat price to isolate compounding; real paths differ. Tax treatment varies by market and channel.",
      "zh-CN":
        "15 年示例假设股息率恒为 4%、股价不变，仅为隔离复利效应；真实路径不会这样。税制因市场与通道而异。",
    },
  },
  {
    slug: "position-cost-methods",
    category: "tools",
    ctaHref: "/tools/position",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Three ways to define your position cost — and why two brokers can both be right",
      "zh-CN": "持仓成本到底怎么算：均价、摊薄成本、已实现盈亏的三种口径",
    },
    summary: {
      en: "Same trades, three different cost numbers. Weighted average, diluted cost and FIFO are all defensible, but they answer different questions — and comparing a 持仓盈亏 figure across brokers without knowing the convention is meaningless.",
      "zh-CN": "同一组流水，三种成本数字。加权平均、摊薄成本、先进先出都说得通，但它们回答的是不同问题——不知道口径就拿两家的「持仓盈亏」对比，毫无意义。",
    },
    paragraphs: {
      en: [
        "Broker A shows a cost of 9.00, broker B shows 3.00, and both are correct.",
        "What differs is not the arithmetic but the question each number answers.",
      ],
      "zh-CN": [
        "券商 A 显示成本 9.00，券商 B 显示 3.00，两个都对。",
        "差的不是算术，是这两个数字回答的问题不一样。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: weighted average tells you your entry price; diluted cost folds realised profit into the remaining shares and makes the cost line look better than it was; FIFO decides which lots you sold. Total profit and loss is identical under all three — only the labels move.",
        },
        { type: "h2", text: "The three conventions" },
        {
          type: "table",
          head: ["Convention", "How it is built", "Answers", "Hides"],
          rows: [
            ["Weighted average", "Total buy cost ÷ total shares", "What did I pay on average?", "Realised results"],
            ["Diluted cost", "(Buy cost − sell proceeds) ÷ remaining shares", "What is left at risk?", "The true entry price"],
            ["FIFO", "Oldest lots sold first", "Which lots did I close?", "Nothing, but needs lot tracking"],
          ],
        },
        { type: "h2", text: "One set of trades, three answers" },
        {
          type: "p",
          text: "Buy 100 at 10, buy 100 at 8, then sell 150 at 11. Total invested 1,800, proceeds 1,650, 50 shares left. Set the current price at 12 and compute:",
        },
        {
          type: "table",
          head: ["Convention", "Cost of the 50 left", "Unrealised at 12", "Realised", "Total"],
          rows: [
            ["Weighted average", "9.00", "+150", "+300", "+450"],
            ["Diluted cost", "3.00", "+450", "already inside", "+450"],
            ["FIFO", "8.00", "+200", "+250", "+450"],
          ],
          caption:
            "Three different cost bases, three different unrealised numbers — and exactly the same total. If you only look at the cost line, you will draw three different conclusions.",
        },
        {
          type: "note",
          text: "The diluted figure of 3.00 looks like a triumph. It is not: the realised gain was used to reduce the cost of what remains. A 50% drop from 3.00 is not what you are risking; you are risking the market value of those 50 shares.",
        },
        { type: "h2", text: "Where fees belong" },
        {
          type: "p",
          text: "Two conventions exist because both are used in practice: fees included in cost (conservative, shows the true break-even) or expensed separately (cleaner cost basis, fees appear as a line item). Pick one and stay with it — switching mid-year makes your own history incomparable.",
        },
        { type: "h2", text: "Dividends, bonus shares and splits" },
        {
          type: "ul",
          items: [
            "Cash dividend: does not change cost under most conventions, but it does change your total return.",
            "Bonus shares and splits: share count changes, so cost per share must be restated or every later comparison breaks.",
            "Rights issues: the subscription price is new capital, not a gain; treat it as an additional lot.",
            "Scrip dividends: new shares at a set price — the cost basis of those shares is that price, not zero.",
          ],
        },
        { type: "h2", text: "The only number that never lies" },
        {
          type: "p",
          text: "Total profit and loss = market value of what you still hold + all cash received − all cash paid in. It is identical under every convention, because it does not depend on labels. If two systems disagree on this number, one of them is missing a trade.",
        },
        { type: "h2", text: "Recording it properly" },
        {
          type: "p",
          text: "Log each trade with date, side, quantity, price and fee, then let the position tool derive the cost. Deriving beats typing: a hand-entered cost basis drifts the moment you forget one dividend.",
        },
        { type: "h2", text: "In a margin account, interest rewrites the cost" },
        {
          type: "p",
          text: "With borrowed money the true cost is fill price + accrued interest + fees. Most brokers show interest as a separate line rather than inside the cost, so the cost basis looks cheaper than it is while the interest quietly accumulates elsewhere.",
        },
        {
          type: "p",
          text: "Order of magnitude: at a 6% annual rate, three months of holding costs about 1.5% and a full year costs 6%. For a trade targeting 8%, that is not a rounding error — it is the majority of the result.",
        },
        {
          type: "p",
          text: "Keep two ideas apart: the maintenance ratio is computed on market value, not on your cost. 「I am still above my cost」 says nothing about account safety. Distance to the liquidation level is the honest risk measure.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：加权平均告诉你「入场均价」；摊薄成本把已实现盈亏折进剩余持仓，让成本线看起来更漂亮；先进先出决定你卖的是哪一批。三种口径下的总盈亏完全一致，变动的只是标签。",
        },
        { type: "h2", text: "三种口径分别是什么" },
        {
          type: "table",
          head: ["口径", "怎么算出来", "回答什么", "掩盖了什么"],
          rows: [
            ["加权平均", "总买入成本 ÷ 总股数", "我平均多少钱买的", "已实现部分"],
            ["摊薄成本", "（买入成本 − 卖出所得）÷ 剩余股数", "现在还压着多少钱", "真实的入场价"],
            ["先进先出", "先卖的算最早那批", "我平掉的是哪一批", "不掩盖，但要逐批记录"],
          ],
        },
        { type: "h2", text: "一组流水，三个答案" },
        {
          type: "p",
          text: "买 100 股 @10，再买 100 股 @8，然后卖 150 股 @11。累计投入 1800，卖出所得 1650，剩 50 股。设现价 12，分别算：",
        },
        {
          type: "table",
          head: ["口径", "剩余 50 股成本", "浮盈@12", "已实现", "合计"],
          rows: [
            ["加权平均", "9.00", "+150", "+300", "+450"],
            ["摊薄成本", "3.00", "+450", "已包含在内", "+450"],
            ["先进先出", "8.00", "+200", "+250", "+450"],
          ],
          caption:
            "三个成本、三个浮盈数字，合计完全相同。只盯成本那一行，你会得出三个不同结论。",
        },
        {
          type: "note",
          text: "摊薄出来的 3.00 看起来像战绩，其实不是：已实现盈利被用来冲减了剩余持仓的成本。从 3.00 跌 50% 并不是你的真实风险，你真正承担的是那 50 股的市值。",
        },
        { type: "h2", text: "手续费算不算进成本" },
        {
          type: "p",
          text: "两种做法都常见：计入成本（保守，能看出真实盈亏平衡点），或单独列示（成本更干净，费用单列一行）。选一种并坚持下去——中途换口径，等于让自己的历史数据不可比。",
        },
        { type: "h2", text: "分红、送股、拆股怎么调整" },
        {
          type: "ul",
          items: [
            "现金分红：多数口径下不改变成本，但会改变总回报。",
            "送股与拆股：股数变了，每股成本必须重述，否则后面所有对比都失真。",
            "配股：认购价是新投入的资金，不是收益，应作为新增批次处理。",
            "以股代息：新股的取得价就是那个折算价，不是零。",
          ],
        },
        { type: "h2", text: "唯一不会骗人的数字" },
        {
          type: "p",
          text: "总盈亏 = 当前持仓市值 + 累计收到的现金 − 累计投入的现金。它在任何口径下都相同，因为它不依赖标签。如果两套系统在这个数字上不一致，一定有一边漏了成交。",
        },
        { type: "h2", text: "怎么记才靠谱" },
        {
          type: "p",
          text: "逐笔记录日期、方向、数量、价格和费用，让持仓工具去推导成本。推导优于手填：手填的成本基准，会在你漏记一次分红的那一刻开始漂移。",
        },
        { type: "h2", text: "融资账户里，成本会被利息改写" },
        {
          type: "p",
          text: "融资买入时，真实成本 = 成交价 + 累计利息 + 费用。多数券商把利息单列而非计入成本，于是成本线看起来比实际便宜，而利息在另一栏悄悄累积。",
        },
        {
          type: "p",
          text: "量级感：假设年化融资利率 6%，持有三个月约 1.5%，相当于把成本抬高一截；持有一年就是 6%。对一笔预期收益 8% 的交易来说，这不是零头，而是大头。",
        },
        {
          type: "p",
          text: "还要分清两件事：维持担保比例按市值计算，不按你的成本计算。所以「我的成本还没破」不代表账户安全——价格离强平线的距离，才是真正的风险刻度。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Which cost figure should I trust?",
          a: "Whichever matches the decision you are making. For entry discipline use weighted average; for total performance use total profit and loss.",
        },
        {
          q: "Why does my cost drop after I sell at a profit?",
          a: "That is the diluted-cost convention: realised gains reduce the remaining cost basis. Nothing about your risk changed.",
        },
        {
          q: "Should fees be part of cost?",
          a: "Either is acceptable if applied consistently. Including them gives you the true break-even; excluding them keeps the cost basis comparable across brokers.",
        },
        {
          q: "Can two brokers disagree on total profit?",
          a: "Only if one is missing a corporate action or a trade. The total is convention-independent, so a mismatch means a data problem, not a definition problem.",
        },
      ],
      "zh-CN": [
        {
          q: "到底该信哪个成本？",
          a: "看你正在做什么决策。约束入场纪律用加权平均；评价整体战绩用总盈亏。",
        },
        {
          q: "为什么我卖出盈利后成本变低了？",
          a: "这是摊薄口径：已实现盈利被用来冲减剩余持仓成本。你的真实风险没有任何变化。",
        },
        {
          q: "手续费要不要算进成本？",
          a: "两种都行，前提是始终一致。计入能得到真实盈亏平衡点；不计入则便于跨券商对比。",
        },
        {
          q: "两家券商的总盈亏会不一致吗？",
          a: "只有在一方漏了公司行为或成交时才会。总盈亏与口径无关，不一致就是数据问题。",
        },
      ],
    },
    links: {
      en: [
        { label: "Position & cost tool", href: "/tools/position" },
        { label: "Adjusted prices and dividends", href: "/learn/adjusted-price-and-dividends" },
        { label: "Risk, reward and expectancy", href: "/learn/risk-reward-expectancy" },
      ],
      "zh-CN": [
        { label: "持仓与成本计算器", href: "/tools/position" },
        { label: "复权、除权与分红再投", href: "/learn/adjusted-price-and-dividends" },
        { label: "风险回报比与期望值", href: "/learn/risk-reward-expectancy" },
      ],
    },
    sourceNote: {
      en: "Conventions vary by broker; the worked example uses zero fees and no tax to isolate the arithmetic. Verify your broker's definition before comparing statements.",
      "zh-CN":
        "各券商口径不同。示例不计手续费与税，只为隔离算术差异。对比账单前，先确认对方用的是哪种定义。",
    },
  },
];

import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/** Derivatives / crypto cluster — the two markets where mechanics dominate outcomes. */
export const LEARN_ARTICLES_SEO_DERIVATIVES: LearnArticle[] = [
  {
    slug: "options-expiry-iv-crush",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Option expiry: 0DTE, weeklies, and the IV crush that eats correct calls",
      "zh-CN": "期权到期日：0DTE、周期权与 IV Crush 的定价陷阱",
    },
    summary: {
      en: "Being right about direction is not enough. Time value decays on a curve, implied volatility collapses after events, and weekly expiries compress both effects into days. Here is the mechanics, then the payoff chart.",
      "zh-CN": "看对方向并不够。时间价值按曲线衰减，事件之后隐含波动率会塌陷，而周期权把这两个效应压进几天里。先讲机制，再看盈亏图。",
    },
    paragraphs: {
      en: [
        "An option can lose money while the underlying moves your way. That is not a malfunction.",
        "It is the price of time and volatility being repriced at the same moment.",
      ],
      "zh-CN": [
        "标的朝你看的方向走了，期权却还是亏钱。这不是故障。",
        "这是时间与波动率在同一时刻被重新定价的结果。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: you pay for intrinsic value plus time value. Time value decays faster as expiry approaches, and implied volatility usually falls after a scheduled event. If the move is smaller than what was priced in, both effects work against a long option — even when the direction was right.",
        },
        { type: "h2", text: "Expiry mechanics worth knowing" },
        {
          type: "table",
          head: ["Type", "Typical expiry", "Settlement", "Practical consequence"],
          rows: [
            ["Standard monthly equity option", "Third Friday of the month", "American, physical delivery", "Early assignment is possible"],
            ["Weekly equity option", "Most Fridays", "American, physical delivery", "Faster decay, more gamma near expiry"],
            ["Index option (many series)", "Weekly and monthly", "Often European, cash settled", "No early assignment, but no early exercise either"],
            ["0DTE", "Same day", "Varies by product", "Gamma and slippage dominate everything"],
          ],
          caption:
            "Contract specifications differ by product and by exchange. Check the multiplier, settlement style and last trading day before sizing anything.",
        },
        { type: "h2", text: "Time value does not decay in a straight line" },
        {
          type: "p",
          text: "Theta measures value lost per day, and it is not constant: it accelerates into expiry because the remaining time is square-rooted in most pricing models. The last 30 days cost far more per day than the first 30. This is why a long-dated option feels patient and a two-week option feels like a countdown.",
        },
        { type: "h2", text: "IV crush: the event is priced before it happens" },
        {
          type: "p",
          text: "Ahead of earnings, implied volatility rises because the market must price a wide range of outcomes. Once the number is out, that uncertainty is resolved, so implied volatility falls — often sharply. A long call can be correct on direction and still lose, because the volatility premium it paid evaporates faster than the intrinsic value grows. The mirror image is true for sellers: they collect the crush, and they carry the tail risk.",
        },
        { type: "h2", text: "What 0DTE actually changes" },
        {
          type: "ul",
          items: [
            "Gamma becomes extreme: delta swings hard for small moves, so the position's risk changes minute by minute.",
            "Spreads widen and slippage grows, because everyone is trading the same expiration at once.",
            "There is no time to be right later — the contract resolves today, so a thesis needs an intraday catalyst.",
            "Loss limits must be set before entry; averaging down a same-day option is not a strategy, it is a countdown.",
          ],
        },
        { type: "h2", text: "Draw the payoff before you trade" },
        {
          type: "p",
          text: "Enter strike, premium and quantity into the payoff tool and look at the two numbers that matter: maximum loss, and the break-even price at expiry. If the break-even requires a move larger than the implied move, you are not buying a view — you are buying a more extreme view than the market's.",
        },
        { type: "h2", text: "Three mistakes that look like bad luck" },
        {
          type: "ul",
          items: [
            "Buying short-dated options before an event, then holding through it: correct direction, crushed volatility.",
            "Selling options for income without a defined worst case: the premium is small and the tail is not.",
            "Ignoring early assignment on American-style contracts, especially around dividends and deep in-the-money positions.",
          ],
        },
        { type: "h2", text: "Liquidity: same delta, different cost" },
        {
          type: "p",
          text: "There is no single order book for options. Far-dated, deep out-of-the-money or thinly traded strikes can carry a bid-ask spread several times wider, as a share of premium, than the front-month contract. Two contracts with the same 0.4 delta are not the same instrument if one costs 1% to cross and the other 8%.",
        },
        {
          type: "p",
          text: "Backtesting at the mid price systematically overstates returns: the test fills at mid, the real fill happens at the other side of the spread. For short-horizon strategies that assumption alone can turn positive expectancy negative.",
        },
        {
          type: "p",
          text: "Three checks tell you whether it is liquid: volume and open interest, spread width, and strike spacing. When all three are poor, the answer is not a cheaper premium — it is a different contract.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：期权价格 = 内在价值 + 时间价值。时间价值越临近到期衰减越快，而隐含波动率在事件落地后通常会回落。如果实际波动小于市场定价的幅度，这两个效应对买方同时不利——哪怕方向看对了。",
        },
        { type: "h2", text: "到期机制先弄清楚" },
        {
          type: "table",
          head: ["类型", "典型到期日", "结算方式", "实际影响"],
          rows: [
            ["标准月度股票期权", "每月第三个周五", "美式，实物交割", "存在提前被行权的可能"],
            ["周期权", "多数周五", "美式，实物交割", "衰减更快，临近到期 Gamma 更高"],
            ["指数期权（多系列）", "周度与月度", "多为欧式、现金交割", "不会被提前行权，但也不能提前行权"],
            ["0DTE", "当日到期", "因产品而异", "Gamma 与滑点主导一切"],
          ],
          caption:
            "合约规格因产品与交易所而异。下单前确认合约乘数、结算方式与最后交易日。",
        },
        { type: "h2", text: "时间价值不是直线衰减" },
        {
          type: "p",
          text: "Theta 衡量每天损失多少价值，而它不是常数：多数定价模型里剩余时间是开平方的，所以越临近到期衰减越快。最后 30 天每天的成本，远高于最初 30 天。这就是为什么远期期权感觉从容，两周期权感觉像倒计时。",
        },
        { type: "h2", text: "IV Crush：事件在被定价之后才发生" },
        {
          type: "p",
          text: "财报前隐含波动率会抬升，因为市场必须为一个很宽的结果区间定价。数字一出，不确定性解除，隐含波动率随之回落，而且往往很快。看涨期权可能方向完全正确却仍然亏钱，因为它付的波动率溢价蒸发得比内在价值增长得更快。卖方是镜像：他们收下这次塌陷，同时承担尾部风险。",
        },
        { type: "h2", text: "0DTE 到底改变了什么" },
        {
          type: "ul",
          items: [
            "Gamma 变得极端：标的小幅波动就会让 Delta 剧烈变化，持仓风险每分钟都在变。",
            "价差变宽、滑点变大，因为所有人都在同一到期日上交易。",
            "没有「以后再对」的时间——合约当天了结，所以你的判断必须有一个日内催化剂。",
            "止损必须在下单前定好；对当日到期期权「补仓摊平」不是策略，是倒计时。",
          ],
        },
        { type: "h2", text: "先画盈亏图" },
        {
          type: "p",
          text: "把行权价、权利金、数量填进盈亏工具，只看两个数：最大亏损，以及到期盈亏平衡价。如果平衡价要求的波动大于市场隐含的波动幅度，你买的不是一个观点，而是一个比市场更极端的观点。",
        },
        { type: "h2", text: "三个看起来像运气不好的错误" },
        {
          type: "ul",
          items: [
            "事件前买短期限期权并持有过事件：方向对了，波动率塌了。",
            "为了收权利金卖期权却没有明确的最坏情形：权利金很小，尾部不封顶。",
            "忽略美式合约的提前行权，尤其是分红前后和深度实值的持仓。",
          ],
        },
        { type: "h2", text: "流动性：同 Delta 的两个合约，成本不一样" },
        {
          type: "p",
          text: "期权没有统一盘口。远月、深度虚值、冷门行权价的合约，买卖价差占权利金的比例可能是近月主力合约的好几倍。同样是 Delta 0.4，一个价差 1%，另一个 8%——进场就先亏掉后者。",
        },
        {
          type: "p",
          text: "用中间价做回测会系统性高估收益：回测按中间价成交，真实成交发生在价差的另一端。对高频或短线策略，这个假设足以把正期望变成负期望。",
        },
        {
          type: "p",
          text: "判断流动性只需看三件事：成交量和持仓量、买卖价差宽度、行权价间隔。三个都差的时候，最好的做法不是找更便宜的权利金，而是换一个合约。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Can I lose money on a call when the stock rises?",
          a: "Yes. If implied volatility falls enough after an event, the volatility premium can shrink by more than the intrinsic value gains.",
        },
        {
          q: "Are weekly options riskier than monthlies?",
          a: "They decay faster and carry more gamma per unit of time, so the same position size produces larger swings. Risk per contract is lower; risk per day is higher.",
        },
        {
          q: "What is the maximum loss when buying an option?",
          a: "The premium paid. Selling options without a hedge has a very different, and potentially much larger, risk profile.",
        },
        {
          q: "Does early assignment matter for small positions?",
          a: "It can. Deep in-the-money American calls around a dividend date are the classic case, and it costs you the dividend or a forced cash outlay.",
        },
      ],
      "zh-CN": [
        {
          q: "股票涨了，看涨期权还会亏吗？",
          a: "会。如果事件后隐含波动率跌得足够多，波动率溢价的缩水可以超过内在价值的增长。",
        },
        {
          q: "周期权比月期权风险更大吗？",
          a: "衰减更快、单位时间内的 Gamma 更高，同样仓位波动更大。单张风险更低，每日风险更高。",
        },
        {
          q: "买期权的最大亏损是多少？",
          a: "已付的权利金。卖出未对冲的期权是完全不同的风险结构，潜在亏损可以大得多。",
        },
        {
          q: "小仓位也需要关心提前行权吗？",
          a: "需要。分红前后深度实值的美式看涨是典型案例，代价是丢掉股息或被要求提前出资。",
        },
      ],
    },
    links: {
      en: [
        { label: "Options payoff tool", href: "/tools/options" },
        { label: "Risk, reward and expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "24-hour markets vs closing bells", href: "/learn/crypto-vs-equity-volatility" },
      ],
      "zh-CN": [
        { label: "期权盈亏计算器", href: "/tools/options" },
        { label: "风险回报比与期望值", href: "/learn/risk-reward-expectancy" },
        { label: "24 小时交易 vs 收盘制", href: "/learn/crypto-vs-equity-volatility" },
      ],
    },
    sourceNote: {
      en: "Contract rules vary by product and exchange; confirm specifications with the exchange before trading. No strategy here is a recommendation.",
      "zh-CN":
        "合约规则因产品与交易所而异，交易前请以交易所规格为准。本文不构成任何策略建议。",
    },
  },
  {
    slug: "crypto-vs-equity-volatility",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "24-hour markets vs a 4-hour close: why the same leverage is a different risk",
      "zh-CN": "24 小时交易 vs 4 小时收盘：同样的杠杆，风险并不一样",
    },
    summary: {
      en: "A closing bell manufactures overnight gaps; round-the-clock trading removes them but never lets you step away. Two different risks, routinely compared as if they were one.",
      "zh-CN": "收盘制造了隔夜跳空；全天候交易消除了跳空，却也不给你下班的权利。两种不同的风险，却经常被当成一种来比较。",
    },
    paragraphs: {
      en: [
        "Leverage is a number. Risk is a number divided by volatility, and volatility depends on when the market is open.",
        "That is why a 3x position is not the same trade in two markets.",
      ],
      "zh-CN": [
        "杠杆是一个数字，风险是「这个数字除以波动率」，而波动率取决于市场什么时候开门。",
        "这就是为什么 3 倍杠杆在两个市场里根本不是同一笔交易。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: in equity markets, risk arrives in a 6.5-hour session plus a gap you cannot trade through. In crypto, risk is continuous, so position size must be calibrated on volatility per unit of time, not on the leverage label.",
        },
        { type: "h2", text: "How a closing bell shapes volatility" },
        {
          type: "p",
          text: "A closing price is an administrative fact: trading stops, and the next print may be far away. News arriving overnight is absorbed into the opening auction, producing a gap. That gap is why a stop order is not a guarantee — it becomes a market order once the market reopens, at whatever price is available.",
        },
        { type: "h2", text: "Crypto has no overnight gap, and no off switch" },
        {
          type: "p",
          text: "Continuous trading removes the gap but also removes the pause. There is no close at which you can reassess with a clear head, and no session boundary that limits how fast a position can move. Liquidity also thins at certain hours and at weekends, so the same order size has a different footprint depending on when it hits the book.",
        },
        { type: "h2", text: "Convert leverage into distance, not conviction" },
        {
          type: "table",
          head: ["Annualised volatility", "Daily move (1σ)", "3x position: move to lose most of the margin"],
          rows: [
            ["30%", "≈1.6%", "≈33%, or roughly 20 daily sigmas"],
            ["60%", "≈3.1%", "≈33%, or roughly 11 daily sigmas"],
            ["90%", "≈4.7%", "≈33%, or roughly 7 daily sigmas"],
            ["120%", "≈6.3%", "≈33%, or roughly 5 daily sigmas"],
          ],
          caption:
            "Daily sigma = annual volatility ÷ √365. The distance to liquidation is fixed by leverage; how often you get there is set by volatility. Fees and maintenance margin make the real distance shorter.",
        },
        {
          type: "note",
          text: "A single-day five-sigma move sounds impossible and is not: over hundreds of days, tail events accumulate. This is why the same 3x feels manageable in a quiet market and fatal in a volatile one.",
        },
        { type: "h2", text: "Perpetual futures add a cost that equities do not have" },
        {
          type: "p",
          text: "Perpetual contracts have no expiry, so exchanges use a funding payment between longs and shorts to keep the contract near spot. Funding is charged repeatedly, and in trending markets it can persist in one direction for a long time. A position that is directionally right can still bleed through funding — a cost with no direct equivalent in a cash equity position.",
        },
        { type: "h2", text: "Sizing a cross-market book" },
        {
          type: "p",
          text: "Allocate by risk contribution, not by capital: position size × volatility should be roughly equal across sleeves. A 20% crypto sleeve at 60% volatility contributes far more risk than a 60% equity sleeve at 18%. Equal capital weights produce a portfolio that is mostly a crypto bet wearing a diversified label.",
        },
        { type: "h2", text: "Three comparisons that do not work" },
        {
          type: "ul",
          items: [
            "Comparing drawdowns without noting that one market closes and the other does not.",
            "Treating a stop as protection in a market that can gap through it.",
            "Assuming lower leverage is safer across markets without looking at volatility per day.",
          ],
        },
        { type: "h2", text: "Estimating the annual cost of funding" },
        {
          type: "p",
          text: "Perpetual funding usually settles every eight hours. At 0.01% per settlement that is 0.03% a day, or roughly 11% a year. It is direction-independent: you pay that before forming any view on price.",
        },
        {
          type: "p",
          text: "In a one-directional market funding persists on one side, with longs paying shorts for extended periods. Crucially it is charged on notional exposure — at 3x leverage the same rate applies to three times your own capital, and the annual cost triples with it.",
        },
        {
          type: "table",
          head: ["Funding per 8h", "Daily", "Annualised", "3x notional, annualised"],
          rows: [
            ["0.01%", "0.03%", "≈11%", "≈33%"],
            ["0.03%", "0.09%", "≈33%", "≈99%"],
            ["0.05%", "0.15%", "≈55%", "≈165%"],
          ],
          caption:
            "Simplified continuous estimate over 365 days, ignoring compounding and rate changes. Funding floats with supply and demand and can be negative — shorts paying longs.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：股票市场的风险集中在 6.5 小时的交易时段，外加一个你无法在其中交易的跳空；加密的风险是连续的，所以仓位必须按「单位时间的波动」来定，而不是按杠杆标签来定。",
        },
        { type: "h2", text: "收盘如何塑造波动" },
        {
          type: "p",
          text: "收盘价是一个行政事实：交易停止，下一个成交可能离得很远。隔夜消息被吸收进开盘集合竞价，于是产生跳空。跳空正是止损单不等于保险的原因——开盘后它变成市价单，按当时能成交的价格成交。",
        },
        { type: "h2", text: "加密没有隔夜跳空，但也没有关机键" },
        {
          type: "p",
          text: "连续交易消除了跳空，也消除了暂停。没有一个收盘让你冷静重估，也没有时段边界限制持仓变化的速度。某些时段和周末流动性会更薄，同样的下单量在不同时点对盘口的冲击完全不同。",
        },
        { type: "h2", text: "把杠杆换算成距离，而不是信心" },
        {
          type: "table",
          head: ["年化波动率", "日波动（1σ）", "3 倍杠杆：亏掉大部分保证金需要跌多少"],
          rows: [
            ["30%", "≈1.6%", "≈33%，约 20 个日标准差"],
            ["60%", "≈3.1%", "≈33%，约 11 个日标准差"],
            ["90%", "≈4.7%", "≈33%，约 7 个日标准差"],
            ["120%", "≈6.3%", "≈33%，约 5 个日标准差"],
          ],
          caption:
            "日标准差 = 年化波动率 ÷ √365。到爆仓的距离由杠杆固定，多久走到那里由波动率决定。手续费与维持保证金会让真实距离更短。",
        },
        {
          type: "note",
          text: "单日五个标准差听起来不可能，其实并不：几百个交易日累积下来，尾部事件总会发生。这就是同一个 3 倍在安静行情里显得可控、在剧烈行情里致命的原因。",
        },
        { type: "h2", text: "永续合约多了一项股票没有的成本" },
        {
          type: "p",
          text: "永续合约没有到期日，交易所用多空之间的资金费把价格锚在现货附近。资金费按周期反复收取，在单边行情里可能长时间朝同一个方向。方向做对了的仓位，也可能被资金费慢慢磨掉——现金股票没有对应的成本。",
        },
        { type: "h2", text: "跨市场组合怎么配" },
        {
          type: "p",
          text: "按风险贡献配，不按资金占比配：各部分的「仓位 × 波动率」应大致相等。20% 的加密仓位、60% 的波动率，贡献的风险远大于 60% 的股票仓位、18% 的波动率。等资金权重配出来的组合，其实是「一个加密货币的赌注穿了件分散化的外套」。",
        },
        { type: "h2", text: "三种无效的对比" },
        {
          type: "ul",
          items: [
            "比回撤却不提一个市场会收盘、另一个不会。",
            "把一个会跳空穿过的止损当成保护。",
            "只看杠杆数字判断哪个更安全，不看每日波动。",
          ],
        },
        { type: "h2", text: "资金费的年化成本怎么估" },
        {
          type: "p",
          text: "资金费通常每 8 小时结算一次。按每次 0.01% 计算：一天 0.03%，一年约 11%。这个数字和方向无关，是纯粹的持有成本——你还没开始判断行情，就已经付了这笔钱。",
        },
        {
          type: "p",
          text: "单边行情里资金费会持续偏向一边，多头长期付钱给空头。更关键的是，资金费按名义仓位计算：3 倍杠杆下，同样的费率相当于占用自有资金的 3 倍，年化成本也随之三倍。",
        },
        {
          type: "table",
          head: ["每次资金费（8 小时）", "日成本", "年化", "3 倍名义仓位的年化"],
          rows: [
            ["0.01%", "0.03%", "≈11%", "≈33%"],
            ["0.03%", "0.09%", "≈33%", "≈99%"],
            ["0.05%", "0.15%", "≈55%", "≈165%"],
          ],
          caption:
            "按 365 天连续计息简化估算，未考虑复利与费率变动。实际资金费随市场供需波动，可能为负（空头付钱给多头）。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is crypto more volatile than equities?",
          a: "Usually, and materially so on an annualised basis. The practical point is not the ranking but that position sizing must be recalculated per market.",
        },
        {
          q: "Do stop orders work in crypto?",
          a: "They execute, but during thin liquidity or a fast move the fill can be far from the trigger — the same slippage problem equities have at the open.",
        },
        {
          q: "What is funding in perpetual futures?",
          a: "A periodic payment between longs and shorts that keeps the contract near spot. It is a holding cost that never appears on a stock position.",
        },
        {
          q: "Can I use the same leverage in both markets?",
          a: "You can, but the risk will not be the same. Match risk contribution instead: lower leverage where volatility is higher.",
        },
      ],
      "zh-CN": [
        {
          q: "加密一定比股票波动大吗？",
          a: "通常是的，按年化口径差距明显。但真正的结论不是排名，而是每个市场都要重新算仓位。",
        },
        {
          q: "加密里的止损单有效吗？",
          a: "会执行，但在流动性薄或快速行情中，成交价可能离触发价很远——和股票开盘时的滑点问题同源。",
        },
        {
          q: "永续合约的资金费是什么？",
          a: "多空之间定期支付、用来把合约价格锚在现货附近的费用。它是持有成本，股票现货没有对应项。",
        },
        {
          q: "两个市场可以用同样的杠杆吗？",
          a: "可以用，但风险不同。应该按风险贡献对齐：波动率高的地方，杠杆要更低。",
        },
      ],
    },
    links: {
      en: [
        { label: "Risk, reward and expectancy", href: "/learn/risk-reward-expectancy" },
        { label: "Options expiry and IV crush", href: "/learn/options-expiry-iv-crush" },
        { label: "Multi-market overview", href: "/markets" },
      ],
      "zh-CN": [
        { label: "风险回报比与期望值", href: "/learn/risk-reward-expectancy" },
        { label: "期权到期日与 IV Crush", href: "/learn/options-expiry-iv-crush" },
        { label: "多市场行情总览", href: "/markets" },
      ],
    },
    sourceNote: {
      en: "Sigma calculations assume a normal distribution, which understates tails in practice. Figures are illustrative of the relationship, not forecasts of any asset's volatility.",
      "zh-CN":
        "标准差计算假设正态分布，实际会低估尾部。表中数字用于说明关系，不是对任何资产波动率的预测。",
    },
  },
];

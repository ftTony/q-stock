import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * Consolidated from three thin indicator articles (RSI, Bollinger Bands, ATR).
 * The merge adds two things the originals could not carry alone: the
 * collinearity trap when volatility expands, and a worked ATR-to-size example.
 */
export const LEARN_ARTICLES_MERGED_VOLATILITY: LearnArticle[] = [
  {
    slug: "indicator-volatility-toolkit",
    category: "basics",
    ctaHref: "/tools/position",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      "zh-CN": "RSI、布林带与 ATR：波动率的三种读法，都不是方向",
      en: "RSI, Bollinger Bands and ATR: three ways to read volatility, none of them a direction",
    },
    summary: {
      "zh-CN":
        "一个量动量、一个画包络、一个量幅度。三者会随同一件事一起变化，所以「三个指标同时报警」往往只是一个信号说了三遍。",
      en:
        "One measures momentum, one draws an envelope, one measures distance. All three move with the same underlying change, so three warnings are often one signal repeated.",
    },
    paragraphs: {
      "zh-CN": [
        "RSI 把涨跌幅压成 0 到 100，布林带把波动画成上下两条轨道，ATR 告诉你最近一根 K 线平均走多远。它们的共同点是：都在描述价格「动得怎么样」，没有一个在描述「往哪走」。把它们放在一起，正好能看清波动率这个概念的三个侧面。",
      ],
      en: [
        "RSI compresses gains and losses onto a 0–100 scale. Bollinger Bands draw volatility as an envelope. ATR tells you how far a typical bar has travelled. What they share: all three describe how price is moving, none describes where it is going. Read together, they map three sides of one concept.",
      ],
    },
    sections: {
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：这三个指标最有价值的用法不是「找买卖点」，而是「定环境」和「定尺度」。环境决定你的规则适不适用，尺度决定你的止损和仓位该多大。方向仍然要回到价格结构去看。",
        },
        { type: "h2", text: "三个指标，三个不同的问题" },
        {
          type: "table",
          head: ["指标", "回答什么", "不回答什么", "典型误用"],
          rows: [
            ["RSI", "近期上涨与下跌的相对强度", "价格是否贵、是否该反转", "把 70/30 当成自动买卖线"],
            ["布林带", "价格相对自身近期分布的位置", "突破会往哪个方向走", "把上轨当阻力、下轨当支撑"],
            ["ATR", "近期平均波动幅度（含跳空）", "方向、趋势强度", "看到 ATR 低就认为风险低"],
          ],
        },
        { type: "h2", text: "RSI：0 到 100 的动量刻度" },
        {
          type: "p",
          text: "RSI 把一段窗口内的上涨幅度与下跌幅度压成一个比例，常见默认周期是 14，但平台和算法可能不同。70 和 30 是参考线，不是市场必须掉头的位置——强趋势里 RSI 可以长期停在高位，这正是「钝化」这个词的由来。",
        },
        {
          type: "p",
          text: "「超买」更准确的理解是「近期上涨相对强」，不能翻译成「马上要跌」；「超卖」也不等于「便宜」。RSI 衡量的是过去一段时间的动量，它不知道公司的价值，也不知道明天有没有财报。",
        },
        {
          type: "p",
          text: "趋势和区间里的读法完全不同。区间市场里，RSI 从极端回到中性区可以帮你观察摆动；强趋势里，过早把高 RSI 当卖出理由，等于持续与趋势对抗。先看价格结构，再决定 RSI 能不能提供额外信息。",
        },
        { type: "h2", text: "布林带：把波动画成包络" },
        {
          type: "p",
          text: "布林带通常是「一条均线 + 上下各若干倍标准差」。常见的 20 期、2 倍标准差只是常用设置，不是所有市场的最优组合。它把趋势位置和近期波动放在同一张图上，方便看价格相对自身近期分布的位置。",
        },
        {
          type: "p",
          text: "上轨不是固定阻力，下轨也不是固定支撑。强势行情会沿着上轨走，持续下跌会贴着下轨走。把「碰上轨就卖、碰下轨就买」当通则，会在趋势里不断逆势。",
        },
        {
          type: "p",
          text: "轨道变宽说明近期波动增加，变窄说明波动收敛。但收口只说明过去一段时间波动低，不会告诉你下一次扩张朝上还是朝下。这一点常被误读成「收口必有大行情」——行情方向仍然是另一件事。",
        },
        { type: "h2", text: "ATR：价格的波动尺" },
        {
          type: "p",
          text: "真实波幅通常取三者最大值：当日高低差、当日高点与前收盘之差、当日低点与前收盘之差。取最大值是为了把隔夜跳空算进去。ATR 再对这个序列做平滑，得到一个以价格为单位、含跳空的波动尺度。",
        },
        {
          type: "p",
          text: "ATR 上升说明每根 K 线的平均波动扩大，不代表上涨动能增强；ATR 下降说明波动收缩，也不保证即将突破。急涨和急跌都会让 ATR 变大——它没有方向信息，这是它和其他两个指标最大的区别。",
        },
        { type: "h2", text: "为什么 ATR 不能跨标的直接比较" },
        {
          type: "p",
          text: "ATR 的单位是价格。股价 5 元的 ATR 0.5 和股价 500 元的 ATR 0.5，代表的相对波动差了一百倍。跨标的比较要看 ATR 占价格的比例（常称 ATR%），并且确认币种、复权、周期和计算窗口一致。",
        },
        {
          type: "table",
          head: ["标的", "价格", "ATR(14)", "ATR%", "含义"],
          rows: [
            ["A", "5.00", "0.50", "10.0%", "单日平均波动约一成，属于高波动"],
            ["B", "500.00", "0.50", "0.1%", "同样数值，但几乎可以忽略"],
          ],
          caption: "同样的 ATR 数值，含义可以相差两个数量级。",
        },
        { type: "h2", text: "波动放大时，三个指标会一起变" },
        {
          type: "p",
          text: "这是把三者放在一起看才能真正看清的事：当市场波动突然放大时，布林带会变宽、ATR 会上升、RSI 更容易触及极端区域。三个指标同时「报警」，其实只是同一件事被记了三遍。",
        },
        {
          type: "p",
          text: "所以别把「RSI 超买 + 触及上轨 + ATR 飙升」当成三重确认。它们高度相关，尤其在高波动时段。真正独立的信息来自价格结构、成交量、事件日历和更大周期，而不是同一份波动的更多变形。",
        },
        { type: "h2", text: "把 ATR 用对：先定风险，再定仓位" },
        {
          type: "p",
          text: "ATR 最实用的场景不是判断方向，而是给止损距离一个与波动匹配的尺度。举一组具体数字：股价 50 元，ATR 为 1.5 元，你选择 2 倍 ATR 作为止损距离，即 3 元；账户权益 10 万元，单笔风险预算 1%，即 1,000 元。可买数量 = 1,000 ÷ 3 ≈ 333 股，名义金额约 16,650 元。",
        },
        {
          type: "p",
          text: "同一组参数下，如果这个标的的 ATR 变成 3 元，止损距离变成 6 元，可买数量就降到 166 股。仓位自动收缩——这正是「波动大的标的自动买少一点」的实现方式，不需要你临场凭感觉调。",
        },
        {
          type: "p",
          text: "但要清楚边界：倍数越大距离越宽，单笔潜在损失也越大；ATR 基于历史数据，覆盖不了跳空、停牌和流动性缺口。止损是否合理，最终还取决于你的假设在什么价位失效，而不是只取决于波动统计。",
        },
        { type: "h2", text: "参数不是调出来的" },
        {
          type: "p",
          text: "14 期、20 期、2 倍标准差——这些都是约定，不是自然常数。不断换参数直到历史曲线好看，只会把规则拟合到那段历史。更稳的做法是：选一组常见参数固定下来，先记录它在趋势和震荡两种环境下的表现，再谈要不要改。",
        },
        { type: "h2", text: "练习" },
        {
          type: "ul",
          items: [
            "固定参数，分别挑一段趋势和一段震荡，记录 RSI 触及极端后价格实际做了什么。",
            "比较收口前后布林带宽度的变化，看突破方向是否真的可预测（多数时候不可）。",
            "在同一标的记录 ATR 与 ATR%，标记财报前后波动是否改变。",
            "用仓位工具演算不同止损距离下的名义仓位，确认它是随波动自动收缩的。",
          ],
        },
        {
          type: "p",
          text: "三个指标都不预测方向。它们能做的是：让你知道现在是什么环境，以及在这个环境里应该承担多大的风险。这两件事比猜方向更容易做到，也更影响长期结果。",
        },
      ],
      en: [
        {
          type: "p",
          text: "Short version: the useful job of these three is not finding entries but setting context and scale. Context decides whether your rules apply; scale decides how big your stop and position should be. Direction still has to come from price structure.",
        },
        { type: "h2", text: "Three indicators, three different questions" },
        {
          type: "table",
          head: ["Indicator", "Answers", "Does not answer", "Typical misuse"],
          rows: [
            ["RSI", "Relative strength of recent gains vs losses", "Whether price is expensive or must reverse", "Treating 70/30 as automatic triggers"],
            ["Bollinger Bands", "Where price sits relative to its recent distribution", "Which way a breakout will go", "Reading the bands as fixed support and resistance"],
            ["ATR", "Average recent movement, gaps included", "Direction or trend strength", "Assuming low ATR means low risk"],
          ],
        },
        { type: "h2", text: "RSI: a 0–100 momentum scale" },
        {
          type: "p",
          text: "RSI compresses gains and losses over a window into a ratio. Fourteen periods is the common default, though platforms differ. The 70 and 30 lines are references, not levels where price must turn — in strong trends RSI can sit high for weeks, which is what “persistence” means in practice.",
        },
        {
          type: "p",
          text: "“Overbought” means recent gains are strong relative to the window, not that price must fall. “Oversold” does not mean cheap. RSI measures past momentum; it knows nothing about valuation or tomorrow's earnings.",
        },
        {
          type: "p",
          text: "Read it differently in trends and ranges. In a range, a return from an extreme can describe a swing. In a strong trend, fading every high reading means consistently opposing the trend. Look at structure first, then decide whether RSI adds anything.",
        },
        { type: "h2", text: "Bollinger Bands: volatility as an envelope" },
        {
          type: "p",
          text: "Usually a moving average with bands set a number of standard deviations away. Twenty periods and two deviations are familiar settings, not universal optima. The bands put trend position and recent volatility on one chart, showing where price sits relative to its own recent distribution.",
        },
        {
          type: "p",
          text: "The upper band is not fixed resistance and the lower band is not fixed support. Strong markets ride the upper band; persistent declines hug the lower one. Fading every touch means repeatedly trading against the trend.",
        },
        {
          type: "p",
          text: "Widening bands mean recent volatility rose; narrowing means it fell. A squeeze only says the past was quiet — it says nothing about the direction of the next expansion. That distinction is routinely lost in “squeeze means a big move is coming” claims.",
        },
        { type: "h2", text: "ATR: a ruler for movement" },
        {
          type: "p",
          text: "True range is the largest of three distances: the bar's high-low range, the high versus the prior close, and the low versus the prior close. Taking the maximum is what folds overnight gaps into the measure. ATR smooths that series into a volatility scale expressed in price units.",
        },
        {
          type: "p",
          text: "Rising ATR means bars are travelling further, not that upward momentum is building. Falling ATR means movement contracted, not that a breakout is due. Sharp advances and sharp declines both raise it — ATR carries no direction, which is its main difference from the other two.",
        },
        { type: "h2", text: "Why ATR is not comparable across symbols" },
        {
          type: "p",
          text: "ATR is denominated in price. An ATR of 0.5 on a 5-yuan stock and 0.5 on a 500-yuan stock describe relative movement two orders of magnitude apart. Compare ATR as a percentage of price (ATR%), and confirm currency, adjustment, timeframe, and window are consistent.",
        },
        {
          type: "table",
          head: ["Symbol", "Price", "ATR(14)", "ATR%", "Meaning"],
          rows: [
            ["A", "5.00", "0.50", "10.0%", "Roughly a tenth of price per day — high volatility"],
            ["B", "500.00", "0.50", "0.1%", "Same number, practically negligible"],
          ],
          caption: "Identical ATR values can mean wildly different things.",
        },
        { type: "h2", text: "When volatility expands, all three move together" },
        {
          type: "p",
          text: "This is the point that only shows up when you read them side by side: when volatility jumps, bands widen, ATR rises, and RSI reaches extremes more easily. Three warning lights are often one event recorded three times.",
        },
        {
          type: "p",
          text: "So “RSI overbought plus upper-band touch plus spiking ATR” is not triple confirmation. They are highly correlated, especially in high-volatility regimes. Independent information comes from structure, volume, the event calendar, and higher timeframes.",
        },
        { type: "h2", text: "Using ATR correctly: risk first, then size" },
        {
          type: "p",
          text: "ATR's most practical use is not direction but scaling a stop to current volatility. Worked example: a 50-yuan stock with ATR of 1.5; you choose two ATR as the stop distance, so 3 yuan. Equity is 100,000 with a 1% risk budget, so 1,000 yuan. Shares = 1,000 ÷ 3 ≈ 333, notional about 16,650 yuan.",
        },
        {
          type: "p",
          text: "If the same symbol's ATR rises to 3 yuan, the stop distance becomes 6 and size falls to about 166 shares. Position size contracts automatically — this is how “buy less of the volatile name” happens without discretionary judgement in the moment.",
        },
        {
          type: "p",
          text: "Know the limits: a larger multiple widens the stop and the potential loss per trade; ATR is historical and cannot cover gaps, halts, or liquidity holes. Whether a stop makes sense still depends on where your thesis actually fails, not only on volatility statistics.",
        },
        { type: "h2", text: "Parameters are not tuned, they are chosen" },
        {
          type: "p",
          text: "Fourteen periods, twenty periods, two deviations — conventions, not constants. Changing parameters until the backtest looks good fits the rule to that history. Pick a common set, fix it, and record how it behaves in trends and ranges before discussing changes.",
        },
        { type: "h2", text: "Practice" },
        {
          type: "ul",
          items: [
            "Fix parameters, then compare a trend and a range segment: what actually happened after RSI hit an extreme?",
            "Compare band width before and after squeezes and check whether breakout direction was really predictable.",
            "Log ATR and ATR% on one symbol and mark whether earnings changed the reading.",
            "Run the position tool at different stop distances and confirm size shrinks as volatility rises.",
          ],
        },
        {
          type: "p",
          text: "None of the three forecasts direction. What they can do is tell you which regime you are in and how much risk that regime justifies. Both are more achievable than guessing direction, and both matter more over time.",
        },
      ],
    },
    faq: {
      "zh-CN": [
        {
          q: "RSI 到 70 就该卖吗？",
          a: "不该自动卖。70 只说明近期上涨相对强，强趋势里 RSI 可以长时间停在高位。先看价格结构有没有走坏，再决定这个读数有没有额外价值。",
        },
        {
          q: "布林带收口意味着要突破了吗？",
          a: "收口只说明过去一段时间波动收敛，不指示下一次扩张的方向。方向要另找依据，比如结构、成交量或事件。",
        },
        {
          q: "ATR 低的股票风险就低吗？",
          a: "不一定。ATR 基于历史波动，低波动期之后可能出现跳空或事件冲击，停牌和流动性缺口也不在计算范围内。",
        },
        {
          q: "止损设几倍 ATR 合适？",
          a: "没有通用答案。倍数越大距离越宽、单笔潜在损失越大，仓位要相应缩小。常见做法是 1.5–3 倍，但关键是先定风险预算再反推仓位，而不是先定倍数。",
        },
        {
          q: "三个指标都指向同一个方向，是不是更可靠？",
          a: "不一定。它们都从同一份价格序列算出，波动放大时会同时变化。这种「一致」很多时候是同一个信号说了三遍。",
        },
      ],
      en: [
        {
          q: "Should I sell when RSI hits 70?",
          a: "Not automatically. Seventy only means recent gains were strong relative to the window; strong trends can keep RSI elevated for a long time. Check whether structure has actually deteriorated first.",
        },
        {
          q: "Does a Bollinger squeeze mean a breakout is coming?",
          a: "It means volatility contracted. It says nothing about the direction of the next expansion. Direction needs separate evidence — structure, volume, or an event.",
        },
        {
          q: "Does low ATR mean low risk?",
          a: "No. ATR is historical; quiet periods can be followed by gaps or event shocks, and halts or liquidity holes are outside its scope.",
        },
        {
          q: "How many ATR should a stop be?",
          a: "There is no universal answer. A larger multiple widens the stop and the potential loss, so size must shrink. 1.5–3 ATR is common, but set the risk budget first and derive size from it.",
        },
        {
          q: "If all three point the same way, is it more reliable?",
          a: "Not necessarily. They are computed from the same series and move together when volatility expands. That agreement is often one signal repeated three times.",
        },
      ],
    },
    links: {
      "zh-CN": [
        { label: "仓位与止损计算器", href: "/tools/position" },
        { label: "均线与 MACD：趋势和动量两把尺", href: "/learn/indicator-trend-momentum" },
        { label: "五种 K 线反转形态", href: "/learn/candle-reversal-patterns" },
        { label: "风险回报比与期望值", href: "/learn/risk-reward-expectancy" },
      ],
      en: [
        { label: "Position and stop calculator", href: "/tools/position" },
        { label: "Moving averages and MACD", href: "/learn/indicator-trend-momentum" },
        { label: "Five candlestick reversal patterns", href: "/learn/candle-reversal-patterns" },
        { label: "Risk-reward and expectancy", href: "/learn/risk-reward-expectancy" },
      ],
    },
    sourceNote: {
      "zh-CN":
        "文中的价格与 ATR 数字均为示例，用于说明计算关系，不构成对任何标的的推荐。ATR% 请按同一周期、同一复权口径计算后再比较。",
      en:
        "Price and ATR figures are illustrative arithmetic, not recommendations for any symbol. Compute ATR% on a consistent timeframe and adjustment basis before comparing.",
    },
  },
];

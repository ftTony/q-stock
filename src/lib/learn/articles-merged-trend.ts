import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * Consolidated from two thin indicator articles (moving averages, MACD).
 * The merge adds the point neither article could make alone: MACD's DIF is
 * just the distance between two EMAs, so "MA cross + MACD cross" is not two
 * independent confirmations — it is one measurement counted twice.
 */
export const LEARN_ARTICLES_MERGED_TREND: LearnArticle[] = [
  {
    slug: "indicator-trend-momentum",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: "2026-11-10",
    title: {
      "zh-CN": "均线与 MACD：趋势和动量两把尺，都不是买卖按钮",
      en: "Moving averages and MACD: two rulers, neither a buy button",
    },
    summary: {
      "zh-CN":
        "MA、EMA、DIF、柱体其实是同一份价格的不同折法。搞清它们的从属关系，就不会把「双重确认」当成两个独立证据。",
      en:
        "MA, EMA, DIF and the histogram are different folds of the same price series. Once you see the lineage, “double confirmation” stops looking like two independent proofs.",
    },
    paragraphs: {
      "zh-CN": [
        "均线把一段价格压成一条线，MACD 把两条均线的距离画成柱体。它们看起来是两个人，其实是同一个人换了衣服：价格先走，均线跟上，MACD 描述均线之间的差距。理解这层从属关系，比记住「金叉买、死叉卖」有用得多。",
      ],
      en: [
        "A moving average flattens a window of prices into one line. MACD draws the distance between two of those lines as a histogram. They look like two witnesses but they are one witness in different clothes: price moves, the averages follow, MACD measures the gap between them. Understanding that lineage is worth more than memorizing cross signals.",
      ],
    },
    sections: {
      "zh-CN": [
        {
          type: "p",
          text: "结论先给：均线和 MACD 都只能回答描述性问题——价格在均线上方还是下方、推进在加速还是减速。它们回答不了「现在该不该买」，因为那还取决于你的持有期、仓位和能承受多少回撤。",
        },
        { type: "h2", text: "均线是滞后摘要，不是趋势的轨道" },
        {
          type: "p",
          text: "均线看起来像一条价格沿着的轨道，但它是滞后的统计摘要：价格先变，均线随后才转向。所以均线交叉不是市场发出的命令，更像提醒你回头检查结构有没有变。",
        },
        {
          type: "p",
          text: "趋势行情里，价格可以长期偏离均线却不回来；横盘市场里，价格反复穿线，产生连续的假交叉。同一个参数在两种环境下的表现完全相反——「均线策略时灵时不灵」的真正原因是环境换了，不是参数没调对。",
        },
        { type: "h2", text: "SMA 与 EMA：快不等于准" },
        {
          type: "table",
          head: ["", "SMA（简单移动平均）", "EMA（指数移动平均）"],
          rows: [
            ["权重", "窗口内每个收盘价等权", "近期价格权重更高"],
            ["反应速度", "慢，拐点晚", "快，拐点早"],
            ["噪声敏感度", "低，假信号少一些", "高，容易被短期波动带走"],
            ["适用场景", "想看结构本身，不想频繁改判断", "想在转折早期得到提示，并接受更多假信号"],
          ],
          caption:
            "两种线没有高下，只有取舍。表格回答的是「你想要什么」，不是「哪个更准」。",
        },
        {
          type: "p",
          text: "「更快」不等于「更准」。EMA 反应快，代价是更容易被一天的波动带偏；在震荡市里，这个代价会以连续假交叉的形式付出来。选哪种线，取决于你观察的时间尺度，以及你能承受多少次改主意。",
        },
        { type: "h2", text: "MACD 的三个零件" },
        {
          type: "p",
          text: "常见算法先算两条不同周期 EMA 的差值（DIF），再对 DIF 平滑得到信号线（DEA），柱体是两者之差。不同平台对柱体是否乘二、用什么平滑方式这些细节可能不同，读图前先确认当前产品的口径。",
        },
        {
          type: "ul",
          items: [
            "DIF 上穿信号线：短期动量相对走强，这是「金叉」的实质。",
            "柱体变长：两条线的距离在扩大，推进在加速。",
            "柱体缩短：距离在收敛，推进在减速——注意，减速不等于反向。",
            "零轴：只是 DIF 的正负位置，不是多空分界线。",
          ],
        },
        { type: "h2", text: "均线和 MACD 是同一份价格的两种折法" },
        {
          type: "p",
          text: "这是本文最想说清的一点：DIF 本身就是两条 EMA 的差值。也就是说，MACD 金叉和「快慢均线交叉」在数学上高度相关，只是 MACD 多了一层平滑。同时看两者，得到的不是两个独立证据，而是同一个测量被数了两遍。",
        },
        {
          type: "p",
          text: "这解释了一个常见困惑：为什么「均线金叉 + MACD 金叉」同时出现时，胜率并没有想象中高。因为它们本来就会同时出现。真正独立的证据来自别处——成交量、波动率、更大周期的结构、事件日历，而不是另一个从同一价格序列里算出来的指标。",
        },
        {
          type: "note",
          text: "在 /markets 打开个股页的 K 线，把本文说的结构亲手标一遍；用 /multi-chart 把同一标的的日线和周线并排，看看「大周期优先」长什么样。AI 读图可以帮你念出当前均线与 MACD 的状态，但「交叉发生在什么位置」这个问题，得你带着语境自己回答。",
        },
        { type: "h2", text: "三个最常见的误读" },
        {
          type: "table",
          head: ["常见说法", "问题在哪", "更好的问法"],
          rows: [
            ["金叉买、死叉卖", "把描述性指标当成交互指令，忽略了环境", "当前是趋势还是区间？交叉发生在什么位置？"],
            ["零轴之上就是多头", "零轴只是 DIF 的正负，没有分界意义", "均线是倾斜还是缠绕？价格结构有没有抬高？"],
            ["顶背离就是见顶", "背离只说明两种度量没同步，不提供时间", "价格结构什么时候失效？什么价位会推翻这个判断？"],
          ],
          caption:
            "三句话的共同毛病：把描述当指令、把相关当确认、把线索当结论。",
        },
        { type: "h2", text: "背离为什么会让人上头" },
        {
          type: "p",
          text: "价格创新高、MACD 没有同步创新高，说明这波推进没有被动量确认。这是个有用的复核线索，但它有两个致命弱点：不告诉你何时转向，而且在强趋势里可以持续很久。",
        },
        {
          type: "p",
          text: "更麻烦的是确认偏误。背离几乎总能在事后找到——因为你可以自由选择比较哪两个波峰。要看它是否有用，必须在事前标出两个比较点、固定周期，然后记录后续走势，包括那些背离之后趋势继续走了很久的案例。",
        },
        { type: "h2", text: "一个能复现的练习" },
        {
          type: "ul",
          items: [
            "只留一条你能解释的均线，先标出高低点结构，再看均线多提供了什么信息。",
            "把同一段行情分成趋势段和震荡段，分别统计交叉次数与假信号比例。",
            "固定一个周期与参数，把每次信号连同环境、后续走势和失效价记进 /watchlist，提醒设在失效价上。",
            "想改参数时，先开一个新版本再回放，别在原记录上改——否则历史会变成你想要的样子。",
          ],
        },
        {
          type: "p",
          text: "这套练习的目的不是找出最好的参数，而是让你看见：在什么环境下这套工具好用，在什么环境下它只会不断让你改主意。后者通常比前者更有价值。",
        },
      ],
      en: [
        {
          type: "p",
          text: "Short version: both tools only answer descriptive questions — is price above or below the average, is the push accelerating or fading. They cannot answer “should I buy now,” because that also depends on your horizon, position size, and drawdown tolerance.",
        },
        { type: "h2", text: "An average is a lagging summary, not a track" },
        {
          type: "p",
          text: "A moving average looks like a rail price travels along, but it is a lagging summary: price moves first and the line turns afterwards. A cross is therefore not a command from the market; it is a prompt to check whether structure changed.",
        },
        {
          type: "p",
          text: "In trends, price can stay extended from the average for a long time. In ranges, price crosses repeatedly and generates a stream of false signals. The same parameter behaves in opposite ways in the two regimes — which is the real reason “the MA strategy works sometimes”: the environment changed, not the tuning.",
        },
        { type: "h2", text: "SMA vs EMA: faster is not more accurate" },
        {
          type: "table",
          head: ["", "SMA", "EMA"],
          rows: [
            ["Weighting", "Equal weight across the window", "More weight on recent prices"],
            ["Reaction", "Slower, later turns", "Faster, earlier turns"],
            ["Noise", "Lower, fewer whipsaws", "Higher, easily dragged by one session"],
            ["Best for", "Reading structure without changing your mind often", "Early hints, accepting more false signals"],
          ],
          caption:
            "Neither line is better; they trade off differently. The table answers what you want, not which is more accurate.",
        },
        {
          type: "p",
          text: "Faster is not more accurate. An EMA reacts sooner and pays for it with sensitivity to a single day's move; in a range, that bill arrives as consecutive false crosses. Choose based on the horizon you are watching and how often you can afford to change your mind.",
        },
        { type: "h2", text: "The three parts of MACD" },
        {
          type: "p",
          text: "The common construction subtracts a slower EMA from a faster one to get DIF, smooths DIF into a signal line, and plots the difference as a histogram. Platforms differ on details such as whether the histogram is multiplied by two, so confirm the convention you are looking at.",
        },
        {
          type: "ul",
          items: [
            "DIF crossing above the signal line: short-term momentum improving — what a “golden cross” actually is.",
            "Histogram growing: the two lines are separating, the push is accelerating.",
            "Histogram shrinking: they are converging — deceleration, not reversal.",
            "Zero line: simply where DIF changes sign, not a bull/bear border.",
          ],
        },
        { type: "h2", text: "MACD is the same price series folded differently" },
        {
          type: "p",
          text: "This is the point neither of the original articles could make alone: DIF is literally the distance between two EMAs. A MACD cross and a fast/slow MA cross are mathematically close relatives, with MACD adding smoothing. Reading both is not two independent confirmations — it is one measurement counted twice.",
        },
        {
          type: "p",
          text: "That explains a familiar puzzle: why “MA cross plus MACD cross” does not deliver the hit rate people expect. They co-occur by construction. Independent evidence comes from elsewhere — volume, volatility, higher-timeframe structure, the event calendar — not from another transform of the same closes.",
        },
        {
          type: "note",
          text: "Open the symbol chart in /markets and mark the structure by hand; put the same name's daily and weekly side by side in /multi-chart to see what “higher timeframe wins” looks like. AI chart read can read out the current MA and MACD state, but where the cross occurred is a question only you can answer with context.",
        },
        { type: "h2", text: "Three common misreadings" },
        {
          type: "table",
          head: ["Common claim", "What is wrong", "Better question"],
          rows: [
            ["Golden cross buy, death cross sell", "Treats a description as an instruction and ignores regime", "Is this a trend or a range? Where did the cross occur?"],
            ["Above zero means bullish", "The zero line is just the sign of DIF", "Are the averages sloping or tangled? Is structure rising?"],
            ["Divergence means the top is in", "Divergence only shows two measures disagreeing; it gives no timing", "What would invalidate the structure, and at what price?"],
          ],
          caption:
            "All three share the same flaw: description mistaken for instruction, correlation mistaken for confirmation, a clue mistaken for a conclusion.",
        },
        { type: "h2", text: "Why divergence is so seductive" },
        {
          type: "p",
          text: "Price makes a new high, MACD does not, and the push looks unconfirmed. That is a useful review cue with two weaknesses: it says nothing about timing, and in strong trends it can persist for months.",
        },
        {
          type: "p",
          text: "Worse is confirmation bias. Divergence can almost always be found afterwards because you are free to choose which two peaks to compare. To test whether it works, mark the two points and the timeframe before the outcome is known, then record what followed — including the cases where the trend kept going.",
        },
        { type: "h2", text: "A reproducible exercise" },
        {
          type: "ul",
          items: [
            "Keep one average you can explain; mark swing structure first, then ask what the line adds.",
            "Split one market into trend and range segments and count crosses and false signals in each.",
            "Fix a period and parameter set; log each signal with its regime, what followed, and its invalidation into /watchlist, with the alert placed at the invalidation.",
            "When you want to change a parameter, start a new version instead of editing the old record — otherwise history becomes what you want it to be.",
          ],
        },
        {
          type: "p",
          text: "The goal is not the best parameter. It is seeing where the tool helps and where it only makes you change your mind repeatedly. The second finding is usually worth more.",
        },
      ],
    },
    faq: {
      "zh-CN": [
        {
          q: "均线和 MACD 应该用哪个？",
          a: "它们高度相关：DIF 就是两条 EMA 的差值。选一个你能解释清楚的即可，同时看两个不会带来额外信息，只会让你以为证据更多。",
        },
        {
          q: "为什么均线策略在震荡市里一直亏？",
          a: "因为震荡市里价格反复穿线，交叉信号大量失效。均线描述趋势，本身没有识别区间的能力，需要先用结构或波动率判断环境。",
        },
        {
          q: "MACD 柱体缩短是不是要反转了？",
          a: "柱体缩短只说明两条线在收敛，即推进在减速。减速可以演变成反转，也可以在整理后继续原方向，它本身不给方向。",
        },
        {
          q: "背离出现后应该怎么处理？",
          a: "把它当作复核线索而不是交易信号：先确认两个比较点同周期，再检查价格结构有没有走坏，最后写下什么价位会让这个判断作废。",
        },
      ],
      en: [
        {
          q: "Should I use moving averages or MACD?",
          a: "They are close relatives: DIF is the difference between two EMAs. Pick the one you can explain. Watching both adds no information, only the illusion of more evidence.",
        },
        {
          q: "Why does an MA strategy bleed in ranging markets?",
          a: "Because price crosses repeatedly and most signals fail. Averages describe trend; they cannot detect a range. Judge the regime first using structure or volatility.",
        },
        {
          q: "Does a shrinking MACD histogram mean a reversal?",
          a: "It means the lines are converging — the push is decelerating. Deceleration can become a reversal or resume after consolidation. It carries no direction on its own.",
        },
        {
          q: "What should I do when I see divergence?",
          a: "Treat it as a review cue, not a signal: confirm both points are on the same timeframe, check whether structure has actually deteriorated, and write down what price would void the reading.",
        },
      ],
    },
    links: {
      "zh-CN": [
        { label: "五种 K 线反转形态", href: "/learn/candle-reversal-patterns" },
        { label: "RSI、布林带与 ATR：波动率的三种读法", href: "/learn/indicator-volatility-toolkit" },
        { label: "规则实验室六个模板：双均线交叉在教什么", href: "/learn/strategy-lab-six-templates" },
        { label: "支撑与阻力带子", href: "/learn/stocks-support-resistance" },
        { label: "打开行情图对照练习", href: "/markets" },
        { label: "多图同屏", href: "/multi-chart" },
      ],
      en: [
        { label: "Five candlestick reversal patterns", href: "/learn/candle-reversal-patterns" },
        { label: "RSI, Bollinger Bands and ATR", href: "/learn/indicator-volatility-toolkit" },
        { label: "The six Rule Lab templates", href: "/learn/strategy-lab-six-templates" },
        { label: "Support and resistance zones", href: "/learn/stocks-support-resistance" },
        { label: "Open a chart and compare", href: "/markets" },
        { label: "Multi-chart view", href: "/multi-chart" },
      ],
    },
    sourceNote: {
      "zh-CN":
        "MACD 参数以 12/26/9 为常见默认，不同平台在平滑方式与柱体倍数上可能不同。本文示例只用于说明结构关系，不构成参数推荐，也不构成投资建议。",
      en:
        "12/26/9 is the common MACD default; platforms differ on smoothing and histogram scaling. Examples here illustrate structure, not recommended parameters, and nothing here is investment advice.",
    },
  },
];

import type { LearnArticle } from "@/lib/learn/types";

export const LEARN_ARTICLES_INDICATOR_SERIES: LearnArticle[] = [
  {
    slug: "indicator-moving-averages",
    category: "basics",
    ctaHref: "/markets",
    title: {
      "zh-CN": "移动平均线：读节奏，不追交叉",
      "zh-TW": "移動平均線：讀節奏，不追交叉",
      en: "Moving averages: read the rhythm, not just the cross",
    },
    summary: {
      "zh-CN": "MA 与 EMA 都是对过去价格的平滑；它们描述趋势，不提前知道转折。",
      "zh-TW": "MA 與 EMA 都是對過去價格的平滑；它們描述趨勢，不會預先知道轉折。",
      en: "MA and EMA smooth past prices. They describe trend; they do not know turns in advance.",
    },
    paragraphs: {
      "zh-CN": [
        "移动平均线把一段时间的价格压成一条线，帮助眼睛减少日常波动的干扰。它看起来像趋势的轨道，但本质上是滞后的统计摘要：价格先走，均线随后才改变方向。均线交叉因此不是市场发出的命令，更像是提醒你检查结构是否已经变化。",
        "简单移动平均线（SMA）对窗口内每个收盘价等权；指数移动平均线（EMA）给近期价格更高权重，所以反应通常更快，也更容易受短期噪声影响。“更快”不等于“更准”。选择哪种线，取决于你要观察的时间尺度和能否承受频繁变化。",
        "周期也不是自然常数。20 日线不是所有市场参与者共同认可的边界，50 日线也不会因为常用就自动成为支撑。周期越短，反应快但波动多；周期越长，线更平滑但转向更慢。与其不断寻找完美参数，不如选少数周期并固定一段时间，让记录有可比性。",
        "均线更适合回答描述性问题：价格大体在均线上方还是下方？均线倾斜还是缠绕？回落时价格是否仍守住此前结构？它们不适合单独回答“现在该不该买”。趋势行情里，价格可以长期偏离均线；横盘市场里，价格会反复穿线，产生连续的假交叉。",
        "练习时只保留一条你能解释的均线，先在图上标出高低点结构，再观察均线提供了什么额外信息。把信号触发、当时环境、后续变化和失效情况一起记下来。不要只回看那些交叉后立刻走出趋势的图。",
        "钱力股图表支持 MA / EMA。你可以用模拟交易练习固定规则，再在复盘里区分“均线描述对了”和“交易结果碰巧有利”。均线是观察工具，不是收益保证；本文仅供学习，不构成投资建议。",
      ],
      "zh-TW": [
        "移動平均線把一段價格壓成一條線，減少日常波動干擾，但本質是滯後摘要：價格先走，均線之後才轉向。交叉是檢查結構的提示，不是市場命令。",
        "SMA 對窗口內收盤價等權；EMA 給近期價格較高權重，通常反應較快，也更容易受短期雜訊影響。更快不代表更準。週期也不是天然支撐，短週期反應快但雜訊多，長週期平滑但轉向慢。",
        "均線適合描述價格在其上或下、線條傾斜或纏繞，以及回檔是否破壞結構；不適合單獨回答是否買入。趨勢中價格可長期偏離，盤整時則會反覆穿線。",
        "練習時只留一條能解釋的均線，先標出高低點，再記錄均線多提供了什麼資訊及何時失效。錢力股圖表支援 MA / EMA，可用模擬與複盤練習固定規則。本文僅供學習，不構成投資建議。",
      ],
      en: [
        "A moving average compresses a window of prices into one line, but it is a lagging summary: price moves first. A cross is a prompt to inspect structure, not an instruction from the market.",
        "An SMA weights observations in its window equally. An EMA gives recent prices more weight and usually reacts faster, which can also mean more noise. Faster does not mean more accurate. Periods are conventions, not natural support levels.",
        "Use averages to describe whether price is above or below the line, whether it slopes or tangles, and whether a pullback changes the structure. In trends price can remain extended; in ranges it can repeatedly cross and whipsaw.",
        "Practice with one line, mark swing structure first, and record both useful and failed observations. Q-Stock charts support MA and EMA; paper trading and review can test whether you followed a consistent rule. Educational content only, not investment advice.",
      ],
    },
  },
  {
    slug: "indicator-macd",
    category: "basics",
    ctaHref: "/markets",
    title: {
      "zh-CN": "MACD：动能变化，不是买卖按钮",
      "zh-TW": "MACD：動能變化，不是買賣按鈕",
      en: "MACD: changing momentum, not a buy or sell button",
    },
    summary: {
      "zh-CN": "DIF、信号线与柱体都来自价格均线；交叉要放回趋势和区间中解释。",
      "zh-TW": "DIF、訊號線與柱體都來自價格均線；交叉要放回趨勢和區間中解讀。",
      en: "DIF, signal line, and histogram derive from moving averages; interpret crosses in context.",
    },
    paragraphs: {
      "zh-CN": [
        "MACD 常被简化成“金叉买、死叉卖”，但它并没有独立于价格的新信息。常见算法先计算两条不同周期 EMA 的差值（DIF），再对 DIF 做平滑得到信号线；柱体展示两者之间的距离。不同平台对柱体是否乘以二等细节可能不同，读图时应以当前产品口径为准。",
        "DIF 与信号线交叉，表示短期动量相对变化；柱体变长或缩短，则显示两条线之间的差距正在扩大或收敛。它们描述的是已发生价格走势的另一种视角，不意味着资金必然流入或趋势必然反转。",
        "MACD 通常在持续趋势里更容易读出推进与减速；在窄幅震荡中，线条可能多次交叉，产生来回失效的提示。零轴上下也只能作为相对位置参考，不是多空分界的铁律。周期、波动和价格缺口都会影响它的反应。",
        "背离尤其容易被过度解释。价格创出新高而 MACD 没有同步创新高，说明两种度量没有同步增强，可以作为复核线索；它不能告诉你价格何时转向，也可能在强趋势里持续很久。先标出两个比较的波峰或波谷，确保周期一致，再观察后续是否出现结构变化。",
        "一个可复现的练习是：先判断图表处在趋势还是区间，再记录 MACD 的交叉或柱体变化发生在哪里。事前写下什么后续价格行为会支持或推翻你的解释。若只在走势结束后挑出“漂亮背离”，那是图表故事，不是经过检验的规则。",
        "钱力股支持在个股图表查看 MACD。可以把同一套观察规则用于模拟盘，再复盘震荡行情里的假交叉比例。MACD 不应单独决定仓位；本文仅供学习，不构成投资建议。",
      ],
      "zh-TW": [
        "MACD 常被簡化成「金叉買、死叉賣」，但它仍來自價格均線。常見算法先計算兩條 EMA 差值（DIF），再平滑成訊號線；柱體顯示兩線差距。各平台細節可能不同。",
        "交叉表示動量相對變化，柱體擴大或收斂表示兩線距離改變；它們不代表資金必然流入，也不保證趨勢反轉。趨勢行情較容易閱讀推進與減速，盤整時則可能反覆交叉。",
        "背離只表示價格與指標沒有同步創高或創低，是複核線索，不會指出轉向時間。強趨勢中背離可能持續很久。比較時要用相同週期的波峰或波谷。",
        "練習時先判斷趨勢或區間，再記錄交叉位置、後續走勢和推翻條件。錢力股圖表支援 MACD，可用模擬與複盤檢查假交叉。本文僅供學習，不構成投資建議。",
      ],
      en: [
        "MACD is often reduced to “golden cross buy, death cross sell,” but it is derived from price averages. A common version subtracts a slower EMA from a faster one (DIF), smooths that result into a signal line, and displays their distance as a histogram. Implementations can differ in scaling.",
        "Crosses and changing bars describe relative momentum, not guaranteed flows or reversals. MACD can be easier to interpret in persistent trends and especially noisy in ranges. The zero line is a reference, not a universal boundary.",
        "Divergence means price and the indicator did not make matching extremes. It can prompt a review, but cannot time a turn and may persist in strong trends. Compare like-for-like swings on the same timeframe.",
        "Record the market regime, indicator event, later price behavior, and what would invalidate your read. Q-Stock charts support MACD; paper trading and review can expose repeated whipsaws. Educational content only, not investment advice.",
      ],
    },
  },
  {
    slug: "indicator-rsi",
    category: "basics",
    ctaHref: "/markets",
    title: {
      "zh-CN": "RSI：超买超卖是状态描述，不是反转预告",
      "zh-TW": "RSI：超買超賣是狀態描述，不是反轉預告",
      en: "RSI: overbought and oversold describe conditions, not turns",
    },
    summary: {
      "zh-CN": "理解 RSI 的区间、钝化与背离，避免把 70 和 30 当成自动交易线。",
      "zh-TW": "理解 RSI 的區間、鈍化與背離，避免把 70 和 30 當成自動交易線。",
      en: "Understand RSI ranges, persistence, and divergence without treating 70 and 30 as triggers.",
    },
    paragraphs: {
      "zh-CN": [
        "RSI 把一段窗口内的上涨与下跌幅度压缩到 0 到 100 的尺度上。常见默认周期是 14，但平台、周期和计算方式可能不同。70 和 30 是常见参考线，不是市场必须掉头的边界；价格持续上涨时，RSI 可以长时间处在较高区域。",
        "“超买”更准确的理解是近期上涨相对强，不能直接翻译成“价格马上要跌”；“超卖”表示近期下跌相对强，也不等于价格已经便宜。指标衡量的是过去一段时间的动量，不衡量公司的价值、未来事件或某个价位的承接能力。",
        "趋势与区间里的 RSI 读法不同。区间市场里，指标触及极端区域后回到区间内，可能帮助观察短期摆动；强趋势里，过早把高 RSI 当成卖出理由，容易一直与趋势对抗。先看价格结构，再决定 RSI 是否能提供额外信息。",
        "RSI 背离同样不是时点预测。价格继续走低而 RSI 低点抬高，说明动量指标没有同步恶化；它提示可以检查卖压是否减弱，但不能证明底部已形成。若价格不断刷新低点，背离可能反复出现并失效。",
        "练习时固定一个周期与参数，挑选趋势和横盘各一段，标记 RSI 进入高低区域时价格实际发生什么。记录它在趋势中钝化多久、在区间里是否更有参考价值。不要只统计“后来反转”的例子，也要统计指标极端后趋势继续的情况。",
        "钱力股图表支持 RSI。把它用于模拟观察而非自动下单，并在复盘时写下当时的市场状态和失效条件。RSI 是动量工具，不是估值或买卖结论；本文仅供学习，不构成投资建议。",
      ],
      "zh-TW": [
        "RSI 把一段窗口內的漲跌幅度壓縮到 0 至 100。常見週期為 14，但平台和計算方式可能不同。70、30 是參考線，不是價格必須轉向的邊界；強勢行情中 RSI 可長時間停留高檔。",
        "「超買」表示近期上漲相對強，不等於馬上會跌；「超賣」表示近期下跌相對強，也不代表價格便宜。RSI 衡量過去動能，不衡量公司價值或未來事件。",
        "區間市場裡，極端值回到區間可能提供擺動線索；強趨勢中，太早因高 RSI 看空容易與趨勢對抗。背離也只提示動能未同步，不會證明底部已成。",
        "練習時固定參數，比較趨勢和盤整中的表現，並記錄 RSI 極端後趨勢仍延續的案例。錢力股圖表支援 RSI，可用模擬和複盤練習。本文僅供學習，不構成投資建議。",
      ],
      en: [
        "RSI compresses recent gains and losses into a 0–100 scale. Fourteen periods is common, but implementations vary. The familiar 70 and 30 levels are reference zones, not boundaries where price must reverse; strong trends can keep RSI elevated.",
        "“Overbought” means recent upward momentum is strong relative to the window, not that price must fall. “Oversold” does not mean an asset is cheap. RSI measures past momentum, not value or future events.",
        "In ranges, a return from an extreme may help describe a swing. In strong trends, fading every high RSI reading can mean repeatedly opposing the trend. Divergence can invite a check for weakening momentum, but it does not establish a bottom.",
        "Hold the period constant and compare trend and range examples, including cases where an extreme persisted. Q-Stock charts support RSI; use simulation and review to assess context, not as an automatic order rule. Educational content only.",
      ],
    },
  },
  {
    slug: "indicator-bollinger-bands",
    category: "basics",
    ctaHref: "/markets",
    title: {
      "zh-CN": "布林带：波动区间，不是自动支撑压力",
      "zh-TW": "布林通道：波動區間，不是自動支撐壓力",
      en: "Bollinger Bands: a volatility envelope, not automatic support",
    },
    summary: {
      "zh-CN": "中轨与上下轨帮助观察波动和相对位置；触轨、收口都不单独给出方向。",
      "zh-TW": "中軌與上下軌幫助觀察波動和相對位置；觸軌、收口都不會單獨給出方向。",
      en: "The middle and outer bands show volatility and relative position; touches and squeezes are not directional signals.",
    },
    paragraphs: {
      "zh-CN": [
        "布林带通常由一条移动平均线和上下两条按标准差偏移的轨道构成。常见设置是 20 期均线、上下各两倍标准差，但这只是常用参数，不是所有市场的最优组合。它把趋势位置与近期波动放在同一张图上，便于观察价格相对自身近期分布的位置。",
        "上轨不是固定阻力，下轨也不是固定支撑。价格触及上轨，可能只是强势行情沿轨运行；触及下轨，可能是持续下跌的一部分。把“碰上轨就卖、碰下轨就买”当通则，会在趋势行情里不断逆势。",
        "轨道变宽通常意味着近期波动增加，变窄通常意味着波动收敛。但收口只说明过去一段时间波动较低，不会告诉你下一次扩张向上还是向下。突破轨道后也要看收盘是否持续、价格结构是否跟进，而不是仅凭盘中刺穿下结论。",
        "中轨是计算所用的均线，既可能作为趋势参照，也可能在横盘时被价格反复穿越。上下轨的距离会随历史波动变化，所以轨道宽度本身不是未来波动的保证。遇到财报、公告或突发事件，过去算出的带宽可能很快过时。",
        "练习时选一段趋势和一段区间，记录触轨后价格是沿轨走、回到中轨，还是继续穿越；再比较收口前后的波动变化。必须事先规定“触及”的定义：盘中最高价、收盘价还是连续多日收盘？口径一致，复盘才有意义。",
        "钱力股图表支持布林带。你可以保存图表观察，并把波动变化与模拟交易计划分开记录：指标描述环境，计划决定自己能承担什么风险。布林带不能预测突破方向，也不构成投资建议。",
      ],
      "zh-TW": [
        "布林通道通常由移動平均線和依標準差偏移的上下軌組成。常見設定是 20 期均線、上下兩倍標準差，但不是所有市場的最佳參數。它呈現價格相對近期波動的位置。",
        "上軌不是固定壓力，下軌也不是固定支撐。強勢行情可能沿上軌走，持續下跌也可能貼著下軌。收口只代表近期波動收斂，不會預告下一次擴張方向。",
        "軌道變寬通常表示近期波動增加；中軌是計算所用的均線，在盤整時可能被反覆穿越。財報或突發事件也可能讓歷史帶寬很快失效。",
        "練習時分別觀察趨勢和區間，記錄觸軌後沿軌、回中軌或穿越的情況，並事先定義觸及口徑。錢力股圖表支援布林帶；指標描述環境，不替你決定風險。本文僅供學習，不構成投資建議。",
      ],
      en: [
        "Bollinger Bands commonly pair a moving average with outer bands based on standard deviations. A 20-period average and two standard deviations are familiar settings, not universal optima. The bands show price relative to recent volatility.",
        "The upper band is not fixed resistance and the lower band is not fixed support. In trends, price can ride a band; fading every touch can mean repeatedly trading against that trend. A squeeze describes past contraction, not the direction of the next expansion.",
        "Widening bands usually indicate increasing recent volatility. The middle line is the average used in the calculation and can be crossed repeatedly in ranges. Events can quickly make historical band width less representative.",
        "Compare touches in trends and ranges, and define in advance whether a touch means intraday price or a close. Q-Stock charts support Bollinger Bands; record what the indicator describes separately from the risk in a paper plan. Bands do not forecast breakout direction. Educational content only.",
      ],
    },
  },
  {
    slug: "indicator-atr",
    category: "basics",
    ctaHref: "/tools/position",
    title: {
      "zh-CN": "ATR：衡量波动幅度，不判断涨跌方向",
      "zh-TW": "ATR：衡量波動幅度，不判斷漲跌方向",
      en: "ATR: measuring movement, not market direction",
    },
    summary: {
      "zh-CN": "真实波幅与 ATR 可帮助比较近期波动尺度；数值本身不告诉你该买、该卖或该设止损。",
      "zh-TW": "真實波幅與 ATR 可幫助比較近期波動尺度；數值本身不會告訴你該買、該賣或該設停損。",
      en: "True range and ATR describe recent movement size; neither tells you to buy, sell, or place a stop.",
    },
    paragraphs: {
      "zh-CN": [
        "ATR（平均真实波幅）回答的问题不是“价格往哪走”，而是“最近通常走多远”。单日真实波幅通常取当日高低差、当日高点与前收盘差的绝对值、当日低点与前收盘差的绝对值三者最大值；ATR 再对一段窗口的真实波幅做平滑。这样能把隔夜跳空也纳入波动尺度。",
        "ATR 上升说明近期每根 K 线的平均波动扩大，不代表上涨动能增强；ATR 下降说明波动收缩，也不保证即将突破。它没有方向信息：上涨很急和下跌很急都可能让 ATR 变大。",
        "ATR 是价格单位，而不是天然可跨标的比较的百分比。股价 5 元的 ATR 0.5 与股价 500 元的 ATR 0.5，代表的相对波动完全不同。跨标的比较时可以观察 ATR 相对于价格的比例（常称 ATR%），同时注意币种、复权、周期和计算窗口是否一致。",
        "有人把止损距离设成若干倍 ATR，以适应不同波动的标的。这只是规则的一种写法，不是通用风险标准。倍数越大，距离更宽，潜在单笔损失也可能更大；仓位必须相应考虑。止损是否合理还取决于交易假设何时失效，而不是只取决于波动统计。",
        "一个常见误用是看到 ATR 低就认为风险低。低波动时期之后可能出现跳空或事件冲击，止损成交价也可能与触发价不同。ATR 基于历史数据，不能覆盖所有尾部风险、流动性缺口或市场停牌。",
        "练习时在同一标的上记录 ATR 与 ATR% 的变化，标记财报或其他事件前后波动是否改变；再用仓位工具演算不同止损距离下的名义仓位和风险金额。不要把工具计算出的数量直接当作推荐仓位。",
        "目前可在钱力股用仓位工具练习风险预算，并结合图表记录波动观察；即使图表没有 ATR，也可以按公式在表格中复核。ATR 是波动尺，不是方向盘。本文仅供学习，不构成投资建议。",
      ],
      "zh-TW": [
        "ATR（平均真實波幅）回答的不是價格往哪走，而是近期通常走多遠。單日真實波幅取當日高低差、當日高點與前收差、當日低點與前收差三者最大值；ATR 再平滑一段期間的真實波幅，因此也納入跳空。",
        "ATR 上升表示近期平均波幅擴大，不等於上漲動能增強；下降也不保證即將突破。它沒有方向資訊，急漲和急跌都可能令 ATR 變大。",
        "ATR 是價格單位，不能直接跨不同價格標的比較。可參考 ATR 相對價格的比例（ATR%），並確認幣別、復權、週期和計算窗口一致。",
        "以若干倍 ATR 設停損只是某種規則，不是通用標準。距離放寬可能增加單筆潛在損失，部位也要考量。低 ATR 不代表沒有跳空、流動性或事件風險。",
        "練習時記錄 ATR 與 ATR% 變化，再用錢力股倉位工具演算不同風險距離。ATR 是波動尺，不是方向盤。本文僅供學習，不構成投資建議。",
      ],
      en: [
        "ATR asks how far price has moved recently, not which way it will move. True range is commonly the largest of the current high-low range, the distance from the current high to the prior close, and the distance from the current low to the prior close. ATR smooths true range over a chosen window, including gaps.",
        "A rising ATR indicates larger recent movement, not stronger upward momentum. A falling ATR does not promise a breakout. Both sharp advances and sharp declines can raise it.",
        "ATR is measured in price units, so it is not directly comparable across differently priced assets. ATR as a percentage of price can help, provided currency, adjustments, timeframe, and lookback are consistent.",
        "Using a multiple of ATR for a stop is one possible rule, not a universal risk standard. A wider distance can mean a larger potential loss unless position size is considered. Historical ATR cannot account for every gap, liquidity event, or halt.",
        "Track ATR and ATR% around different market conditions, then use Q-Stock's position tool to compare hypothetical risk amounts. The calculated size is not a recommendation. ATR is a volatility ruler, not a steering wheel. Educational content only.",
      ],
    },
  },
];

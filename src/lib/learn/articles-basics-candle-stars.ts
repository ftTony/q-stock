import type { LearnArticle } from "@/lib/learn/types";

export const LEARN_ARTICLE_CANDLE_STARS: LearnArticle = {
  slug: "candle-morning-evening-star",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "早晨之星与黄昏之星：三根 K 线也需要上下文",
    "zh-TW": "早晨之星與黃昏之星：三根 K 線也需要上下文",
    en: "Morning and evening stars: three candles still need context",
  },
  summary: {
    "zh-CN": "三根 K 线把趋势、犹豫和反向收盘连在一起；缺少趋势背景时，形态名字帮助有限。",
    "zh-TW": "三根 K 線把趨勢、猶豫和反向收盤連在一起；缺少趨勢背景時，形態名稱幫助有限。",
    en: "Three candles combine trend, hesitation, and a counter-direction close; without context, the label adds little.",
  },
  paragraphs: {
    "zh-CN": [
      "早晨之星和黄昏之星常被当作三根 K 线的反转组合来讲。早晨之星通常出现在一段下跌后：先有较明显的下跌实体，接着是一根较小实体或犹豫型 K 线，最后出现向上收盘、并进入第一根实体一定范围的 K 线。黄昏之星是上涨背景下的镜像。具体教材对跳空和中点的要求略有不同，先选定定义再观察，不要看完结果才改规则。",
      "中间那根“星”并不需要长得像星星。它主要表示这段时间的实体收窄、价格推进暂时停顿。停顿可能来自多空分歧，也可能是流动性、交易时段或消息影响；一根小实体并不能说明市场已经决定转向。",
      "第三根 K 线常被当作确认，因为它显示价格向相反方向推进，并收回第一根实体的一部分。收回的幅度越大，图形越符合某些常见定义；但“符合定义”与“之后上涨”是两个不同命题。一次向上收盘可以很快被下一次下跌抵消。",
      "跳空是跨市场使用时的难点。传统形态描述常强调第二根与前后实体之间的缺口，但在 24 小时交易市场或连续交易时段中，缺口可能很少，或者含义不同。若把严格跳空作为必要条件，可能筛掉大量案例；若完全忽略，又会把不同结构混在一起。清楚写明自己的定义，比宣称某种定义绝对正确更重要。",
      "位置仍是第一道筛选。早晨之星出现在一段下跌之后、靠近较大周期的区间边缘，与它出现在横盘中间，解读并不相同；黄昏之星也需要放在先前上涨和关键区间中理解。若此前没有清楚趋势，把“反转”挂在一个小波动上，容易把噪声命名成信号。",
      "练习可以按三步做：先遮住右侧未来走势，只标注趋势和三根 K 线是否符合事先定义；再写出可能的解释与失效条件；最后揭开后续图表，记录结果。这样能避免先看见上涨或下跌，再回头挑出“早晨之星”的后视镜偏差。",
      "也要避免无限叠加确认条件：形态、均线、MACD、成交量、新闻若都要同时同向，历史上总能找到一组漂亮案例，但规则可能已经过度适配。先用少量明确条件，再在不同标的和不同时间段检查表现；观察到的结果不代表未来概率不变。",
      "钱力股的图表和模拟盘可以作为练习场：在模拟之前写下趋势判断、形态定义、观察周期和失效条件，复盘时对照自己是否临时改口。模拟不包含全部真实成交和心理压力，也不能替代投资决策。",
      "三根 K 线提供的是一种组织观察的方式，不是行情转折的预报。本文仅供教育参考，不构成投资建议；实际数据、流动性和重大事件都可能让图形失去参考意义。",
    ],
    "zh-TW": [
      "早晨之星與黃昏之星常被視為三根 K 線的反轉組合。早晨之星通常出現在下跌後：先有較明顯的下跌實體，接著是較小實體或猶豫型 K 線，最後出現向上收盤並進入第一根實體一定範圍的 K 線；黃昏之星則是上漲背景下的鏡像。教材對跳空和中點的要求略有不同，應先選定定義再觀察。",
      "中間那根「星」不必真的像星星，主要表示實體收窄、價格推進暫停。這可能來自分歧、流動性、交易時段或消息，不能單憑小實體認定市場轉向。第三根若收回第一根實體部分區域，符合常見確認描述，但符合定義不等於之後必漲。",
      "跳空規則在不同市場差異很大，連續交易市場的缺口可能少見或含義不同。位置同樣重要：下跌後、靠近較大週期區間邊緣，與橫盤中段的解讀不同。沒有清楚趨勢時，容易把噪音命名成反轉。",
      "練習時先遮住右側走勢，記下趨勢、形態定義、可能解讀和失效條件，再看後續表現，避免後視鏡偏差。錢力股的圖表、模擬和複盤可用來練流程；三根 K 線不是行情預報。本文僅供學習，不構成投資建議。",
    ],
    en: [
      "The morning star and evening star are commonly taught as three-candle reversal combinations. A morning star follows a decline: a substantial down body, a smaller or indecisive candle, then an up candle that closes into part of the first body. The evening star mirrors this after an advance. Texts differ on gap and midpoint requirements, so choose a definition before inspecting outcomes.",
      "The middle “star” need not look like one. It mainly describes a pause or smaller real body. That pause may reflect disagreement, liquidity, sessions, or news; it does not prove that the market has chosen a new direction. The third candle is often treated as confirmation because it moves against the prior direction, but meeting a definition and predicting a profitable move are different claims.",
      "Gap rules are difficult to transfer across markets. Traditional descriptions may require gaps around the middle candle, while continuous markets rarely create the same session gaps. Location matters too: a pattern after a clear decline near a broader range boundary differs from a similar cluster in the middle of sideways trading.",
      "For practice, hide the chart to the right, mark the prior trend, apply your preselected definition, and write a possible interpretation and invalidation condition. Then reveal later candles and record the result. This limits hindsight selection. Avoid stacking so many indicators and news filters that only attractive historical examples survive.",
      "Use Q-Stock charts, simulation, and review to practice a repeatable process, while remembering that paper fills and emotions differ from live markets. Three candles organize observation; they are not a forecast. Educational content only, not investment advice.",
    ],
  },
};

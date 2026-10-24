import type { LearnArticle } from "@/lib/learn/types";

export const LEARN_ARTICLE_CANDLE_ENGULFING: LearnArticle = {
  slug: "candle-engulfing",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "吞没形态：被覆盖的是实体，不是未来",
    "zh-TW": "吞沒形態：被覆蓋的是實體，不是未來",
    en: "Engulfing patterns: the body is covered, not the future",
  },
  summary: {
    "zh-CN": "看涨与看跌吞没的关键在实体关系和出现位置，不能只凭颜色下结论。",
    "zh-TW": "看漲與看跌吞沒的關鍵在實體關係和出現位置，不能只憑顏色下結論。",
    en: "Bullish and bearish engulfing patterns depend on body relationships and location—not color alone.",
  },
  paragraphs: {
    "zh-CN": [
      "“吞没”这个名字很有画面感，容易让人误以为第二根 K 线把第一根的走势彻底抹掉了。实际识别时，常见定义关注的是第二根实体覆盖第一根实体；上下影线不一定被覆盖。它是价格关系的描述，不是买卖双方力量的完整记录，更不是对未来的承诺。",
      "看涨吞没通常指一根偏弱或下跌的实体之后，出现一根较大的上涨实体，并覆盖前一根实体；看跌吞没则相反。两根的开收位置要按具体市场图表核对。连续交易市场不一定像有隔夜休市的市场那样出现明显跳空，因此不宜把某一市场的图形标准机械搬到另一市场。",
      "位置比形状更重要。下跌一段时间后出现看涨吞没，可能提示短期卖压减弱或价格发生反向扩张；但如果它出现在横盘区中央，信息含量可能有限。上涨后出现看跌吞没也一样：它值得关注，却无法单独区分趋势反转、获利回吐或普通波动。",
      "看量时也要谨慎。相对活跃的成交量可能说明该时段参与度上升，但成交量并不会替你说明参与者身份和持仓意图。不同数据源对成交量、盘前盘后交易和复权的处理也可能不同。把成交量作为背景线索，而不是给形态盖章的认证。",
      "一种更稳的读法是把它拆成问题：之前价格沿什么方向运行？第二根实体覆盖了多少？收盘离重要区间边缘有多远？后续价格是否守住覆盖区间？如果市场环境或消息面发生变化，这个图形还值得用原来的解释吗？这样比“看涨吞没=买入”多了一层可检验性。",
      "失败情形同样要提前写。看涨吞没后价格若回到两根实体下方，甚至跌破前低，反转解释就变弱；看跌吞没后若价格迅速收复实体区间，空方解释也需降级。具体观察位应结合你的周期和计划，不存在所有标的通用的止损比例。",
      "练习时，先不要找“最漂亮的教科书案例”。在不同趋势和区间里各找一些符合定义的形态，记录后续数根 K 线的表现；再把连续上涨、横盘、快速反转分别统计。样本选择要事先定规则，不要只保留成功截图，否则容易把事后故事误当成稳定规律。",
      "在钱力股的图表中可切换日线与更大周期，并在模拟单或复盘里写下观察依据、风险预算和失效条件。模拟结果只用于练执行；少量历史样本不能证明某种形态能带来稳定收益。",
      "吞没形态是一种压缩后的价格描述。它能帮你整理观察，却不能代替对趋势、波动、事件和风险的判断。本文为学习材料，不构成投资建议。",
    ],
    "zh-TW": [
      "「吞沒」容易讓人以為第二根 K 線把第一根走勢完全抹掉。常見定義看的是第二根實體覆蓋第一根實體，影線不一定被覆蓋。這是價格關係的描述，不是買賣力量的完整紀錄，更不是對未來的承諾。",
      "看漲吞沒通常是偏弱或下跌實體之後，出現較大的上漲實體並覆蓋前一根實體；看跌吞沒則相反。不同市場的交易時段和跳空特性不同，應按實際圖表判讀，不宜照搬單一市場的標準。",
      "位置比形狀重要。下跌一段後出現看漲吞沒，可能提示賣壓減弱；若在橫盤中央，訊息可能有限。它無法單獨分辨趨勢反轉、獲利了結或一般波動。成交量也只是參與度線索，不會告訴你參與者身份與意圖。",
      "練習時記錄前段趨勢、實體覆蓋程度、收盤位置和後續走勢，並提前寫下什麼情況會推翻解讀。失敗案例要保留，不能只挑漂亮截圖。錢力股的圖表、模擬與複盤可用來練習流程；少量樣本不證明穩定收益。本文僅供學習，不構成投資建議。",
    ],
    en: [
      "The word “engulfing” sounds as if the second candle erases the first. Common definitions focus on the second real body covering the first real body; the shadows need not be covered. It is a description of price relationships, not a full account of who traded or a promise about what comes next.",
      "A bullish engulfing pattern is commonly described as a larger up body covering the prior down body; a bearish version reverses that sequence. Check the actual open and close on the chart. Markets differ in sessions and gaps, so a convention from one market should not be applied mechanically to another.",
      "Location matters more than a neat silhouette. After a sustained decline, a bullish engulfing candle may suggest pressure changed for that period; in the middle of a range it may add little. It cannot distinguish a reversal from profit-taking or ordinary volatility on its own. Volume can add context, but it does not reveal traders' identities or intentions.",
      "Turn the pattern into questions: what was the prior trend, how much of the prior body was covered, where did the second candle close, and did later prices hold the area? Decide in advance what would weaken the interpretation. Preserve failed examples and use consistent selection rules; otherwise hindsight can make a weak pattern look reliable.",
      "Use Q-Stock charts, paper trades, and reviews to practice documenting context, risk, and invalidation—not to prove an edge from a handful of examples. Engulfing candles organize observation; they do not replace judgment about trend, events, volatility, or risk. Educational content only, not investment advice.",
    ],
  },
};

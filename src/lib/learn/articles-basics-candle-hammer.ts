import type { LearnArticle } from "@/lib/learn/types";

export const LEARN_ARTICLE_CANDLE_HAMMER: LearnArticle = {
  slug: "candle-hammer-hanging-man",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "锤头线与上吊线：同一副外形，不同的上下文",
    "zh-TW": "錘頭線與上吊線：同一副外形，不同的上下文",
    en: "Hammer and hanging man: same shape, different context",
  },
  summary: {
    "zh-CN": "先看它出现在哪里，再看长下影；形状相同，不代表含义相同。",
    "zh-TW": "先看它出現在哪裡，再看長下影；形狀相同，不代表含義相同。",
    en: "Location comes before the long lower shadow. Similar candles do not imply the same context.",
  },
  paragraphs: {
    "zh-CN": [
      "一根 K 线下影很长，收盘却回到当天区间上部。有人看到它就喊“锤头”，接着把它当成抄底理由。问题是，图形只描述了一个交易时段里的价格范围，不会自动说明下一段行情。相同外形出现在下跌后，常被称为锤头线；出现在上涨后，常被称为上吊线。名称随位置变，证据并没有因此变强。",
      "常见的锤头线有小实体、较长下影和较短上影；一些教材用下影约为实体两倍作为便于识别的经验规则。它不是统一标准：实体接近零时比例会失真，不同市场的跳空、交易时段和最小价格单位也会影响外观。先把它当作候选形态，而不是精确到一条公式的信号。",
      "它能说明什么？当日价格曾明显走低，后来又从低点回升，收盘落在区间较高处。它不能单独证明有长期买盘进场，也不能告诉你下跌已经结束。盘中成交可能来自许多不同原因；仅凭一根蜡烛，无法知道是谁在买卖，更不能知道他们之后会不会继续。",
      "下跌趋势之后出现锤头线，值得观察的不是“底部已经到了”，而是卖方继续压低价格时，收盘是否仍能守住低位上方。下一根或之后几根 K 线若能维持在形态高点附近、并改善结构，才多了一层观察依据；若价格很快跌破长下影低点，原先的反转设想就需要重新评估。确认是后续信息，不是成功保证。",
      "同一外形若出现在一段上涨之后，常称为上吊线。长下影表示价格曾被压低，收盘虽回升，却未消除市场出现较大波动的事实。它可以提醒你检查趋势是否仍健康，但并不等于立刻做空；下一步仍要看后续收盘、关键价位和更大周期。",
      "最容易踩的坑，是只截取那一根 K 线，把前后的走势裁掉。判断前至少补上四项：之前是否有清晰趋势？形态发生在区间什么位置？后续价格有没有跟进？当时是否有财报、公告或流动性变化？脱离上下文，名字再标准也只是图案。",
      "练习时在图表里找几根外形接近的长下影线，分别标记它前面的走势、之后三根 K 线的表现，并写下什么情况会推翻你的解释。不要只挑后来上涨的例子；把失败的形态也留在笔记里，才能降低只记住成功案例的偏差。",
      "在钱力股可以切换图表周期、保存观察记录，再用模拟交易练习“先写条件、后看结果”。这不是自动交易规则，也不应拿一次成功证明形态有效。K 线形态适合帮助提出问题，不适合替你决定仓位或买卖。",
      "本文仅作教育用途。不同市场的交易时段、流动性、公司行动和数据源会影响图表；技术形态不保证反转，也不构成投资建议。",
    ],
    "zh-TW": [
      "一根 K 線下影很長，收盤卻回到當日區間上方。有人看到就稱它為「錘頭」，接著把它當成抄底理由。圖形描述的是一段交易時段內的價格範圍，不會自動說明下一段行情。同樣外形出現在下跌後常稱錘頭線，出現在上漲後則常稱上吊線；名稱隨位置改變，不代表證據變強。",
      "常見錘頭線有小實體、較長下影和較短上影；教材有時以「下影約為實體兩倍」作為辨識經驗值，但不是統一標準。實體接近零時比例會失真，不同市場的跳空、交易時段和最小跳動單位也會影響外觀。",
      "它只能說明當日價格曾走低，後來從低點回升，收盤在區間較高處；不能單獨證明長期買盤進場，也不能證明下跌已結束。下跌後出現時，觀察後續收盤是否守住低位上方；若很快跌破長下影低點，就應重新檢查原先解讀。確認是新資訊，不是成功保證。",
      "同一外形出現在一段上漲後，常稱上吊線。它提醒你檢查波動與趨勢，不等於立刻做空。練習時保留形態前後走勢，記下後續幾根 K 線和推翻解讀的條件；失敗案例也要記錄。錢力股可用圖表、觀察筆記和模擬交易練習流程，但形態不是下單指令。本文僅供學習，不構成投資建議。",
    ],
    en: [
      "A candle has a long lower shadow and closes near the top of its range. It is tempting to call it a hammer and treat it as a reason to buy. But a candle describes one period's price range; it does not reveal what happens next. The same shape after a decline is often called a hammer, while after an advance it is called a hanging man. Context changes the label, not the strength of the evidence.",
      "A textbook hammer often has a small real body, a long lower shadow, and little upper shadow. A lower shadow around twice the body is a common visual guideline, not a universal rule. Ratios become awkward with near-doji bodies, and gaps, sessions, and tick sizes vary across markets.",
      "The candle tells you price moved lower and then recovered before the close. It does not prove durable demand entered or that a decline has ended. After a decline, watch whether later closes hold above the low; a quick break below the shadow's low challenges the reversal interpretation. Confirmation is new information, not a guarantee.",
      "After an advance, the same shape is often called a hanging man. It can prompt a review of volatility and trend structure, but it is not an automatic short signal. Keep the surrounding chart, record what later candles do, and write down what would invalidate your read. Include failed examples, not only the ones that rallied.",
      "On Q-Stock, use the chart and notes to practice recording context before outcome; paper trading can rehearse a process, not prove a pattern. Candlestick shapes are prompts for questions, not position-sizing or buy/sell instructions. Educational content only; market structure and data quality vary, and no pattern guarantees a reversal.",
    ],
  },
};

import type { LearnArticle } from "@/lib/learn/types";

export const LEARN_ARTICLE_CANDLE_PIERCING: LearnArticle = {
  slug: "candle-piercing-dark-cloud",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "刺透线与乌云盖顶：看收盘位置，不猜转折",
    "zh-TW": "刺透線與烏雲蓋頂：看收盤位置，不猜轉折",
    en: "Piercing line and dark cloud cover: read the close, not a prophecy",
  },
  summary: {
    "zh-CN": "这对双 K 线形态关注第二根收盘进入前一实体的程度；跳空规则因市场而异。",
    "zh-TW": "這組雙 K 線形態關注第二根收盤進入前一實體的程度；跳空規則因市場而異。",
    en: "These two-candle patterns focus on how far the second close enters the prior body; gap conventions vary.",
  },
  paragraphs: {
    "zh-CN": [
      "刺透线和乌云盖顶是一对方向相反的双 K 线形态。它们都在意第二根 K 线的收盘，进入前一根实体的程度。记住这个关系，比背“刺透看涨、乌云看跌”更有用；因为如果不看前面的趋势和后续价格，形态名称并不能提供完整判断。",
      "常见的刺透线描述是：一根较明显的下跌实体之后，出现上涨实体，收盘进入前一根实体中点以上，但仍未超过前一根开盘附近。乌云盖顶则相反：上涨实体之后出现下跌实体，收盘压入前一实体中点以下。教材有时要求第二根开盘跳空越过前一根的低点或高点；实际市场的交易时段不同，是否有跳空不能机械作为通用条件。",
      "为什么看中点？它提供了一个可复核的参照：第二根收盘是否收复了前一实体相当一部分。它不是市场天然的分界线，也没有“超过中点就必然转向”的因果关系。用中点做筛选，只是让观察规则更明确，方便不同案例之间保持一致。",
      "刺透线若出现在下跌后的重要区间附近，可能值得观察价格是否停止持续走低；但若大趋势仍然向下，单根反弹也可能只是回撤。乌云盖顶若出现在上涨后的高位，可能提醒你关注价格推进是否受阻；但它也可能只是短期波动。位置、趋势和时间周期要一起看。",
      "跳空尤其容易造成误读。隔夜休市的股票可能在开盘时出现缺口，连续交易的数字资产通常没有相同意义的“隔夜开盘”；盘前盘后数据是否纳入也因平台而异。因此，不同市场出现的同名形态不一定拥有可直接比较的结构。先确认图表数据的交易时段与复权口径。",
      "观察后续时，可以预先定义：如果价格重新跌破刺透形态前的低位，原来的反转解释是否要撤回？如果乌云形态之后价格很快收复前一实体，是否应该降低看空解读？这不是让每个人使用同一个止损点，而是提醒你先说明什么证据会改变自己的看法。",
      "复盘练习：在图表上标出前一根实体的开收范围和中点，再观察第二根收盘进入多少。把符合与不符合教科书规则的案例分别记录，并标注市场、周期、趋势背景和后续表现。不要只收集“后来果然反转”的截图；同一标准也要用于失败案例。",
      "钱力股的图表可以帮助你保存观察，模拟交易和复盘则可检验自己有没有按事先写下的条件行动。若你在看完后续行情后才决定中点、跳空或趋势标准，记录就会变成事后解释，而不是有意义的练习。",
      "刺透线和乌云盖顶都只是一种形态语言。它们不预测确定方向，也不考虑全部基本面、流动性和事件风险。本文仅供学习，不构成投资建议。",
    ],
    "zh-TW": [
      "刺透線與烏雲蓋頂是一組方向相反的雙 K 線形態，重點是第二根收盤進入前一根實體的程度。記住這個關係，比只背「刺透看漲、烏雲看跌」更有用；若不看前段趨勢與後續價格，形態名稱並不完整。",
      "常見刺透線定義是：下跌實體後出現上漲實體，收盤進入前一實體中點以上，但未超過前一開盤附近。烏雲蓋頂則相反。教材有時要求跳空，但市場交易時段不同，跳空不能機械套用。",
      "中點只是可複核的參照，不是市場天然分界，也不代表越過就必然轉向。下跌後的刺透線可能值得觀察，但仍可能只是反彈；上漲後的烏雲蓋頂也可能只是短期波動。連續交易市場與有隔夜休市的市場，圖表跳空含義不同。",
      "練習時標出前一實體與中點，記錄第二根收盤進入程度、趨勢背景和後續表現，失敗案例也要保留。錢力股可用圖表、模擬和複盤檢查自己是否遵守預先條件。形態不預測確定方向，本文僅供學習，不構成投資建議。",
    ],
    en: [
      "The piercing line and dark cloud cover are opposing two-candle patterns. Both focus on where the second candle closes relative to the first candle's real body. That relationship is more useful than simply memorizing “piercing bullish, dark cloud bearish,” because context and later price action still matter.",
      "A common piercing-line description starts with a down body, followed by an up body that closes above the midpoint of the prior body but below its open. Dark cloud cover mirrors this after an up body. Some definitions require a gap at the second open. Sessions differ across markets, so a gap rule should not be applied mechanically.",
      "The midpoint is a repeatable reference, not a natural market boundary or a causal threshold. A piercing line after a decline may deserve attention, but can still be a short-lived bounce. Dark cloud cover after an advance may flag hesitation, but can also be ordinary volatility. Trend, location, and timeframe remain relevant.",
      "Gaps are especially market-dependent. Overnight equity sessions, continuous crypto trading, and whether extended-hours data is included produce different chart structures. Check session and adjustment settings before comparing examples. Record the prior body, its midpoint, the second close, context, and what later prices did—including failures.",
      "On Q-Stock, save the observation before reviewing outcomes; use paper trading and review to check whether you followed the conditions you wrote down. Choosing the midpoint or trend rule only after seeing what happened turns practice into hindsight. These patterns do not forecast a certain direction or account for all event and liquidity risks. Educational content only.",
    ],
  },
};

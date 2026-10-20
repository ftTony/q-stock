import type { LearnArticle } from "@/lib/learn/types";

/**
 * MA / MACD / RSI as aides — companion to kline-basics, not a signal cookbook.
 */
export const LEARN_ARTICLE_INDICATORS: LearnArticle = {
  slug: "indicators-lite",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "均线、MACD、RSI：辅助，不是圣杯",
    "zh-TW": "均線、MACD、RSI：輔助，不是聖杯",
    en: "MA, MACD, RSI: aides, not a holy grail",
  },
  summary: {
    "zh-CN": "三个常用指标各管一件事；先问结构与位置，再看线。失效时看什么，比背诵金叉更重要。",
    "zh-TW": "三個常用指標各管一件事；先問結構與位置，再看線。失效時看什麼，比背誦金叉更重要。",
    en: "Three common indicators, one job each. Structure and location first; know what failure looks like.",
  },
  paragraphs: {
    "zh-CN": [
      "指标区一打开，线就比价格还热闹。金叉、死叉、超买超卖——术语好记，真金白银时却常常互相打架：RSI 说超买，均线还在抬头；MACD 刚翻红，价格已经离支撑老远。问题多半不在指标「算错」，而在你指望它们替你做决定。",
      "我把常用三个拆开记，就不容易叠罗汉。均线管的是「价格大致贴着哪条节奏走」——多头排列、空头排列、走平缠绕，是在描述结构，不是发令枪。MACD 更像动能的温度计，柱子缩短、交叉，说的是力道变化，遇到震荡市会反复抽你耳光。RSI 盯的是一段窗口里的涨跌节奏，超买不等于立刻跌，超卖也不等于抄底许可证；趋势股可以「超买」很久，这点教科书常一带而过，实盘最疼。",
      "用法上有个顺序，比参数更值钱：先看 K 线结构（趋势还是震荡、处在相对高位还是低位），再决定要不要信眼前这根交叉。震荡里追每一次金叉，胜率会很难看；趋势里把每一次回踩当崩盘，也会错过该拿住的段。钱力股个股图里，先叠一条你盯得住的均线就够——很多人一上来均线、MACD、RSI 全开，屏幕花了，判断反而钝了。",
      "和站内功能怎么配合。价格提醒适合绑「结构位」或「均线附近的失效」，别绑「RSI 回到 30 我就梭哈」。AI 读图可以逼自己说清结构、关键价、什么情况推翻判断，但交叉验证仍要回到图上：读图结果和你肉眼看到的位置打架时，停手比抬杠重要。模拟盘里用同一套指标规则练几笔，复盘时记下「指标喊买、结构其实很差」的次数——这类笔记比再下一个指标公式管用。",
      "失效时看什么，我建议写成口头禅。均线：走平缠绕超过你设定的观察期，就承认趋势叙事暂时休息。MACD：价格新高而柱子/线明显更弱，当作警告，不是自动开空理由。RSI：强趋势里钝化，就把它降级成噪声，去看更大周期的结构。指标失效不等于世界末日，只是「这套尺子今天量不准」。",
      "参数要不要调？偶尔可以，别当炼金。把 12、26、9 改成「专属圣杯」，回测漂亮、实盘崩盘，是老桥段。更稳的做法是固定一两套参数，换标的、换周期时保持同一语言，这样复盘才有可比性。钱力股也不会因为你改了参数就替你承担盈亏。",
      "一篇练习：打开任意你熟悉的标的日线，只留均线 + MACD 或只留均线 + RSI（二选一，别全上）。问三句——现在更像趋势还是箱体？指标有没有和价格唱反调？若这套说法错了，你准备在哪一价位认错？写进复盘或提醒备注。能答三句，指标才算进了流程；只会背「金叉买入」，还是把决策外包给了线。",
      "技术指标是概率玩具，遇上财报、政策、流动性抽干，再漂亮的形态也会哑火。本站内容供学习参考，不构成投资建议。把指标当副驾，把仓位与失效条件当刹车——比再找第四个「神指标」靠谱。",
    ],
    "zh-TW": [
      "指標不是來替你做決定的。均線看結構節奏，MACD 看動能變化，RSI 看漲跌節奏——超買／超賣在強趨勢裡常會鈍化。",
      "順序：先看 K 線結構與位置，再看交叉。震盪裡追每次金叉、趨勢裡把每次回踩當崩盤，都容易受傷。錢力股圖上先疊一條盯得住的均線即可，不必一次全開。",
      "提醒綁結構位／失效位；AI 讀圖要說清結構、價位、推翻條件，並與肉眼交叉驗證。失效時：均線走平就承認趨勢休息；MACD 價新高動能更弱當警告；RSI 鈍化就降級成雜訊。",
      "練習：日線只留均線 +（MACD 或 RSI），問趨勢或箱體、有無背離、認錯價在哪。內容僅供學習，不構成投資建議。",
    ],
    en: [
      "Indicators get noisy fast. Golden crosses and “overbought” labels are easy to memorize; in live size they often disagree. The usual failure is outsourcing the decision to the lines.",
      "Rough jobs: moving averages describe rhythm and structure (trend vs flat tangle)—not a starter pistol. MACD is more of a momentum thermometer and whipsaws in ranges. RSI tracks swing pace inside a window; overbought is not an automatic short, and strong trends can stay “extended” for a long time.",
      "Order of work beats parameter tweaks: read candle structure and location first, then decide whether a cross deserves attention. On Q-Stock, one watchable MA is enough before stacking MACD and RSI. Tie alerts to structure or invalidation, not “RSI=30 → all-in.” AI chart read should force structure, levels, and what would change your mind—then verify on the chart. Paper a few trades under one rule set and review the times the indicator yelled buy while structure was poor.",
      "When tools fail: flattening MAs mean the trend story is on pause; price highs with weaker MACD are a warning, not an auto short; RSI in a strong trend often numbs—downgrade it and zoom out. Learning only—not advice. Indicators ride shotgun; size and invalidation are the brakes.",
    ],
  },
};

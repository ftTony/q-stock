import type { LearnArticle } from "@/lib/learn/types";

export const LEARN_ARTICLE_CANDLE_TWEEZER: LearnArticle = {
  slug: "candle-tweezer-top-bottom",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "平头顶与平头底：相近高低点，不等于市场承诺",
    "zh-TW": "平頭頂與平頭底：相近高低點，不等於市場承諾",
    en: "Tweezer tops and bottoms: matching extremes are not promises",
  },
  summary: {
    "zh-CN": "两次接近的高点或低点可以作为观察线索，但支撑和阻力需要后续检验。",
    "zh-TW": "兩次接近的高點或低點可以作為觀察線索，但支撐和阻力需要後續檢驗。",
    en: "Two similar highs or lows can be a clue; support and resistance still need testing.",
  },
  paragraphs: {
    "zh-CN": [
      "两根 K 线的低点几乎重合，图上像镊子夹住一段价格，这就是平头底常见的命名来源；高点相近则称平头顶。名字容易让人想到“价格被支撑住了”或“突破不过去了”，但图表能直接告诉你的只有：在选定周期和数据口径下，价格曾两次到达相近的极值。",
      "平头底常被放在下跌后讨论，平头顶常被放在上涨后讨论。两根 K 线可以一阴一阳，也可以同色；实体与影线组合也可能不同。识别时重点是两个低点或高点是否足够接近，而不是颜色是否符合某个固定模板。",
      "“足够接近”没有跨市场通用的绝对差值。股价最小跳动单位、加密资产报价精度、标的波动幅度和图表周期都不同。对波动很大的标的，相差几个最小跳动单位未必重要；对波动极低的资产，同样的差值可能已很明显。与其硬背固定容差，不如记录自己采用的标准，并在分析前保持一致。",
      "两次触及同一价位并不意味着支撑必然增强。第一次反弹后，第二次可能再次守住，也可能因为卖盘继续出现而跌破。高点附近的反复受阻也不一定代表顶部，有时价格只是暂时整理。形态本身不会告诉你挂单深度，也不能证明有多少买家或卖家在等待。",
      "因此，平头底之后可以观察价格是否形成更高的收盘、突破附近的短期结构，或至少不再持续创新低；平头顶之后则可观察低点是否下移、支撑是否失守。这些是后续证据，不是确认后的必然结果。若价格越过你原先标出的极值，应该更新解释，而不是不断扩大“差不多”的范围。",
      "还要留意图表细节：复权方式会改变历史极值；不同供应商的日线切分和盘前盘后数据可能不同；低流动性时的一笔成交也可能制造长影线。比较形态前，先确认标的、周期、交易时段和数据源一致。",
      "做一组不带方向预设的练习：在上涨、下跌和横盘背景里各找相近高低点，统一使用同一容差；记录之后数根 K 线是守住、突破还是继续震荡。先统计所有找到的案例，再解释结果。不要只从历史走势图里挑一个著名反转点来证明形态有效。",
      "钱力股的提醒功能适合放在你事先定义的观察位；模拟盘可以练习价格触及后先检查条件，而不是把触及本身当成买卖理由。复盘时记录当初的标准有没有被临场修改，这比给形态起一个漂亮名字更有用。",
      "相近极值是一条线索，不是不可穿越的墙。本文仅供学习；技术形态不能保证反转，也不构成投资建议。",
    ],
    "zh-TW": [
      "兩根 K 線低點幾乎重合，圖上像被鑷子夾住，常稱平頭底；高點相近則稱平頭頂。名稱容易讓人想到支撐或壓力，但圖表直接顯示的只是：在選定週期和資料口徑下，價格曾兩次到達相近極值。",
      "「足夠接近」沒有跨市場通用的絕對差值。最小跳動單位、波動幅度和圖表週期都不同。與其硬背固定容差，不如記下採用的標準，並在分析前保持一致。兩次觸及同價不代表支撐必然增強；後續可能守住，也可能跌破。",
      "平頭底後可觀察收盤是否改善、是否停止創低；平頭頂後可觀察低點是否下移。但這些只是後續證據。復權方式、交易時段、資料源與低流動性成交，都可能改變圖形外觀。",
      "練習時在上漲、下跌、橫盤中找相近高低點，用同一容差記錄後續結果，失敗案例也保留。錢力股可用提醒、模擬和複盤練習遵守條件；相近極值不是不可穿越的牆。本文僅供學習，不構成投資建議。",
    ],
    en: [
      "When two candles have nearly matching lows, the chart can look as if the price were held by tweezers; matching highs create a tweezer top. The names suggest support or resistance, but the chart directly shows only that price reached similar extremes twice under a particular timeframe and data convention.",
      "There is no universal tolerance for “nearly equal.” Tick size, volatility, and timeframe vary. Instead of memorizing a fixed distance, write down a consistent rule before reviewing examples. Two tests of a low do not guarantee stronger support: price may hold again or break through. A repeated high is not necessarily a ceiling.",
      "After a tweezer bottom, observe whether closes improve or new lows stop; after a top, watch whether lows weaken or nearby support fails. These are later observations, not guarantees. Adjustments, session boundaries, data providers, and thin trading can all change the appearance of extremes.",
      "Practice without a directional assumption: find similar extremes in rising, falling, and sideways contexts, apply one tolerance rule, and record what happened next—including failures. On Q-Stock, alerts can mark a level you defined in advance, while paper trading and review can test whether you followed your plan. Similar extremes are clues, not walls. Educational content only, not investment advice.",
    ],
  },
};

import type { LearnArticle } from "@/lib/learn/types";

/** First-ship product + craft articles (basics / tools / mindset). */
export const LEARN_ARTICLES_CORE: LearnArticle[] = [
  {
    slug: "calm-watching",
    category: "mindset",
    ctaHref: "/markets",
    title: {
      "zh-CN": "冷静看盘：先看结构，再谈感觉",
      "zh-TW": "冷靜看盤：先看結構，再談感覺",
      en: "Calm watching: structure before feelings",
    },
    summary: {
      "zh-CN": "少刷屏、少追热点：用价位与失效条件约束冲动。",
      "zh-TW": "少刷屏、少追熱點：用價位與失效條件約束衝動。",
      en: "Fewer refreshes, less chase—anchor on levels and invalidation.",
    },
    paragraphs: {
      "zh-CN": [
        "看盘容易被涨跌颜色和短讯带着跑。更稳的做法不是多刷几遍，而是先把判断框架钉死，再决定要不要动手。",
        "一、结构：现在处在趋势、震荡，还是破位后的混乱？",
        "二、价位：真正关键的支撑/阻力或区间沿在哪里？",
        "三、失效：什么情况出现，你就承认原先判断作废？",
        "钱力股的 AI 读图与情景推演也按这个顺序组织：结构 → 关键位 → 失效条件。它们是学习辅助，不是买卖指令。",
        "实操建议：把失效条件写进提醒或笔记。价格打到该线，先停手复核，而不是加仓证明自己正确。",
      ],
      "zh-TW": [
        "看盤容易被漲跌顏色和短訊帶著跑。更穩的做法不是多刷幾遍，而是先把判斷框架釘死，再決定要不要動手。",
        "一、結構：現在處在趨勢、震盪，還是破位後的混亂？",
        "二、價位：真正關鍵的支撐/阻力或區間沿在哪裡？",
        "三、失效：什麼情況出現，你就承認原先判斷作廢？",
        "錢力股的 AI 讀圖與情景推演也按這個順序：結構 → 關鍵位 → 失效條件。它們是學習輔助，不是買賣指令。",
        "實操建議：把失效條件寫進提醒或筆記。價格打到該線，先停手複核，而不是加倉證明自己正確。",
      ],
      en: [
        "Quotes and headlines pull hard. The fix is not more refresh—it is locking a frame before you act.",
        "1) Structure: trend, range, or messy break?",
        "2) Levels: where are the real supports, resistances, or range edges?",
        "3) Invalidation: what would void this read?",
        "Q-Stock’s AI chart and scenario tools follow the same order: structure → levels → invalidation. They are study aids, not order tickets.",
        "Practice: put invalidation into an alert or note. When price hits it, pause and re-check—don’t double down to prove yourself right.",
      ],
    },
  },
  {
    slug: "checklist-three",
    category: "mindset",
    ctaHref: "/portfolio",
    title: {
      "zh-CN": "下单前三问清单",
      en: "Three questions before you click",
    },
    summary: {
      "zh-CN": "结构清楚了吗？风险预算定了吗？失效条件写了吗？",
      en: "Structure clear? Risk budget set? Invalidation written down?",
    },
    paragraphs: {
      "zh-CN": [
        "很多后悔单不是因为「没看新闻」，而是动手前没有固定问题。建议每次只问三句；答不上来，就先不加仓、不追单。",
        "一、结构：现在更像趋势、震荡，还是刚破位后的混乱？说不清结构，就不该放大仓位。",
        "二、风险：这笔最多愿意亏账户的百分之几？先定风险预算，再反推数量——不要先想赚多少。",
        "三、失效：什么价位或条件出现，你就承认计划作废？没写失效条件，等于给自己无限辩护空间。",
        "在钱力股可以先用模拟盘把这三问走通，再用仓位工具把「亏得起」算成可执行数量。清单是外挂大脑，用来约束冲动，不是保证盈利的咒语。",
      ],
      en: [
        "Regret often comes from skipping a fixed checklist—not from missing a headline. Ask three questions; if you cannot answer, do not add risk.",
        "1) Structure: trend, range, or messy break? If you cannot name it, do not size up.",
        "2) Risk: what percent of equity is the max loss? Set the budget before dreaming about upside.",
        "3) Invalidation: what price or condition voids the plan? Without it, you will keep inventing reasons to stay.",
        "Practice the three questions on paper trading, then use the position tool to turn an affordable loss into size. A checklist constrains impulse—it is not a profit spell.",
      ],
    },
  },
  {
    slug: "paper-review",
    category: "basics",
    ctaHref: "/review",
    title: {
      "zh-CN": "模拟交易与复盘笔记",
      "zh-TW": "模擬交易與複盤筆記",
      en: "Paper trading and review notes",
    },
    summary: {
      "zh-CN": "用模拟仓位练流程，用复盘看见情绪与下次清单。",
      "zh-TW": "用模擬倉位練流程，用複盤看見情緒與下次清單。",
      en: "Practice process with paper; review notes surface emotion and next checks.",
    },
    paragraphs: {
      "zh-CN": [
        "模拟不是为了「虚拟赚钱」，而是把下单、持仓、止损提醒走通，同时降低真金白银的情绪干扰。",
        "复盘笔记适合固定问：今天做得好的是什么？哪里冲动了？下次清单三条即可。钱力股可基于模拟成交生成摘要，仍需你自己确认是否属实。",
        "建议节奏：少而认真的模拟单 + 每周一次复盘，比每天几十次点点点更有用。",
      ],
      "zh-TW": [
        "模擬不是為了「虛擬賺錢」，而是把下單、持倉、止損提醒走通，同時降低真金白銀的情緒干擾。",
        "複盤筆記適合固定問：今天做得好的是什麼？哪裡衝動了？下次清單三條即可。",
        "建議節奏：少而認真的模擬單 + 每週一次複盤，比每天幾十次點點點更有用。",
      ],
      en: [
        "Paper trading is for process—entries, holds, stop alerts—with less real-money heat.",
        "Review notes work with fixed prompts: what went well, where was impulse, three items for next time. Auto summaries still need your judgment.",
        "Rhythm beats volume: a few serious paper trades plus a weekly review beat dozens of taps a day.",
      ],
    },
  },
  {
    slug: "kline-basics",
    category: "basics",
    ctaHref: "/markets",
    title: {
      "zh-CN": "K 线怎么读：影线、实体与别过度解读",
      en: "Candles: wicks, bodies, and not over-reading",
    },
    summary: {
      "zh-CN": "先认 OHLC，再谈形态；单根 K 线很少等于买卖信号。",
      en: "Learn OHLC first; a single candle is rarely an order ticket.",
    },
    paragraphs: {
      "zh-CN": [
        "一根 K 线记录开、高、低、收。实体反映开收到收盘的距离，影线反映盘中被拒绝的区域。先把这四件事看懂，再去记「早晨之星」之类名称。",
        "常见误读：把长下影当成必然反转、把连续阳线当成永远上涨。形态是概率语言，要放回更大周期的结构里看。",
        "在钱力股个股页打开日线，叠一条均线即可练习：问「现在更像趋势还是震荡」，而不是「下一根一定涨还是跌」。指标同理——辅助，不是圣杯。",
      ],
      en: [
        "A candle is open, high, low, close. The body is open-to-close distance; wicks show rejected prices. Master OHLC before memorizing pattern names.",
        "Common traps: treating a long lower wick as a guaranteed reversal, or a streak of green as forever-up. Patterns are probabilistic and need higher-timeframe context.",
        "On a Q-Stock chart, start with daily candles plus one moving average. Ask “trend or range?”—not “will the next bar print up.” Indicators help; they are not a holy grail.",
      ],
    },
  },
  {
    slug: "multi-market-101",
    category: "basics",
    ctaHref: "/markets",
    title: {
      "zh-CN": "一个终端里的美股、港股、A 股与加密",
      en: "US, HK, A-shares, and crypto in one shell",
    },
    summary: {
      "zh-CN": "先弄清时段、代码习惯与合规边界，再谈机会。",
      en: "Sessions, symbol habits, and local rules before “opportunity.”",
    },
    paragraphs: {
      "zh-CN": [
        "钱力股把美股、港股、A 股与主流加密放在同一套导航里，不等于四者规则相同。交易时段、涨跌停、交收（如 A 股 T+1）、以及你所在地是否允许参与，都要分开看。",
        "代码习惯也不同：美股常见字母代码，港股多为五位数字，A 股六位，加密常用 BTC 这类符号。搜索时选对市场，可少很多乌龙。",
        "学习建议：用看板各逛一遍，只记差异；真金白银前先读免责声明，并确认当地法规。本站提供信息与模拟，不是券商开户或下单通道。",
      ],
      en: [
        "One shell for US, HK, A-shares, and major crypto does not mean identical rules. Sessions, limits, settlement (e.g. A-share T+1), and whether you may participate where you live all differ.",
        "Symbol habits differ too—tickers, 5-digit HK codes, 6-digit A-share codes, crypto ids like BTC. Pick the right market when you search.",
        "Tour each board and note differences. Read the disclaimer and local law before real money. This site is information and paper practice—not a broker onboarding flow.",
      ],
    },
  },
  {
    slug: "peer-compare",
    category: "tools",
    ctaHref: "/analysis",
    title: {
      "zh-CN": "同业对比怎么用",
      "zh-TW": "同業對比怎麼用",
      en: "How to use peer compare",
    },
    summary: {
      "zh-CN": "同一行业里挑 2–4 只股票，并排看估值与财务要点。",
      "zh-TW": "同一行業裡挑 2–4 隻股票，並排看估值與財務要點。",
      en: "Pick 2–4 names in one industry and line up valuation basics.",
    },
    paragraphs: {
      "zh-CN": [
        "对比的价值在「同一语境」。先在榜单或行业里锁定赛道，再勾选 2–4 只股票，看市值、PE/PB、利润率、负债等是否处在合理区间——而不是跨行业硬比。",
        "部分绝对金额（如营收、总资产）在免费数据源上可能是估算值，页面会标明口径。把它当作核对线索，而不是精确财报替代品。",
        "做完对比，回到个股 K 线与新闻，看估值差异是否已被市场定价，或只是数据缺失造成的错觉。",
      ],
      "zh-TW": [
        "對比的價值在「同一語境」。先鎖定賽道，再勾選 2–4 隻股票，看市值、PE/PB、利潤率、負債等——而不是跨行業硬比。",
        "部分絕對金額在免費資料源上可能是估算值，頁面會標明口徑。把它當作核對線索，而非精確財報替代品。",
        "做完對比，回到個股 K 線與新聞，看估值差異是否已被定價，或只是資料缺失造成的錯覺。",
      ],
      en: [
        "Compare inside one context. Lock an industry, pick 2–4 names, and scan mkt cap, PE/PB, margins, and leverage—don’t force cross-sector matches.",
        "Some absolute figures from free feeds may be estimates; the UI labels that. Treat them as clues, not a filing replacement.",
        "After compare, return to the chart and news: is the gap priced in, or just a data hole?",
      ],
    },
  },
  {
    slug: "watchlist-alerts",
    category: "tools",
    ctaHref: "/alerts",
    title: {
      "zh-CN": "自选与价格提醒：少而准",
      en: "Watchlist and alerts: fewer, sharper",
    },
    summary: {
      "zh-CN": "提醒写失效位与计划位，而不是许愿位。",
      en: "Alert on invalidation and plan levels—not wish prices.",
    },
    paragraphs: {
      "zh-CN": [
        "自选过多时，每天都像被追着跑。更稳的做法是：只留你真正跟结构的标的，其余移出视线。",
        "价格提醒适合绑定「计划里已经写好的线」——例如失效价、区间沿、分批点——而不是「希望它涨到的整数」。提醒触发后，先停手复核清单，再决定是否动手。",
        "在钱力股：心形加入自选，到提醒页设置 ≥ / ≤。配合冷静看盘短文，把通知当成纪律外挂，而不是赌博闹钟。",
      ],
      en: [
        "A bloated watchlist feels like being chased. Keep names you actually track by structure; drop the rest.",
        "Alerts belong on levels already in your plan—invalidation, range edges, scaled entries—not round-number wishes. When one fires, pause and re-check the checklist.",
        "In Q-Stock, heart a symbol, then set ≥ / ≤ alerts. Treat pings as discipline, not a gambling alarm.",
      ],
    },
  },
  {
    slug: "ai-chart-read",
    category: "tools",
    ctaHref: "/markets",
    title: {
      "zh-CN": "AI 读图与对话：怎么提问更有用",
      en: "AI chart read & chat: better questions",
    },
    summary: {
      "zh-CN": "要结构、价位与失效条件；交叉验证，不当订单。",
      en: "Ask for structure, levels, invalidation—then verify. Not an order ticket.",
    },
    paragraphs: {
      "zh-CN": [
        "对 AI 说「会不会涨」通常得到含糊或危险的答案。更有用的问法是：当前更像什么结构？关键支撑阻力在哪？什么情况让这套解读失效？",
        "钱力股的读图与情景按冷静投顺序组织，但仍可能过时、片面或产生幻觉。任何数字与事件，请用行情、新闻与财报 Tab 再核对。",
        "练习：把 AI 输出缩成三行笔记——结构 / 价位 / 失效——再决定要不要进模拟盘。配额用尽时可自带 Key 或邀请加成；它始终是学习辅助。",
      ],
      en: [
        "“Will it go up?” invites vague or risky answers. Better: what structure fits, where are levels, and what invalidates this read?",
        "Q-Stock chart reads follow a calm order, but models can be stale, one-sided, or wrong. Cross-check prices and events on quote, news, and filings tabs.",
        "Shrink the output to three lines—structure / levels / invalidation—before any paper trade. BYOK or invites can extend quota; it remains a study aid.",
      ],
    },
  },
];

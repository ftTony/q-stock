import type { LearnArticle } from "@/lib/learn/types";

/** Tools articles — depth aligned with kline-basics. */
export const LEARN_ARTICLES_TOOLS: LearnArticle[] = [
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
      "zh-CN": "同一赛道挑 2–4 只并排看；估值是线索，不是买卖开关。",
      "zh-TW": "同一賽道挑 2–4 隻並排看；估值是線索，不是買賣開關。",
      en: "Line up 2–4 peers in one industry—valuation as clue, not a buy switch.",
    },
    paragraphs: {
      "zh-CN": [
        "看到一只股票估值「看起来很低」或「看起来很贵」，很多人会立刻下结论。更稳妥的做法是先问：跟谁比？跨行业硬比市盈率，就像拿飞机票价比地铁票——数字都在，语境全错。",
        "同业对比的价值，在于把标的放回同一语境：相似业务、相近阶段，再并排看市值、PE/PB、利润率、负债等，判断差异是「市场定价」还是「口径/阶段不同」。它帮你提出更好的问题，而不是直接给你买卖答案。",
        "一、先锁赛道：从榜单或行业入口进入，而不是随手搜几只热门硬凑一组。",
        "二、数量要少：2–4 只足够；再多就变成表格噪音，看不出重点。",
        "三、看相对位置：谁更贵、谁更便宜、利润率与杠杆差在哪——先描述差异，再解释差异。",
        "四、回到个股验证：对比结束后，打开 K 线、新闻与财报摘要，看估值差是否已被定价，或只是数据缺失、一次性项目造成的错觉。",
        "数据谦逊很重要：部分绝对金额（营收、总资产等）在免费源上可能是估算值，页面会标明口径。把它当核对线索，不是精确财报替代品。财报季或重大重组后，更要警惕「静态倍数」失真。",
        "常见误区：把「同组最低 PE」自动翻译成「该买」。低倍数可能对应更差的增长、更高风险或会计差异。另一个误区是拿周期股峰值利润算出来的低 PE 当常态。",
        "在钱力股分析页做完对比，用三句话记笔记：同组是谁、差异在哪、还缺什么信息。对比是冷静投的尺子，不是荐股开关。",
      ],
      "zh-TW": [
        "估值「看起來很低／很貴」之前，先問：跟誰比？跨行業硬比，語境全錯。",
        "一、先鎖賽道；二、只挑 2–4 隻；三、先描述差異再解釋；四、回到 K 線與新聞驗證。",
        "免費資料可能有估算口徑，當線索而非精確財報。低 PE 不等于該買。對比是尺子，不是薦股開關。",
      ],
      en: [
        "A “cheap” or “expensive” multiple means little until you ask: versus whom? Cross-sector PE compares often mix contexts.",
        "1) Lock one industry. 2) Pick 2–4 names—more becomes noise. 3) Describe relative gaps before explaining them. 4) Return to chart, news, and filings to see if the gap is priced or a data hole.",
        "Free feeds may estimate some absolutes; treat labels as clues, not filings. Lowest PE in the group is not a buy ticket—growth, risk, and accounting can differ. Compare is a ruler, not a recommendation switch.",
      ],
    },
  },
  {
    slug: "watchlist-alerts",
    category: "tools",
    ctaHref: "/alerts",
    title: {
      "zh-CN": "自选与价格提醒：少而准",
      "zh-TW": "自選與價格提醒：少而準",
      en: "Watchlist and alerts: fewer, sharper",
    },
    summary: {
      "zh-CN": "提醒写失效位与计划位，而不是许愿位；少而准才管得住注意力。",
      "zh-TW": "提醒寫失效位與計畫位，而不是許願位；少而準才管得住注意力。",
      en: "Alert on invalidation and plan levels—not wish prices.",
    },
    paragraphs: {
      "zh-CN": [
        "自选一多，每天都像被追着跑：红色绿色轮流跳，提醒响个不停，注意力被碎片化。问题往往不是「工具不够强」，而是名单与提醒没有规则——什么都想盯，等于什么都盯不住。",
        "更稳的做法是：自选只留你真正按结构跟踪的标的；提醒只绑计划里已经写好的线。通知是纪律外挂，不是赌博闹钟，也不是「希望它涨到」的许愿器。",
        "一、自选做减法：跟不上结构的、只因热点加进来的，移出视线。宁可少，也不要一份让你焦虑的长名单。",
        "二、提醒绑计划位：失效价、区间沿、分批观察点——写进笔记的那种，而不是盘中临时起的整数关口。",
        "三、触发先停手：提醒响了，先打开清单复核结构与风险，再决定是否动手；不要条件反射追单或报复加仓。",
        "四、定期清理：行情走完或计划作废，删掉旧提醒。过期通知和过期自选一样，会制造噪声。",
        "常见误区：把「涨到某某整数」设成提醒，再把响铃当成买入信号。整数往往是大众焦点，不一定是你的结构位。另一个误区是提醒设太密， bell 一多就会忽略——等于没有提醒。",
        "在钱力股：用心形加入自选，到提醒页设置 ≥ / ≤。配合「冷静看盘」与「下单前三问」，把通知当成外挂大脑：帮你记得失效，而不是替你下决定。",
        "少而准的目标，是让注意力回到少数答得清的标的上。名单越短，框架越容易坚持；名单越长，越容易被行情推着跑。",
      ],
      "zh-TW": [
        "自選一多，注意力就被碎片化。自選只留真正跟結構的標的；提醒只綁計畫裡寫好的線。",
        "一、做減法；二、綁失效／區間沿／分批點；三、觸發先停手複核；四、過期就刪。",
        "不要把整數許願位當買入訊號。在錢力股用心形加自選、設 ≥／≤，把通知當紀律外掛。",
      ],
      en: [
        "A bloated watchlist feels like being chased. The fix is rules: keep names you track by structure; bind alerts to levels already in the plan—not round-number wishes.",
        "1) Subtract. 2) Alert on invalidation, range edges, scaled plan points. 3) When one fires, pause and re-check the checklist. 4) Delete stale alerts.",
        "Do not treat a ping as a buy ticket. In Q-Stock, heart a symbol and set ≥ / ≤. Pings are discipline—helping you remember invalidation—not a decision substitute.",
      ],
    },
  },
  {
    slug: "ai-chart-read",
    category: "tools",
    ctaHref: "/markets",
    title: {
      "zh-CN": "AI 读图与对话：怎么提问更有用",
      "zh-TW": "AI 讀圖與對話：怎麼提問更有用",
      en: "AI chart read & chat: better questions",
    },
    summary: {
      "zh-CN": "要结构、价位与失效；交叉验证，不当订单，更不替代你的清单。",
      "zh-TW": "要結構、價位與失效；交叉驗證，不當訂單，更不替代你的清單。",
      en: "Ask for structure, levels, invalidation—then verify. Not an order ticket.",
    },
    paragraphs: {
      "zh-CN": [
        "对 AI 说「会不会涨」「给我一个买点」，通常得到含糊、讨好或危险的答案。模型擅长组织语言，不负责你的仓位与合规。更有用的用法，是逼它把盘面说清楚，好让你自己做清单判断。",
        "钱力股的读图与情景，按冷静投顺序组织：结构 → 关键位 → 失效条件。你仍要用行情、新闻与财报 Tab 交叉验证——模型可能过时、片面，或产生幻觉。",
        "一、问结构：当前更像趋势、震荡，还是破位后的混乱？要求它说明依据（高低点、均线关系等），而不是只给形容词。",
        "二、问价位：关键支撑、阻力或区间沿大致在哪？把输出当成候选位，回到图表自己标，而不是直接当委托价。",
        "三、问失效：什么情况出现，这套解读就作废？没有失效句，整段回答价值大减。",
        "四、再压缩：把 AI 输出缩成三行笔记——结构 / 价位 / 失效——答得清再考虑进模拟盘；答不清就继续观察。",
        "少用的问法：「稳赚吗」「目标价多少」「现在满仓行不行」。多用的问法：「若跌破某某区，原解读如何调整？」「量能与结构是否一致？」",
        "边界要清楚：AI 不是券商、不是投顾、不是下单通道。配额用尽时可自带 Key 或邀请加成；能力再强，也只是学习辅助。突发消息、停牌、数据延迟，都会让任何读图瞬间过时。",
        "练习目标不是「让 AI 替你看对方向」，而是让提问与笔记习惯，和冷静看盘、三问清单同一套语言。工具可以换，框架尽量不换。",
      ],
      "zh-TW": [
        "問「會不會漲」通常得到含糊或危險的答案。更有用的是要結構、價位與失效，再自己交叉驗證。",
        "一、問結構並要依據；二、問關鍵位並回圖表自標；三、問失效條件；四、縮成三行筆記再談模擬。",
        "AI 不是投顧與下單通道，可能過時或幻覺。工具可換，冷靜投框架尽量不換。",
      ],
      en: [
        "“Will it go up?” invites vague or risky answers. Better: what structure fits, where are levels, and what invalidates the read—then verify on quote, news, and filings.",
        "1) Ask for structure with reasons. 2) Treat levels as candidates you mark yourself. 3) Demand an invalidation sentence. 4) Shrink to three lines before any paper trade.",
        "Avoid “sure thing” and target-price prompts. Models can be stale or wrong; Q-Stock AI is a study aid, not an advisor or order ticket. Keep the same calm language as your checklist.",
      ],
    },
  },
];

import type { LearnArticle } from "@/lib/learn/types";

/** Tools articles — depth aligned with kline-basics. */
export const LEARN_ARTICLES_TOOLS: LearnArticle[] = [
  {
    slug: "peer-compare",
    category: "tools",
    ctaHref: "/analysis",
    author: "钱力股研究组",
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    title: {
      en: "Peer compare: valuation is a clue, not a switch",
      "zh-CN": "同业对比怎么用：估值是线索，不是开关",
    },
    summary: {
      en: "Line up 2–4 names in the same lane and let the gaps ask questions: priced gap, accounting gap, or stage gap. The ruler is cold on purpose.",
      "zh-CN":
        "同一条赛道挑 2–4 只并排摆，让差异自己提问题：定价差、口径差，还是阶段差。这把尺子故意做得冷静。",
    },
    paragraphs: {
      en: [
        "A “cheap” multiple means nothing until you answer: versus whom? Cross-sector PE compares mix contexts like pricing a flight ticket against a subway fare—the numbers are real, the conversation is not.",
      ],
      "zh-CN": [
        "估值「看起来很低」或「看起来很贵」，在回答「跟谁比」之前都是半句话。跨行业硬比市盈率，像拿机票价格和地铁票价聊天——数字都是真的，语境全是错的。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "In Q-Stock's analysis page, put 2–4 same-industry names side by side: market cap, PE/PB, margins, leverage. The page is a ruler, and rulers are deliberately cold—they measure gaps, they do not press buy buttons.",
        },
        { type: "h2", text: "Set up the comparison before reading it" },
        {
          type: "ul",
          items: [
            "Lock one lane first: enter from an industry list, not from whatever names are trending.",
            "Keep it to 2–4 names: past four, the table turns into noise and every difference looks like a signal.",
            "Match stages: a pre-profit grower next to a cash-cow utility produces confident nonsense.",
            "Note the data label: some absolute figures on free feeds are estimates—treat them as clues, not filings.",
          ],
        },
        { type: "h2", text: "Read gaps as questions, three kinds" },
        {
          type: "table",
          head: ["Type of gap", "Example (all hypothetical)", "Question it asks"],
          rows: [
            ["Priced gap", "Peer A at 15× PE, peer B at 25×, similar growth", "What does the market see in B—brand, moat, or momentum?"],
            ["Accounting gap", "Similar business, B's margin 6 points higher", "Different revenue recognition, one-off gains, or genuinely better economics?"],
            ["Stage gap", "B invests heavily, A harvests", "Are we comparing two companies or two chapters of the same playbook?"],
          ],
          caption:
            "If you cannot say which kind of gap you are looking at, the comparison is not finished yet.",
        },
        {
          type: "p",
          text: "A worked example (hypothetical): three retailers at 12×, 18×, and 30× PE. The 12× name carries two-thirds leverage and shrinking same-store sales; the 18× name is the boring median; the 30× name just doubled store count with thin margins. Cheap, fair, and expensive are all defensible here—what the table actually told you is which questions to open in the filings.",
        },
        { type: "h2", text: "The classic traps" },
        {
          type: "ul",
          items: [
            "Translating lowest PE into a buy order: low multiples can price worse growth, higher risk, or accounting quirks.",
            "Peak-cycle math: a cyclical at 8× on peak earnings is not cheap, it is timed.",
            "Static multiples in earnings season: after a restructuring or a big write-off, last year's denominator lies.",
            "Comparing across borders without currency, tax, and share-structure adjustments.",
          ],
        },
        {
          type: "p",
          text: "When the gap survives your questions—same lane, same stage, same accounting—then the compare page has done its job: it handed you a priced anomaly to verify on the chart and in the filings, not a trade. From there, the workbench loop takes over: read the structure, write the invalidation, size it through /tools/position.",
        },
        {
          type: "note",
          text: "End every comparison with three lines in review: who was in the group, what gaps showed up, what information is still missing. The missing line is where the real research starts.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "在钱力股的分析页，把同行业的 2–4 只并排摆开：市值、PE/PB、利润率、杠杆。这个页面是一把尺子——尺子的特点是故意冷静：它只负责量出差异，不负责替你按下买入。",
        },
        { type: "h2", text: "先搭好对比，再读对比" },
        {
          type: "ul",
          items: [
            "先锁赛道：从行业入口进，不是从热门榜单随手凑。",
            "控制在 2–4 只：超过四只，表格开始变噪音，任何差异看起来都像信号。",
            "阶段要对齐：一家没盈利的成长股旁边放一头现金奶牛，只会产出自信的胡说。",
            "留意数据口径：免费源上部分绝对金额是估算值，当线索用，别当财报。",
          ],
        },
        { type: "h2", text: "差异分三类，每一类是一个问题" },
        {
          type: "table",
          head: ["差异类型", "例子（全部为假设）", "它问你的问题"],
          rows: [
            ["定价差", "同增速的两家，一家 15 倍一家 25 倍", "市场在 25 倍那家里看到了什么——品牌、壁垒，还是单纯的动量？"],
            ["口径差", "业务相仿，利润率差 6 个点", "是收入确认方式不同、一次性损益，还是生意本质更好？"],
            ["阶段差", "一家在重投入，一家在收获期", "你比的是两家公司，还是同一剧本的两章？"],
          ],
          caption: "说不出眼前的差异属于哪一类，说明对比还没做完。",
        },
        {
          type: "p",
          text: "算个例子（假设）：三家零售商，PE 分别 12、18、30 倍。12 倍那家杠杆三分之二、同店增长在缩；18 倍是最无聊的中位数；30 倍那家刚把门店数翻倍、利润还薄。便宜、合理、贵在这里都说得通——这张表真正告诉你的，是该去财报里打开哪几个问题。",
        },
        { type: "h2", text: "经典踩坑" },
        {
          type: "ul",
          items: [
            "把「同组最低 PE」自动翻译成「该买」：低倍数可能在为更差的增长、更高的风险或会计花招定价。",
            "拿周期股峰值利润算 PE：8 倍的周期股不是便宜，是计时器。",
            "财报季用静态倍数：刚做完重组或大额减值的公司，去年的分母在说谎。",
            "跨市场硬比：汇率、税制、股权结构没调整之前，差异没有意义。",
          ],
        },
        {
          type: "p",
          text: "当差异扛过了你的三类提问——同赛道、同阶段、同口径——对比页的任务才算完成：它交给你的是一个待核实的定价异常，不是一笔交易。接下来交接给工作台闭环：看结构、写失效、用 /tools/position 定仓位。",
        },
        {
          type: "note",
          text: "每次对比收尾，在复盘页写三行：同组有谁、出现了什么差异、还缺什么信息。第三行才是真研究的起点。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "How many peers should I compare?",
          a: "2–4. Two gives a direction, four gives a spread; past that you are reading noise and every difference starts looking like a thesis.",
        },
        {
          q: "The lowest PE name in the group—buy it?",
          a: "Only after you can explain why the market prices it lower: growth, leverage, accounting, or stage. If you cannot, the multiple is a question, not an answer.",
        },
        {
          q: "The figures look off versus the annual report?",
          a: "Some absolute values on free feeds are estimated and labeled as such. Use multiples for relative reading, and open the filings for anything you plan to act on.",
        },
        {
          q: "Can I compare across countries?",
          a: "Only after adjusting for currency, tax regimes, accounting standards, and share structure. Skip it until those adjustments are second nature.",
        },
      ],
      "zh-CN": [
        {
          q: "同业对比挑几家合适？",
          a: "2–4 家。两家给方向，四家给分布；再多就开始读噪音了，什么差异都像论点。",
        },
        {
          q: "同组 PE 最低的那家，能直接买吗？",
          a: "先回答市场为什么给它低价：增长差、杠杆高、会计口径、还是阶段问题。答不上来，这个低倍数就是问题本身，不是答案。",
        },
        {
          q: "页面上的数字和年报对不上？",
          a: "免费源的绝对金额可能是估算值，页面会标注口径。相对倍数用于对比阅读，真正要动手前回财报核对。",
        },
        {
          q: "能跨国家对比吗？",
          a: "要先把汇率、税制、会计准则、股权结构都调整齐，否则差异没有意义。不熟就先跳过。",
        },
      ],
    },
    links: {
      en: [
        { label: "The three financial statements", href: "/learn/financials-three-statements" },
        { label: "Picking order: fundamentals → location", href: "/learn/stock-picking-steps" },
        { label: "The workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Position sizing calculator", href: "/tools/position" },
        { label: "Analysis page", href: "/analysis" },
      ],
      "zh-CN": [
        { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
        { label: "选股顺序：基本面→位置", href: "/learn/stock-picking-steps" },
        { label: "看盘闭环怎么走", href: "/learn/stocks-workbench-loop" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "分析页", href: "/analysis" },
      ],
    },
    sourceNote: {
      en: "Educational. Free-feed figures may be estimates; examples are hypothetical. Not investment advice.",
      "zh-CN": "仅供学习。免费源数据可能为估算口径，示例均为假设。不构成投资建议。",
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
      "zh-CN": "自选与提醒要少而准：只绑计划里的失效位与观察位，不绑许愿整数。把通知当纪律外挂，配合清单与模拟，而不是追涨闹钟。仅供学习，非投资建议。",
      "zh-TW": "自選與提醒要少而準：只綁計畫裡的失效位與觀察位，不綁許願整數。把通知當紀律外掛，不是追漲鬧鐘。僅供學習，非投資建議。",
      en: "Keep the watchlist short and bind alerts to written invalidation and plan levels—not round-number wishes. Treat pings as a discipline aid beside your checklist and paper trades, not a buy alarm. Learning only—not advice.",
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
    links: {
      en: [
        { label: "Calm watching", href: "/learn/calm-watching" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Markets", href: "/markets" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "冷静看盘", href: "/learn/calm-watching" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "看盘闭环", href: "/learn/stocks-workbench-loop" },
        { label: "行情首页", href: "/markets" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
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
      "zh-CN": "问 AI 要结构、关键价位与失效条件，再回图表与财报交叉验证。它是学习助读，不是订单与投顾；配额再多也替代不了你的三问清单。",
      "zh-TW": "問 AI 要結構、關鍵價位與失效條件，再回圖表與財報交叉驗證。它是學習助讀，不是訂單與投顧。",
      en: "Ask AI for structure, levels, and invalidation—then verify on the chart and filings. It is a study aid, not an order ticket or advisor, and never a substitute for your three-question checklist.",
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
    links: {
      en: [
        { label: "Calm watching", href: "/learn/calm-watching" },
        { label: "Workbench loop", href: "/learn/stocks-workbench-loop" },
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Markets", href: "/markets" },
        { label: "AAPL workbench", href: "/symbol/stock/AAPL" },
      ],
      "zh-CN": [
        { label: "冷静看盘", href: "/learn/calm-watching" },
        { label: "看盘闭环", href: "/learn/stocks-workbench-loop" },
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "行情首页", href: "/markets" },
        { label: "打开 AAPL 工作台", href: "/symbol/stock/AAPL" },
      ],
    },
  },
];

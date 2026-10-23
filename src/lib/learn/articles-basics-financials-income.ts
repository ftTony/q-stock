import type { LearnArticle } from "@/lib/learn/types";

/** Income statement — revenue to earnings without worshipping EPS surprises. */
export const LEARN_ARTICLE_FINANCIALS_INCOME: LearnArticle = {
  slug: "financials-income-statement",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "利润表：从营收到净利润，别只盯 EPS",
    "zh-TW": "利潤表：從營收到淨利，別只盯 EPS",
    en: "Income statement: from revenue to earnings—beyond EPS",
  },
  summary: {
    "zh-CN": "利润表讲「这段时间账面赚了多少」。营收、毛利、费用、一次性项目，比单季惊喜百分比更能救命。",
    "zh-TW": "利潤表講這段時間帳面賺多少。營收質量與費用結構，比單季驚喜%更重要。",
    en: "The P&L is period earnings on paper. Revenue quality and cost structure beat a single surprise print.",
  },
  paragraphs: {
    "zh-CN": [
      "利润表是大多数人「学财报」的入口，也是最容易学歪的一张。入口合理：营收、成本、毛利、营业利润、净利润，故事线清楚。学歪也常见：把 EPS 实际对预期的「惊喜%」当成交易信号，把同比大增当成趋势永续。我更愿把利润表当成「这段时间的成绩单草稿」——能说明方向，但不能单独证明现金已进账、也不能证明估值该上修。",
      "从上往下扫，散户够用的骨架其实不长。营收：东西/服务卖了多少，最好问「主业还是一次性」。营业成本与毛利：卖一块钱还剩多少毛利，毛利率连续走扩或走缩，往往比单季绝对值吵闹更有信息。营业费用（研发、销售、管理）：成长公司常把费用当燃料，要问燃料有没有换来可持续的营收。再到营业利润、税、净利润：中间若蹦出大额「其他收益/减值/重组」，先标黄，别急着把净利润当成主业实力。",
      "「好看利润」有几类常客。一是确认收入激进，营收在，收款慢——后面要去现金流与应收里验证。二是一次性收益抬净利，明年掉下来像变脸。三是股份支付、会计口径切换（GAAP / 非 GAAP）让「调整后利润」人人不一样。四是低质量增长：营收靠大幅降价或渠道压货，毛利与费用已经在报警。利润表能提示这些气味；要定罪，还得资产负债表与现金流量表一起出庭。",
      "预期差是利润表最情绪化的用法。卖方有一致预期，公司公布实际 EPS/营收，差值被做成惊喜额与惊喜%。钱力股财报 Tab 会把往期实际对预期、以及营收对比画出来，方便你回看「市场当时在赌什么」。它帮你减少翻表时间，不帮你保证「超预期必涨」。盘前盘后公布、情绪拥挤时，价格可以先走完故事，数字反而成了事后注解。",
      "和站内流程怎么接：在个股财报里先问三句——营收与利润是否同向？毛利率/营业利润率最近两季怎么走？有没有显眼的一次性项目？然后把同赛道 2～4 家丢进分析页，看增速与利润率是不是同一套尺子（有的公司爱报非 GAAP，并排时要小心）。基本面清单文里的「近况变好/变差」，利润表只负责其中一块；现金与负债要留给另外两篇。AI 可以追问「费用率为何抬升」，但口径以官方为准。",
      "财报日前的纪律，比读懂每一行科目更值钱。日历标出即将公布与时段（盘前/盘后/盘中）；提醒写失效位；若你准备博弈预期差，仓位按「亏得起」算，而不是按标题兴奋程度。模拟盘适合练「超预期但我不追高」或「低预期但结构很差我也不抄」——练的是流程，不是猜涨跌。",
      "练习：打开一只你熟悉的标的财报 Tab，对着最近两期只记：营收方向、利润方向、你觉得最可疑的一行（费用、一次性、还是利润率）、若判断错了的仓位上限。再读总论《三张表怎么串》和后文的资产负债、现金流，把「可疑」放到另外两张表里对质。本站内容仅供学习参考，不构成投资建议。",
    ],
    "zh-TW": [
      "利潤表是期間成績單草稿：營收→毛利→費用→營業利益→淨利。別把 EPS 驚喜% 當成買賣訊號。",
      "「好看利潤」常來自激進認列、一次性收益、口徑切換或壓貨式增長——要回現金與資產負債對質。錢力股財報 Tab 展示實際對預期，是線索不是判決。",
      "接同業對比與基本面清單；財報日用日曆、提醒與模擬控倉。內容僅供學習，不構成投資建議。",
    ],
    en: [
      "The income statement is a period report card draft: revenue → gross profit → operating costs → earnings. EPS surprise % is context, not a ticket. Watch revenue quality, margin direction, and one-offs before treating net income as “strength.”",
      "Q-Stock’s earnings tab charts actual versus estimate for EPS and revenue—clues about what the market was pricing, not a promise that beats rally. Peer compare margins on one yardstick; AI may probe expense ratios, filings win. Calendar, invalidation alerts, and paper size beat headline FOMO. Learning only—not advice.",
    ],
  },
};

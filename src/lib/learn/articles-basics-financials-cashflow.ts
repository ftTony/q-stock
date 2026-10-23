import type { LearnArticle } from "@/lib/learn/types";

/** Cash flow statement — when earnings and cash refuse to match. */
export const LEARN_ARTICLE_FINANCIALS_CASHFLOW: LearnArticle = {
  slug: "financials-cash-flow",
  category: "basics",
  ctaHref: "/review",
  title: {
    "zh-CN": "现金流量表：利润很美，钱进没进口袋？",
    "zh-TW": "現金流量表：利潤很美，錢進沒進口袋？",
    en: "Cash flow: pretty earnings, empty pockets?",
  },
  summary: {
    "zh-CN": "现金流量表分经营、投资、筹资。利润与经营现金长期背离，往往比单季 EPS 更值得警惕。",
    "zh-TW": "現金流分經營、投資、籌資。利潤與經營現金長期背離，比單季 EPS 更值得警惕。",
    en: "Operating, investing, financing. Persistent gaps between earnings and operating cash deserve more fear than one EPS print.",
  },
  paragraphs: {
    "zh-CN": [
      "如果利润表是成绩单，现金流量表更像银行流水。成绩可以靠会计估计打扮；流水相对难吹牛——当然，分类游戏与延迟确认照样存在，所以它不是真理机器，而是「少被利润催眠」的第三面镜子。我自己后悔过的几笔，共同点几乎都是：当时利润表无懈可击，后来才发现经营现金早就在掉链子。",
      "三块结构先记清楚。经营活动现金流：主业日常进钱还是烧钱，和净利润对比最有戏。投资活动：买设备、并购、买理财——扩张期常为负，要问扩的是产能还是商誉。筹资活动：借钱、还款、增发、分红、回购——正的筹资不一定坏，但要问钱是拿来打仗还是拿来续命。三者加总，解释现金余额为何从期初走到期末。",
      "散户最该练的一刀，是「净利润 vs 经营现金流」。同向向上：至少主业回款故事暂时自洽。利润强、经营现金弱：去资产负债表找应收、存货、应付款。利润弱、经营现金强：可能在消化库存或收款改善，也不要自动判死刑。连续多个报告期背离，比单季噪声更值得写进你的观察笔记——这不是预测暴跌，是拒绝假装没看见。",
      "自由现金流一类概念（经营现金减维持/扩张开支的口径各家不同）适合作为追问，不适合当成精确按钮。钱力股财报区更强调日历、EPS/营收预期差与利润相关指标；完整现金流量表科目仍以官方披露为准。你在站内能做的，是把「我怀疑利润含金量」写成清单，再用同业对比问同行是否一样在烧现金扩张，而不是在摘要里找一个「FCF 圣杯数字」。",
      "和交易流程的衔接要克制。发现背离，不等于明天开空或清仓——价格可以长期不理会你的正确。更稳的动作：自选备注写清「盯经营现金」；财报日前用提醒管住失效位；仓位按亏得起算；必要时模拟一遍「若下季仍背离我怎么办」。复盘笔记很适合记这类慢变量：哪一次你忽略了流水、只信了成绩单。钱力股的复盘与模拟，练的是这个，不是猜下一小时涨跌。",
      "AI 问股时，可以明确要求：「对比近几季净利润与经营现金流，列出可能解释。」然后你必须回到官方报表核对分类与口径——模型偶尔会串期、串非 GAAP。它省的是检索时间，不是你的责任。",
      "练习：打开总论与利润表、资产负债表两篇之后，对本季只写三句——经营现金与净利润是否同向；投资与筹资哪一块最醒目；若背离持续一个季度，我的仓位与失效条件是什么。写完，三张表的闭环才算合上。本站行情与摘要仅供学习参考，不构成投资建议。",
    ],
    "zh-TW": [
      "現金流量表像銀行流水：經營、投資、籌資。最該練的是淨利 vs 經營現金是否同向；長期背離要回應收存貨對質。",
      "錢力股摘要偏日曆與預期差，完整現金流以官方為準。懷疑含金量就寫進自選備註，用提醒、倉位與模擬管住自己。",
      "AI 可協助對比，仍須人工核對口徑。內容僅供學習，不構成投資建議。",
    ],
    en: [
      "Cash flow is closer to a bank tape than a report card: operating, investing, financing. Drill net income versus operating cash; persistent gaps send you back to receivables and inventory. Investing and financing explain expansion versus survival raises.",
      "Q-Stock emphasizes calendar and estimate gaps; full cash-flow line items still live in filings. Note “watch operating cash” on the watchlist, size by loss budget, paper the “what if the gap continues” case, and review when you trusted earnings alone. AI can draft a comparison—you verify periods and definitions. Learning only—not advice.",
    ],
  },
};

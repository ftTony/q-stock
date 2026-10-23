import type { LearnArticle } from "@/lib/learn/types";

/** How the three statements fit together — entry to the financials series. */
export const LEARN_ARTICLE_FINANCIALS_OVERVIEW: LearnArticle = {
  slug: "financials-three-statements",
  category: "basics",
  ctaHref: "/markets",
  title: {
    "zh-CN": "三张表怎么串：利润、资产负债与现金",
    "zh-TW": "三張表怎麼串：利潤、資產負債與現金",
    en: "Three statements, one story: P&L, balance sheet, cash",
  },
  summary: {
    "zh-CN": "财报不是三本互不相关的账。利润说「赚没赚」，资产负债说「家底与欠账」，现金说「钱到底进没进口袋」。",
    "zh-TW": "財報不是三本互不相干的帳。利潤、家底、現金要一起看，才不容易被單季數字帶跑。",
    en: "Not three unrelated books. Earnings, balance sheet, and cash answer different questions—read them as one loop.",
  },
  paragraphs: {
    "zh-CN": [
      "很多人第一次碰财报，是被「超预期」「同比大增」推着看的。结果只盯住每股收益那一格，其他表像装饰。我自己也交过这种学费：利润表亮眼，股价跳完，过两季才发现应收堆着、经营现金流对不上。后来才习惯把三张表当成同一家公司的三面镜子，而不是三道独立考题。",
      "先记住分工，别急着背科目。利润表回答一段时期里「账面赚了多少」——营收进来，成本和费用扣掉，剩下利润。资产负债表是某一时点的快照：「手里有什么、欠谁什么、股东权益剩多少」。现金流量表则更不客气：钱从经营、投资、筹资三条河进出，账面利润再好看，口袋没现金也会难受。三句话对得上，才谈得上往下拆科目。",
      "更实用的读法是「闭环」，不是从上到下抄一遍。利润增加，通常会反映到权益或资产某处；利润很好但经营现金很差，就要去问应收、存货、应付款是不是在「垫」利润。资本开支猛、筹资进账多，可能是扩张，也可能是在补窟窿——要回资产负债表看现金与负债结构。闭环读完，比单季 EPS 惊喜分更接近「公司最近到底怎样」。",
      "顺序上，我建议散户别一上来啃完整年报 PDF。钱力股个股页的财报 Tab，先给你日历（即将/近期公布）、往期 EPS 与营收相对预期、以及一串压缩后的财务指标（毛利率、净利率、ROE、PE 等）。这些是线索板，不是判决书。港股部分公告能力仍有限、加密没有传统财报——界面会标明，别硬套美股习惯。免费源常有估算与延迟，对不上时以交易所/公司官方披露为准。",
      "和站内其他模块怎么接：三张表建立「近况判断」之后，才值得打开同业对比（分析页）问「同赛道尺子一不一样」；再回基本面清单文核对业务一句话与亏得起比例。AI 问股可以帮你把「利润与现金是否同向」说清楚，但交叉验证仍要回到摘要与官方文件——模型会漏、会混口径。技术面只决定位置与失效，不负责证明财报已经兑现。",
      "财报季最容易把三张表读成一张情绪表。盘前盘后公布、惊喜百分比亮眼，社交媒体会催你「必须有仓位」。更稳的动作是：先在日历里标出日期与时段，提醒绑的是你自己的失效位，不是许愿价；拿不准就用模拟走一遍「若错了怎么认亏」。钱力股不做荐股，也不把「超预期」翻译成买入按钮。",
      "用公开叙事练闭环（以 NVDA 为例，教学用，不是研报）。公开讨论里常听到的故事是：利润表侧，数据中心相关营收与增速是否仍是「主引擎」；毛利率与费用有没有把利润率故事说圆。资产负债表侧，现金与短期投资是否厚、存货与产能相关投入是否跟叙事同向——扩产热情很大时，家底表往往比口号更早露痕迹。现金流量表侧，经营现金是否跟得上账面利润，资本开支与回购／分红怎么挤占口袋。三面能互相印证，故事才算进了闭环；只剩「AI 概念很强」一句话，等于还没读表。",
      "重要边界：任何具体数字都会随季报更新；口径、分部划分以公司 10-Q／10-K 与交易所披露为准。钱力股财报 Tab 只提供日历、相对预期与压缩指标当线索板——用来练提问，不用来抄目标价。你完全可以用同一套三问套到自己盯的任意标的：利润方向是什么？家底哪一行最让我不安？现金有没有把利润「兑」出来？答完再谈仓位上限与失效，而不是先谈爱不爱这只股票。",
      "练习极简：挑一只你已经盯着的股票（别为练手找黑马），打开个股 → 财报 Tab，只写四行——利润最近两季方向；若只有利润好看，我最担心资产负债或现金的哪一点；同业对比里我还缺什么；若判断错了，仓位上限是多少。写得出来，三张表才算进了流程。写不出来，说明还在被标题拖着走。",
      "系列后文会拆开写：利润表怎么防「好看利润」、资产负债表怎么看家底质量、现金流量表怎么抓利润与现金背离。总论只留一句边界：本站摘要与指标供学习参考，不构成投资建议；三张表降低无知，不担保下一季数字。",
    ],
    "zh-TW": [
      "三張表是同一家公司的三面鏡子：利潤表看一段期間賺多少，資產負債表看某一時點家底與欠帳，現金流量表看錢進沒進口袋。",
      "讀法用閉環：利潤很好但經營現金很差，就要問應收、存貨；擴張或補窟窿要回資產負債結構。錢力股財報 Tab 給日曆、EPS／營收相對預期與壓縮指標，是線索不是判決；免費源有延遲，以官方揭露為準。",
      "用公開敘事練閉環（以 NVDA 為例，教學用）：利潤側看主引擎營收／增速與利潤率是否說圓；資產負債側看現金厚度、存貨與產能投入是否同向；現金側看經營現金是否跟上利潤、資本支出與回購怎麼擠口袋。數字隨季報變，以 10-Q／10-K 為準；站內摘要只練提問。同一套三問可套到任意標的。",
      "接同業對比、基本面清單與 AI 交叉驗證；財報季用提醒與模擬，不把超預期當梭哈。內容僅供學習，不構成投資建議。",
    ],
    en: [
      "Treat the three statements as one loop, not three homework sets. The income statement asks how much was earned on paper over a period; the balance sheet is a snapshot of assets, liabilities, and equity; the cash flow statement tracks cash through operating, investing, and financing—pretty earnings without cash still hurt.",
      "Practice the loop on a public narrative (NVDA as a classroom example—not a research note). On the P&L: is the data-center growth story still the engine, and do margins make the profit tale coherent? On the balance sheet: cash cushion, inventory, and capacity-related build-out—expansion talk often shows here before slogans. On cash flow: does operating cash keep up with earnings, and how do capex and buybacks/dividends squeeze the pocket? If the three faces disagree, you still have questions—not a ticker crush.",
      "Numbers move every quarter; segment labels and figures follow the company’s 10-Q/10-K. Q-Stock’s earnings tab is a clue board (calendar, vs estimates, compressed metrics)—for questions, not target prices. Reuse three asks on any name you already watch: profit direction; which balance-sheet line worries you; did cash “cash” the earnings? Then size and invalidation. Learning only—not advice.",
    ],
  },
};

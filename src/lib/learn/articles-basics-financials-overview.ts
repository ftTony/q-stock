import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** How the three statements fit together — entry to the financials series. */
export const LEARN_ARTICLE_FINANCIALS_OVERVIEW: LearnArticle = {
  slug: "financials-three-statements",
  category: "basics",
  ctaHref: "/markets",
  author: AUTHOR,
  publishedAt: PUBLISHED,
  updatedAt: PUBLISHED,
  title: {
    en: "Three statements, one story: P&L, balance sheet, cash",
    "zh-CN": "三张表怎么串：利润、资产负债与现金",
  },
  summary: {
    en: "Three mirrors of one company. Earnings ask what was booked, the balance sheet asks what is owned and owed, cash asks what actually landed in the pocket.",
    "zh-CN":
      "财报不是三本互不相关的账。利润说「赚没赚」，资产负债说「家底与欠账」，现金说「钱到底进没进口袋」。",
  },
  paragraphs: {
    en: [
      "Most first encounters with filings start with an earnings beat and end at the EPS cell. A few quarters later the receivables pile up and operating cash never shows. The fix: read three statements as three mirrors of one company, not three separate exams.",
    ],
    "zh-CN": [
      "很多人第一次看财报，是被「超预期」推着看的，结果只盯住每股收益那一格。过两季才发现应收堆着、经营现金对不上。学费交完才明白：三张表是同一家公司的三面镜子，不是三道独立考题。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "In Q-Stock, the financials tab on a symbol page gives you the calendar (upcoming and recent reports), EPS and revenue versus estimates, and a compressed set of ratios—gross margin, net margin, ROE, PE. That is a clue board, not a verdict; the digging is yours.",
      },
      { type: "h2", text: "What each statement answers" },
      {
        type: "table",
        head: ["Statement", "Question", "Gut feeling", "How it fools you"],
        rows: [
          ["Income", "What was earned on paper this period?", "Did the business actually happen?", "One-off gains inflating a single quarter"],
          ["Balance sheet", "What is owned and owed right now?", "Is the household solid?", "Goodwill and receivables padding assets"],
          ["Cash flow", "Did money reach the pocket?", "Is the pocket real?", "Pretty earnings, thin operating cash, every year"],
        ],
        caption:
          "Only when all three stories agree is it worth drilling into line items.",
      },
      {
        type: "p",
        text: "The practical read is a loop, not a top-to-bottom transcription. Profit rising should land somewhere in equity or assets. Earnings strong but operating cash weak means asking whether receivables, inventory, or payables are padding the profit. Heavy capex with heavy financing could be expansion—or hole-filling; the balance sheet's cash and debt structure tells you which.",
      },
      {
        type: "p",
        text: "A hypothetical example: revenue 10.0bn, net profit 1.2bn—a clean 12% net margin. Flip to cash flow: operating cash only 0.3bn. Flip to the balance sheet: receivables up 1.5bn year over year. Read together, the story surfaces on its own—the profit may be an IOU booked on paper. Staring at the EPS cell alone, none of this exists. The numbers are hypothetical; the method is not.",
      },
      { type: "h2", text: "Good profit, weak cash: check three places" },
      {
        type: "ul",
        items: [
          "Receivables: goods shipped, cash not back—watch whether payment terms keep stretching.",
          "Inventory: production enthusiasm outrunning sales, money parked in the warehouse.",
          "Payables: cash 'improvement' financed by stalling suppliers—it holds for a few quarters, not years.",
        ],
      },
      { type: "h2", text: "Divergence quick reference" },
      {
        type: "table",
        head: ["You see", "Suspect first", "Check next"],
        rows: [
          ["Net profit up, operating cash flat", "Income vs cash flow", "Receivables, inventory, depreciation policy"],
          ["Revenue up, gross margin sliding", "Income statement", "Price-cut-for-volume or rising costs"],
          ["Cash thick, debt also surging", "Balance sheet", "Borrowed money or earned money"],
          ["Buybacks and dividends everywhere", "Financing section of cash flow", "Does free cash flow carry it"],
        ],
        caption:
          "Divergence is not a guilty verdict—it is where the next question lives. Several quarters of the same divergence is what deserves real attention.",
      },
      {
        type: "p",
        text: "Two caveats: HK coverage can be thinner, and crypto has no traditional financials—the interface labels this, so do not paste US habits onto them. Free feeds estimate and lag; when something conflicts, exchange and company disclosures win.",
      },
      { type: "h2", text: "Common traps" },
      {
        type: "ul",
        items: [
          "Deciding from the EPS cell alone: single-quarter surprises are the easiest thing for one-off items to inflate.",
          "Translating 'beat expectations' into a buy button: how much of the beat is already priced is not in the summary.",
          "Treating one quarter as the steady state: at a cyclical peak, both profit and PE lie.",
        ],
      },
      { type: "h2", text: "Practice the loop on a public narrative" },
      {
        type: "p",
        text: "Take NVDA as a classroom example—teaching only, not a research note, and figures follow the latest 10-Q/10-K. Income side: is data-center revenue still the engine, and do margins make the profit story coherent? Balance sheet side: how thick is the cash cushion, and do inventory and capacity build-out move with the narrative? Cash side: does operating cash keep up with booked profit, and how do capex and buybacks squeeze the pocket? Three faces confirming each other—that is a story inside the loop. 'AI is strong' alone means you have not read the tables.",
      },
      {
        type: "p",
        text: "Then wire it into the flow: after the three statements give you a near-term read, open peer compare to ask whether the yardstick matches, revisit the five fundamental questions for business and loss budget, and only then talk size and invalidation. In earnings season, mark the calendar, bind alerts to your own invalidation level, and rehearse 'what if I am wrong' on paper—social media rushing you into a position is not a process.",
      },
      {
        type: "p",
        text: "Minimal drill: pick a stock you already watch, open the financials tab, write four lines—profit direction over the last two quarters; if only profit looks good, which balance-sheet or cash line worries you; what is still missing in peer compare; the size cap if you are wrong. If you can write them, the statements are in your process. If not, headlines are driving.",
      },
      {
        type: "note",
        text: "Educational. All figures are hypothetical. Summaries and ratios are for study, not investment advice; three statements reduce ignorance, they do not guarantee next quarter's numbers.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "在钱力股里，个股页的财报 Tab 先给你日历（即将与近期公布）、EPS 与营收相对预期的表现，以及一串压缩指标——毛利率、净利率、ROE、PE 这些。它们是线索板，不是判决书；往下拆，得靠你自己问。",
      },
      { type: "h2", text: "三张表各自回答什么" },
      {
        type: "table",
        head: ["报表", "回答的问题", "一句话直觉", "最怕被怎么骗"],
        rows: [
          ["利润表", "一段时期账面赚了多少", "生意做成了没有", "一次性收益撑起的单季"],
          ["资产负债表", "某一时点家里有什么、欠谁什么", "家底厚不厚", "商誉和应收撑大的资产"],
          ["现金流量表", "钱到底进没进口袋", "口袋实不实", "利润好看但现金常年偏少"],
        ],
        caption: "三句话对得上，才谈得上往下拆科目。",
      },
      {
        type: "p",
        text: "更实用的读法是闭环，不是从上到下抄一遍。利润增加，通常会落到权益或资产某处；利润好但经营现金差，就要去问应收、存货、应付款是不是在垫利润；资本开支猛、筹资进账多，可能是扩张，也可能在补窟窿——回资产负债表看现金和负债结构，答案在那儿。",
      },
      {
        type: "p",
        text: "举个假设的算例：某公司营收 100 亿、净利 12 亿，净利率 12%，看着健康。翻现金流量表，经营现金流只有 3 亿；再翻资产负债表，应收账款同比多了 15 亿。三面对照，问题自己浮出来——利润可能只是记在纸上的「欠条」。单看 EPS 那一格，这个故事完全看不见。数字是假设的，方法是真的。",
      },
      { type: "h2", text: "利润好但现金差，先查三处" },
      {
        type: "ul",
        items: [
          "应收账款：货发出去了，钱没回来——看账期是不是在拉长。",
          "存货：生产热情高过销售，资金压在仓库里。",
          "应付款：靠拖欠上游撑出来的现金改善，撑得了几个季度，撑不了几年。",
        ],
      },
      { type: "h2", text: "背离信号速查" },
      {
        type: "table",
        head: ["你看到的", "先怀疑哪里", "下一步查什么"],
        rows: [
          ["净利涨，经营现金没跟上", "利润表 ↔ 现金流量表", "应收、存货、折旧口径"],
          ["营收涨，毛利率一路掉", "利润表", "降价换量，还是成本上抬"],
          ["现金厚，但负债也在猛涨", "资产负债表", "钱是借来的还是赚来的"],
          ["回购分红很热闹", "现金流量表筹资端", "自由现金流转不转得动"],
        ],
        caption: "背离不是罪证，是提问的起点；连续几个季度同向背离，才值得认真对待。",
      },
      {
        type: "p",
        text: "两个提醒：港股部分的公告能力仍有限，加密没有传统财报——界面会标明，别硬套美股习惯。免费源常有估算与延迟，对不上时以交易所和公司官方披露为准。",
      },
      { type: "h2", text: "常见踩坑" },
      {
        type: "ul",
        items: [
          "只看 EPS 一格就下结论：单季惊喜最容易被一次性项目撑起来。",
          "把「超预期」翻译成买入按钮：预期差已被定价多少，摘要不会告诉你。",
          "拿单季当常态：周期股在景气顶点，利润和 PE 都会骗人。",
        ],
      },
      { type: "h2", text: "用公开叙事练闭环" },
      {
        type: "p",
        text: "拿 NVDA 当课堂例子（教学用，不是研报；数字随季报更新，以最新 10-Q/10-K 为准）。利润表侧：数据中心营收还是不是主引擎，毛利率有没有把利润率故事说圆。资产负债表侧：现金垫子厚不厚，存货和产能投入跟叙事同不同向。现金流量表侧：经营现金追不追得上账面利润，资本开支和回购怎么挤占口袋。三面互相印证，故事才算进了闭环；只剩「AI 很强」一句话，等于还没读表。",
      },
      {
        type: "p",
        text: "然后接进流程：三张表建立近况判断后，再开同业对比问「尺子一不一样」，回选股五问核对业务与风险预算，最后才谈仓位上限和失效价。财报季别被社交媒体催着上仓位——日历标好日期，提醒绑你自己的失效位，拿不准用模拟盘走一遍「若错了怎么认亏」。",
      },
      {
        type: "p",
        text: "练习极简：挑一只你盯着的股票，打开财报 Tab，只写四行——利润最近两季方向；若只有利润好看，最担心家底或现金哪一点；同业对比里还缺什么；判断错了仓位上限是多少。写得出来，三张表才算进了流程；写不出来，说明还在被标题拖着走。",
      },
      {
        type: "note",
        text: "本篇为教学示例，所有数字均为假设。摘要与指标供学习参考，不构成投资建议；三张表降低无知，不担保下一季数字。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "I cannot read English filings. Am I stuck?",
        a: "No. Start with the compressed ratios for direction, then read the management discussion section—it is written in plainer language. Line-item details can come later; direction first.",
      },
      {
        q: "How bad is a falling gross margin?",
        a: "No universal number—depends on the industry and the cause. One quarter of drift is noise; several quarters in one direction with vague explanations from management is what deserves attention.",
      },
      {
        q: "High ROE means a good company, right?",
        a: "High ROE has three sources: genuinely good returns, leverage, or buybacks shrinking the denominator. Check the balance sheet for debt before concluding—single ratios mislead most.",
      },
      {
        q: "Should I position ahead of the earnings date?",
        a: "That is a direction bet on a known event. The steadier move: mark the calendar, decide in advance how you would cut if wrong, and size for that—not for being right.",
      },
    ],
    "zh-CN": [
      {
        q: "我看不懂英文财报，还有救吗？",
        a: "有。先用站内压缩指标建立方向感，再挑年报里的「管理层讨论」读——那部分讲人话。科目细节可以慢慢补，方向感先建立。",
      },
      {
        q: "毛利率下滑多少算严重？",
        a: "没有统一答案，看行业和原因。一个季度的小幅波动是噪音；连续几个季度单向下滑、公司解释含糊，才需要认真对待。",
      },
      {
        q: "ROE 高就代表公司好吗？",
        a: "ROE 高有三种来源：真赚钱、高杠杆、大额回购缩了分母。先翻资产负债表看杠杆，再下结论——单看一个比率最容易被骗。",
      },
      {
        q: "财报公布前要不要提前埋伏？",
        a: "那是对已知事件的赌方向。更稳的做法：日期标进日历，仓位提前想好「错了怎么认」，为出错设计，而不是为猜对设计。",
      },
    ],
  },
  links: {
    en: [
      { label: "Income statement deep dive", href: "/learn/financials-income-statement" },
      { label: "Balance sheet quality", href: "/learn/financials-balance-sheet" },
      { label: "Cash flow red flags", href: "/learn/cash-flow-red-flags" },
      { label: "How to use peer compare", href: "/learn/peer-compare" },
      { label: "Picking steps", href: "/learn/stock-picking-steps" },
      { label: "Markets (US/HK/A/crypto)", href: "/markets" },
    ],
    "zh-CN": [
      { label: "利润表拆解", href: "/learn/financials-income-statement" },
      { label: "资产负债表看家底", href: "/learn/financials-balance-sheet" },
      { label: "现金流红旗清单", href: "/learn/cash-flow-red-flags" },
      { label: "同业对比怎么用", href: "/learn/peer-compare" },
      { label: "选股步骤", href: "/learn/stock-picking-steps" },
      { label: "多市场行情（美股/港股/A股/加密币）", href: "/markets" },
    ],
  },
  sourceNote: {
    en: "Educational. All figures are hypothetical; official filings and exchange disclosures prevail over any summary. Not investment advice.",
    "zh-CN": "仅供学习。文中数字均为假设；口径与数字以官方披露为准。不构成投资建议。",
  },
};

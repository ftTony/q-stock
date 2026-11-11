import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";
const UPDATED = "2026-11-11";

/** Balance sheet — starts from ROE vanity; honest about empty tabs. */
export const LEARN_ARTICLE_FINANCIALS_BALANCE: LearnArticle = {
  slug: "financials-balance-sheet",
  category: "basics",
  ctaHref: "/analysis",
  author: AUTHOR,
  publishedAt: PUBLISHED,
  updatedAt: UPDATED,
  title: {
    "zh-CN": "资产负债表：ROE 好看时，先查短债和应收",
    "zh-TW": "資產負債表：ROE 好看時，先查短債和應收",
    en: "Balance sheet: when ROE looks great, check short debt and receivables",
  },
  summary: {
    "zh-CN":
      "财务指标里的 ROE、市净是压缩灯号。家底虚不虚，要看应收、存货、商誉和一年内到期的债——而站内资产负债页对部分市场可能是空表。仅供学习。",
    "zh-TW":
      "ROE、市淨是壓縮燈號。虛不虛看應收、存貨、商譽與一年內到期債；部分市場资产负债页可能是空表。僅供學習。",
    en: "ROE and PB are compressed lamps. Softness shows up in receivables, inventory, goodwill, and debt due within a year—and our balance tab can be empty for some markets. Learning only.",
  },
  paragraphs: {
    en: [
      "High ROE is where vanity starts. Sometimes the engine is a thin equity base after buybacks, not a better business.",
    ],
    "zh-CN": [
      "ROE 很高的时候，最容易开始自夸。有时引擎只是回购后变薄的净资产，不是生意变好了。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Classroom walk: open 00700 (or another HK name you follow) → Financials. Left nav lists Metrics, Income, Balance sheet, Cash flow, Calendar. Metrics may show ROE TTM, PB annual, debt-ish ratios if the feed has them. Click Balance sheet: on many HK names you get a thin table—or an empty state. That empty state is a product fact, not your failure to “read fundamentals.” When the table is empty, the annual report PDF is the next click, not another ratio on our page.",
      },
      { type: "h2", text: "The night-time inventory questions" },
      {
        type: "p",
        text: "Treat the balance sheet as a household count at midnight: what becomes cash how fast, what comes due how soon. Cash and short-term investments are ammunition. Receivables are sales that have not collected—if they grow much faster than revenue for two years, the ageing note in the filing matters more than our turnover ratio (which, when present, is a single compressed number without the ageing schedule). Inventory: finished goods rising while growth slows is the uncomfortable mix; raw-materials build ahead of a known capacity ramp can be innocent.",
      },
      {
        type: "ul",
        items: [
          "Contract assets (IFRS 15 / similar) are not classic trade receivables—mixing them in a homemade “days sales outstanding” can invent a fake red flag.",
          "Lease right-of-use assets and lease liabilities fatten both sides after IFRS 16 / ASC 842; peer compare without the same standard is noise.",
          "“Other receivables” and prepayments are where related-party parking lots tend to sit—watch share of total assets, not absolute growth alone.",
        ],
      },
      { type: "h2", text: "Short debt is the part that wakes you up" },
      {
        type: "p",
        text: "Short-term borrowings plus the current portion of long-term debt decide whether next year is a refinance problem. A company can look asset-rich and still be one rolled facility away from stress. Our solvency group (when populated) may show current ratio, quick ratio, debt-to-equity—useful lamps, silent on covenants and maturity ladders. Buybacks that shrink equity while cash thins and interest-bearing debt rises can lift EPS and ROE together; that twin lift is a smell, not a medal.",
      },
      {
        type: "table",
        head: ["Pretty P&L", "Balance sheet often shows", "First suspicion"],
        rows: [
          ["Strong profit", "Receivables + inventory surge", "Earnings on IOUs"],
          ["Fine earnings", "Cash down, ST debt up", "Expansion vs hole-filling"],
          ["EPS via buybacks", "Thin cash, rising leverage", "Per-share cosmetics"],
        ],
      },
      { type: "h2", text: "Goodwill without a purity test" },
      {
        type: "p",
        text: "Avoiding every name with goodwill is a superstition. Watch whether goodwill’s share of assets is climbing and whether impairment language in the notes is vague. Impairment tests are model-driven; a year with no charge is not proof the acquisition worked.",
      },
      {
        type: "p",
        text: "On Analysis, drop two to four peers and ask who holds more cash versus who carries tighter short debt—do not crown the fattest total assets. If PB looks “cheap,” ask whether book is cash-convertible or full of soft items. Soft book + low PB is not a gift.",
      },
      {
        type: "note",
        text: "Empty balance tabs and thin HK rows are known coverage gaps. Educational; not advice. Industry norms differ—do not paste software inventory days onto a developer.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "课堂走读：打开 00700（或你盯着的港股）→ 财务。左侧有财务指标、利润表、资产负债表、现金流量表、财报日历。指标区可能有 ROE TTM、市净、部分偿债比率。点开资产负债表：很多港股只有薄表，甚至是空态。空态是覆盖事实，不是你「基本面没读会」。表空的时候，下一步是年报 PDF，不是在我们页上再翻一个比率。",
      },
      { type: "h2", text: "半夜盘点时只问两句" },
      {
        type: "p",
        text: "有什么、多快变现；欠什么、多快到期。货币资金是子弹。应收是货卖了钱未回——若连续两年增速远超营收，附注里的账龄比站内那个压缩的「应收周转」更要紧（有周转数字时，也没有账龄表）。存货：产成品堆、增长却放缓，最不舒服；为已知扩产备原材料，可以是正当解释。",
      },
      {
        type: "ul",
        items: [
          "合同资产不是经典应收账款——自己算 DSO 时若混在一起，会造出假红旗。",
          "使用权资产与租赁负债会让两边同时变胖（IFRS 16 / 同类准则）；同业对比若不在同一准则上，是噪声。",
          "「其他应收 / 预付」常是关联方停车位——看占资产比重，不单看绝对值增长。",
        ],
      },
      { type: "h2", text: "短债才是会把人叫醒的那一段" },
      {
        type: "p",
        text: "短借加上一年内到期的长债，决定明年是不是再融资问题。家底看起来很厚，也可能离「续不上的额度」只差一次滚动。偿债分组（有数据时）可能给流动比率、速动比率、资产负债——灯号有用，对契约条款和到期阶梯沉默。现金变薄、有息负债上升同时猛回购，EPS 与 ROE 可以一起抬；这种双升是气味，不是勋章。",
      },
      {
        type: "table",
        head: ["利润表好看", "资产负债表常显示", "先怀疑"],
        rows: [
          ["利润很强", "应收+存货暴涨", "利润是欠条"],
          ["利润尚可", "现金掉、短债升", "扩张还是补窟窿"],
          ["回购抬 EPS", "现金薄、杠杆升", "每股数字的化妆术"],
        ],
      },
      { type: "h2", text: "商誉：别搞零商誉洁癖" },
      {
        type: "p",
        text: "见商誉就避开是迷信。看它占资产比重是否在抬、附注减值表述是否含糊。减值测试依赖模型；某年没计提，不等于并购成功。",
      },
      {
        type: "p",
        text: "分析页丢进 2～4 家同业，问谁现金更厚、谁短债更紧——不要比谁总资产更大。市净「便宜」时，先问净资产是可变现的，还是软资产堆出来的。软净资产配低市净，不是礼物。",
      },
      {
        type: "note",
        text: "资产负债空表、港股行较少，是已知覆盖缺口。仅供学习，非投资建议。行业口径差很大，别把软件存货天数套到开发商。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Balance sheet tab is empty—did I break something?",
        a: "Often coverage. Try Metrics ratios if present; otherwise the official filing. HK and smaller names are thinner.",
      },
      {
        q: "High PB means overvalued?",
        a: "Not by itself. Asset-light businesses and banks use different rulers; quality of book matters.",
      },
    ],
    "zh-CN": [
      {
        q: "资产负债表是空的，是不是坏了？",
        a: "多数是覆盖问题。有指标就先看压缩比率；否则直接官方披露。港股与小票更薄。",
      },
      {
        q: "市净高就是贵？",
        a: "单看不行。轻资产与银行尺子不同；净资产质量更关键。",
      },
    ],
  },
  links: {
    en: [
      { label: "Three statements", href: "/learn/financials-three-statements" },
      { label: "Income statement", href: "/learn/financials-income-statement" },
      { label: "Cash flow", href: "/learn/financials-cash-flow" },
      { label: "Cash-flow red flags", href: "/learn/cash-flow-red-flags" },
      { label: "Analysis page", href: "/analysis" },
      { label: "Open 00700", href: "/symbol/hk/00700" },
    ],
    "zh-CN": [
      { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
      { label: "利润表", href: "/learn/financials-income-statement" },
      { label: "现金流量表", href: "/learn/financials-cash-flow" },
      { label: "现金流红旗", href: "/learn/cash-flow-red-flags" },
      { label: "分析页", href: "/analysis" },
      { label: "打开 00700", href: "/symbol/hk/00700" },
    ],
  },
  sourceNote: {
    en: "Balance rows depend on vendor coverage; empty is possible. Filings win. Educational only.",
    "zh-CN": "资产负债行依赖数据源覆盖，空表可能出现。以官方披露为准。仅供学习。",
  },
};

import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";
const UPDATED = "2026-11-11";

/** Income statement — asymmetric deep read; product-honest about surprise %. */
export const LEARN_ARTICLE_FINANCIALS_INCOME: LearnArticle = {
  slug: "financials-income-statement",
  category: "basics",
  ctaHref: "/markets",
  author: AUTHOR,
  publishedAt: PUBLISHED,
  updatedAt: UPDATED,
  title: {
    "zh-CN": "利润表：别让「超预期 %」替你读完整张表",
    "zh-TW": "利潤表：別讓「超預期 %」替你讀完整張表",
    en: "Income statement: don’t let surprise % finish the read for you",
  },
  summary: {
    "zh-CN":
      "钱力股利润表区会突出 EPS/营收相对预期的差值——那是情绪线索。真正要盯的是营收是否可重复、毛利是否被一次性项目抬着、以及应收有没有同步膨胀。仅供学习。",
    "zh-TW":
      "站內會突出 EPS／營收相對預期的差值——那是情緒線索。要盯營收可否重複、毛利是否被一次性抬著、應收有沒有膨脹。僅供學習。",
    en: "Our income view highlights EPS/revenue versus estimates—mood, not a ticket. Watch whether revenue repeats, whether margins lean on one-offs, and whether receivables swell with the beat. Learning only.",
  },
  paragraphs: {
    en: [
      "I once sized up on a clean “EPS +12% vs consensus” print. Three months later the same company guided down—half the beat had been a disposal gain parked below operating profit. The surprise cell never lied; I just stopped reading after it.",
    ],
    "zh-CN": [
      "我有过一笔：财报弹「EPS 超预期 12%」，仓位跟着加。三个月后公司下调指引——那次超预期有一半来自营业外的资产处置收益。预期差那一格没骗人，是我自己读到那儿就停了。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Open a liquid US name (classroom: AAPL → Financials → Income). You usually see: a surprise strip (actual vs estimate), a period picker (annual / quarter), and a compressed table—revenue, EPS, gross / operating / net margin, sometimes ROE. Toggle YoY and you get colour on change rates. What you do not get: segment footnotes, “adjusted EBITDA” reconciliations, or the MD&A paragraph that admits the beat was a one-off. Those live in the 10-Q.",
      },
      { type: "h2", text: "What the surprise % is actually comparing" },
      {
        type: "p",
        text: "Consensus is a blend of sell-side models with different fiscal calendars and non-GAAP habits. A “beat” can mean: (1) the Street was too low on volume, (2) the company recognised revenue earlier than models assumed, or (3) a below-the-line item the models never modelled. A-share “扣非净利润” versus US GAAP net income is another seam—if you paste the same surprise ritual across markets, you are comparing different animals.",
      },
      {
        type: "ul",
        items: [
          "Ask whether the beat sits in operating profit or only in net income.",
          "If gross margin jumped in one quarter with vague language, treat the % as a question, not a trophy.",
          "When the feed shows “degraded” or empty estimate cells, stop inventing a narrative from a blank strip.",
        ],
      },
      { type: "h2", text: "Three口径 pits that inflate a pretty P&L" },
      {
        type: "p",
        text: "Channel push: shipments counted as sales while inventory sits at distributors—revenue up, cash and receivables tell on you later. Capitalising costs that peers expense: operating profit looks leaner for a while. Fair-value swings and government grants: they can dominate net income without the core selling more units. None of these are automatically fraud; all of them make a single EPS cell a bad summary.",
      },
      {
        type: "table",
        head: ["If you only notice…", "Also open…", "Why"],
        rows: [
          ["EPS beat %", "Operating margin trend (YoY)", "Is the core earning, or only the bottom line?"],
          ["Revenue growth", "Receivables turnover / balance sheet", "Did the sale collect?"],
          ["Non-GAAP “record”", "GAAP operating profit", "What was excluded this time?"],
        ],
      },
      { type: "h2", text: "Honest limits of this tab" },
      {
        type: "p",
        text: "HK coverage is often thinner than US; some tickers show calendar and little else. Crypto has no traditional P&L—do not paste this essay onto it. Free feeds lag and estimate; when our number disagrees with the exchange filing, the filing wins. Peer compare on Analysis will happily put two names next to each other even when one reports non-GAAP and the other does not—you still have to pick one ruler.",
      },
      {
        type: "p",
        text: "If you want a single next move after a beat: write one sentence in the watchlist—“beat from ops / beat from other / don’t know”—then check cash flow before you change size. Skipping that sentence is how the +12% story ends.",
      },
      {
        type: "note",
        text: "Classroom walks and hypothetical beats are for method practice, not recommendations. Not investment advice.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "打开一只流动性好的美股做课堂（例：AAPL → 财务 → 利润表）。你通常会看到：预期差条（实际 vs 预期）、期间切换（年/季）、压缩表——营收、EPS、毛利率/营业利润率/净利率，有时还有 ROE。打开同比，涨跌幅会着色。你看不到的：分部附注、「调整后 EBITDA」调节表、以及 MD&A 里承认「这次超预期有一次性」的那一段。那些在 10-Q 里。",
      },
      { type: "h2", text: "「超预期 %」到底在比什么" },
      {
        type: "p",
        text: "一致预期是卖方模型的混合物，财年日历和非 GAAP 习惯并不统一。一次「超预期」可能是：(1) 街对量估低了；(2) 收入确认比模型更靠前；(3) 模型根本没建模的线下项目。A 股「扣非净利润」和美股 GAAP 净利润又是另一道缝——跨市场复用同一套惊喜仪式，等于拿不同动物比体重。",
      },
      {
        type: "ul",
        items: [
          "先问：超预期落在营业利润，还是只落在净利润？",
          "毛利率单季跳升且表述含糊，把 % 当问题，不当奖杯。",
          "界面若提示数据降级、或预期格是空的，别对着空白条编故事。",
        ],
      },
      { type: "h2", text: "三个会把利润表打扮漂亮的口径坑" },
      {
        type: "p",
        text: "渠道压货：出货记收入，货还在经销商仓库——营收好看，现金和应收稍后会作证。把同行费用化的成本资本化：营业利润会暂时显得干净。公允价值波动与政府补助：可以撑起净利润，而主业并没多卖一台货。这些不自动等于造假；但它们都让「只看 EPS 那一格」变成坏摘要。",
      },
      {
        type: "table",
        head: ["如果你只注意到…", "请再打开…", "为什么"],
        rows: [
          ["EPS 超预期 %", "营业利润率同比", "是主业在赚，还是只有底线在赚？"],
          ["营收增长", "应收周转 / 资产负债表", "这单货收回钱了吗？"],
          ["非 GAAP「创新高」", "GAAP 营业利润", "这次剔除了什么？"],
        ],
      },
      { type: "h2", text: "这个 Tab 诚实的边界" },
      {
        type: "p",
        text: "港股覆盖常常比美股薄，有的标的只剩日历。加密货币没有传统利润表——别把这篇套上去。免费源会估算、会延迟；和交易所披露冲突时，以官方为准。分析页的同业对比很乐意把两家并排，即便一家报非 GAAP、另一家不报——尺子仍要你自己选。",
      },
      {
        type: "p",
        text: "超预期之后若只做一个动作：在自选写一句「超预期来自主业 / 来自其他 / 不知道」，再去看现金流，然后再谈改不改仓。省掉这句，就是 +12% 故事的续集。",
      },
      {
        type: "note",
        text: "课堂走读与假设案例只练方法，不是荐股。不构成投资建议。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Why does your surprise % differ from another app?",
        a: "Different consensus vendors and whether they use GAAP vs adjusted EPS. Treat the direction as a clue; reconcile against the filing if the stake is large.",
      },
      {
        q: "Is a miss automatically bearish?",
        a: "No. How much was priced, and whether the miss is one-off, matter more than the headline %.",
      },
    ],
    "zh-CN": [
      {
        q: "为什么你们的超预期 % 和其他 App 不一样？",
        a: "一致预期供应商不同，有的用 GAAP、有的用调整后 EPS。把方向当线索；仓位重时以官方披露核对。",
      },
      {
        q: "不及预期就一定看空吗？",
        a: "不。已被定价多少、是不是一次性，比标题百分比更重要。",
      },
    ],
  },
  links: {
    en: [
      { label: "Three statements", href: "/learn/financials-three-statements" },
      { label: "Balance sheet", href: "/learn/financials-balance-sheet" },
      { label: "Cash flow", href: "/learn/financials-cash-flow" },
      { label: "Cash-flow red flags", href: "/learn/cash-flow-red-flags" },
      { label: "Peer compare", href: "/learn/peer-compare" },
      { label: "Open AAPL financials", href: "/symbol/stock/AAPL" },
    ],
    "zh-CN": [
      { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
      { label: "资产负债表", href: "/learn/financials-balance-sheet" },
      { label: "现金流量表", href: "/learn/financials-cash-flow" },
      { label: "现金流红旗", href: "/learn/cash-flow-red-flags" },
      { label: "同业对比", href: "/learn/peer-compare" },
      { label: "打开 AAPL 财报", href: "/symbol/stock/AAPL" },
    ],
  },
  sourceNote: {
    en: "Surprise and margin rows come from free market feeds; filings win conflicts. Educational only.",
    "zh-CN": "预期差与利润率行来自免费行情源；冲突时以官方披露为准。仅供学习。",
  },
};

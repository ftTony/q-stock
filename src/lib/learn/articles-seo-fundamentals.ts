import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * Fundamentals cluster. Deliberately avoids naming issuers: the article teaches
 * a screening method, and naming companies would turn an educational piece
 * into something closer to a call, which this site does not publish.
 */
export const LEARN_ARTICLES_SEO_FUNDAMENTALS: LearnArticle[] = [
  {
    slug: "cash-flow-red-flags",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Negative operating cash flow, beautiful profit: five signals in the statements",
      "zh-CN": "经营现金流为负、净利润很漂亮：三张表里的 5 个危险信号",
    },
    summary: {
      en: "Profit is an estimate; cash is a fact. Five ratios that show when reported earnings are not turning into money, with the thresholds, where to look in the filing, and the innocent explanations you should rule out first.",
      "zh-CN": "利润是估计，现金是事实。五个比值判断「账面利润没有变成钱」，给出阈值、去财报哪里查，以及必须先排除的正当解释。",
    },
    paragraphs: {
      en: [
        "A company can report rising profit for years while the bank balance does not move.",
        "The statements usually say so out loud, in a place most readers never open.",
      ],
      "zh-CN": [
        "一家公司可以连续几年报告利润增长，而银行账户里的钱没有变化。",
        "财报其实把这件事写在明面上了，只是多数人不会翻到那一页。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Short answer: compare operating cash flow to net profit, receivables growth to revenue growth, and inventory days year on year. Two of the five signals firing at once is a reason to read the notes — not a verdict, and never a trade on its own.",
        },
        { type: "h2", text: "Why cash flow is the harder number to bend" },
        {
          type: "p",
          text: "Revenue is recognised when control transfers, not when cash arrives. That is correct accounting, and it is also the seam where aggressive reporting lives: pull revenue forward, capitalise a cost, stretch an amortisation period, and profit rises while cash does not. The cash flow statement is harder to bend because it reconciles to an actual bank movement.",
        },
        { type: "h2", text: "Signal 1: operating cash flow below net profit, repeatedly" },
        {
          type: "p",
          text: "Compute operating cash flow ÷ net profit for three consecutive years. A ratio persistently below roughly 0.8 means a fifth or more of reported profit is not converting. One bad year is often working capital; three is a pattern.",
        },
        { type: "h2", text: "Signal 2: receivables growing faster than revenue" },
        {
          type: "p",
          text: "If accounts receivable grows 20 percentage points faster than revenue for two years, the company is either selling to slower payers or recognising revenue it has not collected. Check the ageing schedule in the notes and the provision for doubtful debts — a falling provision while ageing worsens is its own signal.",
        },
        { type: "h2", text: "Signal 3: inventory days rising sharply" },
        {
          type: "p",
          text: "Inventory days up 30% year on year means either a deliberate build (new capacity, expected demand) or product that is not moving. The distinguishing question is in the notes: is the build in raw materials, work in progress, or finished goods? Finished goods rising while revenue growth slows is the least comfortable combination.",
        },
        { type: "h2", text: "Signal 4: other receivables and prepayments inflating" },
        {
          type: "p",
          text: "These lines are where related-party balances and questionable capitalised spending tend to sit. Absolute growth matters less than the share of total assets: when 「other receivables」 becomes a material slice of the balance sheet, the notes usually explain why, and the explanation is the test.",
        },
        { type: "h2", text: "Signal 5: profit carried by non-recurring items" },
        {
          type: "p",
          text: "Asset sales, fair-value gains, government grants and reversals of provisions can all lift net profit without any operating improvement. Compare operating profit to net profit and read the non-recurring line. If the gap is growing, the headline number is not the business.",
        },
        { type: "h2", text: "The five-signal summary" },
        {
          type: "table",
          head: ["#", "Signal", "Rough threshold", "Where to look"],
          rows: [
            ["1", "Operating cash flow ÷ net profit", "Below 0.8 for 3 years", "Cash flow statement"],
            ["2", "Receivables growth vs revenue growth", "20pp faster for 2 years", "Balance sheet + ageing note"],
            ["3", "Inventory days", "+30% year on year", "Notes: raw materials vs finished goods"],
            ["4", "Other receivables / total assets", "Rising share, material size", "Notes: related-party disclosures"],
            ["5", "Non-recurring share of profit", "Growing gap vs operating profit", "Income statement + notes"],
          ],
          caption:
            "Thresholds are screening triggers, not accounting rules. Industry norms differ sharply — a property developer and a software company have no business being compared on inventory days.",
        },
        { type: "h2", text: "What innocent explanations look like" },
        {
          type: "ul",
          items: [
            "Rapid expansion: a company building plants consumes cash before it earns it, and the cash flow statement shows capex, not fraud.",
            "Prepayment-heavy business models, where customers pay late by contract rather than by distress.",
            "Seasonality: a single year-end snapshot can misrepresent a business that swings through the cycle.",
            "Currency and consolidation effects, which change reported balances without any change in operations.",
          ],
        },
        { type: "h2", text: "How to use this without overreaching" },
        {
          type: "p",
          text: "Treat the five signals as a reading list, not a verdict: each one tells you which note to open next. A company can fire three signals and be perfectly sound, and a company can fire none and still be fragile. What the exercise does reliably is shorten the list of filings you need to read carefully.",
        },
        { type: "h2", text: "The order you read the statements matters more than the list" },
        {
          type: "p",
          text: "Start with cash flow, the hardest statement to bend: is operating cash flow positive, is capex funded by operations or by borrowing, is financing activity plugging a hole? This sets the frame for where the money actually comes from.",
        },
        {
          type: "p",
          text: "Then the balance sheet: receivables, inventory, other receivables, short-term borrowings and the current portion of long-term debt. Those four decide whether next year brings a liquidity problem. Read assets and maturities together — assets alone hide the refinancing risk.",
        },
        {
          type: "p",
          text: "Read the income statement last: does revenue growth match the gross margin trend, did the expense ratio fall for no stated reason, how much of profit is non-recurring? The order is practical — starting with profit anchors you on a flattering number, and it is harder to be sceptical afterwards.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先给结论：把经营现金流和净利润比、把应收增速和营收增速比、把存货周转天数和去年比。五个信号里同时亮两个，就该去翻附注了——那是一个阅读线索，不是一个判决，更不能单独作为买卖依据。",
        },
        { type: "h2", text: "为什么现金流更难被修饰" },
        {
          type: "p",
          text: "收入在控制权转移时确认，而不是在收到钱时确认。这在会计上是对的，也正好是激进报表的接缝：提前确认收入、把费用资本化、拉长摊销年限，利润就上去了，现金没有。现金流量表更难修，因为它必须和真实的银行流水对得上。",
        },
        { type: "h2", text: "信号 1：经营现金流长期低于净利润" },
        {
          type: "p",
          text: "算连续三年的「经营现金流 ÷ 净利润」。这个比值长期低于 0.8 左右，意味着两成以上的账面利润没有变成钱。单年偏低常常是营运资金波动，连续三年则是一种模式。",
        },
        { type: "h2", text: "信号 2：应收账款增速快过营收" },
        {
          type: "p",
          text: "如果应收增速连续两年比营收增速快 20 个百分点，公司要么在卖给付款更慢的客户，要么确认了还没收回的收入。去看附注里的账龄结构和坏账准备：账龄在恶化、坏账准备反而在下降，这本身就是一个独立信号。",
        },
        { type: "h2", text: "信号 3：存货周转天数骤升" },
        {
          type: "p",
          text: "存货周转天数同比上升 30%，要么是主动备货（新产能、预期需求），要么是货卖不动。区分它们的问题在附注里：增加的是原材料、在产品还是产成品？产成品上升而营收增速在放缓，是最不舒服的组合。",
        },
        { type: "h2", text: "信号 4：其他应收款与预付款膨胀" },
        {
          type: "p",
          text: "这两行是关联方往来和可疑资本化支出最爱待的地方。绝对金额的增长不如占总资产的比例重要：当「其他应收款」占到资产的一个可观份额，附注通常会解释原因，而那个解释就是检验点。",
        },
        { type: "h2", text: "信号 5：利润靠非经常性损益撑着" },
        {
          type: "p",
          text: "卖资产、公允价值变动、政府补助、坏账转回，都能抬高净利润而不改善经营。把营业利润和净利润放在一起看，读非经常性损益那一行。如果两者的缺口在扩大，头条数字代表的就不是这门生意。",
        },
        { type: "h2", text: "五个信号汇总" },
        {
          type: "table",
          head: ["#", "信号", "经验阈值", "去哪查"],
          rows: [
            ["1", "经营现金流 ÷ 净利润", "连续 3 年低于 0.8", "合并现金流量表"],
            ["2", "应收增速 vs 营收增速", "快 20 个百分点、持续 2 年", "资产负债表 + 账龄附注"],
            ["3", "存货周转天数", "同比 +30%", "附注：原材料 vs 产成品"],
            ["4", "其他应收款 / 总资产", "占比上升且金额可观", "附注：关联方披露"],
            ["5", "非经常性损益占利润比", "与营业利润缺口扩大", "利润表 + 附注"],
          ],
          caption:
            "阈值是筛查触发线，不是会计规则。行业差异极大——地产开发商和软件公司的存货周转天数根本不该放在一起比。",
        },
        { type: "h2", text: "正当解释长什么样" },
        {
          type: "ul",
          items: [
            "高速扩张：建厂先花钱后赚钱，现金流量表上体现的是资本开支，不是造假。",
            "预付款模式：客户按合同晚付，而不是因为付不出。",
            "季节性：单看年末一个时点，会误判一家全年波动的公司。",
            "汇率与并表影响：报表数字变了，经营本身没变。",
          ],
        },
        { type: "h2", text: "怎么用才不过界" },
        {
          type: "p",
          text: "把这五个信号当成阅读清单，而不是判决书：每亮一个，只是告诉你下一份要看哪个附注。一家公司可能亮三个信号却完全健康，也可能一个都不亮却很脆弱。这个练习真正稳定的作用，是把你要精读的公告范围缩小。",
        },
        { type: "h2", text: "三张表的检查顺序，比检查什么更重要" },
        {
          type: "p",
          text: "先看现金流量表。它最难修饰：经营活动现金流是正是负、资本开支靠经营现金还是靠借款、筹资活动是不是在补窟窿。这一步会在你脑子里定下「钱从哪来」的基调。",
        },
        {
          type: "p",
          text: "再看资产负债表。应收、存货、其他应收款、短期借款与一年内到期债务——这四项决定了下一年会不会出现流动性问题。资产端和负债端要一起看，只看资产会漏掉到期结构。",
        },
        {
          type: "p",
          text: "最后看利润表。收入增速与毛利率是否匹配、费用率有没有异常下降、非经常性损益占多大比重。顺序的理由很实际：先看利润容易被「漂亮」锚定，先看现金、再看家底、最后看利润，留给你质疑的空间最大。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is a cash flow to profit ratio below 1 always bad?",
          a: "No. Growing companies routinely consume cash. What matters is whether the gap is explained by investment or by collections.",
        },
        {
          q: "Where exactly do I find operating cash flow?",
          a: "The consolidated cash flow statement, in the operating activities section — not the balance sheet. Reconcile it to net profit using the indirect method table.",
        },
        {
          q: "Can a company fail with healthy profit?",
          a: "Yes — running out of cash while reporting profit is one of the classic failure modes, which is why the cash conversion ratio matters.",
        },
        {
          q: "Do these thresholds apply to banks?",
          a: "Largely no. Financial institutions have a different statement structure; inventory and receivables ratios are not meaningful there.",
        },
      ],
      "zh-CN": [
        {
          q: "现金流/净利润低于 1 就一定有问题吗？",
          a: "不是。扩张期的公司经常消耗现金。关键看缺口是被投资解释的，还是被收款解释的。",
        },
        {
          q: "经营现金流具体在哪张表？",
          a: "合并现金流量表的经营活动部分，不是资产负债表。用间接法调节表把它和净利润对上。",
        },
        {
          q: "利润很好也会出问题吗？",
          a: "会。账上有利润、手里没现金，是最经典的倒下方式之一，这正是现金转化率重要的原因。",
        },
        {
          q: "这些阈值适用于银行吗？",
          a: "基本不适用。金融机构报表结构不同，存货和应收类比值在银行身上没有意义。",
        },
      ],
    },
    links: {
      en: [
        { label: "Reading the three statements", href: "/learn/financials-three-statements" },
        { label: "Cash flow statement basics", href: "/learn/financials-cash-flow" },
        { label: "Adjusted prices and dividends", href: "/learn/adjusted-price-and-dividends" },
      ],
      "zh-CN": [
        { label: "三张报表怎么连起来看", href: "/learn/financials-three-statements" },
        { label: "现金流量表基础", href: "/learn/financials-cash-flow" },
        { label: "复权、除权与分红再投", href: "/learn/adjusted-price-and-dividends" },
      ],
    },
    sourceNote: {
      en: "Educational screening framework only. No issuer is named or assessed; thresholds are rules of thumb, not standards. Read the primary filing before drawing any conclusion.",
      "zh-CN":
        "本文仅为教学用的筛查框架，不点名、不评价任何具体公司；阈值为经验值而非准则。任何结论都应以原始财报为准。",
    },
  },
];

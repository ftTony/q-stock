import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";
const UPDATED = "2026-11-11";

/** Cash flow — classification games first; product-honest about empty FCF. */
export const LEARN_ARTICLE_FINANCIALS_CASHFLOW: LearnArticle = {
  slug: "financials-cash-flow",
  category: "basics",
  ctaHref: "/review",
  author: AUTHOR,
  publishedAt: PUBLISHED,
  updatedAt: UPDATED,
  title: {
    "zh-CN": "现金流量表：经营现金对不上时，先别算「自由现金流圣杯」",
    "zh-TW": "現金流量表：經營現金對不上時，先別算「自由現金流聖杯」",
    en: "Cash flow: when OCF diverges, skip the free-cash holy grail",
  },
  summary: {
    "zh-CN":
      "站内现金流页对不少标的是薄表或空表，也不会给你一键 FCF。真正有用的习惯是：净利润与经营现金是否同向，投资与筹资哪一段在说话。仅供学习。",
    "zh-TW":
      "站內現金流頁常是薄表或空表，也沒有一鍵 FCF。先看淨利與經營現金是否同向，投資與籌資哪一段在說話。僅供學習。",
    en: "Our cash-flow tab is often thin or empty, and there is no one-click FCF. The useful habit: do NI and OCF move together, and which of investing/financing is loud? Learning only.",
  },
  paragraphs: {
    en: [
      "People ask me for “the FCF number” the way they ask for a weather app. Definitions disagree before the arithmetic starts—maintenance versus growth capex, leases, working capital. If operating cash already diverges from net income, polishing an FCF formula is theatre.",
    ],
    "zh-CN": [
      "有人找我要「那个自由现金流数字」，口气像在要天气预报。口径还没对齐：维持开支还是扩张开支、租赁怎么算、营运资本进不进。若经营现金已经和净利润拧着，打磨 FCF 公式只是表演。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Open AAPL → Financials → Cash flow (classroom only). On a well-covered US name you may see multi-period rows; on many others the nav item is still clickable and the body is empty—same pattern as the balance tab. That is vendor coverage, not a hidden “pro” switch. When empty, pull the cash-flow statement from the filing and keep reading this essay for the questions, not for our cells.",
      },
      { type: "h2", text: "Classification games you will not see in a summary" },
      {
        type: "p",
        text: "US GAAP and IFRS do not always park interest and dividends in the same bucket. Factoring or note discounting can make operating cash look healthier for a stretch. Indirect-method presentations bury the story in “changes in working capital”—you need the balance sheet to see whether receivables and inventory absorbed the profit. Direct method (rare in retail apps) is harder to skim past; we do not promise it.",
      },
      {
        type: "ul",
        items: [
          "One quarter of NI up / OCF soft: often seasonality or a working-capital swing—write it down, do not trade it.",
          "Three periods of the same gap: open the red-flag essay and the notes; pattern beats a single ratio.",
          "OCF strong while NI weak: can be inventory drawdown or collections catching up—also not an automatic buy.",
        ],
      },
      { type: "h2", text: "Investing and financing without morality plays" },
      {
        type: "p",
        text: "Negative investing cash during a capacity build is normal. Ask whether MD&A can name the future revenue, or whether the spend mostly becomes goodwill. Positive financing cash can be growth capital or life support—context decides. Dividends and buybacks that outrun durable operating cash force a plain question: returning capital, or dressing EPS with leverage?",
      },
      {
        type: "table",
        head: ["You notice", "Ask next", "Sibling read"],
        rows: [
          ["EPS beat, OCF soft", "Did receivables/inventory absorb it?", "Income + balance"],
          ["OCF soft, ST debt rising", "Is financing plugging operations?", "Balance + red flags"],
          ["Huge capex, thin OCF", "Expansion or hole-filling?", "Red flags"],
        ],
      },
      { type: "h2", text: "What we show vs what people wish we showed" },
      {
        type: "p",
        text: "The financials area leans on calendar and estimate gaps; full cash-flow trees are uneven. There is no branded “FCF” button by design—definitions would imply precision we do not have. Peer compare can ask who burns cash to expand versus who converts profit; it will not crown an FCF winner. If the UI shows degraded data, freeze the narrative until the feed recovers or you read the filing.",
      },
      {
        type: "p",
        text: "Workflow that survives a gap: watchlist note “watch OCF”; alert on your invalidation, not a wish price; size by loss budget; in Review, log the time you trusted the P&L and skipped the bank tape. Ask AI to draft “NI vs OCF last few periods”—then verify periods and classifications yourself. Finding a gap still does not mean short tomorrow; prices can ignore you for a long time.",
      },
      {
        type: "note",
        text: "Cash-flow classification still leaves room for games. Educational; not investment advice.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "打开 AAPL → 财务 → 现金流量表（课堂用）。覆盖好的美股可能有多期行；很多标的左侧仍能点、正文却是空的——和资产负债表同一类覆盖问题。空表时去官方现金流量表，这篇只给你该问的问题，不保证站内有格子可抄。",
      },
      { type: "h2", text: "摘要里看不见的分类游戏" },
      {
        type: "p",
        text: "美股 GAAP 与 IFRS 对利息、股利进出哪一段，并不总一致。保理、票据贴现可以把经营现金打扮一阵。间接法把故事埋在「营运资本变动」里——要回到资产负债看应收、存货有没有吸走利润。直接法更难一目十行滑过，但零售终端很少给，我们也不承诺。",
      },
      {
        type: "ul",
        items: [
          "一季净利润升、经营现金软：常是季节性或营运资本摆动——记下来，别据此交易。",
          "连续三期同一背离：去红旗文和附注；模式比单个比值重要。",
          "经营现金强、净利润弱：可能是去库存或回款赶上——也不是自动买入。",
        ],
      },
      { type: "h2", text: "投资与筹资：先别上道德审判" },
      {
        type: "p",
        text: "扩产期投资现金为负很正常。问 MD&A 说不说得出未来收入，还是开支主要变成商誉。筹资现金为正，可能是成长资本，也可能是续命——看上下文。分红与回购若长期超过可维持的经营现金，问一句就够：是在还股东，还是用杠杆化妆 EPS？",
      },
      {
        type: "table",
        head: ["你注意到", "下一步问", "姊妹文"],
        rows: [
          ["EPS 超预期、经营现金软", "应收/存货是否吸走了？", "利润表 + 资产负债"],
          ["经营现金软、短债升", "筹资是否在堵窟窿？", "资产负债 + 红旗"],
          ["资本开支很大、经营现金薄", "扩张还是补洞？", "红旗"],
        ],
      },
      { type: "h2", text: "我们有什么，和大家希望有什么" },
      {
        type: "p",
        text: "财报区更偏日历与预期差；完整现金流量表树覆盖不均。没有品牌化的「FCF」按钮——那会假装精确。同业对比可以问谁在烧现金扩张、谁在把利润变成钱，不会给 FCF 颁奖。若界面提示数据降级，先冻结叙事，等源恢复或你自己读披露。",
      },
      {
        type: "p",
        text: "扛得住背离的流程：自选备注「盯经营现金」；提醒绑失效位而非许愿价；仓位按亏得起；复盘记下那次只信利润表、跳过流水。问 AI「近几季净利 vs 经营现金」——然后你核对期间与分类。发现背离仍不等于明天开空；价格可以长期不理会你。",
      },
      {
        type: "note",
        text: "现金流量表仍有分类空间。仅供学习，不构成投资建议。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Why is there no FCF on the page?",
        a: "Definitions disagree across vendors. We refuse a false-precision button; ask the question in the filing instead.",
      },
      {
        q: "Empty cash-flow tab—broken?",
        a: "Usually coverage. Same honesty as the balance sheet: filing first when cells are blank.",
      },
    ],
    "zh-CN": [
      {
        q: "为什么页面没有自由现金流？",
        a: "各家口径不一致。我们拒绝假精确按钮；去披露里问这个问题。",
      },
      {
        q: "现金流 Tab 是空的，坏了？",
        a: "多数是覆盖。和资产负债表一样：格子空就先官方披露。",
      },
    ],
  },
  links: {
    en: [
      { label: "Three statements", href: "/learn/financials-three-statements" },
      { label: "Income statement", href: "/learn/financials-income-statement" },
      { label: "Balance sheet", href: "/learn/financials-balance-sheet" },
      { label: "Cash-flow red flags", href: "/learn/cash-flow-red-flags" },
      { label: "Review", href: "/review" },
      { label: "Open AAPL", href: "/symbol/stock/AAPL" },
    ],
    "zh-CN": [
      { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
      { label: "利润表", href: "/learn/financials-income-statement" },
      { label: "资产负债表", href: "/learn/financials-balance-sheet" },
      { label: "现金流红旗", href: "/learn/cash-flow-red-flags" },
      { label: "复盘", href: "/review" },
      { label: "打开 AAPL", href: "/symbol/stock/AAPL" },
    ],
  },
  sourceNote: {
    en: "Cash-flow rows depend on vendor coverage; no site-wide FCF metric. Educational only.",
    "zh-CN": "现金流行依赖数据源覆盖；站内无统一 FCF 指标。仅供学习。",
  },
};

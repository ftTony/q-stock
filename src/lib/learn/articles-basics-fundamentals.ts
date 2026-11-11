import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";
const UPDATED = "2026-11-11";

/**
 * Fundamentals checklist — failed example first; breaks the five-line template sermon.
 */
export const LEARN_ARTICLE_FUNDAMENTALS: LearnArticle = {
  slug: "fundamentals-checklist",
  category: "basics",
  ctaHref: "/analysis",
  author: AUTHOR,
  publishedAt: PUBLISHED,
  updatedAt: UPDATED,
  title: {
    "zh-CN": "基本面：我写过一张废清单，后来只留五句话",
    "zh-TW": "基本面：我寫過一張廢清單，後來只留五句話",
    en: "Fundamentals: I wrote a useless checklist—then kept five lines",
  },
  summary: {
    "zh-CN":
      "填满 PE/PB 表格不算看过基本面。先能写出业务一句话、近况证据、同业尺子、两个不懂、亏得起的比例；钱力股财务 Tab 是灯号，空表与延迟是常态。仅供学习。",
    "zh-TW":
      "填滿 PE／PB 不算看過。先寫業務一句、近況證據、同業尺子、兩個不懂、虧得起比例；財務 Tab 是燈號，空表與延遲是常態。僅供學習。",
    en: "A full PE/PB sheet is not a read. Write a business one-liner, trajectory evidence, peer yardstick, two unknowns, loss budget—our financials tab is lamps; empty rows and lag are normal. Learning only.",
  },
  paragraphs: {
    en: [
      "My first “fundamentals sheet” had eighteen ratios and zero sentences about the customer. I felt professional. I still could not say who paid, or what would make me wrong.",
    ],
    "zh-CN": [
      "我第一张「基本面表」有十八个比率，关于客户的句子一个没有。当时觉得自己很专业。却说不出谁在付钱，也说不出怎样算自己错了。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "That sheet failed in a boring way: before earnings I already knew the PE band; after the print I still sized on the surprise %. The ratios never entered the decision—they decorated the screenshot I sent to a friend. The fix was not more columns. It was five lines I had to write by hand before Analysis or the chart got a vote.",
      },
      { type: "h2", text: "The five lines (handwritten, ugly is fine)" },
      {
        type: "ul",
        items: [
          "Business one-liner: who pays, for what, how often—no buzzwords.",
          "Trajectory: better or worse over recent periods, with one evidence from filings or our income/cash views—not a vibes word.",
          "Peer yardstick: two to four same-lane names on one ruler (GAAP or adjusted—pick one).",
          "Two unknowns: honest gaps. “I’ll learn after I buy” fails this line.",
          "Loss budget: % you can lose if wrong, plus an invalidation you can say aloud.",
        ],
      },
      {
        type: "p",
        text: "If line 2 needs the three statements, open them as supporting exhibits—not as a second spreadsheet to fill. Income surprise without cash check is how my old sheet lied to me.",
      },
      { type: "h2", text: "Click path that matches this product" },
      {
        type: "p",
        text: "Symbol → Financials: Metrics (PE/PB/ROE/margins when present) → Income (surprise + compressed margins) → Balance / Cash flow (may be empty—that is coverage) → Calendar. Company profile is a one-liner aid, not a thesis. Then Analysis with two to four peers. Starting at PE and reverse-engineering a story is the trap the old sheet encouraged.",
      },
      {
        type: "note",
        text: "HK rows run thinner; crypto has no traditional statements. Degraded banners mean freeze the story. Filings beat free cells.",
      },
      { type: "h2", text: "Earnings week without the sugar" },
      {
        type: "p",
        text: "Beat / raise travels faster than footnotes. Before you rewrite the five lines, ask: ops or other income? guidance walked back? OCF still rhymes with NI? Social “bullish” is not line 2 evidence. If you only change size because the surprise strip went green, you are back in the eighteen-ratio theatre.",
      },
      { type: "h2", text: "Peer compare will not save a bad ruler" },
      {
        type: "p",
        text: "Analysis will place names side by side even when one reports non-GAAP and another does not. Close multiples can still mean different animals. Cyclicals, loss-making growth, and banks do not share a PE morality play. Low PE on soft book equity is not a gift—see the balance essay.",
      },
      {
        type: "p",
        text: "After the five lines: charts ask structure and location (separate essay)—they do not skip the checklist. FOMO → watchlist + alert with invalidation written, not a wish. Position tools answer “how much can I lose,” never “should I buy.” Simulation and Review practice the process; they do not forecast the next hour.",
      },
      {
        type: "p",
        text: "Drill on a name you already watch—do not hunt a dark horse for homework. Fill five lines. If you cannot, more metrics on our tab will not help. Writing “I don’t know” on line 4 is progress; leaving it blank and sizing anyway is the old sheet.",
      },
      {
        type: "note",
        text: "Educational. A checklist lowers ignorant sizing; it does not guarantee the next quarter. Not investment advice.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "那张表失败得很无聊：财报前我就知道 PE 区间；财报后我仍按超预期 % 加仓。比率从没进过决策——它们只装饰了我发给朋友的截图。补救不是加列，而是进分析页或 K 线之前，必须手写五句。",
      },
      { type: "h2", text: "五句话（手写，难看也行）" },
      {
        type: "ul",
        items: [
          "业务一句话：谁付钱、买什么、多频繁——禁止口号。",
          "近况：近几季更好还是更差，附一条来自披露或站内利润/现金视图的证据——禁止「感觉」。",
          "同业尺子：同赛道 2～4 家，统一口径（GAAP 或调整后，二选一）。",
          "两个不懂：诚实缺口。「买了再学」这一行直接不及格。",
          "亏损预算：做错亏得起的 %，外加一句说得出口的失效条件。",
        ],
      },
      {
        type: "p",
        text: "若第 2 句需要三张表，把它们当附件打开——不是再填第二张表。只看利润表预期差、不看现金，就是旧表骗我的方式。",
      },
      { type: "h2", text: "和本产品对齐的点击路径" },
      {
        type: "p",
        text: "个股 → 财务：指标（有则 PE/PB/ROE/利润率）→ 利润表（预期差 + 压缩利润率）→ 资产负债 / 现金流（可能空——是覆盖）→ 日历。公司概况辅助一句话，不是论点。再去分析页塞 2～4 家。从 PE 倒推故事，正是旧表教坏的习惯。",
      },
      {
        type: "note",
        text: "港股更薄；加密货币无传统报表。出现数据降级就先冻结叙事。冲突时以官方披露为准。",
      },
      { type: "h2", text: "财报周：少吃糖" },
      {
        type: "p",
        text: "超预期、上调比附注传得快。改五句话之前先问：主业还是营业外？指引有没有收回？经营现金还跟不跟得上净利？社交媒体「看好」不算第 2 句证据。若只因预期差条变绿就改仓，你又回到十八个比率的剧场了。",
      },
      { type: "h2", text: "同业对比救不了一把坏尺子" },
      {
        type: "p",
        text: "分析页会把标的并排，即使一家报非 GAAP、另一家不报。倍数接近也可能是不同动物。周期股、亏损成长、银行，不共享一套 PE 道德戏。软净资产上的低 PE 不是礼物——见资产负债专文。",
      },
      {
        type: "p",
        text: "五句写完：K 线问结构与位置（另文）——它不代替清单。怕错过 → 自选 + 提醒，写失效位而非许愿价。仓位工具只答「亏得起多少」，不答「该不该买」。模拟与复盘练流程，不预测下一小时。",
      },
      {
        type: "p",
        text: "练习用你已经盯着的票——别为了作业找黑马。五句写不出，站内再多指标也救不了。第 4 句写「不知道」是进步；留白却下重仓，就是旧表附身。",
      },
      {
        type: "note",
        text: "仅供学习。清单降低无知下单的概率，不担保下一季。不构成投资建议。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Do I need a full DCF?",
        a: "No. Here fundamentals means fewer story-driven size jumps—not a precise intrinsic-value engine.",
      },
      {
        q: "Where do the three statements fit?",
        a: "Inside line 2 (trajectory). They are exhibits for evidence, not a second ratio sheet.",
      },
    ],
    "zh-CN": [
      {
        q: "一定要做完整 DCF 吗？",
        a: "不必。这里的基本面是减少「听故事下重仓」，不是精确内在价值引擎。",
      },
      {
        q: "三张表放哪？",
        a: "放在第 2 句「近况」里当证据附件，不是第二张比率表。",
      },
    ],
  },
  links: {
    en: [
      { label: "Retail focus list", href: "/learn/retail-company-focus" },
      { label: "Three statements", href: "/learn/financials-three-statements" },
      { label: "Cash-flow red flags", href: "/learn/cash-flow-red-flags" },
      { label: "Peer compare", href: "/learn/peer-compare" },
      { label: "Analysis page", href: "/analysis" },
      { label: "Open AAPL", href: "/symbol/stock/AAPL" },
    ],
    "zh-CN": [
      { label: "散户关注企业清单", href: "/learn/retail-company-focus" },
      { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
      { label: "现金流红旗", href: "/learn/cash-flow-red-flags" },
      { label: "同业对比怎么用", href: "/learn/peer-compare" },
      { label: "分析页", href: "/analysis" },
      { label: "打开 AAPL", href: "/symbol/stock/AAPL" },
    ],
  },
  sourceNote: {
    en: "Educational. Empty financial tabs and feed lag are expected limits; filings win.",
    "zh-CN": "仅供学习。财务空表与源延迟是预期中的边界；以官方披露为准。",
  },
};

import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/**
 * Stock-picking steps that force fundamentals and technicals to work together.
 */
export const LEARN_ARTICLE_PICKING: LearnArticle = {
  slug: "stock-picking-steps",
  category: "basics",
  ctaHref: "/markets",
  author: AUTHOR,
  publishedAt: PUBLISHED,
  updatedAt: PUBLISHED,
  title: {
    en: "Picking steps: fundamentals first, then location on the chart",
    "zh-CN": "选股步骤：基本面过关，技术面才谈位置",
  },
  summary: {
    en: "Not two rival methods. First: worth studying? Then: worth acting now? Fail either gate and size stays zero.",
    "zh-CN":
      "选股不是两套互相打架的方法。先筛「值不值得研究」，再问「现在值不值得动手」；答不上任一句，仓位就该是零。",
  },
  paragraphs: {
    en: [
      "Picking fails less from missing an indicator than from reversed order: hooked by one green candle, story patched in afterwards. Each language takes turns excusing the impulse; the account settles the bill.",
    ],
    "zh-CN": [
      "选股败得最惨的姿势，不是缺指标，是顺序颠倒：先被一根大阳线勾进去，再补故事圆场。图好的时候说「趋势来了」，财报差的时候说「技术只是噪音」——两套语言轮流给冲动开脱，账户替你结账。",
    ],
  },
  sections: {
    en: [
      {
        type: "p",
        text: "Q-Stock pins the fix onto one symbol page: chart and quote for location; company, financials, and peer compare for the business; the plan tab for rules. Same desk, same name—cherry-picking the flattering half gets hard.",
      },
      { type: "h2", text: "Gate one: five fundamental questions" },
      {
        type: "table",
        head: ["Question", "What a pass looks like", "Where to check"],
        rows: [
          ["How does it earn?", "One sentence on the main business and customers", "Company tab"],
          ["Better or worse lately?", "Revenue and profit moving the same direction", "Financials tab"],
          ["Same yardstick as peers?", "2–4 names on one set of multiples", "Peer compare"],
          ["What do I still not get?", "Two concrete gaps, not 'I get it all'", "Filings, not summaries"],
          ["What can I afford to lose?", "A number, not a feeling", "/tools/position"],
        ],
        caption:
          "Fewer than three clean answers means the stock belongs on the watchlist under 'later', not in an order queue.",
      },
      {
        type: "p",
        text: "Free summaries lag and estimate. When they disagree with official filings, filings win. Fundamentals are slow, price is fast—the mismatch is normal, not evidence you lack talent.",
      },
      { type: "h2", text: "Gate two: location and invalidation" },
      {
        type: "p",
        text: "Once fundamentals pass, technicals get one job: price the now. Structure first—trend or range; then location—high, mid, low. Averages and indicators testify; they do not judge. Technicals never prove a company is good; they only prove you are not buying a good story at a level with no named exit.",
      },
      {
        type: "p",
        text: "A hypothetical run-through: a name clears all five questions. The daily shows a range—floor 172–178, ceiling 198–203—price at 187. Mid-range means no edge either way, so no trade. Alerts at 179 and 203, invalidation 171.8, entry band 174–177. Account 100,000, risk 1.5% = 1,500, stop distance about 2.1%, size cap roughly 70,000 backed out in the position calculator. Every number here is hypothetical; the order of operations is not—gate first, then location, then size.",
      },
      { type: "h2", text: "Combine by veto, not by averaging" },
      {
        type: "table",
        head: ["Fundamentals", "Location", "Action", "The usual excuse"],
        rows: [
          ["Pass", "Calm, exit clear", "Discuss size, rehearse on paper", "—"],
          ["Pass", "Hot top, exit unclear", "Wait, or a tiny rule-bound probe", "'Good companies are for holding'"],
          ["Unclear", "Chart looks great", "Noise, not opportunity", "'Patterns don't lie'"],
          ["Muddy", "Muddy", "Cut it, save the attention", "'Let me watch and buy a little'"],
        ],
        caption:
          "Averaging is arithmetic done by emotion. One failed gate vetoes the trade—no splitting the difference.",
      },
      { type: "h2", text: "Common traps" },
      {
        type: "ul",
        items: [
          "Both sides 'have a point', so compromise into a small buy: vetoes do not average.",
          "Alerts on wish prices: round numbers are the crowd's focus, not your structure.",
          "Using paper to validate the pick: paper validates execution, never the logic.",
        ],
      },
      {
        type: "p",
        text: "The tooling is one chain: alerts hold the invalidation; uncertain names rehearse on paper first; review asks three things—was the structure clear, was the risk budget written, did I actually stop when invalidation hit. The AI chart read can force you to say the kill condition out loud, but when it fights your eyes and the filings, stopping beats arguing.",
      },
      { type: "h2", text: "What you are actually picking" },
      {
        type: "p",
        text: "Not next week's hottest ticker—you are picking what uncertainty you will tolerate for a long time. Passing fundamentals means one grounded reason not to panic when bad news lands. Passing technicals means a pre-written exit sentence instead of improvising one. Writing the invalidation into alerts and review is signing a contract with your future self; unsigned, every picking step is just an essay.",
      },
      {
        type: "p",
        text: "Drill: take a name you already watch—no fresh dark horses for practice. Run the five questions; fail, stop. Pass, then draw structure, location, invalidation into alerts, and force-pick one action from the four combinations. No 'watch it but buy a little anyway'. A week later in review: how many times did emotion rewrite the call? That count measures whether the steps are in your bones—better than P&L does.",
      },
      {
        type: "note",
        text: "Educational only; all example figures are hypothetical. Not investment advice. 'Not picking yet' is a legitimate picking outcome.",
      },
    ],
    "zh-CN": [
      {
        type: "p",
        text: "钱力股把解法钉在个股页里：报价和 K 线看位置，公司、财报、同业对比看生意，计划 Tab 写规则。它们都挂在同一只标的名下——你想只挑顺耳的那半边，都难。",
      },
      { type: "h2", text: "第一道门禁：基本面五问" },
      {
        type: "table",
        head: ["五问", "合格答案长什么样", "去哪核对"],
        rows: [
          ["靠什么赚钱", "一句话说清主业和客户", "个股页「公司」"],
          ["近况变好还是变差", "营收利润同向改善或恶化，有方向", "财报 Tab"],
          ["同业拿什么比", "2–4 家用同一把尺子比倍数和利润率", "同业对比"],
          ["哪两点我仍不懂", "写得出具体缺口，不是「都懂」", "摘要线索 + 官方披露"],
          ["亏得起多少", "一个数字，不是一种感觉", "/tools/position"],
        ],
        caption: "五问答不出三条以上，这只票只配待在自选的「以后再看」里。",
      },
      {
        type: "p",
        text: "免费摘要有延迟和估算，对不上时以官方披露为准。基本面慢，价格快，两者错位是常态，不是你悟性不够的证据。",
      },
      { type: "h2", text: "第二道门禁：位置与失效" },
      {
        type: "p",
        text: "五问过关，才轮到技术面，而且它只干一件事：给「现在」定位置和认错线。日线上先问结构——趋势还是箱体；再问位置——高、中、低。均线和指标只做旁证，不下判决。技术面不负责证明「公司好」，只负责证明你没有在讲不清失效的位置上，用公司的名义买单。",
      },
      {
        type: "p",
        text: "假设一只票五问全过（数字全是假设）：日线箱体，下沿 172–178，上沿 198–203，现价 187。中间不买——上下都没优势。挂提醒 179 和 203，失效价 171.8，买入区间 174–177。账户 10 万、单笔风险 1.5% 即 1500，止损距离约 2.1%，仓位上限约 7 万，用仓位计算器反推，别心算。数字可以换，顺序不能换：先门禁，后位置，最后仓位。",
      },
      { type: "h2", text: "合成：一票否决，不折中" },
      {
        type: "table",
        head: ["基本面", "位置", "动作", "常见的借口"],
        rows: [
          ["过关", "冷静，失效清楚", "才谈仓位，先走模拟", "——"],
          ["过关", "高位加速，讲不清失效", "等，或极小仓按规则试", "「好公司拿住就行」"],
          ["说不清", "图很好看", "当噪音，不当机会", "「形态不会骗人」"],
          ["都糊", "都糊", "划掉，省下注意力", "「再看看，先买一点」"],
        ],
        caption: "折中是情绪的算术。任一门禁失败，仓位为零。",
      },
      { type: "h2", text: "常见踩坑" },
      {
        type: "ul",
        items: [
          "把「两边都有一点道理」折中成买一点：一票否决不是加权平均。",
          "提醒绑许愿价：整数关口是大众焦点，不是你的结构位。",
          "用模拟盘验证选股逻辑：模拟只能验证执行，验证不了逻辑。",
        ],
      },
      {
        type: "p",
        text: "落到工具上是一条链：提醒页绑失效位；拿不准的先在模拟盘走一遍流程；复盘页问三句——结构说清了吗，风险预算写了吗，失效触发后真的停手了吗。AI 读图可以逼你把推翻条件说出口，但它和你的肉眼、财报线索打架时，停手比抬杠重要。",
      },
      { type: "h2", text: "你在选的到底是什么" },
      {
        type: "p",
        text: "选股不是选下周最可能涨的代码，是选你愿意长期忍受不确定性的对象。基本面过关，意味着坏消息来时你有一点「凭什么不慌」的依据；技术面过关，意味着你有事先写好的离场句，而不是现场编。把失效条件写进提醒和复盘，等于和未来的自己签合同——合同不签，任何选股步骤都只是作文。",
      },
      {
        type: "p",
        text: "练习：拿一只你已经在盯的票（别为练手专门找黑马），五问过基本面，过不了就停。过了再画结构、位置、失效价，写进提醒备注，然后从四种组合里强制选一个动作，不许「再看看但也先买一点」。一周后复盘：当时选的动作有没有被情绪改写？改写次数比盈亏更能说明这套步骤有没有进骨头。",
      },
      {
        type: "note",
        text: "本篇为教学示例，示例价格与比例均为假设，不构成投资建议。「暂时不选」也是选股结果的一部分。",
      },
    ],
  },
  faq: {
    en: [
      {
        q: "Three of the five questions failed, but the chart looks great. Can I buy?",
        a: "You can buy risk; you cannot buy logic. By this process: watchlist, wait for evidence, size zero. A pretty chart has never been a valid reason to skip a gate.",
      },
      {
        q: "Where does the fundamental data come from, and is it reliable?",
        a: "Summaries come from free feeds with delays and estimates, for reference only. Whenever numbers disagree with company filings or exchange disclosures, the official documents win.",
      },
      {
        q: "How is a small probe different from 'buying a little as a compromise'?",
        a: "Rules. A probe has a pre-written invalidation and a hard cap on total size—wrong means out. A compromise buy usually has neither, gets averaged down, and ends bigger than the plan ever allowed.",
      },
      {
        q: "Which metrics matter most in peer compare?",
        a: "Valuation (PE/PB), margins, and growth on one yardstick—then ask whether the gap is business or accounting. The how-to lives in the peer-compare article.",
      },
    ],
    "zh-CN": [
      {
        q: "五问有三问答不上，但图形特别好，能买吗？",
        a: "能买的是你愿意承担的风险，不是逻辑。按这套流程：进自选等证据，仓位为零——图形好从来不是跳过门禁的理由。",
      },
      {
        q: "基本面数据哪里来的，准吗？",
        a: "站内摘要来自免费数据源，有延迟和估算，仅供参考。数字对不上时，一律以公司公告和交易所披露为准。",
      },
      {
        q: "小仓位试错和「折中买一点」有什么区别？",
        a: "区别在规则。小仓试错有事先写好的失效价和总量上限，错了就认；折中买一点通常两个都没有，越跌越补，最后仓位比原计划还大。",
      },
      {
        q: "同业对比要看哪几个指标？",
        a: "先看同一把尺子下的估值（PE/PB）、利润率和增速，再问差异来自业务还是口径。具体做法见同业对比那篇。",
      },
    ],
  },
  links: {
    en: [
      { label: "The fundamentals checklist", href: "/learn/fundamentals-checklist" },
      { label: "Three statements, one story", href: "/learn/financials-three-statements" },
      { label: "Support and resistance zones", href: "/learn/stocks-support-resistance" },
      { label: "The workbench loop", href: "/learn/stocks-workbench-loop" },
      { label: "Position sizing calculator", href: "/tools/position" },
      { label: "Markets (US/HK/A/crypto)", href: "/markets" },
    ],
    "zh-CN": [
      { label: "基本面清单怎么看", href: "/learn/fundamentals-checklist" },
      { label: "三张报表怎么串", href: "/learn/financials-three-statements" },
      { label: "支撑与阻力带子", href: "/learn/stocks-support-resistance" },
      { label: "一条闭环：看盘→分析→计划→复盘", href: "/learn/stocks-workbench-loop" },
      { label: "仓位计算器", href: "/tools/position" },
      { label: "多市场行情（美股/港股/A股/加密币）", href: "/markets" },
    ],
  },
  sourceNote: {
    en: "Educational. All example prices and ratios are hypothetical. Not investment advice.",
    "zh-CN": "仅供学习。示例价格与比例均为假设。不构成投资建议。",
  },
};

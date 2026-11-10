import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Product spine: 看盘 → 分析 → 计划 → 复盘. Exemplar deep version. */
export const LEARN_ARTICLES_SEO_STOCKS_WORKBENCH: LearnArticle[] = [
  {
    slug: "stocks-workbench-loop",
    category: "basics",
    ctaHref: "/markets",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "One symbol, one loop: watch → analyze → plan → review",
      "zh-CN": "一只标的一条闭环：看盘 → 分析 → 计划 → 复盘",
    },
    summary: {
      en: "A workbench is not a second brokerage terminal. It is a desk where the same name keeps chart, peers, plan and review in one place—so excuses have nowhere to hide.",
      "zh-CN":
        "工作台不是第二套券商终端。它把图表、同业、计划和复盘钉在同一只标的上，让借口无处可逃。这篇用一个带数字的例子把四步走完一遍。",
    },
    paragraphs: {
      en: [
        "Most retail losses are not missing a secret indicator. They are unfinished sentences: bought without invalidation, held without a review, alerted on a wish price.",
        "Walk the loop once on purpose. Speed comes later.",
      ],
      "zh-CN": [
        "散户亏钱，多半不是少一个神秘指标，而是句子没写完：买了却没有失效条件，拿着却没有复盘，提醒绑的是许愿价。",
        "先把闭环故意走通一遍。速度以后再说。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "In Q-Stock, open a US/HK equity from Markets or search. The symbol page is the desk: quote and chart for watching, company/financials/peers for analysis, plan panel for rules, paper + review for practice. Options live on the same symbol when you need them—still after the equity thesis is clear.",
        },
        {
          type: "p",
          text: "The point of keeping everything on one page is not aesthetics. When chart, thesis and stop live in three apps, your brain quietly drops the least convenient one. Usually the stop.",
        },
        { type: "h2", text: "Four stations, one order" },
        {
          type: "table",
          head: ["Station", "Question it must answer", "Where in the product", "Time budget"],
          rows: [
            ["Watch", "Trend or range? Where is price inside the structure?", "Chart + quote bar", "3 min"],
            ["Analyze", "Is the business still worth owning at this price?", "Company / financials / peer compare", "5 min"],
            ["Plan", "Entry band, size, invalidation, alerts", "Plan tab, alerts, /tools/position", "4 min"],
            ["Review", "Did I follow the plan or rewrite it mid-trade?", "Paper fills + review notes", "3 min"],
          ],
          caption:
            "The budgets matter more than they look. Analysis that eats the whole evening usually means there was no plan to protect.",
        },
        {
          type: "ul",
          items: [
            "Watch without a plan produces screenshots, not decisions.",
            "Analyze without a plan produces opinions that never meet a stop.",
            "Plan without review produces the same mistake with better vocabulary.",
          ],
        },
        { type: "h2", text: "One full pass, with numbers" },
        {
          type: "p",
          text: "Say you have been watching a software name at 186. The daily shows a range: floor roughly 172–178, ceiling 198–203. Price sits mid-range, so chasing here buys the middle of the box—no edge either way. The plan waits for the edges.",
        },
        {
          type: "p",
          text: "You set one alert at 179 (near the floor) and one at 203 (near the ceiling). Account 100,000, single-trade risk budget 1.5% = 1,500. Your invalidation is 171.8, just under the floor. Entry band 174–177, mid 175.5, stop distance about 2.1% of entry. Position size = 1,500 ÷ 0.021 ≈ 71,000? No—that is the raw number the formula gives; it means the trade only works if you actually cut at 171.8. Run it through /tools/position instead of doing arithmetic at midnight.",
        },
        {
          type: "table",
          head: ["Plan item", "Value in this example", "Why this number"],
          rows: [
            ["Entry band", "174–177", "Upper half of the support zone, not the exact low"],
            ["Invalidation", "171.8", "A close below the zone floor kills the range thesis"],
            ["Risk per share", "≈ 4.2 (from 176)", "Entry mid minus stop"],
            ["Max loss", "1,500 (1.5% of 100k)", "Fixed before entry, not after"],
            ["Alerts", "179 / 203", "Edges of the range, not wish prices"],
            ["Review checkpoint", "Next weekend", "Did price respect the structure? Did I?"],
          ],
          caption:
            "None of these numbers is precious. All of them existing before the fill is what matters.",
        },
        {
          type: "p",
          text: "Two weeks later price breaks the floor, you cut at 171.8 and lose about 1,400 with fees. That is a successful loop. The thesis was wrong; the process was not. The review note should read one line: range failed, exit executed, no size added into the break. It should not read three paragraphs of market commentary.",
        },
        { type: "h2", text: "How to write a review that is actually useful" },
        {
          type: "p",
          text: "Keep it to three lines: what the plan said, what I did, what I will change. If line two differs from line one, that gap is your real P&L problem—bigger than any fee or spread. Q-Stock's review page keeps paper fills next to your notes for exactly this comparison.",
        },
        {
          type: "note",
          text: "AI chart read is optional scaffolding: ask for structure, levels, invalidation—then verify on the chart and filings. It is not an order ticket, and it never replaces line one of your review.",
        },
        { type: "h2", text: "Three ways this loop breaks" },
        {
          type: "ul",
          items: [
            "Skipping Analyze to catch the candle: the story gets written after the fill, and it always flatters the buyer.",
            "Alerts set at wish prices: 203 means 'get ready to plan the breakout', not 'the breakout already succeeded'.",
            "Renegotiating the stop intraday: one renegotiation is a slip. A pattern of them means the risk budget was never real.",
          ],
        },
        { type: "h2", text: "A 15-minute drill" },
        {
          type: "p",
          text: "Pick one name already on your mind. Mark structure on the daily. Run three peer multiples. Write one invalidation price into an alert and into the plan. Do not place size yet. Tomorrow, check whether you tried to renegotiate the line. That renegotiation count matters more than P&L for the first month.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "在钱力股：从行情或搜索打开美股/港股。个股页就是桌子：报价与 K 线负责看盘，公司/财报/同业负责分析，计划面板写规则，模拟与复盘练执行。需要期权时仍在同一标的下打开——但应在股票论点清楚之后。",
        },
        {
          type: "p",
          text: "把所有东西钉在一页上，不是为了好看。图表、论点、止损散在三个 App 里，大脑会悄悄丢掉最麻烦的那一个。通常丢掉的是止损。",
        },
        { type: "h2", text: "四个工位，一个顺序" },
        {
          type: "table",
          head: ["工位", "要回答的问题", "产品里去哪", "时间预算"],
          rows: [
            ["看盘", "趋势还是箱体？价在结构哪个位置？", "K 线 + 报价条", "3 分钟"],
            ["分析", "这个价格下，这门生意还值得持有吗？", "公司 / 财报 / 同业对比", "5 分钟"],
            ["计划", "区间、仓位、失效、提醒", "计划 Tab、提醒、/tools/position", "4 分钟"],
            ["复盘", "是按计划走，还是盘中改了剧本？", "模拟成交 + 复盘笔记", "3 分钟"],
          ],
          caption: "时间预算比看上去重要。分析吃掉一整个晚上，通常说明根本没有计划需要保护。",
        },
        {
          type: "ul",
          items: [
            "只看盘不写计划，得到的是截图，不是决定。",
            "只分析不写计划，得到的是从不止损的观点。",
            "有计划不复盘，得到的是换了词汇的同一错误。",
          ],
        },
        { type: "h2", text: "带数字走一遍闭环" },
        {
          type: "p",
          text: "假设你盯上一只 186 的软件股。日线是一个箱体：下沿大约 172–178，上沿 198–203。价格现在停在箱体中间，这时候追进去等于买在盒子正中央——上下都没有优势。计划应该等边缘。",
        },
        {
          type: "p",
          text: "你挂两条提醒：179（贴着下沿）和 203（贴着上沿）。账户 10 万，单笔风险预算 1.5%，也就是 1500。失效价定 171.8，压在箱体下沿下方一点。买入区间 174–177，中值 175.5，距止损约 2.1%。仓位 = 1500 ÷ 0.021 ≈ 71000？对，公式算出来就是这么大——它的意思是：这笔交易只有在你真的会在 171.8 割掉时才成立。别在深夜口算，丢进钱力股的仓位计算器跑一遍。",
        },
        {
          type: "table",
          head: ["计划项", "本例取值", "为什么是这个数"],
          rows: [
            ["买入区间", "174–177", "支撑带的上半段，不去抄精确低点"],
            ["失效价", "171.8", "收盘跌破带子下沿，箱体论点作废"],
            ["每股风险", "约 4.2（按 176 算）", "买入中值减去失效价"],
            ["最大亏损", "1500（10 万的 1.5%）", "下单前定死，不是亏了以后再定"],
            ["提醒", "179 / 203", "箱体边缘，不是许愿价"],
            ["复查节点", "下周末", "结构还在吗？我守约了吗？"],
          ],
          caption: "这些数字本身都不金贵。金贵的是它们在成交之前就存在。",
        },
        {
          type: "p",
          text: "两周后价格跌破下沿，你在 171.8 割掉，连手续费亏 1400 左右。这是一次成功的闭环——论点错了，流程没错。复盘笔记只该写一行：箱体失效，按线离场，破位时没有加仓摊平。而不是三段行情评论。",
        },
        { type: "h2", text: "复盘怎么写才有用" },
        {
          type: "p",
          text: "三行就够：计划说什么、我做了什么、下次改什么。第二行和第一行不一致的地方，才是你真正的盈亏来源——比手续费和点差都大。钱力股的复盘页把模拟成交和笔记放在一起，就是为了让你没法只写第三行。",
        },
        {
          type: "note",
          text: "AI 读图是可选脚手架：要结构、价位、失效——再回图表与披露核对。它不是下单按钮，也替代不了复盘笔记的第一行。",
        },
        { type: "h2", text: "闭环最容易断在三处" },
        {
          type: "ul",
          items: [
            "跳过分析去抢那根阳线：故事是成交之后编的，而且永远偏向买家。",
            "提醒绑许愿价：203 的意思是「准备给突破做计划」，不是「突破已经成功」。",
            "盘中重新谈判止损：一次是手滑，次次 renegotiation 说明风险预算从来没当真。",
          ],
        },
        { type: "h2", text: "十五分钟练习" },
        {
          type: "p",
          text: "选一只你已经在盯的票。日线上标结构。拉三只同业倍数。把一个失效价写进提醒和计划。先不要上仓位。第二天看你有没有想改那条线。改线次数，头一个月比盈亏更能说明问题。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Do I need every tab every day?",
          a: "No. Keep the order. Skip depth when nothing changed—do not skip invalidation. A quiet range day can be 6 minutes total.",
        },
        {
          q: "The position formula gave me a size bigger than I can afford. Now what?",
          a: "The trade does not fit your risk budget at that stop distance. Either wait for a closer entry or skip it. Never widen the stop to shrink the size.",
        },
        {
          q: "Is paper trading worth it if fills are not real?",
          a: "It is worth exactly one thing: measuring whether you follow your own plan. It teaches nothing about slippage or crowd behavior, and it should not run longer than a few weeks.",
        },
        {
          q: "Should the review be daily?",
          a: "Weekly for positions you hold, same-day for anything you traded on impulse. Impulse trades decay into excuses fast; write them down while the discomfort is fresh.",
        },
      ],
      "zh-CN": [
        {
          q: "每天四个工位都要做一遍吗？",
          a: "不必。顺序要在；没变化时可以少做深度——但失效条件不能省。平静的箱体日，全程 6 分钟够用。",
        },
        {
          q: "仓位公式算出来的数比我能承受的大，怎么办？",
          a: "说明这个止损距离下，这笔交易装不进你的风险预算。要么等更近的买点，要么放弃。永远不要靠放宽止损把仓位压小。",
        },
        {
          q: "模拟盘成交不是真的，练它有意义吗？",
          a: "有意义的部分只有一个：测你是不是遵守自己的计划。它教不会你滑点和真实盘口，也别练超过几周——练久了会把坏习惯练熟。",
        },
        {
          q: "复盘要每天写吗？",
          a: "持仓股每周一次就够；冲动交易当天必须写。冲动的记忆几天就退化成借口，趁着还难受的时候记下来。",
        },
      ],
    },
    links: {
      en: [
        { label: "Picking steps", href: "/learn/stock-picking-steps" },
        { label: "Support and resistance zones", href: "/learn/stocks-support-resistance" },
        { label: "Position sizing calculator", href: "/tools/position" },
        { label: "Watchlist and alerts", href: "/learn/watchlist-alerts" },
        { label: "Paper and review", href: "/learn/paper-review" },
      ],
      "zh-CN": [
        { label: "选股顺序：基本面→位置", href: "/learn/stock-picking-steps" },
        { label: "支撑与阻力带子", href: "/learn/stocks-support-resistance" },
        { label: "仓位计算器", href: "/tools/position" },
        { label: "自选与提醒", href: "/learn/watchlist-alerts" },
        { label: "模拟与复盘", href: "/learn/paper-review" },
      ],
    },
    sourceNote: {
      en: "Educational. The loop is process design, not a return promise. All figures in the example are hypothetical.",
      "zh-CN": "仅供学习。闭环是流程设计，不是收益承诺。示例中的全部数字均为假设。",
    },
  },
];
